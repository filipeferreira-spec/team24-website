/*
 * TEAM 24 — Página Academia TEAM 24
 * Conteúdos e recursos para estudantes universitários e profissionais de RH.
 * Design editorial consistente com o resto do site.
 */
import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, breadcrumbLD, faqLD } from "@/components/SEO";

// ─── DADOS ────────────────────────────────────────────────────────────────────

const AUDIENCIAS = [
  {
    id: "estudantes",
    label: "Estudantes Universitários",
    descricao: "Recursos práticos para gerir o stress académico, preparar a entrada no mercado de trabalho e desenvolver competências de saúde mental.",
  },
  {
    id: "rh",
    label: "Profissionais de RH",
    descricao: "Ferramentas, guias e formação para implementar programas de bem-estar nas organizações e liderar com empatia.",
  },
];

const MODULOS_ESTUDANTES = [
  {
    numero: "01",
    titulo: "Saúde Mental na Universidade",
    descricao: "Como reconhecer e gerir ansiedade, burnout académico e pressão dos exames. Estratégias baseadas em evidência para estudantes.",
    temas: ["Ansiedade académica", "Burnout estudantil", "Gestão do tempo", "Sono e desempenho"],
    tipo: "Guia Gratuito",
    duracao: "15 min de leitura",
  },
  {
    numero: "02",
    titulo: "Inteligência Emocional para a Carreira",
    descricao: "Desenvolve as competências emocionais que os empregadores mais valorizam: autoconhecimento, empatia, gestão do stress e comunicação assertiva.",
    temas: ["Autoconhecimento", "Regulação emocional", "Empatia no trabalho", "Comunicação assertiva"],
    tipo: "Curso Online",
    duracao: "3 horas",
  },
  {
    numero: "03",
    titulo: "Da Universidade ao Mercado de Trabalho",
    descricao: "A transição para o primeiro emprego é um dos momentos mais stressantes da vida jovem. Este módulo prepara-te para essa mudança com ferramentas práticas.",
    temas: ["Síndrome do impostor", "Primeiros 90 dias", "Relações no trabalho", "Gestão de expectativas"],
    tipo: "Workshop",
    duracao: "2 horas",
  },
  {
    numero: "04",
    titulo: "Mindfulness para Estudantes",
    descricao: "Técnicas simples e práticas de mindfulness adaptadas à vida universitária: antes dos exames, durante períodos de pressão e no dia a dia.",
    temas: ["Respiração consciente", "Meditação rápida", "Foco e concentração", "Gestão da procrastinação"],
    tipo: "Programa",
    duracao: "4 semanas",
  },
];

const MODULOS_RH = [
  {
    numero: "01",
    titulo: "Fundamentos do EAP",
    descricao: "O que é um Employee Assistance Program, como funciona, como medir o ROI e como apresentar o business case à liderança.",
    temas: ["O que é um EAP", "ROI e métricas", "Business case", "Implementação"],
    tipo: "Guia Executivo",
    duracao: "20 min de leitura",
  },
  {
    numero: "02",
    titulo: "Como Identificar Burnout nas Equipas",
    descricao: "Ferramentas de diagnóstico, sinais precoces e protocolos de intervenção para gestores e profissionais de RH que querem agir antes que seja tarde.",
    temas: ["Sinais de alerta", "Diagnóstico organizacional", "Protocolos de intervenção", "Comunicação com gestores"],
    tipo: "Kit Prático",
    duracao: "30 min",
  },
  {
    numero: "03",
    titulo: "Cultura de Segurança Psicológica",
    descricao: "Como construir uma cultura onde as pessoas se sentem seguras para falar, errar e crescer. Baseado no Project Aristotle da Google e no modelo de Amy Edmondson.",
    temas: ["Modelo de Edmondson", "4 estágios de segurança", "Liderança psicologicamente segura", "Métricas e avaliação"],
    tipo: "Curso Online",
    duracao: "4 horas",
  },
  {
    numero: "04",
    titulo: "Legislação e Obrigações Legais em Portugal",
    descricao: "O que diz a lei portuguesa sobre saúde mental no trabalho, as obrigações do empregador e como garantir conformidade com a legislação europeia.",
    temas: ["Lei n.º 102/2009", "Diretiva Europeia", "Riscos psicossociais", "Auditoria de conformidade"],
    tipo: "Guia Jurídico",
    duracao: "25 min de leitura",
  },
];

