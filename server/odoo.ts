/**
 * Odoo XML-RPC helper
 * Uses the standard /xmlrpc/2 endpoints which support API Key authentication.
 *
 * Authentication: XML-RPC /xmlrpc/2/common → authenticate(db, login, api_key)
 * Operations:    XML-RPC /xmlrpc/2/object → execute_kw(db, uid, api_key, model, method, args, kwargs)
 *
 * Odoo IDs (team24.thinkopen.solutions):
 *   UTM Source "Website TEAM 24" → ID 27
 *   CRM Tag "Formulário Contacto" → ID 12
 *   CRM Tag "Formulário Parceiros" → ID 13
 *   CRM Tag "Download Ebook"       → ID 14
 *   CRM Tag "Newsletter"           → ID 15
 *   Email Template "Website - Entrega de Ebook" → ID 64
 *   Mailing List "Newsletter"      → ID 1
 */

import { interceptar } from "./desvioEmail";

const ODOO_URL = process.env.ODOO_URL!;
const ODOO_DB = process.env.ODOO_DB!;
const ODOO_USER = process.env.ODOO_USER!;
const ODOO_API_KEY = process.env.ODOO_API_KEY!;

// UTM Source ID for "Website TEAM 24"
const SOURCE_WEBSITE = 27;

// CRM Tag IDs by form origin
const TAGS = {
  contacto:   12, // "Formulário Contacto"
  parceiros:  13, // "Formulário Parceiros"
  ebook:      14, // "Download Ebook"
  newsletter: 15, // "Newsletter"
} as const;

type FormSource = keyof typeof TAGS;

let _uid: number | null = null;

/** Parse an integer value from an XML-RPC response */
function parseXmlRpcInt(xml: string): number | null {
  const match = xml.match(/<int>(\d+)<\/int>/);
  return match ? parseInt(match[1], 10) : null;
}

/** Parse a fault from an XML-RPC response */
function parseXmlRpcFault(xml: string): string | null {
  if (!xml.includes("<fault>")) return null;
  const msgMatch = xml.match(/<name>faultString<\/name>\s*<value><string>([\s\S]*?)<\/string><\/value>/);
  return msgMatch ? msgMatch[1] : "Odoo XML-RPC fault";
}

/** Call the XML-RPC common endpoint (for authentication) */
async function xmlRpcCommon(method: string, params: string): Promise<string> {
  const body = `<?xml version='1.0'?>
<methodCall>
  <methodName>${method}</methodName>
  <params>${params}</params>
</methodCall>`;

  const res = await fetch(`${ODOO_URL}/xmlrpc/2/common`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
  });
  if (!res.ok) throw new Error(`Odoo HTTP error: ${res.status}`);
  return res.text();
}

/** Call the XML-RPC object endpoint (for model operations) */
async function xmlRpcObject(uid: number, model: string, method: string, argsXml: string, kwargsXml = "<struct/>"): Promise<string> {
  // Rede de seguranca: desvia ou bloqueia emails. Ver server/desvioEmail.ts
  argsXml = interceptar(model, method, argsXml);
  const body = `<?xml version='1.0'?>
<methodCall>
  <methodName>execute_kw</methodName>
  <params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>${model}</string></value></param>
    <param><value><string>${method}</string></value></param>
    <param><value><array><data>${argsXml}</data></array></value></param>
    <param><value>${kwargsXml}</value></param>
  </params>
</methodCall>`;

  const res = await fetch(`${ODOO_URL}/xmlrpc/2/object`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
  });
  if (!res.ok) throw new Error(`Odoo HTTP error: ${res.status}`);
  return res.text();
}

/** Authenticate and return UID (cached per process) */
async function getUid(): Promise<number> {
  if (_uid !== null) return _uid;

  const params = `
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><string>${ODOO_USER}</string></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><struct/></value></param>`;

  const xml = await xmlRpcCommon("authenticate", params);
  const fault = parseXmlRpcFault(xml);
  if (fault) throw new Error(`Odoo auth failed: ${fault}`);

  const uid = parseXmlRpcInt(xml);
  if (!uid) throw new Error("Odoo authentication failed — check credentials");

  _uid = uid;
  return _uid;
}

