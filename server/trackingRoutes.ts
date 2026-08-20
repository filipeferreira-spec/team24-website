import type { Express, Request, Response } from "express";
import { getDb } from "./db";
import { outreachTracking, outreachEnvios } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Pixel GIF 1x1 transparente
const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export function registerTrackingRoutes(app: Express) {
  // ── Pixel de abertura ──────────────────────────────────────────────────────
  // GET /api/track/open?e=<envioId>
  app.get("/api/track/open", async (req: Request, res: Response) => {
    // Responder imediatamente com o pixel (não bloquear)
    res.set({
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL_GIF.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    res.end(PIXEL_GIF);

    // Registar a abertura em background
    const envioId = parseInt(String(req.query.e || "0"));
    if (!envioId) return;

    try {
      const db = await getDb();
      if (!db) return;

      const [envio] = await db
        .select()
        .from(outreachEnvios)
        .where(eq(outreachEnvios.id, envioId));
      if (!envio) return;

      // Verificar se já foi registada uma abertura para este envio (evitar duplicados do mesmo cliente)
      const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "");
      const userAgent = String(req.headers["user-agent"] || "").slice(0, 512);

      await db.insert(outreachTracking).values({
        envioId,
        campanhaId: envio.campanhaId,
        contactoId: envio.contactoId,
        emailId: envio.emailId,
        tipo: "abertura",
        ip: ip.slice(0, 64),
        userAgent,
      });

      // Actualizar estado do envio para "aberto" se ainda estava "enviado"
      if (envio.estado === "enviado") {
        await db
          .update(outreachEnvios)
          .set({ estado: "aberto" })
          .where(eq(outreachEnvios.id, envioId));
      }
    } catch {
      // Silenciar erros — não afectar o carregamento do email
    }
  });

  // ── Redirect de clique ─────────────────────────────────────────────────────
  // GET /api/track/click?e=<envioId>&u=<urlBase64>
  app.get("/api/track/click", async (req: Request, res: Response) => {
    const envioId = parseInt(String(req.query.e || "0"));
    const urlEncoded = String(req.query.u || "");
    let destUrl = "https://team24.pt";

    try {
      destUrl = Buffer.from(urlEncoded, "base64").toString("utf-8");
    } catch {
      // URL inválida — redirecionar para homepage
    }

    // Redirecionar imediatamente
    res.redirect(302, destUrl);

    // Registar o clique em background
    if (!envioId) return;

    try {
      const db = await getDb();
      if (!db) return;

      const [envio] = await db
        .select()
        .from(outreachEnvios)
        .where(eq(outreachEnvios.id, envioId));
      if (!envio) return;

      const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "");
      const userAgent = String(req.headers["user-agent"] || "").slice(0, 512);

      await db.insert(outreachTracking).values({
        envioId,
        campanhaId: envio.campanhaId,
        contactoId: envio.contactoId,
        emailId: envio.emailId,
        tipo: "clique",
        url: destUrl.slice(0, 2048),
        ip: ip.slice(0, 64),
        userAgent,
      });

      // Actualizar estado para "clicado" se ainda estava em estado anterior
      if (envio.estado === "enviado" || envio.estado === "aberto") {
        await db
          .update(outreachEnvios)
          .set({ estado: "clicado" })
          .where(eq(outreachEnvios.id, envioId));
      }
    } catch {
      // Silenciar erros
    }
  });
}