const RECURSOS_DESTAQUE = [
  {
    categoria: "E-book",
    titulo: "Guia de Saúde Mental para Estudantes Universitários",
    descricao: "50 páginas com estratégias práticas para gerir o stress académico, melhorar o sono e preparar a carreira com equilíbrio emocional.",
    publico: "Estudantes",
    paginas: "50 páginas",
    gratuito: true,
  },
  {
    categoria: "Template",
    titulo: "Plano de Bem-Estar Organizacional",
    descricao: "Template completo para criar e apresentar um plano de bem-estar à liderança, com métricas, cronograma e budget estimado.",
    publico: "RH",
    paginas: "Excel + PDF",
    gratuito: true,
  },
  {
    categoria: "Checklist",
    titulo: "Auditoria de Saúde Mental na Empresa",
    descricao: "42 pontos de verificação para avaliar o estado atual do bem-estar na sua organização e identificar prioridades de intervenção.",
    publico: "RH",
    paginas: "42 pontos",
    gratuito: true,
  },
  {
    categoria: "Webinar",
    titulo: "Burnout Académico: Como Prevenir e Recuperar",
    descricao: "Sessão gravada com psicóloga clínica sobre os sinais de burnout académico, estratégias de prevenção e quando procurar ajuda profissional.",
    publico: "Estudantes",
    paginas: "45 min",
    gratuito: true,
  },
];

const PARCEIROS_ACADEMICOS = [
  { nome: "Universidade de Lisboa", tipo: "Parceiro Académico" },
  { nome: "Universidade do Porto", tipo: "Parceiro Académico" },
  { nome: "Universidade Nova de Lisboa", tipo: "Parceiro Académico" },
  { nome: "ISCTE", tipo: "Parceiro Académico" },
];

const STATS = [
  { valor: "12.000+", descricao: "Estudantes impactados" },
  { valor: "340+", descricao: "Profissionais de RH formados" },
  { valor: "28", descricao: "Universidades parceiras" },
  { valor: "94%", descricao: "Taxa de satisfação" },
];

const FAQS = [
  {
    q: "A Academia TEAM 24 é gratuita para estudantes?",
    a: "Sim. Todos os recursos da Academia TEAM 24 são gratuitos para estudantes universitários. Basta registar o teu e-mail institucional para aceder a todos os conteúdos.",
  },
  {
    q: "Os cursos têm certificado?",
    a: "Sim. Os cursos e workshops da Academia TEAM 24 emitem certificado de participação reconhecido pelas universidades parceiras e aceite como atividade extracurricular.",
  },
  {
    q: "Como posso integrar a Academia TEAM 24 na minha universidade?",
    a: "Entramos em contacto com a direção académica e o serviço de ação social da universidade para estabelecer uma parceria formal. O processo demora entre 2 a 4 semanas.",
  },
  {
    q: "Que formações existem para profissionais de RH?",
    a: "A Academia TEAM 24 oferece guias, kits práticos, cursos online e workshops presenciais sobre EAP, burnout, segurança psicológica e legislação laboral em Portugal.",
  },
  {
    q: "Os conteúdos são baseados em evidência científica?",
    a: "Sim. Todos os conteúdos da Academia TEAM 24 são desenvolvidos por psicólogos clínicos, investigadores e especialistas em saúde organizacional, com base em estudos peer-reviewed.",
  },
];

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

const INK = "#0A1A2A";
const CORAL = "#DB5C34";
const CREAM = "#F5F8FA";
const STONE = "#6B8A9F";
const BORDER = "#D0E2EC";

