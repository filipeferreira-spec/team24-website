/**
 * Gera o sitemap.xml a partir das paginas realmente pre-geradas,
 * em vez de uma lista escrita a mao que se desactualiza.
 */
import fs from 'node:fs';
import path from 'node:path';

const SITE = process.env.SITE_URL || 'https://www.team24.pt';
const MANIFESTO = path.resolve('prerendered/manifesto.json');
const SAIDA = path.resolve('client/public/sitemap.xml');

// Fora do sitemap: paginas que nao devem ser indexadas
const EXCLUIR = [
  /^\/404$/,        // pagina de erro
  /^\/demo$/,       // landing de conversao, bloqueada no robots.txt
  /^\/casos-v2$/,   // duplicado de /casos
  /^\/backoffice/, /^\/crm/, /^\/questionario/,
];

if (!fs.existsSync(MANIFESTO)) {
  console.error('Nao ha manifesto de pre-geracao. Corre primeiro scripts/prerender.mjs');
  process.exit(1);
}

const manifesto = JSON.parse(fs.readFileSync(MANIFESTO, 'utf8'));
const rotas = Object.keys(manifesto)
  .filter(r => !EXCLUIR.some(p => p.test(r)))
  .sort();

// Prioridade: a raiz vale mais; paginas de topo mais do que artigos
function prioridade(r) {
  if (r === '/') return '1.0';
  if (r.split('/').length === 2) return '0.8';
  return '0.6';
}
function frequencia(r) {
  if (r === '/' || r === '/blog' || r === '/carreiras' || r === '/opiniao') return 'weekly';
  return 'monthly';
}

const hoje = (process.env.SITEMAP_DATE || new Date().toISOString()).slice(0, 10);

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  rotas.map(r =>
    '  <url>\n' +
    `    <loc>${SITE}${r === '/' ? '/' : r}</loc>\n` +
    `    <lastmod>${hoje}</lastmod>\n` +
    `    <changefreq>${frequencia(r)}</changefreq>\n` +
    `    <priority>${prioridade(r)}</priority>\n` +
    '  </url>\n'
  ).join('') +
  '</urlset>\n';

fs.writeFileSync(SAIDA, xml, 'utf8');
console.log(`sitemap.xml gerado: ${rotas.length} paginas (de ${Object.keys(manifesto).length} pre-geradas)`);
console.log(`excluidas: ${Object.keys(manifesto).length - rotas.length}`);
