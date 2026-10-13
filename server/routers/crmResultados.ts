/**
 * CRM TEAM 24 — Resultados Comerciais (fonte: Odoo)
 *
 * Lê o histórico real de mudanças de fase do Odoo e devolve os acontecimentos
 * em bruto. É o cliente que os reagrega conforme o filtro de datas escolhido,
 * para um período novo não obrigar a nova ida ao Odoo.
 *
 * ATENÇÃO: as fases são cruzadas pelo ID interno e nunca pelo nome. O Odoo
 * guarda no histórico o nome que a fase tinha na altura, e a fase hoje chamada
 * "Won" já se chamou "Ganho" — cruzar por nome perde 160 contratos.
 */
import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as crypto from "crypto";

const CRM_COOKIE = "crm_session";
const CRM_SECRET = process.env.JWT_SECRET || "crm-secret-key";

function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const [b64, sig] = token.split(".");
    const expected = crypto.createHmac("sha256", CRM_SECRET).update(b64).digest("hex");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId, role: payload.role };
  } catch { return null; }
}

function requireCrmAuth(ctx: any) {
  const cookieHeader = ctx.req?.headers?.cookie as string | undefined;
  if (!cookieHeader) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão CRM inválida." });
  const match = cookieHeader.split(";").map((c: string) => c.trim()).find((c: string) => c.startsWith(CRM_COOKIE + "="));
  const token = match ? decodeURIComponent(match.slice(CRM_COOKIE.length + 1)) : undefined;
  if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão CRM inválida." });
  const session = verifyToken(token);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão CRM expirada." });
  return session;
}

// ─── Fases do pipeline, por ID ────────────────────────────────────────────────
const FASE = {
  leads: 1,
  tratamento: 2,
  reuniao: 3,
  ganho: 4,
  proposta: 5,
  adjudicada: 8,
  prepProposta: 18,
};
const ANTES_DA_VENDA = [FASE.leads, FASE.tratamento, FASE.reuniao, FASE.prepProposta, FASE.proposta, FASE.adjudicada];
const RENOVACAO = [6, 11, 12, 10];
const UPSELL = [13, 14, 15, 16];

// Dias que são operações de sistema e não atividade comercial
const IMPORTACAO_INICIAL = "2025-10-13";
const ARRUMACAO_EM_MASSA = "2026-04-20";

// ─── Ligação ao Odoo (JSON-RPC) ───────────────────────────────────────────────
const ODOO_URL = process.env.ODOO_URL;
const ODOO_DB = process.env.ODOO_DB;
const ODOO_USER = process.env.ODOO_USER;
const ODOO_API_KEY = process.env.ODOO_API_KEY;

let uidCache: number | null = null;

async function rpc(service: string, method: string, args: any[]): Promise<any> {
  if (!ODOO_URL || !ODOO_DB || !ODOO_USER || !ODOO_API_KEY) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Faltam as credenciais do Odoo no servidor (ODOO_URL, ODOO_DB, ODOO_USER, ODOO_API_KEY).",
    });
  }
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service, method, args }, id: Date.now() }),
  });
  if (!res.ok) throw new TRPCError({ code: "BAD_GATEWAY", message: `Odoo respondeu HTTP ${res.status}.` });
  const json: any = await res.json();
  if (json.error) {
    const d = json.error.data || {};
    throw new TRPCError({ code: "BAD_GATEWAY", message: `Odoo: ${d.message || d.name || "erro desconhecido"}` });
  }
  return json.result;
}

async function uid(): Promise<number> {
  if (uidCache) return uidCache;
  const r = await rpc("common", "authenticate", [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]);
  if (!r) throw new TRPCError({ code: "BAD_GATEWAY", message: "O Odoo recusou as credenciais." });
  uidCache = r;
  return r;
}

async function procurar(model: string, domain: any[], fields: string[], kwargs: any = {}) {
  return rpc("object", "execute_kw", [ODOO_DB, await uid(), ODOO_API_KEY, model, "search_read", [domain, fields], kwargs]);
}

// ─── Extração ─────────────────────────────────────────────────────────────────
const dia = (s: string | false) => (s ? String(s).slice(0, 10) : "");

export type Resultados = {
  extraido: string;
  primeiro: string;
  ultimo: string;
  importacao: string;
  arrumacao: string;
  L: { d: string; s: string | null }[];
  G: { d: string; v: number; u: string; p: 0 | 1; n: string; c: string }[];
  E: { d: string; t: "r" | "p" | "n" | "u" }[];
};

