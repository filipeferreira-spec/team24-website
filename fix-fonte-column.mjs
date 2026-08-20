import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Mapeamento: texto nas notas → valor normalizado da coluna fonte
const FONTE_MAP = [
  { pattern: 'PME Excelência', value: 'pme_excelencia' },
  { pattern: 'ISO45001', value: 'iso45001' },
  { pattern: 'NP4552', value: 'np4552' },
  { pattern: 'Câmaras Municipais', value: 'camaras' },
  { pattern: 'Certificadas IPAC', value: 'ipac' },
  { pattern: '>1000 Trabalhadores', value: '1000_funcionarios' },
  { pattern: '1000 Maiores Nacionais', value: '1000_funcionarios' },
  { pattern: 'Maiores Empresas PT', value: 'maiores_empresas' },
  { pattern: 'Melhores Empresas PT', value: 'maiores_empresas' },
  { pattern: 'CRM Forum', value: 'crm_forum' },
];

// Buscar todos os registos com notas
const [rows] = await conn.execute(
  'SELECT id, notas FROM crm_prospecting WHERE notas IS NOT NULL AND notas != \'\''
);

console.log(`Total de registos com notas: ${rows.length}`);

let updated = 0;
let noMatch = 0;

for (const row of rows) {
  const notas = row.notas || '';
  let fonteEncontrada = null;

  // Extrair a parte "Fonte: ..." das notas
  const fonteMatch = notas.match(/Fonte:\s*([^|]+)/);
  if (fonteMatch) {
    const fonteTexto = fonteMatch[1].trim();
    // Pegar a primeira fonte (pode haver múltiplas separadas por vírgula)
    const primeiraFonte = fonteTexto.split(',')[0].trim();
    
    for (const { pattern, value } of FONTE_MAP) {
      if (primeiraFonte.includes(pattern)) {
        fonteEncontrada = value;
        break;
      }
    }
  }

  if (fonteEncontrada) {
    await conn.execute('UPDATE crm_prospecting SET fonte = ? WHERE id = ?', [fonteEncontrada, row.id]);
    updated++;
  } else {
    noMatch++;
    if (noMatch <= 5) {
      console.log(`Sem match para id=${row.id}, notas="${notas.substring(0, 100)}"`);
    }
  }
}

console.log(`\nActualizados: ${updated}`);
console.log(`Sem match: ${noMatch}`);

// Verificar distribuição final
const [dist] = await conn.execute(
  'SELECT fonte, COUNT(*) as total FROM crm_prospecting GROUP BY fonte ORDER BY total DESC'
);
console.log('\nDistribuição por fonte:');
dist.forEach(r => console.log(`  ${r.fonte}: ${r.total}`));

await conn.end();
console.log('\nConcluído!');
