/**
 * Reescreve /media/... -> /media/... no codigo e na base de dados,
 * e corrige as extensoes que nao correspondem ao conteudo real.
 *
 * Por omissao corre em SIMULACAO. Para aplicar mesmo: --aplicar
 */
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const APLICAR = process.argv.includes('--aplicar');
const RAIZ    = path.resolve('.');
const MEDIA   = path.join(RAIZ, 'client/public/media');
const EXTS    = ['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.mjs'];

const relatorio = JSON.parse(fs.readFileSync(path.join(RAIZ, 'media-relatorio.json'), 'utf8'));
const renomear = new Map(relatorio.mentirosas.map(m => [m.chave, m.chave.replace(/\.[^.]+$/, m.e)]));

console.log(APLICAR ? '*** A APLICAR ALTERACOES ***\n' : '=== SIMULACAO (nada e alterado) ===\n');

// --- 1. Extensoes mentirosas ---------------------------------------------
console.log(`1) Extensoes a corrigir: ${renomear.size}`);
for (const [de, para] of renomear) {
  console.log(`   ${de}\n     -> ${para}`);
  if (APLICAR) {
    const orig = path.join(MEDIA, de), novo = path.join(MEDIA, para);
    if (fs.existsSync(orig)) fs.renameSync(orig, novo);
  }
}

// --- 2. Ficheiros de codigo ----------------------------------------------
function varrer(dir, achados = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'prerendered', 'media'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varrer(p, achados);
    else if (EXTS.some(x => e.name.endsWith(x))) achados.push(p);
  }
  return achados;
}

let ficheirosTocados = 0, subsCodigo = 0;
const detalhe = [];
for (const f of varrer(RAIZ)) {
  const antes = fs.readFileSync(f, 'utf8');
  if (!antes.includes('/manus-storage/')) continue;
  let depois = antes.replace(/\/manus-storage\/([A-Za-z0-9._-]+)/g, (_m, nome) =>
    '/media/' + (renomear.get(nome) || nome)
  );
  const n = (antes.match(/\/manus-storage\//g) || []).length;
  subsCodigo += n; ficheirosTocados++;
  detalhe.push({ f: path.relative(RAIZ, f), n });
  if (APLICAR) fs.writeFileSync(f, depois);
}
console.log(`\n2) Ficheiros de codigo: ${ficheirosTocados} ficheiros, ${subsCodigo} substituicoes`);
for (const d of detalhe.sort((a, b) => b.n - a.n).slice(0, 12))
  console.log(`   ${String(d.n).padStart(4)}x  ${d.f}`);
if (detalhe.length > 12) console.log(`   ... e mais ${detalhe.length - 12} ficheiros`);

// --- 3. Base de dados -----------------------------------------------------
let subsDb = 0;
const detalheDb = [];
if (process.env.DATABASE_URL) {
  const u = new URL(process.env.DATABASE_URL); u.search = '';
  const c = await mysql.createConnection({ uri: u.toString() });
  try {
    const [base] = await c.query('SELECT DATABASE() d');
    console.log(`\n3) Base de dados: ${base[0].d}`);
    if (!/verif_hoje|teste|local/.test(base[0].d)) {
      console.log('   !! A base nao parece ser uma copia local. ABORTADO por seguranca.');
      process.exit(1);
    }
    const [cols] = await c.query(
      `SELECT TABLE_NAME t, COLUMN_NAME col FROM information_schema.columns
       WHERE table_schema = DATABASE() AND DATA_TYPE IN ('varchar','text','longtext','mediumtext')`
    );
    for (const { t, col } of cols) {
      const [[{ n }]] = await c.query(
        `SELECT COUNT(*) n FROM \`${t}\` WHERE \`${col}\` LIKE '%manus-storage%'`
      );
      if (!n) continue;
      subsDb += n; detalheDb.push({ t, col, n });
      if (APLICAR) {
        await c.query(
          `UPDATE \`${t}\` SET \`${col}\` = REPLACE(\`${col}\`, '/manus-storage/', '/media/')
           WHERE \`${col}\` LIKE '%manus-storage%'`
        );
        for (const [de, para] of renomear)
          await c.query(`UPDATE \`${t}\` SET \`${col}\` = REPLACE(\`${col}\`, ?, ?) WHERE \`${col}\` LIKE ?`,
            [de, para, `%${de}%`]);
      }
    }
    for (const d of detalheDb) console.log(`   ${String(d.n).padStart(4)} linhas  ${d.t}.${d.col}`);
    if (!detalheDb.length) console.log('   (nenhuma)');
  } finally { await c.end(); }
}

console.log(`\n=== TOTAL: ${subsCodigo} no codigo + ${subsDb} linhas na base de dados ===`);
if (!APLICAR) console.log('Nada foi alterado. Para aplicar: node scripts/reescrever-media.mjs --aplicar');
