/**
 * Descarrega os CVs das candidaturas para entrega ao SharePoint da Team24.
 *
 * NAO escreve em client/public/ nem dentro do repositorio: sao documentos
 * pessoais. O destino e uma pasta fora do projecto.
 *
 * Organizacao: uma pasta por estado da candidatura; dentro, ficheiros
 * <data>_<id>_<nome do candidato>.<ext>, para os RH encontrarem.
 * Produz tambem um indice em CSV.
 */
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const DESTINO = process.env.DESTINO || 'C:/Users/Filipe/migracao-site/cvs-para-sharepoint';
const PARALELO = 4;

if (!process.env.DATABASE_URL) {
  console.error('sem DATABASE_URL');
  process.exit(1);
}
const u = new URL(process.env.DATABASE_URL);
u.search = '';
const con = await mysql.createConnection({ uri: u.toString() });

const [linhas] = await con.query(`
  SELECT c.id, c.nome, c.email, c.telefone, c.cvUrl, c.cvNome, c.estado,
         DATE_FORMAT(c.createdAt, '%Y-%m-%d') AS data,
         k.titulo AS vaga
  FROM candidaturas c
  LEFT JOIN carreiras k ON k.id = c.carreiraId
  WHERE c.cvUrl IS NOT NULL AND c.cvUrl <> ''
  ORDER BY c.createdAt
`);
await con.end();

console.log(`${linhas.length} CVs a descarregar -> ${DESTINO}\n`);

// Caracteres que o Windows e o SharePoint recusam em nomes de ficheiro
const PROIBIDOS = /[\\/:*?"<>|#%{}~&]/g;

function limpar(valor) {
  return String(valor || 'sem-nome')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // tirar acentos
    .replace(PROIBIDOS, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .replace(/[. ]+$/, '');           // Windows recusa terminar em ponto ou espaco
}

function extensaoReal(buf, nomeOriginal) {
  if (buf.slice(0, 4).toString('ascii') === '%PDF') return '.pdf';
  if (buf[0] === 0x50 && buf[1] === 0x4b) {
    return /\.docx?$/i.test(nomeOriginal || '') ? '.docx' : '.zip';
  }
  if (buf[0] === 0xd0 && buf[1] === 0xcf) return '.doc';
  if (buf[0] === 0xff && buf[1] === 0xd8) return '.jpg';
  if (buf[0] === 0x89 && buf.slice(1, 4).toString('ascii') === 'PNG') return '.png';
  return path.extname(nomeOriginal || '').toLowerCase() || '.bin';
}

fs.mkdirSync(DESTINO, { recursive: true });

const ok = [];
const falhas = [];
const divergentes = [];
let feitos = 0;

async function baixar(r) {
  const pasta = path.join(DESTINO, limpar(r.estado));
  fs.mkdirSync(pasta, { recursive: true });
  try {
    const resp = await fetch(r.cvUrl);
    if (!resp.ok) {
      falhas.push({ id: r.id, motivo: `HTTP ${resp.status}` });
      return;
    }
    const buf = Buffer.from(await resp.arrayBuffer());
    if (!buf.length) {
      falhas.push({ id: r.id, motivo: 'ficheiro vazio' });
      return;
    }

    const extOriginal = path.extname(r.cvNome || r.cvUrl).toLowerCase();
    const ext = extensaoReal(buf, r.cvNome || r.cvUrl);
    if (extOriginal && ext !== extOriginal && !(ext === '.jpg' && extOriginal === '.jpeg')) {
      divergentes.push({ id: r.id, diz: extOriginal, e: ext });
    }

    const base = `${r.data}_${String(r.id).padStart(6, '0')}_${limpar(r.nome)}`;
    let alvo = path.join(pasta, base + ext);
    let n = 1;
    while (fs.existsSync(alvo)) {
      n += 1;
      alvo = path.join(pasta, `${base}_${n}${ext}`);
    }

    fs.writeFileSync(alvo, buf);
    ok.push({
      ...r,
      ficheiro: path.relative(DESTINO, alvo).split(path.sep).join('/'),
      bytes: buf.length,
    });
  } catch (e) {
    falhas.push({ id: r.id, motivo: String(e.message).slice(0, 70) });
  } finally {
    feitos += 1;
    if (feitos % 50 === 0) console.log(`  ...${feitos}/${linhas.length}`);
  }
}

for (let i = 0; i < linhas.length; i += PARALELO) {
  await Promise.all(linhas.slice(i, i + PARALELO).map(baixar));
}

// Indice para os RH. Ponto e virgula porque e o que o Excel portugues espera,
// e BOM no inicio para os acentos aparecerem bem.
const cabecalho = 'id;data;estado;vaga;nome;email;telefone;ficheiro';
const corpo = ok.map(r =>
  [r.id, r.data, r.estado, r.vaga || '', r.nome || '', r.email || '', r.telefone || '', r.ficheiro]
    .map(v => `"${String(v).replace(/"/g, '""')}"`)
    .join(';')
);
fs.writeFileSync(
  path.join(DESTINO, 'indice-candidaturas.csv'),
  '\ufeff' + [cabecalho, ...corpo].join('\r\n'),
  'utf8'
);

const mb = ok.reduce((s, r) => s + r.bytes, 0) / 1048576;
console.log('\n=== RESULTADO ===');
console.log(`descarregados: ${ok.length}   falhas: ${falhas.length}   total: ${mb.toFixed(1)} MB`);
const porEstado = ok.reduce((a, r) => { a[r.estado] = (a[r.estado] || 0) + 1; return a; }, {});
for (const [e, n] of Object.entries(porEstado)) console.log(`   ${e.padEnd(12)} ${n}`);
if (divergentes.length) {
  console.log(`\n${divergentes.length} ficheiros com extensao errada (corrigida ao gravar):`);
  for (const d of divergentes.slice(0, 10)) console.log(`   id ${d.id}: dizia ${d.diz}, e ${d.e}`);
}
if (falhas.length) {
  console.log('\nFALHAS:');
  for (const f of falhas.slice(0, 15)) console.log(`   id ${f.id}: ${f.motivo}`);
}
console.log('\nindice: indice-candidaturas.csv');