/** Escape a string value for safe embedding in XML */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Build an XML-RPC struct member with a string value */
function member(name: string, value: string): string {
  return `<member><name>${name}</name><value>${value}</value></member>`;
}

/** Build a string XML value */
function str(v: string): string {
  return `<string>${escapeXml(v)}</string>`;
}

/** Build an int XML value */
function intVal(v: number): string {
  return `<int>${v}</int>`;
}

/**
 * Build an XML-RPC many2many command to set tag_ids.
 * Command 6 = replace all: [(6, 0, [id1, id2, ...])]
 */
function tagIdsXml(tagId: number): string {
  return `<array><data>
    <value><array><data>
      <value><int>6</int></value>
      <value><int>0</int></value>
      <value><array><data>
        <value><int>${tagId}</int></value>
      </data></array></value>
    </data></array></value>
  </data></array>`;
}

/** Create a CRM Lead from a website form submission */
export async function createOdooLead(data: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  source: FormSource;
  ebook_title?: string;
}): Promise<number> {
  const uid = await getUid();

  const subject = data.ebook_title
    ? `[${data.source.toUpperCase()}] Download: ${data.ebook_title} — ${data.name}`
    : `[${data.source.toUpperCase()}] ${data.name}`;

  const description = [
    data.message ? `Mensagem: ${data.message}` : null,
    data.ebook_title ? `Recurso: ${data.ebook_title}` : null,
    `Origem: Website TEAM 24 — ${data.source}`,
  ]
    .filter((r): r is string => r !== null)
    .join("\n");

  const tagId = TAGS[data.source];

  const structMembers = [
    member("name", str(subject)),
    member("contact_name", str(data.name)),
    member("email_from", str(data.email)),
    member("partner_name", str(data.company ?? "")),
    member("phone", str(data.phone ?? "")),
    member("description", str(description)),
    member("source_id", intVal(SOURCE_WEBSITE)),
    member("tag_ids", tagIdsXml(tagId)),
  ].join("\n");

  const argsXml = `<value><struct>${structMembers}</struct></value>`;
  const xml = await xmlRpcObject(uid, "crm.lead", "create", argsXml);

  const fault = parseXmlRpcFault(xml);
  if (fault) throw new Error(`Odoo create lead failed: ${fault}`);

  const leadId = parseXmlRpcInt(xml);
  if (!leadId) throw new Error("Odoo create lead returned no ID");

  return leadId;
}

// ID da lista "Newsletter" no módulo Email Marketing do Odoo
const NEWSLETTER_MAILING_LIST_ID = 1;

/**
 * Subscribe an email to the Odoo Email Marketing list "Newsletter" (mailing.contact).
 * If the contact already exists, returns the existing ID without duplicating.
 * Also creates a CRM lead tagged as Newsletter for tracking.
 */
