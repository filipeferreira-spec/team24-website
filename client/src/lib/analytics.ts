/**
 * TEAM 24 — Google Analytics 4 + Google Ads Helper
 * GA4 Measurement ID: G-LRQPXGSHJ4
 * Google Ads Conversion ID: AW-11204640294
 *
 * Centraliza todos os eventos de conversão e rastreio do site.
 * Usar em formulários, botões CTA e páginas de destino.
 *
 * CONVERSÕES GOOGLE ADS configuradas:
 *   - AW-11204640294/AGENDAR   → Clique em "Agendar Reunião" (qualquer botão)
 *   - AW-11204640294/CONTACTO  → Submissão do formulário de contacto
 *   - AW-11204640294/PARCEIROS → Submissão do formulário de parceiros
 *   - AW-11204640294/NEWSLETTER → Subscrição à newsletter
 *
 * NOTA: Os labels acima são placeholders — substitua pelos labels reais
 * gerados em Google Ads → Ferramentas → Medição → Conversões.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const ADS_ID = "AW-11204640294";

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

// ─── Conversão Google Ads genérica ───────────────────────────────────────────
function reportAdsConversion(label: string, value = 1.0) {
  gtag("event", "conversion", {
    send_to: `${ADS_ID}/${label}`,
    value,
    currency: "EUR",
  });
}

// ─── Page View ────────────────────────────────────────────────────────────────
export function trackPageView(path: string, title?: string) {
  gtag("event", "page_view", {
    page_location: window.location.origin + path,
    page_title: title || document.title,
  });
}

// ─── Conversões principais ────────────────────────────────────────────────────

/**
 * Clique em qualquer botão "Agendar Reunião" → página /agendar
 * Google Ads: substitua "AGENDAR_LABEL" pelo label real da conversão
 */
export function trackAgendarClick(source: string) {
  // GA4
  gtag("event", "agendar_demo_click", {
    event_category: "conversao",
    event_label: source,
    value: 1,
  });
  gtag("event", "generate_lead", {
    currency: "EUR",
    value: 1,
    source,
  });
  // Google Ads — substitua pelo label real em Google Ads → Conversões
  reportAdsConversion("AGENDAR_LABEL", 1);
}

/**
 * Submissão bem-sucedida do formulário de contacto
 * Google Ads: substitua "CONTACTO_LABEL" pelo label real da conversão
 */
export function trackFormSubmit(formName: string) {
  // GA4
  gtag("event", "form_submit", {
    event_category: "conversao",
    event_label: formName,
    value: 1,
  });
  gtag("event", "generate_lead", {
    currency: "EUR",
    value: 1,
    source: formName,
  });
  // Google Ads — substitua pelo label real em Google Ads → Conversões
  reportAdsConversion("CONTACTO_LABEL", 1);
}

/**
 * Submissão do formulário de parceiros
 * Google Ads: substitua "PARCEIROS_LABEL" pelo label real da conversão
 */
export function trackPartnerFormSubmit() {
  // GA4
  gtag("event", "partner_form_submit", {
    event_category: "conversao",
    event_label: "formulario_parceiros",
    value: 1,
  });
  gtag("event", "generate_lead", {
    currency: "EUR",
    value: 1,
    source: "formulario_parceiros",
  });
  // Google Ads — substitua pelo label real em Google Ads → Conversões
  reportAdsConversion("PARCEIROS_LABEL", 1);
}

/**
 * Subscrição à newsletter
 * Google Ads: substitua "NEWSLETTER_LABEL" pelo label real da conversão
 */
export function trackNewsletterSubscribe(source: string) {
  // GA4
  gtag("event", "newsletter_subscribe", {
    event_category: "engagement",
    event_label: source,
  });
  // Google Ads — substitua pelo label real em Google Ads → Conversões
  reportAdsConversion("NEWSLETTER_LABEL", 0.5);
}

// ─── Engagement ───────────────────────────────────────────────────────────────

/** Leitura de artigo do blog */
export function trackBlogArticleView(title: string, category: string) {
  gtag("event", "blog_article_view", {
    event_category: "conteudo",
    event_label: title,
    content_type: "article",
    content_id: category,
  });
}

/** Clique num link de serviço (EAP, Psicológico, Jurídico, etc.) */
export function trackServiceClick(serviceName: string) {
  gtag("event", "service_click", {
    event_category: "interesse",
    event_label: serviceName,
  });
}

/** Clique no botão de telefone ou email de contacto */
export function trackContactClick(type: "phone" | "email", value: string) {
  gtag("event", "contact_click", {
    event_category: "contacto",
    event_label: `${type}: ${value}`,
  });
}

/** Scroll até ao fim de uma página (engagement profundo) */
export function trackDeepScroll(pagePath: string) {
  gtag("event", "scroll", {
    event_category: "engagement",
    event_label: pagePath,
    value: 100,
  });
}
