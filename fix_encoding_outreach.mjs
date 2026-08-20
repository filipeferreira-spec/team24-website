import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config({ path: "/home/ubuntu/team24-website/.env", override: false });

const DB_URL = process.env.DATABASE_URL;
const ODOO_URL = process.env.ODOO_URL || "https://team24.thinkopen.solutions";
const ODOO_DB = process.env.ODOO_DB || "team24";
const ODOO_USER = process.env.ODOO_USER || "marketing@team24.pt";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";

const conn = await mysql.createConnection(DB_URL);
console.log("✅ DB conectada");

// Buscar todos os contactos NP4552 com odooPartnerId
const [contactos] = await conn.query(
  "SELECT id, nome, odooPartnerId FROM outreach_contactos WHERE segmento = 'np4552' AND odooPartnerId IS NOT NULL"
);
console.log(`   ${contactos.length} contactos NP4552 a corrigir`);

// Buscar nomes correctos do Odoo com encoding correcto
async function odooRpc(endpoint, body) {
  const res = await fetch(`${ODOO_URL}/xmlrpc/2/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8" },
    body,
  });
  // Ler como buffer e converter para string com UTF-8
  const buf = await res.arrayBuffer();
  return new TextDecoder("utf-8").decode(buf);
}

async function getUid() {
  const xml = await odooRpc("common", `<?xml version='1.0' encoding='utf-8'?><methodCall><methodName>authenticate</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><string>${ODOO_USER}</string></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><struct/></value></param>
  </params></methodCall>`);
  const m = xml.match(/<int>(\d+)<\/int>/);
  if (!m) throw new Error("Odoo auth failed");
  return parseInt(m[1]);
}

const uid = await getUid();
console.log(`   Odoo UID: ${uid}`);

// Buscar em lotes de 50
const ids = contactos.map(c => c.odooPartnerId);
const idsXml = ids.map(id => `<value><int>${id}</int></value>`).join("");

const readXml = await odooRpc("object", `<?xml version='1.0' encoding='utf-8'?><methodCall><methodName>execute_kw</methodName><params>
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
    <value><string>phone</string></value>
    <value><string>city</string></value>
  </data></array></value></member></struct></value></param>
</params></methodCall>`);

// Parse por blocos de struct
const structBlocks = readXml.match(/<struct>([\s\S]*?)<\/struct>/g) || [];
console.log(`   ${structBlocks.length} registos recebidos do Odoo`);

let corrigidos = 0;
for (const block of structBlocks) {
  const getId = block.match(/<name>id<\/name>\s*<value><int>(\d+)<\/int>/);
  const getName = block.match(/<name>name<\/name>\s*<value><string>(.*?)<\/string>/s);
  const getEmail = block.match(/<name>email<\/name>\s*<value><string>(.*?)<\/string>/s);

  if (!getId || !getName) continue;
  const odooId = parseInt(getId[1]);
  const nome = getName[1]
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
  const email = getEmail ? getEmail[1].replace(/&amp;/g, "&").trim() : "";

  if (!nome) continue;

  await conn.query(
    "UPDATE outreach_contactos SET nome = ?, empresa = ?, email = ? WHERE odooPartnerId = ?",
    [nome, nome, email || "", odooId]
  );
  corrigidos++;
}

console.log(`\n✅ ${corrigidos} contactos corrigidos`);

// Mostrar amostra
const [amostra] = await conn.query(
  "SELECT nome, email FROM outreach_contactos WHERE segmento = 'np4552' ORDER BY nome LIMIT 15"
);
console.log("\nAmostra dos contactos corrigidos:");
amostra.forEach(c => console.log(`  • ${c.nome} (${c.email || "sem email"})`));

await conn.end();
console.log("\n✅ Concluído.");
