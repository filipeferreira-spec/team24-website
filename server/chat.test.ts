import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock invokeLLM to avoid real API calls in tests
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "A TEAM 24 é uma plataforma de saúde mental corporativa que oferece apoio psicológico 24/7.",
        },
      },
    ],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("chat.sendMessage", () => {
  it("returns a response from the LLM", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.sendMessage({
      messages: [{ role: "user", content: "O que é a TEAM 24?" }],
    });

    expect(result).toBeDefined();
    expect(result.content).toBeTypeOf("string");
    expect(result.content.length).toBeGreaterThan(0);
  });

  it("handles multiple messages in conversation history", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.sendMessage({
      messages: [
        { role: "user", content: "Qual é o preço?" },
        { role: "assistant", content: "Os preços começam a partir de €5/colaborador/mês." },
        { role: "user", content: "E para 100 colaboradores?" },
      ],
    });

    expect(result).toBeDefined();
    expect(result.content).toBeTypeOf("string");
  });

  it("returns error message when LLM fails", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockRejectedValueOnce(new Error("LLM unavailable"));

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.sendMessage({
      messages: [{ role: "user", content: "Olá" }],
    });

    expect(result.content).toContain("+351 220 981 284");
  });
});
