import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./ia";
import { generateBlogArticle } from "./blogAutoGenerator";
import { z } from "zod";
import { backofficeRouter } from "./routers/backoffice";
import { outreachRouter } from "./routers/outreach";
import { crmRouter } from "./routers/crm";
import { crmAutomacoesRouter } from "./routers/crmAutomacoes";
import { crmQualidadeRouter } from "./routers/crmQualidade";
import { equipaRouter } from "./routers/equipa";
import { actividadeComercialRouter } from "./routers/actividadeComercial";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { newsletterSubscribers } from "../drizzle/schema";
import { createOdooLead, subscribeOdooNewsletter, sendOdooEbookEmail, sendOdooNewsletterWelcomeEmail, sendLeadNotificationEmail } from "./odoo";
import {
  questionarios as questionariosTable,
  perguntasQuestionario,
  tokensQuestionario,
  respostasQuestionario,
  crmLeads,
} from "../drizzle/schema";
import * as crypto from "crypto";

// ─── SEGURANÇA: Backoffice session verification para rotas de upload ────────────
const _BO_SESSION_COOKIE = "bo_session";
const _BO_SECRET = process.env.JWT_SECRET || "backoffice-secret-key";
function _verifyBoToken(token: string): { adminId: number; username: string } | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const payload = Buffer.from(payloadB64, "base64").toString("utf-8");
    const expected = crypto.createHmac("sha256", _BO_SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    const data = JSON.parse(payload);
    if (data.exp < Date.now()) return null;
    return { adminId: data.adminId, username: data.username };
  } catch { return null; }
}
function _getBoSession(req: { headers: Record<string, string | string[] | undefined> }) {
  const cookieHeader = req.headers["cookie"] as string | undefined;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${_BO_SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return _verifyBoToken(decodeURIComponent(match[1]));
}
const boUploadProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = _getBoSession(ctx.req as any);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão de backoffice inválida ou expirada." });
  return next({ ctx: { ...ctx, boAdmin: session } });
});

// Tipos MIME permitidos para upload (whitelist)
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
// Sanitizar folder para prevenir path traversal
function sanitizeUploadFolder(folder: string): string {
  return folder.replace(/\.\./g, "").replace(/[/\\]/g, "").replace(/[^a-zA-Z0-9_-]/g, "") || "backoffice";
}

// System prompt do assistente TEAM 24
const TEAM24_SYSTEM_PROMPT = `Você é o assistente virtual da TEAM 24, uma plataforma líder de saúde mental corporativa em Portugal.

A TEAM 24 oferece:
- Apoio psicológico 24/7 para colaboradores (chat, voz, vídeo)
- Dashboard de bem-estar organizacional com métricas anónimas
- IA de diagnóstico de burnout e stress
- App mobile para iOS e Android
- Implementação em 48 horas
- Conformidade total com RGPD

Resultados comprovados:
- 40% redução média de absentismo
- 35% aumento de produtividade
- 28% redução de turnover
- Mais de 500 empresas parceiras em Portugal
- Mais de 50.000 colaboradores ativos

REGRAS ABSOLUTAS — NUNCA VIOLAR:
1. NUNCA mencionar preços, valores, custos, planos pagos, tarifas ou qualquer informação financeira. Se perguntado sobre preços, responda sempre: "Os nossos planos são personalizados ao perfil de cada empresa. A nossa equipa comercial terá todo o gosto em apresentar uma proposta à medida — pode deixar o seu nome e email que entraremos em contacto brevemente?"
2. NUNCA inventar informação que não conhece.
3. NUNCA fazer promessas específicas sobre resultados garantidos.

O seu papel:
- Responder perguntas sobre a plataforma TEAM 24 de forma empática e profissional
- Ajudar empresas a perceber como a TEAM 24 pode resolver os seus desafios de saúde mental
- RECOLHER CONTACTOS: sempre que o utilizador mostrar interesse genuíno, pedir o nome e email da pessoa para que a equipa comercial possa entrar em contacto. Exemplo: "Posso pedir o seu nome e email para que um especialista TEAM 24 entre em contacto consigo?"
- Qualificar leads: perguntar o número aproximado de colaboradores e o principal desafio da empresa (burnout, absentismo, turnover, etc.)
- Responder sempre em português europeu
- Ser conciso (máximo 3 parágrafos por resposta)
- Ser caloroso, humano e orientado para ajudar — não para vender

Fluxo de qualificação de lead:
1. Perceber o desafio da empresa
2. Mostrar como a TEAM 24 resolve esse desafio específico
3. Pedir nome + email para agendar uma conversa com a equipa
4. Confirmar que serão contactados em menos de 24 horas

Quando o utilizador deixar os seus contactos, agradeça e confirme: "Obrigado! A nossa equipa entrará em contacto consigo em menos de 24 horas úteis."
Se quiserem avançar de imediato, sugira agendar uma demo gratuita em /demo.`;

