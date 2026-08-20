
require('dotenv').config();
const mysql2 = require('mysql2/promise');

async function main() {
  // Limpar o DATABASE_URL de parâmetros extra
  let url = process.env.DATABASE_URL || '';
  // Remover query string do URL para mysql2
  const urlObj = new URL(url);
  urlObj.search = '';
  const cleanUrl = urlObj.toString();

  const conn = await mysql2.createConnection({
    uri: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });

  // Empresas com contrato (estado = 'cliente' ou tipoCliente não nulo ou dataInicioContrato não nulo)
  const [empresas] = await conn.execute(`
    SELECT 
      e.id,
      e.nome,
      e.setor,
      e.dimensao,
      e.nif,
      e.website,
      e.morada,
      e.cidade,
      COALESCE(e.pais, 'Portugal') AS pais,
      e.telefone,
      e.email,
      e.estado,
      e.tipoCliente,
      e.dataInicioContrato,
      e.dataRenovacaoContrato,
      e.valorContrato,
      e.notasInternas,
      e.createdAt
    FROM crm_empresas e
    WHERE e.estado = 'cliente'
       OR e.dataInicioContrato IS NOT NULL
       OR e.tipoCliente IS NOT NULL
    ORDER BY e.nome
  `);

  // Contactos dessas empresas
  const empresaIds = empresas.map(e => e.id);
  let contactos = [];
  if (empresaIds.length > 0) {
    const placeholders = empresaIds.map(() => '?').join(',');
    const [rows] = await conn.execute(`
      SELECT 
        c.id,
        c.empresaId,
        c.nome,
        c.cargo,
        c.email,
        c.telefone,
        c.linkedin,
        c.decisor,
        c.notas,
        c.createdAt
      FROM crm_contactos c
      WHERE c.empresaId IN (${placeholders})
      ORDER BY c.empresaId, c.nome
    `, empresaIds);
    contactos = rows;
  }

  console.log(JSON.stringify({ empresas, contactos }));
  await conn.end();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
