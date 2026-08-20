/**
 * Script de sincronização imediata de todos os segmentos CRM do Odoo.
 * Corre directamente contra a BD sem passar pelo endpoint HTTP.
 */
import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), ".env") });

const ODOO_URL = process.env.ODOO_URL || "https://team24.thinkopen.solutions";
const ODOO_DB = process.env.ODOO_DB || "team24";
const ODOO_USER = process.env.ODOO_USER || "marketing@team24.pt";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) { console.error("DATABASE_URL não definida"); process.exit(1); }

// Parse DATABASE_URL
const url = new URL(DATABASE_URL);
const dbConfig = {
  host: url.hostname,
  port: parseInt(url.port || "3306"),
  user: url.username,
  password: url.password,
  database: url.pathname.replace(/^\//, "").split("?")[0],
  ssl: { rejectUnauthorized: false },
  charset: "utf8mb4",
};

async function odooXmlRpc(endpoint, body) {
  const res = await fetch(`${ODOO_URL}/xmlrpc/2/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
  });
  if (!res.ok) throw new Error(`Odoo HTTP ${res.status}`);
  return res.text();
}

async function getOdooUid() {
  const xml = await odooXmlRpc("common", `<?xml version='1.0'?><methodCall><methodName>authenticate</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><string>${ODOO_USER}</string></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><struct/></value></param>
  </params></methodCall>`);
  const m = xml.match(/<int>(\d+)<\/int>/);
  if (!m) throw new Error("Odoo auth failed");
  return parseInt(m[1]);
}

async function fetchPartners(uid, domain, limit = 2000) {
  const searchXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>res.partner</string></value></param>
    <param><value><string>search</string></value></param>
    <param><value><array><data>${domain}</data></array></value></param>
    <param><value><struct><member><name>limit</name><value><int>${limit}</int></value></member></struct></value></param>
  </params></methodCall>`);

  const idMatches = [...searchXml.matchAll(/<int>(\d+)<\/int>/g)];
  const partnerIds = idMatches.map(m => parseInt(m[1])).filter(id => id > 0);
  if (!partnerIds.length) return [];

  const idsXml = partnerIds.map(id => `<value><int>${id}</int></value>`).join("");
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

  const nameMatches = [...readXml.matchAll(/<name>name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g)];
  const emailMatches = [...readXml.matchAll(/<name>email<\/name>\s*<value><string>(.*?)<\/string><\/value>/g)];
  const idMatchesParsed = [...readXml.matchAll(/<name>id<\/name>\s*<value><int>(\d+)<\/int><\/value>/g)];
  const colaboradoresMatches = [...readXml.matchAll(/<name>x_studio_nmero_colaboradores<\/name>\s*<value><int>(\d+)<\/int><\/value>/g)];

  const results = [];
  for (let i = 0; i < nameMatches.length; i++) {
    const name = nameMatches[i]?.[1] || "";
    const email = emailMatches[i]?.[1] || "";
    const id = parseInt(idMatchesParsed[i]?.[1] || "0");
    const numColaboradores = colaboradoresMatches[i] ? parseInt(colaboradoresMatches[i][1]) : null;
    if (!email || !name) continue;
    results.push({ id, name, email, empresa: name, numColaboradores });
  }
  return results;
}

async function fetchLostLeads(uid, limit = 1000) {
  // Lost leads têm active = false no Odoo
  const searchXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>crm.lead</string></value></param>
    <param><value><string>search</string></value></param>
    <param><value><array><data><value><array><data>
      <value><array><data><value><string>active</string></value><value><string>=</string></value><value><boolean>0</boolean></value></data></array></value>
    </data></array></value></data></array></value></param>
    <param><value><struct><member><name>limit</name><value><int>${limit}</int></value></member></struct></value></param>
  </params></methodCall>`);

  const idMatches = [...searchXml.matchAll(/<int>(\d+)<\/int>/g)];
  const leadIds = idMatches.map(m => parseInt(m[1])).filter(id => id > 0);
  if (!leadIds.length) return [];

  const idsXml = leadIds.map(id => `<value><int>${id}</int></value>`).join("");
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
      <value><string>lost_reason_id</string></value>
    </data></array></value></member></struct></value></param>
  </params></methodCall>`);

  const partnerNameMatches = [...readXml.matchAll(/<name>partner_name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g)];
  const contactNameMatches = [...readXml.matchAll(/<name>contact_name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g)];
  const emailMatches = [...readXml.matchAll(/<name>email_from<\/name>\s*<value><string>(.*?)<\/string><\/value>/g)];
  const idMatchesParsed = [...readXml.matchAll(/<name>id<\/name>\s*<value><int>(\d+)<\/int><\/value>/g)];
  // lost_reason_id returns [id, name] array or boolean false — with newlines between tags
  const lostReasonMatches = [...readXml.matchAll(/<name>lost_reason_id<\/name>\s*<value>(?:<array><data>\s*<value><int>\d+<\/int><\/value>\s*<value><string>(.*?)<\/string><\/value>\s*<\/data><\/array>|<boolean>0<\/boolean>)<\/value>/gs)];

  const results = [];
  for (let i = 0; i < emailMatches.length; i++) {
    const email = emailMatches[i]?.[1]?.trim() || "";
    const empresa = partnerNameMatches[i]?.[1]?.trim() || "";
    const nome = contactNameMatches[i]?.[1]?.trim() || empresa;
    const id = parseInt(idMatchesParsed[i]?.[1] || "0");
    const motivoPerda = lostReasonMatches[i]?.[1]?.trim() || null;
    if (!email || !empresa) continue;
    results.push({ id, name: nome, email, empresa, motivoPerda });
  }
  return results;
}

