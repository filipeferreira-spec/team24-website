import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { crmProspecting, crmProspectingMensagens, crmLeads, crmEmpresas } from "../../drizzle/schema";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { Request, Response } from "express";

// ─── API Key para o webhook (guardada como env var) ───────────────────────────
// NUNCA usar fallback em produção — a chave tem de estar definida como secret
const PROSPECTING_API_KEY = process.env.PROSPECTING_API_KEY;

// ─── Verificar duplicados na BD ───────────────────────────────────────────────
async function verificarDuplicados(nome: string, empresa?: string) {
  const db = await getDb();
  if (!db) return { duplicadoTipo: "nenhum" as const, duplicadoLeadId: null, duplicadoEmpresaId: null };

  let duplicadoLeadId: number | null = null;
  let duplicadoEmpresaId: number | null = null;

  // Verificar se o nome existe em crm_leads (contacto principal ou título)
  if (nome) {
    const nomeParts = nome.trim().split(" ");
    const primeiroNome = nomeParts[0];
    const leadsExistentes = await db
      .select({ id: crmLeads.id, titulo: crmLeads.titulo })
      .from(crmLeads)
      .where(and(
        eq(crmLeads.ativo, true),
        like(crmLeads.titulo, `%${primeiroNome}%`)
      ))
      .limit(1);
    if (leadsExistentes.length > 0) {
      duplicadoLeadId = leadsExistentes[0].id;
    }
  }

  // Verificar se a empresa existe em crm_empresas
  if (empresa) {
    const empresaNome = empresa.trim();
    const empresasExistentes = await (db as any)
      .select({ id: crmEmpresas.id, nome: crmEmpresas.nome })
      .from(crmEmpresas)
      .where(like(crmEmpresas.nome, `%${empresaNome.substring(0, 20)}%`))
      .limit(1);
    if (empresasExistentes.length > 0) {
      duplicadoEmpresaId = empresasExistentes[0].id;
    }
  }

  let duplicadoTipo: "nenhum" | "lead_existente" | "empresa_existente" | "ambos" = "nenhum";
  if (duplicadoLeadId && duplicadoEmpresaId) duplicadoTipo = "ambos";
  else if (duplicadoLeadId) duplicadoTipo = "lead_existente";
  else if (duplicadoEmpresaId) duplicadoTipo = "empresa_existente";

  return { duplicadoTipo, duplicadoLeadId, duplicadoEmpresaId };
}

// Fontes disponíveis (mapeadas a partir do campo notas)
const FONTES: Record<string, string> = {
  "pme_excelencia": "PME Excelência",
  "iso45001": "ISO 45001",
  "np4552": "NP 4552",
  "camaras": "Câmaras Municipais",
  "ipac": "Certificadas IPAC",
  "1000_funcionarios": "+1000 Funcionários",
  "maiores_empresas": "Maiores Empresas PT",
  "crm_forum": "CRM Forum",
};

