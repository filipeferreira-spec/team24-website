import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { actividadeComercial } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const actividadeComercialRouter = router({
  // Listar registos com filtro de período
  list: publicProcedure
    .input(
      z.object({
        dataInicio: z.string().optional(), // "YYYY-MM-DD"
        dataFim: z.string().optional(),    // "YYYY-MM-DD"
        comercialNome: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const conditions = [];
      if (input.dataInicio) conditions.push(gte(actividadeComercial.data, input.dataInicio));
      if (input.dataFim) conditions.push(lte(actividadeComercial.data, input.dataFim));
      if (input.comercialNome) conditions.push(eq(actividadeComercial.comercialNome, input.comercialNome));

      const rows = await db
        .select()
        .from(actividadeComercial)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(actividadeComercial.data));

      return rows;
    }),

  // Criar registo diário
  create: publicProcedure
    .input(
      z.object({
        data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        comercialNome: z.string().min(1),
        comercialId: z.number().optional(),
        leadsContactadas: z.number().min(0).default(0),
        reunioesAgendadas: z.number().min(0).default(0),
        reunioesRealizadas: z.number().min(0).default(0),
        propostasEnviadas: z.number().min(0).default(0),
        contratosFechados: z.number().min(0).default(0),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [result] = await db.insert(actividadeComercial).values({
        data: input.data,
        comercialNome: input.comercialNome,
        comercialId: input.comercialId,
        leadsContactadas: input.leadsContactadas,
        reunioesAgendadas: input.reunioesAgendadas,
        reunioesRealizadas: input.reunioesRealizadas,
        propostasEnviadas: input.propostasEnviadas,
        contratosFechados: input.contratosFechados,
        notas: input.notas,
      });

      return { id: (result as any).insertId };
    }),

  // Actualizar registo
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        leadsContactadas: z.number().min(0).optional(),
        reunioesAgendadas: z.number().min(0).optional(),
        reunioesRealizadas: z.number().min(0).optional(),
        propostasEnviadas: z.number().min(0).optional(),
        contratosFechados: z.number().min(0).optional(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { id, ...fields } = input;
      await db.update(actividadeComercial).set(fields).where(eq(actividadeComercial.id, id));
      return { success: true };
    }),

  // Eliminar registo
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.delete(actividadeComercial).where(eq(actividadeComercial.id, input.id));
      return { success: true };
    }),

  // Listar nomes únicos de comerciais (para filtro)
  comerciais: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const rows = await db
      .selectDistinct({ nome: actividadeComercial.comercialNome })
      .from(actividadeComercial)
      .orderBy(actividadeComercial.comercialNome);

    return rows.map((r: { nome: string }) => r.nome);
  }),
});
