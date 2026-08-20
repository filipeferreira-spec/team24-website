// Script de seed: insere os 30 recursos estáticos na base de dados
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const RECURSOS = [
  // E-books
  { titulo: "Gestão de Saúde Mental no Local de Trabalho", descricao: "Como transformar desafios em oportunidades de crescimento organizacional. Implementação de políticas de saúde mental eficazes.", tipo: "ebook", tema: "Saúde Mental", imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "ROI do Bem-Estar: Impacto nos Resultados", descricao: "Dados concretos sobre retorno do investimento em bem-estar. Aumente a produtividade e reduza o absentismo.", tipo: "ebook", tema: "ROI", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "10 Sinais de Burnout na Sua Equipa", descricao: "Guia prático para identificar e resolver problemas de stress no trabalho. Dicas para gestores prevenirem o burnout.", tipo: "ebook", tema: "Burnout", imageUrl: "https://images.unsplash.com/photo-1541199249251-f713e6145474?w=600&q=80", isPremium: false, isNovo: true, publicado: true },
  { titulo: "Employee Assistance Programs (EAP): O Futuro do RH", descricao: "Tudo o que precisa saber para implementar com sucesso. Benefícios e casos de uso do EAP.", tipo: "ebook", tema: "EAP", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "O Guia Completo para Reduzir o Turnover", descricao: "Estratégias para manter os melhores talentos na sua organização. Insights práticos para melhorar a retenção.", tipo: "ebook", tema: "Retenção", imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "Liderança Empática: O Novo Paradigma", descricao: "Como desenvolver competências de liderança que promovem o bem-estar e a performance das equipas.", tipo: "ebook", tema: "Liderança", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  // Ferramentas
  { titulo: "Avaliação de Risco de Burnout", descricao: "Questionário baseado na Escala de Maslach para avaliar o nível de burnout da sua equipa.", tipo: "ferramenta", tema: "Burnout", imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80", isPremium: false, isNovo: false, publicado: true },
  { titulo: "Scorecard de Bem-Estar Organizacional", descricao: "Avalie o estado atual do bem-estar na sua empresa com este diagnóstico completo.", tipo: "ferramenta", tema: "Diagnóstico", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80", isPremium: false, isNovo: false, publicado: true },
  { titulo: "Calculadora de ROI do EAP", descricao: "Calcule o retorno do investimento de um programa de assistência ao colaborador.", tipo: "ferramenta", tema: "ROI", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80", isPremium: false, isNovo: false, publicado: true },
  { titulo: "Avaliação de Clima Organizacional", descricao: "Meça a satisfação e engagement dos colaboradores com este questionário validado.", tipo: "ferramenta", tema: "Clima", imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80", isPremium: false, isNovo: false, publicado: true },
  // Webinars
  { titulo: "Como Implementar um EAP de Sucesso", descricao: "Webinar com Ana Ruivo sobre as melhores práticas de implementação de programas de assistência.", tipo: "webinar", tema: "EAP", imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "Prevenção de Burnout: Estratégias Práticas", descricao: "Aprenda a identificar e prevenir o burnout nas suas equipas com técnicas comprovadas.", tipo: "webinar", tema: "Burnout", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80", isPremium: false, isNovo: true, publicado: true },
  { titulo: "O Papel do RH na Saúde Mental", descricao: "Como os profissionais de RH podem liderar a transformação do bem-estar corporativo.", tipo: "webinar", tema: "RH", imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "Literacia Financeira: Reduzir o Stress dos Colaboradores", descricao: "Como programas de educação financeira impactam o bem-estar e a produtividade.", tipo: "webinar", tema: "Finanças", imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  // Blog/Artigos
  { titulo: "5 Tendências de Bem-Estar Corporativo para 2025", descricao: "As principais tendências que vão moldar o futuro do trabalho e do bem-estar nas empresas.", tipo: "artigo", tema: "Tendências", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", isPremium: false, isNovo: false, publicado: true },
  { titulo: "Como Medir o Impacto de um Programa de Bem-Estar", descricao: "Métricas e KPIs essenciais para avaliar o sucesso das suas iniciativas de bem-estar.", tipo: "artigo", tema: "ROI", imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80", isPremium: false, isNovo: false, publicado: true },
  { titulo: "A Importância do Apoio Psicológico no Trabalho", descricao: "Porque é que o acesso a psicólogos é fundamental para a saúde das organizações.", tipo: "artigo", tema: "Saúde Mental", imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80", isPremium: false, isNovo: true, publicado: true },
  { titulo: "Trabalho Remoto e Saúde Mental: Desafios e Soluções", descricao: "Como manter o bem-estar das equipas em modelos de trabalho híbrido e remoto.", tipo: "artigo", tema: "Trabalho Remoto", imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80", isPremium: false, isNovo: false, publicado: true },
  // Checklists/Guias
  { titulo: "Checklist de Implementação de EAP", descricao: "Lista completa de passos para implementar um programa de assistência ao colaborador.", tipo: "guia", tema: "EAP", imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "Auditoria de Bem-Estar Organizacional", descricao: "20 pontos essenciais para avaliar o estado do bem-estar na sua empresa.", tipo: "guia", tema: "Diagnóstico", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "Plano de Comunicação Interna de Bem-Estar", descricao: "Template para comunicar eficazmente as iniciativas de bem-estar aos colaboradores.", tipo: "template", tema: "Comunicação", imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  // Infográficos
  { titulo: "O Custo do Absentismo em Portugal", descricao: "Dados e estatísticas sobre o impacto económico do absentismo nas empresas portuguesas.", tipo: "guia", tema: "Absentismo", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "Burnout em Números: A Realidade Portuguesa", descricao: "Estatísticas alarmantes sobre o burnout em Portugal e o seu impacto nas organizações.", tipo: "guia", tema: "Burnout", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80", isPremium: false, isNovo: true, publicado: true },
  { titulo: "Anatomia de um EAP de Sucesso", descricao: "Os componentes essenciais de um programa de assistência ao colaborador eficaz.", tipo: "guia", tema: "EAP", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  // Podcast
  { titulo: "Ep. 1: O Futuro do Trabalho e o Bem-Estar", descricao: "Conversa com especialistas sobre as tendências que vão moldar o futuro do trabalho.", tipo: "artigo", tema: "Tendências", imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=80", isPremium: false, isNovo: false, publicado: true },
  { titulo: "Ep. 2: Liderança e Saúde Mental", descricao: "Como os líderes podem promover ambientes de trabalho saudáveis e produtivos.", tipo: "artigo", tema: "Liderança", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80", isPremium: false, isNovo: false, publicado: true },
  { titulo: "Ep. 3: Casos de Sucesso em EAP", descricao: "Histórias reais de empresas que transformaram a sua cultura com programas de bem-estar.", tipo: "artigo", tema: "EAP", imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80", isPremium: false, isNovo: true, publicado: true },
  // Casos de Estudo
  { titulo: "RTP: Transformação Cultural com EAP", descricao: "Como a RTP reduziu o absentismo em 32% com o programa TEAM 24.", tipo: "artigo", tema: "Media", imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "Salvador Caetano: Bem-Estar na Indústria", descricao: "Implementação de um programa de saúde mental em ambiente industrial.", tipo: "artigo", tema: "Indústria", imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
  { titulo: "Adecco: EAP para Equipas Distribuídas", descricao: "Estratégias para implementar bem-estar em equipas geograficamente dispersas.", tipo: "artigo", tema: "RH", imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80", isPremium: true, isNovo: false, publicado: true },
];

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  // Check if already seeded (avoid duplicates)
  const [existing] = await connection.execute("SELECT COUNT(*) as count FROM recursos");
  const count = existing[0].count;
  if (count > 1) {
    console.log(`Já existem ${count} recursos na BD. A ignorar seed.`);
    await connection.end();
    return;
  }

  console.log("A inserir 30 recursos na base de dados...");
  for (const r of RECURSOS) {
    await connection.execute(
      "INSERT INTO recursos (titulo, descricao, tipo, tema, imageUrl, isPremium, isNovo, publicado, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [r.titulo, r.descricao, r.tipo, r.tema, r.imageUrl, r.isPremium ? 1 : 0, r.isNovo ? 1 : 0, r.publicado ? 1 : 0]
    );
  }
  console.log("✓ 30 recursos inseridos com sucesso!");
  await connection.end();
}

seed().catch(console.error);
