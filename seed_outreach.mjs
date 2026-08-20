import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config({ path: "/home/ubuntu/team24-website/.env", override: false });

const DB_URL = process.env.DATABASE_URL;
const ODOO_URL = process.env.ODOO_URL || "https://team24.thinkopen.solutions";
const ODOO_DB = process.env.ODOO_DB || "team24";
const ODOO_USER = process.env.ODOO_USER || "marketing@team24.pt";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";

// ─── DB ──────────────────────────────────────────────────────────────────────
const conn = await mysql.createConnection(DB_URL);
console.log("✅ DB conectada");

// ─── ODOO XML-RPC ────────────────────────────────────────────────────────────
async function odooRpc(endpoint, body) {
  const res = await fetch(`${ODOO_URL}/xmlrpc/2/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
  });
  return res.text();
}

async function getUid() {
  const xml = await odooRpc("common", `<?xml version='1.0'?><methodCall><methodName>authenticate</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><string>${ODOO_USER}</string></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><struct/></value></param>
  </params></methodCall>`);
  const m = xml.match(/<int>(\d+)<\/int>/);
  if (!m) throw new Error("Odoo auth failed: " + xml.slice(0, 200));
  return parseInt(m[1]);
}

// ─── CONTEÚDO DOS EMAILS ─────────────────────────────────────────────────────
const EMAIL_GERAL = [
  {
    ordem: 1, diaCadencia: 0, assunto: "Vale um dia de férias",
    corpo: `Olá {{nome_contacto}},

Imagine que hoje podia oferecer um dia de férias a todos os colaboradores da {{empresa}}.

Seria, sem dúvida, bem recebido. Mas seria suficiente?

Um dia de descanso pode aliviar o cansaço imediato. Pode dar uma pausa. Pode criar um momento positivo.

Mas se, quando a pessoa regressa, encontra a mesma pressão, os mesmos conflitos, a mesma falta de segurança psicológica, a mesma dificuldade em pedir ajuda e a mesma sensação de desgaste, o problema continua lá. É aqui que muitas empresas falham na retenção.

Tentam compensar o desgaste com benefícios isolados, quando aquilo que as pessoas procuram é algo mais profundo: confiança, equilíbrio, liderança saudável, apoio real e uma cultura onde seja possível trabalhar sem se perder pelo caminho.

Na TEAM24 ajudamos empresas a passar de acções pontuais para uma estratégia estruturada de saúde mental, prevenção de riscos psicossociais e retenção de talento.

Cada equipa precisa de respostas diferentes.
Talvez a {{empresa}} já tenha benefícios.
Talvez já tenha iniciativas de bem-estar.
Talvez já fale de saúde mental.

A pergunta é outra:
A saúde mental já faz parte da estratégia de retenção da {{empresa}}?

Se fizer sentido, gostaríamos de lhe oferecer uma conversa de 5 minutos para perceber onde a {{empresa}} está hoje e que acções poderiam gerar impacto real nas suas equipas.

Filipe Ferreira
TEAM24
Tel: 926 941 137

Agende aqui uma conversa breve: https://team24.pt/agendar`
  },
  {
    ordem: 2, diaCadencia: 4, assunto: "Re: Vale um dia de férias",
    corpo: `Olá {{nome_contacto}},

Enviei-lhe um email há alguns dias com uma reflexão sobre benefícios e retenção de talento.

Não sei se chegou a ler. Por isso deixo apenas uma pergunta:

Nos últimos 12 meses, houve na {{empresa}} algum sinal de alerta, absentismo, baixas prolongadas, conflitos internos, dificuldade em reter pessoas?

Se sim, provavelmente já sabe que um benefício isolado não resolve. O que resolve é perceber o que está por baixo.

É exactamente isso que fazemos na TEAM24. Começamos sempre por medir, antes de propor qualquer solução.

Teria 5 minutos para uma conversa rápida?

Escolha um horário aqui: https://team24.pt/agendar

Filipe Ferreira
TEAM24 | 926 941 137`
  },
  {
    ordem: 3, diaCadencia: 9, assunto: "O que encontrámos quando medimos",
    corpo: `Olá {{nome_contacto}},

Deixe-me partilhar o que acontece quando uma empresa decide parar de adivinhar e começa a medir.

Quando a equipa de RH do Grupo Salvador Caetano nos contactou, tinham a sensação de que algo não estava bem. As iniciativas de bem-estar existiam, as pessoas não se queixavam abertamente, mas o absentismo subia e a rotatividade também.

Aplicámos a nossa Avaliação de Riscos Psicossociais. Um diagnóstico estruturado que mede, por departamento, os factores que afectam o bem-estar, a motivação e o desempenho. O relatório revelou três padrões que a gestão desconhecia completamente: sobrecarga crónica numa área específica, falta de apoio da liderança de proximidade e ausência de canais seguros para pedir ajuda.

Com esse mapa, implementámos um programa à medida. Ao fim de 12 meses: redução de 23% no absentismo e uma melhoria significativa nos índices de satisfação interna.

Não sei se a {{empresa}} tem os mesmos padrões. Provavelmente tem os seus próprios. Mas sem medir, é impossível saber.

Se quiser perceber como este diagnóstico funciona e o que poderia revelar na {{empresa}}, estou disponível para uma conversa de 5 minutos.

Agendar aqui: https://team24.pt/agendar

Filipe Ferreira
TEAM24 | 926 941 137

P.S. Posso enviar o relatório de ROI que mostra o retorno financeiro médio de um programa de saúde mental empresarial. Basta responder a este email.`
  },
  {
    ordem: 4, diaCadencia: 16, assunto: "Fecho este assunto, mas deixo uma porta aberta",
    corpo: `Olá {{nome_contacto}},

Escrevi-lhe algumas vezes nas últimas semanas. Como não obtive resposta, assumo que não é o momento certo para a {{empresa}} e respeito isso completamente.

Não voltarei a contactar.

Mas deixo uma nota final, porque acho que é honesta:

Os problemas de saúde mental nas equipas raramente desaparecem sozinhos. Tendem a crescer silenciosamente, até que se tornam urgentes. E quando se tornam urgentes, custam muito mais a resolver do que se tivessem sido abordados cedo.

Se daqui a uns meses a situação mudar, ou se surgir um momento em que faça sentido conversar, estamos aqui.

Pode sempre agendar em https://team24.pt/agendar, sem pressão, sem compromisso.

Foi um prazer tentar chegar até si.

Filipe Ferreira
TEAM24 — EAP Portugal
filipe.ferreira@team24.pt | 926 941 137
https://team24.pt`
  },
];

