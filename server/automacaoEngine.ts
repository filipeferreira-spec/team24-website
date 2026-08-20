/**
 * Motor de Execução de Automações — TEAM 24 CRM
 * Responsável por executar as acções definidas nas regras de automação.
 */
import { eq, and, lt, lte } from "drizzle-orm";
import { getDb } from "./db";
import {
  crmAutomacoes, crmAutomacaoLogs, crmAutomacaoFila,
  crmLeads, crmEmpresas, crmContactos, crmAlertas, crmActividades,
  type CrmAutomacao,
} from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface TriggerContext {
  entidade: "lead" | "empresa" | "contacto" | "prospecting" | "newsletter";
  entidadeId: number;
  entidadeNome: string;
  payload: Record<string, any>;
}

export interface ExecucaoResultado {
  sucesso: boolean;
  acaoExecutada: string;
  erro?: string;
}

// ─── Substituição de variáveis em templates ───────────────────────────────────
function substituirVariaveis(template: string, ctx: TriggerContext & { dados?: Record<string, any> }): string {
  const vars: Record<string, string> = {
    "{{nome_empresa}}": ctx.entidadeNome || "",
    "{{entidade}}": ctx.entidade || "",
    "{{entidade_id}}": String(ctx.entidadeId || ""),
    "{{data_hoje}}": new Date().toLocaleDateString("pt-PT"),
    "{{hora_hoje}}": new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
    ...Object.fromEntries(
      Object.entries(ctx.payload || {}).map(([k, v]) => [`{{${k}}}`, String(v ?? "")])
    ),
    ...Object.fromEntries(
      Object.entries(ctx.dados || {}).map(([k, v]) => [`{{${k}}}`, String(v ?? "")])
    ),
  };
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.split(key).join(val);
  }
  return result;
}

