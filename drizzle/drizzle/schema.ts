import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