export async function subscribeOdooNewsletter(data: {
  email: string;
  name?: string;
}): Promise<number> {
  const uid = await getUid();
  const displayName = data.name ?? data.email;

  // Search for existing mailing contact with this email
  const searchArgs = `<value><array><data>
      <value><array><data>
        <value><string>email</string></value>
        <value><string>=</string></value>
        <value><string>${escapeXml(data.email)}</string></value>
      </data></array></value>
    </data></array></value>`;

  const searchKwargs = `<struct>
    <member><name>limit</name><value><int>1</int></value></member>
  </struct>`;

  const searchXml = await xmlRpcObject(uid, "mailing.contact", "search", searchArgs, searchKwargs);
  const searchFault = parseXmlRpcFault(searchXml);
  if (searchFault) throw new Error(`Odoo mailing contact search failed: ${searchFault}`);

  // If contact already exists, return existing ID
  const existingMatch = searchXml.match(/<int>(\d+)<\/int>/g);
  if (existingMatch && existingMatch.length > 0) {
    const existingId = parseInt(existingMatch[0].replace(/<\/?int>/g, ""), 10);
    return existingId;
  }

  // Create new mailing.contact and subscribe to the Newsletter list
  // Command (4, id, 0) = link to existing record without replacing others
  const structMembers = [
    member("name", str(displayName)),
    member("email", str(data.email)),
    member("list_ids", `<array><data>
      <value><array><data>
        <value><int>4</int></value>
        <value><int>${NEWSLETTER_MAILING_LIST_ID}</int></value>
        <value><boolean>0</boolean></value>
      </data></array></value>
    </data></array>`),
  ].join("\n");

  const createArgs = `<value><struct>${structMembers}</struct></value>`;
  const createXml = await xmlRpcObject(uid, "mailing.contact", "create", createArgs);

  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create mailing contact failed: ${createFault}`);

  const contactId = parseXmlRpcInt(createXml);
  if (!contactId) throw new Error("Odoo create mailing contact returned no ID");

  return contactId;
}

/**
 * Send the ebook delivery email for a given CRM lead.
 * Builds the email body in Node.js (resolving the recipient name) and creates
 * a mail.mail record directly with the PDF attachment, then sends it.
 * This bypasses the Jinja rendering issue with mail.template via API.
 */
export async function sendOdooEbookEmail(
  leadId: number,
  recipientName: string,
  recipientEmail: string,
  ebookTitle: string
): Promise<void> {
  const uid = await getUid();
  const EBOOK_ATTACHMENT_ID = 4933; // ir.attachment ID of the PDF

  const greeting = recipientName ? `Olá ${recipientName},` : "Olá,";
  const bodyHtml = `<p>${escapeXml(greeting)}</p>
<p>Obrigado pelo seu interesse nos recursos TEAM 24!</p>
<p>Segue em anexo o recurso <strong>${escapeXml(ebookTitle)}</strong> que solicitou. Esperamos que seja útil para si e para a sua organização.</p>
<p>Se tiver alguma dúvida ou quiser saber mais sobre como podemos ajudar a sua empresa, não hesite em contactar-nos:</p>
<ul>
  <li>Email: <a href="mailto:geral@team24.pt">geral@team24.pt</a></li>
  <li>Website: <a href="https://www.team24.pt">www.team24.pt</a></li>
</ul>
<p>Com os melhores cumprimentos,<br/>
<strong>Equipa TEAM 24</strong></p>`;

  // Create mail.mail directly with the attachment
  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>O seu recurso TEAM 24: ${escapeXml(ebookTitle)}</string></value></member>
      <member><name>email_from</name><value><string>marketing@team24.pt</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(recipientEmail)}</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>attachment_ids</name><value><array><data>
        <value><array><data>
          <value><int>4</int></value>
          <value><int>${EBOOK_ATTACHMENT_ID}</int></value>
          <value><boolean>0</boolean></value>
        </data></array></value>
      </data></array></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value>`
  );

  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create mail failed: ${createFault}`);

  const mailId = parseXmlRpcInt(createXml);
  if (!mailId) throw new Error("Odoo create mail returned no ID");

  // Send immediately
  const sendXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "send",
    `<value><array><data><value><int>${mailId}</int></value></data></array></value>`
  );

  const sendFault = parseXmlRpcFault(sendXml);
  if (sendFault) throw new Error(`Odoo send mail failed: ${sendFault}`);
}

/**
 * Sends a welcome/thank-you email to a new newsletter subscriber.
 * Builds the email body in Node.js (resolving the recipient name) and creates
 * a mail.mail record directly, then sends it via Odoo SMTP.
 */
export async function sendOdooNewsletterWelcomeEmail(
  recipientName: string,
  recipientEmail: string
): Promise<void> {
  const uid = await getUid();

  const greeting = recipientName ? `Olá ${recipientName},` : "Olá,";
  const bodyHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #F15A29; padding: 32px 40px; text-align: center;">
    <p style="color: white; font-size: 24px; font-weight: bold; margin: 0;">TEAM 24</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #0A1A2A; font-size: 22px; margin-bottom: 16px;">Bem-vindo/a \u00e0 newsletter TEAM 24!</h2>
    <p style="line-height: 1.7; margin-bottom: 16px;">${escapeXml(greeting)}</p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      Obrigado por subscrever a nossa newsletter. A partir de agora receber\u00e1 conte\u00fados exclusivos sobre bem-estar organizacional, sa\u00fade mental no trabalho e as melhores pr\u00e1ticas para equipas mais saud\u00e1veis e produtivas.
    </p>
    <p style="line-height: 1.7; margin-bottom: 24px;">
      Enquanto isso, explore os nossos recursos gratuitos em <a href="https://www.team24.pt/recursos" style="color: #F15A29; text-decoration: none;">team24.pt/recursos</a>.
    </p>
    <p style="line-height: 1.7; color: #666; font-size: 14px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 24px;">
      Com os melhores cumprimentos,<br/>
      <strong>Equipa TEAM 24</strong><br/>
      <a href="mailto:geral@team24.pt" style="color: #F15A29;">geral@team24.pt</a>
    </p>
  </div>
</div>`;

  // Create mail.mail directly (same approach as ebook email - bypasses Jinja rendering issues)
  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>Bem-vindo/a \u00e0 newsletter TEAM 24!</string></value></member>
      <member><name>email_from</name><value><string>marketing@team24.pt</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(recipientEmail)}</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value>`
  );

  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create newsletter welcome mail failed: ${createFault}`);

  const mailId = parseXmlRpcInt(createXml);
  if (!mailId) throw new Error("Odoo create newsletter welcome mail returned no ID");

  // Send immediately
  const sendXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "send",
    `<value><array><data><value><int>${mailId}</int></value></data></array></value>`
  );

  const sendFault = parseXmlRpcFault(sendXml);
  if (sendFault) throw new Error(`Odoo send newsletter welcome mail failed: ${sendFault}`);
}

