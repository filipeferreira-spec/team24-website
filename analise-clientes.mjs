import mysql from 'mysql2/promise';
import fs from 'fs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Carregar clientes activos do Odoo
const odooClientes = JSON.parse(fs.readFileSync('/home/ubuntu/team24-website/odoo-clientes-activos.json', 'utf8'));
const odooIds = new Set(odooClientes.map(c => c.odooId));
const odooNomes = new Map(odooClientes.map(c => [c.odooId, c.nome]));

console.log(`=== ODOO: ${odooClientes.length} clientes activos (subscrição em progresso) ===\n`);

// 1. Verificar crm_empresas
const [empresas] = await conn.execute('SELECT id, odooId, nome, clienteAtivo FROM crm_empresas ORDER BY nome');
console.log(`=== CRM Empresas: ${empresas.length} registos ===`);

// Quantas têm odooId
const comOdooId = empresas.filter(e => e.odooId);
const semOdooId = empresas.filter(e => !e.odooId);
console.log(`  Com odooId: ${comOdooId.length}`);
console.log(`  Sem odooId: ${semOdooId.length}`);

// Quantas têm odooId que corresponde a cliente activo no Odoo
const clientesActivos = comOdooId.filter(e => odooIds.has(e.odooId));
const clientesInactivos = comOdooId.filter(e => !odooIds.has(e.odooId));
console.log(`  Com odooId E cliente activo no Odoo: ${clientesActivos.length}`);
console.log(`  Com odooId MAS não activo no Odoo: ${clientesInactivos.length}`);

// Clientes Odoo que NÃO estão em crm_empresas
const odooIdsEmCRM = new Set(comOdooId.map(e => e.odooId));
const odooSemCRM = odooClientes.filter(c => !odooIdsEmCRM.has(c.odooId));
console.log(`\n  Clientes Odoo activos SEM registo em crm_empresas: ${odooSemCRM.length}`);
if (odooSemCRM.length > 0 && odooSemCRM.length <= 20) {
  odooSemCRM.forEach(c => console.log(`    - [${c.odooId}] ${c.nome}`));
}

// 2. Verificar crm_leads com fases de cliente
const [leadsCliente] = await conn.execute(
  "SELECT id, titulo, empresa, fase, empresaId FROM crm_leads WHERE fase IN ('won','contratos_renovados','contratos_terminados','proposta_adjudicada','renovacoes_pendente') ORDER BY fase, titulo"
);
console.log(`\n=== CRM Leads em fases de cliente: ${leadsCliente.length} ===`);
const faseCount = {};
leadsCliente.forEach(l => { faseCount[l.fase] = (faseCount[l.fase] || 0) + 1; });
Object.entries(faseCount).forEach(([f, c]) => console.log(`  ${f}: ${c}`));

// 3. Resumo e recomendação
console.log('\n=== RESUMO ===');
console.log(`Odoo clientes activos: ${odooClientes.length}`);
console.log(`CRM Empresas total: ${empresas.length}`);
console.log(`CRM Empresas que são clientes Odoo activos: ${clientesActivos.length}`);
console.log(`CRM Empresas que NÃO são clientes activos: ${empresas.length - clientesActivos.length}`);
console.log(`Leads em fases de cliente: ${leadsCliente.length}`);

// 4. Guardar lista de empresas a manter (clientes activos Odoo)
const empresasAManter = clientesActivos.map(e => e.id);
console.log(`\nEmpresas a manter como "clientes" (têm subscrição activa no Odoo): ${empresasAManter.length}`);

// Empresas sem odooId (não sabemos se são clientes)
console.log(`\nEmpresas sem odooId (origem desconhecida): ${semOdooId.length}`);
if (semOdooId.length <= 10) {
  semOdooId.forEach(e => console.log(`  - [${e.id}] ${e.nome}`));
}

await conn.end();
