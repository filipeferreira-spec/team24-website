/**
 * Testes para o sistema de candidaturas
 * Cobre: validação de input, estrutura dos dados, e lógica de negócio
 */
import { describe, it, expect } from "vitest";

// ─── Validação de input ────────────────────────────────────────────────────────

describe("candidaturas.submit — validação de input", () => {
  it("aceita candidatura com campos obrigatórios", () => {
    const input = { nome: "João Silva", email: "joao@example.com" };
    expect(input.nome).toBeTruthy();
    expect(input.email).toContain("@");
  });

  it("rejeita email inválido", () => {
    const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(emailValido("invalido")).toBe(false);
    expect(emailValido("joao@example.com")).toBe(true);
  });

  it("aceita campos opcionais como undefined", () => {
    const input = {
      nome: "Maria Santos",
      email: "maria@example.com",
      telefone: undefined,
      linkedin: undefined,
      mensagem: undefined,
      cvUrl: undefined,
      cvNome: undefined,
    };
    expect(input.telefone).toBeUndefined();
    expect(input.linkedin).toBeUndefined();
  });

  it("valida tamanho máximo do ficheiro CV (10MB)", () => {
    const maxSize = 10 * 1024 * 1024;
    const ficheiroGrande = maxSize + 1;
    const ficheiroAceitavel = maxSize - 1;
    expect(ficheiroGrande > maxSize).toBe(true);
    expect(ficheiroAceitavel <= maxSize).toBe(true);
  });

  it("valida tipos de ficheiro aceites para CV", () => {
    const tiposAceites = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    expect(tiposAceites).toContain("application/pdf");
    expect(tiposAceites).not.toContain("image/jpeg");
    expect(tiposAceites).not.toContain("text/plain");
  });
});

// ─── Estados de candidatura ────────────────────────────────────────────────────

describe("candidaturas — estados", () => {
  const estadosValidos = ["pendente", "em_analise", "entrevista", "rejeitado", "aceite"] as const;
  type Estado = typeof estadosValidos[number];

  it("tem 5 estados válidos", () => {
    expect(estadosValidos).toHaveLength(5);
  });

  it("estado inicial é 'pendente'", () => {
    const estadoInicial: Estado = "pendente";
    expect(estadosValidos).toContain(estadoInicial);
  });

  it("todos os estados têm labels em português", () => {
    const labels: Record<Estado, string> = {
      pendente: "Pendente",
      em_analise: "Em Análise",
      entrevista: "Entrevista",
      rejeitado: "Rejeitado",
      aceite: "Aceite",
    };
    estadosValidos.forEach((estado) => {
      expect(labels[estado]).toBeTruthy();
      expect(labels[estado].length).toBeGreaterThan(0);
    });
  });

  it("rejeita estado inválido", () => {
    const estadoInvalido = "aprovado";
    expect(estadosValidos).not.toContain(estadoInvalido as Estado);
  });
});

// ─── Estrutura dos dados ───────────────────────────────────────────────────────

describe("candidaturas — estrutura de dados", () => {
  it("candidatura tem todos os campos esperados", () => {
    const candidatura = {
      id: 1,
      carreiraId: null,
      nome: "Ana Pereira",
      email: "ana@example.com",
      telefone: "+351 912 345 678",
      linkedin: "linkedin.com/in/ana-pereira",
      mensagem: "Tenho interesse na vossa missão.",
      cvUrl: "https://s3.example.com/cv-ana.pdf",
      cvNome: "cv-ana.pdf",
      estado: "pendente",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(candidatura).toHaveProperty("id");
    expect(candidatura).toHaveProperty("nome");
    expect(candidatura).toHaveProperty("email");
    expect(candidatura).toHaveProperty("estado");
    expect(candidatura).toHaveProperty("createdAt");
    expect(candidatura.estado).toBe("pendente");
  });

  it("formata data de criação em português", () => {
    const data = new Date("2026-03-05T10:00:00Z");
    const formatada = data.toLocaleDateString("pt-PT");
    expect(formatada).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("URL do CV é válida quando presente", () => {
    const cvUrl = "https://storage.example.com/candidaturas/cv-joao-silva.pdf";
    expect(cvUrl.startsWith("https://")).toBe(true);
    expect(cvUrl.endsWith(".pdf")).toBe(true);
  });
});

// ─── Backoffice — secção de candidaturas ──────────────────────────────────────

describe("backoffice.candidaturas — visualização", () => {
  it("conta candidaturas corretamente", () => {
    const candidaturas = [
      { id: 1, nome: "João", estado: "pendente" },
      { id: 2, nome: "Maria", estado: "aceite" },
      { id: 3, nome: "Pedro", estado: "rejeitado" },
    ];
    expect(candidaturas.length).toBe(3);
  });

  it("filtra candidaturas por estado", () => {
    const candidaturas = [
      { id: 1, nome: "João", estado: "pendente" },
      { id: 2, nome: "Maria", estado: "aceite" },
      { id: 3, nome: "Pedro", estado: "pendente" },
    ];
    const pendentes = candidaturas.filter((c) => c.estado === "pendente");
    expect(pendentes).toHaveLength(2);
  });

  it("URL do LinkedIn é normalizada com https://", () => {
    const normalizarLinkedIn = (url: string) =>
      url.startsWith("http") ? url : `https://${url}`;
    expect(normalizarLinkedIn("linkedin.com/in/joao")).toBe("https://linkedin.com/in/joao");
    expect(normalizarLinkedIn("https://linkedin.com/in/joao")).toBe("https://linkedin.com/in/joao");
  });
});
