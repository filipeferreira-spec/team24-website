import dotenv from "dotenv";
dotenv.config({ override: false }); // Em produção, as variáveis do Manus têm prioridade sobre o .env local
import path from "node:path";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import net from "net";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import { getDb } from "../db";
import { tokensQuestionario, candidaturas, carreiras } from "../../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";
import { sendLembreteQuestionarioEmail } from "../odoo";
import { registerTrackingRoutes } from "../trackingRoutes";
import { registerPrerendered } from "../prerendered";
import { syncOdooContactsHandler } from "../syncOdooContacts";
import { handleProspectingWebhook } from "../routers/crmProspecting";
import { resumoActividadeHandler } from "../scheduled/resumoActividade";
import { lembreteActividadeHandler } from "../scheduled/lembreteActividade";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ─── SEGURANÇA: Headers HTTP com Helmet ────────────────────────────────────
  // Aplica X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  // Permissions-Policy, Strict-Transport-Security e Content-Security-Policy
  app.use(
    helmet({
      // Content-Security-Policy: restringir fontes de conteúdo
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // necessário para Vite HMR em dev
            "https://fonts.googleapis.com",
            "https://maps.googleapis.com",
            "https://maps.gstatic.com",
            "https://assets.calendly.com",
            "https://www.googletagmanager.com",
            "https://tagmanager.google.com",
            "https://www.google-analytics.com",
            "https://ssl.google-analytics.com",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'", // necessário para Tailwind CSS
            "https://fonts.googleapis.com",
            "https://assets.calendly.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https:",
            "https://maps.googleapis.com",
            "https://maps.gstatic.com",
            "https://www.googletagmanager.com",
            "https://www.google-analytics.com",
            "https://stats.g.doubleclick.net",
          ],
          connectSrc: [
            "'self'",
            "https://api.manus.im",
            "https://maps.googleapis.com",
            "https://calendly.com",
            "https://api.calendly.com",
            "wss:", // WebSocket para Vite HMR
            "ws:",
            "https://www.google-analytics.com",
            "https://analytics.google.com",
            "https://stats.g.doubleclick.net",
            "https://region1.google-analytics.com",
            "https://www.googletagmanager.com",
          ],
          frameSrc: ["https://calendly.com"], // Permitir iframe do Calendly
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      // X-Frame-Options: SAMEORIGIN — permite Calendly iframe embebido
      frameguard: { action: "sameorigin" },
      // X-Content-Type-Options: nosniff — impede MIME sniffing
      noSniff: true,
      // Strict-Transport-Security: forçar HTTPS por 1 ano
      hsts: {
        maxAge: 31536000, // 1 ano em segundos
        includeSubDomains: true,
        preload: true,
      },
      // Referrer-Policy: não vazar URLs internas
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      // X-XSS-Protection: desativado (CSP é mais eficaz e este header é obsoleto)
      xssFilter: false,
      // Permissions-Policy: restringir acesso a câmara, microfone, geolocalização
      permittedCrossDomainPolicies: false,
      // Cross-Origin-Opener-Policy: unsafe-none permite GTM e scripts de terceiros
      crossOriginOpenerPolicy: false,
      // Cross-Origin-Resource-Policy: cross-origin permite recursos de terceiros (GTM, GA4)
      crossOriginResourcePolicy: false,
    })
  );

  // Adicionar Permissions-Policy manualmente (helmet não suporta diretamente)
  app.use((_req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    );
    next();
  });

  // ─── BODY PARSER: limite reduzido para rotas normais ────────────────────────
  // Rotas de upload de ficheiros: limite de 15MB (CVs, imagens, etc.)
  app.use("/api/trpc/upload.file", express.json({ limit: "15mb" }));
  app.use("/api/trpc/upload.file", express.urlencoded({ limit: "15mb", extended: true }));
  // Rota de upload de CV de candidaturas: limite de 15MB
  app.use("/api/trpc/publicUpload.cv", express.json({ limit: "15mb" }));
  app.use("/api/trpc/publicUpload.cv", express.urlencoded({ limit: "15mb", extended: true }));
  // Todas as outras rotas: limite de 1MB (suficiente para JSON de formulários)
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  // Storage proxy: serve /manus-storage/* via signed CDN URLs
  registerStorageProxy(app);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Email tracking: pixel de abertura + redirect de cliques
  registerTrackingRoutes(app);

  // Sincronização diária de contactos do Odoo
  app.post("/api/scheduled/sync-odoo-contacts", syncOdooContactsHandler);

  // Resumo diário de actividade comercial (às 20h)
  app.post("/api/scheduled/resumo-actividade", resumoActividadeHandler);

  // Lembrete diário para comerciais preencherem actividade (às 17h)
  app.post("/api/scheduled/lembrete-actividade", lembreteActividadeHandler);

  // Webhook de Prospecção LinkedIn (chamado pelo agente Claude)
  app.post("/api/prospecting/webhook", handleProspectingWebhook);
  app.get("/api/prospecting/webhook", (_req, res) => res.json({ status: "ok", info: "TEAM24 Prospecting Webhook — use POST com x-api-key" }));
  // Endpoint GET de leitura de leads (alias conveniente para action=list)
  app.get("/api/prospecting/leads", async (req, res) => {
    // Reutilizar o mesmo handler injectando action=list no body
    (req as any).body = {
      action: "list",
      limit: req.query.limit || "15",
      excluirEstados: req.query.excluirEstados
        ? String(req.query.excluirEstados).split(",")
        : undefined,
    };
    return handleProspectingWebhook(req as any, res);
  });

  // ─── Upload de CV via multipart/form-data (evita problemas com redirect 301) ───
  const cvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter: (_req, file, cb) => {
      const allowed = new Set([
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]);
      if (allowed.has(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Tipo de ficheiro não permitido. Apenas PDF, DOC e DOCX são aceites."));
      }
    },
  });

  app.post("/api/upload/cv", cvUpload.single("cv"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Nenhum ficheiro enviado." });
        return;
      }
      const ext = (req.file.originalname.split(".").pop() || "pdf").replace(/[^a-zA-Z0-9]/g, "");
      const key = `candidaturas/${nanoid(12)}.${ext}`;
      const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
      res.json({ url, key });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erro ao fazer upload." });
    }
  });

  // ─── SCHEDULED JOB: Lembrete de questionário (corre diariamente) ────────────
  app.post("/api/scheduled/lembrete-questionario", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ ok: false, error: "Base de dados não disponível" });
        return;
      }
      const tresHorasAtras = new Date(Date.now() - 3 * 60 * 60 * 1000);
      // Buscar tokens com email enviado há mais de 3 horas, não respondidos e sem lembrete
      const tokens = await db
        .select({
          id: tokensQuestionario.id,
          token: tokensQuestionario.token,
          candidaturaId: tokensQuestionario.candidaturaId,
          emailEnviadoAt: tokensQuestionario.emailEnviadoAt,
          candidaturaNome: candidaturas.nome,
          candidaturaEmail: candidaturas.email,
          carreiraTitulo: carreiras.titulo,
        })
        .from(tokensQuestionario)
        .innerJoin(candidaturas, eq(tokensQuestionario.candidaturaId, candidaturas.id))
        .leftJoin(carreiras, eq(candidaturas.carreiraId, carreiras.id))
        .where(
          and(
            eq(tokensQuestionario.emailEnviado, true),
            eq(tokensQuestionario.respondido, false),
            eq(tokensQuestionario.lembreteEnviado, false),
            lt(tokensQuestionario.emailEnviadoAt, tresHorasAtras)
          )
        );

      let enviados = 0;
      const erros: string[] = [];

      for (const t of tokens) {
        try {
          const link = `https://www.team24.pt/questionario/${t.token}`;
          const vagaTitulo = t.carreiraTitulo ?? "Candidatura Espontânea";
          await sendLembreteQuestionarioEmail(
            t.candidaturaNome,
            t.candidaturaEmail,
            vagaTitulo,
            link
          );
          await db
            .update(tokensQuestionario)
            .set({ lembreteEnviado: true, lembreteEnviadoAt: new Date() })
            .where(eq(tokensQuestionario.id, t.id));
          enviados++;
        } catch (err: any) {
          erros.push(`Token ${t.id}: ${err.message}`);
        }
      }

      res.json({ ok: true, processados: tokens.length, enviados, erros });
    } catch (err: any) {
      console.error("[lembrete-questionario] Erro:", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    // Paginas pre-geradas ANTES dos ficheiros estaticos, para apanharem o
    // pedido do HTML antes de o index.html vazio ser servido.
    registerPrerendered(app, path.resolve(process.cwd(), "dist/public/index.html"));
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