async function extrair(): Promise<Resultados> {
  // 1) mudanças de fase (só as do campo stage_id em oportunidades)
  const tracking: any[] = await procurar(
    "mail.tracking.value",
    [["field_id.name", "=", "stage_id"], ["mail_message_id.model", "=", "crm.lead"]],
    ["mail_message_id", "new_value_integer", "create_date"]
  );

  // 2) só as mensagens referidas, para saber a que negócio pertencem
  const idsMsg = Array.from(new Set(tracking.map((t) => t.mail_message_id && t.mail_message_id[0]).filter(Boolean)));
  const msgs: any[] = idsMsg.length
    ? await procurar("mail.message", [["id", "in", idsMsg]], ["res_id", "date"])
    : [];
  const porMsg = new Map(msgs.map((m) => [m.id, m]));

  // 3) oportunidades, incluindo as perdidas (o Odoo esconde-as por omissão)
  const leads: any[] = await procurar(
    "crm.lead",
    [["active", "in", [true, false]]],
    ["name", "create_date", "user_id", "source_id", "expected_revenue"]
  );
  const porLead = new Map(leads.map((l) => [l.id, l]));

  const transicoes = tracking
    .map((t) => {
      const m = porMsg.get(t.mail_message_id && t.mail_message_id[0]);
      if (!m) return null;
      return { lead: m.res_id as number, data: dia(t.create_date || m.date), fase: t.new_value_integer as number };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.data.localeCompare(b.data)) as { lead: number; data: string; fase: number }[];

  const porNegocio = new Map<number, { data: string; fase: number }[]>();
  for (const t of transicoes) {
    const a = porNegocio.get(t.lead) || [];
    a.push({ data: t.data, fase: t.fase });
    porNegocio.set(t.lead, a);
  }

  const L = leads.map((l) => ({ d: dia(l.create_date), s: l.source_id ? l.source_id[1] : null }));

  // Um negócio só se ganha uma vez: conta a PRIMEIRA entrada em "Ganho".
  const G: Resultados["G"] = [];
  const vistos = new Set<number>();
  for (const t of transicoes) {
    if (t.fase !== FASE.ganho || vistos.has(t.lead)) continue;
    vistos.add(t.lead);
    const l = porLead.get(t.lead);
    if (!l) continue;
    const hist = porNegocio.get(t.lead) || [];
    const iG = hist.findIndex((x) => x.fase === FASE.ganho);
    G.push({
      d: t.data,
      v: Math.round(l.expected_revenue || 0),
      u: l.user_id ? l.user_id[1] : "Por preencher",
      p: hist.slice(0, iG).some((x) => ANTES_DA_VENDA.includes(x.fase)) ? 1 : 0,
      n: String(l.name || "").slice(0, 38),
      c: dia(l.create_date),
    });
  }

  const E: Resultados["E"] = [];
  for (const t of transicoes) {
    if (t.fase === FASE.reuniao) E.push({ d: t.data, t: "r" });
    else if (t.fase === FASE.proposta) E.push({ d: t.data, t: "p" });
    else if (RENOVACAO.includes(t.fase)) E.push({ d: t.data, t: "n" });
    else if (UPSELL.includes(t.fase)) E.push({ d: t.data, t: "u" });
  }

  const datas = [...L.map((x) => x.d), ...G.map((x) => x.d), ...E.map((x) => x.d)].filter(Boolean).sort();

  return {
    extraido: new Date().toISOString().slice(0, 10),
    primeiro: datas[0] || "",
    ultimo: datas[datas.length - 1] || "",
    importacao: IMPORTACAO_INICIAL,
    arrumacao: ARRUMACAO_EM_MASSA,
    L, G, E,
  };
}

// ─── Cache em memória ─────────────────────────────────────────────────────────
const VALIDADE_MS = 15 * 60 * 1000;
let cache: { em: number; dados: Resultados } | null = null;
let emCurso: Promise<Resultados> | null = null;

async function obter(forcar: boolean): Promise<Resultados> {
  if (!forcar && cache && Date.now() - cache.em < VALIDADE_MS) return cache.dados;
  // Se já há uma extração a decorrer, espera por essa em vez de abrir outra.
  if (emCurso) return emCurso;
  emCurso = extrair()
    .then((d) => { cache = { em: Date.now(), dados: d }; return d; })
    .finally(() => { emCurso = null; });
  return emCurso;
}

export const crmResultadosRouter = router({
  dados: publicProcedure
    .input(z.object({ forcar: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      requireCrmAuth(ctx);
      const dados = await obter(!!input?.forcar);
      return { ...dados, emCache: cache ? new Date(cache.em).toISOString() : null };
    }),
});