async function fetchLeadsByStage(uid, stageId, limit = 500) {
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

  const idMatches = [...searchXml.matchAll(/<int>(\d+)<\/int>/g)];
  const leadIds = idMatches.map(m => parseInt(m[1])).filter(id => id > 0);
  if (!leadIds.length) return [];

  const idsXml = leadIds.map(id => `<value><int>${id}</int></value>`).join("");
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
      <value><string>partner_id</string></value>
    </data></array></value></member></struct></value></param>
  </params></methodCall>`);

  const partnerNameMatches = [...readXml.matchAll(/<name>partner_name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g)];
  const contactNameMatches = [...readXml.matchAll(/<name>contact_name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g)];
  const emailMatches = [...readXml.matchAll(/<name>email_from<\/name>\s*<value><string>(.*?)<\/string><\/value>/g)];
  const idMatchesParsed = [...readXml.matchAll(/<name>id<\/name>\s*<value><int>(\d+)<\/int><\/value>/g)];
  // partner_id is [id, name] array or boolean false
  const partnerIdMatches = [...readXml.matchAll(/<name>partner_id<\/name>\s*<value>(?:<array><data>\s*<value><int>(\d+)<\/int><\/value>[\s\S]*?<\/data><\/array>|<boolean>0<\/boolean>)<\/value>/gs)];

  // Collect partner IDs to fetch numColaboradores
  const partnerIds = partnerIdMatches.map(m => m[1] ? parseInt(m[1]) : null).filter(Boolean);
  let partnerColabMap = {};
  if (partnerIds.length > 0) {
    const pIdsXml = [...new Set(partnerIds)].map(id => `<value><int>${id}</int></value>`).join("");
    const pReadXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
      <param><value><string>${ODOO_DB}</string></value></param>
      <param><value><int>${uid}</int></value></param>
      <param><value><string>${ODOO_API_KEY}</string></value></param>
      <param><value><string>res.partner</string></value></param>
      <param><value><string>read</string></value></param>
      <param><value><array><data><value><array><data>${pIdsXml}</data></array></value></data></array></value></param>
      <param><value><struct><member><name>fields</name><value><array><data>
        <value><string>id</string></value>
        <value><string>x_studio_nmero_colaboradores</string></value>
      </data></array></value></member></struct></value></param>
    </params></methodCall>`);
    const pIdM = [...pReadXml.matchAll(/<name>id<\/name>\s*<value><int>(\d+)<\/int><\/value>/g)];
    const pColabM = [...pReadXml.matchAll(/<name>x_studio_nmero_colaboradores<\/name>\s*<value><int>(\d+)<\/int><\/value>/g)];
    for (let j = 0; j < pIdM.length; j++) {
      const pid = parseInt(pIdM[j][1]);
      const colab = pColabM[j] ? parseInt(pColabM[j][1]) : null;
      partnerColabMap[pid] = colab;
    }
  }

  const results = [];
  for (let i = 0; i < emailMatches.length; i++) {
    const email = emailMatches[i]?.[1]?.trim() || "";
    const empresa = partnerNameMatches[i]?.[1]?.trim() || "";
    const nome = contactNameMatches[i]?.[1]?.trim() || empresa;
    const id = parseInt(idMatchesParsed[i]?.[1] || "0");
    const partnerId = partnerIdMatches[i]?.[1] ? parseInt(partnerIdMatches[i][1]) : null;
    const numColaboradores = partnerId ? (partnerColabMap[partnerId] ?? null) : null;
    if (!email || !empresa) continue;
    results.push({ id, name: nome, email, empresa, numColaboradores });
  }
  return results;
}