/** Test connectivity — returns Odoo server version */
export async function testOdooConnection(): Promise<string> {
  const xml = await xmlRpcCommon("version", "");
  const versionMatch = xml.match(/<name>server_version<\/name>\s*<value><string>([\s\S]*?)<\/string><\/value>/);
  return versionMatch ? versionMatch[1] : "unknown";
}

/**
 * Sends the questionnaire invitation email to a candidate after applying.
 * Includes a unique link to the questionnaire form.
 */
export async function sendQuestionarioEmail(
  recipientName: string,
  recipientEmail: string,
  vagaTitulo: string,
  questionarioLink: string
): Promise<void> {
  const uid = await getUid();
  const greeting = recipientName ? `Olá ${recipientName},` : "Olá,";
  const bodyHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #0A1A2A; padding: 32px 40px; text-align: center;">
    <p style="color: white; font-size: 24px; font-weight: bold; margin: 0;">TEAM 24</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #0A1A2A; font-size: 22px; margin-bottom: 16px;">Obrigado pela sua candidatura!</h2>
    <p style="line-height: 1.7; margin-bottom: 16px;">${escapeXml(greeting)}</p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      Recebemos a sua candidatura para a vaga <strong>${escapeXml(vagaTitulo)}</strong>. A nossa equipa irá analisá-la com atenção.
    </p>
    <p style="line-height: 1.7; margin-bottom: 24px;">
      Como parte do nosso processo de seleção, gostaríamos de o/a convidar a responder a um breve questionário. Isto ajuda-nos a conhecê-lo/a melhor e a garantir que encontramos a melhor correspondência para ambas as partes.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${questionarioLink}" style="background-color: #DB5C34; color: white; padding: 14px 32px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
        Responder ao Questionário
      </a>
    </div>
    <p style="line-height: 1.7; color: #666; font-size: 13px; margin-top: 8px;">
      Ou copie e cole este link no seu browser:<br/>
      <a href="${questionarioLink}" style="color: #DB5C34; word-break: break-all;">${questionarioLink}</a>
    </p>
    <p style="line-height: 1.7; color: #666; font-size: 14px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 24px;">
      Com os melhores cumprimentos,<br/>
      <strong>Equipa TEAM 24</strong><br/>
      <a href="mailto:geral@team24.pt" style="color: #DB5C34;">geral@team24.pt</a>
    </p>
  </div>
</div>`;

  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>Candidatura ${escapeXml(vagaTitulo)} — Questionário de Seleção TEAM 24</string></value></member>
      <member><name>email_from</name><value><string>Recursos Humanos Team24 &lt;marketing@team24.pt&gt;</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(recipientEmail)}</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value>`
  );

  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create questionario mail failed: ${createFault}`);

  const mailId = parseXmlRpcInt(createXml);
  if (!mailId) throw new Error("Odoo create questionario mail returned no ID");

  const sendXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "send",
    `<value><array><data><value><int>${mailId}</int></value></data></array></value>`
  );

  const sendFault = parseXmlRpcFault(sendXml);
  if (sendFault) throw new Error(`Odoo send questionario mail failed: ${sendFault}`);
}

export async function sendEmailRejeicao(
  recipientName: string,
  recipientEmail: string,
  vagaTitulo: string
): Promise<void> {
  const uid = await getUid();
  const greeting = recipientName ? `Olá ${recipientName},` : "Olá,";
  const bodyHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #0A1A2A; padding: 32px 40px; text-align: center;">
    <p style="color: white; font-size: 24px; font-weight: bold; margin: 0;">TEAM 24</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #0A1A2A; font-size: 22px; margin-bottom: 16px;">Obrigado pela sua candidatura</h2>
    <p style="line-height: 1.7; margin-bottom: 16px;">${escapeXml(greeting)}</p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      Agradecemos o seu interesse em fazer parte da equipa TEAM 24 e o tempo que dedicou à sua candidatura para a vaga <strong>${escapeXml(vagaTitulo)}</strong>.
    </p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      Após uma análise cuidadosa do seu perfil, informamos que, neste momento, optámos por avançar com outros candidatos cujo perfil se enquadra mais diretamente nas necessidades actuais da equipa.
    </p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      Gostaríamos de garantir que o seu currículo e informações ficam guardados na nossa base de dados. Caso surjam oportunidades futuras que se enquadrem no seu perfil, não hesitaremos em entrar em contacto consigo.
    </p>
    <p style="line-height: 1.7; margin-bottom: 24px;">
      Desejamos-lhe o maior sucesso no seu percurso profissional e agradecemos sinceramente o interesse demonstrado pela TEAM 24.
    </p>
    <p style="line-height: 1.7; color: #666; font-size: 14px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 24px;">
      Com os melhores cumprimentos,<br/>
      <strong>Equipa de Recursos Humanos TEAM 24</strong><br/>
      <a href="mailto:geral@team24.pt" style="color: #DB5C34;">geral@team24.pt</a>
    </p>
  </div>
</div>`;

  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>A sua candidatura na TEAM 24 — ${escapeXml(vagaTitulo)}</string></value></member>
      <member><name>email_from</name><value><string>Recursos Humanos Team24 &lt;marketing@team24.pt&gt;</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(recipientEmail)}</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value>`
  );

  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create rejeicao mail failed: ${createFault}`);

  const mailId = parseXmlRpcInt(createXml);
  if (!mailId) throw new Error("Odoo create rejeicao mail returned no ID");

  const sendXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "send",
    `<value><array><data><value><int>${mailId}</int></value></data></array></value>`
  );

  const sendFault = parseXmlRpcFault(sendXml);
  if (sendFault) throw new Error(`Odoo send rejeicao mail failed: ${sendFault}`);
}

