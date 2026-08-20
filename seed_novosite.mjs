import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const m = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
const conn = await mysql.createConnection({
  host: m[3], port: parseInt(m[4]), user: m[1], password: m[2],
  database: m[5].split("?")[0], ssl: { rejectUnauthorized: false },
});

// ─── EMAIL CLIENTES (fiel ao original do Odoo) ────────────────────────────────
const emailClientes = {
  assunto: "Mudámos para crescer.",
  corpo: `Olá Parceiro,

Quando olhamos para onde estamos hoje, pensamos em si.

Cada empresa que confiou em nós para cuidar das suas pessoas fez-nos crescer: em compreensão, em método e em capacidade de ajudar melhor. O novo site é o reflexo visível de tudo isso.

"O novo site é o reflexo de quem nos tornámos e de quem nos ajudou a chegar aqui. Mais claro, mais humano, mais Team24."
Equipa TEAM24

O que encontra no novo site:

- **Artigos de Opinião** — Perspectivas e reflexões sobre saúde mental e bem-estar nas organizações.
- **Blog** — Conteúdos práticos e actualizados para RH, líderes e equipas.
- **Mais conteúdos do seu sector** — Recursos específicos para a sua área, porque os desafios variam e as respostas também devem variar.

Vá lá. Explore. E se reconhecer algo do que construímos juntos, é porque está mesmo lá.

Com gratidão,
**Equipa Team24**

<a href="https://team24.pt" style="display:inline-block;background:#DB5C34;color:white;padding:12px 28px;text-decoration:none;font-weight:700;border-radius:2px;margin-top:8px;">Visitar o novo site →</a>`,
};

// ─── EMAIL NÃO CLIENTES (orientado para captar atenção e agendar reunião) ─────
const emailNaoClientes = {
  assunto: "Mudámos. E vale a pena ver porquê.",
  corpo: `Olá {{nome_contacto}},

O novo site da TEAM24 está no ar. Mas não lhe escrevo só por isso.

Aproveitamos este momento para fazer algo diferente: em vez de lhe mostrar o que mudou no site, queríamos mostrar o que pode mudar na {{empresa}}.

Somos uma empresa especializada em saúde mental no trabalho. Trabalhamos com mais de 200 empresas em Portugal para reduzir absentismo, melhorar retenção e criar equipas com mais equilíbrio e desempenho.

O que temos para si no novo site:

- **Casos reais** — como empresas como a sua transformaram os resultados ao cuidar das pessoas.
- **Recursos do seu sector** — conteúdos específicos para os desafios que a {{empresa}} provavelmente já conhece.
- **Ferramentas práticas** — para RH e líderes que querem agir, não apenas sensibilizar.

Mas o que vale mesmo a pena é uma conversa de 15 minutos.

Não para lhe vender nada. Para perceber se o que fazemos faz sentido para a {{empresa}} agora, ou daqui a seis meses.

<a href="https://team24.pt/agendar" style="display:inline-block;background:#DB5C34;color:white;padding:12px 28px;text-decoration:none;font-weight:700;border-radius:2px;margin-top:8px;">Agendar uma conversa →</a>

Filipe Ferreira
TEAM24 | 926 941 137`,
};

// ─── INSERIR SEQUÊNCIAS ───────────────────────────────────────────────────────
const now = new Date().toISOString().slice(0, 19).replace("T", " ");

// Sequência Clientes — Novo Site
const [seqClientesRes] = await conn.execute(
  `INSERT INTO outreach_sequencias (nome, descricao, ativa) VALUES (?, ?, 1)`,
  ["Novo Site — Clientes", "Email de lançamento do novo site para clientes actuais"]
);
const seqClientesId = seqClientesRes.insertId;

await conn.execute(
  `INSERT INTO outreach_emails (sequenciaId, ordem, assunto, corpo, diaCadencia) VALUES (?, 1, ?, ?, 0)`,
  [seqClientesId, emailClientes.assunto, emailClientes.corpo]
);

console.log(`✅ Sequência "Novo Site — Clientes" criada (ID: ${seqClientesId})`);

// Sequência Não Clientes — Novo Site
const [seqNaoClientesRes] = await conn.execute(
  `INSERT INTO outreach_sequencias (nome, descricao, ativa) VALUES (?, ?, 1)`,
  ["Novo Site — Não Clientes", "Email de lançamento do novo site para potenciais clientes com CTA de reunião"]
);
const seqNaoClientesId = seqNaoClientesRes.insertId;

await conn.execute(
  `INSERT INTO outreach_emails (sequenciaId, ordem, assunto, corpo, diaCadencia) VALUES (?, 1, ?, ?, 0)`,
  [seqNaoClientesId, emailNaoClientes.assunto, emailNaoClientes.corpo]
);

console.log(`✅ Sequência "Novo Site — Não Clientes" criada (ID: ${seqNaoClientesId})`);

// ─── INSERIR CAMPANHAS ────────────────────────────────────────────────────────
const [campClientesRes] = await conn.execute(
  `INSERT INTO outreach_campanhas (nome, sequenciaId, segmento, estado, remetentNome, remetentEmail)
   VALUES (?, ?, 'geral', 'rascunho', 'Filipe Ferreira', 'marketing@team24.pt')`,
  ["Novo Site — Clientes", seqClientesId]
);
console.log(`✅ Campanha "Novo Site — Clientes" criada (ID: ${campClientesRes.insertId})`);

const [campNaoClientesRes] = await conn.execute(
  `INSERT INTO outreach_campanhas (nome, sequenciaId, segmento, estado, remetentNome, remetentEmail)
   VALUES (?, ?, 'geral', 'rascunho', 'Filipe Ferreira', 'marketing@team24.pt')`,
  ["Novo Site — Não Clientes", seqNaoClientesId]
);
console.log(`✅ Campanha "Novo Site — Não Clientes" criada (ID: ${campNaoClientesRes.insertId})`);

await conn.end();
console.log("\n✅ Concluído.");