// ─── Execução de uma automação ────────────────────────────────────────────────
export async function executarAutomacao(
  automacao: CrmAutomacao,
  ctx: TriggerContext,
  db?: Awaited<ReturnType<typeof getDb>>
): Promise<ExecucaoResultado> {
  const database = db || await getDb();
  if (!database) return { sucesso: false, acaoExecutada: "", erro: "BD indisponível." };

  const config = (automacao.acaoConfig as Record<string, any>) || {};
  let acaoExecutada = "";
  let erro: string | undefined;

  try {
    switch (automacao.acaoTipo) {

      // ── Criar alerta interno ─────────────────────────────────────────────────
      case "criar_alerta": {
        const titulo = substituirVariaveis(config.titulo || `Automação: ${automacao.nome}`, ctx);
        const descricao = substituirVariaveis(config.descricao || `Trigger: ${automacao.triggerTipo} em ${ctx.entidadeNome}`, ctx);
        await database.insert(crmAlertas).values({
          tipo: config.tipo || "followup",
          titulo,
          descricao,
          prioridade: config.prioridade || "media",
          leadId: ctx.entidade === "lead" ? ctx.entidadeId : null,
          empresaId: ctx.entidade === "empresa" ? ctx.entidadeId : null,
          dataAlerta: new Date(),
          ativo: true,
        } as any);
        acaoExecutada = `Alerta criado: "${titulo}"`;
        break;
      }

      // ── Criar actividade/tarefa ──────────────────────────────────────────────
      case "criar_actividade": {
        const titulo = substituirVariaveis(config.titulo || `Follow-up: ${ctx.entidadeNome}`, ctx);
        const diasPrazo = config.diasPrazo || 2;
        const prazo = new Date();
        prazo.setDate(prazo.getDate() + diasPrazo);
        await database.insert(crmActividades).values({
          tipo: config.tipoActividade || "tarefa",
          titulo,
          descricao: substituirVariaveis(config.descricao || "", ctx),
          leadId: ctx.entidade === "lead" ? ctx.entidadeId : null,
          empresaId: ctx.entidade === "empresa" ? ctx.entidadeId : null,
          dataActividade: prazo,
          concluida: false,
        } as any);
        acaoExecutada = `Actividade criada: "${titulo}" (prazo: ${prazo.toLocaleDateString("pt-PT")})`;
        break;
      }

      // ── Mover lead para outra fase ───────────────────────────────────────────
      case "mover_fase": {
        if (ctx.entidade !== "lead") {
          acaoExecutada = "Ignorado: mover_fase só se aplica a leads";
          break;
        }
        const novaFase = config.novaFase;
        if (!novaFase) throw new Error("novaFase não configurada");
        await database.update(crmLeads).set({ fase: novaFase } as any).where(eq(crmLeads.id, ctx.entidadeId));
        acaoExecutada = `Lead movida para fase: "${novaFase}"`;
        break;
      }

      // ── Notificar responsável (alerta de alta prioridade) ────────────────────
      case "notificar_responsavel": {
        const titulo = substituirVariaveis(config.titulo || `⚡ Atenção: ${ctx.entidadeNome}`, ctx);
        await database.insert(crmAlertas).values({
          tipo: "urgente",
          titulo,
          descricao: substituirVariaveis(config.mensagem || `Automação "${automacao.nome}" activada.`, ctx),
          prioridade: "alta",
          leadId: ctx.entidade === "lead" ? ctx.entidadeId : null,
          empresaId: ctx.entidade === "empresa" ? ctx.entidadeId : null,
          dataAlerta: new Date(),
          ativo: true,
        } as any);
        acaoExecutada = `Responsável notificado: "${titulo}"`;
        break;
      }

      // ── Enviar email (via LLM para gerar corpo personalizado) ────────────────
      case "enviar_email":
      case "enviar_email_interno": {
        const assunto = substituirVariaveis(automacao.emailAssunto || config.assunto || `Mensagem de TEAM 24`, ctx);
        const corpoTemplate = automacao.emailCorpo || config.corpo || "";
        const corpo = corpoTemplate ? substituirVariaveis(corpoTemplate, ctx) : null;

        // Regista como actividade de email no CRM (a integração de envio real
        // requer configuração de SMTP — por agora cria registo + alerta)
        await database.insert(crmActividades).values({
          tipo: "email",
          titulo: `Email: ${assunto}`,
          descricao: corpo || `Email automático enviado para ${ctx.entidadeNome}`,
          leadId: ctx.entidade === "lead" ? ctx.entidadeId : null,
          empresaId: ctx.entidade === "empresa" ? ctx.entidadeId : null,
          dataActividade: new Date(),
          concluida: true,
        } as any);
        acaoExecutada = `Email registado: "${assunto}" para ${ctx.entidadeNome}`;
        break;
      }

      // ── Criar reunião de follow-up ───────────────────────────────────────────
      case "criar_reuniao": {
        const diasAFrente = config.diasAFrente || 3;
        const dataReuniao = new Date();
        dataReuniao.setDate(dataReuniao.getDate() + diasAFrente);
        // Regista como actividade de reunião
        await database.insert(crmActividades).values({
          tipo: "reuniao",
          titulo: substituirVariaveis(config.titulo || `Reunião follow-up: ${ctx.entidadeNome}`, ctx),
          descricao: substituirVariaveis(config.descricao || "", ctx),
          leadId: ctx.entidade === "lead" ? ctx.entidadeId : null,
          empresaId: ctx.entidade === "empresa" ? ctx.entidadeId : null,
          dataActividade: dataReuniao,
          concluida: false,
        } as any);
        acaoExecutada = `Reunião agendada para ${dataReuniao.toLocaleDateString("pt-PT")}`;
        break;
      }

      default:
        acaoExecutada = `Tipo de acção desconhecido: ${automacao.acaoTipo}`;
    }

    // Actualizar contador de execuções
    await database.update(crmAutomacoes).set({
      totalExecucoes: (automacao.totalExecucoes || 0) + 1,
      ultimaExecucao: new Date(),
    } as any).where(eq(crmAutomacoes.id, automacao.id));

    // Registar log de sucesso
    await database.insert(crmAutomacaoLogs).values({
      automacaoId: automacao.id,
      estado: "sucesso",
      triggerEntidade: ctx.entidade as any,
      triggerEntidadeId: ctx.entidadeId,
      triggerEntidadeNome: ctx.entidadeNome,
      acaoExecutada,
      executadoEm: new Date(),
    });

    return { sucesso: true, acaoExecutada };

  } catch (err: any) {
    erro = err?.message || String(err);
    // Registar log de erro
    await database.insert(crmAutomacaoLogs).values({
      automacaoId: automacao.id,
      estado: "erro",
      triggerEntidade: ctx.entidade as any,
      triggerEntidadeId: ctx.entidadeId,
      triggerEntidadeNome: ctx.entidadeNome,
      acaoExecutada: acaoExecutada || "",
      erro,
      executadoEm: new Date(),
    });
    return { sucesso: false, acaoExecutada, erro };
  }
}