// ─── EMAIL DE CONFIRMAÇÃO DE CANDIDATURA ─────────────────────────────────────
export async function sendEmailConfirmacaoCandidatura(
  recipientName: string,
  recipientEmail: string,
  vagaTitulo: string
): Promise<void> {
  const uid = await getUid();
  const greeting = recipientName ? `Olá ${recipientName},` : "Olá,";
  const isEspontanea = vagaTitulo === "Candidatura Espontânea";
  const vagaTexto = isEspontanea
    ? "a sua candidatura espontânea"
    : `a sua candidatura para a vaga <strong>${escapeXml(vagaTitulo)}</strong>`;
  const bodyHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #0A1A2A; padding: 32px 40px; text-align: center;">
    <p style="color: white; font-size: 24px; font-weight: bold; margin: 0;">TEAM 24</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #0A1A2A; font-size: 22px; margin-bottom: 16px;">Candidatura recebida com sucesso</h2>
    <p style="line-height: 1.7; margin-bottom: 16px;">${escapeXml(greeting)}</p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      Recebemos ${vagaTexto} e agradecemos o interesse em fazer parte da equipa TEAM 24.
    </p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      A nossa equipa irá analisar o seu perfil com atenção. Caso o seu perfil se enquadre nas nossas necessidades actuais, entraremos em contacto consigo para os próximos passos do processo de recrutamento.
    </p>
    <p style="line-height: 1.7; margin-bottom: 24px;">
      Enquanto isso, pode saber mais sobre nós em <a href="https://www.team24.pt" style="color: #DB5C34;">www.team24.pt</a>.
    </p>
    <p style="line-height: 1.7; color: #666; font-size: 14px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 24px;">
      Com os melhores cumprimentos,<br/>
      <strong>Equipa de Recursos Humanos TEAM 24</strong><br/>
      <a href="mailto:geral@team24.pt" style="color: #DB5C34;">geral@team24.pt</a>
    </p>
  </div>
</div>`;
  const subjectVaga = isEspontanea ? "" : ` · ${escapeXml(vagaTitulo)}`;
  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>Candidatura recebida — TEAM 24${subjectVaga}</string></value></member>
      <member><name>email_from</name><value><string>Recursos Humanos Team24 &lt;marketing@team24.pt&gt;</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(recipientEmail)}</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value>`
  );
  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create confirmacao mail failed: ${createFault}`);
  const mailId = parseXmlRpcInt(createXml);
  if (!mailId) throw new Error("Odoo create confirmacao mail returned no ID");
  const sendXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "send",
    `<value><array><data><value><int>${mailId}</int></value></data></array></value>`
  );
  const sendFault = parseXmlRpcFault(sendXml);
  if (sendFault) throw new Error(`Odoo send confirmacao mail failed: ${sendFault}`);
}

// ─── EMAIL DE LEMBRETE DE QUESTIONÁRIO ────────────────────────────────────────
export async function sendLembreteQuestionarioEmail(
  recipientName: string,
  recipientEmail: string,
  vagaTitulo: string,
  questionarioLink: string
): Promise<void> {
  const uid = await getUid();
  const greeting = recipientName ? `Olá ${recipientName},` : "Olá,";
  const bodyHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #0A1A2A; padding: 32px 40px; text-align: center;">
    <p style="color: white; font-size: 24px; font-weight: bold; margin: 0;">TEAM 24</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #0A1A2A; font-size: 22px; margin-bottom: 16px;">Lembrete — Questionário de Seleção</h2>
    <p style="line-height: 1.7; margin-bottom: 16px;">${escapeXml(greeting)}</p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      Enviámos-lhe recentemente um convite para responder ao questionário de seleção relativo à sua candidatura para a vaga <strong>${escapeXml(vagaTitulo)}</strong>.
    </p>
    <p style="line-height: 1.7; margin-bottom: 24px;">
      Verificámos que ainda não teve oportunidade de o preencher. O questionário é uma parte importante do nosso processo de seleção e ajuda-nos a conhecê-lo/a melhor. Caso ainda esteja interessado/a na vaga, pedimos que responda o mais brevemente possível.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${questionarioLink}" style="background-color: #DB5C34; color: white; padding: 14px 32px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
        Responder ao Questionário
      </a>
    </div>
    <p style="line-height: 1.7; color: #666; font-size: 13px; margin-top: 8px;">
      Ou copie e cole este link no seu browser:<br/>
      <a href="${questionarioLink}" style="color: #DB5C34; word-break: break-all;">${questionarioLink}</a>
    </p>
    <p style="line-height: 1.7; color: #666; font-size: 14px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 24px;">
      Com os melhores cumprimentos,<br/>
      <strong>Equipa de Recursos Humanos TEAM 24</strong><br/>
      <a href="mailto:geral@team24.pt" style="color: #DB5C34;">geral@team24.pt</a>
    </p>
  </div>
</div>`;
  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>Lembrete: Questionário de Seleção — ${escapeXml(vagaTitulo)} | TEAM 24</string></value></member>
      <member><name>email_from</name><value><string>Recursos Humanos Team24 &lt;marketing@team24.pt&gt;</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(recipientEmail)}</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value>`
  );
  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create lembrete mail failed: ${createFault}`);
  const mailId = parseXmlRpcInt(createXml);
  if (!mailId) throw new Error("Odoo create lembrete mail returned no ID");
  const sendXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "send",
    `<value><array><data><value><int>${mailId}</int></value></data></array></value>`
  );
  const sendFault = parseXmlRpcFault(sendXml);
  if (sendFault) throw new Error(`Odoo send lembrete mail failed: ${sendFault}`);
}

