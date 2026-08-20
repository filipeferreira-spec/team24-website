/**
 * Handler de sincronização diária de contactos do Odoo para a tabela outreach_contactos.
 * Endpoint: POST /api/scheduled/sync-odoo-contacts
 *
 * Segmentos sincronizados:
 *  - "clientes"              → res.partner com customer_rank > 0
 *  - "geral"                 → res.partner sem customer_rank (prospects)
 *  - "np4552"                → res.partner com tag 31 (NP4552)
 *  - "em_tratamento"         → crm.lead stage_id=2
 *  - "reuniao_agendada"      → crm.lead stage_id=3
 *  - "proposta_enviada"      → crm.lead stage_id=5
 *  - "proposta_adjudicada"   → crm.lead stage_id=8
 *  - "won"                   → crm.lead stage_id=4
 *  - "renovacoes_pendente"   → crm.lead stage_id=6
 *  - "contratos_renovados"   → crm.lead stage_id=10
 *  - "contratos_terminados"  → crm.lead stage_id=7
 *  - "servicos_isolados"     → crm.lead stage_id=9
 */

import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { outreachContactos } from "../drizzle/schema";
import { sdk } from "./_core/sdk";

const ODOO_URL = process.env.ODOO_URL || "https://team24.thinkopen.solutions";
const ODOO_DB = process.env.ODOO_DB || "team24";
const ODOO_USER = process.env.ODOO_USER || "marketing@team24.pt";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";

let _uid: number | null = null;

