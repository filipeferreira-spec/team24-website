/**
 * Desvio de emails — rede de seguranca para sites de teste.
 *
 * O PROBLEMA
 * ----------
 * Os emails deste site nao saem por SMTP: sao criados como registos
 * `mail.mail` no Odoo, que depois os envia. Isso significa que um site de
 * teste ligado ao Odoo de producao envia emails VERDADEIROS, do servidor
 * verdadeiro da empresa, a candidatos e clientes verdadeiros — e ainda fica
 * com eles no historico do Odoo.
 *
 * Uma candidatura de experiencia responde a uma pessoa real. Uma marcacao de
 * teste confirma uma consulta que nao existe.
 *
 * COMO FUNCIONA
 * -------------
 * Todos os envios passam por uma chamada `mail.mail` / `create`. Este modulo
 * intercepta essa chamada e, conforme a configuracao:
 *
 *   EMAIL_DESVIO=eu@team24.pt   -> tudo vai para esse endereco, com o
 *                                  destinatario original no assunto e num
 *                                  aviso no topo da mensagem
 *   EMAIL_REAL_PERMITIDO=1      -> envia mesmo para o destinatario real
 *   nenhuma das duas            -> RECUSA enviar e escreve porque
 *
 * O ultimo caso e deliberado: o comportamento por omissao e nao enviar. Se
 * alguem publicar um site sem pensar nisto, ninguem recebe nada — em vez de
 * toda a gente receber.
 */

export class EnvioBloqueado extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "EnvioBloqueado";
  }
}

function extrairMembro(xml: string, nome: string): string | null {
  const re = new RegExp(
    `<member>\\s*<name>${nome}</name>\\s*<value>\\s*<string>([\\s\\S]*?)</string>`,
    "i"
  );
  const m = xml.match(re);
  return m ? m[1] : null;
}

function substituirMembro(xml: string, nome: string, novoValor: string): string {
  const re = new RegExp(
    `(<member>\\s*<name>${nome}</name>\\s*<value>\\s*<string>)([\\s\\S]*?)(</string>)`,
    "i"
  );
  return xml.replace(re, `$1${novoValor}$3`);
}

function escaparXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Aplica o desvio ao XML de um `mail.mail` / `create`.
 * Devolve o XML a enviar ao Odoo.
 * Lanca EnvioBloqueado se nao houver configuracao que autorize o envio.
 */
export function aplicarDesvio(argsXml: string): string {
  const desvio = (process.env.EMAIL_DESVIO || "").trim();
  const realPermitido = process.env.EMAIL_REAL_PERMITIDO === "1";

  const destinoOriginal = extrairMembro(argsXml, "email_to") || "(desconhecido)";
  const assuntoOriginal = extrairMembro(argsXml, "subject") || "(sem assunto)";

  if (!desvio && !realPermitido) {
    throw new EnvioBloqueado(
      `Envio bloqueado: nem EMAIL_DESVIO nem EMAIL_REAL_PERMITIDO estao definidos. ` +
        `O email para "${destinoOriginal}" com o assunto "${assuntoOriginal}" NAO foi enviado. ` +
        `Num site de teste, define EMAIL_DESVIO com o teu endereco. ` +
        `Em producao, define EMAIL_REAL_PERMITIDO=1.`
    );
  }

  if (!desvio) {
    // Envio real, autorizado explicitamente.
    return argsXml;
  }

  const aviso =
    `<div style="background:#fff3cd;border:2px solid #ff9800;padding:14px;margin-bottom:20px;` +
    `font-family:sans-serif;font-size:14px;color:#663c00">` +
    `<strong>EMAIL DESVIADO — SITE DE TESTE</strong><br>` +
    `Este email seria enviado a: <strong>${escaparXml(destinoOriginal)}</strong><br>` +
    `Nao foi enviado a essa pessoa. Chegou aqui porque a variavel EMAIL_DESVIO esta definida.` +
    `</div>`;

  let saida = argsXml;
  saida = substituirMembro(saida, "email_to", escaparXml(desvio));
  saida = substituirMembro(
    saida,
    "subject",
    `[DESVIO -&gt; ${escaparXml(destinoOriginal)}] ${assuntoOriginal}`
  );

  const corpo = extrairMembro(saida, "body_html");
  if (corpo !== null) {
    saida = substituirMembro(saida, "body_html", escaparXml(aviso) + corpo);
  }

  console.log(
    `[Email] desviado: "${assuntoOriginal}" — de ${destinoOriginal} para ${desvio}`
  );
  return saida;
}

/**
 * Chamar no inicio de cada `xmlRpcObject`. Nao faz nada excepto quando o
 * pedido e a criacao de um email.
 */
export function interceptar(model: string, method: string, argsXml: string): string {
  if (model === "mail.mail" && method === "create") {
    return aplicarDesvio(argsXml);
  }
  return argsXml;
}
