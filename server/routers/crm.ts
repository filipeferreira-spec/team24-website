/**
 * CRM TEAM 24 — Router tRPC
 * Autenticação própria (email + password), gestão de leads, empresas, contactos, actividades, alertas
 */
import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc, asc, and, or, like, isNull, isNotNull, sql, lt, lte, gte, ne, inArray } from "drizzle-orm";
import { getDb } from "../db";
import * as crypto from "crypto";
import {
  crmUsers, crmEmpresas, crmContactos, crmLeads, crmActividades,
  crmPropostas, crmAlertas, crmReunioes, crmRegrasAlerta
} from "../../drizzle/schema";
import { storagePut } from "../storage";

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const CRM_COOKIE = "crm_session";
const CRM_SECRET = process.env.JWT_SECRET || "crm-secret-key";

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", CRM_SECRET).update(password).digest("hex");
}

function signToken(payload: { userId: number; role: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 8 * 60 * 60 * 1000 }); // 8h
  const b64 = Buffer.from(data).toString("base64url");
  const sig = crypto.createHmac("sha256", CRM_SECRET).update(b64).digest("hex");
  return `${b64}.${sig}`;
}

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

function parseCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.split(';').map((c: string) => c.trim()).find((c: string) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}
function getCrmSession(ctx: any): { userId: number; role: string } | null {
  const cookieHeader = ctx.req?.headers?.cookie as string | undefined;
  const token = parseCookieValue(cookieHeader, CRM_COOKIE);
  if (!token) return null;
  return verifyToken(token);
}

function requireCrmAuth(ctx: any) {
  const session = getCrmSession(ctx);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão CRM inválida ou expirada." });
  return session;
}

