import mysql from 'mysql2/promise';
import fs from 'fs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const odooClientes = JSON.parse(fs.readFileSync('/home/ubuntu/team24-website/odoo-clientes-activos.json', 'utf8'));

// Normalizar nome para comparação
function normNome(n) {
  return (n || '').toLowerCase()
    .replace(/[,\.\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(lda|s\.?a\.?|s\.?a\.?s\.?|unipessoal|limitada|sociedade|sgps|sa|lda\.?)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Buscar todas as empresas do CRM
const [empresas] = await conn.execute('SELECT id, odooId, nome FROM crm_empresas ORDER BY nome');

// Criar mapa de nomes normalizados do Odoo
const odooNormMap = new Map();
odooClientes.forEach(c => {
  odooNormMap.set(normNome(c.nome), c);
});

// Fazer match
let matched = 0;
let notMatched = 0;
const matchedEmpresas = [];
const notMatchedOdoo = [];

// Verificar quais empresas do CRM correspondem a clientes Odoo
const crmNormMap = new Map();
empresas.forEach(e => crmNormMap.set(normNome(e.nome), e));

for (const odooC of odooClientes) {
  const norm = normNome(odooC.nome);
  if (crmNormMap.has(norm)) {
    matched++;
    matchedEmpresas.push({ crmId: crmNormMap.get(norm).id, odooId: odooC.odooId, nome: odooC.nome, mensalidade: odooC.mensalidadeTotal });
  } else {
    notMatched++;
    notMatchedOdoo.push(odooC);
  }
}

console.log(`=== CORRESPONDÊNCIA POR NOME ===`);
console.log(`Odoo clientes activos: ${odooClientes.length}`);
console.log(`Correspondências encontradas: ${matched}`);
console.log(`Clientes Odoo SEM correspondência no CRM: ${notMatched}`);

console.log(`\n=== Clientes Odoo SEM correspondência no CRM (${notMatched}) ===`);
notMatchedOdoo.forEach((c, i) => console.log(`  ${i+1}. [${c.odooId}] ${c.nome} | ${c.mensalidadeTotal}€/mês`));

console.log(`\n=== Empresas CRM que SÃO clientes Odoo activos (${matched}) ===`);
matchedEmpresas.forEach((m, i) => console.log(`  ${i+1}. CRM#${m.crmId} = Odoo#${m.odooId} | ${m.nome} | ${m.mensalidade}€/mês`));

// Guardar resultado
fs.writeFileSync('/home/ubuntu/team24-website/match-resultado.json', JSON.stringify({
  matched: matchedEmpresas,
  notMatchedOdoo,
  totalOdoo: odooClientes.length,
  totalCRM: empresas.length,
}, null, 2));
console.log('\nGuardado em match-resultado.json');

await conn.end();
