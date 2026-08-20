import xmlrpc from 'xmlrpc';
import fs from 'fs';

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

// Buscar todas as subscrições em progresso (3_progress)
console.log('A buscar subscrições activas (3_progress)...');
const subs = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'sale.order', 'search_read',
  [[['subscription_state', '=', '3_progress']]],
  { fields: ['partner_id', 'name', 'recurring_monthly', 'amount_total'], limit: 500 }
]);

// Agregar por cliente (pode haver múltiplas subscrições por cliente)
const clientesMap = new Map();
subs.forEach(s => {
  const pid = s.partner_id[0];
  const pname = s.partner_id[1];
  if (!clientesMap.has(pid)) {
    clientesMap.set(pid, {
      odooId: pid,
      nome: pname,
      subscricoes: [],
      mensalidadeTotal: 0,
    });
  }
  const c = clientesMap.get(pid);
  c.subscricoes.push(s.name);
  c.mensalidadeTotal += s.recurring_monthly || 0;
});

const clientes = [...clientesMap.values()];
console.log(`\nTotal de clientes activos (com subscrição em progresso): ${clientes.length}`);

// Buscar detalhes dos parceiros (NIF, email, etc.)
const partnerIds = clientes.map(c => c.odooId);
const partners = await rpcCall(objectClient, 'execute_kw', [
  ODOO_DB, uid, ODOO_API_KEY,
  'res.partner', 'search_read',
  [[['id', 'in', partnerIds]]],
  { fields: ['id', 'name', 'vat', 'email', 'phone', 'website', 'x_studio_nmero_colaboradores', 'x_studio_setor_atividade', 'x_studio_tipo_de_empresa', 'x_studio_nome_comercial', 'x_studio_periodicidade', 'x_studio_forma_de_pagamento'], limit: 500 }
]);

const partnersMap = new Map(partners.map(p => [p.id, p]));

// Combinar dados
const clientesCompletos = clientes.map(c => {
  const p = partnersMap.get(c.odooId) || {};
  return {
    odooId: c.odooId,
    nome: c.nome,
    nif: p.vat || null,
    email: p.email || null,
    telefone: p.phone || null,
    website: p.website || null,
    numColaboradores: p.x_studio_nmero_colaboradores || null,
    sector: p.x_studio_setor_atividade || null,
    tipoEmpresa: p.x_studio_tipo_de_empresa || null,
    nomeComercial: p.x_studio_nome_comercial || null,
    mensalidadeTotal: Math.round(c.mensalidadeTotal),
    subscricoes: c.subscricoes,
  };
}).sort((a, b) => a.nome.localeCompare(b.nome));

// Guardar em ficheiro JSON
fs.writeFileSync('/home/ubuntu/team24-website/odoo-clientes-activos.json', JSON.stringify(clientesCompletos, null, 2));
console.log('Ficheiro guardado: odoo-clientes-activos.json');

// Mostrar lista
console.log('\nLista de clientes activos:');
clientesCompletos.forEach((c, i) => {
  console.log(`  ${i+1}. [${c.odooId}] ${c.nome} | NIF: ${c.nif || '—'} | Mensalidade: ${c.mensalidadeTotal}€`);
});
