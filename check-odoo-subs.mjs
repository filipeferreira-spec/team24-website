import xmlrpc from 'xmlrpc';

const ODOO_URL = process.env.ODOO_URL;
const ODOO_DB = process.env.ODOO_DB;
const ODOO_USER = process.env.ODOO_USER;
const ODOO_API_KEY = process.env.ODOO_API_KEY;

function rpcCall(client, method, params) {
  return new Promise((resolve, reject) => {
    client.methodCall(method, params, (err, val) => {
      if (err) reject(err);
      else resolve(val);
    });
  });
}

const url = new URL(ODOO_URL);
const commonClient = xmlrpc.createSecureClient({ host: url.hostname, port: 443, path: '/xmlrpc/2/common' });
const objectClient = xmlrpc.createSecureClient({ host: url.hostname, port: 443, path: '/xmlrpc/2/object' });

const uid = await rpcCall(commonClient, 'authenticate', [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]);

// 1. Verificar sale.order (encomendas/contratos de venda) por cliente
console.log('=== Encomendas de venda por estado ===');
const ordensEstado = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'sale.order', 'read_group',
  [[]], 
  { fields: ['state'], groupby: ['state'] }
]);
ordensEstado.forEach(g => console.log(`  ${g.state}: ${g.state_count}`));

// 2. Clientes com encomendas confirmadas (sale) activas
console.log('\n=== Clientes com encomendas confirmadas ===');
const clientesComOrdens = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'sale.order', 'read_group',
  [[['state', 'in', ['sale', 'done']]]],
  { fields: ['partner_id'], groupby: ['partner_id'] }
]);
console.log('Clientes únicos com encomendas activas:', clientesComOrdens.length);

// 3. Buscar campos customizados de res.partner que possam indicar estado de cliente
console.log('\n=== Clientes com x_studio_tipo_de_empresa ===');
const tiposEmpresa = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'res.partner', 'read_group',
  [[['is_company', '=', true], ['active', '=', true]]],
  { fields: ['x_studio_tipo_de_empresa'], groupby: ['x_studio_tipo_de_empresa'] }
]);
tiposEmpresa.forEach(g => console.log(`  "${g.x_studio_tipo_de_empresa || '(vazio)'}": ${g.x_studio_tipo_de_empresa_count}`));

// 4. Verificar campos de subscrição em sale.order
console.log('\n=== Campos de sale.order ===');
const camposSale = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'ir.model.fields', 'search_read',
  [[['model', '=', 'sale.order'], ['name', 'in', ['subscription_state', 'is_subscription', 'recurring_monthly', 'date_start', 'date_end', 'state', 'partner_id']]]],
  { fields: ['name', 'field_description', 'ttype'], limit: 20 }
]);
camposSale.forEach(f => console.log(`  ${f.name} (${f.field_description}) [${f.ttype}]`));

// 5. Subscrições activas (sale.order com subscription_state)
console.log('\n=== Subscrições activas ===');
try {
  const subsActivas = await rpcCall(objectClient, 'execute_kw', [
    ODOO_DB, uid, ODOO_API_KEY,
    'sale.order', 'read_group',
    [[['subscription_state', 'in', ['1_draft', '3_progress', '4_paused']]]],
    { fields: ['subscription_state', 'partner_id'], groupby: ['subscription_state'] }
  ]);
  subsActivas.forEach(g => console.log(`  ${g.subscription_state}: ${g.subscription_state_count}`));
  
  // Total de clientes únicos com subscrição activa
  const clientesSubs = await rpcCall(objectClient, 'execute_kw', [
    ODOO_DB, uid, ODOO_API_KEY,
    'sale.order', 'search_read',
    [[['subscription_state', '=', '3_progress']]],
    { fields: ['partner_id', 'name', 'date_start', 'recurring_monthly'], limit: 300 }
  ]);
  const clientesUnicos = new Map();
  clientesSubs.forEach(s => {
    const pid = s.partner_id[0];
    const pname = s.partner_id[1];
    if (!clientesUnicos.has(pid)) clientesUnicos.set(pid, { nome: pname, subs: [] });
    clientesUnicos.get(pid).subs.push(s.name);
  });
  console.log(`\nClientes únicos com subscrição em progresso: ${clientesUnicos.size}`);
  let i = 1;
  for (const [pid, info] of clientesUnicos) {
    console.log(`  ${i++}. [${pid}] ${info.nome}`);
    if (i > 50) { console.log('  ... (truncado)'); break; }
  }
} catch(e) {
  console.log('Erro subscrições:', e.message?.substring(0, 200));
}
