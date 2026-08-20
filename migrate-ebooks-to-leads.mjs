/**
 * migrate-ebooks-to-leads.mjs
 * 
 * Move registos de ebooks, formulários e outras leads do website
 * que estão incorrectamente em crm_empresas para crm_leads.
 * 
 * Padrões identificados:
 * - [EBOOK] Download: ...
 * - [Webinar] ...
 * - [Contacto] ...
 * - [Formulário] ...
 * - Qualquer nome que começa com [ (indica origem de formulário/campanha)
 */

import mysql from 'mysql2/promise';

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error('DATABASE_URL não definida');
  process.exit(1);
}

const m = DB_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
if (!m) {
  console.error('URL de BD inválida:', DB_URL);
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: m[3], port: +m[4], user: m[1], password: m[2], database: m[5],
  ssl: { rejectUnauthorized: true }
});

console.log('✓ Ligado à BD');

// 1. Identificar registos a migrar
const [candidatos] = await conn.execute(`
  SELECT id, nome, email, telefone, website, notas, createdAt
  FROM crm_empresas
  WHERE nome LIKE '[%]%'
     OR nome LIKE '%[EBOOK]%'
     OR nome LIKE '%Download%'
     OR nome LIKE '%Webinar%'
     OR nome LIKE '%COPSOQ%'
     OR nome LIKE '%Formulário%'
     OR nome LIKE '%Formulario%'
  ORDER BY nome
`);

console.log(`\n📋 Encontrados ${candidatos.length} registos a migrar:\n`);
candidatos.forEach(r => console.log(`  [${r.id}] ${r.nome} — ${r.email || '(sem email)'}`));

if (candidatos.length === 0) {
  console.log('\n✓ Nada a migrar.');
  await conn.end();
  process.exit(0);
}

// 2. Para cada registo, criar uma lead correspondente
let migrados = 0;
let erros = 0;

for (const empresa of candidatos) {
  try {
    // Determinar a fase e o título da lead
    const titulo = empresa.nome;
    
    // Extrair nome da pessoa do título se possível (ex: "— Filipe Ferreira")
    const nomePessoa = titulo.match(/—\s*(.+)$/)?.[1]?.trim() || null;
    
    // Construir notas com email e telefone da empresa
    const notasExtra = [];
    if (empresa.email) notasExtra.push(`Email: ${empresa.email}`);
    if (empresa.telefone) notasExtra.push(`Tel: ${empresa.telefone}`);
    if (empresa.notas) notasExtra.push(empresa.notas);
    const notasFinais = notasExtra.join(' | ') || null;

    // Criar a lead
    await conn.execute(`
      INSERT INTO crm_leads (
        titulo, fase, ativo, origem,
        notas, responsavelNome, createdAt, updatedAt, ultimaActividade
      ) VALUES (?, 'leads', 1, 'website', ?, ?, ?, ?, ?)
    `, [
      titulo,
      notasFinais,
      nomePessoa,
      empresa.createdAt || new Date(),
      empresa.createdAt || new Date(),
      empresa.createdAt || new Date(),
    ]);

    // Apagar da tabela de empresas
    await conn.execute('DELETE FROM crm_empresas WHERE id = ?', [empresa.id]);
    
    migrados++;
    console.log(`  ✓ Migrado: ${empresa.nome}`);
  } catch (err) {
    erros++;
    console.error(`  ✗ Erro ao migrar [${empresa.id}] ${empresa.nome}:`, err.message);
  }
}

console.log(`\n✅ Migração concluída: ${migrados} migrados, ${erros} erros`);
await conn.end();