const EMAIL_NP4552 = [
  {
    ordem: 1, diaCadencia: 0, assunto: "Vale um dia de férias",
    corpo: `Olá {{nome_contacto}},

Imagine que hoje podia oferecer um dia de férias a todos os colaboradores da {{empresa}}.

Seria bem recebido, claro. Mas a {{empresa}} já percebeu há muito que as pessoas precisam de mais do que isso. A certificação NP4552 que conquistaram é prova disso.

O que me traz até si é uma pergunta diferente.

Tenho falado com muitas organizações que, como a {{empresa}}, fizeram esse caminho de formalizar o compromisso com o bem-estar. E o que ouço com frequência é isto: "sabemos que estamos a fazer coisas certas, mas não conseguimos ver o impacto nos números."

Absentismo que não baixa como esperavam. Pessoas que saem mesmo assim. Lideranças que continuam sobrecarregadas. Não por falta de vontade, mas porque a certificação resolve a estrutura, não necessariamente o que está por baixo.

Na TEAM24 trabalhamos exactamente nessa camada. Começamos sempre por perceber o que os dados dizem sobre o estado real das equipas, antes de propor seja o que for.

Não sei se faz sentido para a {{empresa}} neste momento. Mas se fizer, teria gosto em ter uma conversa de 5 minutos.

Filipe Ferreira
TEAM24
Tel: 926 941 137

Agende aqui: https://team24.pt/agendar`
  },
  {
    ordem: 2, diaCadencia: 4, assunto: "Re: Vale um dia de férias",
    corpo: `Olá {{nome_contacto}},

Escrevi-lhe há uns dias. Não sei se teve oportunidade de ler, por isso vou ser breve.

Há uma coisa que me ficou na cabeça depois de enviar o email anterior.

A {{empresa}} tem a NP4552. Isso não é pouco, é mesmo raro em Portugal. Mas a certificação mede processos. O que raramente fica medido é o que as pessoas sentem no dia a dia, o que as faz ficar ou ir embora, o que as faz pedir baixa ou aguentar em silêncio.

A pergunta que deixo é simples: desde que obtiveram a certificação NP4552, conseguem ver diferença nos números de absentismo, rotatividade ou bem-estar declarado?

Se sim, adorava perceber como chegaram lá.

Se não, talvez valha a pena conversar.

Escolha um horário aqui: https://team24.pt/agendar

Filipe Ferreira
TEAM24 | 926 941 137`
  },
  {
    ordem: 3, diaCadencia: 9, assunto: "O que encontrámos quando medimos",
    corpo: `Olá {{nome_contacto}},

Deixe-me contar-lhe o que aconteceu com uma empresa que, tal como a {{empresa}}, já tinha o compromisso com o bem-estar bem estabelecido.

O Grupo Salvador Caetano tinha iniciativas, tinha cultura, tinha intenção. Mas o absentismo continuava a subir. A equipa de RH sabia que algo não estava bem, só não sabia o quê.

Quando nos pediram ajuda, não começámos por propor um programa. Começámos por medir. Aplicámos um diagnóstico de riscos psicossociais que analisa, departamento a departamento, o que está a afectar as pessoas. O que encontrámos surpreendeu a própria gestão: sobrecarga crónica numa área que ninguém tinha identificado, chefias de proximidade sem ferramentas para apoiar as equipas, e uma cultura onde pedir ajuda ainda era visto como fraqueza.

Com esse mapa, trabalhámos em conjunto durante 12 meses. O resultado foi uma redução de 23% no absentismo.

Não sei o que encontraríamos na {{empresa}}. Provavelmente algo diferente. Mas sem medir, é impossível saber.

Se quiser perceber como funciona este diagnóstico, estou disponível para uma conversa curta.

Agendar aqui: https://team24.pt/agendar

Filipe Ferreira
TEAM24 | 926 941 137

P.S. Posso enviar o relatório de ROI com o retorno financeiro médio deste tipo de programa. Basta responder a este email.`
  },
  {
    ordem: 4, diaCadencia: 16, assunto: "Fecho este assunto, mas deixo uma porta aberta",
    corpo: `Olá {{nome_contacto}},

Escrevi-lhe três vezes nas últimas semanas. Como não recebi resposta, parto do princípio que não é o momento certo, e respeito isso.

Não voltarei a contactar.

Só queria deixar uma última nota, porque acho que é honesta.

Organizações que chegaram à NP4552 fizeram um percurso que a maioria ainda não começou. Têm algo que é difícil de construir: a decisão de levar o bem-estar a sério. O que por vezes falta é alguém de fora que ajude a perceber se o que está a ser feito está realmente a chegar às pessoas.

Se daqui a uns meses o contexto mudar e fizer sentido conversar, estamos aqui.

Pode agendar quando quiser em https://team24.pt/agendar.

Obrigado pelo tempo.

Filipe Ferreira
TEAM24 — EAP Portugal
filipe.ferreira@team24.pt | 926 941 137
https://team24.pt`
  },
];

