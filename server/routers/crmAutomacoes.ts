import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db";
import { crmAutomacaoFila, crmAutomacaoLogs, crmAutomacoes, crmLeads, crmEmpresas } from "../../drizzle/schema";
import { router, publicProcedure } from "../_core/trpc";
import { executarAutomacao } from "../automacaoEngine";
import * as crypto from "crypto";

// ── Auth helpers (reutilizados do crm.ts) ─────────────────────────────────────
const CRM_COOKIE = "crm_session";
const CRM_SECRET = process.env.JWT_SECRET || "crm-secret-key";

function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const [b64, sig] = token.split(".");
    const expected = crypto.createHmac("sha256", CRM_SECRET).update(b64).digest("hex");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId, role: payload.role };
  } catch { return null; }
}

function getCrmSession(ctx: any): { userId: number; role: string } | null {
  const cookieHeader = ctx.req?.headers?.cookie as string | undefined;
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((c: string) => c.trim()).find((c: string) => c.startsWith(CRM_COOKIE + '='));
  const token = match ? decodeURIComponent(match.slice(CRM_COOKIE.length + 1)) : undefined;
  if (!token) return null;
  return verifyToken(token);
}

function requireCrmAuth(ctx: any) {
  const session = getCrmSession(ctx);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão CRM inválida ou expirada." });
  return session;
}

const crmProcedure = publicProcedure;

// ── Schemas de validação ──────────────────────────────────────────────────────
const triggerTipos = [
  "lead_criada", "lead_fase_alterada", "lead_sem_actividade",
  "proposta_enviada", "proposta_sem_resposta", "cliente_criado",
  "contrato_a_expirar", "newsletter_subscricao", "ebook_download",
  "reuniao_agendada", "reuniao_sem_followup", "lead_perdida",
  "cliente_perdido", "aniversario_contrato",
] as const;

const acaoTipos = [
  "enviar_email", "criar_alerta", "criar_actividade", "mover_fase",
  "notificar_responsavel", "enviar_email_interno", "criar_reuniao",
] as const;

