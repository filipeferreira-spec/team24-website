/**
 * Router de Qualidade de Dados — TEAM 24 CRM
 * Analisa campos em falta nas leads, clientes e contactos para qualificação.
 */
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { crmLeads, crmEmpresas, crmContactos } from "../../drizzle/schema";
import { eq, and, or, isNull, sql } from "drizzle-orm";

// ─── Campos críticos por entidade ─────────────────────────────────────────────

const CAMPOS_LEAD = [
  { campo: "responsavelNome", label: "Responsável", peso: 3 },
  { campo: "mensalidade",     label: "Mensalidade",  peso: 3 },
  { campo: "empresaId",       label: "Empresa ligada", peso: 2 },
  { campo: "dataRenovacao",   label: "Data de renovação", peso: 2 },
  { campo: "titulo",          label: "Título / Descrição", peso: 1 },
];

const CAMPOS_EMPRESA = [
  { campo: "telefone",         label: "Telefone",           peso: 3 },
  { campo: "email",            label: "Email",              peso: 3 },
  { campo: "responsavelNome",  label: "Nome do responsável", peso: 3 },
  { campo: "numColaboradores", label: "Nº Colaboradores",   peso: 2 },
  { campo: "sector",           label: "Sector",             peso: 2 },
  { campo: "nif",              label: "NIF",                peso: 2 },
  { campo: "cidade",           label: "Cidade",             peso: 1 },
  { campo: "website",          label: "Website",            peso: 1 },
];