/**
 * Sends an internal lead notification email to filipeferreira@team24.pt
 * whenever a new lead is created via any website form.
 */
export async function sendLeadNotificationEmail(params: {
  leadId: number | null;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  source: string;
}): Promise<void> {
  const uid = await getUid();
  const sourceLabel: Record<string, string> = {
    contacto: "Formulário de Contacto",
    parceiros: "Formulário de Parceiros",
    ebook: "Download de Ebook",
    newsletter: "Newsletter",
    demo: "Agendamento de Demo",
    chatbot: "Chatbot",
    candidatura: "Candidatura Espontânea",
    vaga: "Candidatura a Vaga",
  };
  const label = sourceLabel[params.source] ?? params.source;
  const now = new Date().toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" });
  const rows = [
    ["Nome", params.name],
    ["Email", params.email],
    params.company ? ["Empresa", params.company] : null,
    params.phone ? ["Telefone", params.phone] : null,
    params.message ? ["Mensagem", params.message] : null,
    params.leadId ? ["Lead ID (Odoo)", String(params.leadId)] : null,
  ]
    .filter((r): r is string[] => r !== null)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#555;white-space:nowrap;border-bottom:1px solid #f0f0f0;">${k}</td><td style="padding:6px 12px;color:#222;border-bottom:1px solid #f0f0f0;">${escapeXml(v as string)}</td></tr>`
    )
    .join("\n");

  const bodyHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
  <div style="background-color:#F15A29;padding:24px 32px;">
    <p style="color:white;font-size:20px;font-weight:bold;margin:0;">TEAM 24 — Nova Lead</p>
    <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:4px 0 0;">${escapeXml(label)} · ${now}</p>
  </div>
  <div style="padding:32px;">
    <p style="margin:0 0 20px;font-size:15px;">Chegou uma nova lead através do website:</p>
    <table style="width:100%;border-collapse:collapse;background:#fafafa;border-radius:8px;overflow:hidden;">
      ${rows}
    </table>
    <div style="margin-top:28px;text-align:center;">
      <a href="https://team24.thinkopen.solutions/odoo/crm" style="display:inline-block;background:#F15A29;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Ver no CRM Odoo</a>
    </div>
  </div>
  <div style="background:#f5f5f5;padding:16px 32px;text-align:center;">
    <p style="color:#999;font-size:12px;margin:0;">TEAM 24 · <a href="mailto:geral@team24.pt" style="color:#F15A29;">geral@team24.pt</a></p>
  </div>