// ─── Router tRPC (para o frontend CRM) ───────────────────────────────────────
export const crmProspectingRouter = router({
  // Listar prospectos com paginação, filtros e pesquisa
  listar: publicProcedure
    .input(z.object({
      estado: z.string().optional(),
      search: z.string().optional(),
      fonte: z.string().optional(),
      pagina: z.number().default(1),
      porPagina: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { prospectos: [], total: 0, paginas: 0, fontes: FONTES };

      const offset = (input.pagina - 1) * input.porPagina;

      // Construir filtros SQL
      const filtros: ReturnType<typeof eq>[] = [eq(crmProspecting.ativo, true)];

      if (input.estado && input.estado !== "todos") {
        filtros.push(eq(crmProspecting.estado, input.estado as any));
      }
      if (input.search) {
        filtros.push(
          or(
            like(crmProspecting.nome, `%${input.search}%`),
            like(crmProspecting.empresa, `%${input.search}%`)
          ) as any
        );
      }
      if (input.fonte && FONTES[input.fonte]) {
        filtros.push(eq(crmProspecting.fonte, input.fonte) as any);
      }

      const whereClause = filtros.length > 1 ? and(...filtros) : filtros[0];

      // Contar total
      const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(crmProspecting)
        .where(whereClause);

      // Buscar página actual
      const prospectos = await db
        .select()
        .from(crmProspecting)
        .where(whereClause)
        .orderBy(desc(crmProspecting.ultimaActualizacao))
        .limit(input.porPagina)
        .offset(offset);

      // Contagens por fonte (para mostrar badges com totais)
      const contagensFonte = await db
        .select({ fonte: crmProspecting.fonte, total: sql<number>`count(*)` })
        .from(crmProspecting)
        .where(eq(crmProspecting.ativo, true))
        .groupBy(crmProspecting.fonte);

      const totalPorFonte: Record<string, number> = {};
      contagensFonte.forEach((r: { fonte: string; total: number }) => {
        totalPorFonte[r.fonte] = r.total;
      });

      return {
        prospectos,
        total,
        paginas: Math.ceil(total / input.porPagina),
        fontes: FONTES,
        totalPorFonte,
      };
    }),

  // Detalhe de um prospecto com mensagens
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [prospecto] = await db
        .select()
        .from(crmProspecting)
        .where(eq(crmProspecting.id, input.id))
        .limit(1);

      if (!prospecto) throw new TRPCError({ code: "NOT_FOUND" });

      const mensagens = await (db as any)
        .select()
        .from(crmProspectingMensagens)
        .where(eq(crmProspectingMensagens.prospectingId, input.id))
        .orderBy(crmProspectingMensagens.createdAt);

      return { ...prospecto, mensagens };
    }),

  // Actualizar estado de um prospecto
  actualizarEstado: publicProcedure
    .input(z.object({
      id: z.number(),
      estado: z.enum(["identificado","pedido_enviado","ligado","mensagem_1","mensagem_2","mensagem_3","resposta_positiva","resposta_negativa","reuniao_agendada","sem_resposta","descartado"]),
      notas: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await (db as any).update(crmProspecting)
        .set({ estado: input.estado, notas: input.notas, ultimaActualizacao: new Date() })
        .where(eq(crmProspecting.id, input.id));
      return { ok: true };
    }),

  // Adicionar mensagem manualmente
  adicionarMensagem: publicProcedure
    .input(z.object({
      prospectingId: z.number(),
      tipo: z.enum(["enviada", "recebida", "nota_interna"]),
      conteudo: z.string().min(1),
      canal: z.enum(["linkedin", "email", "whatsapp", "telefone", "outro"]).default("linkedin"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await (db as any).insert(crmProspectingMensagens).values({
        prospectingId: input.prospectingId,
        tipo: input.tipo,
        conteudo: input.conteudo,
        canal: input.canal,
      });
      await (db as any).update(crmProspecting)
        .set({ ultimaActualizacao: new Date() })
        .where(eq(crmProspecting.id, input.prospectingId));
      return { ok: true };
    }),

  // Converter prospecto em Lead do CRM
  converterEmLead: publicProcedure
    .input(z.object({ id: z.number(), nomeEmpresa: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [p] = await db.select().from(crmProspecting).where(eq(crmProspecting.id, input.id)).limit(1);
      if (!p) throw new TRPCError({ code: "NOT_FOUND" });

      const [lead] = await (db as any).insert(crmLeads).values({
        titulo: `${p.nome}${p.empresa ? ` — ${p.empresa}` : ""}`,
        empresa: p.empresa ?? undefined,
        fase: "leads",
        origem: "linkedin",
        notas: `Convertido de prospecção LinkedIn.\nURL: ${p.urlLinkedin ?? "—"}\nCargo: ${p.cargo ?? "—"}\n\n${p.notas ?? ""}`,
        valorEstimado: 0,
      }).$returningId();

      await (db as any).update(crmProspecting)
        .set({ estado: "reuniao_agendada", ativo: false })
        .where(eq(crmProspecting.id, input.id));

      return { leadId: (lead as any).id };
    }),

  // Actualizar campos de um prospecto (usado pelo botão IA)
  actualizarCampos: publicProcedure
    .input(z.object({
      id: z.number(),
      email: z.string().optional(),
      telefone: z.string().optional(),
      website: z.string().optional(),
      sectore: z.string().optional(),
      nFuncionarios: z.string().optional(),
      nif: z.string().optional(),
      cidade: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...campos } = input;
      const camposLimpos: Record<string, any> = {};
      for (const [k, v] of Object.entries(campos)) {
        if (v !== undefined && v !== "") camposLimpos[k] = v;
      }
      if (Object.keys(camposLimpos).length > 0) {
        await (db as any).update(crmProspecting)
          .set({ ...camposLimpos, ultimaActualizacao: new Date() })
          .where(eq(crmProspecting.id, id));
      }
      return { ok: true };
    }),

  // Eliminar prospecto
  eliminar: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await (db as any).update(crmProspecting)
        .set({ ativo: false })
        .where(eq(crmProspecting.id, input.id));
      return { ok: true };
    }),

  // Estatísticas para o dashboard
  stats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, por_estado: {}, duplicados: 0 };
    const todos = await db.select({ estado: crmProspecting.estado, duplicadoTipo: crmProspecting.duplicadoTipo })
      .from(crmProspecting)
      .where(eq(crmProspecting.ativo, true));

    const por_estado = todos.reduce((acc: Record<string, number>, p: { estado: string; duplicadoTipo: string }) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});

    const duplicados = todos.filter((p: { estado: string; duplicadoTipo: string }) => p.duplicadoTipo !== "nenhum").length;

    return { total: todos.length, por_estado, duplicados };
  }),
});