const CAMPOS_CONTACTO = [
  { campo: "email",     label: "Email",    peso: 3 },
  { campo: "telefone",  label: "Telefone", peso: 3 },
  { campo: "cargo",     label: "Cargo",    peso: 2 },
  { campo: "telemovel", label: "Telemóvel", peso: 1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isEmpty(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === "string" && val.trim() === "") return true;
  if (typeof val === "number" && val === 0) return true;
  return false;
}

function calcScore(row: Record<string, any>, campos: typeof CAMPOS_LEAD): number {
  const totalPeso = campos.reduce((s, c) => s + c.peso, 0);
  const preenchidoPeso = campos.reduce((s, c) => s + (isEmpty(row[c.campo]) ? 0 : c.peso), 0);
  return Math.round((preenchidoPeso / totalPeso) * 100);
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const crmQualidadeRouter = router({

  // Resumo geral de qualidade (para o dashboard)
  resumo: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("BD indisponível");

    const [leads, empresas, contactos] = await Promise.all([
      db.select().from(crmLeads).where(eq(crmLeads.ativo, true)),
      db.select().from(crmEmpresas).where(eq(crmEmpresas.clienteAtivo, true)),
      db.select().from(crmContactos).where(eq(crmContactos.ativo, true)),
    ]);

    // Análise de leads
    const leadsAnalise = CAMPOS_LEAD.map(({ campo, label, peso }) => {
      const semCampo = leads.filter(l => isEmpty((l as any)[campo])).length;
      return { campo, label, peso, total: leads.length, semCampo, percentagem: leads.length ? Math.round((semCampo / leads.length) * 100) : 0 };
    });

    // Análise de empresas/clientes
    const empresasAnalise = CAMPOS_EMPRESA.map(({ campo, label, peso }) => {
      const semCampo = empresas.filter(e => isEmpty((e as any)[campo])).length;
      return { campo, label, peso, total: empresas.length, semCampo, percentagem: empresas.length ? Math.round((semCampo / empresas.length) * 100) : 0 };
    });

    // Análise de contactos
    const contactosAnalise = CAMPOS_CONTACTO.map(({ campo, label, peso }) => {
      const semCampo = contactos.filter(c => isEmpty((c as any)[campo])).length;
      return { campo, label, peso, total: contactos.length, semCampo, percentagem: contactos.length ? Math.round((semCampo / contactos.length) * 100) : 0 };
    });

    // Score médio global
    const scoreLeads = leads.length ? Math.round(leads.reduce((s, l) => s + calcScore(l as any, CAMPOS_LEAD), 0) / leads.length) : 100;
    const scoreEmpresas = empresas.length ? Math.round(empresas.reduce((s, e) => s + calcScore(e as any, CAMPOS_EMPRESA), 0) / empresas.length) : 100;
    const scoreContactos = contactos.length ? Math.round(contactos.reduce((s, c) => s + calcScore(c as any, CAMPOS_CONTACTO), 0) / contactos.length) : 100;

    // Leads críticas (score < 50)
    const leadsCriticas = leads.filter(l => calcScore(l as any, CAMPOS_LEAD) < 50).length;
    const empresasCriticas = empresas.filter(e => calcScore(e as any, CAMPOS_EMPRESA) < 50).length;

    return {
      leads: { total: leads.length, scoreMedia: scoreLeads, criticas: leadsCriticas, campos: leadsAnalise },
      empresas: { total: empresas.length, scoreMedia: scoreEmpresas, criticas: empresasCriticas, campos: empresasAnalise },
      contactos: { total: contactos.length, scoreMedia: scoreContactos, campos: contactosAnalise },
    };
  }),

  // Lista de leads com campo específico em falta (para drill-down)
  leadsComCampoEmFalta: publicProcedure
    .input(z.object({
      campo: z.string(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");

      const todas = await db.select().from(crmLeads).where(eq(crmLeads.ativo, true));
      const comFalta = todas.filter(l => isEmpty((l as any)[input.campo]));
      const offset = (input.page - 1) * input.limit;
      const pagina = comFalta.slice(offset, offset + input.limit);

      return {
        total: comFalta.length,
        leads: pagina.map(l => ({
          ...l,
          score: calcScore(l as any, CAMPOS_LEAD),
          camposFaltando: CAMPOS_LEAD.filter(c => isEmpty((l as any)[c.campo])).map(c => c.label),
        })),
      };
    }),

  // Lista de empresas com campo específico em falta
  empresasComCampoEmFalta: publicProcedure
    .input(z.object({
      campo: z.string(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");

      const todas = await db.select().from(crmEmpresas).where(eq(crmEmpresas.clienteAtivo, true));
      const comFalta = todas.filter(e => isEmpty((e as any)[input.campo]));
      const offset = (input.page - 1) * input.limit;
      const pagina = comFalta.slice(offset, offset + input.limit);

      return {
        total: comFalta.length,
        empresas: pagina.map(e => ({
          ...e,
          score: calcScore(e as any, CAMPOS_EMPRESA),
          camposFaltando: CAMPOS_EMPRESA.filter(c => isEmpty((e as any)[c.campo])).map(c => c.label),
        })),
      };
    }),

  // Lista de leads com score baixo (para qualificação prioritária)
  leadsParaQualificar: publicProcedure
    .input(z.object({
      scoreMax: z.number().default(70),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");

      const todas = await db.select().from(crmLeads).where(eq(crmLeads.ativo, true));
      const paraQualificar = todas
        .map(l => ({ ...l, score: calcScore(l as any, CAMPOS_LEAD), camposFaltando: CAMPOS_LEAD.filter(c => isEmpty((l as any)[c.campo])).map(c => c.label) }))
        .filter(l => l.score <= input.scoreMax)
        .sort((a, b) => a.score - b.score);

      const offset = (input.page - 1) * input.limit;
      return {
        total: paraQualificar.length,
        leads: paraQualificar.slice(offset, offset + input.limit),
      };
    }),

  // Preenchimento automático com IA
  preencherComIA: publicProcedure
    .input(z.object({
      empresaId: z.number(),
      nomeEmpresa: z.string(),
      camposEmFalta: z.array(z.string()),
      dadosActuais: z.record(z.string(), z.any()).optional(), // campos já preenchidos na empresa
    }))
    .mutation(async ({ input }) => {
      const { invokeLLM } = await import("../_core/llm");

      // Filtrar apenas campos realmente vazios (sem dados actuais)
      const dadosActuais = input.dadosActuais || {};
      const camposVazios = input.camposEmFalta.filter(campo => {
        const val = dadosActuais[campo];
        return val === null || val === undefined || val === '' || val === 0;
      });

      // Se todos os campos já estão preenchidos, não chamar a IA
      if (camposVazios.length === 0) {
        return { sucesso: true, dados: {}, total: 0, mensagem: 'Todos os campos já estão preenchidos' };
      }

      const camposDesc = camposVazios.join(", ");

      const prompt = `Pesquisa informações sobre a empresa/organização "${input.nomeEmpresa}" (pode ser uma empresa portuguesa, resort, hotel, instituição ou outra entidade) e preenche os seguintes campos: ${camposDesc}.

Responde APENAS com JSON válido (sem markdown, sem explicações) com as chaves correspondentes:
- telefone: número de telefone principal (formato +351 XXX XXX XXX ou similar, ou string vazia se não souberes)
- email: email de contacto geral (ou string vazia se não souberes)
- website: URL do website oficial (com https://, ou string vazia se não souberes)
- sector: sector de actividade em português (ex: "Turismo", "Hotelaria", "Tecnologia", "Saúde", "Indústria", "Retalho", "Serviços", "Construção", "Educação", "Finanças", "Imobiliário", etc. — usa o mais adequado)
- numColaboradores: número estimado de colaboradores como inteiro (ou null se não souberes)
- nif: NIF português de 9 dígitos (ou string vazia se não souberes)
- cidade: cidade/localidade sede em Portugal (ou string vazia se não souberes)

IMPORTANTE: Usa o teu conhecimento de treino para preencher o máximo de campos possível. Para campos que não tens informação fiável, usa string vazia ou null. Não inventes dados que não conheces.`;

      try {
        const response = await invokeLLM({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "És um assistente especializado em pesquisa de informações sobre empresas portuguesas. Respondes sempre com JSON válido e preciso." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "empresa_info",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  telefone: { type: "string" },
                  email: { type: "string" },
                  website: { type: "string" },
                  sector: { type: "string" },
                  numColaboradores: { type: ["integer", "null"] },
                  nif: { type: "string" },
                  cidade: { type: "string" },
                },
                required: ["telefone", "email", "website", "sector", "numColaboradores", "nif", "cidade"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response?.choices?.[0]?.message?.content;
        if (!content) throw new Error("Resposta vazia da IA");

        const dados = JSON.parse(content as string);

        // Devolver apenas campos com valor encontrado pela IA E que estavam vazios (não sobrescrever dados existentes)
        const resultado: Record<string, any> = {};
        const CAMPOS = ['telefone', 'email', 'website', 'sector', 'numColaboradores', 'nif', 'cidade'];
        for (const chave of CAMPOS) {
          // Só incluir se: IA encontrou valor E campo estava vazio nos dados actuais
          const valorIA = dados[chave];
          const valorActual = dadosActuais[chave];
          const campoEstaVazio = valorActual === null || valorActual === undefined || valorActual === '' || valorActual === 0;
          if (valorIA !== null && valorIA !== undefined && valorIA !== '' && campoEstaVazio) {
            resultado[chave] = valorIA;
          }
        }

        return { sucesso: true, dados: resultado, total: Object.keys(resultado).length };
      } catch (err: any) {
        return { sucesso: false, dados: {}, total: 0, erro: err?.message || "Erro desconhecido" };
      }
    }),

  // Lista de empresas com score baixo
  empresasParaQualificar: publicProcedure
    .input(z.object({
      scoreMax: z.number().default(70),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");

      const todas = await db.select().from(crmEmpresas).where(eq(crmEmpresas.clienteAtivo, true));
      const paraQualificar = todas
        .map(e => ({ ...e, score: calcScore(e as any, CAMPOS_EMPRESA), camposFaltando: CAMPOS_EMPRESA.filter(c => isEmpty((e as any)[c.campo])).map(c => c.label) }))
        .filter(e => e.score <= input.scoreMax)
        .sort((a, b) => a.score - b.score);

      const offset = (input.page - 1) * input.limit;
      return {
        total: paraQualificar.length,
        empresas: paraQualificar.slice(offset, offset + input.limit),
      };
    }),
});