export const appRouter = router({
  system: systemRouter,

  // Formulários → Odoo CRM / Contactos
  forms: router({
    // Formulário de contacto geral
    contact: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        company: z.string().optional(),
        phone: z.string().optional(),
        message: z.string().optional(),
        service: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const leadId = await createOdooLead({
            name: input.name,
            email: input.email,
            company: input.company,
            phone: input.phone,
            message: [input.service ? `Serviço: ${input.service}` : null, input.message].filter(Boolean).join("\n"),
            source: "contacto",
          });
          // Criar também directamente no CRM interno
          const db = await getDb();
          if (db) {
            const titulo = `[CONTACTO] ${input.name}${input.company ? ` — ${input.company}` : ''}`;
            const notas = [
              `Email: ${input.email}`,
              input.phone ? `Tel: ${input.phone}` : null,
              input.service ? `Serviço: ${input.service}` : null,
              input.message ? `Mensagem: ${input.message}` : null,
            ].filter(Boolean).join(' | ');
            await db.insert(crmLeads).values({
              titulo, fase: 'leads', ativo: true, origem: 'website',
              responsavelNome: input.name, notas,
              ultimaActividade: new Date(),
            }).catch(e => console.error('[CRM] insert lead error:', e));
          }
          // Notificar Filipe por email (não bloqueia)
          sendLeadNotificationEmail({
            leadId,
            name: input.name,
            email: input.email,
            company: input.company,
            phone: input.phone,
            message: [input.service ? `Serviço: ${input.service}` : null, input.message].filter(Boolean).join("\n") || undefined,
            source: "contacto",
          }).catch((e) => console.error("[Odoo] lead notification error:", e));
          return { success: true, leadId };
        } catch (err) {
          console.error("[Odoo] contact form error:", err);
          return { success: false, leadId: null };
        }
      }),

    // Formulário de parceiros
    partner: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        company: z.string().optional(),
        phone: z.string().optional(),
        partnerType: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const leadId = await createOdooLead({
            name: input.name,
            email: input.email,
            company: input.company,
            phone: input.phone,
            message: [input.partnerType ? `Tipo de parceria: ${input.partnerType}` : null, input.message].filter(Boolean).join("\n"),
            source: "parceiros",
          });
          // Criar também directamente no CRM interno
          const db = await getDb();
          if (db) {
            const titulo = `[PARCEIROS] ${input.name}${input.company ? ` — ${input.company}` : ''}`;
            const notas = [
              `Email: ${input.email}`,
              input.phone ? `Tel: ${input.phone}` : null,
              input.partnerType ? `Tipo de parceria: ${input.partnerType}` : null,
              input.message ? `Mensagem: ${input.message}` : null,
            ].filter(Boolean).join(' | ');
            await db.insert(crmLeads).values({
              titulo, fase: 'leads', ativo: true, origem: 'website',
              responsavelNome: input.name, notas,
              ultimaActividade: new Date(),
            }).catch(e => console.error('[CRM] insert lead error:', e));
          }
          // Notificar Filipe por email (não bloqueia)
          sendLeadNotificationEmail({
            leadId,
            name: input.name,
            email: input.email,
            company: input.company,
            phone: input.phone,
            message: [input.partnerType ? `Tipo de parceria: ${input.partnerType}` : null, input.message].filter(Boolean).join("\n") || undefined,
            source: "parceiros",
          }).catch((e) => console.error("[Odoo] lead notification error:", e));
          return { success: true, leadId };
        } catch (err) {
          console.error("[Odoo] partner form error:", err);
          return { success: false, leadId: null };
        }
      }),

    // Formulário de download de ebook/recurso
    ebook: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        company: z.string().optional(),
        ebook_title: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const leadId = await createOdooLead({
            name: input.name,
            email: input.email,
            company: input.company,
            source: "ebook",
            ebook_title: input.ebook_title,
          });
          // Criar também directamente no CRM interno como lead
          const db = await getDb();
          if (db) {
            const titulo = `[EBOOK] Download: ${input.ebook_title} — ${input.name}${input.company ? ` (${input.company})` : ''}`;
            const notas = [
              `Email: ${input.email}`,
              input.company ? `Empresa: ${input.company}` : null,
              `Recurso: ${input.ebook_title}`,
            ].filter(Boolean).join(' | ');
            await db.insert(crmLeads).values({
              titulo, fase: 'leads', ativo: true, origem: 'website',
              responsavelNome: input.name, notas,
              ultimaActividade: new Date(),
            }).catch(e => console.error('[CRM] insert lead error:', e));
          }
          // Enviar email com o ebook em anexo via Odoo
          // Não bloqueia a resposta se o envio falhar — lead já foi criada
          sendOdooEbookEmail(leadId, input.name, input.email, input.ebook_title).catch((emailErr) => {
            console.error("[Odoo] ebook email send error:", emailErr);
          });
          // Notificar Filipe por email (não bloqueia)
          sendLeadNotificationEmail({
            leadId,
            name: input.name,
            email: input.email,
            company: input.company,
            message: `Ebook: ${input.ebook_title}`,
            source: "ebook",
          }).catch((e) => console.error("[Odoo] lead notification error:", e));
          return { success: true, leadId };
        } catch (err) {
          console.error("[Odoo] ebook form error:", err);
          return { success: false, leadId: null };
        }
      }),

    // Newsletter → cria contacto no Odoo + envia email de boas-vindas
    newsletter: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const partnerId = await subscribeOdooNewsletter({
            email: input.email,
            name: input.name,
          });
          // Send welcome email asynchronously (non-blocking)
          sendOdooNewsletterWelcomeEmail(input.name || "", input.email).catch((emailErr) => {
            console.error("[Odoo] newsletter welcome email error:", emailErr);
          });
          return { success: true, partnerId };
        } catch (err) {
          console.error("[Odoo] newsletter form error:", err);
          return { success: false, partnerId: null };
        }
      }),
  }),

  // Newsletter subscriptions
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const isDupEntry = (e: unknown): boolean => {
          if (!e || typeof e !== "object") return false;
          const obj = e as Record<string, unknown>;
          if (obj["code"] === "ER_DUP_ENTRY") return true;
          if (typeof obj["errno"] === "number" && obj["errno"] === 1062) return true;
          if (typeof obj["message"] === "string" && obj["message"].toLowerCase().includes("duplicate")) return true;
          if (obj["cause"]) return isDupEntry(obj["cause"]);
          return false;
        };

        // 1. Guardar na BD local
        let alreadySubscribed = false;
        try {
          await db.insert(newsletterSubscribers).values({ email: input.email });
        } catch (err: unknown) {
          if (isDupEntry(err)) {
            alreadySubscribed = true;
          } else {
            console.error("[newsletter.subscribe] unexpected error:", err);
            throw err;
          }
        }

        // 2. Integrar com Odoo (não bloquear em caso de erro)
        if (!alreadySubscribed) {
          // Criar/actualizar contacto na mailing list do Odoo
          subscribeOdooNewsletter({ email: input.email, name: input.name }).catch((err) => {
            console.error("[newsletter.subscribe] Odoo subscribe error:", err);
          });
          // Enviar email de boas-vindas via Odoo
          sendOdooNewsletterWelcomeEmail(input.name || "", input.email).catch((err) => {
            console.error("[newsletter.subscribe] Odoo welcome email error:", err);
          });
        }

        return { success: true, alreadySubscribed };
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  backoffice: backofficeRouter,
  outreach: outreachRouter,
  crm: crmRouter,
  crmQualidade: crmQualidadeRouter,
  crmAutomacoes: crmAutomacoesRouter,
  equipa: equipaRouter,
  actividadeComercial: actividadeComercialRouter,

  // ─── QUESTIONÁRIOS PÚBLICOS (acesso por token) ───────────────────────────────────────────
  questionario: router({
    // Obter questionário por token (página pública do candidato)
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const [t] = await db.select().from(tokensQuestionario)
          .where(eq(tokensQuestionario.token, input.token));
        if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Link inválido ou expirado." });
        if (t.expiraAt && new Date(t.expiraAt) < new Date()) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Este link expirou." });
        }
        if (t.respondido) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Já respondeu a este questionário." });
        }
        const [q] = await db.select().from(questionariosTable)
          .where(eq(questionariosTable.id, t.questionarioId));
        if (!q) throw new TRPCError({ code: "NOT_FOUND" });
        const perguntas = await db.select().from(perguntasQuestionario)
          .where(eq(perguntasQuestionario.questionarioId, q.id))
          .orderBy(perguntasQuestionario.ordem);
        return { questionario: q, perguntas, tokenId: t.id };
      }),

    // Submeter respostas
    submit: publicProcedure
      .input(z.object({
        token: z.string(),
        respostas: z.array(z.object({
          perguntaId: z.number(),
          resposta: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "BD indisponível" });
        const [t] = await db.select().from(tokensQuestionario)
          .where(eq(tokensQuestionario.token, input.token));
        if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Link inválido." });
        if (t.expiraAt && new Date(t.expiraAt) < new Date()) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Este link expirou." });
        }
        if (t.respondido) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Já respondeu a este questionário." });
        }
        if (input.respostas.length > 0) {
          await db.insert(respostasQuestionario).values(
            input.respostas.map(r => ({
              tokenId: t.id,
              perguntaId: r.perguntaId,
              resposta: r.resposta,
            }))
          );
        }
        await db.update(tokensQuestionario)
          .set({ respondido: true, respondidoAt: new Date() })
          .where(eq(tokensQuestionario.token, input.token));
        return { success: true };
      }),
  }),

  // Blog auto-generation (triggered by scheduled task)
  blog: router({
    generateArticle: publicProcedure
      .input(z.object({ secret: z.string() }))
      .mutation(async ({ input }) => {
        // Simple secret key check to prevent unauthorized triggers
        const expectedSecret = process.env.JWT_SECRET;
          if (!expectedSecret) {
            // Sem segredo definido, este endereco ficava aberto a qualquer pessoa
            // com o valor que estava escrito no codigo. Recusar e o correcto.
            throw new Error("JWT_SECRET nao definida; geracao de artigos desactivada.");
          }
        if (input.secret !== expectedSecret) {
          throw new Error("Unauthorized");
        }
        const result = await generateBlogArticle();
        return result;
      }),
  }),

  // Upload de ficheiros para S3 (imagens e PDFs do backoffice)
  // SEGURANÇA: requer sessão de backoffice válida
  upload: router({
    file: boUploadProcedure
      .input(z.object({
        filename: z.string().max(255),
        contentType: z.string(),
        data: z.string().max(15_000_000), // ~11MB em base64
        folder: z.string().default("backoffice"),
      }))
      .mutation(async ({ input }) => {
        // Validar tipo MIME contra whitelist
        if (!ALLOWED_UPLOAD_MIME_TYPES.has(input.contentType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Tipo de ficheiro não permitido: ${input.contentType}. Tipos aceites: imagens (JPEG, PNG, GIF, WebP, SVG) e documentos (PDF, DOC, DOCX).`,
          });
        }
        // Sanitizar folder para prevenir path traversal
        const safeFolder = sanitizeUploadFolder(input.folder);
        const ext = input.filename.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
        const key = `${safeFolder}/${nanoid(10)}.${ext}`;
        const buffer = Buffer.from(input.data, "base64");
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url, key };
      }),
  }),

  // Upload público para candidaturas (sem autenticação de backoffice)
  publicUpload: router({
    cv: publicProcedure
      .input(z.object({
        filename: z.string().max(255),
        contentType: z.string(),
        data: z.string().max(15_000_000), // ~11MB em base64
      }))
      .mutation(async ({ input }) => {
        // Apenas PDF, DOC e DOCX são permitidos para CVs
        const allowedCvTypes = new Set([
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]);
        if (!allowedCvTypes.has(input.contentType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tipo de ficheiro não permitido. Apenas PDF, DOC e DOCX são aceites.",
          });
        }
        const ext = input.filename.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "pdf";
        const key = `candidaturas/${nanoid(12)}.${ext}`;
        const buffer = Buffer.from(input.data, "base64");
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url, key };
      }),
  }),

  // Chat com IA
  chat: router({
    sendMessage: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
      effort: "low", // chat do site: o visitante esta a espera
            messages: [
              { role: "system", content: TEAM24_SYSTEM_PROMPT },
              ...input.messages,
            ],
          });

          const content = response.choices?.[0]?.message?.content ?? "Desculpe, não consegui processar a sua mensagem. Por favor tente novamente.";
          return { content };
        } catch (error) {
          console.error("[Chat] LLM error:", error);
          return {
            content: "De momento não consigo responder. Por favor contacte-nos diretamente pelo +351 220 981 284 ou em geral@team24.pt.",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
