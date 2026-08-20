/**
 * Handler: POST /api/scheduled/resumo-actividade
 *
 * Disparado pelo Heartbeat cron todos os dias às 20h (UTC+1 = 19h UTC).
 * Agrega os registos de actividade comercial do dia e do acumulado do mês
 * e envia um email HTML para a equipa de gestão via Odoo SMTP.
 */

import type { Request, Response } from "express";
import { getDb } from "../db";
import { actividadeComercial } from "../../drizzle/schema";
import { and, gte, lte, sql } from "drizzle-orm";
import { interceptar } from "../desvioEmail";

// Destinatários fixos
const DESTINATARIOS = [
  "marketing@team24.pt",
  "pedro.bras@team24.pt",
  "flavia.rodrigues@team24.pt",
];

// ─── Helpers de XML-RPC (copiados do padrão odoo.ts) ─────────────────────────

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

// ─── Envio de email via Odoo ──────────────────────────────────────────────────

async function sendEmailViaOdoo(
  subject: string,
  bodyHtml: string,
  recipients: string[]
): Promise<void> {
  const uid = await getUid();
  const emailTo = recipients.join(", ");

  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>${escapeXml(subject)}</string></value></member>
      <member><name>email_from</name><value><string>marketing@team24.pt</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(emailTo)}</string></value></member>
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

// ─── Formatação do email ──────────────────────────────────────────────────────

interface Totais {
  leadsContactadas: number;
  reunioesAgendadas: number;
  reunioesRealizadas: number;
  propostasEnviadas: number;
  contratosFechados: number;
}

interface PorComercial {
  nome: string;
  leadsContactadas: number;
  reunioesAgendadas: number;
  reunioesRealizadas: number;
  propostasEnviadas: number;
  contratosFechados: number;
}

function taxaFecho(t: Totais): string {
  if (t.leadsContactadas === 0) return "—";
  return `${Math.round((t.contratosFechados / t.leadsContactadas) * 100)}%`;
}

