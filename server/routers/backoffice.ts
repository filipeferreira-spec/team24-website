import { TRPCError } from "@trpc/server";
import { eq, desc } from "drizzle-orm";
import * as crypto from "crypto";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { sendQuestionarioEmail, sendEmailRejeicao, sendEmailCandidaturaEmAnalise, sendEmailConfirmacaoCandidatura } from "../odoo";
import { getDb } from "../db";
import {
  backofficeAdmins,
  recursos,
  casos,
  imprensa,
  carreiras,
  candidaturas,
  questionarios,
  perguntasQuestionario,
  tokensQuestionario,
  respostasQuestionario,
} from "../../drizzle/schema";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const BACKOFFICE_SESSION_COOKIE = "bo_session";
const SESSION_SECRET = process.env.JWT_SECRET || "backoffice-secret-key";

// SEGURANÇA: Detetar se o pedido é HTTPS para aplicar o atributo Secure no cookie
function isSecureBoRequest(req: { protocol?: string; headers: Record<string, string | string[] | undefined> }): boolean {
  if (req.protocol === "https") return true;
  const fwd = req.headers["x-forwarded-proto"];
  if (!fwd) return false;
  const protos = Array.isArray(fwd) ? fwd : fwd.split(",");
  return protos.some(p => p.trim().toLowerCase() === "https");
}

function buildBoSetCookieHeader(
  cookieName: string,
  value: string,
  maxAge: number,
  req: { protocol?: string; headers: Record<string, string | string[] | undefined> }
): string {
  const isSecure = isSecureBoRequest(req);
  const securePart = isSecure ? "; Secure" : "";
  // SameSite=None requer Secure; em HTTP local usar Lax
  const sameSite = isSecure ? "None" : "Lax";
  return `${cookieName}=${encodeURIComponent(value)}; Path=/; HttpOnly${securePart}; SameSite=${sameSite}; Max-Age=${maxAge}`;
}

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(password).digest("hex");
}

function createSessionToken(adminId: number, username: string, role: string): string {
  const payload = JSON.stringify({ adminId, username, role, exp: Date.now() + 8 * 60 * 60 * 1000 });
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64") + "." + sig;
}

function verifySessionToken(token: string): { adminId: number; username: string; role: string } | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const payload = Buffer.from(payloadB64, "base64").toString("utf-8");
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (sig !== expectedSig) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { adminId: data.adminId, username: data.username, role: data.role || "superadmin" };
  } catch {
    return null;
  }
}

function getBoSession(req: { cookies?: Record<string, string>; headers: Record<string, string | string[] | undefined> }) {
  const cookieHeader = req.headers["cookie"] as string | undefined;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${BACKOFFICE_SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySessionToken(decodeURIComponent(match[1]));
}

// Middleware: requires backoffice session
export const boProtectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = getBoSession(ctx.req as any);
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão de backoffice inválida ou expirada." });
  }
  return next({ ctx: { ...ctx, boAdmin: session } });
});

// ─── ROUTER ───────────────────────────────────────────────────────────────────

