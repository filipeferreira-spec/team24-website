/* ============================================================
   FormacaoDetalhe — Página de detalhe de uma formação TEAM 24
   Rota: /formacoes/:id
   ============================================================ */

import { useParams } from "wouter";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import SEO, { breadcrumbLD, ORGANIZATION_LD } from "@/components/SEO";

// ── Dados das formações (duplicados aqui para autonomia da página) ────────────
// Idealmente extrair para um ficheiro shared, mas mantemos aqui por simplicidade

const FORMACOES = [
  {
    id: 1,
    area: "Liderança Geral",
    nivel: "Diretivo",
    duracao: "16h",
    modalidade: "Presencial / Online",
    tag: "Mais popular",
    tagColor: "#DB5C34",
    titulo: "Liderança com Propósito",
    subtitulo: "Da visão estratégica à ação no terreno",
    descricao:
      "Desenvolva a capacidade de inspirar equipas através de uma liderança autêntica e orientada para o propósito. Aprenda a alinhar valores pessoais com objetivos organizacionais e a criar culturas de alto desempenho.",
    descricaoLonga: "A liderança com propósito é a competência mais diferenciadora do século XXI. Num mundo em constante mudança, os líderes que conseguem conectar a missão da organização com os valores individuais das suas equipas são os que obtêm resultados sustentáveis. Esta formação combina teoria de ponta com exercícios práticos intensivos, permitindo que cada participante desenvolva o seu próprio estilo de liderança autêntico.",
    objetivos: [
      "Definir e comunicar uma visão clara e motivadora",
      "Criar empatia e confiança como pilares de liderança",
      "Gerir a mudança com resiliência e adaptabilidade",
      "Desenvolver a inteligência emocional aplicada à liderança",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Autoconhecimento e Propósito", horas: "4h", descricao: "Identificar valores pessoais, pontos fortes e áreas de desenvolvimento. Construir o manifesto pessoal de liderança." },
      { modulo: "Módulo 2", titulo: "Comunicação Inspiradora", horas: "4h", descricao: "Técnicas de storytelling, comunicação não-verbal e construção de mensagens que mobilizam equipas." },
      { modulo: "Módulo 3", titulo: "Gestão da Mudança", horas: "4h", descricao: "Modelos de gestão da mudança, resistências organizacionais e como liderar em contextos de incerteza." },
      { modulo: "Módulo 4", titulo: "Inteligência Emocional Avançada", horas: "4h", descricao: "Autorregulação, empatia e gestão de conflitos. Simulações práticas com feedback em tempo real." },
    ],
    publicoAlvo: "CEO, Diretores Gerais, Gestores de Topo",
    certificacao: "Certificado TEAM 24 + Créditos CPD",
    icon: "◈",
    accentColor: "#25749F",
    resultados: ["87% dos participantes reportam melhoria na satisfação da equipa", "Redução média de 34% no turnover voluntário", "Aumento de 28% no índice de engagement"],
  },
  {
    id: 2,
    area: "Liderança Geral",
    nivel: "Gestão Intermédia",
    duracao: "12h",
    modalidade: "Presencial / Online",
    tag: "",
    tagColor: "",
    titulo: "Empatia como Ferramenta de Gestão",
    subtitulo: "Construir pontes entre equipas e resultados",
    descricao:
      "Formação prática sobre como a empatia melhora a performance coletiva. Técnicas de escuta ativa, comunicação não-violenta e gestão de conflitos para líderes que querem criar equipas mais coesas e produtivas.",
    descricaoLonga: "A empatia não é fraqueza — é a competência mais poderosa de um gestor moderno. Estudos da Harvard Business Review mostram que líderes empáticos têm equipas 40% mais produtivas e com metade do absentismo. Esta formação dá-lhe ferramentas concretas para aplicar a empatia no dia a dia da gestão, sem perder a autoridade ou os resultados.",
    objetivos: [
      "Praticar escuta ativa e comunicação empática",
      "Resolver conflitos com técnicas de mediação",
      "Criar um ambiente psicologicamente seguro",
      "Aumentar o engagement e reduzir o turnover",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Fundamentos da Empatia Organizacional", horas: "3h", descricao: "O que é empatia cognitiva vs. emocional. Como desenvolver a capacidade empática de forma sistemática." },
      { modulo: "Módulo 2", titulo: "Escuta Ativa e Comunicação Não-Violenta", horas: "3h", descricao: "Técnicas de escuta profunda, perguntas poderosas e comunicação que cria ligação em vez de resistência." },
      { modulo: "Módulo 3", titulo: "Gestão de Conflitos com Mediação", horas: "3h", descricao: "Modelos de mediação, técnicas de desescalada e como transformar conflitos em oportunidades de crescimento." },
      { modulo: "Módulo 4", titulo: "Segurança Psicológica na Equipa", horas: "3h", descricao: "Como criar um ambiente onde as pessoas se sentem seguras para arriscar, errar e aprender." },
    ],
    publicoAlvo: "Gestores de Equipa, Team Leaders, Chefes de Departamento",
    certificacao: "Certificado TEAM 24",
    icon: "◎",
    accentColor: "#2A7A4B",
    resultados: ["92% de satisfação dos participantes", "Redução de 45% nos conflitos internos reportados", "Melhoria de 31% no NPS interno"],
  },
  {
    id: 3,
    area: "Liderança Geral",
    nivel: "Todos os níveis",
    duracao: "8h",
    modalidade: "Online",
    tag: "Novo",
    tagColor: "#2A7A4B",
    titulo: "Bem-estar e Performance: O Equilíbrio Possível",
    subtitulo: "Saúde mental como alavanca de produtividade",
    descricao:
      "Desmistifique a ideia de que bem-estar e performance são opostos. Aprenda a identificar sinais de burnout, a criar rotinas sustentáveis e a liderar pelo exemplo numa cultura de saúde organizacional.",
    descricaoLonga: "O burnout custa às empresas europeias mais de 600 mil milhões de euros por ano em produtividade perdida. Esta formação mostra que investir no bem-estar não é um custo — é o melhor investimento que uma organização pode fazer. Com base em neurociência e psicologia positiva, aprenderá a criar sistemas de trabalho que maximizam a performance sem sacrificar a saúde.",
    objetivos: [
      "Identificar sinais precoces de burnout na equipa",
      "Implementar rotinas de check-in emocional",
      "Criar políticas de trabalho sustentável",
      "Medir e melhorar o índice de bem-estar organizacional",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Neurociência do Bem-estar", horas: "2h", descricao: "Como o cérebro responde ao stress crónico. O ciclo burnout-recovery e como quebrá-lo." },
      { modulo: "Módulo 2", titulo: "Sinais de Alerta e Diagnóstico", horas: "2h", descricao: "Ferramentas de diagnóstico individual e de equipa. Como ter conversas difíceis sobre saúde mental." },
      { modulo: "Módulo 3", titulo: "Rotinas de Recuperação", horas: "2h", descricao: "Micro-pausas, rituais de equipa e políticas de desconexão que funcionam na prática." },
      { modulo: "Módulo 4", titulo: "Cultura de Saúde Organizacional", horas: "2h", descricao: "Como liderar pelo exemplo e criar uma cultura onde o bem-estar é um valor real, não um slogan." },
    ],
    publicoAlvo: "Todos os líderes e gestores",
    certificacao: "Certificado TEAM 24",
    icon: "◉",
    accentColor: "#DB5C34",
    resultados: ["Redução de 38% nos dias de absentismo", "89% dos participantes implementam pelo menos 3 rotinas novas", "ROI médio de 4:1 em 12 meses"],
  },
  {
    id: 4,
    area: "Recursos Humanos",
    nivel: "Especializado",
    duracao: "20h",
    modalidade: "Presencial",
    tag: "Certificado",
    tagColor: "#25749F",
    titulo: "RH Estratégico: Pessoas como Vantagem Competitiva",
    subtitulo: "Da gestão administrativa à parceria de negócio",
    descricao:
      "Transforme a função de RH num parceiro estratégico do negócio. Aprenda a medir o impacto das pessoas nos resultados, a desenhar programas de desenvolvimento e a posicionar o RH como agente de mudança cultural.",
    descricaoLonga: "O RH do futuro não gere papéis — gere impacto. Esta formação intensiva de 20 horas transforma profissionais de RH em verdadeiros parceiros estratégicos, capazes de falar a linguagem do negócio, apresentar dados convincentes ao board e liderar transformações culturais de fundo.",
    objetivos: [
      "Alinhar a estratégia de pessoas com os objetivos de negócio",
      "Implementar métricas de People Analytics",
      "Desenhar programas de onboarding e retenção de talento",
      "Criar uma proposta de valor ao colaborador (EVP) diferenciadora",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "RH como Parceiro Estratégico", horas: "4h", descricao: "Modelos de HR Business Partnering. Como construir credibilidade junto da liderança de topo." },
      { modulo: "Módulo 2", titulo: "People Analytics na Prática", horas: "4h", descricao: "Métricas essenciais, dashboards de RH e como transformar dados em decisões estratégicas." },
      { modulo: "Módulo 3", titulo: "Employer Branding e EVP", horas: "4h", descricao: "Construção da proposta de valor ao colaborador e estratégias de atração de talento diferenciadas." },
      { modulo: "Módulo 4", titulo: "Programas de Desenvolvimento e Retenção", horas: "4h", descricao: "Career paths, planos de sucessão e programas de mentoring que retêm os melhores talentos." },
      { modulo: "Módulo 5", titulo: "RH como Agente de Mudança Cultural", horas: "4h", descricao: "Como liderar transformações culturais, gerir resistências e medir o impacto das iniciativas de cultura." },
    ],
    publicoAlvo: "Diretores e Técnicos de RH, CHRO, People Managers",
    certificacao: "Certificado TEAM 24 + Acreditação SHRM",
    icon: "◈",
    accentColor: "#25749F",
    resultados: ["95% de satisfação dos participantes", "Redução média de 28% no custo de recrutamento", "Aumento de 42% na taxa de retenção a 1 ano"],
  },
  {
    id: 5,
    area: "Recursos Humanos",
    nivel: "Avançado",
    duracao: "16h",
    modalidade: "Presencial / Online",
    tag: "",
    tagColor: "",
    titulo: "Gestão do Absentismo e Presenteísmo",
    subtitulo: "Estratégias para reduzir custos e aumentar presença real",
    descricao:
      "Abordagem prática para identificar as causas raiz do absentismo e presenteísmo nas organizações. Ferramentas de diagnóstico, planos de intervenção e métricas de acompanhamento para equipas de RH.",
    descricaoLonga: "O absentismo e o presenteísmo custam às empresas portuguesas mais de 3 mil milhões de euros por ano. Esta formação dá às equipas de RH as ferramentas para diagnosticar, intervir e medir o impacto das suas ações, com casos reais de empresas que reduziram o absentismo em mais de 40%.",
    objetivos: [
      "Diagnosticar causas de absentismo por departamento",
      "Implementar programas de regresso ao trabalho",
      "Criar políticas de flexibilidade e conciliação",
      "Medir o ROI das intervenções de bem-estar",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Diagnóstico de Absentismo", horas: "4h", descricao: "Ferramentas de análise de dados, entrevistas de regresso e identificação de padrões por departamento." },
      { modulo: "Módulo 2", titulo: "Presenteísmo: O Inimigo Invisível", horas: "4h", descricao: "Como identificar e medir o presenteísmo. Intervenções que aumentam a presença real e o foco." },
      { modulo: "Módulo 3", titulo: "Programas de Intervenção", horas: "4h", descricao: "Desenho de programas de regresso ao trabalho, acompanhamento psicológico e planos de reintegração." },
      { modulo: "Módulo 4", titulo: "Medição de Impacto e ROI", horas: "4h", descricao: "Métricas de acompanhamento, dashboards de absentismo e como apresentar resultados ao board." },
    ],
    publicoAlvo: "Diretores de RH, Técnicos de Saúde Ocupacional",
    certificacao: "Certificado TEAM 24",
    icon: "◎",
    accentColor: "#2A7A4B",
    resultados: ["Redução média de 41% no absentismo", "ROI médio de 6:1 em 18 meses", "88% das empresas renovam o programa no ano seguinte"],
  },
  {
    id: 6,
    area: "Recursos Humanos",
    nivel: "Fundamental",
    duracao: "8h",
    modalidade: "Online",
    tag: "",
    tagColor: "",
    titulo: "Recrutamento com Foco em Fit Cultural",
    subtitulo: "Contratar para a cultura, não apenas para o cargo",
    descricao:
      "Aprenda a integrar critérios de saúde mental e fit cultural nos processos de recrutamento. Entrevistas comportamentais, assessment de valores e onboarding que reduz o turnover nos primeiros 90 dias.",
    descricaoLonga: "70% dos despedimentos acontecem por falta de fit cultural, não por falta de competências técnicas. Esta formação ensina-o a identificar candidatos que não só têm as competências certas, mas que vão prosperar na sua cultura organizacional — e a criar processos de onboarding que retêm os melhores desde o primeiro dia.",
    objetivos: [
      "Definir perfis de fit cultural por função",
      "Estruturar entrevistas por competências emocionais",
      "Criar processos de onboarding que retêm talento",
      "Reduzir o custo de rotatividade em 30%",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Definição de Cultura e Valores", horas: "2h", descricao: "Como articular a cultura organizacional em critérios de recrutamento concretos e mensuráveis." },
      { modulo: "Módulo 2", titulo: "Entrevistas Comportamentais", horas: "2h", descricao: "Técnica STAR, perguntas de fit cultural e como avaliar competências emocionais numa entrevista." },
      { modulo: "Módulo 3", titulo: "Assessment e Ferramentas de Seleção", horas: "2h", descricao: "Testes de valores, assessment centers e como combinar múltiplas fontes de informação na decisão." },
      { modulo: "Módulo 4", titulo: "Onboarding que Retém", horas: "2h", descricao: "Os primeiros 90 dias: estrutura de integração, buddy programs e check-ins que reduzem o turnover precoce." },
    ],
    publicoAlvo: "Recrutadores, HR Business Partners, Gestores de Contratação",
    certificacao: "Certificado TEAM 24",
    icon: "◉",
    accentColor: "#DB5C34",
    resultados: ["Redução de 35% no turnover nos primeiros 6 meses", "Melhoria de 52% no tempo de produtividade plena", "91% de satisfação dos gestores com as novas contratações"],
  },
  {
    id: 7,
    area: "Comercial",
    nivel: "Diretivo",
    duracao: "16h",
    modalidade: "Presencial",
    tag: "",
    tagColor: "",
    titulo: "Liderança de Equipas Comerciais de Alta Performance",
    subtitulo: "Motivação, resiliência e resultados sustentáveis",
    descricao:
      "Formação para diretores comerciais que querem construir equipas resilientes e motivadas. Técnicas de coaching comercial, gestão da pressão de resultados e criação de uma cultura de accountability saudável.",
    descricaoLonga: "As equipas comerciais vivem sob pressão constante. Sem uma liderança que equilibre exigência e suporte, o resultado é burnout, turnover e queda de performance. Esta formação dá aos diretores comerciais as ferramentas para criar equipas que performam de forma consistente — sem sacrificar a saúde mental dos seus colaboradores.",
    objetivos: [
      "Construir uma cultura de accountability sem toxicidade",
      "Gerir a pressão de resultados de forma saudável",
      "Aplicar técnicas de coaching para desenvolvimento individual",
      "Criar rituais de equipa que aumentam a coesão",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Liderança Comercial Moderna", horas: "4h", descricao: "Do gestor de resultados ao líder de pessoas. Como equilibrar exigência e suporte numa equipa comercial." },
      { modulo: "Módulo 2", titulo: "Coaching Comercial na Prática", horas: "4h", descricao: "Técnicas de coaching individual, feedback construtivo e como desenvolver cada membro da equipa." },
      { modulo: "Módulo 3", titulo: "Gestão da Pressão e Resiliência", horas: "4h", descricao: "Como gerir a pressão de resultados de forma saudável e construir resiliência coletiva na equipa." },
      { modulo: "Módulo 4", titulo: "Rituais e Cultura de Equipa", horas: "4h", descricao: "Reuniões de equipa que energizam, rituais de celebração e como criar uma identidade de equipa forte." },
    ],
    publicoAlvo: "Diretores Comerciais, Sales Managers, Key Account Managers",
    certificacao: "Certificado TEAM 24",
    icon: "◈",
    accentColor: "#25749F",
    resultados: ["Aumento médio de 23% nas vendas em 6 meses", "Redução de 47% no turnover comercial", "89% dos participantes recomendam a formação"],
  },
  {
    id: 8,
    area: "Comercial",
    nivel: "Equipa",
    duracao: "12h",
    modalidade: "Presencial / Online",
    tag: "Novo",
    tagColor: "#2A7A4B",
    titulo: "Inteligência Emocional nas Vendas",
    subtitulo: "Vender com empatia, fechar com confiança",
    descricao:
      "A inteligência emocional é o maior diferenciador nas vendas consultivas. Aprenda a gerir as emoções em negociações difíceis, a criar rapport genuíno com clientes e a transformar objeções em oportunidades.",
    descricaoLonga: "Os melhores vendedores não vendem produtos — criam relações. A inteligência emocional é o que separa os comerciais medianos dos top performers. Esta formação combina neurociência das vendas com técnicas práticas de gestão emocional, dando-lhe uma vantagem competitiva real em qualquer negociação.",
    objetivos: [
      "Desenvolver autorregulação emocional em situações de pressão",
      "Criar rapport e confiança com diferentes perfis de cliente",
      "Transformar rejeições em aprendizagens",
      "Aumentar a taxa de conversão através da empatia",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Neurociência das Vendas", horas: "3h", descricao: "Como o cérebro toma decisões de compra. O papel das emoções no processo de venda consultiva." },
      { modulo: "Módulo 2", titulo: "Autorregulação em Negociação", horas: "3h", descricao: "Técnicas de gestão emocional em situações de pressão, rejeição e negociações difíceis." },
      { modulo: "Módulo 3", titulo: "Rapport e Perfis de Cliente", horas: "3h", descricao: "Como criar ligação genuína com diferentes perfis de cliente e adaptar o estilo de comunicação." },
      { modulo: "Módulo 4", titulo: "Transformar Objeções em Oportunidades", horas: "3h", descricao: "Técnicas de reframing, escuta empática e como transformar um 'não' num 'ainda não'." },
    ],
    publicoAlvo: "Comerciais, Account Managers, Pré-Vendas",
    certificacao: "Certificado TEAM 24",
    icon: "◎",
    accentColor: "#2A7A4B",
    resultados: ["Aumento de 31% na taxa de conversão", "Redução de 28% no ciclo de venda", "94% de satisfação dos participantes"],
  },
  {
    id: 9,
    area: "Comercial",
    nivel: "Gestão",
    duracao: "8h",
    modalidade: "Online",
    tag: "",
    tagColor: "",
    titulo: "Gestão do Stress e Burnout em Equipas Comerciais",
    subtitulo: "Proteger a saúde mental sem perder a ambição",
    descricao:
      "As equipas comerciais são das mais expostas ao burnout. Esta formação dá aos gestores ferramentas para identificar sinais de esgotamento, criar rotinas de recuperação e manter a motivação a longo prazo.",
    descricaoLonga: "O burnout comercial é uma epidemia silenciosa. Os melhores vendedores são frequentemente os mais vulneráveis — a sua ambição e comprometimento tornam-nos mais suscetíveis ao esgotamento. Esta formação dá aos gestores as ferramentas para proteger os seus top performers e criar uma cultura de alta performance sustentável.",
    objetivos: [
      "Identificar os gatilhos de burnout em contexto comercial",
      "Implementar rotinas de recuperação e descompressão",
      "Criar metas realistas que motivam sem esgotar",
      "Construir uma cultura de suporte mútuo na equipa",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Burnout Comercial: Causas e Sinais", horas: "2h", descricao: "Os gatilhos específicos do burnout em contexto comercial e como identificá-los precocemente." },
      { modulo: "Módulo 2", titulo: "Rotinas de Recuperação", horas: "2h", descricao: "Técnicas de descompressão, gestão de energia e rituais de fim de dia para equipas comerciais." },
      { modulo: "Módulo 3", titulo: "Metas que Motivam", horas: "2h", descricao: "Como definir objetivos ambiciosos mas realistas. O papel da autonomia e do progresso na motivação." },
      { modulo: "Módulo 4", titulo: "Cultura de Suporte Mútuo", horas: "2h", descricao: "Como criar uma equipa onde as pessoas se apoiam mutuamente em vez de competirem de forma destrutiva." },
    ],
    publicoAlvo: "Sales Managers, Diretores Comerciais, Gestores de Equipa",
    certificacao: "Certificado TEAM 24",
    icon: "◉",
    accentColor: "#DB5C34",
    resultados: ["Redução de 52% no burnout reportado", "Aumento de 19% na performance após 3 meses", "87% dos gestores recomendam a formação"],
  },
  {
    id: 10,
    area: "Operações",
    nivel: "Diretivo",
    duracao: "16h",
    modalidade: "Presencial",
    tag: "",
    tagColor: "",
    titulo: "Liderança Operacional com Foco Humano",
    subtitulo: "Eficiência e bem-estar não são opostos",
    descricao:
      "Para diretores de operações que gerem equipas em contextos de alta pressão e ritmo intenso. Aprenda a otimizar processos sem sacrificar o bem-estar das pessoas, criando operações sustentáveis e resilientes.",
    descricaoLonga: "As operações de alta performance não se constroem apesar das pessoas — constroem-se através delas. Esta formação mostra como os melhores diretores de operações do mundo combinam eficiência máxima com bem-estar genuíno, criando sistemas que são ao mesmo tempo produtivos e humanos.",
    objetivos: [
      "Identificar pontos de pressão nos processos operacionais",
      "Implementar pausas e rotinas de recuperação nas equipas",
      "Criar indicadores de saúde operacional (não só KPIs de produção)",
      "Gerir a mudança operacional com impacto humano mínimo",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Diagnóstico de Pressão Operacional", horas: "4h", descricao: "Mapeamento de pontos de pressão, análise de fluxos de trabalho e identificação de riscos psicossociais." },
      { modulo: "Módulo 2", titulo: "Design de Operações Humanas", horas: "4h", descricao: "Como redesenhar processos para maximizar eficiência sem aumentar a carga cognitiva e emocional." },
      { modulo: "Módulo 3", titulo: "Indicadores de Saúde Operacional", horas: "4h", descricao: "Métricas além dos KPIs de produção: índices de bem-estar, fadiga e satisfação operacional." },
      { modulo: "Módulo 4", titulo: "Gestão da Mudança Operacional", horas: "4h", descricao: "Como implementar mudanças operacionais minimizando o impacto humano e maximizando a adesão." },
    ],
    publicoAlvo: "Diretores de Operações, COO, Gestores de Produção",
    certificacao: "Certificado TEAM 24",
    icon: "◈",
    accentColor: "#25749F",
    resultados: ["Redução de 29% nos acidentes de trabalho", "Aumento de 18% na produtividade", "Melhoria de 44% no índice de satisfação operacional"],
  },
  {
    id: 11,
    area: "Operações",
    nivel: "Supervisão",
    duracao: "12h",
    modalidade: "Presencial / Online",
    tag: "",
    tagColor: "",
    titulo: "Supervisão de Equipas: Da Tarefa à Pessoa",
    subtitulo: "Liderar no terreno com empatia e autoridade",
    descricao:
      "Formação para supervisores e chefes de turno que gerem equipas operacionais. Técnicas de comunicação assertiva, gestão de conflitos no terreno e criação de um ambiente de trabalho seguro e motivador.",
    descricaoLonga: "O supervisor é o líder mais próximo das pessoas — e o mais influente no seu bem-estar diário. Esta formação dá aos supervisores as ferramentas para equilibrar a exigência operacional com a atenção genuína às pessoas, criando equipas que trabalham com mais segurança, qualidade e motivação.",
    objetivos: [
      "Comunicar expectativas de forma clara e empática",
      "Gerir conflitos interpessoais no imediato",
      "Reconhecer e valorizar o trabalho das equipas",
      "Criar um ambiente de segurança psicológica no terreno",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "O Papel do Supervisor Moderno", horas: "3h", descricao: "Da supervisão de tarefas à liderança de pessoas. Como equilibrar controlo e autonomia no terreno." },
      { modulo: "Módulo 2", titulo: "Comunicação Assertiva no Terreno", horas: "3h", descricao: "Técnicas de comunicação clara, feedback no momento e como dar instruções que são seguidas." },
      { modulo: "Módulo 3", titulo: "Gestão de Conflitos no Imediato", horas: "3h", descricao: "Técnicas de desescalada, mediação rápida e como resolver conflitos sem parar a operação." },
      { modulo: "Módulo 4", titulo: "Reconhecimento e Motivação Operacional", horas: "3h", descricao: "Como reconhecer o trabalho de forma genuína e criar um ambiente onde as pessoas se sentem valorizadas." },
    ],
    publicoAlvo: "Supervisores, Chefes de Turno, Team Leaders Operacionais",
    certificacao: "Certificado TEAM 24",
    icon: "◎",
    accentColor: "#2A7A4B",
    resultados: ["Redução de 36% nos conflitos de equipa", "Aumento de 22% na qualidade operacional", "90% de satisfação dos participantes"],
  },
  {
    id: 12,
    area: "Operações",
    nivel: "Todos os níveis",
    duracao: "8h",
    modalidade: "Online",
    tag: "",
    tagColor: "",
    titulo: "Prevenção de Riscos Psicossociais",
    subtitulo: "Cumprir a lei e proteger genuinamente as pessoas",
    descricao:
      "Formação obrigatória para organizações que querem ir além do cumprimento legal. Identificação de riscos psicossociais, planos de prevenção e criação de uma cultura de reporte seguro.",
    descricaoLonga: "A legislação portuguesa exige a avaliação e prevenção de riscos psicossociais — mas as melhores organizações vão muito além do mínimo legal. Esta formação dá-lhe as ferramentas para criar um sistema de prevenção genuíno que protege as pessoas e reduz a responsabilidade legal da organização.",
    objetivos: [
      "Identificar e avaliar riscos psicossociais por função",
      "Criar planos de prevenção e intervenção",
      "Implementar canais de reporte seguros e confidenciais",
      "Cumprir os requisitos legais de saúde ocupacional",
    ],
    programa: [
      { modulo: "Módulo 1", titulo: "Enquadramento Legal e Normativo", horas: "2h", descricao: "Legislação portuguesa e europeia sobre riscos psicossociais. O que é obrigatório e o que é boas práticas." },
      { modulo: "Módulo 2", titulo: "Identificação e Avaliação de Riscos", horas: "2h", descricao: "Metodologias de avaliação de riscos psicossociais, ferramentas de diagnóstico e análise de resultados." },
      { modulo: "Módulo 3", titulo: "Planos de Prevenção e Intervenção", horas: "2h", descricao: "Como desenhar planos de prevenção eficazes, priorizar intervenções e medir o impacto." },
      { modulo: "Módulo 4", titulo: "Cultura de Reporte Seguro", horas: "2h", descricao: "Como criar canais de reporte confidenciais e uma cultura onde as pessoas se sentem seguras para reportar." },
    ],
    publicoAlvo: "Responsáveis de Segurança, RH, Gestores Operacionais",
    certificacao: "Certificado TEAM 24 + Conformidade Legal",
    icon: "◉",
    accentColor: "#DB5C34",
    resultados: ["100% de conformidade legal garantida", "Redução de 48% nos incidentes psicossociais reportados", "Melhoria de 33% no clima organizacional"],
  },
];

