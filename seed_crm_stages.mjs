/**
 * Importa contactos de todos os stages CRM do Odoo para outreach_contactos.
 * Cada stage do CRM torna-se um segmento separado.
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";

// Ler DATABASE_URL do .env
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  try {
    const env = readFileSync("/home/ubuntu/team24-website/.env", "utf8");
    for (const line of env.split("\n")) {
      if (line.startsWith("DATABASE_URL=")) {
        DATABASE_URL = line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {}
}

let ODOO_API_KEY = process.env.ODOO_API_KEY;
if (!ODOO_API_KEY) {
  try {
    const env = readFileSync("/home/ubuntu/team24-website/.env", "utf8");
    for (const line of env.split("\n")) {
      if (line.startsWith("ODOO_API_KEY=")) {
        ODOO_API_KEY = line.slice("ODOO_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {}
}

const ODOO_URL = "https://team24.thinkopen.solutions";
const ODOO_DB = "team24";
const ODOO_USER = "marketing@team24.pt";

// Stages CRM do Odoo → segmento no backoffice
const STAGE_MAP = [
  { odooId: 2,  segmento: "em_tratamento",       label: "Em Tratamento" },
  { odooId: 3,  segmento: "reuniao_agendada",     label: "Reunião Agendada" },
  { odooId: 5,  segmento: "proposta_enviada",     label: "Proposta Enviada" },
  { odooId: 8,  segmento: "proposta_adjudicada",  label: "Proposta Adjudicada" },
  { odooId: 4,  segmento: "won",                  label: "Won" },
  { odooId: 6,  segmento: "renovacoes_pendente",  label: "Renovações Pendente" },
  { odooId: 10, segmento: "contratos_renovados",  label: "Contratos Renovados" },
  { odooId: 7,  segmento: "contratos_terminados", label: "Contratos Terminados" },
  { odooId: 9,  segmento: "servicos_isolados",    label: "Serviços Isolados" },
];

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

async function getLeadsForStage(uid, stageId) {
  // Buscar leads activos neste stage
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
    <param><value><struct><member><name>limit</name><value><int>500</int></value></member></struct></value></param>
  </params></methodCall>`);

  const idMatches = Array.from(searchXml.matchAll(/<int>(\d+)<\/int>/g));
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

  // Parse dos campos
  const partnerNameMatches = Array.from(readXml.matchAll(/<name>partner_name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
  const contactNameMatches = Array.from(readXml.matchAll(/<name>contact_name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
  const emailMatches = Array.from(readXml.matchAll(/<name>email_from<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
  const idMatchesParsed = Array.from(readXml.matchAll(/<name>id<\/name>\s*<value><int>(\d+)<\/int><\/value>/g));

  const leads = [];
  for (let i = 0; i < emailMatches.length; i++) {
    const email = emailMatches[i]?.[1]?.trim() || "";
    const empresa = partnerNameMatches[i]?.[1]?.trim() || "";
    const nome = contactNameMatches[i]?.[1]?.trim() || empresa;
    const id = parseInt(idMatchesParsed[i]?.[1] || "0");
    if (!email || !empresa) continue;
    leads.push({ id, nome, email, empresa });
  }
  return leads;
}

function parseDbUrl(url) {
  // mysql://user:pass@host:port/db?params
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:\/]+):?(\d*)\/([^?]+)/);
  if (!match) throw new Error("Cannot parse DATABASE_URL: " + url);
  return {
    user: decodeURIComponent(match[1]),
    password: decodeURIComponent(match[2]),
    host: match[3],
    port: parseInt(match[4] || "3306"),
    database: match[5].split("?")[0],
    ssl: url.includes("ssl") ? { rejectUnauthorized: false } : undefined,
  };
}

async function main() {
  console.log("A conectar à base de dados...");
  const dbConfig = parseDbUrl(DATABASE_URL);
  const conn = await mysql.createConnection({ ...dbConfig, charset: "utf8mb4" });

  console.log("A autenticar no Odoo...");
  const uid = await getOdooUid();
  console.log(`Odoo UID: ${uid}`);

  let totalInseridos = 0;
  let totalActualizados = 0;
  let totalIgnorados = 0;

  for (const stage of STAGE_MAP) {
    console.log(`\nA processar stage: ${stage.label} (ID ${stage.odooId})...`);
    const leads = await getLeadsForStage(uid, stage.odooId);
    console.log(`  ${leads.length} leads encontrados com email`);

    let inseridos = 0;
    let actualizados = 0;
    let ignorados = 0;

    for (const lead of leads) {
      // Verificar se já existe por email
      const [rows] = await conn.execute(
        "SELECT id, descartado FROM outreach_contactos WHERE email = ? LIMIT 1",
        [lead.email]
      );

      if (rows.length > 0) {
        const existing = rows[0];
        if (!existing.descartado) {
          // Actualizar nome/empresa mas não mudar segmento se já existir
          await conn.execute(
            "UPDATE outreach_contactos SET nome = ?, empresa = ? WHERE id = ?",
            [lead.nome, lead.empresa, existing.id]
          );
          actualizados++;
        } else {
          ignorados++;
        }
      } else {
        // Inserir novo
        await conn.execute(
          "INSERT INTO outreach_contactos (nome, email, empresa, segmento, ativo, descartado, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, 0, NOW(), NOW())",
          [lead.nome, lead.email, lead.empresa, stage.segmento]
        );
        inseridos++;
      }
    }

    console.log(`  Inseridos: ${inseridos} | Actualizados: ${actualizados} | Ignorados (descartados): ${ignorados}`);
    totalInseridos += inseridos;
    totalActualizados += actualizados;
    totalIgnorados += ignorados;
  }

  await conn.end();

  console.log("\n=== RESUMO FINAL ===");
  console.log(`Total inseridos: ${totalInseridos}`);
  console.log(`Total actualizados: ${totalActualizados}`);
  console.log(`Total ignorados: ${totalIgnorados}`);
}

main().catch(err => {
  console.error("ERRO:", err.message);
  process.exit(1);
});