function requireCrmAdmin(ctx: any) {
  const session = requireCrmAuth(ctx);
  if (session.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  return session;
}

// ─── Procedure helpers ────────────────────────────────────────────────────────
const crmProcedure = publicProcedure;

// ─── Router ───────────────────────────────────────────────────────────────────
import { crmFunilRouter } from "./crmFunil";
import { crmProspectingRouter } from "./crmProspecting";

export const crmRouter = router({

  // ── AUTH ──────────────────────────────────────────────────────────────────
  auth: router({
    login: crmProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const [user] = await db.select().from(crmUsers)
          .where(and(eq(crmUsers.email, input.email), eq(crmUsers.ativo, true)))
          .limit(1);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas." });
        const hash = hashPassword(input.password);
        if (user.passwordHash !== hash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas." });
        // Actualizar último login
        await db.update(crmUsers).set({ ultimoLogin: new Date() }).where(eq(crmUsers.id, user.id));
        const token = signToken({ userId: user.id, role: user.role });
        ctx.res.cookie(CRM_COOKIE, token, {
          httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
          maxAge: 8 * 60 * 60 * 1000
        });
        return { success: true, user: { id: user.id, nome: user.nome, email: user.email, role: user.role, avatarUrl: user.avatarUrl } };
      }),

    logout: crmProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(CRM_COOKIE);
      return { success: true };
    }),

    me: crmProcedure.query(async ({ ctx }) => {
      const session = getCrmSession(ctx);
      if (!session) return null;
      const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const [user] = await db.select({
        id: crmUsers.id, nome: crmUsers.nome, email: crmUsers.email,
        role: crmUsers.role, avatarUrl: crmUsers.avatarUrl, telefone: crmUsers.telefone
      }).from(crmUsers).where(eq(crmUsers.id, session.userId)).limit(1);
      return user || null;
    }),
  }),

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  dashboard: router({
    stats: crmProcedure.query(async ({ ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const [totalLeads] = await db.select({ count: sql<number>`count(*)` }).from(crmLeads).where(eq(crmLeads.ativo, true));
      const [totalEmpresas] = await db.select({ count: sql<number>`count(*)` }).from(crmEmpresas);
      const [clientesAtivos] = await db.select({ count: sql<number>`count(*)` }).from(crmEmpresas).where(eq(crmEmpresas.clienteAtivo, true));
      const [alertasPendentes] = await db.select({ count: sql<number>`count(*)` }).from(crmAlertas).where(eq(crmAlertas.estado, "pendente"));
      // Pipeline por fase
      const pipeline = await db.select({
        fase: crmLeads.fase,
        count: sql<number>`count(*)`,
        valor: sql<number>`COALESCE(SUM(mensalidade), 0)`
      }).from(crmLeads).where(eq(crmLeads.ativo, true)).groupBy(crmLeads.fase);
      // Reuniões próximas (7 dias)
      const agora = new Date();
      const em7dias = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
      const reunioes = await db.select({
        id: crmReunioes.id, titulo: crmReunioes.titulo,
        dataInicio: crmReunioes.dataInicio, tipo: crmReunioes.tipo
      }).from(crmReunioes)
        .where(and(gte(crmReunioes.dataInicio, agora), lte(crmReunioes.dataInicio, em7dias), eq(crmReunioes.estado, "agendada")))
        .orderBy(asc(crmReunioes.dataInicio)).limit(5);
      return {
        totalLeads: Number(totalLeads.count),
        totalEmpresas: Number(totalEmpresas.count),
        clientesAtivos: Number(clientesAtivos.count),
        alertasPendentes: Number(alertasPendentes.count),
        pipeline,
        reunioes
      };
    }),

    actividadesRecentes: crmProcedure.query(async ({ ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      return db.select({
        id: crmActividades.id, tipo: crmActividades.tipo,
        titulo: crmActividades.titulo, dataActividade: crmActividades.dataActividade,
        concluida: crmActividades.concluida,
        empresaNome: crmEmpresas.nome
      }).from(crmActividades)
        .leftJoin(crmEmpresas, eq(crmActividades.empresaId, crmEmpresas.id))
        .orderBy(desc(crmActividades.dataActividade)).limit(20);
    }),

    proximasRenovacoes: crmProcedure.query(async ({ ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const agora = new Date();
      // Empresas com dataFimContrato definida, ordenadas por data mais próxima
      const empresas = await db.select({
        id: crmEmpresas.id,
        nome: crmEmpresas.nome,
        sector: crmEmpresas.sector,
        dataFimContrato: crmEmpresas.dataFimContrato,
        dataInicioContrato: crmEmpresas.dataInicioContrato,
        mensalidade: crmEmpresas.mensalidade,
        valorMensalidade: crmEmpresas.valorMensalidade,
        clienteAtivo: crmEmpresas.clienteAtivo,
      }).from(crmEmpresas)
        .where(isNotNull(crmEmpresas.dataFimContrato))
        .orderBy(asc(crmEmpresas.dataFimContrato))
        .limit(5);
      return empresas;
    }),

    // Causas de perda de clientes (motivoPerda agrupado) — com filtro de data
    causasPerda: crmProcedure
      .input(z.object({
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const di = input?.dataInicio ? new Date(input.dataInicio) : undefined;
        const df = input?.dataFim ? new Date(input.dataFim) : undefined;
        // Causas de perda de clientes
        const condClientes: any[] = [eq(crmEmpresas.clienteAtivo, false), isNotNull(crmEmpresas.motivoPerda)];
        if (di) condClientes.push(gte(crmEmpresas.updatedAt, di));
        if (df) condClientes.push(lte(crmEmpresas.updatedAt, df));
        const causasClientes = await db.select({
          motivo: crmEmpresas.motivoPerda,
          count: sql<number>`count(*)`,
        }).from(crmEmpresas)
          .where(and(...condClientes))
          .groupBy(crmEmpresas.motivoPerda)
          .orderBy(desc(sql`count(*)`));
        // Causas de perda de leads
        const condLeads: any[] = [eq(crmLeads.fase, "lost" as any), isNotNull(crmLeads.motivoPerda)];
        if (di) condLeads.push(gte(crmLeads.updatedAt, di));
        if (df) condLeads.push(lte(crmLeads.updatedAt, df));
        const causasLeads = await db.select({
          motivo: crmLeads.motivoPerda,
          count: sql<number>`count(*)`,
        }).from(crmLeads)
          .where(and(...condLeads))
          .groupBy(crmLeads.motivoPerda)
          .orderBy(desc(sql`count(*)`));
        return { causasClientes, causasLeads };
      }),

    // Insights sobre clientes activos, perdidos e tendências — com filtro de data
    insightsClientes: crmProcedure
      .input(z.object({
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const di = input?.dataInicio ? new Date(input.dataInicio) : undefined;
        const df = input?.dataFim ? new Date(input.dataFim) : undefined;
        // Totais (sem filtro de data — são estado actual)
        const [{ ativos }] = await db.select({ ativos: sql<number>`count(*)` }).from(crmEmpresas).where(eq(crmEmpresas.clienteAtivo, true));
        const [{ perdidos }] = await db.select({ perdidos: sql<number>`count(*)` }).from(crmEmpresas).where(eq(crmEmpresas.clienteAtivo, false));
        // Receita mensal total (clientes activos)
        const [{ receitaTotal }] = await db.select({ receitaTotal: sql<number>`COALESCE(SUM(valorMensalidade), 0)` }).from(crmEmpresas).where(and(eq(crmEmpresas.clienteAtivo, true), isNotNull(crmEmpresas.valorMensalidade)));
        // Receita em risco (contratos a expirar nos próximos 60 dias)
        const hoje = new Date();
        const em60dias = new Date(hoje.getTime() + 60 * 24 * 60 * 60 * 1000);
        const [{ receitaRisco }] = await db.select({ receitaRisco: sql<number>`COALESCE(SUM(valorMensalidade), 0)` })
          .from(crmEmpresas)
          .where(and(eq(crmEmpresas.clienteAtivo, true), isNotNull(crmEmpresas.dataFimContrato), gte(crmEmpresas.dataFimContrato, hoje), lte(crmEmpresas.dataFimContrato, em60dias)));
        // Distribuição por sector (clientes activos)
        const porSector = await db.select({
          sector: crmEmpresas.sector,
          count: sql<number>`count(*)`,
          receita: sql<number>`COALESCE(SUM(valorMensalidade), 0)`,
        }).from(crmEmpresas)
          .where(and(eq(crmEmpresas.clienteAtivo, true), isNotNull(crmEmpresas.sector)))
          .groupBy(crmEmpresas.sector)
          .orderBy(desc(sql`count(*)`));
        // Novos clientes no período seleccionado (ou últimos 30 dias se sem filtro)
        const periodoInicio = di ?? new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        const periodoFim = df ?? hoje;
        const [{ novosNoPeriodo }] = await db.select({ novosNoPeriodo: sql<number>`count(*)` })
          .from(crmEmpresas)
          .where(and(eq(crmEmpresas.clienteAtivo, true), gte(crmEmpresas.createdAt, periodoInicio), lte(crmEmpresas.createdAt, periodoFim)));
        // Leads perdidas no período
        const condLeadsPerdidas: any[] = [eq(crmLeads.fase, "lost" as any)];
        if (di) condLeadsPerdidas.push(gte(crmLeads.updatedAt, di));
        if (df) condLeadsPerdidas.push(lte(crmLeads.updatedAt, df));
        const [{ leadsPerdidas }] = await db.select({ leadsPerdidas: sql<number>`count(*)` })
          .from(crmLeads).where(and(...condLeadsPerdidas));
        // Leads ganhas (won) no período
        const condLeadsGanhas: any[] = [eq(crmLeads.fase, "won" as any)];
        if (di) condLeadsGanhas.push(gte(crmLeads.updatedAt, di));
        if (df) condLeadsGanhas.push(lte(crmLeads.updatedAt, df));
        const [{ leadsGanhas }] = await db.select({ leadsGanhas: sql<number>`count(*)` })
          .from(crmLeads).where(and(...condLeadsGanhas));
        // Taxa de retenção
        const totalHistorico = Number(ativos) + Number(perdidos);
        const taxaRetencao = totalHistorico > 0 ? Math.round((Number(ativos) / totalHistorico) * 100) : 0;
        return {
          ativos: Number(ativos),
          perdidos: Number(perdidos),
          receitaTotal: Number(receitaTotal),
          receitaRisco: Number(receitaRisco),
          novosNoPeriodo: Number(novosNoPeriodo),
          leadsPerdidas: Number(leadsPerdidas),
          leadsGanhas: Number(leadsGanhas),
          taxaRetencao,
          porSector,
        };
      }),
  }),

  // ── LEADS ─────────────────────────────────────────────────────────────────
  leads: router({
    list: crmProcedure
      .input(z.object({
        fase: z.string().optional(),
        search: z.string().optional(),
        responsavelId: z.number().optional(),
        ativo: z.boolean().optional().default(true),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const offset = (input.page - 1) * input.limit;
        const conditions = [];
        // Leads perdidas (fase=lost) têm ativo=false — não filtrar por ativo nesse caso
        if (input.fase === "lost") {
          conditions.push(eq(crmLeads.fase, "lost" as any));
        } else {
          if (input.ativo !== undefined) conditions.push(eq(crmLeads.ativo, input.ativo));
          if (input.fase) conditions.push(eq(crmLeads.fase, input.fase as any));
        }
        if (input.responsavelId) conditions.push(eq(crmLeads.responsavelId, input.responsavelId));
        if (input.search) conditions.push(or(
          like(crmLeads.titulo, `%${input.search}%`),
          like(crmEmpresas.nome, `%${input.search}%`)
        ));
        const leads = await db.select({
          id: crmLeads.id, titulo: crmLeads.titulo, fase: crmLeads.fase,
          valorEstimado: crmLeads.valorEstimado, mensalidade: crmLeads.mensalidade,
          probabilidade: crmLeads.probabilidade, ultimaActividade: crmLeads.ultimaActividade,
          ativo: crmLeads.ativo, motivoPerda: crmLeads.motivoPerda,
          createdAt: crmLeads.createdAt, updatedAt: crmLeads.updatedAt,
          empresaId: crmLeads.empresaId, empresaNome: crmEmpresas.nome,
          responsavelId: crmLeads.responsavelId,
          // Usa nome do utilizador CRM se existir, caso contrário usa o nome migrado do Odoo
          responsavelNome: sql<string>`COALESCE(${crmUsers.nome}, ${crmLeads.responsavelNome})`,
        }).from(crmLeads)
          .leftJoin(crmEmpresas, eq(crmLeads.empresaId, crmEmpresas.id))
          .leftJoin(crmUsers, eq(crmLeads.responsavelId, crmUsers.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(crmLeads.updatedAt))
          .limit(input.limit).offset(offset);
        const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(crmLeads)
          .leftJoin(crmEmpresas, eq(crmLeads.empresaId, crmEmpresas.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined);
        return { leads, total: Number(count), page: input.page, limit: input.limit };
      }),

    kanban: crmProcedure.query(async ({ ctx }) => {
      requireCrmAuth(ctx);
      const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      const leads = await db.select({
        id: crmLeads.id, titulo: crmLeads.titulo, fase: crmLeads.fase,
        valorEstimado: crmLeads.valorEstimado, mensalidade: crmLeads.mensalidade,
        probabilidade: crmLeads.probabilidade, ultimaActividade: crmLeads.ultimaActividade,
        createdAt: crmLeads.createdAt,
        empresaId: crmLeads.empresaId, empresaNome: crmEmpresas.nome,
        responsavelId: crmLeads.responsavelId,
        // Usa nome do utilizador CRM se existir, caso contrário usa o nome migrado do Odoo
        responsavelNome: sql<string>`COALESCE(${crmUsers.nome}, ${crmLeads.responsavelNome})`,
      }).from(crmLeads)
        .leftJoin(crmEmpresas, eq(crmLeads.empresaId, crmEmpresas.id))
        .leftJoin(crmUsers, eq(crmLeads.responsavelId, crmUsers.id))
        .where(eq(crmLeads.ativo, true))
        .orderBy(desc(crmLeads.updatedAt));
      return leads;
    }),

    byId: crmProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const [lead] = await db.select().from(crmLeads).where(eq(crmLeads.id, input.id)).limit(1);
        if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
        const empresa = lead.empresaId ? await db.select().from(crmEmpresas).where(eq(crmEmpresas.id, lead.empresaId)).limit(1) : [];
        const actividades = await db.select().from(crmActividades)
          .where(eq(crmActividades.leadId, input.id))
          .orderBy(desc(crmActividades.dataActividade)).limit(20);
        const propostas = await db.select().from(crmPropostas)
          .where(eq(crmPropostas.leadId, input.id))
          .orderBy(desc(crmPropostas.createdAt));
        return { ...lead, empresa: empresa[0] || null, actividades, propostas };
      }),

    create: crmProcedure
      .input(z.object({
        titulo: z.string().min(1),
        empresaId: z.number().optional(),
        empresaNome: z.string().optional(),
        contactoId: z.number().optional(),
        fase: z.enum(["leads","em_tratamento","reuniao_agendada","proposta_enviada","proposta_adjudicada","won","renovacoes_pendente","contratos_renovados","contratos_terminados","servicos_isolados","lost"]).optional().default("leads"),
        valorEstimado: z.number().optional(),
        mensalidade: z.number().optional(),
        origem: z.string().optional(),
        notas: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        let empresaId = input.empresaId;
        // Criar empresa se só veio o nome
        if (!empresaId && input.empresaNome) {
          const [result] = await db.insert(crmEmpresas).values({ nome: input.empresaNome, fonte: "crm" });
          empresaId = (result as any).insertId;
        }
        const [result] = await db.insert(crmLeads).values({
          titulo: input.titulo, empresaId, contactoId: input.contactoId,
          responsavelId: session.userId, fase: input.fase,
          valorEstimado: input.valorEstimado, mensalidade: input.mensalidade,
          origem: input.origem, notas: input.notas,
          ultimaActividade: new Date(),
        });
        const leadId = (result as any).insertId;
        // Criar alerta de nova lead
        await db.insert(crmAlertas).values({
          tipo: "nova_lead", titulo: `Nova lead: ${input.titulo}`,
          descricao: `Lead criada por utilizador CRM`,
          prioridade: "media", responsavelId: session.userId, leadId,
        });
        return { id: leadId };
      }),

    update: crmProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        fase: z.enum(["leads","em_tratamento","reuniao_agendada","proposta_enviada","proposta_adjudicada","won","renovacoes_pendente","contratos_renovados","contratos_terminados","servicos_isolados","lost"]).optional(),
        valorEstimado: z.number().optional().nullable(),
        mensalidade: z.number().optional().nullable(),
        mensalidadeComEap: z.number().optional().nullable(),
        valorTotal: z.number().optional().nullable(),
        probabilidade: z.number().min(0).max(100).optional(),
        responsavelId: z.number().optional().nullable(),
        empresaId: z.number().optional().nullable(),
        tipoEap: z.string().optional().nullable(),
        videoconsultas: z.string().optional().nullable(),
        workshops: z.string().optional().nullable(),
        avaliacaoRiscos: z.string().optional().nullable(),
        dataFechamento: z.string().optional().nullable(),
        dataRenovacao: z.string().optional().nullable(),
        motivoPerda: z.string().optional().nullable(),
        notas: z.string().optional().nullable(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const { id, ...data } = input;
        const updateData: any = { ...data, ultimaActividade: new Date(), updatedAt: new Date() };
        if (data.dataFechamento) updateData.dataFechamento = new Date(data.dataFechamento);
        if (data.dataRenovacao) updateData.dataRenovacao = new Date(data.dataRenovacao);
        await db.update(crmLeads).set(updateData).where(eq(crmLeads.id, id));
        return { success: true };
      }),

    moveFase: crmProcedure
      .input(z.object({
        id: z.number(),
        fase: z.enum(["leads","em_tratamento","reuniao_agendada","proposta_enviada","proposta_adjudicada","won","renovacoes_pendente","contratos_renovados","contratos_terminados","servicos_isolados","lost"]),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        await db.update(crmLeads).set({
          fase: input.fase,
          ativo: input.fase !== "lost",
          ultimaActividade: new Date(),
          updatedAt: new Date()
        }).where(eq(crmLeads.id, input.id));
        return { success: true };
      }),

    reativar: crmProcedure
      .input(z.object({
        id: z.number(),
        fase: z.enum(["leads","em_tratamento","reuniao_agendada","proposta_enviada","proposta_adjudicada"]).optional().default("em_tratamento"),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        await db.update(crmLeads).set({
          fase: input.fase,
          ativo: true,
          motivoPerda: null,
          ultimaActividade: new Date(),
          updatedAt: new Date()
        }).where(eq(crmLeads.id, input.id));
        return { success: true };
      }),

    delete: crmProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        // Apagar actividades, propostas e alertas associados antes de apagar a lead
        await db.delete(crmActividades).where(eq(crmActividades.leadId, input.id));
        await db.delete(crmPropostas).where(eq(crmPropostas.leadId, input.id));
        await db.delete(crmAlertas).where(eq(crmAlertas.leadId, input.id));
        await db.delete(crmLeads).where(eq(crmLeads.id, input.id));
        return { success: true };
      }),

    converterParaEmpresa: crmProcedure
      .input(z.object({
        id: z.number(),
        nomeEmpresa: z.string().min(1),
        sector: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        website: z.string().optional(),
        numColaboradores: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        // Verificar se a lead existe
        const [lead] = await db.select().from(crmLeads).where(eq(crmLeads.id, input.id)).limit(1);
        if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Lead não encontrada." });
        // Criar a empresa
        const [result] = await db.insert(crmEmpresas).values({
          nome: input.nomeEmpresa,
          sector: input.sector as any || null,
          email: input.email || null,
          telefone: input.telefone || null,
          website: input.website || null,
          numColaboradores: input.numColaboradores || null,
          clienteAtivo: false,
        });
        const empresaId = (result as any).insertId;
        // Associar a lead à empresa criada e avançar para em_tratamento
        await db.update(crmLeads).set({
          empresaId,
          fase: lead.fase === 'leads' ? 'em_tratamento' : lead.fase,
          updatedAt: new Date(),
          ultimaActividade: new Date(),
        }).where(eq(crmLeads.id, input.id));
        return { success: true, empresaId };
      }),
  }),

  // ── EMPRESAS ──────────────────────────────────────────────────────────────
  empresas: router({
    list: crmProcedure
      .input(z.object({
        search: z.string().optional(),
        clienteAtivo: z.boolean().optional(),
        segmento: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const offset = (input.page - 1) * input.limit;
        const conditions = [];
        if (input.search) conditions.push(or(like(crmEmpresas.nome, `%${input.search}%`), like(crmEmpresas.email, `%${input.search}%`)));
        if (input.clienteAtivo !== undefined) conditions.push(eq(crmEmpresas.clienteAtivo, input.clienteAtivo));
        if (input.segmento) conditions.push(eq(crmEmpresas.segmento, input.segmento as any));
        const empresas = await db.select().from(crmEmpresas)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(asc(crmEmpresas.nome))
          .limit(input.limit).offset(offset);
        const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(crmEmpresas)
          .where(conditions.length > 0 ? and(...conditions) : undefined);
        return { empresas, total: Number(count), page: input.page, limit: input.limit };
      }),

    byId: crmProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const [empresa] = await db.select().from(crmEmpresas).where(eq(crmEmpresas.id, input.id)).limit(1);
        if (!empresa) throw new TRPCError({ code: "NOT_FOUND" });
        const contactos = await db.select().from(crmContactos).where(eq(crmContactos.empresaId, input.id));
        const leads = await db.select({
          id: crmLeads.id, titulo: crmLeads.titulo, fase: crmLeads.fase,
          mensalidade: crmLeads.mensalidade, updatedAt: crmLeads.updatedAt
        }).from(crmLeads).where(eq(crmLeads.empresaId, input.id)).orderBy(desc(crmLeads.updatedAt)).limit(10);
        const actividades = await db.select().from(crmActividades)
          .where(eq(crmActividades.empresaId, input.id))
          .orderBy(desc(crmActividades.dataActividade)).limit(20);
        const propostas = await db.select().from(crmPropostas)
          .where(eq(crmPropostas.empresaId, input.id))
          .orderBy(desc(crmPropostas.createdAt)).limit(20);
        return { ...empresa, contactos, leads, actividades, propostas };
      }),

    create: crmProcedure
      .input(z.object({
        nome: z.string().min(1),
        nif: z.string().optional(),
        sector: z.string().optional(),
        numColaboradores: z.number().optional(),
        website: z.string().optional(),
        linkedin: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        cidade: z.string().optional(),
        morada: z.string().optional(),
        segmento: z.enum(["pme","grande_empresa","multinacional","setor_publico","ong","outro"]).optional(),
        notas: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const [result] = await db.insert(crmEmpresas).values({ ...input, fonte: "crm" });
        return { id: (result as any).insertId };
      }),

    update: crmProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        nif: z.string().optional().nullable(),
        sector: z.string().optional().nullable(),
        numColaboradores: z.number().optional().nullable(),
        website: z.string().optional().nullable(),
        linkedin: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        telefone: z.string().optional().nullable(),
        cidade: z.string().optional().nullable(),
        morada: z.string().optional().nullable(),
        segmento: z.enum(["pme","grande_empresa","multinacional","setor_publico","ong","outro"]).optional(),
        clienteAtivo: z.boolean().optional(),
        valorMensalidade: z.number().optional().nullable(),
        notas: z.string().optional().nullable(),
        motivoPerda: z.string().optional().nullable(),
        dataInicioContrato: z.string().optional().nullable(),
        dataFimContrato: z.string().optional().nullable(),
        camposPreenchidosIA: z.string().optional().nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const { id, dataInicioContrato, dataFimContrato, ...data } = input;
        const updateData: any = { ...data, updatedAt: new Date() };
        if (dataInicioContrato) updateData.dataInicioContrato = new Date(dataInicioContrato);
        else if (dataInicioContrato === null) updateData.dataInicioContrato = null;
        if (dataFimContrato) updateData.dataFimContrato = new Date(dataFimContrato);
        else if (dataFimContrato === null) updateData.dataFimContrato = null;
        await db.update(crmEmpresas).set(updateData).where(eq(crmEmpresas.id, id));
        return { success: true };
      }),
  }),

  // ── CONTACTOS ─────────────────────────────────────────────────────────────
  contactos: router({
    byEmpresa: crmProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        return db.select().from(crmContactos).where(eq(crmContactos.empresaId, input.empresaId));
      }),

    create: crmProcedure
      .input(z.object({
        empresaId: z.number().optional(),
        nome: z.string().min(1),
        cargo: z.string().optional(),
        departamento: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        telemovel: z.string().optional(),
        linkedin: z.string().optional(),
        decisor: z.boolean().optional().default(false),
        notas: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const [result] = await db.insert(crmContactos).values(input);
        return { id: (result as any).insertId };
      }),

    update: crmProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        cargo: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        telefone: z.string().optional().nullable(),
        telemovel: z.string().optional().nullable(),
        linkedin: z.string().optional().nullable(),
        decisor: z.boolean().optional(),
        notas: z.string().optional().nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const { id, ...data } = input;
        await db.update(crmContactos).set({ ...data, updatedAt: new Date() }).where(eq(crmContactos.id, id));
        return { success: true };
      }),
  }),

  // ── ACTIVIDADES ───────────────────────────────────────────────────────────
  actividades: router({
    create: crmProcedure
      .input(z.object({
        leadId: z.number().optional(),
        empresaId: z.number().optional(),
        tipo: z.enum(["chamada","email","reuniao","nota","proposta","contrato","outro"]),
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        resultado: z.string().optional(),
        dataActividade: z.string(),
        duracao: z.number().optional(),
        concluida: z.boolean().optional().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const [result] = await db.insert(crmActividades).values({
          ...input,
          criadoPorId: session.userId,
          dataActividade: new Date(input.dataActividade),
        });
        // Actualizar ultimaActividade da lead
        if (input.leadId) {
          await db.update(crmLeads).set({ ultimaActividade: new Date() }).where(eq(crmLeads.id, input.leadId));
        }
        return { id: (result as any).insertId };
      }),

    byLead: crmProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        return db.select().from(crmActividades)
          .where(eq(crmActividades.leadId, input.leadId))
          .orderBy(desc(crmActividades.dataActividade));
      }),
  }),

  // ── ALERTAS ───────────────────────────────────────────────────────────────
  alertas: router({
    list: crmProcedure
      .input(z.object({
        estado: z.enum(["pendente","enviado","resolvido","ignorado"]).optional().default("pendente"),
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input, ctx }) => {
        const session = requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const conditions = [eq(crmAlertas.estado, input.estado)];
        if (session.role !== "admin") conditions.push(eq(crmAlertas.responsavelId, session.userId));
        return db.select({
          id: crmAlertas.id, tipo: crmAlertas.tipo, titulo: crmAlertas.titulo,
          descricao: crmAlertas.descricao, prioridade: crmAlertas.prioridade,
          estado: crmAlertas.estado, createdAt: crmAlertas.createdAt,
          empresaNome: crmEmpresas.nome, leadTitulo: crmLeads.titulo,
        }).from(crmAlertas)
          .leftJoin(crmEmpresas, eq(crmAlertas.empresaId, crmEmpresas.id))
          .leftJoin(crmLeads, eq(crmAlertas.leadId, crmLeads.id))
          .where(and(...conditions))
          .orderBy(desc(crmAlertas.createdAt))
          .limit(input.limit);
      }),

    resolver: crmProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        await db.update(crmAlertas).set({ estado: "resolvido", resolvidoAt: new Date() }).where(eq(crmAlertas.id, input.id));
        return { success: true };
      }),

    ignorar: crmProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        await db.update(crmAlertas).set({ estado: "ignorado" }).where(eq(crmAlertas.id, input.id));
        return { success: true };
      }),

    criarManual: crmProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        tipo: z.enum(["lead_sem_actividade","proposta_sem_resposta","contrato_renovacao","nova_lead","reuniao_proxima","follow_up","outro"]),
        prioridade: z.enum(["baixa","media","alta","urgente"]).default("media"),
        leadId: z.number().optional(),
        empresaId: z.number().optional(),
        responsavelId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        await db.insert(crmAlertas).values({
          tipo: input.tipo,
          titulo: input.titulo,
          descricao: input.descricao || null,
          prioridade: input.prioridade,
          estado: "pendente",
          leadId: input.leadId || null,
          empresaId: input.empresaId || null,
          responsavelId: input.responsavelId || session.userId,
          emailEnviado: false,
        });
        return { success: true };
      }),

    listarRegras: crmProcedure
      .query(async ({ ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        return db.select().from(crmRegrasAlerta).orderBy(asc(crmRegrasAlerta.tipo), asc(crmRegrasAlerta.diasAntecedencia));
      }),

    toggleRegra: crmProcedure
      .input(z.object({ id: z.number(), ativo: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        await db.update(crmRegrasAlerta).set({ ativo: input.ativo }).where(eq(crmRegrasAlerta.id, input.id));
        return { success: true };
      }),

    editarRegra: crmProcedure
      .input(z.object({
        id: z.number(),
        diasAntecedencia: z.number().optional(),
        prioridade: z.enum(["baixa","media","alta","urgente"]).optional(),
        limiarMensalidade: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const updates: Record<string, any> = {};
        if (input.diasAntecedencia !== undefined) updates.diasAntecedencia = input.diasAntecedencia;
        if (input.prioridade !== undefined) updates.prioridade = input.prioridade;
        if (input.limiarMensalidade !== undefined) updates.limiarMensalidade = input.limiarMensalidade;
        await db.update(crmRegrasAlerta).set(updates).where(eq(crmRegrasAlerta.id, input.id));
        return { success: true };
      }),

    executarVerificacao: crmProcedure
      .mutation(async ({ ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const regras = await db.select().from(crmRegrasAlerta).where(eq(crmRegrasAlerta.ativo, true));
        const hoje = new Date();
        let criados = 0;

        for (const regra of regras) {
          const dias = regra.diasAntecedencia ?? 0;
          const limiar = new Date(hoje);
          limiar.setDate(limiar.getDate() - dias);

          if (regra.tipo === "renovacao_contrato" || regra.tipo === "contrato_expirado") {
            const dataAlvo = new Date(hoje);
            dataAlvo.setDate(dataAlvo.getDate() + dias);
            const dataMin = new Date(dataAlvo); dataMin.setDate(dataMin.getDate() - 1);
            const empresas = await db.select({ id: crmEmpresas.id, nome: crmEmpresas.nome, dataFimContrato: crmEmpresas.dataFimContrato })
              .from(crmEmpresas)
              .where(and(
                isNotNull(crmEmpresas.dataFimContrato),
                eq(crmEmpresas.clienteAtivo, true),
                regra.tipo === "contrato_expirado"
                  ? lt(crmEmpresas.dataFimContrato, hoje)
                  : and(gte(crmEmpresas.dataFimContrato, dataMin), lte(crmEmpresas.dataFimContrato, dataAlvo))
              ));
            for (const emp of empresas) {
              const jaExiste = await db.select({ id: crmAlertas.id }).from(crmAlertas)
                .where(and(eq(crmAlertas.empresaId, emp.id), eq(crmAlertas.titulo, `${regra.nome}: ${emp.nome}`), eq(crmAlertas.estado, "pendente")))
                .limit(1);
              if (jaExiste.length === 0) {
                await db.insert(crmAlertas).values({
                  tipo: "contrato_renovacao", titulo: `${regra.nome}: ${emp.nome}`,
                  descricao: regra.descricao || null, prioridade: regra.prioridade,
                  estado: "pendente", empresaId: emp.id, emailEnviado: false,
                });
                criados++;
              }
            }
          }

          if (regra.tipo === "lead_sem_actividade") {
            const leads = await db.select({ id: crmLeads.id, titulo: crmLeads.titulo, responsavelId: crmLeads.responsavelId })
              .from(crmLeads)
              .where(and(
                eq(crmLeads.ativo, true),
                sql`${crmLeads.fase} NOT IN ('ganho','perdido','leads','lost')`,
                lte(crmLeads.ultimaActividade, limiar)
              ));
            for (const lead of leads) {
              const jaExiste = await db.select({ id: crmAlertas.id }).from(crmAlertas)
                .where(and(eq(crmAlertas.leadId, lead.id), eq(crmAlertas.tipo, "lead_sem_actividade"), eq(crmAlertas.estado, "pendente")))
                .limit(1);
              if (jaExiste.length === 0) {
                await db.insert(crmAlertas).values({
                  tipo: "lead_sem_actividade", titulo: `${regra.nome}: ${lead.titulo}`,
                  descricao: regra.descricao || null, prioridade: regra.prioridade,
                  estado: "pendente", leadId: lead.id,
                  responsavelId: lead.responsavelId || null, emailEnviado: false,
                });
                criados++;
              }
            }
          }

          if (regra.tipo === "lead_nova_website") {
            const ontem = new Date(hoje); ontem.setDate(ontem.getDate() - dias);
            const leads = await db.select({ id: crmLeads.id, titulo: crmLeads.titulo })
              .from(crmLeads)
              .where(and(
                eq(crmLeads.ativo, true),
                eq(crmLeads.fase, "leads"),
                eq(crmLeads.origem, "website"),
                isNull(crmLeads.responsavelId),
                lte(crmLeads.createdAt, ontem)
              ));
            for (const lead of leads) {
              const jaExiste = await db.select({ id: crmAlertas.id }).from(crmAlertas)
                .where(and(eq(crmAlertas.leadId, lead.id), eq(crmAlertas.tipo, "nova_lead"), eq(crmAlertas.estado, "pendente")))
                .limit(1);
              if (jaExiste.length === 0) {
                await db.insert(crmAlertas).values({
                  tipo: "nova_lead", titulo: `Lead website sem atribuição: ${lead.titulo}`,
                  descricao: regra.descricao || null, prioridade: regra.prioridade,
                  estado: "pendente", leadId: lead.id, emailEnviado: false,
                });
                criados++;
              }
            }
          }
        }

        await db.update(crmRegrasAlerta).set({ ultimaExecucao: hoje }).where(eq(crmRegrasAlerta.ativo, true));
        return { success: true, criados };
      }),
  }),

  // ── PROPOSTAS ─────────────────────────────────────────────────────────────
  propostas: router({
    upload: crmProcedure
      .input(z.object({
        leadId: z.number().optional(),
        empresaId: z.number().optional(),
        titulo: z.string().min(1),
        valor: z.number().optional(),
        dataValidade: z.string().optional(),
        notas: z.string().optional(),
        fileBase64: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const buffer = Buffer.from(input.fileBase64, "base64");
        const key = `crm/propostas/${Date.now()}_${input.fileName}`;
        const { url } = await storagePut(key, buffer, "application/pdf");
        const token = crypto.randomBytes(32).toString("hex");
        const [result] = await db.insert(crmPropostas).values({
          leadId: input.leadId, empresaId: input.empresaId,
          criadaPorId: session.userId, titulo: input.titulo,
          valor: input.valor, pdfUrl: url, pdfKey: key,
          trackingToken: token, estado: "rascunho",
          dataValidade: input.dataValidade ? new Date(input.dataValidade) : undefined,
          notas: input.notas,
        });
        return { id: (result as any).insertId, url, token };
      }),

    marcarEnviada: crmProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        await db.update(crmPropostas).set({ estado: "enviada", dataEnvio: new Date() }).where(eq(crmPropostas.id, input.id));
        return { success: true };
      }),
  }),

  // ── REUNIÕES ──────────────────────────────────────────────────────────────
  reunioes: router({
    list: crmProcedure
      .input(z.object({ leadId: z.number().optional(), empresaId: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const conditions = [];
        if (input.leadId) conditions.push(eq(crmReunioes.leadId, input.leadId));
        if (input.empresaId) conditions.push(eq(crmReunioes.empresaId, input.empresaId));
        return db.select().from(crmReunioes)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(crmReunioes.dataInicio));
      }),

    create: crmProcedure
      .input(z.object({
        leadId: z.number().optional(),
        empresaId: z.number().optional(),
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        dataInicio: z.string(),
        dataFim: z.string(),
        tipo: z.enum(["teams","presencial","telefone"]).default("teams"),
        notas: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const [result] = await db.insert(crmReunioes).values({
          ...input,
          organizadorId: session.userId,
          dataInicio: new Date(input.dataInicio),
          dataFim: new Date(input.dataFim),
        });
        return { id: (result as any).insertId };
      }),

    updateEstado: crmProcedure
      .input(z.object({
        id: z.number(),
        estado: z.enum(["agendada","confirmada","realizada","cancelada","nao_compareceu"]),
        notas: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAuth(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        await db.update(crmReunioes).set({ estado: input.estado, notas: input.notas }).where(eq(crmReunioes.id, input.id));
        return { success: true };
      }),
  }),

  // ── ADMIN: UTILIZADORES ───────────────────────────────────────────────────
  admin: router({
    listUsers: crmProcedure.query(async ({ ctx }) => {
      requireCrmAdmin(ctx);
      const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
      return db.select({
        id: crmUsers.id, nome: crmUsers.nome, email: crmUsers.email,
        role: crmUsers.role, ativo: crmUsers.ativo, ultimoLogin: crmUsers.ultimoLogin,
        createdAt: crmUsers.createdAt
      }).from(crmUsers).orderBy(asc(crmUsers.nome));
    }),

    createUser: crmProcedure
      .input(z.object({
        nome: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["admin","gestor_comercial","psicologo"]),
        telefone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAdmin(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const [result] = await db.insert(crmUsers).values({
          ...input,
          passwordHash: hashPassword(input.password),
        });
        return { id: (result as any).insertId };
      }),

    updateUser: crmProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        role: z.enum(["admin","gestor_comercial","psicologo"]).optional(),
        ativo: z.boolean().optional(),
        password: z.string().min(6).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        requireCrmAdmin(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const { id, password, ...data } = input;
        const updateData: any = { ...data, updatedAt: new Date() };
        if (password) updateData.passwordHash = hashPassword(password);
        await db.update(crmUsers).set(updateData).where(eq(crmUsers.id, id));
        return { success: true };
      }),

    seedAdmin: crmProcedure
      .input(z.object({ secret: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (input.secret !== (process.env.JWT_SECRET || "crm-secret-key")) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível." });
        const [existing] = await db.select().from(crmUsers).where(eq(crmUsers.email, "admin@team24.pt")).limit(1);
        if (existing) return { message: "Admin já existe", id: existing.id };
        const [result] = await db.insert(crmUsers).values({
          nome: "Administrador TEAM 24",
          email: "admin@team24.pt",
          passwordHash: hashPassword("Madsheep2015!"),
          role: "admin",
          ativo: true,
        });
        return { message: "Admin criado", id: (result as any).insertId };
      }),
  }),

  // ── FUNIL DE VENDAS ─────────────────────────────────────────────────────────────────────────────
  funil: crmFunilRouter,
  prospecting: crmProspectingRouter,
});