</div>`;

  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>Nova Lead: ${escapeXml(params.name)} (${escapeXml(label)})</string></value></member>
      <member><name>email_from</name><value><string>TEAM 24 Website &lt;marketing@team24.pt&gt;</string></value></member>
      <member><name>email_to</name><value><string>filipeferreira@team24.pt</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value>`
  );
  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create lead notification failed: ${createFault}`);
  const mailId = parseXmlRpcInt(createXml);
  if (!mailId) throw new Error("Odoo create lead notification returned no ID");
  const sendXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "send",
    `<value><array><data><value><int>${mailId}</int></value></data></array></value>`
  );
  const sendFault = parseXmlRpcFault(sendXml);
  if (sendFault) throw new Error(`Odoo send lead notification failed: ${sendFault}`);
}

/**
 * Sends an "em análise + nova oportunidade" email to a candidate.
 * Used for the one-time bulk send to all non-rejected/non-accepted candidates.
 */
export async function sendEmailCandidaturaEmAnalise(
  recipientName: string,
  recipientEmail: string,
  vagaTitulo: string
): Promise<void> {
  const uid = await getUid();
  const greeting = recipientName ? `Olá ${recipientName},` : "Olá,";
  const bodyHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #0A1A2A; padding: 32px 40px; text-align: center;">
    <p style="color: white; font-size: 24px; font-weight: bold; margin: 0;">TEAM 24</p>
  </div>
  <div style="padding: 40px;">
    <h2 style="color: #0A1A2A; font-size: 22px; margin-bottom: 16px;">A sua candidatura está em análise</h2>
    <p style="line-height: 1.7; margin-bottom: 16px;">${escapeXml(greeting)}</p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      Obrigado pelo interesse em fazer parte da equipa TEAM 24 e pela sua candidatura à vaga <strong>${escapeXml(vagaTitulo)}</strong>.
    </p>
    <p style="line-height: 1.7; margin-bottom: 16px;">
      Queremos informar que a sua candidatura continua <strong>em análise</strong> pela nossa equipa de Recursos Humanos. Assim que tivermos novidades, entraremos em contacto consigo.
    </p>
    <div style="background-color: #f8f4f0; border-left: 4px solid #F15A29; padding: 20px 24px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 8px; font-weight: 700; color: #0A1A2A; font-size: 15px;">Nova Oportunidade na TEAM 24</p>
      <p style="margin: 0 0 12px; line-height: 1.6; color: #444;">
        Temos uma nova vaga disponível para <strong>Psicólogo/a de Apoio Psicológico 24/7</strong>, em regime de trabalho por turnos e noturno. Se este perfil se enquadra em si ou conhece alguém interessado, partilhe!
      </p>
      <a href="https://team24.pt/carreiras/psicologoa-apoio-psicologico-247"
         style="display: inline-block; background-color: #F15A29; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Ver Oportunidade
      </a>
    </div>
    <p style="line-height: 1.7; margin-bottom: 16px; color: #555;">
      Agradecemos a sua paciência e o interesse demonstrado pela TEAM 24. Estamos a crescer e queremos ter as pessoas certas connosco.
    </p>
    <p style="line-height: 1.7; color: #666; font-size: 14px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 24px;">
      Com os melhores cumprimentos,<br/>
      <strong>Equipa de Recursos Humanos TEAM 24</strong><br/>
      <a href="mailto:rh@team24.pt" style="color: #F15A29;">rh@team24.pt</a> · <a href="https://team24.pt/carreiras" style="color: #F15A29;">team24.pt/carreiras</a>
    </p>
  </div>
</div>`;
  const createXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "create",
    `<value><struct>
      <member><name>subject</name><value><string>A sua candidatura TEAM 24 — atualização + nova oportunidade</string></value></member>
      <member><name>email_from</name><value><string>Recursos Humanos TEAM 24 &lt;marketing@team24.pt&gt;</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(recipientEmail)}</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value>`
  );
  const createFault = parseXmlRpcFault(createXml);
  if (createFault) throw new Error(`Odoo create em_analise mail failed: ${createFault}`);
  const mailId = parseXmlRpcInt(createXml);
  if (!mailId) throw new Error("Odoo create em_analise mail returned no ID");
  const sendXml = await xmlRpcObject(
    uid,
    "mail.mail",
    "send",
    `<value><array><data><value><int>${mailId}</int></value></data></array></value>`
  );
  const sendFault = parseXmlRpcFault(sendXml);
  if (sendFault) throw new Error(`Odoo send em_analise mail failed: ${sendFault}`);
}