async function odooXmlRpc(endpoint: string, body: string): Promise<string> {
  const res = await fetch(`${ODOO_URL}/xmlrpc/2/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
  });
  if (!res.ok) throw new Error(`Odoo HTTP ${res.status}`);
  return res.text();
}

async function getOdooUid(): Promise<number> {
  if (_uid) return _uid;
  const xml = await odooXmlRpc("common", `<?xml version='1.0'?><methodCall><methodName>authenticate</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><string>${ODOO_USER}</string></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><struct/></value></param>
  </params></methodCall>`);
  const m = xml.match(/<int>(\d+)<\/int>/);
  if (!m) throw new Error("Odoo auth failed");
  _uid = parseInt(m[1]);
  return _uid;
}

// Busca parceiros (res.partner) com email
async function fetchPartners(uid: number, domain: string, limit = 2000): Promise<{ id: number; name: string; email: string; numColaboradores?: number }[]> {
  const searchXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>res.partner</string></value></param>
    <param><value><string>search</string></value></param>
    <param><value><array><data>${domain}</data></array></value></param>
    <param><value><struct><member><name>limit</name><value><int>${limit}</int></value></member></struct></value></param>
  </params></methodCall>`);

  const idMatches = Array.from(searchXml.matchAll(/<int>(\d+)<\/int>/g));
  const partnerIds = idMatches.map((m) => parseInt(m[1])).filter((id) => id > 0);
  if (!partnerIds.length) return [];

  const idsXml = partnerIds.map((id) => `<value><int>${id}</int></value>`).join("");
  const readXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>res.partner</string></value></param>
    <param><value><string>read</string></value></param>
    <param><value><array><data><value><array><data>${idsXml}</data></array></value></data></array></value></param>
    <param><value><struct><member><name>fields</name><value><array><data>
      <value><string>id</string></value>
      <value><string>name</string></value>
      <value><string>email</string></value>
      <value><string>x_studio_nmero_colaboradores</string></value>
    </data></array></value></member></struct></value></param>
  </params></methodCall>`);

  const nameMatches = Array.from(readXml.matchAll(/<name>name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
  const emailMatches = Array.from(readXml.matchAll(/<name>email<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
  const idMatchesParsed = Array.from(readXml.matchAll(/<name>id<\/name>\s*<value><int>(\d+)<\/int><\/value>/g));
  const colaboradoresMatches = Array.from(readXml.matchAll(/<name>x_studio_nmero_colaboradores<\/name>\s*<value><int>(\d+)<\/int><\/value>/g));

  const results: { id: number; name: string; email: string; numColaboradores?: number }[] = [];
  for (let i = 0; i < nameMatches.length; i++) {
    const name = nameMatches[i]?.[1] || "";
    const email = emailMatches[i]?.[1] || "";
    const id = parseInt(idMatchesParsed[i]?.[1] || "0");
    const numColaboradores = colaboradoresMatches[i] ? parseInt(colaboradoresMatches[i][1]) : undefined;
    if (!email || !name) continue;
    results.push({ id, name, email, numColaboradores });
  }
  return results;
}

// Busca leads do CRM por stage
async function fetchLeadsByStage(uid: number, stageId: number, limit = 500): Promise<{ id: number; name: string; email: string; empresa: string }[]> {
  const searchXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>crm.lead</string></value></param>
    <param><value><string>search</string></value></param>
    <param><value><array><data><value><array><data>
      <value><array><data><value><string>stage_id</string></value><value><string>=</string></value><value><int>${stageId}</int></value></data></array></value>
      <value><array><data><value><string>active</string></value><value><string>=</string></value><value><boolean>1</boolean></value></data></array></value>
    </data></array></value></data></array></value></param>
    <param><value><struct><member><name>limit</name><value><int>${limit}</int></value></member></struct></value></param>
  </params></methodCall>`);

  const idMatches = Array.from(searchXml.matchAll(/<int>(\d+)<\/int>/g));
  const leadIds = idMatches.map((m) => parseInt(m[1])).filter((id) => id > 0);
  if (!leadIds.length) return [];

  const idsXml = leadIds.map((id) => `<value><int>${id}</int></value>`).join("");
  const readXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>crm.lead</string></value></param>
    <param><value><string>read</string></value></param>
    <param><value><array><data><value><array><data>${idsXml}</data></array></value></data></array></value></param>
    <param><value><struct><member><name>fields</name><value><array><data>
      <value><string>id</string></value>
      <value><string>partner_name</string></value>
      <value><string>contact_name</string></value>
      <value><string>email_from</string></value>
    </data></array></value></member></struct></value></param>
  </params></methodCall>`);

  const partnerNameMatches = Array.from(readXml.matchAll(/<name>partner_name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
  const contactNameMatches = Array.from(readXml.matchAll(/<name>contact_name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
  const emailMatches = Array.from(readXml.matchAll(/<name>email_from<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
  const idMatchesParsed = Array.from(readXml.matchAll(/<name>id<\/name>\s*<value><int>(\d+)<\/int><\/value>/g));

  const results: { id: number; name: string; email: string; empresa: string }[] = [];
  for (let i = 0; i < emailMatches.length; i++) {
    const email = emailMatches[i]?.[1]?.trim() || "";
    const empresa = partnerNameMatches[i]?.[1]?.trim() || "";
    const nome = contactNameMatches[i]?.[1]?.trim() || empresa;
    const id = parseInt(idMatchesParsed[i]?.[1] || "0");
    if (!email || !empresa) continue;
    results.push({ id, name: nome, email, empresa });
  }
  return results;
}

type SegmentoType = "clientes" | "geral" | "np4552" | "em_tratamento" | "reuniao_agendada" |
  "proposta_enviada" | "proposta_adjudicada" | "won" | "renovacoes_pendente" |
  "contratos_renovados" | "contratos_terminados" | "servicos_isolados";

async function upsertContactos(
  db: Awaited<ReturnType<typeof getDb>>,
  contactos: { id: number; name: string; email: string; empresa?: string; numColaboradores?: number }[],
  segmento: SegmentoType
): Promise<{ inseridos: number; actualizados: number }> {
  if (!db) throw new Error("DB unavailable");
  let inseridos = 0;
  let actualizados = 0;

  for (const c of contactos) {
    const [existing] = await db
      .select({ id: outreachContactos.id, descartado: outreachContactos.descartado })
      .from(outreachContactos)
      .where(eq(outreachContactos.email, c.email))
      .limit(1);

    if (existing) {
      if (!existing.descartado) {
        await db
          .update(outreachContactos)
          .set({ nome: c.name, empresa: c.empresa || c.name, odooPartnerId: c.id || undefined, ...(c.numColaboradores !== undefined ? { numColaboradores: c.numColaboradores } : {}) })
          .where(eq(outreachContactos.id, existing.id));
        actualizados++;
      }
    } else {
      await db.insert(outreachContactos).values({
        nome: c.name,
        email: c.email,
        empresa: c.empresa || c.name,
        segmento,
        odooPartnerId: c.id || undefined,
        ativo: true,
        descartado: false,
        ...(c.numColaboradores !== undefined ? { numColaboradores: c.numColaboradores } : {}),
      });
      inseridos++;
    }
  }

  return { inseridos, actualizados };
}

export async function syncOdooContactsHandler(req: Request, res: Response) {
  try {
    // Autenticar — aceitar tanto cron como backoffice admin
    try {
      await sdk.authenticateRequest(req);
    } catch {
      res.status(403).json({ error: "forbidden" });
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ ok: false, error: "DB unavailable" });
      return;
    }

    const uid = await getOdooUid();

    // ── Parceiros (res.partner) ──────────────────────────────────────────────
    const dominioClientes = `<value><array><data>
      <value><array><data><value><string>email</string></value><value><string>!=</string></value><value><boolean>0</boolean></value></data></array></value>
      <value><array><data><value><string>is_company</string></value><value><string>=</string></value><value><boolean>1</boolean></value></data></array></value>
      <value><array><data><value><string>customer_rank</string></value><value><string>&gt;</string></value><value><int>0</int></value></data></array></value>
    </data></array></value>`;

    const dominioGeral = `<value><array><data>
      <value><array><data><value><string>email</string></value><value><string>!=</string></value><value><boolean>0</boolean></value></data></array></value>
      <value><array><data><value><string>is_company</string></value><value><string>=</string></value><value><boolean>1</boolean></value></data></array></value>
      <value><array><data><value><string>customer_rank</string></value><value><string>=</string></value><value><int>0</int></value></data></array></value>
    </data></array></value>`;

    const dominioNP4552 = `<value><array><data>
      <value><array><data><value><string>category_id</string></value><value><string>in</string></value><value><array><data><value><int>31</int></value></data></array></value></data></array></value>
      <value><array><data><value><string>is_company</string></value><value><string>=</string></value><value><boolean>1</boolean></value></data></array></value>
    </data></array></value>`;

    // Stages CRM: id Odoo → segmento
    const CRM_STAGES: { odooId: number; segmento: SegmentoType }[] = [
      { odooId: 2,  segmento: "em_tratamento" },
      { odooId: 3,  segmento: "reuniao_agendada" },
      { odooId: 5,  segmento: "proposta_enviada" },
      { odooId: 8,  segmento: "proposta_adjudicada" },
      { odooId: 4,  segmento: "won" },
      { odooId: 6,  segmento: "renovacoes_pendente" },
      { odooId: 10, segmento: "contratos_renovados" },
      { odooId: 7,  segmento: "contratos_terminados" },
      { odooId: 9,  segmento: "servicos_isolados" },
    ];

    // Buscar todos em paralelo
    const [clientesData, geralData, np4552Data, ...crmData] = await Promise.all([
      fetchPartners(uid, dominioClientes),
      fetchPartners(uid, dominioGeral),
      fetchPartners(uid, dominioNP4552),
      ...CRM_STAGES.map(s => fetchLeadsByStage(uid, s.odooId)),
    ]);

    // Upsert sequencial para não sobrecarregar a BD
    const resClientes = await upsertContactos(db, clientesData, "clientes");
    const resGeral = await upsertContactos(db, geralData, "geral");
    const resNP4552 = await upsertContactos(db, np4552Data, "np4552");

    const resCRM: Record<string, { inseridos: number; actualizados: number }> = {};
    for (let i = 0; i < CRM_STAGES.length; i++) {
      const stage = CRM_STAGES[i];
      const leads = crmData[i].map(l => ({ id: l.id, name: l.name, email: l.email, empresa: l.empresa }));
      resCRM[stage.segmento] = await upsertContactos(db, leads, stage.segmento);
    }

    const resultado = {
      ok: true,
      sincronizadoEm: new Date().toISOString(),
      clientes: resClientes,
      geral: resGeral,
      np4552: resNP4552,
      crm: resCRM,
    };

    console.log("[sync-odoo-contacts]", JSON.stringify(resultado));
    res.json(resultado);
  } catch (err: any) {
    console.error("[sync-odoo-contacts] Erro:", err);
    res.status(500).json({
      ok: false,
      error: err.message,
      stack: err.stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}
