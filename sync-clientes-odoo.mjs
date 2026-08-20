import mysql from 'mysql2/promise';
import fs from 'fs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const matchData = JSON.parse(fs.readFileSync('/home/ubuntu/team24-website/match-resultado.json', 'utf8'));
const odooClientes = JSON.parse(fs.readFileSync('/home/ubuntu/team24-website/odoo-clientes-activos.json', 'utf8'));

console.log('=== PASSO 1: Marcar todos como clienteAtivo = false ===');
const [reset] = await conn.execute('UPDATE crm_empresas SET clienteAtivo = 0');
console.log(`  Reset: ${reset.affectedRows} registos`);

console.log('\n=== PASSO 2: Marcar os 128 clientes activos Odoo ===');
// Usar os CRM IDs únicos do match (pode haver duplicados como Universidade Nova)
const crmIdsActivos = [...new Set(matchData.matched.map(m => m.crmId))];
console.log(`  IDs únicos a marcar como activos: ${crmIdsActivos.length}`);

// Actualizar também o odooId correcto (o novo ID do Odoo)
let marcados = 0;
for (const m of matchData.matched) {
  await conn.execute(
    'UPDATE crm_empresas SET clienteAtivo = 1, odooId = ? WHERE id = ?',
    [m.odooId, m.crmId]
  );
  marcados++;
}
console.log(`  Marcados como activos: ${marcados} registos (${crmIdsActivos.length} empresas únicas)`);

function mapSegmento(tipo) {
  if (!tipo) return 'pme';
  const t = tipo.toLowerCase();
  if (t.includes('pública') || t.includes('publica') || t.includes('público') || t.includes('publico')) return 'setor_publico';
  if (t.includes('multinacional')) return 'multinacional';
  if (t.includes('grande')) return 'grande_empresa';
  if (t.includes('ong') || t.includes('associação') || t.includes('fundação')) return 'ong';
  return 'pme';
}

console.log('\n=== PASSO 3: Criar os 43 clientes Odoo em falta ===');
const now = new Date();
let criados = 0;

for (const c of matchData.notMatchedOdoo) {
  const odooInfo = odooClientes.find(o => o.odooId === c.odooId);
  if (!odooInfo) continue;

  // Verificar se já existe por odooId (por precaução)
  const [exists] = await conn.execute('SELECT id FROM crm_empresas WHERE odooId = ?', [c.odooId]);
  if (exists.length > 0) {
    await conn.execute('UPDATE crm_empresas SET clienteAtivo = 1 WHERE odooId = ?', [c.odooId]);
    console.log(`  Já existe (odooId ${c.odooId}): ${c.nome} — marcado como activo`);
    continue;
  }

  await conn.execute(
    `INSERT INTO crm_empresas 
     (odooId, nome, nif, email, telefone, website, numColaboradores, sector, segmento, valorMensalidade, clienteAtivo, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [
      c.odooId,
      odooInfo.nome,
      odooInfo.nif || null,
      odooInfo.email || null,
      odooInfo.telefone || null,
      odooInfo.website || null,
      odooInfo.numColaboradores || null,
      odooInfo.sector || null,
      mapSegmento(odooInfo.tipoEmpresa),
      odooInfo.mensalidadeTotal || 0,
      now,
      now,
    ]
  );
  criados++;
  console.log(`  Criado: [${c.odooId}] ${odooInfo.nome} | ${odooInfo.mensalidadeTotal}€/mês`);
}
console.log(`\n  Total criados: ${criados}`);

// Verificação final
const [totalActivos] = await conn.execute('SELECT COUNT(*) as c FROM crm_empresas WHERE clienteAtivo = 1');
const [totalInactivos] = await conn.execute('SELECT COUNT(*) as c FROM crm_empresas WHERE clienteAtivo = 0 OR clienteAtivo IS NULL');
const [totalGeral] = await conn.execute('SELECT COUNT(*) as c FROM crm_empresas');

console.log('\n=== RESULTADO FINAL ===');
console.log(`  Total empresas: ${totalGeral[0].c}`);
console.log(`  Clientes activos: ${totalActivos[0].c}`);
console.log(`  Não activos (ex-clientes/outros): ${totalInactivos[0].c}`);

await conn.end();
