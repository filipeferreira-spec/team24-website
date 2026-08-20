/**
 * Migração Odoo → CRM TEAM 24
 * Usa fetch nativo (Node 18+) e mysql2 para migrar leads do Odoo para o CRM local
 */
import mysql from "mysql2/promise";

const ODOO_URL = process.env.ODOO_URL;
const ODOO_DB = process.env.ODOO_DB;
const ODOO_USER = process.env.ODOO_USER;
const ODOO_API_KEY = process.env.ODOO_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// ─── Helpers XML-RPC via fetch ────────────────────────────────────────────────
async function xmlRpcCall(endpoint, method, params) {
  const body = `<?xml version='1.0'?><methodCall><methodName>${method}</methodName><params>${params}</params></methodCall>`;
  const res = await fetch(`${ODOO_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "text/xml", "Content-Length": String(Buffer.byteLength(body)) },
    body
  });
  return res.text();
}

function parseXmlRpcInt(xml) {
  const m = xml.match(/<(?:int|i4)>(\d+)<\/(?:int|i4)>/);
  return m ? parseInt(m[1], 10) : null;
}

function parseXmlRpcFault(xml) {
  if (!xml.includes("<fault>")) return null;
  const m = xml.match(/<name>faultString<\/name>\s*<value><string>([\s\S]*?)<\/string><\/value>/);
  return m ? m[1] : "Odoo fault";
}

function escapeXml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function getUid() {
  const xml = await xmlRpcCall("/xmlrpc/2/common", "authenticate",
    `<value><string>${escapeXml(ODOO_DB)}</string></value>
     <value><string>${escapeXml(ODOO_USER)}</string></value>
     <value><string>${escapeXml(ODOO_API_KEY)}</string></value>
     <value><struct></struct></value>`);
  const fault = parseXmlRpcFault(xml);
  if (fault) throw new Error(`Auth failed: ${fault}`);
  return parseXmlRpcInt(xml);
}

async function odooSearchRead(uid, model, domain, fields, limit, offset) {
  const domainXml = domain.map(([f, op, v]) => {
    let valXml;
    if (typeof v === "boolean") valXml = `<value><boolean>${v ? 1 : 0}</boolean></value>`;
    else if (typeof v === "number") valXml = `<value><int>${v}</int></value>`;
    else valXml = `<value><string>${escapeXml(v)}</string></value>`;
    return `<value><array><data><value><string>${escapeXml(f)}</string></value><value><string>${escapeXml(op)}</string></value>${valXml}</data></array></value>`;
  }).join("");

  const fieldsXml = fields.map(f => `<value><string>${escapeXml(f)}</string></value>`).join("");

  const params = `
    <value><string>${escapeXml(ODOO_DB)}</string></value>
    <value><int>${uid}</int></value>
    <value><string>${escapeXml(ODOO_API_KEY)}</string></value>
    <value><string>${escapeXml(model)}</string></value>
    <value><string>search_read</string></value>
    <value><array><data>
      <value><array><data>${domainXml}</data></array></value>
    </data></array></value>
    <value><struct>
      <member><name>fields</name><value><array><data>${fieldsXml}</data></array></value></member>
      <member><name>limit</name><value><int>${limit}</int></value></member>
      <member><name>offset</name><value><int>${offset}</int></value></member>
    </struct></value>`;

  const xml = await xmlRpcCall("/xmlrpc/2/object", "execute_kw", params);
  const fault = parseXmlRpcFault(xml);
  if (fault) throw new Error(`search_read failed: ${fault}`);

  // Parse simples: extrair valores dos membros
  const results = [];
  const recordMatches = xml.matchAll(/<value><struct>([\s\S]*?)<\/struct><\/value>/g);
  for (const match of recordMatches) {
    const struct = match[1];
    const record = {};
    const memberMatches = struct.matchAll(/<member>\s*<name>([^<]+)<\/name>\s*<value>([\s\S]*?)<\/value>\s*<\/member>/g);
    for (const mem of memberMatches) {
      const key = mem[1];
      const valRaw = mem[2].trim();
      if (valRaw.startsWith("<boolean>")) record[key] = valRaw.includes(">1<");
      else if (valRaw.startsWith("<int>") || valRaw.startsWith("<i4>")) {
        const n = valRaw.match(/<(?:int|i4)>(\d+)<\/(?:int|i4)>/);
        record[key] = n ? parseInt(n[1]) : null;
      }
      else if (valRaw.startsWith("<string>")) {
        const s = valRaw.match(/<string>([\s\S]*?)<\/string>/);
        record[key] = s ? s[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"') : "";
      }
      else if (valRaw.startsWith("<array>")) {
        // many2one: [id, name]
        const items = [...valRaw.matchAll(/<(?:int|i4)>(\d+)<\/(?:int|i4)>|<string>([\s\S]*?)<\/string>/g)];
        if (items.length >= 2) {
          record[key] = [parseInt(items[0][1] || "0"), (items[1][2] || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")];
        } else {
          record[key] = false;
        }
      }
      else if (valRaw === "<boolean>0</boolean>" || valRaw.includes("<boolean>0</boolean>")) record[key] = false;
      else record[key] = false;
    }
    results.push(record);
  }
  return results;
}

// ─── Mapeamento de fases ──────────────────────────────────────────────────────
function mapFase(stageName, isActive) {
  if (!isActive) return "lost";
  const s = (stageName || "").toLowerCase();
  if (s.includes("lead") || s === "leads") return "leads";
  if (s.includes("tratamento") || s.includes("contacto")) return "em_tratamento";
  if (s.includes("reunião") || s.includes("reuniao") || s.includes("agendada")) return "reuniao_agendada";
  if (s.includes("proposta enviada")) return "proposta_enviada";
  if (s.includes("adjudicada")) return "proposta_adjudicada";
  if (s.includes("won") || s.includes("ganho")) return "won";
  if (s.includes("renovaç") || s.includes("renovac") || (s.includes("renovações") && !s.includes("renovados"))) return "renovacoes_pendente";
  if (s.includes("renovados") || s.includes("arquivo")) return "contratos_renovados";
  if (s.includes("terminados") || s.includes("terminado")) return "contratos_terminados";
  if (s.includes("isolados") || s.includes("isolado")) return "servicos_isolados";
  return "leads";
}

function parseNum(val) {
  if (!val || val === false) return null;
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : Math.round(n);
}

function parseStr(val, maxLen = 490) {
  if (!val || val === false) return null;
  return String(val).trim().substring(0, maxLen) || null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔌 A ligar ao Odoo:", ODOO_URL);
  const uid = await getUid();
  console.log(`✅ Odoo UID: ${uid}`);

  const fields = [
    "id", "name", "partner_name", "email_from", "phone", "mobile",
    "stage_id", "active", "probability", "expected_revenue",
    "x_studio_mensalidade", "x_studio_mensalidade_com_eap", "x_studio_valor_total",
    "x_studio_tipo_eap", "x_studio_videoconsultas", "x_studio_workshop",
    "x_studio_avaliao_de_riscos_psicossociais",
    "user_id",
    "date_deadline", "create_date", "description", "lost_reason_id"
  ];

  let allLeads = [];
  const batchSize = 200;

  // Activos
  console.log("📥 A extrair leads activos...");
  let offset = 0;
  while (true) {
    const batch = await odooSearchRead(uid, "crm.lead", [["active", "=", true]], fields, batchSize, offset);
    if (!batch || batch.length === 0) break;
    allLeads.push(...batch);
    offset += batch.length;
    process.stdout.write(`  ${allLeads.length} leads...\r`);
    if (batch.length < batchSize) break;
  }

  // Lost
  console.log(`\n📥 A extrair leads lost...`);
  offset = 0;
  while (true) {
    const batch = await odooSearchRead(uid, "crm.lead", [["active", "=", false]], fields, batchSize, offset);
    if (!batch || batch.length === 0) break;
    allLeads.push(...batch);
    offset += batch.length;
    process.stdout.write(`  ${allLeads.length} leads total...\r`);
    if (batch.length < batchSize) break;
  }

  console.log(`\n✅ Total extraído do Odoo: ${allLeads.length} leads`);

  // Ligar à BD
  const db = await mysql.createConnection(DATABASE_URL);
  console.log("🔌 Ligado à base de dados MySQL");

  // Limpar tabelas antes de migrar (para re-runs)
  await db.execute("DELETE FROM crm_leads WHERE odooId IS NOT NULL");
  await db.execute("DELETE FROM crm_empresas WHERE fonte = 'odoo'");
  console.log("🗑️  Tabelas limpas para re-migração");

  let empresasInseridas = 0;
  let leadsInseridas = 0;
  let erros = 0;
  const empresaMap = new Map(); // nome_lower → id

  for (const lead of allLeads) {
    try {
      const nomeEmpresa = parseStr(lead.partner_name) || parseStr(lead.name) || "Empresa Desconhecida";
      const stageName = Array.isArray(lead.stage_id) ? lead.stage_id[1] : (typeof lead.stage_id === "string" ? lead.stage_id : "");
      const isActive = lead.active !== false && lead.active !== 0;
      const fase = mapFase(stageName, isActive);
      const nomeKey = nomeEmpresa.toLowerCase().trim();

      let empresaId = empresaMap.get(nomeKey);
      if (!empresaId) {
        const [existing] = await db.execute("SELECT id FROM crm_empresas WHERE nome = ? LIMIT 1", [nomeEmpresa]);
        if (existing.length > 0) {
          empresaId = existing[0].id;
        } else {
          const [result] = await db.execute(
            `INSERT INTO crm_empresas (odooId, nome, email, telefone, fonte, clienteAtivo, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, 'odoo', ?, NOW(), NOW())`,
            [
              lead.id,
              nomeEmpresa,
              parseStr(lead.email_from, 320),
              parseStr(lead.phone) || parseStr(lead.mobile),
              (fase === "won" || fase === "contratos_renovados") ? 1 : 0
            ]
          );
          empresaId = result.insertId;
          empresasInseridas++;
        }
        empresaMap.set(nomeKey, empresaId);
      }

      const mensalidade = parseNum(lead.x_studio_mensalidade);
      const mensalidadeEap = parseNum(lead.x_studio_mensalidade_com_eap);
      const valorTotal = parseNum(lead.x_studio_valor_total);
      const valorEstimado = mensalidade || parseNum(lead.expected_revenue);

      let dataFechamento = null;
      if (lead.date_deadline && lead.date_deadline !== false && lead.date_deadline !== "false") {
        try { dataFechamento = new Date(lead.date_deadline); } catch {}
      }
      let createdAt = new Date();
      if (lead.create_date && lead.create_date !== false && lead.create_date !== "false") {
        try { createdAt = new Date(lead.create_date); } catch {}
      }

      const motivoPerda = Array.isArray(lead.lost_reason_id) ? parseStr(lead.lost_reason_id[1]) : null;
      const responsavelNome = Array.isArray(lead.user_id) ? parseStr(lead.user_id[1]) : null;

      await db.execute(
        `INSERT INTO crm_leads (
          odooId, empresaId, titulo, fase, valorEstimado, probabilidade,
          mensalidade, mensalidadeComEap, valorTotal,
          tipoEap, videoconsultas, workshops, avaliacaoRiscos,
          ativo, motivoPerda, notas, dataFechamento,
          responsavelNome,
          ultimaActividade, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lead.id, empresaId,
          parseStr(lead.name, 490) || nomeEmpresa,
          fase, valorEstimado,
          parseNum(lead.probability) ?? (fase === "won" ? 100 : 10),
          mensalidade, mensalidadeEap, valorTotal,
          parseStr(lead.x_studio_tipo_eap),
          parseStr(lead.x_studio_videoconsultas),
          parseStr(lead.x_studio_workshop),
          parseStr(lead.x_studio_avaliao_de_riscos_psicossociais),
          isActive ? 1 : 0,
          motivoPerda,
          parseStr(lead.description, 5000),
          dataFechamento,
          responsavelNome,
          createdAt, createdAt, new Date()
        ]
      );
      leadsInseridas++;
      if (leadsInseridas % 100 === 0) process.stdout.write(`  ${leadsInseridas}/${allLeads.length} leads migradas...\r`);
    } catch (err) {
      erros++;
      if (erros <= 10) console.error(`\n⚠️  Erro lead ${lead.id} (${lead.name}): ${err.message}`);
    }
  }

  await db.end();

  console.log(`\n\n✅ Migração concluída!`);
  console.log(`   Empresas criadas:  ${empresasInseridas}`);
  console.log(`   Leads migradas:    ${leadsInseridas}`);
  console.log(`   Erros:             ${erros}`);
}

main().catch(err => { console.error("❌ Erro fatal:", err.message); process.exit(1); });
