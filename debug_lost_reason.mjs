import { readFileSync } from "fs";
import { config } from "dotenv";
config({ path: "/home/ubuntu/team24-website/.env" });

const ODOO_URL = process.env.ODOO_URL;
const ODOO_DB = process.env.ODOO_DB;
const ODOO_USER = process.env.ODOO_USER;
const ODOO_API_KEY = process.env.ODOO_API_KEY;

async function odooXmlRpc(endpoint, body) {
  const res = await fetch(`${ODOO_URL}/xmlrpc/2/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
  });
  return res.text();
}

async function main() {
  // Auth
  const authXml = await odooXmlRpc("common", `<?xml version='1.0'?><methodCall><methodName>authenticate</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><string>${ODOO_USER}</string></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><struct/></value></param>
  </params></methodCall>`);
  const uidMatch = authXml.match(/<int>(\d+)<\/int>/);
  const uid = parseInt(uidMatch[1]);
  console.log("UID:", uid);

  // Buscar 3 leads perdidos
  const searchXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>crm.lead</string></value></param>
    <param><value><string>search</string></value></param>
    <param><value><array><data><value><array><data>
      <value><array><data><value><string>active</string></value><value><string>=</string></value><value><boolean>0</boolean></value></data></array></value>
    </data></array></value></data></array></value></param>
    <param><value><struct><member><name>limit</name><value><int>5</int></value></member></struct></value></param>
  </params></methodCall>`);

  const idMatches = [...searchXml.matchAll(/<int>(\d+)<\/int>/g)];
  const leadIds = idMatches.map(m => parseInt(m[1])).filter(id => id > 0);
  console.log("Lead IDs:", leadIds);

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
      <value><string>lost_reason_id</string></value>
    </data></array></value></member></struct></value></param>
  </params></methodCall>`);

  // Mostrar o XML raw em torno do lost_reason_id
  const idx = readXml.indexOf("lost_reason_id");
  if (idx >= 0) {
    console.log("\n=== XML em torno de lost_reason_id ===");
    console.log(readXml.substring(idx - 10, idx + 500));
  } else {
    console.log("Campo lost_reason_id não encontrado no XML");
    console.log("Primeiros 2000 chars do XML:");
    console.log(readXml.substring(0, 2000));
  }
}

main().catch(console.error);