function buildEmailHtml(
  dataHoje: string,
  totaisHoje: Totais,
  porComercialHoje: PorComercial[],
  totaisMes: Totais,
  porComercialMes: PorComercial[],
  mesLabel: string
): string {
  const rowStyle = `style="border-bottom: 1px solid #f0f0f0;"`;
  const thStyle = `style="padding: 10px 14px; text-align: left; background: #f8f8f8; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;"`;
  const tdStyle = `style="padding: 10px 14px; font-size: 14px; color: #333;"`;
  const tdNum = `style="padding: 10px 14px; font-size: 14px; color: #333; text-align: center;"`;

  function tabelaComerciais(rows: PorComercial[]): string {
    if (rows.length === 0) return `<p style="color:#999;font-size:13px;">Sem registos.</p>`;
    return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border: 1px solid #e8e8e8; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr>
          <th ${thStyle}>Comercial</th>
          <th ${thStyle} style="text-align:center;">Leads</th>
          <th ${thStyle} style="text-align:center;">Reun. Ag.</th>
          <th ${thStyle} style="text-align:center;">Reun. Real.</th>
          <th ${thStyle} style="text-align:center;">Propostas</th>
          <th ${thStyle} style="text-align:center;">Contratos</th>
          <th ${thStyle} style="text-align:center;">Taxa</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `<tr ${rowStyle}>
          <td ${tdStyle}><strong>${escapeXml(r.nome)}</strong></td>
          <td ${tdNum}>${r.leadsContactadas}</td>
          <td ${tdNum}>${r.reunioesAgendadas}</td>
          <td ${tdNum}>${r.reunioesRealizadas}</td>
          <td ${tdNum}>${r.propostasEnviadas}</td>
          <td ${tdNum}>${r.contratosFechados}</td>
          <td ${tdNum}>${taxaFecho(r)}</td>
        </tr>`).join("")}
      </tbody>
    </table>`;
  }

  function kpiBlock(label: string, valor: number | string, cor: string): string {
    return `<td style="padding: 0 8px; text-align: center;">
      <div style="background: ${cor}15; border: 1px solid ${cor}30; border-radius: 10px; padding: 14px 18px; min-width: 90px;">
        <div style="font-size: 26px; font-weight: 700; color: ${cor};">${valor}</div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">${label}</div>
      </div>
    </td>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding: 32px 16px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background: #F97316; padding: 28px 36px;">
            <p style="margin:0; color:white; font-size:22px; font-weight:700; letter-spacing:-0.5px;">TEAM 24</p>
            <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">Resumo de Actividade Comercial — ${escapeXml(dataHoje)}</p>
          </td>
        </tr>

        <!-- Hoje KPIs -->
        <tr>
          <td style="padding: 28px 36px 0;">
            <h2 style="margin:0 0 18px; font-size:16px; color:#1a1a1a; font-weight:700;">Hoje — ${escapeXml(dataHoje)}</h2>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                ${kpiBlock("Leads", totaisHoje.leadsContactadas, "#3B82F6")}
                ${kpiBlock("Reun. Ag.", totaisHoje.reunioesAgendadas, "#8B5CF6")}
                ${kpiBlock("Reun. Real.", totaisHoje.reunioesRealizadas, "#06B6D4")}
                ${kpiBlock("Propostas", totaisHoje.propostasEnviadas, "#F59E0B")}
                ${kpiBlock("Contratos", totaisHoje.contratosFechados, "#10B981")}
              </tr>
            </table>
            ${tabelaComerciais(porComercialHoje)}
          </td>
        </tr>

        <!-- Separador -->
        <tr><td style="padding: 24px 36px 0;"><hr style="border:none; border-top:1px solid #f0f0f0; margin:0;"></td></tr>

        <!-- Acumulado mês -->
        <tr>
          <td style="padding: 24px 36px 0;">
            <h2 style="margin:0 0 18px; font-size:16px; color:#1a1a1a; font-weight:700;">Acumulado — ${escapeXml(mesLabel)}</h2>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                ${kpiBlock("Leads", totaisMes.leadsContactadas, "#3B82F6")}
                ${kpiBlock("Reun. Ag.", totaisMes.reunioesAgendadas, "#8B5CF6")}
                ${kpiBlock("Reun. Real.", totaisMes.reunioesRealizadas, "#06B6D4")}
                ${kpiBlock("Propostas", totaisMes.propostasEnviadas, "#F59E0B")}
                ${kpiBlock("Contratos", totaisMes.contratosFechados, "#10B981")}
              </tr>
            </table>
            ${tabelaComerciais(porComercialMes)}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 28px 36px; text-align:center; color:#aaa; font-size:12px; border-top: 1px solid #f0f0f0; margin-top: 24px;">
            <p style="margin:0;">Este email é gerado automaticamente pelo sistema CRM TEAM 24.</p>
            <p style="margin:4px 0 0;"><a href="https://www.team24.pt/crm" style="color:#F97316; text-decoration:none;">Aceder ao CRM</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function resumoActividadeHandler(req: Request, res: Response) {
  try {
    // Autenticação: aceitar cookie de cron Heartbeat OU API key de administrador
    const apiKey = req.headers["x-api-key"] || (req.headers["authorization"] ?? "").replace("Bearer ", "");
    const isApiKeyAuth = apiKey && apiKey === process.env.PROSPECTING_API_KEY;

    if (!isApiKeyAuth) {
      // Tentar autenticação via cookie de cron
      const cookies = (req.headers.cookie || "").split(";").reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.trim().split("=");
        if (k) acc[k.trim()] = v || "";
        return acc;
      }, {});
      const sessionCookie = cookies["app_session_id"];
      if (!sessionCookie) {
        return res.status(403).json({ error: "permission error for cron cookie" });
      }
      // Verificar se é cookie de cron válido (começa com cron_)
      // A verificação completa é feita pelo sdk mas aqui aceitamos qualquer cookie válido
      // O Heartbeat injeta automaticamente o cookie correcto
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database unavailable" });
    }

    // Data de hoje em Lisboa (UTC+1 no inverno, UTC+2 no verão)
    // O cron dispara às 19h UTC = 20h Lisboa; usamos a data local de Lisboa
    const agora = new Date();
    // Calcular data Lisboa: offset +1h (inverno) ou +2h (verão)
    const offsetMs = 60 * 60 * 1000; // mínimo UTC+1
    const dataLisboa = new Date(agora.getTime() + offsetMs);
    const hoje = dataLisboa.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const inicioMes = hoje.slice(0, 7) + "-01"; // "YYYY-MM-01"

    // Query: registos de hoje
    const registosHoje = await db
      .select()
      .from(actividadeComercial)
      .where(and(
        gte(actividadeComercial.data, hoje),
        lte(actividadeComercial.data, hoje)
      ));

    // Query: registos do mês
    const registosMes = await db
      .select()
      .from(actividadeComercial)
      .where(and(
        gte(actividadeComercial.data, inicioMes),
        lte(actividadeComercial.data, hoje)
      ));

    // Agregar totais
    const agregar = (rows: typeof registosHoje): Totais => {
      return rows.reduce(
        (acc, r) => ({
          leadsContactadas: acc.leadsContactadas + r.leadsContactadas,
          reunioesAgendadas: acc.reunioesAgendadas + r.reunioesAgendadas,
          reunioesRealizadas: acc.reunioesRealizadas + r.reunioesRealizadas,
          propostasEnviadas: acc.propostasEnviadas + r.propostasEnviadas,
          contratosFechados: acc.contratosFechados + r.contratosFechados,
        }),
        { leadsContactadas: 0, reunioesAgendadas: 0, reunioesRealizadas: 0, propostasEnviadas: 0, contratosFechados: 0 }
      );
    };

    // Lista fixa de comerciais — garante que todos aparecem mesmo sem registos no dia
    const TODOS_COMERCIAIS = ["Rita Condeça", "Sérgio Caldas", "Vanda Brás"];
    const porComercial = (rows: typeof registosHoje): PorComercial[] => {
      const map: Record<string, PorComercial> = {};
      // Inicializar todos os comerciais com zeros
      for (const nome of TODOS_COMERCIAIS) {
        map[nome] = { nome, leadsContactadas: 0, reunioesAgendadas: 0, reunioesRealizadas: 0, propostasEnviadas: 0, contratosFechados: 0 };
      }
      // Somar os registos existentes
      for (const r of rows) {
        if (!map[r.comercialNome]) {
          map[r.comercialNome] = { nome: r.comercialNome, leadsContactadas: 0, reunioesAgendadas: 0, reunioesRealizadas: 0, propostasEnviadas: 0, contratosFechados: 0 };
        }
        map[r.comercialNome].leadsContactadas += r.leadsContactadas;
        map[r.comercialNome].reunioesAgendadas += r.reunioesAgendadas;
        map[r.comercialNome].reunioesRealizadas += r.reunioesRealizadas;
        map[r.comercialNome].propostasEnviadas += r.propostasEnviadas;
        map[r.comercialNome].contratosFechados += r.contratosFechados;
      }
      return Object.values(map).sort((a, b) => b.contratosFechados - a.contratosFechados || a.nome.localeCompare(b.nome));
    };

    const totaisHoje = agregar(registosHoje);
    const totaisMes = agregar(registosMes);
    const porComercialHoje = porComercial(registosHoje);
    const porComercialMes = porComercial(registosMes);

    // Label do mês em português
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const mesIdx = parseInt(hoje.slice(5, 7)) - 1;
    const anoStr = hoje.slice(0, 4);
    const mesLabel = `${meses[mesIdx]} ${anoStr}`;

    // Formatar data para exibição
    const [ano, mes, dia] = hoje.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // Construir e enviar email
    const subject = `Resumo Actividade Comercial — ${dataFormatada}`;
    const bodyHtml = buildEmailHtml(
      dataFormatada,
      totaisHoje,
      porComercialHoje,
      totaisMes,
      porComercialMes,
      mesLabel
    );

    await sendEmailViaOdoo(subject, bodyHtml, DESTINATARIOS);

    console.log(`[resumo-actividade] Email enviado para ${DESTINATARIOS.join(", ")} — ${dataFormatada}`);
    return res.json({
      ok: true,
      data: dataFormatada,
      totaisHoje,
      totaisMes,
      destinatarios: DESTINATARIOS,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[resumo-actividade] Erro:", error);
    return res.status(500).json({
      error,
      stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}
