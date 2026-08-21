/**
 * ATENCAO: estes testes NAO sao simulacoes.
 *
 * Ligam-se ao Odoo a serio e criam registos verdadeiros: leads no CRM, contactos
 * na lista de newsletter e emails enviados. Correr `pnpm test` com as variaveis
 * do Odoo definidas enche o CRM de producao de lixo.
 *
 * Ate hoje so nao acontecia por acidente: o vitest nao carrega o .env. Isso nao e
 * uma protecao — basta alguem acrescentar esse carregamento.
 *
 * Ficam desligados por omissao. Para os correr de proposito, contra um Odoo de
 * testes e nunca contra producao:
 *
 *     ODOO_TESTES_REAIS=1 npx vitest run server/odoo.test.ts
 */
import { describe, it, expect } from "vitest";
import { testOdooConnection, createOdooLead, subscribeOdooNewsletter, sendOdooEbookEmail, sendOdooNewsletterWelcomeEmail } from "./odoo";

const correrAValer = process.env.ODOO_TESTES_REAIS === "1";

describe.skipIf(!correrAValer)("Odoo connectivity (toca em dados reais)", () => {
  it("should connect to Odoo and return server version", async () => {
    const version = await testOdooConnection();
    expect(typeof version).toBe("string");
    expect(version.length).toBeGreaterThan(0);
    console.log("Odoo server version:", version);
  }, 15000);

  it("should create a CRM lead (contacto) with phone, source and tag", async () => {
    const leadId = await createOdooLead({
      name: "Teste Vitest Contacto",
      email: "vitest-contacto@team24.pt",
      company: "Empresa Teste Vitest",
      phone: "+351 912 345 678",
      message: "Teste automático de integração via Vitest",
      source: "contacto",
    });
    expect(typeof leadId).toBe("number");
    expect(leadId).toBeGreaterThan(0);
    console.log("Created CRM lead (contacto) ID:", leadId);
  }, 15000);

  it("should create a CRM lead (parceiros) with source and tag", async () => {
    const leadId = await createOdooLead({
      name: "Teste Vitest Parceiros",
      email: "vitest-parceiros@team24.pt",
      company: "Parceiro Teste",
      phone: "+351 913 000 000",
      message: "Tipo de parceria: Tecnologia",
      source: "parceiros",
    });
    expect(typeof leadId).toBe("number");
    expect(leadId).toBeGreaterThan(0);
    console.log("Created CRM lead (parceiros) ID:", leadId);
  }, 15000);

  it("should create a CRM lead (ebook) with source and tag", async () => {
    const leadId = await createOdooLead({
      name: "Teste Vitest Ebook",
      email: "vitest-ebook@team24.pt",
      company: "Empresa Ebook",
      source: "ebook",
      ebook_title: "Guia de Bem-Estar nas Empresas",
    });
    expect(typeof leadId).toBe("number");
    expect(leadId).toBeGreaterThan(0);
    console.log("Created CRM lead (ebook) ID:", leadId);
  }, 15000);

  it("should create ebook lead and send delivery email with resolved name", async () => {
    const leadId = await createOdooLead({
      name: "Teste Vitest Ebook Email",
      email: "vitest-ebook-email@team24.pt",
      company: "Empresa Teste Email",
      source: "ebook",
      ebook_title: "Guia de Bem-Estar nas Empresas",
    });
    expect(leadId).toBeGreaterThan(0);
    // Should not throw - passes name/email/title directly
    await expect(
      sendOdooEbookEmail(leadId, "Teste Vitest", "vitest-ebook-email@team24.pt", "Guia de Bem-Estar nas Empresas")
    ).resolves.not.toThrow();
    console.log(`Ebook email sent for lead ID: ${leadId}`);
  }, 20000);

  it("should subscribe a newsletter email (create or find partner)", async () => {
    const partnerId = await subscribeOdooNewsletter({ email: "test-newsletter@example.com", name: "Test User" });
    console.log("Newsletter partner ID:", partnerId);
    expect(typeof partnerId).toBe("number");
    expect(partnerId).toBeGreaterThan(0);
  }, 15000);

  it("should send a newsletter welcome email", async () => {
    await expect(
      sendOdooNewsletterWelcomeEmail("Pedro", "pedro@team24.pt")
    ).resolves.not.toThrow();
    console.log("Newsletter welcome email sent to pedro@team24.pt");
  }, 15000);
});
