/**
 * Helper centralizado para enviar dados de formulários ao webhook Make.
 * O Make recebe o payload e encaminha para o Odoo consoante o form_type.
 *
 * form_type values:
 *  - "contacto"    → CRM Lead (contacto geral)
 *  - "parceiros"   → CRM Lead (tag Parceiro)
 *  - "agendamento" → CRM Lead (tag Demo)
 *  - "newsletter"  → Email Marketing / Contactos
 *  - "ebook"       → CRM Lead (tag Ebook) + recurso descarregado
 */

const MAKE_WEBHOOK_URL =
  "https://hook.eu2.make.com/srnwtt7junp9br0eqdm5b4t7qsz8kuky";

export type FormType =
  | "contacto"
  | "parceiros"
  | "agendamento"
  | "newsletter"
  | "ebook";

export interface WebhookPayload {
  form_type: FormType;
  timestamp: string;
  source_url: string;
  [key: string]: unknown;
}

/**
 * Envia dados para o webhook Make.
 * Retorna true em caso de sucesso, false em caso de erro.
 */
export async function sendToMake(
  form_type: FormType,
  data: Record<string, unknown>
): Promise<boolean> {
  const payload: WebhookPayload = {
    form_type,
    timestamp: new Date().toISOString(),
    source_url: window.location.href,
    ...data,
  };

  try {
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok || res.status === 200;
  } catch (err) {
    console.error("[Make Webhook] Erro ao enviar:", err);
    return false;
  }
}
