import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// ─── USERS (OAuth) ────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── BACKOFFICE ADMINS (username/password) ────────────────────────────────────
export const backofficeAdmins = mysqlTable("backoffice_admins", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  nome: varchar("nome", { length: 255 }),
  email: varchar("email", { length: 320 }),
  ativo: boolean("ativo").default(true).notNull(),
  role: mysqlEnum("role", ["superadmin", "comercial"]).default("superadmin").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastLogin: timestamp("lastLogin"),
});

export type BackofficeAdmin = typeof backofficeAdmins.$inferSelect;
export type InsertBackofficeAdmin = typeof backofficeAdmins.$inferInsert;

// ─── RECURSOS ────────────────────────────────────────────────────────────────
export const recursos = mysqlTable("recursos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["ebook", "artigo", "webinar", "ferramenta", "guia", "template"]).notNull().default("artigo"),
  tema: varchar("tema", { length: 100 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  downloadUrl: varchar("downloadUrl", { length: 500 }),
  isPremium: boolean("isPremium").default(false).notNull(),
  isNovo: boolean("isNovo").default(false).notNull(),
  publicado: boolean("publicado").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recurso = typeof recursos.$inferSelect;
export type InsertRecurso = typeof recursos.$inferInsert;

// ─── CASOS DE SUCESSO ─────────────────────────────────────────────────────────
export const casos = mysqlTable("casos", {
  id: int("id").autoincrement().primaryKey(),
  empresa: varchar("empresa", { length: 255 }).notNull(),
  setor: varchar("setor", { length: 100 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  imagemUrl: varchar("imagemUrl", { length: 500 }),
  resultado: varchar("resultado", { length: 255 }),
  descricao: text("descricao"),
  citacao: text("citacao"),
  citacaoAutor: varchar("citacaoAutor", { length: 255 }),
  citacaoRole: varchar("citacaoRole", { length: 255 }),
  metrica1Label: varchar("metrica1Label", { length: 100 }),
  metrica1Valor: varchar("metrica1Valor", { length: 50 }),
  metrica2Label: varchar("metrica2Label", { length: 100 }),
  metrica2Valor: varchar("metrica2Valor", { length: 50 }),
  metrica3Label: varchar("metrica3Label", { length: 100 }),
  metrica3Valor: varchar("metrica3Valor", { length: 50 }),
  destaque: boolean("destaque").default(false).notNull(),
  publicado: boolean("publicado").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Caso = typeof casos.$inferSelect;
export type InsertCaso = typeof casos.$inferInsert;

// ─── IMPRENSA ─────────────────────────────────────────────────────────────────
export const imprensa = mysqlTable("imprensa", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 500 }).notNull(),
  publicacao: varchar("publicacao", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["artigo", "entrevista", "comunicado", "mencao"]).notNull().default("artigo"),
  resumo: text("resumo"),
  url: varchar("url", { length: 500 }),
  imagemUrl: varchar("imagemUrl", { length: 500 }),
  dataPublicacao: timestamp("dataPublicacao"),
  destaque: boolean("destaque").default(false).notNull(),
  publicado: boolean("publicado").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Imprensa = typeof imprensa.$inferSelect;
export type InsertImprensa = typeof imprensa.$inferInsert;

// ─── CARREIRAS ────────────────────────────────────────────────────────────────
export const carreiras = mysqlTable("carreiras", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }),
  departamento: varchar("departamento", { length: 100 }),
  localizacao: varchar("localizacao", { length: 255 }),
  tipo: mysqlEnum("tipo", ["full-time", "part-time", "freelance", "estagio"]).notNull().default("full-time"),
  nivel: mysqlEnum("nivel", ["junior", "medio", "senior", "lead", "diretor"]).default("medio"),
  descricao: text("descricao"),
  requisitos: text("requisitos"),
  beneficios: text("beneficios"),
  salarioMin: int("salarioMin"),
  salarioMax: int("salarioMax"),
  ativo: boolean("ativo").default(true).notNull(),
  publicado: boolean("publicado").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Carreira = typeof carreiras.$inferSelect;
export type InsertCarreira = typeof carreiras.$inferInsert;

// ─── CANDIDATURAS ────────────────────────────────────────────────────────────────────────────────
export const candidaturas = mysqlTable("candidaturas", {
  id: int("id").autoincrement().primaryKey(),
  carreiraId: int("carreiraId"),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telefone: varchar("telefone", { length: 50 }),
  linkedin: varchar("linkedin", { length: 500 }),
  mensagem: text("mensagem"),
  cvUrl: varchar("cvUrl", { length: 500 }),
  cvNome: varchar("cvNome", { length: 255 }),
  estado: mysqlEnum("estado", ["pendente", "em_analise", "entrevista", "rejeitado", "aceite"]).default("pendente").notNull(),
  classificacao: int("classificacao"),
  notasInternas: text("notasInternas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Candidatura = typeof candidaturas.$inferSelect;
export type InsertCandidatura = typeof candidaturas.$inferInsert;

// ─── NEWSLETTER SUBSCRIBERS ──────────────────────────────────────────────────
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

// ─── QUESTIONÁRIOS ────────────────────────────────────────────────────────────
export const questionarios = mysqlTable("questionarios", {
  id: int("id").autoincrement().primaryKey(),
  carreiraId: int("carreiraId"),                          // vaga associada (null = genérico)
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Questionario = typeof questionarios.$inferSelect;
export type InsertQuestionario = typeof questionarios.$inferInsert;

// ─── PERGUNTAS DOS QUESTIONÁRIOS ──────────────────────────────────────────────
export const perguntasQuestionario = mysqlTable("perguntas_questionario", {
  id: int("id").autoincrement().primaryKey(),
  questionarioId: int("questionarioId").notNull(),
  ordem: int("ordem").default(0).notNull(),
  texto: text("texto").notNull(),
  tipo: mysqlEnum("tipo", ["texto", "escolha_multipla", "escala", "sim_nao"]).default("texto").notNull(),
  opcoes: text("opcoes"),                                 // JSON array de opções (para escolha_multipla)
  obrigatoria: boolean("obrigatoria").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerguntaQuestionario = typeof perguntasQuestionario.$inferSelect;
export type InsertPerguntaQuestionario = typeof perguntasQuestionario.$inferInsert;

// ─── TOKENS DE QUESTIONÁRIO (enviados por email ao candidato) ─────────────────
export const tokensQuestionario = mysqlTable("tokens_questionario", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  candidaturaId: int("candidaturaId").notNull(),
  questionarioId: int("questionarioId").notNull(),
  emailEnviado: boolean("emailEnviado").default(false).notNull(),
  emailEnviadoAt: timestamp("emailEnviadoAt"),
  lembreteEnviado: boolean("lembreteEnviado").default(false).notNull(),
  lembreteEnviadoAt: timestamp("lembreteEnviadoAt"),
  respondido: boolean("respondido").default(false).notNull(),
  respondidoAt: timestamp("respondidoAt"),
  expiraAt: timestamp("expiraAt"),                        // null = sem expiração
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenQuestionario = typeof tokensQuestionario.$inferSelect;
export type InsertTokenQuestionario = typeof tokensQuestionario.$inferInsert;

// ─── RESPOSTAS DOS QUESTIONÁRIOS ──────────────────────────────────────────────
export const respostasQuestionario = mysqlTable("respostas_questionario", {
  id: int("id").autoincrement().primaryKey(),
  tokenId: int("tokenId").notNull(),
  perguntaId: int("perguntaId").notNull(),
  resposta: text("resposta").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RespostaQuestionario = typeof respostasQuestionario.$inferSelect;
export type InsertRespostaQuestionario = typeof respostasQuestionario.$inferInsert;

// ─── OUTREACH: SEQUÊNCIAS DE EMAIL ───────────────────────────────────────────
export const outreachSequencias = mysqlTable("outreach_sequencias", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  segmento: mysqlEnum("segmento", ["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste"]).default("geral").notNull(),
  ativa: boolean("ativa").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OutreachSequencia = typeof outreachSequencias.$inferSelect;
export type InsertOutreachSequencia = typeof outreachSequencias.$inferInsert;

// ─── OUTREACH: EMAILS DA SEQUÊNCIA ───────────────────────────────────────────
export const outreachEmails = mysqlTable("outreach_emails", {
  id: int("id").autoincrement().primaryKey(),
  sequenciaId: int("sequenciaId").notNull(),
  ordem: int("ordem").notNull(),           // 1, 2, 3, 4
  diaCadencia: int("diaCadencia").notNull(), // 0, 4, 9, 16
  assunto: varchar("assunto", { length: 500 }).notNull(),
  corpo: text("corpo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OutreachEmail = typeof outreachEmails.$inferSelect;
export type InsertOutreachEmail = typeof outreachEmails.$inferInsert;

// ─── OUTREACH: CONTACTOS ─────────────────────────────────────────────────────
export const outreachContactos = mysqlTable("outreach_contactos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  empresa: varchar("empresa", { length: 255 }),
  cargo: varchar("cargo", { length: 255 }),
  segmento: mysqlEnum("segmento", ["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste"]).default("geral").notNull(),
  odooPartnerId: int("odooPartnerId"),
  ativo: boolean("ativo").default(true).notNull(),
  descartado: boolean("descartado").default(false).notNull(),
  motivoDescarte: varchar("motivoDescarte", { length: 500 }),
  numColaboradores: int("numColaboradores"),
  motivoPerda: varchar("motivoPerda", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OutreachContacto = typeof outreachContactos.$inferSelect;
export type InsertOutreachContacto = typeof outreachContactos.$inferInsert;

// ─── OUTREACH: CAMPANHAS ─────────────────────────────────────────────────────
export const outreachCampanhas = mysqlTable("outreach_campanhas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  sequenciaId: int("sequenciaId").notNull(),
  segmento: mysqlEnum("segmento", ["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste"]).default("geral").notNull(),
  estado: mysqlEnum("estado", ["rascunho", "ativa", "pausada", "concluida"]).default("rascunho").notNull(),
  remetentNome: varchar("remetentNome", { length: 255 }).default("Filipe Ferreira").notNull(),
  remetentEmail: varchar("remetentEmail", { length: 320 }).default("filipe.ferreira@team24.pt").notNull(),
  totalContactos: int("totalContactos").default(0).notNull(),
  lancadaAt: timestamp("lancadaAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OutreachCampanha = typeof outreachCampanhas.$inferSelect;
export type InsertOutreachCampanha = typeof outreachCampanhas.$inferInsert;

// ─── OUTREACH: ENVIOS (log por contacto por email) ───────────────────────────
export const outreachEnvios = mysqlTable("outreach_envios", {
  id: int("id").autoincrement().primaryKey(),
  campanhaId: int("campanhaId").notNull(),
  contactoId: int("contactoId").notNull(),
  emailId: int("emailId").notNull(),          // qual email da sequência
  estado: mysqlEnum("estado", ["pendente", "enviado", "erro", "aberto", "clicado", "respondido", "descartado"]).default("pendente").notNull(),
  enviadoAt: timestamp("enviadoAt"),
  erroMsg: varchar("erroMsg", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OutreachEnvio = typeof outreachEnvios.$inferSelect;
export type InsertOutreachEnvio = typeof outreachEnvios.$inferInsert;

// ─── OUTREACH TRACKING ────────────────────────────────────────────────────────
export const outreachTracking = mysqlTable("outreach_tracking", {
  id: int("id").autoincrement().primaryKey(),
  envioId: int("envioId").notNull(),           // FK → outreach_envios.id
  campanhaId: int("campanhaId").notNull(),
  contactoId: int("contactoId").notNull(),
  emailId: int("emailId").notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "clique", "resposta"]).notNull(),
  url: varchar("url", { length: 2048 }),       // para cliques: URL destino
  userAgent: varchar("userAgent", { length: 512 }),
  ip: varchar("ip", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OutreachTracking = typeof outreachTracking.$inferSelect;
export type InsertOutreachTracking = typeof outreachTracking.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// CRM TEAM 24 — MÓDULO COMERCIAL
// ═══════════════════════════════════════════════════════════════════════════════

// ─── CRM: UTILIZADORES ────────────────────────────────────────────────────────
export const crmUsers = mysqlTable("crm_users", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),        // null se login via Microsoft
  role: mysqlEnum("role", ["admin", "gestor_comercial", "psicologo"]).default("gestor_comercial").notNull(),
  microsoftId: varchar("microsoftId", { length: 255 }),          // ID Microsoft 365
  microsoftAccessToken: text("microsoftAccessToken"),
  microsoftRefreshToken: text("microsoftRefreshToken"),
  microsoftTokenExpiry: timestamp("microsoftTokenExpiry"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  telefone: varchar("telefone", { length: 50 }),
  ativo: boolean("ativo").default(true).notNull(),
  ultimoLogin: timestamp("ultimoLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmUser = typeof crmUsers.$inferSelect;
export type InsertCrmUser = typeof crmUsers.$inferInsert;

// ─── CRM: EMPRESAS ────────────────────────────────────────────────────────────
export const crmEmpresas = mysqlTable("crm_empresas", {
  id: int("id").autoincrement().primaryKey(),
  odooId: int("odooId"),                                          // ID original no Odoo
  nome: varchar("nome", { length: 255 }).notNull(),
  nif: varchar("nif", { length: 20 }),
  cae: varchar("cae", { length: 20 }),                           // Código de Actividade Económica
  sector: varchar("sector", { length: 100 }),
  subSector: varchar("subSector", { length: 100 }),
  numColaboradores: int("numColaboradores"),
  numColaboradoresRange: varchar("numColaboradoresRange", { length: 50 }), // "50-100", "100-250", etc.
  website: varchar("website", { length: 500 }),
  linkedin: varchar("linkedin", { length: 500 }),
  morada: varchar("morada", { length: 500 }),
  cidade: varchar("cidade", { length: 100 }),
  codigoPostal: varchar("codigoPostal", { length: 20 }),
  pais: varchar("pais", { length: 100 }).default("Portugal"),
  telefone: varchar("telefone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  segmento: mysqlEnum("segmento", ["pme", "grande_empresa", "multinacional", "setor_publico", "ong", "outro"]).default("pme"),
  score: int("score").default(0),                                // score de qualidade 0-100
  fonte: varchar("fonte", { length: 100 }),                      // "odoo", "linkedin", "website", "manual"
  tags: text("tags"),                                            // JSON array de tags
  notas: text("notas"),
  clienteAtivo: boolean("clienteAtivo").default(false).notNull(),
  dataInicioContrato: timestamp("dataInicioContrato"),
  dataFimContrato: timestamp("dataFimContrato"),
  valorMensalidade: int("valorMensalidade"),                     // em euros
  responsavelNome: varchar("responsavelNome", { length: 255 }),   // nome do gestor responsável
  mensalidade: int("mensalidade"),                                // mensalidade actual em euros
  motivoPerda: varchar("motivoPerda", { length: 500 }),           // razão pela qual o cliente foi perdido
  camposPreenchidosIA: text("camposPreenchidosIA"),                 // JSON array de campos preenchidos por IA
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmEmpresa = typeof crmEmpresas.$inferSelect;
export type InsertCrmEmpresa = typeof crmEmpresas.$inferInsert;

// ─── CRM: CONTACTOS ───────────────────────────────────────────────────────────
export const crmContactos = mysqlTable("crm_contactos", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId"),                                   // FK → crm_empresas.id
  odooPartnerId: int("odooPartnerId"),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 255 }),
  departamento: varchar("departamento", { length: 100 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 50 }),
  telemovel: varchar("telemovel", { length: 50 }),
  linkedin: varchar("linkedin", { length: 500 }),
  decisor: boolean("decisor").default(false).notNull(),          // é decisor de compra?
  influenciador: boolean("influenciador").default(false).notNull(),
  notas: text("notas"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmContacto = typeof crmContactos.$inferSelect;
export type InsertCrmContacto = typeof crmContactos.$inferInsert;

// ─── CRM: LEADS / OPORTUNIDADES ───────────────────────────────────────────────
export const crmLeads = mysqlTable("crm_leads", {
  id: int("id").autoincrement().primaryKey(),
  odooId: int("odooId"),                                          // ID original no Odoo
  empresaId: int("empresaId"),                                   // FK → crm_empresas.id
  contactoId: int("contactoId"),                                 // FK → crm_contactos.id
  responsavelId: int("responsavelId"),                           // FK → crm_users.id
  titulo: varchar("titulo", { length: 500 }).notNull(),
  fase: mysqlEnum("fase", [
    "leads",
    "em_tratamento",
    "reuniao_agendada",
    "proposta_enviada",
    "proposta_adjudicada",
    "won",
    "renovacoes_pendente",
    "contratos_renovados",
    "contratos_terminados",
    "servicos_isolados",
    "lost"
  ]).default("leads").notNull(),
  valorEstimado: int("valorEstimado"),                           // mensalidade estimada em euros
  probabilidade: int("probabilidade").default(10),               // 0-100%
  origem: varchar("origem", { length: 100 }),                    // "website", "linkedin", "referencia", "outbound", etc.
  // Campos do Odoo migrados
  responsavelNome: varchar("responsavelNome", { length: 255 }),   // nome do responsável (do Odoo user_id)
  mensalidade: int("mensalidade"),
  mensalidadeComEap: int("mensalidadeComEap"),
  valorTotal: int("valorTotal"),
  tipoEap: varchar("tipoEap", { length: 255 }),
  videoconsultas: varchar("videoconsultas", { length: 100 }),
  workshops: varchar("workshops", { length: 100 }),
  avaliacaoRiscos: varchar("avaliacaoRiscos", { length: 100 }),
  // Datas
  dataFechamento: timestamp("dataFechamento"),                   // data prevista de fecho
  dataInicioContrato: timestamp("dataInicioContrato"),
  dataRenovacao: timestamp("dataRenovacao"),
  // Estado
  ativo: boolean("ativo").default(true).notNull(),               // false = arquivado/lost
  motivoPerda: varchar("motivoPerda", { length: 500 }),
  notas: text("notas"),
  ultimaActividade: timestamp("ultimaActividade"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmLead = typeof crmLeads.$inferSelect;
export type InsertCrmLead = typeof crmLeads.$inferInsert;

// ─── CRM: ACTIVIDADES ─────────────────────────────────────────────────────────
export const crmActividades = mysqlTable("crm_actividades", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),                                         // FK → crm_leads.id
  empresaId: int("empresaId"),                                   // FK → crm_empresas.id (para actividades sem lead)
  criadoPorId: int("criadoPorId"),                               // FK → crm_users.id
  tipo: mysqlEnum("tipo", ["chamada", "email", "reuniao", "nota", "proposta", "contrato", "outro"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  resultado: varchar("resultado", { length: 500 }),
  dataActividade: timestamp("dataActividade").notNull(),
  duracao: int("duracao"),                                       // minutos
  concluida: boolean("concluida").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmActividade = typeof crmActividades.$inferSelect;
export type InsertCrmActividade = typeof crmActividades.$inferInsert;

// ─── CRM: PROPOSTAS ───────────────────────────────────────────────────────────
export const crmPropostas = mysqlTable("crm_propostas", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),                                         // FK → crm_leads.id
  empresaId: int("empresaId"),                                   // FK → crm_empresas.id
  criadaPorId: int("criadaPorId"),                               // FK → crm_users.id
  titulo: varchar("titulo", { length: 255 }).notNull(),
  versao: int("versao").default(1).notNull(),
  estado: mysqlEnum("estado", ["rascunho", "enviada", "visualizada", "aceite", "rejeitada", "expirada"]).default("rascunho").notNull(),
  valor: int("valor"),                                           // valor em euros
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  pdfKey: varchar("pdfKey", { length: 500 }),
  trackingToken: varchar("trackingToken", { length: 128 }),      // token único para tracking de abertura
  dataEnvio: timestamp("dataEnvio"),
  dataAbertura: timestamp("dataAbertura"),                       // primeira abertura
  dataValidade: timestamp("dataValidade"),
  notas: text("notas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmProposta = typeof crmPropostas.$inferSelect;
export type InsertCrmProposta = typeof crmPropostas.$inferInsert;

// ─── CRM: ALERTAS ─────────────────────────────────────────────────────────────
export const crmAlertas = mysqlTable("crm_alertas", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", [
    "lead_sem_actividade",
    "proposta_sem_resposta",
    "contrato_renovacao",
    "nova_lead",
    "reuniao_proxima",
    "follow_up",
    "outro"
  ]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  estado: mysqlEnum("estado", ["pendente", "enviado", "resolvido", "ignorado"]).default("pendente").notNull(),
  leadId: int("leadId"),                                         // FK → crm_leads.id (opcional)
  empresaId: int("empresaId"),                                   // FK → crm_empresas.id (opcional)
  responsavelId: int("responsavelId"),                           // FK → crm_users.id
  emailEnviado: boolean("emailEnviado").default(false).notNull(),
  emailEnviadoAt: timestamp("emailEnviadoAt"),
  resolvidoAt: timestamp("resolvidoAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmAlerta = typeof crmAlertas.$inferSelect;
export type InsertCrmAlerta = typeof crmAlertas.$inferInsert;

// ─── CRM: REUNIÕES ────────────────────────────────────────────────────────────
export const crmReunioes = mysqlTable("crm_reunioes", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),                                         // FK → crm_leads.id
  empresaId: int("empresaId"),                                   // FK → crm_empresas.id
  organizadorId: int("organizadorId"),                           // FK → crm_users.id
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim").notNull(),
  tipo: mysqlEnum("tipo", ["teams", "presencial", "telefone"]).default("teams").notNull(),
  linkTeams: varchar("linkTeams", { length: 1000 }),
  microsoftEventId: varchar("microsoftEventId", { length: 255 }), // ID no Outlook/Teams
  estado: mysqlEnum("estado", ["agendada", "confirmada", "realizada", "cancelada", "nao_compareceu"]).default("agendada").notNull(),
  notas: text("notas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmReuniao = typeof crmReunioes.$inferSelect;
export type InsertCrmReuniao = typeof crmReunioes.$inferInsert;

// ─── CRM: REGRAS DE ALERTA AUTOMÁTICO ───────────────────────────────────────────
export const crmRegrasAlerta = mysqlTable("crm_regras_alerta", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", [
    "renovacao_contrato",       // X dias antes da data de renovação
    "lead_sem_actividade",      // Lead sem update há X dias
    "proposta_sem_resposta",    // Proposta enviada há X dias sem resposta
    "cliente_aniversario",      // Aniversário de cliente (1 ano, 2 anos...)
    "lead_nova_website",        // Nova lead do website sem atribuição
    "reuniao_sem_followup",     // Reunião realizada há X dias sem nota de follow-up
    "contrato_expirado",        // Contrato já expirou (dataFimContrato < hoje)
    "lead_fase_parada",         // Lead na mesma fase há mais de X dias
    "mensalidade_alta_sem_contacto", // Cliente com mensalidade > X sem actividade há Y dias
    "personalizado"             // Alerta manual/personalizado
  ]).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),              // Nome descritivo da regra
  descricao: text("descricao"),                                   // Descrição do que dispara
  ativo: boolean("ativo").default(true).notNull(),
  diasAntecedencia: int("diasAntecedencia").default(30),          // Dias antes/depois para disparar
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  destinatarioId: int("destinatarioId"),                          // FK → crm_users.id (null = todos)
  limiarMensalidade: int("limiarMensalidade"),                    // Para regra mensalidade_alta
  ultimaExecucao: timestamp("ultimaExecucao"),                    // Quando foi executada pela última vez
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmRegraAlerta = typeof crmRegrasAlerta.$inferSelect;
export type InsertCrmRegraAlerta = typeof crmRegrasAlerta.$inferInsert;

// ─── CRM Prospecção LinkedIn ──────────────────────────────────────────────────
export const crmProspecting = mysqlTable("crm_prospecting", {
  id:              int("id").autoincrement().primaryKey(),
  // Dados da pessoa
  nome:            varchar("nome", { length: 255 }).notNull(),
  urlLinkedin:     varchar("urlLinkedin", { length: 500 }),
  cargo:           varchar("cargo", { length: 255 }),
  email:           varchar("email", { length: 255 }),
  telefone:        varchar("telefone", { length: 50 }),
  // Dados da empresa
  empresa:         varchar("empresa", { length: 255 }),
  sectore:         varchar("sectore", { length: 255 }),
  nFuncionarios:   varchar("nFuncionarios", { length: 50 }),   // "50-200", "200-500", etc.
  website:         varchar("website", { length: 500 }),
  // Estado da prospecção
  estado:          mysqlEnum("estado", [
    "identificado",     // Encontrado, ainda não contactado
    "pedido_enviado",   // Pedido de ligação enviado
    "ligado",           // Aceitou o pedido
    "mensagem_1",       // 1ª mensagem enviada
    "mensagem_2",       // 2ª mensagem enviada
    "mensagem_3",       // 3ª mensagem enviada
    "resposta_positiva",// Respondeu com interesse
    "resposta_negativa",// Respondeu sem interesse
    "reuniao_agendada", // Reunião marcada
    "sem_resposta",     // Sem resposta após X dias
    "descartado",       // Não adequado
  ]).default("identificado").notNull(),
  // Duplicados detectados
  duplicadoTipo:   mysqlEnum("duplicadoTipo", ["nenhum", "lead_existente", "empresa_existente", "ambos"]).default("nenhum").notNull(),
  duplicadoLeadId: int("duplicadoLeadId"),      // FK → crm_leads.id se duplicado
  duplicadoEmpresaId: int("duplicadoEmpresaId"),// FK → crm_empresas.id se duplicado
  // Agente que criou
  agenteNome:      varchar("agenteNome", { length: 255 }),     // ex: "Agente LinkedIn Claude"
  // Fonte/base de dados de origem
  fonte:           varchar("fonte", { length: 50 }).default("linkedin_agente").notNull(),
  // Metadados
  notas:           text("notas"),
  ultimaActualizacao: timestamp("ultimaActualizacao").defaultNow().onUpdateNow().notNull(),
  createdAt:       timestamp("createdAt").defaultNow().notNull(),
  ativo:           boolean("ativo").default(true).notNull(),
});

export const crmProspectingMensagens = mysqlTable("crm_prospecting_mensagens", {
  id:              int("id").autoincrement().primaryKey(),
  prospectingId:   int("prospectingId").notNull(),  // FK → crm_prospecting.id
  tipo:            mysqlEnum("tipo", ["enviada", "recebida", "nota_interna"]).default("enviada").notNull(),
  conteudo:        text("conteudo").notNull(),
  canal:           mysqlEnum("canal", ["linkedin", "email", "whatsapp", "telefone", "outro"]).default("linkedin").notNull(),
  createdAt:       timestamp("createdAt").defaultNow().notNull(),
});

export type CrmProspect = typeof crmProspecting.$inferSelect;
export type InsertCrmProspect = typeof crmProspecting.$inferInsert;
export type CrmProspectMensagem = typeof crmProspectingMensagens.$inferSelect;

// ─── CRM AUTOMAÇÕES ───────────────────────────────────────────────────────────
// Tabela principal de regras de automação
export const crmAutomacoes = mysqlTable("crm_automacoes", {
  id:           int("id").autoincrement().primaryKey(),
  nome:         varchar("nome", { length: 255 }).notNull(),
  descricao:    text("descricao"),
  ativa:        boolean("ativa").default(true).notNull(),

  // Trigger — o que despoleta a automação
  triggerTipo:  mysqlEnum("triggerTipo", [
    "lead_criada",            // Nova lead criada
    "lead_fase_alterada",     // Lead muda de fase
    "lead_sem_actividade",    // Lead sem actividade há N dias
    "proposta_enviada",       // Proposta enviada
    "proposta_sem_resposta",  // Proposta sem resposta há N dias
    "cliente_criado",         // Novo cliente adicionado
    "contrato_a_expirar",     // Contrato expira em N dias
    "newsletter_subscricao",  // Subscrição de newsletter
    "ebook_download",         // Download de ebook/recurso
    "reuniao_agendada",       // Reunião agendada
    "reuniao_sem_followup",   // Reunião sem follow-up há N dias
    "lead_perdida",           // Lead marcada como perdida
    "cliente_perdido",        // Cliente marcado como perdido
    "aniversario_contrato",   // Aniversário de contrato (N dias antes)
  ]).notNull(),

  // Condições adicionais do trigger (JSON)
  // Ex: { "fase": "proposta_enviada" } ou { "diasSemActividade": 5 }
  triggerCondicoes: json("triggerCondicoes"),

  // Delay antes de executar a acção (em horas, 0 = imediato)
  delayHoras:   int("delayHoras").default(0).notNull(),

  // Acção a executar
  acaoTipo:     mysqlEnum("acaoTipo", [
    "enviar_email",           // Enviar email ao contacto/responsável
    "criar_alerta",           // Criar alerta interno no CRM
    "criar_actividade",       // Criar tarefa/actividade para o responsável
    "mover_fase",             // Mover lead para outra fase
    "notificar_responsavel",  // Notificação push ao responsável
    "enviar_email_interno",   // Email interno para a equipa TEAM 24
    "criar_reuniao",          // Criar reunião de follow-up
  ]).notNull(),

  // Configuração da acção (JSON)
  // Para email: { "assunto": "...", "corpo": "...", "destinatario": "contacto|responsavel|custom", "emailCustom": "..." }
  // Para alerta: { "titulo": "...", "prioridade": "alta|media|baixa" }
  // Para actividade: { "titulo": "...", "tipo": "email|chamada|reuniao|tarefa", "diasPrazo": 2 }
  // Para mover fase: { "novaFase": "em_tratamento" }
  acaoConfig:   json("acaoConfig").notNull(),

  // Template de email (pode usar variáveis: {{nome_empresa}}, {{responsavel}}, {{data_proposta}}, etc.)
  emailAssunto: varchar("emailAssunto", { length: 500 }),
  emailCorpo:   text("emailCorpo"),

  // Controlo de execução
  maxExecucoes:       int("maxExecucoes"),           // null = ilimitado
  totalExecucoes:     int("totalExecucoes").default(0).notNull(),
  ultimaExecucao:     timestamp("ultimaExecucao"),

  createdAt:    timestamp("createdAt").defaultNow().notNull(),
  updatedAt:    timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  criadoPor:    int("criadoPor"),  // FK → crm_users.id
});

// Log de cada execução de automação
export const crmAutomacaoLogs = mysqlTable("crm_automacao_logs", {
  id:             int("id").autoincrement().primaryKey(),
  automacaoId:    int("automacaoId").notNull(),  // FK → crm_automacoes.id
  estado:         mysqlEnum("estado", ["sucesso", "erro", "pendente", "ignorado"]).notNull(),
  triggerEntidade: mysqlEnum("triggerEntidade", ["lead", "empresa", "contacto", "prospecting", "newsletter"]),
  triggerEntidadeId: int("triggerEntidadeId"),   // ID da entidade que despoletou
  triggerEntidadeNome: varchar("triggerEntidadeNome", { length: 255 }),
  acaoExecutada:  text("acaoExecutada"),          // Descrição do que foi feito
  erro:           text("erro"),                   // Mensagem de erro se falhou
  agendadoPara:   timestamp("agendadoPara"),       // Se tem delay, quando está agendado
  executadoEm:    timestamp("executadoEm"),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
});

// Fila de automações pendentes (com delay)
export const crmAutomacaoFila = mysqlTable("crm_automacao_fila", {
  id:             int("id").autoincrement().primaryKey(),
  automacaoId:    int("automacaoId").notNull(),
  estado:         mysqlEnum("estado", ["pendente", "processando", "concluido", "cancelado"]).default("pendente").notNull(),
  triggerEntidade: mysqlEnum("triggerEntidade", ["lead", "empresa", "contacto", "prospecting", "newsletter"]),
  triggerEntidadeId: int("triggerEntidadeId"),
  triggerEntidadeNome: varchar("triggerEntidadeNome", { length: 255 }),
  triggerPayload: json("triggerPayload"),          // Dados do contexto no momento do trigger
  agendadoPara:   timestamp("agendadoPara").notNull(),
  tentativas:     int("tentativas").default(0).notNull(),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
  updatedAt:      timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrmAutomacao = typeof crmAutomacoes.$inferSelect;
export type InsertCrmAutomacao = typeof crmAutomacoes.$inferInsert;
export type CrmAutomacaoLog = typeof crmAutomacaoLogs.$inferSelect;
export type CrmAutomacaoFilaItem = typeof crmAutomacaoFila.$inferSelect;

// ─── EQUIPA ───────────────────────────────────────────────────────────────────
export const equipa = mysqlTable("equipa", {
  id:             int("id").autoincrement().primaryKey(),
  nome:           varchar("nome", { length: 255 }).notNull(),
  area:           mysqlEnum("area", ["comercial", "psicologos", "marketing", "administrativo"]).notNull().default("comercial"),
  cargo:          varchar("cargo", { length: 255 }),
  email:          varchar("email", { length: 320 }),
  telefone:       varchar("telefone", { length: 50 }),
  linkedin:       varchar("linkedin", { length: 500 }),
  morada:         varchar("morada", { length: 500 }),
  idade:          int("idade"),
  fotoUrl:        varchar("fotoUrl", { length: 500 }),
  fotoKey:        varchar("fotoKey", { length: 500 }),
  tipoContrato:   mysqlEnum("tipoContrato", ["full_time", "part_time", "freelancer", "estagio", "avenca", "outro"]),
  ferias:         text("ferias"),          // JSON string com datas de férias
  notas:          text("notas"),
  ativo:          boolean("ativo").default(true).notNull(),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
  updatedAt:      timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EquipaMembro = typeof equipa.$inferSelect;
export type InsertEquipaMembro = typeof equipa.$inferInsert;

// ─── ACTIVIDADE COMERCIAL ─────────────────────────────────────────────────────
export const actividadeComercial = mysqlTable("actividade_comercial", {
  id:                  int("id").autoincrement().primaryKey(),
  data:                varchar("data", { length: 10 }).notNull(),          // "YYYY-MM-DD"
  comercialId:         int("comercialId"),                                  // FK equipa (futuro)
  comercialNome:       varchar("comercialNome", { length: 150 }).notNull(),
  leadsContactadas:    int("leadsContactadas").default(0).notNull(),
  reunioesAgendadas:   int("reunioesAgendadas").default(0).notNull(),
  reunioesRealizadas:  int("reunioesRealizadas").default(0).notNull(),
  propostasEnviadas:   int("propostasEnviadas").default(0).notNull(),
  contratosFechados:   int("contratosFechados").default(0).notNull(),
  notas:               text("notas"),
  createdAt:           timestamp("createdAt").defaultNow().notNull(),
  updatedAt:           timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ActividadeComercial = typeof actividadeComercial.$inferSelect;
export type InsertActividadeComercial = typeof actividadeComercial.$inferInsert;