// ─── 1. SEED SEQUÊNCIAS ───────────────────────────────────────────────────────
console.log("\n📧 A verificar sequências existentes...");
const [seqRows] = await conn.query("SELECT id, nome FROM outreach_sequencias");
console.log(`   Sequências existentes: ${seqRows.length}`);

let seqGeralId, seqNP4552Id;

if (seqRows.length === 0) {
  // Criar sequência Geral
  const [r1] = await conn.query(
    "INSERT INTO outreach_sequencias (nome, descricao, segmento, ativa, createdAt) VALUES (?, ?, ?, 1, ?)",
    ["Outreach Geral — Vale um Dia de Férias", "Sequência de 4 emails para empresas em geral", "geral", new Date().toISOString().slice(0,19).replace('T',' ')]
  );
  seqGeralId = r1.insertId;
  for (const e of EMAIL_GERAL) {
    await conn.query(
      "INSERT INTO outreach_emails (sequenciaId, ordem, diaCadencia, assunto, corpo, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [seqGeralId, e.ordem, e.diaCadencia, e.assunto, e.corpo, new Date().toISOString().slice(0,19).replace('T',' ')]
    );
  }
  console.log(`   ✅ Sequência Geral criada (ID: ${seqGeralId}) com 4 emails`);

  // Criar sequência NP4552
  const [r2] = await conn.query(
    "INSERT INTO outreach_sequencias (nome, descricao, segmento, ativa, createdAt) VALUES (?, ?, ?, 1, ?)",
    ["Outreach NP4552 — Certificação Saúde Mental", "Sequência de 4 emails para empresas com certificação NP4552:2022", "np4552", new Date().toISOString().slice(0,19).replace('T',' ')]
  );
  seqNP4552Id = r2.insertId;
  for (const e of EMAIL_NP4552) {
    await conn.query(
      "INSERT INTO outreach_emails (sequenciaId, ordem, diaCadencia, assunto, corpo, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      [seqNP4552Id, e.ordem, e.diaCadencia, e.assunto, e.corpo, new Date().toISOString().slice(0,19).replace('T',' ')]
    );
  }
  console.log(`   ✅ Sequência NP4552 criada (ID: ${seqNP4552Id}) com 4 emails`);
} else {
  console.log(`   ℹ️  Sequências já existem, a verificar emails...`);
  for (const seq of seqRows) {
    const [emailRows] = await conn.query("SELECT id FROM outreach_emails WHERE sequenciaId = ?", [seq.id]);
    console.log(`   "${seq.nome}" (ID: ${seq.id}): ${emailRows.length} emails`);
    if (seq.nome.toLowerCase().includes("geral")) seqGeralId = seq.id;
    if (seq.nome.toLowerCase().includes("np4552")) seqNP4552Id = seq.id;
  }
}

