/**
 * CRM TEAM 24 — Funil de Vendas
 * Métricas por fase com comparação mês anterior e ano anterior
 */
import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "../db";
import { crmLeads, crmReunioes, crmPropostas } from "../../drizzle/schema";
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
  const match = cookieHeader.split(';').map((c: string) => c.trim()).find((c: string) => c.startsWith(CRM_COOKIE + '='));
  const token = match ? decodeURIComponent(match.slice(CRM_COOKIE.length + 1)) : undefined;
  if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão CRM inválida." });
  const session = verifyToken(token);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão CRM expirada." });
  return session;
}

const calcFunilStats = async (db: any, inicio: Date, fim: Date, responsavelId?: number) => {
  const leadsWhere = responsavelId
    ? and(eq(crmLeads.ativo, true), gte(crmLeads.createdAt, inicio), lte(crmLeads.createdAt, fim), eq(crmLeads.responsavelId, responsavelId))
    : and(eq(crmLeads.ativo, true), gte(crmLeads.createdAt, inicio), lte(crmLeads.createdAt, fim));

  const leads = await db.select({
    fase: crmLeads.fase,
    mensalidade: crmLeads.mensalidade,
    mensalidadeComEap: crmLeads.mensalidadeComEap,
    valorEstimado: crmLeads.valorEstimado,
  }).from(crmLeads).where(leadsWhere);

  const reunioesWhere = responsavelId
    ? and(gte(crmReunioes.dataInicio, inicio), lte(crmReunioes.dataInicio, fim), eq(crmReunioes.organizadorId, responsavelId))
    : and(gte(crmReunioes.dataInicio, inicio), lte(crmReunioes.dataInicio, fim));

  const reunioes = await db.select({ id: crmReunioes.id })
    .from(crmReunioes)
    .where(reunioesWhere);

  const propostasWhere = responsavelId
    ? and(gte(crmPropostas.createdAt, inicio), lte(crmPropostas.createdAt, fim), eq(crmPropostas.criadaPorId, responsavelId))
    : and(gte(crmPropostas.createdAt, inicio), lte(crmPropostas.createdAt, fim));

  const propostas = await db.select({ id: crmPropostas.id, valor: crmPropostas.valor })
    .from(crmPropostas)
    .where(propostasWhere);

  const faseCount = (fase: string) => leads.filter((l: any) => l.fase === fase).length;

  const totalLeads = leads.length;
  const emTratamento = faseCount("em_tratamento");
  const reuniaoAgendada = faseCount("reuniao_agendada") + reunioes.length;
  const propostaEnviada = faseCount("proposta_enviada") + propostas.length;
  const clientes = faseCount("won") + faseCount("proposta_adjudicada") + faseCount("contratos_renovados");

  const valorClientes = leads
    .filter((l: any) => ["won", "proposta_adjudicada", "contratos_renovados"].includes(l.fase))
    .reduce((s: number, l: any) => s + (l.mensalidade || l.mensalidadeComEap || l.valorEstimado || 0), 0);

  const valorPropostas = propostas.reduce((s: number, p: any) => s + (p.valor || 0), 0);

  const pct = (num: number, den: number) => den > 0 ? Math.round((num / den) * 100) : 0;

  return {
    totalLeads,
    emTratamento,
    reuniaoAgendada,
    propostaEnviada,
    clientes,
    valorClientes,
    valorPropostas,
    taxaLeadParaTratamento: pct(emTratamento, totalLeads),
    taxaTratamentoParaReuniao: pct(reuniaoAgendada, emTratamento),
    taxaReuniaoParaProposta: pct(propostaEnviada, reuniaoAgendada),
    taxaPropostaParaCliente: pct(clientes, propostaEnviada),
    taxaGeralConversao: pct(clientes, totalLeads),
  };
};

export const crmFunilRouter = router({
  stats: publicProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
      responsavelId: z.number().optional(),  // null = todos os comerciais
    }))
    .query(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });

      const inicio = new Date(input.dataInicio);
      const fim = new Date(input.dataFim);

      const inicioMesAnterior = new Date(inicio);
      inicioMesAnterior.setMonth(inicioMesAnterior.getMonth() - 1);
      const fimMesAnterior = new Date(fim);
      fimMesAnterior.setMonth(fimMesAnterior.getMonth() - 1);

      const inicioAnoAnterior = new Date(inicio);
      inicioAnoAnterior.setFullYear(inicioAnoAnterior.getFullYear() - 1);
      const fimAnoAnterior = new Date(fim);
      fimAnoAnterior.setFullYear(fimAnoAnterior.getFullYear() - 1);

      const rid = input.responsavelId;
      const [atual, mesAnterior, anoAnterior] = await Promise.all([
        calcFunilStats(db, inicio, fim, rid),
        calcFunilStats(db, inicioMesAnterior, fimMesAnterior, rid),
        calcFunilStats(db, inicioAnoAnterior, fimAnoAnterior, rid),
      ]);

      return {
        atual,
        mesAnterior,
        anoAnterior,
        periodo: { inicio: inicio.toISOString(), fim: fim.toISOString() },
      };
    }),
});
