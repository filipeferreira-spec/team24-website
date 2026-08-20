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

// 1. Ver modelos disponíveis relacionados com contratos/subscriptions
console.log('=== A verificar modelos de contratos ===');
const modelos = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'ir.model', 'search_read',
  [[['model', 'like', 'contract'], ['model', 'not like', 'account']]],
  { fields: ['name', 'model'], limit: 20 }
]);
console.log('Modelos de contrato:', modelos.map(m => `${m.model} (${m.name})`).join('\n  '));

// 2. Ver modelos de subscrição
const modelosSub = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'ir.model', 'search_read',
  [[['model', 'like', 'subscri']]],
  { fields: ['name', 'model'], limit: 20 }
]);
console.log('\nModelos de subscrição:', modelosSub.map(m => `${m.model} (${m.name})`).join('\n  '));

// 3. Ver campos customizados (x_studio) em res.partner
const camposCustom = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'ir.model.fields', 'search_read',
  [[['model', '=', 'res.partner'], ['name', 'like', 'x_']]],
  { fields: ['name', 'field_description', 'ttype'], limit: 50 }
]);
console.log('\nCampos customizados em res.partner:');
camposCustom.forEach(f => console.log(`  ${f.name} (${f.field_description}) [${f.ttype}]`));

// 4. Tentar buscar contratos activos (se o modelo existir)
if (modelos.length > 0) {
  const modeloContrato = modelos[0].model;
  console.log(`\n=== Contratos no modelo ${modeloContrato} ===`);
  try {
    const camposContrato = await rpcCall(objectClient, 'execute_kw', [
      ODOO_DB, uid, ODOO_API_KEY,
      'ir.model.fields', 'search_read',
      [[['model', '=', modeloContrato]]],
      { fields: ['name', 'field_description', 'ttype'], limit: 30 }
    ]);
    console.log('Campos:', camposContrato.map(f => `${f.name} (${f.field_description})`).join('\n  '));
    
    const totalContratos = await rpcCall(objectClient, 'execute_kw', [
      ODOO_DB, uid, ODOO_API_KEY,
      modeloContrato, 'search_count',
      [[]],
    ]);
    console.log('Total contratos:', totalContratos);
  } catch(e) {
    console.log('Erro ao aceder contratos:', e.message?.substring(0, 100));
  }
}
