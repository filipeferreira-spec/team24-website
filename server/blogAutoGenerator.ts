/**
 * Blog Auto Generator — TEAM 24
 * 
 * Fluxo:
 * 1. Pesquisa as palavras-chave SEO mais relevantes para RH e CEOs em Portugal
 * 2. Verifica artigos existentes na BD para evitar repetições
 * 3. Escolhe o tópico com maior potencial de tráfego ainda não coberto
 * 4. Gera artigo SEO-optimizado (1500-2000 palavras) com as keywords identificadas
 * 5. Gera imagem única para o artigo
 * 6. Publica automaticamente na BD
 */

import { invokeLLM } from "./ia";
import { generateImage } from "./imagemArtigo";
import { getDb } from "./db";
import { recursos } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── CATEGORIAS BASE ──────────────────────────────────────────────────────────

export const BLOG_CATEGORIES = [
  {
    tema: "Saúde Mental no Trabalho",
    targetAudience: "RH e CEOs",
    seedTopics: [
      "burnout colaboradores", "stress laboral portugal", "apoio psicológico empresas",
      "saúde mental corporativa", "bem-estar organizacional", "ansiedade trabalho",
      "depressão profissional", "mindfulness empresas", "cultura bem-estar",
    ],
  },
  {
    tema: "Gestão de Recursos Humanos",
    targetAudience: "Diretores de RH",
    seedTopics: [
      "reduzir turnover empresa", "retenção talentos portugal", "engagement colaboradores",
      "onboarding eficaz", "gestão conflitos trabalho", "avaliação desempenho",
      "diversidade inclusão empresas", "cultura organizacional", "feedback contínuo rh",
    ],
  },
  {
    tema: "Liderança e Gestão",
    targetAudience: "CEOs e Gestores",
    seedTopics: [
      "liderança empática", "gestão equipas remotas", "inteligência emocional líderes",
      "motivar equipas", "comunicação assertiva liderança", "tomada decisão pressão",
      "equipas alta performance", "liderança crise", "delegação eficaz",
    ],
  },
  {
    tema: "Bem-Estar e Produtividade",
    targetAudience: "RH e CEOs",
    seedTopics: [
      "produtividade colaboradores", "absentismo empresas", "presentismo trabalho",
      "trabalho híbrido bem-estar", "ambiente trabalho saudável", "pausas produtividade",
      "rotinas saudáveis trabalho", "ergonomia escritório", "digital detox trabalho",
    ],
  },
  {
    tema: "Apoio Social e Familiar",
    targetAudience: "Diretores de RH",
    seedTopics: [
      "conciliação trabalho família", "licença parental empresas", "cuidadores informais trabalho",
      "apoio colaboradores crise pessoal", "programas apoio familiar empresas",
      "saúde financeira colaboradores", "violência doméstica apoio empresarial",
    ],
  },
  {
    tema: "Apoio Jurídico e Financeiro",
    targetAudience: "CEOs e RH",
    seedTopics: [
      "direitos trabalhadores portugal 2025", "assédio moral trabalho", "código trabalho portugal",
      "literacia financeira colaboradores", "stress financeiro trabalho",
      "benefícios fiscais bem-estar empresas", "proteção jurídica trabalhadores",
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Obtém todos os títulos e temas de artigos já existentes na BD.
 */
async function getExistingArticles(): Promise<{ titulo: string; tema: string | null }[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ titulo: recursos.titulo, tema: recursos.tema })
    .from(recursos)
    .where(eq(recursos.tipo, "artigo"));
}

/**
 * Usa o LLM para identificar as melhores palavras-chave SEO para RH e CEOs
 * com base no tópico escolhido, e retorna um plano de artigo completo.
 */
async function researchKeywordsAndPlanArticle(
  topic: string,
  tema: string,
  targetAudience: string,
  seedKeywords: string[],
  existingTitles: string[]
): Promise<{
  primaryKeyword: string;
  secondaryKeywords: string[];
  titulo: string;
  metaDescricao: string;
  angle: string;
  searchIntent: string;
}> {
  const existingList = existingTitles.slice(0, 20).join(", ") || "nenhum ainda";

  const response = await invokeLLM({
      effort: "high", max_tokens: 16000, // artigo completo: qualidade acima de velocidade
    messages: [
      {
        role: "system",
        content: `És um especialista em SEO e marketing de conteúdo B2B para Portugal, com foco em saúde mental corporativa, recursos humanos e gestão empresarial. 
O teu objetivo é identificar as palavras-chave com maior potencial de tráfego orgânico em Portugal para o target: ${targetAudience}.
A empresa é a TEAM 24 — plataforma de saúde mental e bem-estar corporativo.`,
      },
      {
        role: "user",
        content: `Analisa o seguinte tópico e identifica a melhor estratégia de keywords SEO para Portugal:

**Tópico:** ${topic}
**Categoria:** ${tema}
**Target:** ${targetAudience} em Portugal
**Keywords de partida:** ${seedKeywords.join(", ")}

**Artigos já existentes (NÃO repetir ângulos similares):**
${existingList}

Identifica:
1. A keyword primária com maior volume de pesquisa em Portugal para este target
2. 5-8 keywords secundárias (long-tail) relacionadas
3. O ângulo editorial único para este artigo (diferente dos existentes)
4. A intenção de pesquisa (informacional, navegacional, transacional)
5. Um título SEO irresistível para ${targetAudience} (max 60 caracteres)
6. Uma meta descrição persuasiva (max 160 caracteres)

Responde em JSON:
{
  "primaryKeyword": "keyword principal",
  "secondaryKeywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "titulo": "Título SEO otimizado",
  "metaDescricao": "Meta descrição persuasiva",
  "angle": "Ângulo editorial único para este artigo",
  "searchIntent": "informacional|navegacional|transacional"
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") throw new Error("LLM não retornou keywords");

  return JSON.parse(raw);
}

/**
 * Escolhe a categoria e tópico com menor cobertura na BD.
 */
function pickBestCategory(
  existingArticles: { titulo: string; tema: string | null }[]
): { category: typeof BLOG_CATEGORIES[0]; topic: string } {
  // Conta artigos por categoria
  const countByTema: Record<string, number> = {};
  for (const cat of BLOG_CATEGORIES) {
    countByTema[cat.tema] = existingArticles.filter(
      (a) => a.tema === cat.tema
    ).length;
  }

  // Ordena categorias por menor cobertura
  const sorted = [...BLOG_CATEGORIES].sort(
    (a, b) => (countByTema[a.tema] || 0) - (countByTema[b.tema] || 0)
  );

  // Escolhe a categoria com menos artigos
  const category = sorted[0];

  // Escolhe um seed topic aleatório desta categoria
  const usedTopics = existingArticles
    .filter((a) => a.tema === category.tema)
    .map((a) => a.titulo.toLowerCase());

  const unusedSeeds = category.seedTopics.filter(
    (s) => !usedTopics.some((u) => u.includes(s.split(" ")[0]))
  );

  const topic =
    unusedSeeds.length > 0
      ? unusedSeeds[Math.floor(Math.random() * unusedSeeds.length)]
      : category.seedTopics[Math.floor(Math.random() * category.seedTopics.length)] +
        " — perspetiva 2025";

  return { category, topic };
}

// ─── GERADOR PRINCIPAL ────────────────────────────────────────────────────────

export async function generateBlogArticle(): Promise<{
  success: boolean;
  titulo?: string;
  tema?: string;
  primaryKeyword?: string;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Base de dados indisponível");

    // 1. Verificar artigos existentes
    const existingArticles = await getExistingArticles();
    console.log(`[BlogAutoGenerator] Artigos existentes: ${existingArticles.length}`);

    // 2. Escolher a melhor categoria/tópico com menor cobertura
    const { category, topic } = pickBestCategory(existingArticles);
    console.log(`[BlogAutoGenerator] Categoria escolhida: "${category.tema}" | Tópico: "${topic}"`);

    // 3. Pesquisar keywords SEO e planear artigo
    console.log(`[BlogAutoGenerator] A pesquisar keywords SEO para target: ${category.targetAudience}...`);
    const keywordPlan = await researchKeywordsAndPlanArticle(
      topic,
      category.tema,
      category.targetAudience,
      category.seedTopics,
      existingArticles.map((a) => a.titulo)
    );

    console.log(`[BlogAutoGenerator] Keyword primária: "${keywordPlan.primaryKeyword}"`);
    console.log(`[BlogAutoGenerator] Título planeado: "${keywordPlan.titulo}"`);

    // 4. Gerar artigo completo com as keywords identificadas
    const articleResponse = await invokeLLM({
      effort: "high", // artigo completo: qualidade acima de velocidade
      messages: [
        {
          role: "system",
          content: `És um especialista em content marketing SEO e saúde mental corporativa para Portugal.
Escreves artigos de blog profissionais, informativos e altamente otimizados para SEO em português europeu.
A TEAM 24 é uma plataforma líder de saúde mental e bem-estar corporativo em Portugal.
O teu target são ${category.targetAudience} de empresas portuguesas.`,
        },
        {
          role: "user",
          content: `Escreve um artigo de blog completo e otimizado para SEO com as seguintes especificações:

**Título:** ${keywordPlan.titulo}
**Keyword primária:** ${keywordPlan.primaryKeyword}
**Keywords secundárias:** ${keywordPlan.secondaryKeywords.join(", ")}
**Ângulo editorial:** ${keywordPlan.angle}
**Intenção de pesquisa:** ${keywordPlan.searchIntent}
**Target:** ${category.targetAudience} em Portugal
**Categoria:** ${category.tema}
**Idioma:** Português europeu (Portugal)
**Comprimento:** Entre 1500 e 2000 palavras

REGRAS SEO OBRIGATÓRIAS:
- Incluir a keyword primária no primeiro parágrafo, em pelo menos 2 H2, e na conclusão
- Usar keywords secundárias naturalmente ao longo do texto (sem keyword stuffing)
- Estrutura com H2 e H3 para facilitar a leitura e SEO
- Parágrafos curtos (3-4 frases máximo)
- Incluir dados/estatísticas relevantes para Portugal quando possível
- CTA no final mencionando a TEAM 24 e o agendamento de uma demo gratuita
- Tom profissional mas acessível, orientado para ${category.targetAudience}

Responde APENAS com JSON válido:
{
  "titulo": "${keywordPlan.titulo}",
  "meta_descricao": "${keywordPlan.metaDescricao}",
  "conteudo": "Artigo completo em Markdown (mínimo 1500 palavras)"
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 16000, // 4096 cortava artigos longos a meio
    });

    const rawContent = articleResponse.choices?.[0]?.message?.content;
    if (!rawContent || typeof rawContent !== "string") {
      throw new Error("LLM não retornou conteúdo do artigo");
    }

    let articleData: { titulo: string; meta_descricao: string; conteudo: string };
    try {
      articleData = JSON.parse(rawContent);
    } catch {
      throw new Error(`Falha ao parsear JSON do artigo: ${rawContent.substring(0, 200)}`);
    }

    if (!articleData.titulo || !articleData.conteudo) {
      throw new Error("Dados do artigo incompletos");
    }

    console.log(`[BlogAutoGenerator] Artigo gerado: "${articleData.titulo}" (${articleData.conteudo.length} chars)`);

    // 5. Gerar imagem única para o artigo
    let imageUrl: string | null = null;
    try {
      const imagePrompt = `Professional corporate wellness blog illustration for an article titled "${articleData.titulo}".
Target audience: ${category.targetAudience} in Portugal.
Theme: ${category.tema}.
Primary keyword concept: ${keywordPlan.primaryKeyword}.
Style: Modern, clean, minimalist design with warm orange (#DB5C34) and navy blue (#0A1A2A) color palette.
Portuguese corporate aesthetic, professional and trustworthy.
No text or letters in the image.
Suitable for a health and wellness company blog header.`;

      const imageResult = await generateImage({ prompt: imagePrompt });
      imageUrl = imageResult.url || null;
      console.log(`[BlogAutoGenerator] Imagem gerada: ${imageUrl}`);
    } catch (imgErr) {
      console.error("[BlogAutoGenerator] Erro ao gerar imagem (continuando sem imagem):", imgErr);
    }

    // 6. Guardar na BD como artigo publicado
    // Formato: meta descrição + separador + conteúdo markdown completo
    const descricaoCompleta = `${articleData.meta_descricao}\n\n<!-- keywords: ${keywordPlan.primaryKeyword}, ${keywordPlan.secondaryKeywords.join(", ")} -->\n\n---\n\n${articleData.conteudo}`;

    await db.insert(recursos).values({
      titulo: articleData.titulo,
      descricao: descricaoCompleta,
      tipo: "artigo",
      tema: category.tema,
      imageUrl: imageUrl,
      downloadUrl: null,
      isPremium: false,
      isNovo: true,
      publicado: true,
    });

    console.log(`[BlogAutoGenerator] ✓ Artigo publicado: "${articleData.titulo}" | Keyword: "${keywordPlan.primaryKeyword}"`);

    return {
      success: true,
      titulo: articleData.titulo,
      tema: category.tema,
      primaryKeyword: keywordPlan.primaryKeyword,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[BlogAutoGenerator] Erro:", msg);
    return { success: false, error: msg };
  }
}