export default function Academia() {
  const [audiencia, setAudiencia] = useState<"estudantes" | "rh">("estudantes");

  const jsonLd = [
    ORGANIZATION_LD,
    breadcrumbLD([
      { name: "Início", path: "/" },
      { name: "Academia TEAM 24", path: "/academia" },
    ]),
    faqLD(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Academia TEAM 24",
      description: "Plataforma de formação em saúde mental para estudantes universitários e profissionais de RH em Portugal.",
      url: "https://www.team24.pt/academia",
      parentOrganization: { "@type": "Organization", name: "TEAM 24" },
    },
  ];

  const modulos = audiencia === "estudantes" ? MODULOS_ESTUDANTES : MODULOS_RH;

  return (
    <>
      <SEO
        title="Academia TEAM 24 — Formação em Saúde Mental para Estudantes e RH"
        description="Recursos gratuitos, cursos e guias práticos sobre saúde mental para estudantes universitários e profissionais de Recursos Humanos em Portugal."
        canonicalPath="/academia"
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* ── HERO ── */}
      <section
        style={{
          background: INK,
          paddingTop: "8rem",
          paddingBottom: "5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Linha decorativa laranja */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: CORAL,
          }}
        />
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ maxWidth: "720px" }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: CORAL,
                marginBottom: "1.5rem",
              }}
            >
              Academia TEAM 24
            </p>
            <h1
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 900,
                color: "white",
                lineHeight: 1.05,
                marginBottom: "1.5rem",
              }}
            >
              Conhecimento que{" "}
              <span style={{ color: CORAL }}>transforma</span>{" "}
              carreiras e organizações.
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.7,
                marginBottom: "2.5rem",
                maxWidth: "560px",
              }}
            >
              A Academia TEAM 24 oferece formação gratuita em saúde mental para estudantes universitários e recursos práticos para profissionais de Recursos Humanos em Portugal.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a
                href="#conteudos"
                style={{
                  display: "inline-block",
                  background: CORAL,
                  color: "white",
                  padding: "0.875rem 2rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Explorar Conteúdos
              </a>
              <a
                href="#recursos"
                style={{
                  display: "inline-block",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  padding: "0.875rem 2rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
              >
                Recursos Gratuitos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: CORAL, padding: "2.5rem 0" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2rem",
          }}
        >
          {STATS.map((s) => (
            <div key={s.valor} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "2.25rem",
                  fontWeight: 900,
                  color: "white",
                  lineHeight: 1,
                  marginBottom: "0.4rem",
                }}
              >
                {s.valor}
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                {s.descricao}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AUDIÊNCIAS ── */}
      <section id="conteudos" style={{ background: CREAM, padding: "5rem 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: CORAL,
                marginBottom: "0.75rem",
              }}
            >
              Para quem é
            </p>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 900,
                color: INK,
                marginBottom: "1rem",
              }}
            >
              Escolhe o teu percurso
            </h2>
            <p style={{ color: STONE, fontSize: "1rem", maxWidth: "480px", margin: "0 auto" }}>
              Conteúdos distintos adaptados às necessidades de cada audiência.
            </p>
          </div>

          {/* Tabs de audiência */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0",
              marginBottom: "3rem",
              border: `1px solid ${BORDER}`,
              borderRadius: "2px",
              overflow: "hidden",
              maxWidth: "480px",
              margin: "0 auto 3rem",
            }}
          >
            {AUDIENCIAS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAudiencia(a.id as "estudantes" | "rh")}
                style={{
                  flex: 1,
                  padding: "0.875rem 1.5rem",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: audiencia === a.id ? INK : "white",
                  color: audiencia === a.id ? "white" : STONE,
                }}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Descrição da audiência selecionada */}
          <p
            style={{
              textAlign: "center",
              color: STONE,
              fontSize: "1rem",
              maxWidth: "600px",
              margin: "0 auto 3rem",
              lineHeight: 1.7,
            }}
          >
            {AUDIENCIAS.find((a) => a.id === audiencia)?.descricao}
          </p>

          {/* Grid de módulos */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5px",
              background: BORDER,
            }}
          >
            {modulos.map((m) => (
              <div
                key={m.numero}
                style={{
                  background: "white",
                  padding: "2rem",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFCFE")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    color: CORAL,
                    marginBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>MÓDULO {m.numero}</span>
                  <span
                    style={{
                      background: "#FEF6F3",
                      color: CORAL,
                      padding: "0.2rem 0.6rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {m.tipo}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: INK,
                    marginBottom: "0.75rem",
                    lineHeight: 1.3,
                  }}
                >
                  {m.titulo}
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: STONE,
                    lineHeight: 1.65,
                    marginBottom: "1.25rem",
                  }}
                >
                  {m.descricao}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
                  {m.temas.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: STONE,
                        background: CREAM,
                        padding: "0.25rem 0.6rem",
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: STONE,
                    borderTop: `1px solid ${BORDER}`,
                    paddingTop: "0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{m.duracao}</span>
                  <a
                    href="/agendar"
                    style={{
                      color: CORAL,
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: "0.78rem",
                    }}
                  >
                    Saber mais →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECURSOS GRATUITOS ── */}
      <section id="recursos" style={{ background: "white", padding: "5rem 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ marginBottom: "3rem" }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: CORAL,
                marginBottom: "0.75rem",
              }}
            >
              Recursos Gratuitos
            </p>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 900,
                color: INK,
                marginBottom: "0.75rem",
              }}
            >
              Descarrega e usa hoje
            </h2>
            <p style={{ color: STONE, fontSize: "1rem", maxWidth: "520px" }}>
              E-books, templates, checklists e webinars desenvolvidos por especialistas. Todos gratuitos, todos práticos.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5px",
              background: BORDER,
            }}
          >
            {RECURSOS_DESTAQUE.map((r) => (
              <div
                key={r.titulo}
                style={{
                  background: "white",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: STONE,
                    }}
                  >
                    {r.categoria}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: r.publico === "Estudantes" ? "#1A6B3A" : "#1A3B6B",
                      background: r.publico === "Estudantes" ? "#E8F5EE" : "#E8EEF5",
                      padding: "0.2rem 0.6rem",
                    }}
                  >
                    {r.publico}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: INK,
                    marginBottom: "0.75rem",
                    lineHeight: 1.35,
                    flex: 1,
                  }}
                >
                  {r.titulo}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: STONE,
                    lineHeight: 1.6,
                    marginBottom: "1.25rem",
                  }}
                >
                  {r.descricao}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: `1px solid ${BORDER}`,
                    paddingTop: "0.875rem",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: STONE }}>{r.paginas}</span>
                  <a
                    href="/agendar"
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "white",
                      background: INK,
                      padding: "0.4rem 0.875rem",
                      textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = CORAL)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = INK)}
                  >
                    Aceder Grátis
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link
              href="/recursos"
              style={{
                display: "inline-block",
                border: `1px solid ${INK}`,
                color: INK,
                padding: "0.875rem 2rem",
                fontWeight: 700,
                fontSize: "0.875rem",
                letterSpacing: "0.05em",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = INK;
                (e.currentTarget as HTMLAnchorElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = INK;
              }}
            >
              Ver Todos os Recursos
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARCEIROS ACADÉMICOS ── */}
      <section style={{ background: CREAM, padding: "4rem 0", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: STONE,
                marginBottom: "0.5rem",
              }}
            >
              Parceiros Académicos
            </p>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: INK,
              }}
            >
              Presente nas principais universidades portuguesas
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1px",
              background: BORDER,
            }}
          >
            {PARCEIROS_ACADEMICOS.map((p) => (
              <div
                key={p.nome}
                style={{
                  background: "white",
                  padding: "1.75rem 2rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: INK,
                    marginBottom: "0.3rem",
                  }}
                >
                  {p.nome}
                </div>
                <div style={{ fontSize: "0.75rem", color: STONE }}>{p.tipo}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section style={{ background: "white", padding: "5rem 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "5rem",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: CORAL,
                  marginBottom: "0.75rem",
                }}
              >
                Como Funciona
              </p>
              <h2
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
                  fontWeight: 900,
                  color: INK,
                  marginBottom: "1.5rem",
                  lineHeight: 1.2,
                }}
              >
                Acesso simples, impacto real.
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {[
                  {
                    passo: "1",
                    titulo: "Regista-te gratuitamente",
                    desc: "Usa o teu e-mail universitário ou profissional para criar a tua conta na Academia TEAM 24.",
                  },
                  {
                    passo: "2",
                    titulo: "Escolhe o teu percurso",
                    desc: "Seleciona os módulos e recursos mais relevantes para os teus objetivos — académicos ou profissionais.",
                  },
                  {
                    passo: "3",
                    titulo: "Aprende ao teu ritmo",
                    desc: "Acede aos conteúdos quando quiseres, no telemóvel ou computador, sem prazos nem pressão.",
                  },
                  {
                    passo: "4",
                    titulo: "Obtém o teu certificado",
                    desc: "Completa os módulos e recebe o certificado TEAM 24, reconhecido pelas universidades parceiras.",
                  },
                ].map((item) => (
                  <div key={item.passo} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    <div
                      style={{
                        minWidth: "2rem",
                        height: "2rem",
                        background: CORAL,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                        flexShrink: 0,
                      }}
                    >
                      {item.passo}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: INK,
                          fontSize: "0.95rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {item.titulo}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: STONE, lineHeight: 1.6 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Painel de destaque */}
            <div
              style={{
                background: INK,
                padding: "3rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "4px",
                  bottom: 0,
                  background: CORAL,
                }}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: CORAL,
                  marginBottom: "1.5rem",
                }}
              >
                Para Universidades
              </p>
              <h3
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "white",
                  marginBottom: "1rem",
                  lineHeight: 1.3,
                }}
              >
                Integra a Academia TEAM 24 na tua universidade
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.7,
                  marginBottom: "2rem",
                }}
              >
                Oferecemos um programa completo de saúde mental para estudantes, com conteúdos personalizados, workshops presenciais e acesso à plataforma TEAM 24 para os serviços de ação social.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                {[
                  "Conteúdos adaptados ao calendário académico",
                  "Workshops presenciais com psicólogos certificados",
                  "Dashboard de bem-estar para os serviços de ação social",
                  "Relatórios de impacto trimestrais",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        background: CORAL,
                        borderRadius: "50%",
                        marginTop: "0.45rem",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)" }}>{item}</span>
                  </div>
                ))}
              </div>
              <a
                href="/contacto"
                style={{
                  display: "inline-block",
                  background: CORAL,
                  color: "white",
                  padding: "0.875rem 1.75rem",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Falar com a Equipa
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTEMUNHO ── */}
      <section style={{ background: CREAM, padding: "5rem 0", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: CORAL,
              marginBottom: "2rem",
            }}
          >
            O que dizem
          </p>
          <blockquote
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              fontWeight: 700,
              color: INK,
              lineHeight: 1.5,
              marginBottom: "2rem",
              fontStyle: "italic",
            }}
          >
            "A Academia TEAM 24 mudou a forma como vejo a saúde mental na universidade. Os conteúdos são práticos, baseados em ciência e fáceis de aplicar no dia a dia."
          </blockquote>
          <div>
            <div style={{ fontWeight: 800, color: INK, fontSize: "0.9rem" }}>Ana Rodrigues</div>
            <div style={{ fontSize: "0.8rem", color: STONE }}>Estudante de Psicologia Organizacional · Universidade de Lisboa</div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: "white", padding: "5rem 0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: CORAL,
                marginBottom: "0.75rem",
              }}
            >
              Perguntas Frequentes
            </p>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                fontWeight: 900,
                color: INK,
              }}
            >
              Tudo o que precisas de saber
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {FAQS.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: INK, padding: "5rem 0" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                fontWeight: 900,
                color: "white",
                marginBottom: "0.75rem",
                lineHeight: 1.2,
              }}
            >
              Pronto para começar?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>
              Acede gratuitamente a todos os recursos da Academia TEAM 24.
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a
              href="/agendar"
              style={{
                display: "inline-block",
                background: CORAL,
                color: "white",
                padding: "0.875rem 2rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Registar Gratuitamente
            </a>
            <a
              href="/contacto"
              style={{
                display: "inline-block",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                padding: "0.875rem 2rem",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
            >
              Falar com a Equipa
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

// ─── FAQ ACCORDION ─────────────────────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "1.25rem 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: INK,
            fontSize: "0.95rem",
            lineHeight: 1.4,
          }}
        >
          {question}
        </span>
        <span
          style={{
            color: CORAL,
            fontWeight: 900,
            fontSize: "1.25rem",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: "1.25rem",
            fontSize: "0.9rem",
            color: STONE,
            lineHeight: 1.7,
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}
