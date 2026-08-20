import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('A actualizar coluna fonte em lote...');

// UPDATE em lote usando CASE WHEN para cada fonte
// Ordem importa: mais específico primeiro
const updates = [
  { pattern: '%PME Excelência%', value: 'pme_excelencia' },
  { pattern: '%ISO45001%', value: 'iso45001' },
  { pattern: '%NP4552%', value: 'np4552' },
  { pattern: '%Câmaras Municipais%', value: 'camaras' },
  { pattern: '%Certificadas IPAC%', value: 'ipac' },
  { pattern: '%>1000 Trabalhadores%', value: '1000_funcionarios' },
  { pattern: '%1000 Maiores Nacionais%', value: '1000_funcionarios' },
  { pattern: '%Maiores Empresas PT%', value: 'maiores_empresas' },
  { pattern: '%Melhores Empresas PT%', value: 'maiores_empresas' },
  { pattern: '%CRM Forum%', value: 'crm_forum' },
];

for (const { pattern, value } of updates) {
  const [result] = await conn.execute(
    'UPDATE crm_prospecting SET fonte = ? WHERE notas LIKE ? AND fonte = ?',
    [value, pattern, 'linkedin_agente']
  );
  console.log(`  ${value}: ${result.affectedRows} registos`);
}

// Verificar distribuição final
const [dist] = await conn.execute(
  'SELECT fonte, COUNT(*) as total FROM crm_prospecting GROUP BY fonte ORDER BY total DESC'
);
console.log('\nDistribuição por fonte:');
dist.forEach(r => console.log(`  ${r.fonte}: ${r.total}`));

await conn.end();
console.log('\nConcluído!');
