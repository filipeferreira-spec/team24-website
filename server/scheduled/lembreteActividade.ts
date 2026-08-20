/**
 * Handler: POST /api/scheduled/lembrete-actividade
 *
 * Disparado pelo Heartbeat cron todos os dias úteis às 17h (UTC+1 = 16h UTC).
 * Envia um email de lembrete a cada comercial para preencher os dados de actividade do dia.
 */

import type { Request, Response } from "express";
import { getDb } from "../db";
import { actividadeComercial } from "../../drizzle/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { interceptar } from "../desvioEmail";

// Comerciais e respectivos emails
const COMERCIAIS = [
  { nome: "Rita Condeça",  email: "ritacondeca@team24.pt" },
  { nome: "Sérgio Caldas", email: "sergiocaldas@team24.pt" },
  { nome: "Vanda Brás",    email: "vandabras@team24.pt" },
];

// ─── Helpers de XML-RPC (mesmo padrão do odoo.ts) ────────────────────────────

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function xmlRpcCommon(method: string, params: string): Promise<string> {
  const ODOO_URL = process.env.ODOO_URL!;
  const body = `<?xml version="1.0"?><methodCall><methodName>${method}</methodName><params>${params}</params></methodCall>`;
  const res = await fetch(`${ODOO_URL}/xmlrpc/2/common`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
  });
  return res.text();
}

async function xmlRpcObject(
  uid: number,
  model: string,
  method: string,
  argsXml: string,
  kwargsXml = "<struct/>"
): Promise<string> {
  // Rede de seguranca: desvia ou bloqueia emails. Ver server/desvioEmail.ts
  argsXml = interceptar(model, method, argsXml);
  const ODOO_URL = process.env.ODOO_URL!;
  const ODOO_DB = process.env.ODOO_DB!;
  const ODOO_API_KEY = process.env.ODOO_API_KEY!;
  const body = `<?xml version="1.0"?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${escapeXml(ODOO_DB)}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${escapeXml(ODOO_API_KEY)}</string></value></param>
    <param><value><string>${escapeXml(model)}</string></value></param>
    <param><value><string>${escapeXml(method)}</string></value></param>
    <param><value><array><data><value>${argsXml}</value></data></array></value></param>
    <param><value>${kwargsXml}</value></param>
  </params></methodCall>`;
  const res = await fetch(`${ODOO_URL}/xmlrpc/2/object`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
  });
  return res.text();
}

function parseXmlRpcInt(xml: string): number | null {
  const m = xml.match(/<int>(\d+)<\/int>/);
  return m ? parseInt(m[1]) : null;
}

function parseXmlRpcFault(xml: string): string | null {
  if (xml.includes("<fault>")) {
    const m = xml.match(/<string>([\s\S]*?)<\/string>/);
    return m ? m[1] : "Unknown fault";
  }
  return null;
}

let _uid: number | null = null;
async function getUid(): Promise<number> {
  if (_uid) return _uid;
  const ODOO_URL = process.env.ODOO_URL!;
  const ODOO_DB = process.env.ODOO_DB!;
  const ODOO_USER = process.env.ODOO_USER!;
  const ODOO_API_KEY = process.env.ODOO_API_KEY!;
  const xml = await xmlRpcCommon(
    "authenticate",
    `<param><value><string>${escapeXml(ODOO_DB)}</string></value></param>
     <param><value><string>${escapeXml(ODOO_USER)}</string></value></param>
     <param><value><string>${escapeXml(ODOO_API_KEY)}</string></value></param>
     <param><value><struct/></value></param>`
  );
  const uid = parseXmlRpcInt(xml);
  if (!uid) throw new Error("Odoo authentication failed");
  _uid = uid;
  return uid;
}

async function sendEmailViaOdoo(
  subject: string,
  bodyHtml: string,
  recipientEmail: string
): Promise<void> {
  const uid = await getUid();

  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>${escapeXml(subject)}</string></value></member>
      <member><name>email_from</name><value><string>marketing@team24.pt</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(recipientEmail)}</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value>`
  );

  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create mail failed: ${createFault}`);

  const mailId = parseXmlRpcInt(createXml);
  if (!mailId) throw new Error("Odoo create mail returned no ID");

  const sendXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "send",
    `<value><array><data><value><int>${mailId}</int></value></data></array></value>`
  );
  const sendFault = parseXmlRpcFault(sendXml);
  if (sendFault) throw new Error(`Odoo send mail failed: ${sendFault}`);
}

