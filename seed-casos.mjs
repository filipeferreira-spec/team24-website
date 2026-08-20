/**
 * Seed script — Casos de Sucesso
 * Insere os 4 casos estáticos na base de dados.
 * Executa com: node seed-casos.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL não definida.");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// ── Dados dos casos ──────────────────────────────────────────────────────────

const casosData = [
  {
    empresa: "RTP",
    setor: "Media & Comunicação",
    logoUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=120&h=60&fit=crop&auto=format",
    imagemUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop&auto=format",
    resultado: "31% taxa de utilização · -38% absentismo",
    descricao: `A RTP, enquanto empresa de media pública com presença em todo o território nacional, enfrentava um desafio complexo: garantir apoio psicológico de qualidade a colaboradores dispersos geograficamente, com horários irregulares e expostos a pressões editoriais constantes.

O setor dos media é reconhecidamente exigente. Jornalistas, técnicos e produtores lidam diariamente com conteúdos difíceis, prazos apertados e a pressão da audiência. O absentismo por razões de saúde mental havia aumentado 23% nos dois anos anteriores à implementação da TEAM 24, e os inquéritos internos revelavam níveis preocupantes de burnout, especialmente nas equipas de informação.

A TEAM 24 foi implementada em menos de 48 horas, disponibilizando a todos os colaboradores da RTP acesso imediato a psicólogos certificados via chat, telefone e videoconsulta — disponível 24 horas por dia, incluindo fins de semana e feriados.

Ao fim de 12 meses, os resultados superaram as expectativas da equipa de RH da RTP. A taxa de utilização atingiu os 31% — dez vezes superior à solução anterior. O absentismo por razões de saúde mental reduziu 38%, e os inquéritos internos de satisfação registaram uma melhoria de 22 pontos percentuais na perceção de apoio da empresa.`,
    citacao: "O serviço totalmente online, anónimo e confidencial apresenta uma vantagem única que dá liberdade e oportunidade aos trabalhadores para procurarem este apoio quando mais necessitam e ao seu próprio ritmo.",
    citacaoAutor: "Bárbara Morgadinho Regadas",
    citacaoRole: "Responsável de Bem-Estar",
    metrica1Label: "Taxa de Utilização",
    metrica1Valor: "31%",
    metrica2Label: "Absentismo",
    metrica2Valor: "-38%",
    metrica3Label: "Satisfação",
    metrica3Valor: "+22pts",
    destaque: true,
    publicado: true,
  },
  {
    empresa: "Adecco",
    setor: "Recursos Humanos & Trabalho Temporário",
    logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&h=60&fit=crop&auto=format",
    imagemUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop&auto=format",
    resultado: "28% adesão em 3 meses · -19% rotatividade",
    descricao: `A Adecco Portugal, líder em soluções de recursos humanos, gere uma força de trabalho distribuída por todo o país, com consultores e gestores de conta em permanente mobilidade. Esta dispersão geográfica, combinada com a pressão comercial inerente ao setor, criava um ambiente propício ao desenvolvimento de stress crónico e burnout.

A TEAM 24 foi escolhida pela sua flexibilidade de acesso — app móvel, web e telefone — que se adaptava às diferentes preferências e rotinas dos colaboradores da Adecco. A solução foi apresentada internamente como um benefício de empresa, sem qualquer conotação clínica ou de "problema", o que facilitou a adesão transversal.

A Adecco registou uma adesão de 28% nos primeiros três meses. O impacto mais significativo foi na retenção: a rotatividade de colaboradores internos reduziu 19% no ano seguinte à implementação, representando uma poupança estimada de €180.000 em custos de recrutamento e formação.`,
    citacao: "A TEAM 24 permite-nos facultar a todos os nossos colaboradores a nível nacional um serviço de psicologia com acesso a chat, consultas telefónicas e vídeo-consultas, com psicólogos experientes.",
    citacaoAutor: "Vânia Borges",
    citacaoRole: "Diretora de RH",
    metrica1Label: "Adesão",
    metrica1Valor: "28%",
    metrica2Label: "Rotatividade",
    metrica2Valor: "-19%",
    metrica3Label: "Poupança",
    metrica3Valor: "€180K",
    destaque: true,
    publicado: true,
  },
  {
    empresa: "Eurotux",
    setor: "Tecnologia & IT",
    logoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=60&fit=crop&auto=format",
    imagemUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop&auto=format",
    resultado: "-41% absentismo · +34% candidaturas espontâneas",
    descricao: `A Eurotux, empresa portuguesa de referência em infraestruturas IT e open source, enfrentava um desafio comum ao setor tecnológico: atrair e reter talento altamente qualificado num mercado extremamente competitivo.

A Eurotux implementou a TEAM 24 como parte de um pacote de bem-estar mais amplo, posicionando-a como o "perk" mais valorizado pelos colaboradores. A integração com o sistema de RH existente permitiu um onboarding automático de novos colaboradores, garantindo que todos tinham acesso ao serviço desde o primeiro dia de trabalho.

Nos primeiros seis meses, a Eurotux registou uma redução de 41% no absentismo por razões de saúde mental. A empresa utilizou a TEAM 24 como argumento de recrutamento, resultando num aumento de 34% nas candidaturas espontâneas.`,
    citacao: "Investir na saúde mental dos nossos colaboradores com o apoio da TEAM 24 tem sido uma experiência transformadora. Cuidar do bem-estar emocional da nossa equipa é essencial para promover um ambiente de trabalho mais harmonioso.",
    citacaoAutor: "Marlene Silva",
    citacaoRole: "Diretora de RH",
    metrica1Label: "Absentismo",
    metrica1Valor: "-41%",
    metrica2Label: "Retenção",
    metrica2Valor: "67%",
    metrica3Label: "Candidaturas",
    metrica3Valor: "+34%",
    destaque: true,
    publicado: true,
  },
  {
    empresa: "Grupo BEL",
    setor: "Retalho & Distribuição",
    logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=120&h=60&fit=crop&auto=format",
    imagemUrl: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=600&fit=crop&auto=format",
    resultado: "Turnover de 42% para 28% · €320K poupança",
    descricao: `O Grupo BEL opera uma rede de retalho com 12 lojas e armazéns em Portugal, com equipas que trabalham por turnos, incluindo fins de semana e feriados. A rotatividade de pessoal era o principal problema: com uma taxa de turnover anual de 42%, o custo de recrutamento e formação consumia uma parte significativa do orçamento de RH.

A TEAM 24 foi a resposta pela sua acessibilidade total: disponível 24/7, via smartphone, sem necessidade de deslocação. Para colaboradores que trabalham por turnos, a possibilidade de aceder a apoio psicológico às 23h ou às 7h da manhã foi determinante.

Ao fim de um ano, a taxa de turnover reduziu de 42% para 28% — uma poupança estimada de €320.000 em custos de recrutamento. O absentismo reduziu 29% e a satisfação dos colaboradores aumentou 18 pontos percentuais.`,
    citacao: "Esta sinergia tem tido um impacto elevado junto dos Colaboradores, ajudando-os nos momentos mais difíceis e ao mesmo tempo demonstrando o cuidado e valorização que as nossas empresas atribuem às suas Pessoas.",
    citacaoAutor: "Miguel Teixeira",
    citacaoRole: "Diretor de Operações",
    metrica1Label: "Turnover",
    metrica1Valor: "-33%",
    metrica2Label: "Absentismo",
    metrica2Valor: "-29%",
    metrica3Label: "Poupança",
    metrica3Valor: "€320K",
    destaque: false,
    publicado: true,
  },
];

// ── Inserção ─────────────────────────────────────────────────────────────────

try {
  // Verificar se já existem casos na BD
  const [existing] = await connection.execute("SELECT COUNT(*) as count FROM casos");
  const count = existing[0].count;

  if (count > 0) {
    console.log(`⚠️  Já existem ${count} casos na base de dados. A ignorar seed para evitar duplicados.`);
    console.log("   Para reinserir, execute: DELETE FROM casos; e corra o seed novamente.");
    await connection.end();
    process.exit(0);
  }

  console.log("📦  A inserir casos de sucesso na base de dados...\n");

  for (const caso of casosData) {
    await connection.execute(
      `INSERT INTO casos 
        (empresa, setor, logoUrl, imagemUrl, resultado, descricao, citacao, citacaoAutor, citacaoRole,
         metrica1Label, metrica1Valor, metrica2Label, metrica2Valor, metrica3Label, metrica3Valor,
         destaque, publicado, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        caso.empresa, caso.setor, caso.logoUrl, caso.imagemUrl, caso.resultado, caso.descricao,
        caso.citacao, caso.citacaoAutor, caso.citacaoRole,
        caso.metrica1Label, caso.metrica1Valor,
        caso.metrica2Label, caso.metrica2Valor,
        caso.metrica3Label, caso.metrica3Valor,
        caso.destaque ? 1 : 0, caso.publicado ? 1 : 0,
      ]
    );
    console.log(`  ✅  ${caso.empresa}`);
  }

  console.log(`\n🎉  ${casosData.length} casos inseridos com sucesso!`);
} catch (err) {
  console.error("❌  Erro ao inserir casos:", err.message);
  process.exit(1);
} finally {
  await connection.end();
}