export const backofficeRouter = router({

  // ── AUTH ──────────────────────────────────────────────────────────────────

  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de dados indisponível." });

      const hash = hashPassword(input.password);
      const rows = await db
        .select()
        .from(backofficeAdmins)
        .where(eq(backofficeAdmins.username, input.username))
        .limit(1);

      const admin = rows[0];
      if (!admin || admin.passwordHash !== hash || !admin.ativo) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas." });
      }

      // Update last login
      await db.update(backofficeAdmins).set({ lastLogin: new Date() }).where(eq(backofficeAdmins.id, admin.id));

      const token = createSessionToken(admin.id, admin.username, (admin as any).role || "superadmin");
      ctx.res.setHeader(
        "Set-Cookie",
        buildBoSetCookieHeader(BACKOFFICE_SESSION_COOKIE, token, 8 * 60 * 60, ctx.req as any)
      );

      return { success: true, nome: admin.nome || admin.username, role: (admin as any).role || "superadmin" };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    // Limpar o cookie com os mesmos atributos de segurança usados no login
    ctx.res.setHeader(
      "Set-Cookie",
      buildBoSetCookieHeader(BACKOFFICE_SESSION_COOKIE, "", 0, ctx.req as any)
    );
    return { success: true };
  }),

  me: publicProcedure.query(({ ctx }) => {
    const session = getBoSession(ctx.req as any);
    return session ? { loggedIn: true, username: session.username, role: session.role || "superadmin" } : { loggedIn: false };
  }),

  // Seed initial admin (only works if no admins exist)
  seedAdmin: publicProcedure
    .input(z.object({ username: z.string(), password: z.string(), nome: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const existing = await db.select().from(backofficeAdmins).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Já existe pelo menos um administrador." });
      }

      const hash = hashPassword(input.password);
      await db.insert(backofficeAdmins).values({
        username: input.username,
        passwordHash: hash,
        nome: input.nome || input.username,
        ativo: true,
      });
      return { success: true };
    }),

  // ── RECURSOS ──────────────────────────────────────────────────────────────

  recursos: router({
    // Endpoint público para a página /recursos (apenas ebooks)
    listPublic: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const { and, eq: eqOp } = await import("drizzle-orm");
      return db.select().from(recursos)
        .where(and(eqOp(recursos.publicado, true), eqOp(recursos.tipo, "ebook")))
        .orderBy(desc(recursos.createdAt));
    }),

    // Endpoint público para a página /blog (apenas artigos)
    listPublicArtigos: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const { and, eq: eqOp } = await import("drizzle-orm");
      return db.select().from(recursos)
        .where(and(eqOp(recursos.publicado, true), eqOp(recursos.tipo, "artigo")))
        .orderBy(desc(recursos.createdAt));
    }),

    // Toggle rápido de publicação
    togglePublicado: boProtectedProcedure
      .input(z.object({ id: z.number(), publicado: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(recursos).set({ publicado: input.publicado }).where(eq(recursos.id, input.id));
        return { success: true };
      }),

    list: boProtectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(recursos).orderBy(desc(recursos.createdAt));
    }),

    create: boProtectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        tipo: z.enum(["ebook", "artigo", "webinar", "ferramenta", "guia", "template"]),
        tema: z.string().optional(),
        imageUrl: z.string().optional(),
        downloadUrl: z.string().optional(),
        isPremium: z.boolean().optional(),
        isNovo: z.boolean().optional(),
        publicado: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(recursos).values({
          titulo: input.titulo,
          descricao: input.descricao || null,
          tipo: input.tipo,
          tema: input.tema || null,
          imageUrl: input.imageUrl || null,
          downloadUrl: input.downloadUrl || null,
          isPremium: input.isPremium ?? false,
          isNovo: input.isNovo ?? false,
          publicado: input.publicado ?? false,
        });
        return { success: true };
      }),

    update: boProtectedProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().min(1).optional(),
        descricao: z.string().optional(),
        tipo: z.enum(["ebook", "artigo", "webinar", "ferramenta", "guia", "template"]).optional(),
        tema: z.string().optional(),
        imageUrl: z.string().optional(),
        downloadUrl: z.string().optional(),
        isPremium: z.boolean().optional(),
        isNovo: z.boolean().optional(),
        publicado: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...data } = input;
        await db.update(recursos).set(data).where(eq(recursos.id, id));
        return { success: true };
      }),

    delete: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(recursos).where(eq(recursos.id, input.id));
        return { success: true };
      }),
  }),

  // ── CASOS ─────────────────────────────────────────────────────────────────

  casos: router({
    list: boProtectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(casos).orderBy(desc(casos.createdAt));
    }),

    // Endpoint público — lista casos publicados para a página pública
    listPublic: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(casos)
        .where(eq(casos.publicado, true))
        .orderBy(desc(casos.destaque), desc(casos.createdAt));
    }),

    // Toggle rápido de publicação direto na tabela do backoffice
    togglePublicado: boProtectedProcedure
      .input(z.object({ id: z.number(), publicado: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(casos).set({ publicado: input.publicado }).where(eq(casos.id, input.id));
        return { success: true };
      }),

    create: boProtectedProcedure
      .input(z.object({
        empresa: z.string().min(1),
        setor: z.string().optional(),
        logoUrl: z.string().optional(),
        imagemUrl: z.string().optional(),
        resultado: z.string().optional(),
        descricao: z.string().optional(),
        citacao: z.string().optional(),
        citacaoAutor: z.string().optional(),
        citacaoRole: z.string().optional(),
        metrica1Label: z.string().optional(),
        metrica1Valor: z.string().optional(),
        metrica2Label: z.string().optional(),
        metrica2Valor: z.string().optional(),
        metrica3Label: z.string().optional(),
        metrica3Valor: z.string().optional(),
        destaque: z.boolean().optional(),
        publicado: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(casos).values({ ...input, destaque: input.destaque ?? false, publicado: input.publicado ?? false });
        return { success: true };
      }),

    update: boProtectedProcedure
      .input(z.object({
        id: z.number(),
        empresa: z.string().optional(),
        setor: z.string().optional(),
        logoUrl: z.string().optional(),
        imagemUrl: z.string().optional(),
        resultado: z.string().optional(),
        descricao: z.string().optional(),
        citacao: z.string().optional(),
        citacaoAutor: z.string().optional(),
        citacaoRole: z.string().optional(),
        metrica1Label: z.string().optional(),
        metrica1Valor: z.string().optional(),
        metrica2Label: z.string().optional(),
        metrica2Valor: z.string().optional(),
        metrica3Label: z.string().optional(),
        metrica3Valor: z.string().optional(),
        destaque: z.boolean().optional(),
        publicado: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...data } = input;
        await db.update(casos).set(data).where(eq(casos.id, id));
        return { success: true };
      }),

    delete: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(casos).where(eq(casos.id, input.id));
        return { success: true };
      }),
  }),

  // ── IMPRENSA ──────────────────────────────────────────────────────────────

  imprensa: router({
    list: boProtectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(imprensa).orderBy(desc(imprensa.createdAt));
    }),

    create: boProtectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        publicacao: z.string().min(1),
        tipo: z.enum(["artigo", "entrevista", "comunicado", "mencao"]),
        resumo: z.string().optional(),
        url: z.string().optional(),
        imagemUrl: z.string().optional(),
        dataPublicacao: z.string().optional(),
        destaque: z.boolean().optional(),
        publicado: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(imprensa).values({
          titulo: input.titulo,
          publicacao: input.publicacao,
          tipo: input.tipo,
          resumo: input.resumo || null,
          url: input.url || null,
          imagemUrl: input.imagemUrl || null,
          dataPublicacao: input.dataPublicacao ? new Date(input.dataPublicacao) : null,
          destaque: input.destaque ?? false,
          publicado: input.publicado ?? false,
        });
        return { success: true };
      }),

    update: boProtectedProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        publicacao: z.string().optional(),
        tipo: z.enum(["artigo", "entrevista", "comunicado", "mencao"]).optional(),
        resumo: z.string().optional(),
        url: z.string().optional(),
        imagemUrl: z.string().optional(),
        dataPublicacao: z.string().optional(),
        destaque: z.boolean().optional(),
        publicado: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, dataPublicacao, ...rest } = input;
        await db.update(imprensa).set({
          ...rest,
          ...(dataPublicacao ? { dataPublicacao: new Date(dataPublicacao) } : {}),
        }).where(eq(imprensa.id, id));
        return { success: true };
      }),

    delete: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(imprensa).where(eq(imprensa.id, input.id));
        return { success: true };
      }),

    listPublic: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(imprensa)
        .where(eq(imprensa.publicado, true))
        .orderBy(desc(imprensa.dataPublicacao));
    }),

    togglePublicado: boProtectedProcedure
      .input(z.object({ id: z.number(), publicado: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(imprensa).set({ publicado: input.publicado }).where(eq(imprensa.id, input.id));
        return { success: true };
      }),
  }),

  // ── CARREIRAS ─────────────────────────────────────────────────────────────

  carreiras: router({
    list: boProtectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(carreiras).orderBy(desc(carreiras.createdAt));
    }),

    create: boProtectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        departamento: z.string().optional(),
        localizacao: z.string().optional(),
        tipo: z.enum(["full-time", "part-time", "freelance", "estagio"]),
        nivel: z.enum(["junior", "medio", "senior", "lead", "diretor"]).optional(),
        descricao: z.string().optional(),
        requisitos: z.string().optional(),
        beneficios: z.string().optional(),
        salarioMin: z.number().optional(),
        salarioMax: z.number().optional(),
        ativo: z.boolean().optional(),
        publicado: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const slug = input.titulo
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
        await db.insert(carreiras).values({
          titulo: input.titulo,
          slug,
          departamento: input.departamento || null,
          localizacao: input.localizacao || null,
          tipo: input.tipo,
          nivel: input.nivel || null,
          descricao: input.descricao || null,
          requisitos: input.requisitos || null,
          beneficios: input.beneficios || null,
          salarioMin: input.salarioMin || null,
          salarioMax: input.salarioMax || null,
          ativo: input.ativo ?? true,
          publicado: input.publicado ?? false,
        });
        return { success: true };
      }),

    update: boProtectedProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        departamento: z.string().optional(),
        localizacao: z.string().optional(),
        tipo: z.enum(["full-time", "part-time", "freelance", "estagio"]).optional(),
        nivel: z.enum(["junior", "medio", "senior", "lead", "diretor"]).optional(),
        descricao: z.string().optional(),
        requisitos: z.string().optional(),
        beneficios: z.string().optional(),
        salarioMin: z.number().optional(),
        salarioMax: z.number().optional(),
        ativo: z.boolean().optional(),
        publicado: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...data } = input;
        await db.update(carreiras).set(data).where(eq(carreiras.id, id));
        return { success: true };
      }),

    delete: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(carreiras).where(eq(carreiras.id, input.id));
        return { success: true };
      }),

    listPublic: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(carreiras)
        .where(eq(carreiras.publicado, true))
        .orderBy(desc(carreiras.createdAt));
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [job] = await db.select().from(carreiras)
          .where(eq(carreiras.slug, input.slug))
          .limit(1);
        return job ?? null;
      }),

    togglePublicado: boProtectedProcedure
      .input(z.object({ id: z.number(), publicado: z.boolean() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(carreiras).set({ publicado: input.publicado }).where(eq(carreiras.id, input.id));
        return { success: true };
      }),
  }),

  // ── CANDIDATURAS ─────────────────────────────────────────────────────────────────────────────
  candidaturas: router({
    // Pública: submeter candidatura com CV
    submit: publicProcedure
      .input(z.object({
        carreiraId: z.number().optional(),
        nome: z.string().min(2),
        email: z.string().email(),
        telefone: z.string().optional(),
        linkedin: z.string().optional(),
        mensagem: z.string().optional(),
        cvUrl: z.string().optional(),
        cvNome: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });

        // Buscar o título da vaga se tiver carreiraId
        let vagaTitulo = "Candidatura Espontânea";
        if (input.carreiraId) {
          const [vaga] = await db.select({ titulo: carreiras.titulo }).from(carreiras).where(eq(carreiras.id, input.carreiraId));
          if (vaga) vagaTitulo = vaga.titulo;
        }

        await db.insert(candidaturas).values({
          carreiraId: input.carreiraId,
          nome: input.nome,
          email: input.email,
          telefone: input.telefone,
          linkedin: input.linkedin,
          mensagem: input.mensagem,
          cvUrl: input.cvUrl,
          cvNome: input.cvNome,
          estado: "pendente",
        });

        // Obter o ID da candidatura recém-inserida
        const [novaCand] = await db.select({ id: candidaturas.id })
          .from(candidaturas)
          .where(eq(candidaturas.email, input.email))
          .orderBy(desc(candidaturas.createdAt))
          .limit(1);

        // Verificar se existe questionário associado à vaga (ou genérico)
        if (novaCand && input.carreiraId) {
          try {
            // Procurar questionário específico desta vaga (sem fallback genérico)
            const [q] = await db.select().from(questionarios)
              .where(eq(questionarios.carreiraId, input.carreiraId))
              .limit(1);
            if (q) {
              // Gerar token único
              const token = crypto.randomBytes(48).toString("hex");
              // Expirar em 14 dias
              const expiraAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
              await db.insert(tokensQuestionario).values({
                token,
                candidaturaId: novaCand.id,
                questionarioId: q.id,
                expiraAt,
              });
              // Enviar email com o link — usar sempre o domínio oficial
              const origin = "https://www.team24.pt";
              const questionarioLink = `${origin}/questionario/${token}`;
              await sendQuestionarioEmail(input.nome, input.email, vagaTitulo, questionarioLink);
              await db.update(tokensQuestionario)
                .set({ emailEnviado: true, emailEnviadoAt: new Date() })
                .where(eq(tokensQuestionario.token, token));
            }
          } catch (err) {
            console.error("[questionario] Erro ao enviar email de questionário:", err);
            // Não bloquear a candidatura
          }
        }

        // Enviar email de confirmação ao candidato
        try {
          await sendEmailConfirmacaoCandidatura(input.nome, input.email, vagaTitulo);
        } catch (err) {
          console.error("[confirmacao] Erro ao enviar email de confirmação ao candidato:", err);
          // Não bloquear a candidatura
        }

        // Notificar o owner por email/notificação
        try {
          await notifyOwner({
            title: `📋 Nova candidatura: ${vagaTitulo}`,
            content: [
              `**Nome:** ${input.nome}`,
              `**Email:** ${input.email}`,
              input.telefone ? `**Telef.:** ${input.telefone}` : null,
              input.linkedin ? `**LinkedIn:** ${input.linkedin}` : null,
              input.cvNome ? `**CV:** ${input.cvNome}` : null,
              input.cvUrl ? `**Download CV:** ${input.cvUrl}` : null,
              input.mensagem ? `\n**Mensagem:**\n${input.mensagem}` : null,
            ].filter(Boolean).join("\n"),
          });
        } catch {
          // Não bloquear a candidatura se a notificação falhar
        }

        return { success: true };
      }),

    // Protegida: listar candidaturas no backoffice
    list: boProtectedProcedure
      .input(z.object({ carreiraId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select().from(candidaturas).orderBy(desc(candidaturas.createdAt));
        // Enriquecer com título da carreira e estado do questionário
        const enriched = await Promise.all(rows.map(async (c) => {
          let carreiraTitulo: string | null = null;
          let carreiraDepartamento: string | null = null;
          if (c.carreiraId) {
            const [car] = await db.select({ titulo: carreiras.titulo, departamento: carreiras.departamento }).from(carreiras).where(eq(carreiras.id, c.carreiraId));
            carreiraTitulo = car?.titulo || null;
            carreiraDepartamento = car?.departamento || null;
          }
          let token = null;
          try {
            const tokens = await db.select().from(tokensQuestionario).where(eq(tokensQuestionario.candidaturaId, c.id));
            token = tokens[0] || null;
          } catch (_) {
            // sem token de questionário para esta candidatura
          }
          return {
            ...c,
            carreiraTitulo,
            carreiraDepartamento,
            questionarioEnviado: token?.emailEnviado || false,
            questionarioRespondido: token?.respondido || false,
          };
        }));
        return enriched;
      }),

    // Protegida: obter detalhe completo de uma candidatura com respostas ao questionário
    getById: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const [cand] = await db.select().from(candidaturas).where(eq(candidaturas.id, input.id));
        if (!cand) throw new TRPCError({ code: "NOT_FOUND", message: "Candidatura não encontrada" });
        // Buscar token do questionário associado
        let tokens: typeof tokensQuestionario.$inferSelect[] = [];
        try {
          tokens = await db.select().from(tokensQuestionario).where(eq(tokensQuestionario.candidaturaId, cand.id));
        } catch (_) {
          // sem token de questionário para esta candidatura
        }
        let questionarioData = null;
        if (tokens.length > 0) {
          const token = tokens[0];
          // Buscar o questionário
          const [q] = await db.select().from(questionarios).where(eq(questionarios.id, token.questionarioId));
          // Buscar todas as perguntas do questionário
          const perguntas = await db.select().from(perguntasQuestionario).where(eq(perguntasQuestionario.questionarioId, token.questionarioId));
          // Buscar respostas se respondido
          let respostas: Array<{ perguntaId: number; pergunta: string; tipo: string; resposta: string }> = [];
          if (token.respondido) {
            const rows = await db
              .select({ resposta: respostasQuestionario.resposta, perguntaId: respostasQuestionario.perguntaId, pergunta: perguntasQuestionario.texto, tipo: perguntasQuestionario.tipo })
              .from(respostasQuestionario)
              .innerJoin(perguntasQuestionario, eq(respostasQuestionario.perguntaId, perguntasQuestionario.id))
              .where(eq(respostasQuestionario.tokenId, token.id));
            respostas = rows.map(r => ({ perguntaId: r.perguntaId, pergunta: r.pergunta, tipo: r.tipo, resposta: r.resposta }));
          }
          questionarioData = {
            id: token.questionarioId,
            titulo: q?.titulo || "Questionário",
            descricao: q?.descricao || "",
            tokenId: token.id,
            respondido: token.respondido,
            respondidoAt: token.respondidoAt,
            emailEnviado: token.emailEnviado,
            emailEnviadoAt: token.emailEnviadoAt,
            expiraAt: token.expiraAt,
            perguntas: perguntas.map(p => ({ id: p.id, texto: p.texto, tipo: p.tipo, opcoes: p.opcoes })),
            respostas,
          };
        }
        // Buscar título da carreira se existir
        let carreiraTitulo: string | null = null;
        if (cand.carreiraId) {
          const [car] = await db.select({ titulo: carreiras.titulo }).from(carreiras).where(eq(carreiras.id, cand.carreiraId));
          carreiraTitulo = car?.titulo || null;
        }
        return { ...cand, questionario: questionarioData, carreiraTitulo };
      }),

    // Protegida: atualizar estado da candidatura
    updateEstado: boProtectedProcedure
      .input(z.object({
        id: z.number(),
        estado: z.enum(["pendente", "em_analise", "entrevista", "rejeitado", "aceite"]),
        origin: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });

        // Obter estado anterior para detectar transição para rejeitado
        const [cand] = await db.select().from(candidaturas).where(eq(candidaturas.id, input.id));
        const eraRejeitado = cand?.estado === "rejeitado";

        await db.update(candidaturas).set({ estado: input.estado }).where(eq(candidaturas.id, input.id));

        // Enviar email de rejeição apenas quando muda PARA rejeitado (não se já estava rejeitado)
        if (input.estado === "rejeitado" && !eraRejeitado && cand?.email) {
          try {
            let vagaTitulo = "TEAM 24";
            if (cand.carreiraId) {
              const [car] = await db.select({ titulo: carreiras.titulo }).from(carreiras).where(eq(carreiras.id, cand.carreiraId));
              vagaTitulo = car?.titulo || vagaTitulo;
            }
            await sendEmailRejeicao(cand.nome, cand.email, vagaTitulo);
          } catch (err) {
            console.error("[rejeicao] Erro ao enviar email de rejeição:", err);
            // Não bloquear a actualização de estado
          }
        }

        return { success: true };
      }),

    // Protegida: classificar candidatura (1-10) e notas internas
    setClassificacao: boProtectedProcedure
      .input(z.object({
        id: z.number(),
        classificacao: z.number().min(1).max(10).nullable(),
        notasInternas: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const updateData: Record<string, unknown> = {};
        if (input.classificacao !== undefined) updateData.classificacao = input.classificacao;
        if (input.notasInternas !== undefined) updateData.notasInternas = input.notasInternas;
        await db.update(candidaturas).set(updateData).where(eq(candidaturas.id, input.id));
        return { success: true };
      }),
    // Protegida: eliminar candidatura
    delete: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        await db.delete(candidaturas).where(eq(candidaturas.id, input.id));
        return { success: true };
      }),
  }),

  // ─── QUESTIONÁRIOS ──────────────────────────────────────────────────────────
  questionarios: router({

    // Listar todos os questionários
    list: boProtectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
      const rows = await db.select().from(questionarios).orderBy(desc(questionarios.createdAt));
      return rows;
    }),

    // Obter questionário com perguntas
    getById: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const [q] = await db.select().from(questionarios).where(eq(questionarios.id, input.id));
        if (!q) throw new TRPCError({ code: "NOT_FOUND" });
        const perguntas = await db.select().from(perguntasQuestionario)
          .where(eq(perguntasQuestionario.questionarioId, input.id))
          .orderBy(perguntasQuestionario.ordem);
        return { ...q, perguntas };
      }),

    // Criar questionário
    create: boProtectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        carreiraId: z.number().nullable().optional(),
        ativo: z.boolean().optional().default(true),
        perguntas: z.array(z.object({
          texto: z.string().min(1),
          tipo: z.enum(["texto", "escolha_multipla", "escala", "sim_nao"]),
          opcoes: z.string().optional(),
          obrigatoria: z.boolean().optional().default(true),
          ordem: z.number().optional().default(0),
        })).optional().default([]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const [result] = await db.insert(questionarios).values({
          titulo: input.titulo,
          descricao: input.descricao ?? null,
          carreiraId: input.carreiraId ?? null,
          ativo: input.ativo,
        });
        const qId = (result as any).insertId as number;
        if (input.perguntas.length > 0) {
          await db.insert(perguntasQuestionario).values(
            input.perguntas.map((p, i) => ({
              questionarioId: qId,
              texto: p.texto,
              tipo: p.tipo,
              opcoes: p.opcoes ?? null,
              obrigatoria: p.obrigatoria,
              ordem: p.ordem ?? i,
            }))
          );
        }
        return { id: qId };
      }),

    // Atualizar questionário (metadados)
    update: boProtectedProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().min(1).optional(),
        descricao: z.string().optional(),
        carreiraId: z.number().nullable().optional(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const { id, ...data } = input;
        await db.update(questionarios).set(data as any).where(eq(questionarios.id, id));
        return { success: true };
      }),

    // Eliminar questionário (e perguntas)
    delete: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        await db.delete(perguntasQuestionario).where(eq(perguntasQuestionario.questionarioId, input.id));
        await db.delete(questionarios).where(eq(questionarios.id, input.id));
        return { success: true };
      }),

    // Adicionar pergunta
    addPergunta: boProtectedProcedure
      .input(z.object({
        questionarioId: z.number(),
        texto: z.string().min(1),
        tipo: z.enum(["texto", "escolha_multipla", "escala", "sim_nao"]),
        opcoes: z.string().optional(),
        obrigatoria: z.boolean().optional().default(true),
        ordem: z.number().optional().default(0),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        await db.insert(perguntasQuestionario).values({
          questionarioId: input.questionarioId,
          texto: input.texto,
          tipo: input.tipo,
          opcoes: input.opcoes ?? null,
          obrigatoria: input.obrigatoria,
          ordem: input.ordem,
        });
        return { success: true };
      }),

    // Eliminar pergunta
    deletePergunta: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        await db.delete(perguntasQuestionario).where(eq(perguntasQuestionario.id, input.id));
        return { success: true };
      }),

    // Listar respostas de um questionário (com dados do candidato)
    listRespostas: boProtectedProcedure
      .input(z.object({ questionarioId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const tokens = await db.select().from(tokensQuestionario)
          .where(eq(tokensQuestionario.questionarioId, input.questionarioId));
        const result = await Promise.all(tokens.map(async (t) => {
          const [cand] = await db.select().from(candidaturas).where(eq(candidaturas.id, t.candidaturaId));
          const respostas = await db.select().from(respostasQuestionario)
            .where(eq(respostasQuestionario.tokenId, t.id));
          const perguntas = await db.select().from(perguntasQuestionario)
            .where(eq(perguntasQuestionario.questionarioId, input.questionarioId))
            .orderBy(perguntasQuestionario.ordem);
          return {
            token: t,
            candidato: cand ?? null,
            respostas: perguntas.map(p => ({
              pergunta: p.texto,
              tipo: p.tipo,
              resposta: respostas.find(r => r.perguntaId === p.id)?.resposta ?? null,
            })),
          };
        }));
        return result;
      }),
  }),

  // ── ENVIO EM MASSA: candidaturas em análise ────────────────────────────────
  candidaturas_bulk: router({
    // Preview: lista candidatos que receberiam o email (sem enviar)
    previewEmAnalise: boProtectedProcedure
      .input(z.object({ testEmail: z.string().email().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const { notInArray } = await import("drizzle-orm");
        const lista = await db
          .select({ id: candidaturas.id, nome: candidaturas.nome, email: candidaturas.email, estado: candidaturas.estado, carreiraId: candidaturas.carreiraId })
          .from(candidaturas)
          .where(notInArray(candidaturas.estado, ["rejeitado", "aceite"]));
        return { total: lista.length, candidatos: lista.slice(0, 10), testEmail: input.testEmail };
      }),

    // Envio de teste para um email específico
    sendTest: boProtectedProcedure
      .input(z.object({ email: z.string().email(), nome: z.string().optional() }))
      .mutation(async ({ input }) => {
        await sendEmailCandidaturaEmAnalise(
          input.nome || "Candidato/a",
          input.email,
          "Psicólogo/a de Apoio Psicológico"
        );
        return { success: true, sentTo: input.email };
      }),

    // Envio em massa para todos os candidatos não rejeitados nem aceites
    sendAll: boProtectedProcedure
      .mutation(async () => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const { notInArray } = await import("drizzle-orm");
        const lista = await db
          .select({ id: candidaturas.id, nome: candidaturas.nome, email: candidaturas.email, carreiraId: candidaturas.carreiraId })
          .from(candidaturas)
          .where(notInArray(candidaturas.estado, ["rejeitado", "aceite"]));

        let enviados = 0;
        let erros = 0;
        const errosList: string[] = [];

        for (const cand of lista) {
          try {
            await sendEmailCandidaturaEmAnalise(
              cand.nome,
              cand.email,
              "Psicólogo/a de Apoio Psicológico"
            );
            enviados++;
            // Pequena pausa para não sobrecarregar o servidor de email
            await new Promise(r => setTimeout(r, 300));
          } catch (err) {
            erros++;
            errosList.push(`${cand.email}: ${err instanceof Error ? err.message : String(err)}`);
            console.error(`[bulkSend] Erro ao enviar para ${cand.email}:`, err);
          }
        }

        return { success: true, total: lista.length, enviados, erros, errosList };
      }),
  }),
});