function buildLembreteHtml(nome: string, dataFormatada: string, jaPreencheu: boolean): string {
  const primeiroNome = nome.split(" ")[0];

  if (jaPreencheu) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#10B981;padding:24px 36px;">
            <p style="margin:0;color:white;font-size:20px;font-weight:700;">TEAM 24</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Actividade Comercial — ${escapeXml(dataFormatada)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 36px;">
            <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a1a;">✅ Obrigado, ${escapeXml(primeiroNome)}!</h2>
            <p style="margin:0;font-size:15px;color:#555;line-height:1.7;">
              Os teus dados de actividade de hoje já estão registados. Bom trabalho!
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 36px 28px;text-align:center;color:#aaa;font-size:12px;">
            <p style="margin:0;">TEAM 24 — Sistema de Actividade Comercial</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#F97316;padding:24px 36px;">
            <p style="margin:0;color:white;font-size:20px;font-weight:700;">TEAM 24</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Lembrete — Actividade Comercial de ${escapeXml(dataFormatada)}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">Olá ${escapeXml(primeiroNome)} 👋</h2>
            <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
              Ainda não registaste a tua actividade comercial de hoje. Lembra-te de preencher os dados antes do fim do dia!
            </p>
            <p style="margin:0 0 8px;font-size:14px;color:#888;">O que deves registar:</p>
            <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#555;line-height:2;">
              <li>Leads contactadas</li>
              <li>Reuniões agendadas</li>
              <li>Reuniões realizadas</li>
              <li>Propostas enviadas</li>
              <li>Contratos fechados</li>
            </ul>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background:#F97316;border-radius:8px;padding:14px 32px;">
                  <a href="https://www.team24.pt/crm/actividade" style="color:white;font-size:15px;font-weight:700;text-decoration:none;">
                    Preencher Actividade →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 36px 28px;text-align:center;color:#aaa;font-size:12px;border-top:1px solid #f0f0f0;padding-top:20px;">
            <p style="margin:0;">Este email é enviado automaticamente pelo sistema CRM TEAM 24.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function lembreteActividadeHandler(req: Request, res: Response) {
  try {
    // Autenticação: aceitar cookie de cron Heartbeat OU API key de administrador
    const apiKey = req.headers["x-api-key"] || (req.headers["authorization"] ?? "").replace("Bearer ", "");
    const isApiKeyAuth = apiKey && apiKey === process.env.PROSPECTING_API_KEY;

    if (!isApiKeyAuth) {
      const cookies = (req.headers.cookie || "").split(";").reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.trim().split("=");
        if (k) acc[k.trim()] = v || "";
        return acc;
      }, {});
      const sessionCookie = cookies["app_session_id"];
      if (!sessionCookie) {
        return res.status(403).json({ error: "permission error for cron cookie" });
      }
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database unavailable" });
    }

    // Data de hoje em Lisboa
    const agora = new Date();
    const offsetMs = 60 * 60 * 1000; // UTC+1 mínimo
    const dataLisboa = new Date(agora.getTime() + offsetMs);
    const hoje = dataLisboa.toISOString().slice(0, 10);
    const [ano, mes, dia] = hoje.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // Para cada comercial, verificar se já preencheu hoje e enviar email
    const resultados: { nome: string; email: string; jaPreencheu: boolean; enviado: boolean; erro?: string }[] = [];

    for (const comercial of COMERCIAIS) {
      try {
        // Query específica por comercial
        const registoComercial = await db
          .select({ id: actividadeComercial.id })
          .from(actividadeComercial)
          .where(
            and(
              gte(actividadeComercial.data, hoje),
              lte(actividadeComercial.data, hoje),
              eq(actividadeComercial.comercialNome, comercial.nome)
            )
          );

        const preencheu = registoComercial.length > 0;
        const subject = preencheu
          ? `✅ Actividade registada — ${dataFormatada}`
          : `⏰ Lembrete: preenche a tua actividade de hoje — ${dataFormatada}`;

        const bodyHtml = buildLembreteHtml(comercial.nome, dataFormatada, preencheu);
        await sendEmailViaOdoo(subject, bodyHtml, comercial.email);

        resultados.push({ nome: comercial.nome, email: comercial.email, jaPreencheu: preencheu, enviado: true });
        console.log(`[lembrete-actividade] Email enviado para ${comercial.email} (${comercial.nome}) — preencheu: ${preencheu}`);
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err);
        resultados.push({ nome: comercial.nome, email: comercial.email, jaPreencheu: false, enviado: false, erro: error });
        console.error(`[lembrete-actividade] Erro ao enviar para ${comercial.email}:`, error);
      }
    }

    return res.json({ ok: true, data: dataFormatada, resultados });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[lembrete-actividade] Erro:", error);
    return res.status(500).json({
      error,
      stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}
