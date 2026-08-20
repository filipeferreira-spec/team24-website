/**
 * Script para actualizar mensalidade e responsável nas leads do CRM
 * a partir dos dados do Odoo, sem re-migrar tudo.
 */
import mysql from 'mysql2/promise';

const ODOO_URL = process.env.ODOO_URL;
const ODOO_DB = process.env.ODOO_DB;
const ODOO_USER = process.env.ODOO_USER;
const ODOO_API_KEY = process.env.ODOO_API_KEY;

async function xmlrpc(endpoint, method, params) {
  const body = `<?xml version="1.0"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>${params.map(p => `<param><value>${toXml(p)}</value></param>`).join('')}</params>
</methodCall>`;
  const res = await fetch(`${ODOO_URL}/xmlrpc/2/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body,
  });
  const text = await res.text();
  return parseXmlValue(text);
}

function toXml(val) {
  if (val === null || val === undefined) return '<nil/>';
  if (typeof val === 'boolean') return `<boolean>${val ? 1 : 0}</boolean>`;
  if (typeof val === 'number') return Number.isInteger(val) ? `<int>${val}</int>` : `<double>${val}</double>`;
  if (typeof val === 'string') return `<string>${val.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</string>`;
  if (Array.isArray(val)) return `<array><data>${val.map(v => `<value>${toXml(v)}</value>`).join('')}</data></array>`;
  if (typeof val === 'object') {
    const members = Object.entries(val).map(([k, v]) => `<member><name>${k}</name><value>${toXml(v)}</value></member>`).join('');
    return `<struct>${members}</struct>`;
  }
  return `<string>${val}</string>`;
}

function parseXmlValue(xml) {
  // Extract all lead data from the response
  const results = [];
  // Find all struct elements (each lead)
  const structRegex = /<struct>([\s\S]*?)<\/struct>/g;
  let structMatch;
  while ((structMatch = structRegex.exec(xml)) !== null) {
    const struct = structMatch[1];
    const obj = {};
    const memberRegex = /<member>\s*<name>([^<]+)<\/name>\s*<value>([\s\S]*?)<\/value>\s*<\/member>/g;
    let memberMatch;
    while ((memberMatch = memberRegex.exec(struct)) !== null) {
      const key = memberMatch[1];
      const valueXml = memberMatch[2].trim();
      obj[key] = extractSimpleValue(valueXml);
    }
    if (obj.id) results.push(obj);
  }
  // If no structs found, try to get a simple int (like uid)
  if (results.length === 0) {
    const intMatch = xml.match(/<int>(\d+)<\/int>/);
    if (intMatch) return parseInt(intMatch[1]);
    const i4Match = xml.match(/<i4>(\d+)<\/i4>/);
    if (i4Match) return parseInt(i4Match[1]);
  }
  return results;
}

function extractSimpleValue(valueXml) {
  if (valueXml.includes('<nil/>') || valueXml.includes('<boolean>0</boolean>')) return null;
  const intMatch = valueXml.match(/<(?:int|i4)>(\d+)<\/(?:int|i4)>/);
  if (intMatch) return parseInt(intMatch[1]);
  const doubleMatch = valueXml.match(/<double>([\d.]+)<\/double>/);
  if (doubleMatch) return parseFloat(doubleMatch[1]);
  const strMatch = valueXml.match(/<string>([\s\S]*?)<\/string>/);
  if (strMatch) return strMatch[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  // Array with 2 elements (id, name) like user_id
  const arrayMatch = valueXml.match(/<array><data>([\s\S]*?)<\/data><\/array>/);
  if (arrayMatch) {
    const items = [];
    const itemRegex = /<value>([\s\S]*?)<\/value>/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(arrayMatch[1])) !== null) {
      items.push(extractSimpleValue(itemMatch[1]));
    }
    return items;
  }
  return null;
}

async function getUid() {
  return xmlrpc('common', 'authenticate', [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]);
}

async function main() {
  console.log('🔌 A ligar ao Odoo:', ODOO_URL);
  const uid = await getUid();
  console.log('✅ UID:', uid);

  // Fetch all leads with mensalidade and user_id
  const batchSize = 200;
  let offset = 0;
  let allLeads = [];

  // Active leads
  while (true) {
    const batch = await xmlrpc('object', 'execute_kw', [
      ODOO_DB, uid, ODOO_API_KEY,
      'crm.lead', 'search_read',
      [[['active', '=', true]]],
      { fields: ['id', 'x_studio_mensalidade', 'x_studio_mensalidade_com_eap', 'user_id'], limit: batchSize, offset }
    ]);
    if (!Array.isArray(batch) || batch.length === 0) break;
    allLeads = allLeads.concat(batch);
    offset += batch.length;
    if (batch.length < batchSize) break;
  }

  // Lost leads
  offset = 0;
  while (true) {
    const batch = await xmlrpc('object', 'execute_kw', [
      ODOO_DB, uid, ODOO_API_KEY,
      'crm.lead', 'search_read',
      [[['active', '=', false]]],
      { fields: ['id', 'x_studio_mensalidade', 'x_studio_mensalidade_com_eap', 'user_id'], limit: batchSize, offset }
    ]);
    if (!Array.isArray(batch) || batch.length === 0) break;
    allLeads = allLeads.concat(batch);
    offset += batch.length;
    if (batch.length < batchSize) break;
  }

  console.log(`✅ ${allLeads.length} leads extraídas do Odoo`);

  // Show sample
  const withMensalidade = allLeads.filter(l => l.x_studio_mensalidade && l.x_studio_mensalidade > 0);
  console.log(`📊 Leads com mensalidade > 0: ${withMensalidade.length}`);
  if (withMensalidade.length > 0) {
    console.log('Amostra:', withMensalidade.slice(0, 3).map(l => ({
      id: l.id,
      mensalidade: l.x_studio_mensalidade,
      user: l.user_id
    })));
  }

  // Connect to DB and update
  const db = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('🔌 Ligado à BD');

  let updated = 0;
  let errors = 0;
  for (const lead of allLeads) {
    try {
      const mensalidade = lead.x_studio_mensalidade && lead.x_studio_mensalidade !== false
        ? Math.round(parseFloat(String(lead.x_studio_mensalidade)))
        : null;
      const mensalidadeEap = lead.x_studio_mensalidade_com_eap && lead.x_studio_mensalidade_com_eap !== false
        ? Math.round(parseFloat(String(lead.x_studio_mensalidade_com_eap)))
        : null;
      const responsavelNome = Array.isArray(lead.user_id) && lead.user_id.length > 1
        ? String(lead.user_id[1]).trim().substring(0, 255)
        : null;

      if (mensalidade !== null || mensalidadeEap !== null || responsavelNome !== null) {
        await db.execute(
          `UPDATE crm_leads SET mensalidade = ?, mensalidadeComEap = ?, responsavelNome = ? WHERE odooId = ?`,
          [mensalidade, mensalidadeEap, responsavelNome, lead.id]
        );
        updated++;
      }
    } catch (err) {
      errors++;
    }
  }

  console.log(`✅ Actualizadas: ${updated} leads`);
  console.log(`❌ Erros: ${errors}`);

  // Verify
  const [rows] = await db.execute(
    'SELECT COUNT(*) as total, COUNT(responsavelNome) as comResponsavel, COUNT(CASE WHEN mensalidade > 0 THEN 1 END) as comMensalidade FROM crm_leads'
  );
  console.log('📊 Resultado final:', rows[0]);

  await db.end();
}

main().catch(console.error);
