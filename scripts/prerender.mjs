/**
 * Pre-geracao de paginas para os robots de pesquisa.
 *
 * Abre cada pagina num Chrome a serio, espera o React terminar, e guarda
 * APENAS o interior do <div id="root">, comprimido.
 *
 * Guardar so o fragmento (e nao a pagina inteira) e deliberado: o modelo da
 * pagina passa a vir do build actual, com os enderecos correctos dos ficheiros
 * JavaScript. Se guardassemos a pagina completa, cada reconstrucao do site
 * tornaria estas paginas obsoletas.
 */
import puppeteer from 'puppeteer-core';
import { gzipSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const BASE     = process.env.PRERENDER_BASE || 'http://127.0.0.1:3100';
const SAIDA    = path.resolve('prerendered');
const CHROME   = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const RAIZ     = path.resolve('.');

// Rotas privadas: NUNCA pre-gerar. Guardariam dados de candidatos e do CRM
// em ficheiros servidos publicamente.
const PROIBIDAS = [/^\/backoffice/, /^\/crm/, /^\/questionario/];

const ESTATICAS = [
  '/', '/blog', '/casos', '/casos-v2', '/contacto', '/parceiros', '/carreiras',
  '/quem-somos', '/imprensa', '/plataforma', '/suporte', '/aviso-legal', '/termos',
  '/recursos', '/formacoes', '/ebooks', '/equipa', '/servicos',
  '/servicos/psicologia', '/servicos/juridico', '/servicos/social',
  '/servicos/financeiro', '/servicos/nutricao', '/agendar', '/academia',
  '/catalogo-formacao', '/copsoq', '/roi', '/opiniao', '/404',
];

function slugsDeFicheiro(rel) {
  try {
    const txt = fs.readFileSync(path.join(RAIZ, rel), 'utf8');
    return [...new Set([...txt.matchAll(/slug:\s*"([^"]+)"/g)].map(m => m[1]))];
  } catch { return []; }
}

async function construirRotas() {
  const rotas = new Set(ESTATICAS);
  for (const s of slugsDeFicheiro('client/src/lib/blogData.ts'))    rotas.add(`/blog/${s}`);
  for (const s of slugsDeFicheiro('client/src/lib/opiniaoData.ts')) rotas.add(`/opiniao/${s}`);

  if (process.env.DATABASE_URL) {
    const u = new URL(process.env.DATABASE_URL); u.search = '';
    const c = await mysql.createConnection({ uri: u.toString() });
    try {
      const [car] = await c.query('SELECT slug FROM carreiras WHERE slug IS NOT NULL');
      for (const r of car) rotas.add(`/carreiras/${r.slug}`);
      // so os que sao mesmo artigos publicados: dos 30 recursos, 20 sao ebooks,
      // guias e ferramentas, e gerariam paginas inexistentes
      const [art] = await c.query("SELECT id FROM recursos WHERE publicado = 1 AND tipo = 'artigo'");
      for (const r of art) rotas.add(`/blog/artigo/${r.id}`);
    } finally { await c.end(); }
  }

  return [...rotas].filter(r => !PROIBIDAS.some(p => p.test(r))).sort();
}

const nomeFicheiro = r => (r === '/' ? 'index' : r.replace(/^\//, '').replace(/\//g, '__')) + '.html.gz';

const rotas = await construirRotas();
console.log(`${rotas.length} paginas a pre-gerar (${BASE})\n`);

fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

const navegador = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const manifesto = {};
let ok = 0, falhas = 0, bytesTotal = 0;

for (const rota of rotas) {
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: 1366, height: 900 });
  try {
    await pagina.goto(BASE + rota, { waitUntil: 'networkidle2', timeout: 45000 });

    // Esperar que o React deixe de mostrar o ecra de carregamento vazio
    await pagina.waitForFunction(
      () => {
        const r = document.getElementById('root');
        return r && r.innerText.trim().length > 200;
      },
      { timeout: 30000 }
    );

    // Percorrer a pagina: dispara contadores animados e conteudo que so
    // carrega quando entra no ecra
    await pagina.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 800));

    const dados = await pagina.evaluate(() => ({
      html: document.getElementById('root').innerHTML,
      texto: document.getElementById('root').innerText.replace(/\s+/g, ' ').trim(),
      titulo: document.title,
      descricao: document.querySelector('meta[name="description"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      h1: document.querySelectorAll('h1').length,
      links: document.querySelectorAll('a[href]').length,
    }));

    const gz = gzipSync(Buffer.from(dados.html, 'utf8'), { level: 9 });
    const ficheiro = nomeFicheiro(rota);
    fs.writeFileSync(path.join(SAIDA, ficheiro), gz);
    bytesTotal += gz.length;

    manifesto[rota] = {
      ficheiro,
      titulo: dados.titulo,
      descricao: dados.descricao,
      canonical: dados.canonical,
      bytesHtml: Buffer.byteLength(dados.html),
      bytesGz: gz.length,
      bytesTexto: dados.texto.length,
      h1: dados.h1,
      links: dados.links,
    };
    ok++;
    console.log(
      `  OK   ${rota.padEnd(46)} texto ${String(dados.texto.length).padStart(6)}B  ` +
      `h1:${dados.h1} links:${String(dados.links).padStart(3)}  gz ${(gz.length/1024).toFixed(1)}KB`
    );
  } catch (e) {
    falhas++;
    console.log(`  FALHA ${rota.padEnd(46)} ${e.message.split('\n')[0].slice(0, 70)}`);
  } finally {
    await pagina.close();
  }
}

await navegador.close();

fs.writeFileSync(path.join(SAIDA, 'manifesto.json'), JSON.stringify(manifesto, null, 2));
console.log(`\n${ok} paginas OK, ${falhas} falhas. Total comprimido: ${(bytesTotal/1024/1024).toFixed(2)} MB`);
if (falhas > 0) process.exitCode = 1;