// ─── Webhook Express (chamado pelo agente Claude) ─────────────────────────────
export async function handleProspectingWebhook(req: Request, res: Response) {
  try {
    // Autenticação por API key no header
    if (!PROSPECTING_API_KEY) {
      console.error("[Prospecting Webhook] PROSPECTING_API_KEY não está definida como variável de ambiente");
      return res.status(503).json({ error: "Webhook não configurado: PROSPECTING_API_KEY em falta" });
    }
    const apiKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
    if (!apiKey || apiKey !== PROSPECTING_API_KEY) {
      return res.status(401).json({ error: "API key inválida ou em falta" });
    }

    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Base de dados indisponível" });

    const body = req.body;
    const action = body.action || "upsert";

    // ── ACTION: upsert (criar ou actualizar prospecto) ──
    if (action === "upsert") {
      const { nome, urlLinkedin, cargo, email, telefone, empresa, sectore, nFuncionarios, website, estado, notas, agenteNome, mensagem } = body;

      if (!nome) return res.status(400).json({ error: "Campo 'nome' é obrigatório" });

      // Verificar se já existe pelo URL do LinkedIn
      let existente = null;
      if (urlLinkedin) {
        const [found] = await db.select().from(crmProspecting)
          .where(and(eq(crmProspecting.urlLinkedin, urlLinkedin!), eq(crmProspecting.ativo, true)))
          .limit(1);
        existente = found;
      }

      // Verificar duplicados na BD (leads e empresas)
      const { duplicadoTipo, duplicadoLeadId, duplicadoEmpresaId } = await verificarDuplicados(nome, empresa);

      if (existente) {
        // Actualizar prospecto existente
        await db.update(crmProspecting).set({
          nome: nome || existente.nome,
          cargo: cargo || existente.cargo,
          email: email || existente.email,
          telefone: telefone || existente.telefone,
          empresa: empresa || existente.empresa,
          sectore: sectore || existente.sectore,
          nFuncionarios: nFuncionarios || existente.nFuncionarios,
          website: website || existente.website,
          estado: estado || existente.estado,
          notas: notas || existente.notas,
          duplicadoTipo,
          duplicadoLeadId: duplicadoLeadId ?? undefined,
          duplicadoEmpresaId: duplicadoEmpresaId ?? undefined,
          ultimaActualizacao: new Date(),
        }).where(eq(crmProspecting.id, existente.id));

        // Adicionar mensagem se fornecida
        if (mensagem) {
          await db.insert(crmProspectingMensagens).values({
            prospectingId: existente.id,
            tipo: "enviada",
            conteudo: mensagem,
            canal: "linkedin",
          });
        }

        return res.json({
          ok: true,
          action: "updated",
          id: existente.id,
          duplicado: duplicadoTipo !== "nenhum",
          duplicadoTipo,
          duplicadoLeadId,
          duplicadoEmpresaId,
        });
      } else {
        // Criar novo prospecto
        const [inserted] = await db.insert(crmProspecting).values({
          nome,
          urlLinkedin: urlLinkedin || null,
          cargo: cargo || null,
          email: email || null,
          telefone: telefone || null,
          empresa: empresa || null,
          sectore: sectore || null,
          nFuncionarios: nFuncionarios || null,
          website: website || null,
          estado: estado || "identificado",
          notas: notas || null,
          agenteNome: agenteNome || "Agente LinkedIn",
          duplicadoTipo,
          duplicadoLeadId: duplicadoLeadId ?? null,
          duplicadoEmpresaId: duplicadoEmpresaId ?? null,
        } as any).$returningId();

        const newId = (inserted as any).id;

        // Adicionar mensagem inicial se fornecida
        if (mensagem && newId) {
          await db.insert(crmProspectingMensagens).values({
            prospectingId: newId,
            tipo: "enviada",
            conteudo: mensagem,
            canal: "linkedin",
          });
        }

        return res.json({
          ok: true,
          action: "created",
          id: newId,
          duplicado: duplicadoTipo !== "nenhum",
          duplicadoTipo,
          duplicadoLeadId,
          duplicadoEmpresaId,
          aviso: duplicadoTipo !== "nenhum"
            ? `⚠️ DUPLICADO DETECTADO: ${duplicadoTipo === "lead_existente" ? "Esta pessoa já existe como Lead" : duplicadoTipo === "empresa_existente" ? "Esta empresa já existe no CRM" : "Esta pessoa E empresa já existem no CRM"}`
            : null,
        });
      }
    }

    // ── ACTION: add_message (adicionar mensagem a prospecto existente) ──
    if (action === "add_message") {
      const { id, urlLinkedin, conteudo, tipo, canal } = body;

      let prospectId = id;
      if (!prospectId && urlLinkedin) {
        const [found] = await db.select({ id: crmProspecting.id })
          .from(crmProspecting)
          .where(eq(crmProspecting.urlLinkedin, urlLinkedin))
          .limit(1);
        prospectId = found?.id;
      }

      if (!prospectId) return res.status(404).json({ error: "Prospecto não encontrado" });
      if (!conteudo) return res.status(400).json({ error: "Campo 'conteudo' é obrigatório" });

      await db.insert(crmProspectingMensagens).values({
        prospectingId: prospectId,
        tipo: tipo || "enviada",
        conteudo,
        canal: canal || "linkedin",
      });

      await db.update(crmProspecting)
        .set({ ultimaActualizacao: new Date() })
        .where(eq(crmProspecting.id, prospectId));

      return res.json({ ok: true, action: "message_added", prospectId });
    }

    // ── ACTION: update_estado ──
    if (action === "update_estado") {
      const { id, urlLinkedin, estado } = body;

      let prospectId = id;
      if (!prospectId && urlLinkedin) {
        const [found] = await db.select({ id: crmProspecting.id })
          .from(crmProspecting)
          .where(eq(crmProspecting.urlLinkedin, urlLinkedin))
          .limit(1);
        prospectId = found?.id;
      }

      if (!prospectId) return res.status(404).json({ error: "Prospecto não encontrado" });
      if (!estado) return res.status(400).json({ error: "Campo 'estado' é obrigatório" });

      await db.update(crmProspecting)
        .set({ estado, ultimaActualizacao: new Date() })
        .where(eq(crmProspecting.id, prospectId));

      return res.json({ ok: true, action: "estado_updated", prospectId, estado });
    }

    // ── ACTION: list (devolver próximas leads a processar) ──
    if (action === "list") {
      const limit = Math.min(parseInt(body.limit || "15"), 100);
      const estado = body.estado || "identificado"; // por defeito devolve só identificados
      const excluirEstados: string[] = body.excluirEstados || ["pedido_enviado", "ligado", "mensagem_1", "mensagem_2", "mensagem_3", "resposta_positiva", "resposta_negativa", "reuniao_agendada", "sem_resposta", "descartado"];

      // Ordenação por prioridade de estado
      const ordemPrioridade: Record<string, number> = {
        "identificado": 1,
        "pedido_enviado": 2,
        "ligado": 3,
        "mensagem_1": 4,
        "mensagem_2": 5,
        "mensagem_3": 6,
        "resposta_positiva": 7,
        "sem_resposta": 8,
        "resposta_negativa": 9,
        "reuniao_agendada": 10,
        "descartado": 99,
      };

      // Buscar todos os activos não excluídos
      const todos = await db
        .select({
          id: crmProspecting.id,
          nome: crmProspecting.nome,
          urlLinkedin: crmProspecting.urlLinkedin,
          cargo: crmProspecting.cargo,
          email: crmProspecting.email,
          empresa: crmProspecting.empresa,
          sectore: crmProspecting.sectore,
          nFuncionarios: crmProspecting.nFuncionarios,
          estado: crmProspecting.estado,
          duplicadoTipo: crmProspecting.duplicadoTipo,
          notas: crmProspecting.notas,
          ultimaActualizacao: crmProspecting.ultimaActualizacao,
        })
        .from(crmProspecting)
        .where(eq(crmProspecting.ativo, true))
        .orderBy(crmProspecting.id)
        .limit(5000);

      // Filtrar excluídos e ordenar por prioridade
      const filtrados = todos
        .filter(p => !excluirEstados.includes(p.estado))
        .sort((a, b) => (ordemPrioridade[a.estado] || 50) - (ordemPrioridade[b.estado] || 50));

      const resultado = filtrados.slice(0, limit).map(p => ({
        id: p.id,
        nome: p.nome,
        urlLinkedin: p.urlLinkedin,
        cargo: p.cargo,
        email: p.email,
        empresa: p.empresa,
        sector: p.sectore,
        nFuncionarios: p.nFuncionarios,
        estado: p.estado,
        duplicado: p.duplicadoTipo !== "nenhum",
        duplicadoTipo: p.duplicadoTipo,
        notas: p.notas,
        ultimaActualizacao: p.ultimaActualizacao,
      }));

      return res.json({
        ok: true,
        total_disponiveis: filtrados.length,
        devolvidos: resultado.length,
        leads: resultado,
      });
    }

    return res.status(400).json({ error: `Action '${action}' não reconhecida. Use: upsert, add_message, update_estado, list` });

  } catch (err: any) {
    console.error("[Prospecting Webhook]", err);
    return res.status(500).json({ error: "Erro interno", details: err.message });
  }
}
