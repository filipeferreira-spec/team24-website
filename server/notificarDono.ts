/**
 * Substituto do `notifyOwner` da plataforma Manus.
 *
 * O original enviava a notificacao para um servico da Manus. Aqui vai por email,
 * pelo mesmo caminho do Odoo que todo o resto usa — e por isso passa pelo desvio
 * de seguranca de server/desvioEmail.ts. Num site de teste, esta notificacao e
 * desviada ou bloqueada como qualquer outra.
 *
 * Destinatario: NOTIFICACOES_EMAIL. Sem essa variavel, escreve no registo e
 * segue — uma notificacao perdida nunca deve bloquear uma candidatura.
 */
import { enviarEmailSimples } from "./odoo";

export type Notificacao = {
  title: string;
  /** Texto em markdown simples: **negrito** e quebras de linha. */
  content: string;
};

/** Converte o markdown simples que o codigo ja escrevia em HTML. */
function paraHtml(texto: string): string {
  const escapado = texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escapado
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

export async function notifyOwner(n: Notificacao): Promise<boolean> {
  const destino = (process.env.NOTIFICACOES_EMAIL || "").trim();

  if (!destino) {
    console.warn(
      `[Notificacao] NOTIFICACOES_EMAIL nao esta definida; nao enviei "${n.title}". ` +
        `Define-a para receber avisos de candidaturas novas.`
    );
    return false;
  }

  const corpo =
    `<div style="font-family:sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a">` +
    `<h2 style="font-size:17px;margin:0 0 14px">${paraHtml(n.title)}</h2>` +
    `<div>${paraHtml(n.content)}</div>` +
    `<p style="margin-top:22px;font-size:12px;color:#777">` +
    `Aviso automatico do site team24.pt.</p></div>`;

  try {
    await enviarEmailSimples(destino, n.title, corpo);
    return true;
  } catch (e) {
    console.error("[Notificacao] falhou:", e);
    return false;
  }
}