export default function FormacaoDetalhe() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");
  const f = FORMACOES.find((f) => f.id === id);

  if (!f) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
        <Navbar />
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "1.5rem",
          padding: "4rem 2rem",
        }}>
          <div style={{ fontSize: "3rem" }}>◉</div>
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: "2rem", color: "#0A1A2A", margin: 0 }}>
            Formação não encontrada
          </h2>
          <Link href="/formacoes">
            <button style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "white",
              backgroundColor: "#25749F",
              border: "none",
              padding: "0.85rem 2rem",
              cursor: "pointer",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}>
              ← Ver todas as formações
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <SEO
        title={`${f.titulo} | Formações TEAM 24`}
        description={f.descricao}
        canonicalPath={`/formacoes/${f.id}`}
        jsonLd={[
          ORGANIZATION_LD,
          breadcrumbLD([
            { name: "Início", path: "/" },
            { name: "Formações", path: "/formacoes" },
            { name: f.titulo, path: `/formacoes/${f.id}` },
          ]),
        ]}
      />
      <Navbar />

      {/* ── Hero da formação ── */}
      <section style={{
        background: `linear-gradient(135deg, #0A1A2A 0%, #0F2D4A 60%, #1A3A5C 100%)`,
        padding: "8rem 0 5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decoração de fundo */}
        <div style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          border: `1px solid ${f.accentColor}20`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <Link href="/formacoes">
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
              >
                Formações
              </span>
            </Link>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem" }}>›</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>
              {f.titulo}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "3rem", alignItems: "start" }}>
            <div>
              {/* Tags */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {f.tag && (
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "white",
                    backgroundColor: f.tagColor,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "2px",
                  }}>
                    {f.tag}
                  </span>
                )}
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: f.accentColor,
                  backgroundColor: `${f.accentColor}20`,
                  border: `1px solid ${f.accentColor}40`,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "2px",
                }}>
                  {f.area}
                </span>
              </div>

              <h1 style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                color: "white",
                margin: "0 0 0.75rem",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}>
                {f.titulo}
              </h1>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1.1rem",
                color: f.accentColor,
                margin: "0 0 1.5rem",
                fontStyle: "italic",
              }}>
                {f.subtitulo}
              </p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1rem",
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.7,
                margin: "0 0 2.5rem",
                maxWidth: "620px",
              }}>
                {f.descricaoLonga}
              </p>

              {/* Metadados */}
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                {[
                  { label: "Duração", valor: f.duracao },
                  { label: "Modalidade", valor: f.modalidade },
                  { label: "Nível", valor: f.nivel },
                  { label: "Certificação", valor: f.certificacao },
                ].map((m) => (
                  <div key={m.label}>
                    <div style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: "0.2rem",
                    }}>{m.label}</div>
                    <div style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.9)",
                    }}>{m.valor}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              padding: "2rem",
              minWidth: "260px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}>
              <div style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "white",
              }}>
                Interessado nesta formação?
              </div>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6,
                margin: 0,
              }}>
                Fale connosco para saber datas, preços e opções de formação in-company.
              </p>
              <a href="/contacto" style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "white",
                  backgroundColor: f.accentColor,
                  border: "none",
                  padding: "0.9rem 1.5rem",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                >
                  Pedir Informações
                </button>
              </a>
              <Link href="/formacoes">
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  textAlign: "center",
                  display: "block",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
                >
                  ← Ver todas as formações
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Conteúdo principal ── */}
      <section style={{ padding: "5rem 0", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "4rem", alignItems: "start" }}>

            {/* Coluna principal */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>

              {/* Objetivos */}
              <div>
                <h2 style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "#0A1A2A",
                  margin: "0 0 1.5rem",
                  letterSpacing: "-0.02em",
                }}>
                  O que vai aprender
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {f.objetivos.map((obj, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      backgroundColor: "#F5F8FA",
                      padding: "1rem 1.25rem",
                      borderLeft: `3px solid ${f.accentColor}`,
                    }}>
                      <span style={{ color: f.accentColor, fontSize: "0.8rem", marginTop: "0.15rem", flexShrink: 0, fontWeight: 700 }}>✓</span>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.85rem",
                        color: "#0A1A2A",
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}>
                        {obj}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Programa */}
              <div>
                <h2 style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "#0A1A2A",
                  margin: "0 0 1.5rem",
                  letterSpacing: "-0.02em",
                }}>
                  Programa
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {f.programa.map((m, i) => (
                    <div key={i} style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: "1.25rem",
                      alignItems: "start",
                      padding: "1.5rem 0",
                      borderBottom: i < f.programa.length - 1 ? "1px solid #E8F0F5" : "none",
                    }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        backgroundColor: `${f.accentColor}15`,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Lato', sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: f.accentColor,
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{
                          fontFamily: "'Lato', sans-serif",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "#0A1A2A",
                          marginBottom: "0.35rem",
                        }}>
                          {m.titulo}
                        </div>
                        <div style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.82rem",
                          color: "#4A6A7A",
                          lineHeight: 1.6,
                        }}>
                          {m.descricao}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: f.accentColor,
                        backgroundColor: `${f.accentColor}12`,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "2px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        {m.horas}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultados */}
              <div>
                <h2 style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  color: "#0A1A2A",
                  margin: "0 0 1.5rem",
                  letterSpacing: "-0.02em",
                }}>
                  Resultados comprovados
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {f.resultados.map((r, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem 1.5rem",
                      backgroundColor: "#F5F8FA",
                      borderLeft: `3px solid ${f.accentColor}`,
                    }}>
                      <span style={{ color: f.accentColor, fontSize: "1rem", flexShrink: 0 }}>◈</span>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.88rem",
                        color: "#0A1A2A",
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}>
                        {r}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ position: "sticky", top: "100px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Público-alvo */}
              <div style={{
                backgroundColor: "#F5F8FA",
                padding: "1.5rem",
                border: "1px solid #D0E2EC",
              }}>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9BAFBF",
                  marginBottom: "0.75rem",
                }}>
                  Público-alvo
                </div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.88rem",
                  color: "#0A1A2A",
                  fontWeight: 500,
                  lineHeight: 1.6,
                }}>
                  {f.publicoAlvo}
                </div>
              </div>

              {/* CTA */}
              <div style={{
                backgroundColor: "#0A1A2A",
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}>
                <div style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.3,
                }}>
                  Pronto para transformar a sua equipa?
                </div>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.82rem",
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  Disponível em formato in-company ou em turmas abertas. Fale connosco para saber mais.
                </p>
                <a href="/contacto" style={{ textDecoration: "none" }}>
                  <button style={{
                    width: "100%",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "white",
                    backgroundColor: f.accentColor,
                    border: "none",
                    padding: "0.9rem 1.5rem",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                  >
                    Pedir Informações
                  </button>
                </a>
              </div>

              {/* Outras formações */}
              <div style={{
                border: "1px solid #D0E2EC",
                padding: "1.5rem",
              }}>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9BAFBF",
                  marginBottom: "1rem",
                }}>
                  Outras formações
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {FORMACOES.filter((x) => x.id !== f.id && x.area === f.area).slice(0, 3).map((x) => (
                    <Link key={x.id} href={`/formacoes/${x.id}`}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.6rem 0",
                        borderBottom: "1px solid #F0F5F8",
                        cursor: "pointer",
                        transition: "color 0.15s",
                      }}>
                        <span style={{ color: x.accentColor, fontSize: "0.7rem", flexShrink: 0 }}>▸</span>
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.82rem",
                          color: "#0A1A2A",
                          lineHeight: 1.4,
                          fontWeight: 500,
                        }}>
                          {x.titulo}
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link href="/formacoes">
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.78rem",
                      color: f.accentColor,
                      cursor: "pointer",
                      fontWeight: 600,
                      marginTop: "0.25rem",
                      display: "block",
                      textDecoration: "none",
                    }}>
                      Ver todas as formações →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contacto ── */}
      <div id="contacto">
        <ContactSection />
      </div>

      <Footer />
    </div>
  );
}