// ─── 2. IMPORTAR CONTACTOS NP4552 DO ODOO ───────────────────────────────────
console.log("\n🏢 A importar empresas NP4552 do Odoo...");

const uid = await getUid();
console.log(`   Odoo UID: ${uid}`);

// Buscar empresas com tag 31 (NP4552) que tenham email
const searchXml = await odooRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
  <param><value><string>${ODOO_DB}</string></value></param>
  <param><value><int>${uid}</int></value></param>
  <param><value><string>${ODOO_API_KEY}</string></value></param>
  <param><value><string>res.partner</string></value></param>
  <param><value><string>search</string></value></param>
  <param><value><array><data><value><array><data>
    <value><array><data><value><string>category_id</string></value><value><string>in</string></value><value><array><data><value><int>31</int></value></data></array></value></data></array></value>
    <value><array><data><value><string>is_company</string></value><value><string>=</string></value><value><boolean>1</boolean></value></data></array></value>
  </data></array></value></data></array></value></param>
  <param><value><struct><member><name>limit</name><value><int>500</int></value></member></struct></value></param>
</params></methodCall>`);

const idMatches = Array.from(searchXml.matchAll(/<int>(\d+)<\/int>/g));
const partnerIds = idMatches.map(m => parseInt(m[1])).filter(id => id > 0);
console.log(`   Encontradas ${partnerIds.length} empresas NP4552 no Odoo`);

if (partnerIds.length === 0) {
  console.log("   ⚠️  Nenhuma empresa encontrada. Verificar tag ID 31 no Odoo.");
} else {
  // Ler dados das empresas (nome, email, cidade, telefone)
  const idsXml = partnerIds.map(id => `<value><int>${id}</int></value>`).join("");
  const readXml = await odooRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>res.partner</string></value></param>
    <param><value><string>read</string></value></param>
    <param><value><array><data><value><array><data>${idsXml}</data></array></value></data></array></value></param>
    <param><value><struct><member><name>fields</name><value><array><data>
      <value><string>id</string></value>
      <value><string>name</string></value>
      <value><string>email</string></value>
      <value><string>phone</string></value>
      <value><string>city</string></value>
      <value><string>customer_rank</string></value>
    </data></array></value></member></struct></value></param>
  </params></methodCall>`);

  // Parse do XML de resposta — cada partner é um struct com members
  // Usar regex para extrair blocos de struct
  const structBlocks = readXml.match(/<struct>([\s\S]*?)<\/struct>/g) || [];
  
  let importados = 0;
  let jaExistiam = 0;
  let semEmail = 0;
  const empresasImportadas = [];

  for (const block of structBlocks) {
    const getId = block.match(/<name>id<\/name>\s*<value><int>(\d+)<\/int>/);
    const getName = block.match(/<name>name<\/name>\s*<value><string>(.*?)<\/string>/);
    const getEmail = block.match(/<name>email<\/name>\s*<value><string>(.*?)<\/string>/);
    const getPhone = block.match(/<name>phone<\/name>\s*<value><(?:string|boolean)>(.*?)<\/(?:string|boolean)>/);
    const getCity = block.match(/<name>city<\/name>\s*<value><(?:string|boolean)>(.*?)<\/(?:string|boolean)>/);
    const getCustRank = block.match(/<name>customer_rank<\/name>\s*<value><int>(\d+)<\/int>/);

    const odooId = getId ? parseInt(getId[1]) : 0;
    const nome = getName ? getName[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'") : "";
    const email = getEmail ? getEmail[1] : "";
    const cidade = getCity ? getCity[1] : "";
    const isCliente = getCustRank ? parseInt(getCustRank[1]) > 0 : false;

    if (!nome) continue;
    // Sem email: importar mesmo assim, para preencher manualmente no backoffice
    // if (!email) { semEmail++; continue; }

    // Verificar se já existe (por odooPartnerId ou email se tiver)
    let existing = [];
    if (odooId) {
      const [r] = await conn.query("SELECT id FROM outreach_contactos WHERE odooPartnerId = ?", [odooId]);
      existing = r;
    } else if (email) {
      const [r] = await conn.query("SELECT id FROM outreach_contactos WHERE email = ?", [email]);
      existing = r;
    }
    if (existing.length > 0) { jaExistiam++; continue; }

    await conn.query(
      "INSERT INTO outreach_contactos (nome, email, empresa, cargo, segmento, odooPartnerId, ativo, descartado, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?)",
      [nome, email, nome, isCliente ? "Cliente" : "", "np4552", odooId || null, new Date().toISOString().slice(0,19).replace('T',' ')]
    );
    importados++;
    empresasImportadas.push({ nome, email, cidade, isCliente });
  }

  console.log(`\n   ✅ ${importados} contactos NP4552 importados`);
  console.log(`   ℹ️  ${jaExistiam} já existiam`);
  console.log(`   ⚠️  ${semEmail} sem email (não importados)`);
  
  if (empresasImportadas.length > 0) {
    console.log("\n   Primeiras 10 empresas importadas:");
    empresasImportadas.slice(0, 10).forEach(e => {
      console.log(`   • ${e.nome} (${e.email})${e.isCliente ? " [CLIENTE]" : ""}`);
    });
    if (empresasImportadas.length > 10) {
      console.log(`   ... e mais ${empresasImportadas.length - 10}`);
    }
  }
}

// ─── 3. VERIFICAR TOTAIS ─────────────────────────────────────────────────────
console.log("\n📊 Totais na BD:");
const [totalSeq] = await conn.query("SELECT COUNT(*) as n FROM outreach_sequencias");
const [totalEmails] = await conn.query("SELECT COUNT(*) as n FROM outreach_emails");
const [totalContactos] = await conn.query("SELECT COUNT(*) as n FROM outreach_contactos");
const [totalNP4552] = await conn.query("SELECT COUNT(*) as n FROM outreach_contactos WHERE segmento = 'np4552'");
console.log(`   Sequências: ${totalSeq[0].n}`);
console.log(`   Emails: ${totalEmails[0].n}`);
console.log(`   Contactos total: ${totalContactos[0].n}`);
console.log(`   Contactos NP4552: ${totalNP4552[0].n}`);

await conn.end();
console.log("\n✅ Seed concluído.");
