/**
 * Descarrega para dentro do site todos os ficheiros servidos pelo proxy
 * /manus-storage/ da Manus.
 *
 * NAO altera codigo nem base de dados - so descarrega e verifica.
 * A reescrita das referencias e um passo separado, feito depois de ver os numeros.
 */
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const ORIGEM  = process.env.ORIGEM || 'https://team24.pt';
const DESTINO = path.resolve('client/public/media');
const RAIZ    = path.resolve('.');
const PARALELO = 5;

// --- 1. Reunir todas as referencias --------------------------------------
function varrerFicheiros(dir, exts, achados = new Set()) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' ||
        e.name === 'prerendered' || e.name === 'media') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varrerFicheiros(p, exts, achados);
    else if (exts.some(x => e.name.endsWith(x))) {
      const txt = fs.readFileSync(p, 'utf8');
      for (const m of txt.matchAll(/\/manus-storage\/([A-Za-z0-9._-]+)/g)) achados.add(m[1]);
    }
  }
  return achados;
}

const chaves = varrerFicheiros(RAIZ, ['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.json', '.mjs']);
const doCodigo = chaves.size;

if (process.env.DATABASE_URL) {
  const u = new URL(process.env.DATABASE_URL); u.search = '';
  const c = await mysql.createConnection({ uri: u.toString() });
  try {
    const [cols] = await c.query(
      `SELECT TABLE_NAME t, COLUMN_NAME col FROM information_schema.columns
       WHERE table_schema = DATABASE() AND DATA_TYPE IN ('varchar','text','longtext','mediumtext')`
    );
    for (const { t, col } of cols) {
      const [linhas] = await c.query(
        `SELECT \`${col}\` v FROM \`${t}\` WHERE \`${col}\` LIKE '%manus-storage%'`
      );
      for (const l of linhas)
        for (const m of String(l.v).matchAll(/\/manus-storage\/([A-Za-z0-9._-]+)/g)) chaves.add(m[1]);
    }
  } finally { await c.end(); }
}

const lista = [...chaves].sort();
console.log(`${lista.length} ficheiros a descarregar (${doCodigo} do codigo, ${lista.length - doCodigo} so na base de dados)\n`);

// --- 2. Assinaturas de ficheiro (armadilha 6: extensoes mentirosas) ------
const ASSINATURAS = [
  { tipo: 'png',  ext: '.png',  bytes: [0x89, 0x50, 0x4e, 0x47] },
  { tipo: 'jpg',  ext: '.jpg',  bytes: [0xff, 0xd8, 0xff] },
  { tipo: 'gif',  ext: '.gif',  bytes: [0x47, 0x49, 0x46, 0x38] },
  { tipo: 'pdf',  ext: '.pdf',  bytes: [0x25, 0x50, 0x44, 0x46] },
  { tipo: 'zip',  ext: '.zip',  bytes: [0x50, 0x4b, 0x03, 0x04] },
];
function tipoReal(buf) {
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP')
    return { tipo: 'webp', ext: '.webp' };
  if (buf.toString('utf8', 0, 200).trimStart().startsWith('<svg') ||
      buf.toString('utf8', 0, 200).trimStart().startsWith('<?xml'))
    return { tipo: 'svg', ext: '.svg' };
  for (const a of ASSINATURAS)
    if (a.bytes.every((b, i) => buf[i] === b)) return { tipo: a.tipo, ext: a.ext };
  return { tipo: 'desconhecido', ext: null };
}

// --- 3. Descarregar -------------------------------------------------------
fs.mkdirSync(DESTINO, { recursive: true });

const ok = [], falhas = [], mentirosas = [], grandes = [];
let feitos = 0;

async function descarregar(chave) {
  const alvo = path.join(DESTINO, chave);
  try {
    const r = await fetch(`${ORIGEM}/manus-storage/${chave}`, { redirect: 'follow' });
    if (!r.ok) { falhas.push({ chave, motivo: `HTTP ${r.status}` }); return; }
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length === 0) { falhas.push({ chave, motivo: 'ficheiro vazio' }); return; }

    fs.writeFileSync(alvo, buf);

    const extActual = path.extname(chave).toLowerCase();
    const real = tipoReal(buf);
    if (real.ext && real.ext !== extActual &&
        !(real.ext === '.jpg' && extActual === '.jpeg')) {
      mentirosas.push({ chave, diz: extActual, e: real.ext });
    }
    if (buf.length > 100 * 1024 * 1024) grandes.push({ chave, mb: (buf.length / 1048576).toFixed(1) });

    ok.push({ chave, bytes: buf.length, tipo: real.tipo });
  } catch (e) {
    falhas.push({ chave, motivo: e.message.slice(0, 60) });
  } finally {
    feitos++;
    if (feitos % 25 === 0) console.log(`  ...${feitos}/${lista.length}`);
  }
}

for (let i = 0; i < lista.length; i += PARALELO) {
  await Promise.all(lista.slice(i, i + PARALELO).map(descarregar));
}

// --- 4. Relatorio ---------------------------------------------------------
const totalBytes = ok.reduce((s, f) => s + f.bytes, 0);
console.log(`\n=== RESULTADO ===`);
console.log(`descarregados: ${ok.length}   falhas: ${falhas.length}`);
console.log(`espaco total : ${(totalBytes / 1048576).toFixed(2)} MB`);
console.log(`maior        : ${(Math.max(...ok.map(f => f.bytes), 0) / 1048576).toFixed(2)} MB`);

const porTipo = {};
for (const f of ok) porTipo[f.tipo] = (porTipo[f.tipo] || 0) + 1;
console.log(`por tipo real: ${Object.entries(porTipo).map(([k, v]) => `${k}=${v}`).join('  ')}`);

if (mentirosas.length) {
  console.log(`\n!! ARMADILHA 6 - ${mentirosas.length} extensoes mentirosas:`);
  for (const m of mentirosas.slice(0, 20)) console.log(`   ${m.chave}  diz ${m.diz} mas e ${m.e}`);
} else console.log(`\nextensoes: todas coerentes com o conteudo`);

if (grandes.length) {
  console.log(`\n!! ARMADILHA 7 - ${grandes.length} ficheiros acima de 100 MB (o GitHub recusa):`);
  for (const g of grandes) console.log(`   ${g.chave}  ${g.mb} MB`);
} else console.log(`nenhum ficheiro acima de 100 MB`);

if (falhas.length) {
  console.log(`\nFALHAS:`);
  for (const f of falhas.slice(0, 20)) console.log(`   ${f.chave}  ${f.motivo}`);
}

fs.writeFileSync(path.join(RAIZ, 'media-relatorio.json'),
  JSON.stringify({ ok, falhas, mentirosas, grandes }, null, 2));
console.log(`\nrelatorio detalhado: media-relatorio.json`);
