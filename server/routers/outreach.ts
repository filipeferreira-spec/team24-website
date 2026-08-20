import { eq, desc, and, or, like, count } from "drizzle-orm";
import { z } from "zod";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import {
  outreachSequencias,
  outreachEmails,
  outreachContactos,
  outreachCampanhas,
  outreachEnvios,
  outreachTracking,
} from "../../drizzle/schema";
import { boProtectedProcedure } from "./backoffice";

// ─── EMAIL via Odoo mail.mail (XML-RPC, mesmo padrão do odoo.ts) ─────────────
const ODOO_URL = process.env.ODOO_URL || "https://team24.thinkopen.solutions";
const ODOO_DB = process.env.ODOO_DB || "team24";
const ODOO_USER = process.env.ODOO_USER || "marketing@team24.pt";
const ODOO_API_KEY = process.env.ODOO_API_KEY || "";

let _uid: number | null = null;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function odooXmlRpc(endpoint: string, body: string): Promise<string> {
  const res = await fetch(`${ODOO_URL}/xmlrpc/2/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body,
  });
  if (!res.ok) throw new Error(`Odoo HTTP ${res.status}`);
  return res.text();
}

async function getOdooUid(): Promise<number> {
  if (_uid) return _uid;
  const xml = await odooXmlRpc("common", `<?xml version='1.0'?><methodCall><methodName>authenticate</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><string>${ODOO_USER}</string></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><struct/></value></param>
  </params></methodCall>`);
  const m = xml.match(/<int>(\d+)<\/int>/);
  if (!m) throw new Error("Odoo auth failed");
  _uid = parseInt(m[1]);
  return _uid;
}

// URL base do servidor para tracking (usa o domínio principal)
const BASE_URL = process.env.VITE_APP_ID
  ? "https://team24.pt"
  : "http://localhost:3000";

function injectTracking(html: string, envioId: number): string {
  // Substituir todos os href="https://..." por redirect de tracking
  const tracked = html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (_match, url: string) => {
      const encoded = Buffer.from(url).toString("base64");
      return `href="${BASE_URL}/api/track/click?e=${envioId}&u=${encoded}"`;
    }
  );
  // Adicionar pixel de abertura no final do body
  return tracked + `<img src="${BASE_URL}/api/track/open?e=${envioId}" width="1" height="1" style="display:none;" alt="" />`;
}

async function sendViaOdoo(opts: {
  to: string; toName: string; fromName: string; fromEmail: string;
  subject: string; body: string; empresa?: string; envioId?: number;
}): Promise<void> {
  const replace = (s: string) =>
    s.replace(/\{\{nome_contacto\}\}/g, opts.toName)
      .replace(/\{\{empresa\}\}/g, opts.empresa || opts.toName);

  const subject = replace(opts.subject);
  const bodyText = replace(opts.body);
  let bodyHtml = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#222;max-width:600px;">${
    bodyText.split("\n\n").map(p =>
      `<p>${p.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`
    ).join("")
  }</div>`;

  // Injectar tracking se houver envioId (não injectar em emails de teste)
  if (opts.envioId) {
    bodyHtml = injectTracking(bodyHtml, opts.envioId);
  }

  const uid = await getOdooUid();
  const createXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>mail.mail</string></value></param>
    <param><value><string>create</string></value></param>
    <param><value><array><data><value><struct>
      <member><name>subject</name><value><string>${escapeXml(subject)}</string></value></member>
      <member><name>email_from</name><value><string>${escapeXml(opts.fromName)} &lt;${escapeXml(opts.fromEmail)}&gt;</string></value></member>
      <member><name>email_to</name><value><string>${escapeXml(opts.toName)} &lt;${escapeXml(opts.to)}&gt;</string></value></member>
      <member><name>body_html</name><value><string>${escapeXml(bodyHtml)}</string></value></member>
      <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
    </struct></value></data></array></value></param>
    <param><value><struct/></value></param>
  </params></methodCall>`);

  const mId = createXml.match(/<int>(\d+)<\/int>/)?.[1];
  if (!mId) throw new Error("Odoo create mail.mail failed");

  await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
    <param><value><string>${ODOO_DB}</string></value></param>
    <param><value><int>${uid}</int></value></param>
    <param><value><string>${ODOO_API_KEY}</string></value></param>
    <param><value><string>mail.mail</string></value></param>
    <param><value><string>send</string></value></param>
    <param><value><array><data><value><array><data><value><int>${mId}</int></value></data></array></value></data></array></value></param>
    <param><value><struct/></value></param>
  </params></methodCall>`);
}

// ─── CONTEÚDO PADRÃO DAS SEQUÊNCIAS ─────────────────────────────────────────
const EMAIL_GERAL = [
  { ordem: 1, diaCadencia: 0, assunto: "Vale um dia de férias", corpo: `Olá {{nome_contacto}},

Imagine que hoje podia oferecer um dia de férias a todos os colaboradores da {{empresa}}.

Seria, sem dúvida, bem recebido. Mas seria suficiente?

Um dia de descanso pode aliviar o cansaço imediato. Pode dar uma pausa. Pode criar um momento positivo.

Mas se, quando a pessoa regressa, encontra a mesma pressão, os mesmos conflitos, a mesma falta de segurança psicológica, a mesma dificuldade em pedir ajuda e a mesma sensação de desgaste, o problema continua lá. É aqui que muitas empresas falham na retenção.

Tentam compensar o desgaste com benefícios isolados, quando aquilo que as pessoas procuram é algo mais profundo: **confiança**, **equilíbrio**, **liderança saudável**, **apoio real** e uma cultura onde seja possível trabalhar sem se perder pelo caminho.

Na TEAM24 ajudamos empresas a passar de acções pontuais para uma estratégia estruturada de saúde mental, prevenção de riscos psicossociais e retenção de talento.

Cada equipa precisa de respostas diferentes.
Talvez a {{empresa}} já tenha benefícios.
Talvez já tenha iniciativas de bem-estar.
Talvez já fale de saúde mental.

A pergunta é outra:
**A saúde mental já faz parte da estratégia de retenção da {{empresa}}?**

Se fizer sentido, gostaríamos de lhe oferecer uma conversa de 5 minutos para perceber onde a {{empresa}} está hoje e que acções poderiam gerar impacto real nas suas equipas.

Filipe Ferreira
TEAM24
Tel: 926 941 137

Agende aqui uma conversa breve: https://team24.pt/agendar` },
  { ordem: 2, diaCadencia: 4, assunto: "Re: Vale um dia de férias", corpo: `Olá {{nome_contacto}},

Enviei-lhe um email há alguns dias com uma reflexão sobre benefícios e retenção de talento.

Não sei se chegou a ler. Por isso deixo apenas uma pergunta:

**Nos últimos 12 meses, houve na {{empresa}} algum sinal de alerta — absentismo, baixas prolongadas, conflitos internos, dificuldade em reter pessoas?**

Se sim, provavelmente já sabe que um benefício isolado não resolve. O que resolve é perceber o que está por baixo.

É exactamente isso que fazemos na TEAM24. Começamos sempre por medir, antes de propor qualquer solução.

Teria 5 minutos para uma conversa rápida?

Escolha um horário aqui: https://team24.pt/agendar

Filipe Ferreira
TEAM24 | 926 941 137` },
  { ordem: 3, diaCadencia: 9, assunto: "O que encontrámos quando medimos", corpo: `Olá {{nome_contacto}},

Deixe-me partilhar o que acontece quando uma empresa decide parar de adivinhar e começa a medir.

Quando a equipa de RH do Grupo Salvador Caetano nos contactou, tinham a sensação de que algo não estava bem. As iniciativas de bem-estar existiam, as pessoas não se queixavam abertamente, mas o absentismo subia e a rotatividade também.

Aplicámos a nossa Avaliação de Riscos Psicossociais. Um diagnóstico estruturado que mede, por departamento, os factores que afectam o bem-estar, a motivação e o desempenho. O relatório revelou três padrões que a gestão desconhecia completamente: sobrecarga crónica numa área específica, falta de apoio da liderança de proximidade e ausência de canais seguros para pedir ajuda.

Com esse mapa, implementámos um programa à medida. Ao fim de 12 meses: **redução de 23% no absentismo** e uma melhoria significativa nos índices de satisfação interna.

Não sei se a {{empresa}} tem os mesmos padrões. Provavelmente tem os seus próprios. Mas sem medir, é impossível saber.

Se quiser perceber como este diagnóstico funciona e o que poderia revelar na {{empresa}}, estou disponível para uma conversa de 5 minutos.

Agendar aqui: https://team24.pt/agendar

Filipe Ferreira
TEAM24 | 926 941 137

P.S. Posso enviar o relatório de ROI que mostra o retorno financeiro médio de um programa de saúde mental empresarial. Basta responder a este email.` },
  { ordem: 4, diaCadencia: 16, assunto: "Fecho este assunto, mas deixo uma porta aberta", corpo: `Olá {{nome_contacto}},

Escrevi-lhe algumas vezes nas últimas semanas. Como não obtive resposta, assumo que não é o momento certo para a {{empresa}} e respeito isso completamente.

Não voltarei a contactar.

Mas deixo uma nota final, porque acho que é honesta:

Os problemas de saúde mental nas equipas raramente desaparecem sozinhos. Tendem a crescer silenciosamente, até que se tornam urgentes. E quando se tornam urgentes, custam muito mais a resolver do que se tivessem sido abordados cedo.

Se daqui a uns meses a situação mudar, ou se surgir um momento em que faça sentido conversar, estamos aqui.

Pode sempre agendar em https://team24.pt/agendar, sem pressão, sem compromisso.

Foi um prazer tentar chegar até si.

Filipe Ferreira
TEAM24 — EAP Portugal
filipe.ferreira@team24.pt | 926 941 137
https://team24.pt` },
];

const EMAIL_NP4552 = [
  { ordem: 1, diaCadencia: 0, assunto: "Vale um dia de férias", corpo: `Olá {{nome_contacto}},

Imagine que hoje podia oferecer um dia de férias a todos os colaboradores da {{empresa}}.

Seria bem recebido, claro. Mas a {{empresa}} já percebeu há muito que as pessoas precisam de mais do que isso. A certificação NP4552 que conquistaram é prova disso.

O que me traz até si é uma pergunta diferente.

Tenho falado com muitas organizações que, como a {{empresa}}, fizeram esse caminho de formalizar o compromisso com o bem-estar. E o que ouço com frequência é isto: "sabemos que estamos a fazer coisas certas, mas não conseguimos ver o impacto nos números."

Absentismo que não baixa como esperavam. Pessoas que saem mesmo assim. Lideranças que continuam sobrecarregadas. Não por falta de vontade, mas porque a certificação resolve a estrutura, não necessariamente o que está por baixo.

Na TEAM24 trabalhamos exactamente nessa camada. Começamos sempre por perceber o que os dados dizem sobre o estado real das equipas, antes de propor seja o que for.

Não sei se faz sentido para a {{empresa}} neste momento. Mas se fizer, teria gosto em ter uma conversa de 5 minutos.

Filipe Ferreira
TEAM24
Tel: 926 941 137

Agende aqui: https://team24.pt/agendar` },
  { ordem: 2, diaCadencia: 4, assunto: "Re: Vale um dia de férias", corpo: `Olá {{nome_contacto}},

Escrevi-lhe há uns dias. Não sei se teve oportunidade de ler, por isso vou ser breve.

Há uma coisa que me ficou na cabeça depois de enviar o email anterior.

A {{empresa}} tem a NP4552. Isso não é pouco, é mesmo raro em Portugal. Mas a certificação mede processos. O que raramente fica medido é o que as pessoas sentem no dia a dia, o que as faz ficar ou ir embora, o que as faz pedir baixa ou aguentar em silêncio.

A pergunta que deixo é simples: desde que obtiveram a certificação NP4552, conseguem ver diferença nos números de absentismo, rotatividade ou bem-estar declarado?

Se sim, adorava perceber como chegaram lá.

Se não, talvez valha a pena conversar.

Escolha um horário aqui: https://team24.pt/agendar

Filipe Ferreira
TEAM24 | 926 941 137` },
  { ordem: 3, diaCadencia: 9, assunto: "O que encontrámos quando medimos", corpo: `Olá {{nome_contacto}},

Deixe-me contar-lhe o que aconteceu com uma empresa que, tal como a {{empresa}}, já tinha o compromisso com o bem-estar bem estabelecido.

O Grupo Salvador Caetano tinha iniciativas, tinha cultura, tinha intenção. Mas o absentismo continuava a subir. A equipa de RH sabia que algo não estava bem, só não sabia o quê.

Quando nos pediram ajuda, não começámos por propor um programa. Começámos por medir. Aplicámos um diagnóstico de riscos psicossociais que analisa, departamento a departamento, o que está a afectar as pessoas. O que encontrámos surpreendeu a própria gestão: sobrecarga crónica numa área que ninguém tinha identificado, chefias de proximidade sem ferramentas para apoiar as equipas, e uma cultura onde pedir ajuda ainda era visto como fraqueza.

Com esse mapa, trabalhámos em conjunto durante 12 meses. O resultado foi uma redução de 23% no absentismo.

Não sei o que encontraríamos na {{empresa}}. Provavelmente algo diferente. Mas sem medir, é impossível saber.

Se quiser perceber como funciona este diagnóstico, estou disponível para uma conversa curta.

Agendar aqui: https://team24.pt/agendar

Filipe Ferreira
TEAM24 | 926 941 137

P.S. Posso enviar o relatório de ROI com o retorno financeiro médio deste tipo de programa. Basta responder a este email.` },
  { ordem: 4, diaCadencia: 16, assunto: "Fecho este assunto, mas deixo uma porta aberta", corpo: `Olá {{nome_contacto}},

Escrevi-lhe três vezes nas últimas semanas. Como não recebi resposta, parto do princípio que não é o momento certo, e respeito isso.

Não voltarei a contactar.

Só queria deixar uma última nota, porque acho que é honesta.

Organizações que chegaram à NP4552 fizeram um percurso que a maioria ainda não começou. Têm algo que é difícil de construir: a decisão de levar o bem-estar a sério. O que por vezes falta é alguém de fora que ajude a perceber se o que está a ser feito está realmente a chegar às pessoas.

Se daqui a uns meses o contexto mudar e fizer sentido conversar, estamos aqui.

Pode agendar quando quiser em https://team24.pt/agendar.

Obrigado pelo tempo.

Filipe Ferreira
TEAM24 — EAP Portugal
filipe.ferreira@team24.pt | 926 941 137
https://team24.pt` },
];

// ─── ROUTER ──────────────────────────────────────────────────────────────────
export const outreachRouter = router({

  // ── SEQUÊNCIAS ──────────────────────────────────────────────────────────────
  sequencias: router({
    list: boProtectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const seqs = await db.select().from(outreachSequencias).orderBy(desc(outreachSequencias.createdAt));
      return Promise.all(seqs.map(async (s) => {
        const emails = await db!.select({ id: outreachEmails.id }).from(outreachEmails).where(eq(outreachEmails.sequenciaId, s.id));
        return { ...s, emailCount: emails.length };
      }));
    }),

    get: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const [seq] = await db.select().from(outreachSequencias).where(eq(outreachSequencias.id, input.id));
        if (!seq) throw new Error("Sequência não encontrada");
        const emails = await db.select().from(outreachEmails).where(eq(outreachEmails.sequenciaId, input.id)).orderBy(outreachEmails.ordem);
        return { ...seq, emails };
      }),

    create: boProtectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        descricao: z.string().optional(),
        segmento: z.enum(["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste"]).default("geral"),
        emails: z.array(z.object({ ordem: z.number(), diaCadencia: z.number(), assunto: z.string().min(1), corpo: z.string().min(1) })),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const [r] = await db.insert(outreachSequencias).values({ nome: input.nome, descricao: input.descricao, segmento: input.segmento as any });
        const seqId = (r as any).insertId as number;
        if (input.emails.length > 0) {
          await db.insert(outreachEmails).values(input.emails.map((e) => ({ ...e, sequenciaId: seqId })));
        }
        return { id: seqId };
      }),

    update: boProtectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1),
        descricao: z.string().optional(),
        segmento: z.enum(["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste"]),
        emails: z.array(z.object({ ordem: z.number(), diaCadencia: z.number(), assunto: z.string().min(1), corpo: z.string().min(1) })),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        await db.update(outreachSequencias).set({ nome: input.nome, descricao: input.descricao, segmento: input.segmento as any }).where(eq(outreachSequencias.id, input.id));
        await db.delete(outreachEmails).where(eq(outreachEmails.sequenciaId, input.id));
        if (input.emails.length > 0) {
          await db.insert(outreachEmails).values(input.emails.map((e) => ({ ...e, sequenciaId: input.id })));
        }
        return { ok: true };
      }),

    delete: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        await db.delete(outreachEmails).where(eq(outreachEmails.sequenciaId, input.id));
        await db.delete(outreachSequencias).where(eq(outreachSequencias.id, input.id));
        return { ok: true };
      }),

    seedDefaults: boProtectedProcedure.mutation(async () => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const existing = await db.select({ id: outreachSequencias.id }).from(outreachSequencias);
      if (existing.length > 0) return { ok: true, message: "Sequências já existem" };

      const [r1] = await db.insert(outreachSequencias).values({ nome: "Sequência Geral — Vale um Dia de Férias", descricao: "Abordagem narrativa para empresas sem certificação específica", segmento: "geral" });
      const id1 = (r1 as any).insertId as number;
      await db.insert(outreachEmails).values(EMAIL_GERAL.map((e) => ({ ...e, sequenciaId: id1 })));

      const [r2] = await db.insert(outreachSequencias).values({ nome: "Sequência NP4552 — Certificação Saúde Mental", descricao: "Adaptada para empresas com certificação NP4552:2022", segmento: "np4552" });
      const id2 = (r2 as any).insertId as number;
      await db.insert(outreachEmails).values(EMAIL_NP4552.map((e) => ({ ...e, sequenciaId: id2 })));

      return { ok: true, message: "2 sequências criadas com sucesso" };
    }),
  }),

  // ── CONTACTOS ───────────────────────────────────────────────────────────────
  contactos: router({
    list: boProtectedProcedure
      .input(z.object({
        segmento: z.enum(["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste", "todos"]).default("todos"),
        page: z.number().default(1),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const limit = 50;
        const offset = (input.page - 1) * limit;
        const conditions = [];
        if (input.segmento !== "todos") {
          conditions.push(eq(outreachContactos.segmento, input.segmento as any));
        }
        if (input.search && input.search.trim()) {
          const q = `%${input.search.trim()}%`;
          conditions.push(or(
            like(outreachContactos.nome, q),
            like(outreachContactos.email, q),
            like(outreachContactos.empresa, q),
          ));
        }
        const where = conditions.length > 0 ? and(...conditions) : undefined;
        const [items, totals] = await Promise.all([
          db.select().from(outreachContactos).where(where).orderBy(desc(outreachContactos.createdAt)).limit(limit).offset(offset),
          db.select({ total: count() }).from(outreachContactos).where(where),
        ]);
        return { items, total: totals[0]?.total ?? 0, pages: Math.ceil((totals[0]?.total ?? 0) / limit) };
      }),

    create: boProtectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        email: z.string().email(),
        empresa: z.string().optional(),
        cargo: z.string().optional(),
        segmento: z.enum(["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste"]).default("geral"),
        odooPartnerId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const [r] = await db.insert(outreachContactos).values(input as any);
        return { id: (r as any).insertId };
      }),

    importFromOdoo: boProtectedProcedure
      .input(z.object({ segmento: z.enum(["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste"]) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const uid = await getOdooUid();

        const domain = input.segmento === "np4552"
          ? `<value><array><data>
              <value><array><data><value><string>category_id</string></value><value><string>in</string></value><value><array><data><value><int>31</int></value></data></array></value></data></array></value>
              <value><array><data><value><string>email</string></value><value><string>!=</string></value><value><boolean>0</boolean></value></data></array></value>
              <value><array><data><value><string>is_company</string></value><value><string>=</string></value><value><boolean>1</boolean></value></data></array></value>
            </data></array></value>`
          : `<value><array><data>
              <value><array><data><value><string>email</string></value><value><string>!=</string></value><value><boolean>0</boolean></value></data></array></value>
              <value><array><data><value><string>is_company</string></value><value><string>=</string></value><value><boolean>1</boolean></value></data></array></value>
              <value><array><data><value><string>customer_rank</string></value><value><string>&gt;</string></value><value><int>0</int></value></data></array></value>
            </data></array></value>`;

        const searchXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
          <param><value><string>${ODOO_DB}</string></value></param>
          <param><value><int>${uid}</int></value></param>
          <param><value><string>${ODOO_API_KEY}</string></value></param>
          <param><value><string>res.partner</string></value></param>
          <param><value><string>search</string></value></param>
          <param><value><array><data>${domain}</data></array></value></param>
          <param><value><struct><member><name>limit</name><value><int>500</int></value></member></struct></value></param>
        </params></methodCall>`);

        const idMatches = Array.from(searchXml.matchAll(/<int>(\d+)<\/int>/g));
        const partnerIds = idMatches.map((m) => parseInt(m[1])).filter((id) => id > 0);
        if (!partnerIds.length) return { importados: 0 };

        const idsXml = partnerIds.map((id) => `<value><int>${id}</int></value>`).join("");
        const readXml = await odooXmlRpc("object", `<?xml version='1.0'?><methodCall><methodName>execute_kw</methodName><params>
          <param><value><string>${ODOO_DB}</string></value></param>
          <param><value><int>${uid}</int></value></param>
          <param><value><string>${ODOO_API_KEY}</string></value></param>
          <param><value><string>res.partner</string></value></param>
          <param><value><string>read</string></value></param>
          <param><value><array><data><value><array><data>${idsXml}</data></array></value></data></array></value></param>
          <param><value><struct><member><name>fields</name><value><array><data>
            <value><string>name</string></value>
            <value><string>email</string></value>
            <value><string>function</string></value>
            <value><string>id</string></value>
          </data></array></value></member></struct></value></param>
        </params></methodCall>`);

        // Parse simples: extrair pares name/email/id dos membros
        const nameMatches = Array.from(readXml.matchAll(/<name>name<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
        const emailMatches = Array.from(readXml.matchAll(/<name>email<\/name>\s*<value><string>(.*?)<\/string><\/value>/g));
        const idMatchesParsed = Array.from(readXml.matchAll(/<name>id<\/name>\s*<value><int>(\d+)<\/int><\/value>/g));

        let importados = 0;
        for (let i = 0; i < Math.min(nameMatches.length, emailMatches.length); i++) {
          const nome = nameMatches[i]?.[1] || "";
          const email = emailMatches[i]?.[1] || "";
          const odooId = parseInt(idMatchesParsed[i]?.[1] || "0");
          if (!email || !nome) continue;

          const [existing] = await db.select({ id: outreachContactos.id }).from(outreachContactos).where(eq(outreachContactos.email, email));
          if (existing) continue;

          await db.insert(outreachContactos).values({ nome, email, empresa: nome, segmento: input.segmento as any, odooPartnerId: odooId || undefined });
          importados++;
        }
        return { importados };
      }),

    delete: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        await db.delete(outreachContactos).where(eq(outreachContactos.id, input.id));
        return { ok: true };
      }),

    descartar: boProtectedProcedure
      .input(z.object({ id: z.number(), motivo: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        await db.update(outreachContactos).set({ descartado: true, motivoDescarte: input.motivo }).where(eq(outreachContactos.id, input.id));
        return { ok: true };
      }),

    statsColaboradores: boProtectedProcedure
      .input(z.object({
        segmento: z.enum(["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste", "todos"]).default("todos"),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const where = input.segmento !== "todos" ? eq(outreachContactos.segmento, input.segmento as any) : undefined;
        const contactos = await db.select({ numColaboradores: outreachContactos.numColaboradores }).from(outreachContactos).where(where);
        // Escalões: 1-10, 11-50, 51-100, 101-250, 251-500, 501-1000, 1000+, Sem dados
        const escaloes = [
          { label: "1-10",    min: 1,    max: 10 },
          { label: "11-50",   min: 11,   max: 50 },
          { label: "51-100",  min: 51,   max: 100 },
          { label: "101-250", min: 101,  max: 250 },
          { label: "251-500", min: 251,  max: 500 },
          { label: "501-1000",min: 501,  max: 1000 },
          { label: "1000+",   min: 1001, max: Infinity },
        ];
        const counts: Record<string, number> = {};
        let semDados = 0;
        for (const c of contactos) {
          const n = c.numColaboradores;
          if (!n || n <= 0) { semDados++; continue; }
          const escalao = escaloes.find(e => n >= e.min && n <= e.max);
          if (escalao) counts[escalao.label] = (counts[escalao.label] || 0) + 1;
        }
        const data = escaloes.map(e => ({ label: e.label, total: counts[e.label] || 0 }));
        return { data, semDados, total: contactos.length };
      }),
  }),

  // ── CAMPANHAS ───────────────────────────────────────────────────────────────
  campanhas: router({
    list: boProtectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const campanhas = await db.select().from(outreachCampanhas).orderBy(desc(outreachCampanhas.createdAt));
      return Promise.all(campanhas.map(async (c) => {
        const envios = await db!.select({ estado: outreachEnvios.estado }).from(outreachEnvios).where(eq(outreachEnvios.campanhaId, c.id));
        return {
          ...c,
          metricas: {
            total: envios.length,
            enviados: envios.filter((e) => e.estado === "enviado").length,
            erros: envios.filter((e) => e.estado === "erro").length,
            respondidos: envios.filter((e) => e.estado === "respondido").length,
          },
        };
      }));
    }),

    create: boProtectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        sequenciaId: z.number(),
        segmento: z.enum(["geral", "np4552", "outro", "clientes", "em_tratamento", "reuniao_agendada", "proposta_enviada", "proposta_adjudicada", "won", "renovacoes_pendente", "contratos_renovados", "contratos_terminados", "servicos_isolados", "perdido", "teste"]),
        remetentNome: z.string().default("Filipe Ferreira"),
        remetentEmail: z.string().email().default("marketing@team24.pt"),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const [totals] = await db.select({ total: count() }).from(outreachContactos).where(
          and(eq(outreachContactos.segmento, input.segmento as any), eq(outreachContactos.ativo, true), eq(outreachContactos.descartado, false))
        );
        const { totalContactos: _tc, ...inputWithoutTotal } = input as any;
        const [r] = await db.insert(outreachCampanhas).values({ ...inputWithoutTotal, totalContactos: totals?.total ?? 0 } as any);
        return { id: (r as any).insertId };
      }),

    updateNome: boProtectedProcedure
      .input(z.object({ id: z.number(), nome: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        await db.update(outreachCampanhas).set({ nome: input.nome }).where(eq(outreachCampanhas.id, input.id));
        return { ok: true };
      }),

    delete: boProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        await db.delete(outreachEnvios).where(eq(outreachEnvios.campanhaId, input.id));
        await db.delete(outreachCampanhas).where(eq(outreachCampanhas.id, input.id));
        return { ok: true };
      }),

    preview: boProtectedProcedure
      .input(z.object({ campanhaId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const [campanha] = await db.select().from(outreachCampanhas).where(eq(outreachCampanhas.id, input.campanhaId));
        if (!campanha) throw new Error("Campanha não encontrada");
        const [seq] = await db.select().from(outreachSequencias).where(eq(outreachSequencias.id, campanha.sequenciaId));
        const emails = await db.select().from(outreachEmails).where(eq(outreachEmails.sequenciaId, campanha.sequenciaId)).orderBy(outreachEmails.ordem);
        const contactos = await db.select().from(outreachContactos).where(
          and(eq(outreachContactos.segmento, campanha.segmento), eq(outreachContactos.ativo, true), eq(outreachContactos.descartado, false))
        );
        return { campanha, sequencia: seq, emails, totalContactos: contactos.length, amostra: contactos.slice(0, 5) };
      }),

    sendTest: boProtectedProcedure
      .input(z.object({
        campanhaId: z.number(),
        emailOrdem: z.number().default(1),
        testEmail: z.string().email(),
        testNome: z.string(),
        testEmpresa: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const [campanha] = await db.select().from(outreachCampanhas).where(eq(outreachCampanhas.id, input.campanhaId));
        if (!campanha) throw new Error("Campanha não encontrada");
        const [email] = await db.select().from(outreachEmails).where(
          and(eq(outreachEmails.sequenciaId, campanha.sequenciaId), eq(outreachEmails.ordem, input.emailOrdem))
        );
        if (!email) throw new Error("Email não encontrado");
        await sendViaOdoo({
          to: input.testEmail, toName: input.testNome,
          fromName: campanha.remetentNome, fromEmail: campanha.remetentEmail,
          subject: `[TESTE] ${email.assunto}`, body: email.corpo,
          empresa: input.testEmpresa || input.testNome,
        });
        return { ok: true };
      }),

    launch: boProtectedProcedure
      .input(z.object({ campanhaId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const [campanha] = await db.select().from(outreachCampanhas).where(eq(outreachCampanhas.id, input.campanhaId));
        if (!campanha) throw new Error("Campanha não encontrada");
        if (campanha.estado === "ativa") throw new Error("Campanha já está activa");

        const [email1] = await db.select().from(outreachEmails).where(
          and(eq(outreachEmails.sequenciaId, campanha.sequenciaId), eq(outreachEmails.ordem, 1))
        );
        if (!email1) throw new Error("Email 1 não encontrado na sequência");

        const contactos = await db.select().from(outreachContactos).where(
          and(eq(outreachContactos.segmento, campanha.segmento), eq(outreachContactos.ativo, true), eq(outreachContactos.descartado, false))
        );

        await db.update(outreachCampanhas).set({ estado: "ativa", lancadaAt: new Date(), totalContactos: contactos.length }).where(eq(outreachCampanhas.id, input.campanhaId));

        let enviados = 0; let erros = 0; const errosList: string[] = [];
        for (const contacto of contactos) {
          if (!contacto.email) {
            erros++;
            errosList.push(`${contacto.nome}: sem email`);
            await db.insert(outreachEnvios).values({ campanhaId: input.campanhaId, contactoId: contacto.id, emailId: email1.id, estado: "erro", erroMsg: "Sem email" });
            continue;
          }
          // Criar registo de envio primeiro para obter o ID (necessário para tracking)
          const [envioRow] = await db.insert(outreachEnvios).values({ campanhaId: input.campanhaId, contactoId: contacto.id, emailId: email1.id, estado: "pendente", enviadoAt: new Date() }).$returningId();
          const envioId = envioRow?.id;
          try {
            await sendViaOdoo({
              to: contacto.email, toName: contacto.nome,
              fromName: campanha.remetentNome, fromEmail: campanha.remetentEmail,
              subject: email1.assunto, body: email1.corpo,
              empresa: contacto.empresa || contacto.nome,
              envioId,
            });
            if (envioId) await db.update(outreachEnvios).set({ estado: "enviado" }).where(eq(outreachEnvios.id, envioId));
            enviados++;
          } catch (e: any) {
            erros++;
            errosList.push(`${contacto.email}: ${e.message}`);
            if (envioId) await db.update(outreachEnvios).set({ estado: "erro", erroMsg: e.message?.slice(0, 499) }).where(eq(outreachEnvios.id, envioId));
          }
        }
        return { enviados, erros, errosList: errosList.slice(0, 10) };
      }),

    metricas: boProtectedProcedure
      .input(z.object({ campanhaId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const [campanha] = await db.select().from(outreachCampanhas).where(eq(outreachCampanhas.id, input.campanhaId));
        if (!campanha) throw new Error("Campanha não encontrada");
        const envios = await db.select().from(outreachEnvios).where(eq(outreachEnvios.campanhaId, input.campanhaId));
        const emails = await db.select().from(outreachEmails).where(eq(outreachEmails.sequenciaId, campanha.sequenciaId)).orderBy(outreachEmails.ordem);
        const tracking = await db.select().from(outreachTracking).where(eq(outreachTracking.campanhaId, input.campanhaId));

        // Contagens globais de tracking (unique por envioId)
        const uniqueAberturas = new Set(tracking.filter(t => t.tipo === "abertura").map(t => t.envioId)).size;
        const uniqueCliques = new Set(tracking.filter(t => t.tipo === "clique").map(t => t.envioId)).size;
        const totalAberturas = tracking.filter(t => t.tipo === "abertura").length;
        const totalCliques = tracking.filter(t => t.tipo === "clique").length;

        // URLs mais clicadas
        const urlCounts: Record<string, number> = {};
        tracking.filter(t => t.tipo === "clique" && t.url).forEach(t => {
          urlCounts[t.url!] = (urlCounts[t.url!] || 0) + 1;
        });
        const topUrls = Object.entries(urlCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([url, clicks]) => ({ url, clicks }));

        // Eventos ao longo do tempo (por dia)
        const eventsByDay: Record<string, { aberturas: number; cliques: number }> = {};
        tracking.forEach(t => {
          const day = t.createdAt.toISOString().split("T")[0];
          if (!eventsByDay[day]) eventsByDay[day] = { aberturas: 0, cliques: 0 };
          if (t.tipo === "abertura") eventsByDay[day].aberturas++;
          if (t.tipo === "clique") eventsByDay[day].cliques++;
        });
        const timeline = Object.entries(eventsByDay).sort((a, b) => a[0].localeCompare(b[0])).map(([date, counts]) => ({ date, ...counts }));

        const porEmail = emails.map((email) => {
          const ev = envios.filter((e) => e.emailId === email.id);
          const tk = tracking.filter((t) => t.emailId === email.id);
          const abertasUniq = new Set(tk.filter(t => t.tipo === "abertura").map(t => t.envioId)).size;
          const cliquesUniq = new Set(tk.filter(t => t.tipo === "clique").map(t => t.envioId)).size;
          const total = ev.length;
          return {
            email,
            total,
            enviados: ev.filter((e) => ["enviado","aberto","clicado","respondido"].includes(e.estado)).length,
            erros: ev.filter((e) => e.estado === "erro").length,
            aberturas: abertasUniq,
            cliques: cliquesUniq,
            respondidos: ev.filter((e) => e.estado === "respondido").length,
            taxaAbertura: total > 0 ? Math.round((abertasUniq / total) * 100) : 0,
            taxaClique: total > 0 ? Math.round((cliquesUniq / total) * 100) : 0,
          };
        });

        // Buscar dados dos contactos para a tabela individual
        const contactoIds = Array.from(new Set(envios.map(e => e.contactoId)));
        const contactos = contactoIds.length > 0
          ? await db.select().from(outreachContactos).where(
              contactoIds.length === 1
                ? eq(outreachContactos.id, contactoIds[0])
                : require("drizzle-orm").inArray(outreachContactos.id, contactoIds)
            )
          : [];
        const contactoMap = Object.fromEntries(contactos.map(c => [c.id, c]));

        // Tabela individual: por contacto, quais emails abriu/clicou
        const porContacto = envios
          .filter(e => ["enviado","aberto","clicado","respondido"].includes(e.estado))
          .map(envio => {
            const contacto = contactoMap[envio.contactoId];
            const tk = tracking.filter(t => t.envioId === envio.id);
            const abriu = tk.some(t => t.tipo === "abertura");
            const clicou = tk.some(t => t.tipo === "clique");
            const urlsClicadas = Array.from(new Set(tk.filter(t => t.tipo === "clique" && t.url).map(t => t.url!)));
            const primeiraAbertura = tk.filter(t => t.tipo === "abertura").sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime())[0]?.createdAt ?? null;
            const primeiroClique = tk.filter(t => t.tipo === "clique").sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime())[0]?.createdAt ?? null;
            const emailInfo = emails.find(em => em.id === envio.emailId);
            return {
              contactoId: envio.contactoId,
              nome: contacto?.nome ?? "—",
              email: contacto?.email ?? "—",
              empresa: contacto?.empresa ?? "—",
              emailOrdem: emailInfo?.ordem ?? 0,
              emailAssunto: emailInfo?.assunto ?? "—",
              abriu,
              clicou,
              respondeu: envio.estado === "respondido",
              urlsClicadas,
              primeiraAbertura,
              primeiroClique,
              enviadoAt: envio.enviadoAt,
            };
          })
          .sort((a, b) => {
            // Ordenar: respondeu > clicou > abriu > só enviado
            const score = (r: typeof a) => (r.respondeu ? 3 : r.clicou ? 2 : r.abriu ? 1 : 0);
            return score(b) - score(a);
          });

        const totalEnviados = envios.filter((e) => ["enviado","aberto","clicado","respondido"].includes(e.estado)).length;
        return {
          campanha,
          totalEnvios: envios.length,
          totalEnviados,
          totalErros: envios.filter((e) => e.estado === "erro").length,
          totalRespondidos: envios.filter((e) => e.estado === "respondido").length,
          uniqueAberturas,
          uniqueCliques,
          totalAberturas,
          totalCliques,
          taxaAbertura: totalEnviados > 0 ? Math.round((uniqueAberturas / totalEnviados) * 100) : 0,
          taxaClique: totalEnviados > 0 ? Math.round((uniqueCliques / totalEnviados) * 100) : 0,
          topUrls,
          timeline,
          porEmail,
          porContacto,
        };
      }),

    marcarResposta: boProtectedProcedure
      .input(z.object({ campanhaId: z.number(), contactoId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        await db.update(outreachEnvios).set({ estado: "respondido" }).where(
          and(eq(outreachEnvios.campanhaId, input.campanhaId), eq(outreachEnvios.contactoId, input.contactoId))
        );
        return { ok: true };
      }),
  }),
});