const automacaoInput = z.object({
  nome:              z.string().min(1).max(255),
  descricao:         z.string().optional(),
  ativa:             z.boolean().default(true),
  triggerTipo:       z.enum(triggerTipos),
  triggerCondicoes:  z.record(z.string(), z.any()).optional(),
  delayHoras:        z.number().int().min(0).default(0),
  acaoTipo:          z.enum(acaoTipos),
  acaoConfig:        z.record(z.string(), z.any()),
  emailAssunto:      z.string().max(500).optional(),
  emailCorpo:        z.string().optional(),
  maxExecucoes:      z.number().int().positive().optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────
export const crmAutomacoesRouter = router({

  // Listar todas as automações
  list: crmProcedure
    .input(z.object({
      ativa: z.boolean().optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const conditions = [];
      if (input?.ativa !== undefined) conditions.push(eq(crmAutomacoes.ativa, input.ativa));
      const offset = ((input?.page ?? 1) - 1) * (input?.limit ?? 50);
      const [automacoes, [{ total }]] = await Promise.all([
        db.select().from(crmAutomacoes)
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(desc(crmAutomacoes.createdAt))
          .limit(input?.limit ?? 50).offset(offset),
        db.select({ total: sql<number>`count(*)` }).from(crmAutomacoes)
          .where(conditions.length ? and(...conditions) : undefined),
      ]);
      return { automacoes, total: Number(total) };
    }),

  // Obter uma automação por ID
  get: crmProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const [automacao] = await db.select().from(crmAutomacoes).where(eq(crmAutomacoes.id, input.id));
      if (!automacao) throw new TRPCError({ code: "NOT_FOUND", message: "Automação não encontrada." });
      return automacao;
    }),

  // Criar nova automação
  create: crmProcedure
    .input(automacaoInput)
    .mutation(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const [result] = await db.insert(crmAutomacoes).values({
        nome: input.nome,
        descricao: input.descricao,
        ativa: input.ativa,
        triggerTipo: input.triggerTipo,
        triggerCondicoes: input.triggerCondicoes ?? null,
        delayHoras: input.delayHoras,
        acaoTipo: input.acaoTipo,
        acaoConfig: input.acaoConfig,
        emailAssunto: input.emailAssunto,
        emailCorpo: input.emailCorpo,
        maxExecucoes: input.maxExecucoes,
        criadoPor: ctx.user?.id ?? null,
      });
      return { id: (result as any).insertId };
    }),

  // Actualizar automação
  update: crmProcedure
    .input(automacaoInput.partial().extend({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const { id, ...data } = input;
      await db.update(crmAutomacoes).set(data as any).where(eq(crmAutomacoes.id, id));
      return { ok: true };
    }),

  // Activar / desactivar automação
  toggleAtiva: crmProcedure
    .input(z.object({ id: z.number().int(), ativa: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      await db.update(crmAutomacoes).set({ ativa: input.ativa }).where(eq(crmAutomacoes.id, input.id));
      return { ok: true };
    }),

  // Eliminar automação
  delete: crmProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      await db.delete(crmAutomacoes).where(eq(crmAutomacoes.id, input.id));
      return { ok: true };
    }),

  // Executar automação manualmente (teste)
  executarManual: crmProcedure
    .input(z.object({
      automacaoId: z.number().int(),
      entidade: z.enum(["lead", "empresa", "contacto", "prospecting", "newsletter"]),
      entidadeId: z.number().int(),
    }))
    .mutation(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const [automacao] = await db.select().from(crmAutomacoes).where(eq(crmAutomacoes.id, input.automacaoId));
      if (!automacao) throw new TRPCError({ code: "NOT_FOUND", message: "Automação não encontrada." });
      const resultado = await executarAutomacao(automacao, {
        entidade: input.entidade,
        entidadeId: input.entidadeId,
        entidadeNome: "Execução manual",
        payload: {},
      });
      return resultado;
    }),

  // Simular automação (dry-run — sem efeitos reais na BD)
  simular: crmProcedure
    .input(z.object({
      // Configuração da automação (pode ser rascunho ainda não guardado)
      nome:         z.string().default("Simulação"),
      triggerTipo:  z.enum(triggerTipos),
      delayHoras:   z.number().int().min(0).default(0),
      acaoTipo:     z.enum(acaoTipos),
      acaoConfig:   z.record(z.string(), z.any()).default({}),
      emailAssunto: z.string().optional(),
      emailCorpo:   z.string().optional(),
      // Entidade de teste (opcional — usa dados fictícios se não fornecida)
      entidade:     z.enum(["lead", "empresa", "contacto", "prospecting", "newsletter"]).default("lead"),
      entidadeId:   z.number().int().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });

      // Construir entidade de teste
      let entidadeNome = "Empresa Teste Lda.";
      let payload: Record<string, any> = {
        fase: "proposta_enviada",
        mensalidade: "1.500€",
        responsavel: "Comercial Teste",
        data_renovacao: new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString("pt-PT"),
      };

      if (input.entidadeId) {
        try {
          if (input.entidade === "lead") {
            const [lead] = await db.select().from(crmLeads).where(eq(crmLeads.id, input.entidadeId));
            if (lead) { entidadeNome = lead.titulo || entidadeNome; payload.fase = lead.fase || payload.fase; }
          } else if (input.entidade === "empresa") {
            const [emp] = await db.select().from(crmEmpresas).where(eq(crmEmpresas.id, input.entidadeId));
            if (emp) { entidadeNome = emp.nome || entidadeNome; }
          }
        } catch { /* usa dados fictícios */ }
      }

      // Substituição de variáveis (sem executar acções reais)
      function substituir(template: string): string {
        const vars: Record<string, string> = {
          "{{nome_empresa}}": entidadeNome,
          "{{entidade}}": input.entidade,
          "{{data_hoje}}": new Date().toLocaleDateString("pt-PT"),
          "{{hora_hoje}}": new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
          ...Object.fromEntries(Object.entries(payload).map(([k, v]) => [`{{${k}}}`, String(v ?? "")])),
        };
        let r = template;
        for (const [k, v] of Object.entries(vars)) r = r.split(k).join(v);
        return r;
      }

      const cfg = input.acaoConfig || {};
      const titulo = substituir(cfg.titulo || input.nome || "Automação");
      const descricao = substituir(cfg.descricao || "");

      // Construir pré-visualização da acção (sem tocar na BD)
      let preview: Record<string, any> = {};
      switch (input.acaoTipo) {
        case "criar_alerta":
        case "notificar_responsavel":
          preview = {
            tipo: "Alerta",
            titulo,
            descricao: descricao || `Trigger: ${input.triggerTipo} em ${entidadeNome}`,
            prioridade: cfg.prioridade || "media",
          };
          break;
        case "criar_actividade":
        case "criar_reuniao": {
          const prazo = new Date();
          prazo.setDate(prazo.getDate() + (cfg.diasPrazo || 2));
          preview = {
            tipo: input.acaoTipo === "criar_reuniao" ? "Reunião" : "Actividade",
            titulo,
            descricao,
            prazo: prazo.toLocaleDateString("pt-PT"),
          };
          break;
        }
        case "mover_fase":
          preview = {
            tipo: "Mudança de fase",
            de: payload.fase || "fase_actual",
            para: cfg.novaFase || "?",
            entidade: entidadeNome,
          };
          break;
        case "enviar_email":
        case "enviar_email_interno":
          preview = {
            tipo: "Email",
            assunto: substituir(input.emailAssunto || cfg.assunto || "(sem assunto)"),
            corpo: substituir(input.emailCorpo || cfg.corpo || "(sem corpo)"),
            destinatario: input.acaoTipo === "enviar_email_interno" ? "Equipa interna" : entidadeNome,
          };
          break;
        default:
          preview = { tipo: input.acaoTipo, titulo, descricao };
      }

      return {
        sucesso: true,
        modoSimulacao: true,
        entidadeNome,
        triggerTipo: input.triggerTipo,
        acaoTipo: input.acaoTipo,
        delayHoras: input.delayHoras,
        preview,
        mensagem: `Simulação concluída — nenhum dado foi alterado.`,
      };
    }),

  // Listar logs de execução
  logs: crmProcedure
    .input(z.object({
      automacaoId: z.number().int().optional(),
      estado: z.enum(["sucesso", "erro", "pendente", "ignorado"]).optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const conditions = [];
      if (input?.automacaoId) conditions.push(eq(crmAutomacaoLogs.automacaoId, input.automacaoId));
      if (input?.estado) conditions.push(eq(crmAutomacaoLogs.estado, input.estado));
      const offset = ((input?.page ?? 1) - 1) * (input?.limit ?? 50);
      const [logs, [{ total }]] = await Promise.all([
        db.select({
          log: crmAutomacaoLogs,
          automacaoNome: crmAutomacoes.nome,
        }).from(crmAutomacaoLogs)
          .leftJoin(crmAutomacoes, eq(crmAutomacaoLogs.automacaoId, crmAutomacoes.id))
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(desc(crmAutomacaoLogs.createdAt))
          .limit(input?.limit ?? 50).offset(offset),
        db.select({ total: sql<number>`count(*)` }).from(crmAutomacaoLogs)
          .where(conditions.length ? and(...conditions) : undefined),
      ]);
      return { logs, total: Number(total) };
    }),

  // Estatísticas de automações
  stats: crmProcedure.query(async ({ ctx }) => {
    requireCrmAuth(ctx);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
    const [totalAtivas] = await db.select({ count: sql<number>`count(*)` }).from(crmAutomacoes).where(eq(crmAutomacoes.ativa, true));
    const [totalInativas] = await db.select({ count: sql<number>`count(*)` }).from(crmAutomacoes).where(eq(crmAutomacoes.ativa, false));
    const [execucoesSucesso] = await db.select({ count: sql<number>`count(*)` }).from(crmAutomacaoLogs).where(eq(crmAutomacaoLogs.estado, "sucesso"));
    const [execucoesErro] = await db.select({ count: sql<number>`count(*)` }).from(crmAutomacaoLogs).where(eq(crmAutomacaoLogs.estado, "erro"));
    const [pendentes] = await db.select({ count: sql<number>`count(*)` }).from(crmAutomacaoFila).where(eq(crmAutomacaoFila.estado, "pendente"));
    return {
      totalAtivas: Number(totalAtivas.count),
      totalInativas: Number(totalInativas.count),
      execucoesSucesso: Number(execucoesSucesso.count),
      execucoesErro: Number(execucoesErro.count),
      pendentes: Number(pendentes.count),
    };
  }),

  // Fila de automações pendentes
  fila: crmProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(100).default(20) }).optional())
    .query(async ({ input, ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const offset = ((input?.page ?? 1) - 1) * (input?.limit ?? 20);
      const fila = await db.select({
        item: crmAutomacaoFila,
        automacaoNome: crmAutomacoes.nome,
      }).from(crmAutomacaoFila)
        .leftJoin(crmAutomacoes, eq(crmAutomacaoFila.automacaoId, crmAutomacoes.id))
        .where(eq(crmAutomacaoFila.estado, "pendente"))
        .orderBy(crmAutomacaoFila.agendadoPara)
        .limit(input?.limit ?? 20).offset(offset);
      return fila;
    }),
});
