import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // A autenticacao OAuth da Manus saiu com a plataforma. O backoffice e o CRM
  // tem cada um a sua propria autenticacao (routers/backoffice.ts, routers/crm.ts),
  // por isso este utilizador fica sempre vazio.
  const user: User | null = null;

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
