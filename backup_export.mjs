import mysql from 'mysql2/promise';
import fs from 'fs';
import { readFileSync } from 'fs';

// Obter DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL não encontrada');
  process.exit(1);
}

// Parsear URL
const url = new URL(dbUrl);
const host = url.hostname;
const port = parseInt(url.port) || 3306;
const user = url.username;
const password = url.password;
const database = url.pathname.replace('/', '').split('?')[0];

console.log(`Conectando a ${host}:${port}/${database}...`);

const conn = await mysql.createConnection({
  host, port, user, password, database,
  ssl: { rejectUnauthorized: false }
});

const [tables] = await conn.query('SHOW TABLES');
const tableKey = Object.keys(tables[0])[0];
const tableNames = tables.map(r => r[tableKey]);

console.log(`Tabelas encontradas: ${tableNames.join(', ')}`);

let sql = `-- Dump SQL completo: team24-website\n-- Data: ${new Date().toISOString()}\n-- Base de dados: ${database}\n\nSET FOREIGN_KEY_CHECKS=0;\n\n`;

for (const table of tableNames) {
  // CREATE TABLE
  const [[createRow]] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
  const createSql = createRow['Create Table'];
  sql += `-- Tabela: ${table}\nDROP TABLE IF EXISTS \`${table}\`;\n${createSql};\n\n`;

  // INSERT DATA
  const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
  if (rows.length > 0) {
    const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
    const values = rows.map(row => {
      const vals = Object.values(row).map(v => {
        if (v === null) return 'NULL';
        if (typeof v === 'number') return v;
        if (v instanceof Date) return `'${v.toISOString().replace('T', ' ').replace('Z', '')}'`;
        return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
      });
      return `(${vals.join(', ')})`;
    }).join(',\n');
    sql += `INSERT INTO \`${table}\` (${cols}) VALUES\n${values};\n\n`;
    console.log(`  ${table}: ${rows.length} registos`);
  } else {
    console.log(`  ${table}: vazia`);
  }
}

sql += `SET FOREIGN_KEY_CHECKS=1;\n`;

const outputPath = '/home/ubuntu/team24_database_dump_latest.sql';
fs.writeFileSync(outputPath, sql);
console.log(`\nDump guardado em: ${outputPath} (${(sql.length / 1024).toFixed(1)} KB)`);

await conn.end();