// ─── Disparar trigger para todas as automações activas ────────────────────────
export async function dispararTrigger(
  triggerTipo: CrmAutomacao["triggerTipo"],
  ctx: TriggerContext,
  db?: Awaited<ReturnType<typeof getDb>>
): Promise<void> {
  const database = db || await getDb();
  if (!database) return;

  // Buscar todas as automações activas para este trigger
  const automacoes = await database.select().from(crmAutomacoes).where(
    and(
      eq(crmAutomacoes.ativa, true),
      eq(crmAutomacoes.triggerTipo, triggerTipo)
    )
  );

  for (const automacao of automacoes) {
    // Verificar limite de execuções
    if (automacao.maxExecucoes && (automacao.totalExecucoes || 0) >= automacao.maxExecucoes) continue;

    if (automacao.delayHoras > 0) {
      // Agendar para mais tarde (adicionar à fila)
      const agendadoPara = new Date();
      agendadoPara.setHours(agendadoPara.getHours() + automacao.delayHoras);
      await database.insert(crmAutomacaoFila).values({
        automacaoId: automacao.id,
        estado: "pendente",
        triggerEntidade: ctx.entidade as any,
        triggerEntidadeId: ctx.entidadeId,
        triggerEntidadeNome: ctx.entidadeNome,
        triggerPayload: ctx.payload,
        agendadoPara,
      });
    } else {
      // Executar imediatamente
      await executarAutomacao(automacao, ctx, database);
    }
  }
}

// ─── Processar fila de automações pendentes ───────────────────────────────────
export async function processarFila(): Promise<{ processados: number; erros: number }> {
  const database = await getDb();
  if (!database) return { processados: 0, erros: 0 };

  const agora = new Date();
  const pendentes = await database.select({
    fila: crmAutomacaoFila,
    automacao: crmAutomacoes,
  }).from(crmAutomacaoFila)
    .leftJoin(crmAutomacoes, eq(crmAutomacaoFila.automacaoId, crmAutomacoes.id))
    .where(
      and(
        eq(crmAutomacaoFila.estado, "pendente"),
        lte(crmAutomacaoFila.agendadoPara, agora)
      )
    )
    .limit(50);

  let processados = 0, erros = 0;

  for (const { fila, automacao } of pendentes) {
    if (!automacao) continue;
    // Marcar como processando
    await database.update(crmAutomacaoFila).set({ estado: "processando" } as any).where(eq(crmAutomacaoFila.id, fila.id));

    const ctx: TriggerContext = {
      entidade: fila.triggerEntidade as any || "lead",
      entidadeId: fila.triggerEntidadeId || 0,
      entidadeNome: fila.triggerEntidadeNome || "",
      payload: (fila.triggerPayload as Record<string, any>) || {},
    };

    const resultado = await executarAutomacao(automacao, ctx, database);
    await database.update(crmAutomacaoFila).set({ estado: "concluido" } as any).where(eq(crmAutomacaoFila.id, fila.id));

    if (resultado.sucesso) processados++; else erros++;
  }

  return { processados, erros };
}