async function upsertContactos(conn, contactos, segmento) {
  let inseridos = 0, actualizados = 0, ignorados = 0;
  for (const c of contactos) {
    const [rows] = await conn.execute(
      "SELECT id, descartado FROM outreach_contactos WHERE email = ? LIMIT 1",
      [c.email]
    );
    if (rows.length > 0) {
      const existing = rows[0];
      if (!existing.descartado) {
        await conn.execute(
          "UPDATE outreach_contactos SET nome = ?, empresa = ?, odooPartnerId = ?, segmento = ?, numColaboradores = ?, motivoPerda = ? WHERE id = ?",
          [c.name, c.empresa || c.name, c.id || null, segmento, c.numColaboradores ?? null, c.motivoPerda ?? null, existing.id]
        );
        actualizados++;
      } else {
        ignorados++;
      }
    } else {
      await conn.execute(
        "INSERT INTO outreach_contactos (nome, email, empresa, segmento, odooPartnerId, numColaboradores, motivoPerda, ativo, descartado, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())",
        [c.name, c.email, c.empresa || c.name, segmento, c.id || null, c.numColaboradores ?? null, c.motivoPerda ?? null]
      );
      inseridos++;
    }
  }
  return { inseridos, actualizados, ignorados };
}

const CRM_STAGES = [
  { odooId: 2,  segmento: "em_tratamento",       label: "Em Tratamento" },
  { odooId: 3,  segmento: "reuniao_agendada",     label: "Reunião Agendada" },
  { odooId: 5,  segmento: "proposta_enviada",     label: "Proposta Enviada" },
  { odooId: 8,  segmento: "proposta_adjudicada",  label: "Proposta Adjudicada" },
  { odooId: 4,  segmento: "won",                  label: "Won (Clientes)" },
  { odooId: 6,  segmento: "renovacoes_pendente",  label: "Renovações Pendente" },
  { odooId: 10, segmento: "contratos_renovados",  label: "Contratos Renovados" },
  { odooId: 7,  segmento: "contratos_terminados", label: "Contratos Terminados" },
  { odooId: 9,  segmento: "servicos_isolados",    label: "Serviços Isolados" },
];

(async () => {
  console.log("A ligar à BD...");
  const conn = await createConnection(dbConfig);
  console.log("Ligado. A autenticar no Odoo...");
  const uid = await getOdooUid();
  console.log(`Odoo UID: ${uid}`);

  // Parceiros
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

  console.log("A buscar parceiros do Odoo...");
  const [clientesData, geralData, np4552Data] = await Promise.all([
    fetchPartners(uid, dominioClientes),
    fetchPartners(uid, dominioGeral),
    fetchPartners(uid, dominioNP4552),
  ]);

  console.log(`  Clientes: ${clientesData.length} | Geral: ${geralData.length} | NP4552: ${np4552Data.length}`);

  const resClientes = await upsertContactos(conn, clientesData, "clientes");
  console.log(`  ✓ Clientes: ${JSON.stringify(resClientes)}`);

  const resGeral = await upsertContactos(conn, geralData, "geral");
  console.log(`  ✓ Geral: ${JSON.stringify(resGeral)}`);

  const resNP4552 = await upsertContactos(conn, np4552Data, "np4552");
  console.log(`  ✓ NP4552: ${JSON.stringify(resNP4552)}`);

  // CRM Stages
  console.log("\nA buscar leads CRM por stage...");
  for (const stage of CRM_STAGES) {
    const leads = await fetchLeadsByStage(uid, stage.odooId);
    console.log(`  ${stage.label}: ${leads.length} leads`);
    const res = await upsertContactos(conn, leads, stage.segmento);
    console.log(`  ✓ ${stage.label}: ${JSON.stringify(res)}`);
  }

  // Lost leads
  console.log("\nA buscar leads perdidos (Lost)...");
  const lostLeads = await fetchLostLeads(uid);
  console.log(`  Lost: ${lostLeads.length} leads`);
  const resLost = await upsertContactos(conn, lostLeads, "perdido");
  console.log(`  ✓ Perdido: ${JSON.stringify(resLost)}`);

  // Totais
  const [totais] = await conn.execute(
    "SELECT segmento, COUNT(*) as total FROM outreach_contactos WHERE descartado = 0 GROUP BY segmento ORDER BY total DESC"
  );
  console.log("\n=== TOTAIS POR SEGMENTO ===");
  for (const row of totais) {
    console.log(`  ${row.segmento}: ${row.total}`);
  }

  await conn.end();
  console.log("\nSincronização concluída.");
})().catch(err => {
  console.error("ERRO:", err.message);
  process.exit(1);
});
