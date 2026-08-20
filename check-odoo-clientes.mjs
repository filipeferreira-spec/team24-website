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
const commonClient = xmlrpc.createSecureClient({
  host: url.hostname,
  port: 443,
  path: '/xmlrpc/2/common',
});
const objectClient = xmlrpc.createSecureClient({
  host: url.hostname,
  port: 443,
  path: '/xmlrpc/2/object',
});

// Autenticar
console.log('A autenticar no Odoo...');
const uid = await rpcCall(commonClient, 'authenticate', [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]);
console.log('UID:', uid);

// Buscar clientes (is_customer=true, active=true)
// No Odoo, clientes são res.partner com customer_rank > 0
console.log('\nA buscar clientes activos...');

// Primeiro, ver quantos existem com customer_rank > 0
const totalClientes = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'res.partner', 'search_count',
  [[['customer_rank', '>', 0], ['active', '=', true], ['is_company', '=', true]]],
]);
console.log('Total de empresas clientes (customer_rank > 0):', totalClientes);

// Buscar lista completa de clientes
const clientes = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'res.partner', 'search_read',
  [[['customer_rank', '>', 0], ['active', '=', true], ['is_company', '=', true]]],
  { fields: ['id', 'name', 'vat', 'email', 'phone', 'website', 'customer_rank'], limit: 500 }
]);

console.log(`\nClientes encontrados: ${clientes.length}`);
console.log('\nLista de clientes:');
clientes.forEach((c, i) => {
  console.log(`  ${i+1}. [${c.id}] ${c.name} | NIF: ${c.vat || '—'} | rank: ${c.customer_rank} | estado: ${c.x_studio_estado_do_contrato || '—'}`);
});

// Ver campos disponíveis para perceber o estado do contrato
console.log('\n--- A verificar campos disponíveis em res.partner ---');
const fields = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'res.partner', 'fields_get',
  [],
  { attributes: ['string', 'type'] }
]);
const fieldNames = Object.keys(fields).filter(k => 
  k.includes('estado') || k.includes('contrato') || k.includes('contract') || 
  k.includes('active') || k.includes('client') || k.includes('customer') ||
  k.includes('subscription') || k.includes('assinatura')
);
console.log('Campos relevantes:', fieldNames.map(k => `${k} (${fields[k].string})`).join('\n  '));
