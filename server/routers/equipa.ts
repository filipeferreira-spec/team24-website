import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { equipa } from "../../drizzle/schema";
import { eq, like, or, desc, and } from "drizzle-orm";
import { storagePut } from "../storage";

const AREAS = ["comercial", "psicologos", "marketing", "administrativo"] as const;
const TIPOS_CONTRATO = ["full_time", "part_time", "freelancer", "estagio", "avenca", "outro"] as const;

// ─── Router ───────────────────────────────────────────────────────────────────
export const equipaRouter = router({

  // Listar membros (com filtro por área e pesquisa)
  list: publicProcedure
    .input(z.object({
      area: z.enum(AREAS).optional(),
      search: z.string().optional(),
      ativo: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");
      const conditions = [];
      if (input?.ativo !== undefined) conditions.push(eq(equipa.ativo, input.ativo));
      if (input?.area) conditions.push(eq(equipa.area, input.area));
      if (input?.search) {
        const s = `%${input.search}%`;
        conditions.push(or(
          like(equipa.nome, s),
          like(equipa.cargo, s),
          like(equipa.email, s),
        ));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const membros = await db.select().from(equipa).where(where).orderBy(desc(equipa.createdAt));
      return { membros };
    }),

  // Obter membro por ID
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");
      const [membro] = await db.select().from(equipa).where(eq(equipa.id, input.id));
      if (!membro) throw new Error("Membro não encontrado");
      return membro;
    }),

  // Criar membro
  create: publicProcedure
    .input(z.object({
      nome: z.string().min(1),
      area: z.enum(AREAS),
      cargo: z.string().optional(),
      email: z.string().optional(),
      telefone: z.string().optional(),
      linkedin: z.string().optional(),
      morada: z.string().optional(),
      idade: z.number().int().min(16).max(99).optional(),
      tipoContrato: z.enum(TIPOS_CONTRATO).nullable().optional(),
      ferias: z.string().optional(),
      notas: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");
      const [result] = await db.insert(equipa).values({
        nome: input.nome,
        area: input.area,
        cargo: input.cargo || null,
        email: input.email || null,
        telefone: input.telefone || null,
        linkedin: input.linkedin || null,
        morada: input.morada || null,
        idade: input.idade || null,
        tipoContrato: input.tipoContrato || null,
        ferias: input.ferias || null,
        notas: input.notas || null,
        ativo: true,
      });
      const id = (result as any).insertId as number;
      const [membro] = await db.select().from(equipa).where(eq(equipa.id, id));
      return membro;
    }),

  // Actualizar membro
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      area: z.enum(AREAS).optional(),
      cargo: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      telefone: z.string().nullable().optional(),
      linkedin: z.string().nullable().optional(),
      morada: z.string().nullable().optional(),
      idade: z.number().int().nullable().optional(),
      tipoContrato: z.enum(TIPOS_CONTRATO).nullable().optional(),
      ferias: z.string().nullable().optional(),
      notas: z.string().nullable().optional(),
      fotoUrl: z.string().nullable().optional(),
      fotoKey: z.string().nullable().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");
      const { id, ...data } = input;
      const updateData: Record<string, any> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) updateData[k] = v;
      }
      if (Object.keys(updateData).length === 0) return null;
      await db.update(equipa).set(updateData).where(eq(equipa.id, id));
      const [membro] = await db.select().from(equipa).where(eq(equipa.id, id));
      return membro;
    }),

  // Upload de foto (base64 → S3)
  uploadFoto: publicProcedure
    .input(z.object({
      id: z.number(),
      base64: z.string(),
      mimeType: z.string().default("image/jpeg"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1] || "jpg";
      const key = `equipa/${input.id}-foto-${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await db.update(equipa).set({ fotoUrl: url, fotoKey: key }).where(eq(equipa.id, input.id));
      return { url, key };
    }),

  // Eliminar (soft delete — desactivar)
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");
      await db.update(equipa).set({ ativo: false }).where(eq(equipa.id, input.id));
      return { ok: true };
    }),

  // Eliminar permanentemente
  hardDelete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("BD indisponível");
      await db.delete(equipa).where(eq(equipa.id, input.id));
      return { ok: true };
    }),
});
