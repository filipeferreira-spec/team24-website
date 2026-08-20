/* ============================================================
   Formações — Página de cursos de liderança TEAM 24
   Público-alvo: Diretores e líderes de RH, Comercial, Operações
   ============================================================ */

import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD } from "@/components/SEO";
import ContactSection from "@/components/ContactSection";

// ── Dados das formações ──────────────────────────────────────────────────────

const AREAS = ["Todas", "Recursos Humanos", "Comercial", "Operações", "Liderança Geral"];

const FORMACOES = [
  // ── Liderança Geral ──
  {
    id: 1,
    area: "Liderança Geral",
    nivel: "Diretivo",
    duracao: "16h",
    modalidade: "Presencial / Online",
    tag: "Mais popular",
    tagColor: "#DB5C34",
    imagem: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop&q=80",
    titulo: "Liderança com Propósito",
    subtitulo: "Da visão estratégica à ação no terreno",
    descricao:
      "Desenvolva a capacidade de inspirar equipas através de uma liderança autêntica e orientada para o propósito. Aprenda a alinhar valores pessoais com objetivos organizacionais e a criar culturas de alto desempenho.",
    objetivos: [
      "Definir e comunicar uma visão clara e motivadora",
      "Criar empatia e confiança como pilares de liderança",
      "Gerir a mudança com resiliência e adaptabilidade",
      "Desenvolver a inteligência emocional aplicada à liderança",
    ],
    publicoAlvo: "CEO, Diretores Gerais, Gestores de Topo",
    icon: "◈",
    accentColor: "#25749F",
  },
  {
    id: 2,
    area: "Liderança Geral",
    nivel: "Gestão Intermédia",
    duracao: "12h",
    modalidade: "Presencial / Online",
    tag: "",
    tagColor: "",
    imagem: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=450&fit=crop&q=80",
    titulo: "Empatia como Ferramenta de Gestão",
    subtitulo: "Construir pontes entre equipas e resultados",
    descricao:
      "Formação prática sobre como a empatia melhora a performance coletiva. Técnicas de escuta ativa, comunicação não-violenta e gestão de conflitos para líderes que querem criar equipas mais coesas e produtivas.",
    objetivos: [
      "Praticar escuta ativa e comunicação empática",
      "Resolver conflitos com técnicas de mediação",
      "Criar um ambiente psicologicamente seguro",
      "Aumentar o engagement e reduzir o turnover",
    ],
    publicoAlvo: "Gestores de Equipa, Team Leaders, Chefes de Departamento",
    icon: "◎",
    accentColor: "#2A7A4B",
  },
  {
    id: 3,
    area: "Liderança Geral",
    nivel: "Todos os níveis",
    duracao: "8h",
    modalidade: "Online",
    tag: "Novo",
    tagColor: "#2A7A4B",
    imagem: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop&q=80",
    titulo: "Bem-estar e Performance: O Equilíbrio Possível",
    subtitulo: "Saúde mental como alavanca de produtividade",
    descricao:
      "Desmistifique a ideia de que bem-estar e performance são opostos. Aprenda a identificar sinais de burnout, a criar rotinas sustentáveis e a liderar pelo exemplo numa cultura de saúde organizacional.",
    objetivos: [
      "Identificar sinais precoces de burnout na equipa",
      "Implementar rotinas de check-in emocional",
      "Criar políticas de trabalho sustentável",
      "Medir e melhorar o índice de bem-estar organizacional",
    ],
    publicoAlvo: "Todos os líderes e gestores",
    icon: "◉",
    accentColor: "#DB5C34",
  },

  // ── Recursos Humanos ──
  {
    id: 4,
    area: "Recursos Humanos",
    nivel: "Especializado",
    duracao: "20h",
    modalidade: "Presencial",
    tag: "Certificado",
    tagColor: "#25749F",
    imagem: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop&q=80",
    titulo: "RH Estratégico: Pessoas como Vantagem Competitiva",
    subtitulo: "Da gestão administrativa à parceria de negócio",
    descricao:
      "Transforme a função de RH num parceiro estratégico do negócio. Aprenda a medir o impacto das pessoas nos resultados, a desenhar programas de desenvolvimento e a posicionar o RH como agente de mudança cultural.",
    objetivos: [
      "Alinhar a estratégia de pessoas com os objetivos de negócio",
      "Implementar métricas de People Analytics",
      "Desenhar programas de onboarding e retenção de talento",
      "Criar uma proposta de valor ao colaborador (EVP) diferenciadora",
    ],
    publicoAlvo: "Diretores e Técnicos de RH, CHRO, People Managers",
    icon: "◈",
    accentColor: "#25749F",
  },
  {
    id: 5,
    area: "Recursos Humanos",
    nivel: "Avançado",
    duracao: "16h",
    modalidade: "Presencial / Online",
    tag: "",
    tagColor: "",
    imagem: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop&q=80",
    titulo: "Gestão do Absentismo e Presenteísmo",
    subtitulo: "Estratégias para reduzir custos e aumentar presença real",
    descricao:
      "Abordagem prática para identificar as causas raiz do absentismo e presenteísmo nas organizações. Ferramentas de diagnóstico, planos de intervenção e métricas de acompanhamento para equipas de RH.",
    objetivos: [
      "Diagnosticar causas de absentismo por departamento",
      "Implementar programas de regresso ao trabalho",
      "Criar políticas de flexibilidade e conciliação",
      "Medir o ROI das intervenções de bem-estar",
    ],
    publicoAlvo: "Diretores de RH, Técnicos de Saúde Ocupacional",
    icon: "◎",
    accentColor: "#2A7A4B",
  },
  {
    id: 6,
    area: "Recursos Humanos",
    nivel: "Fundamental",
    duracao: "8h",
    modalidade: "Online",
    tag: "",
    tagColor: "",
    imagem: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=450&fit=crop&q=80",
    titulo: "Recrutamento com Foco em Fit Cultural",
    subtitulo: "Contratar para a cultura, não apenas para o cargo",
    descricao:
      "Aprenda a integrar critérios de saúde mental e fit cultural nos processos de recrutamento. Entrevistas comportamentais, assessment de valores e onboarding que reduz o turnover nos primeiros 90 dias.",
    objetivos: [
      "Definir perfis de fit cultural por função",
      "Estruturar entrevistas por competências emocionais",
      "Criar processos de onboarding que retêm talento",
      "Reduzir o custo de rotatividade em 30%",
    ],
    publicoAlvo: "Recrutadores, HR Business Partners, Gestores de Contratação",
    icon: "◉",
    accentColor: "#DB5C34",
  },

  // ── Comercial ──
  {
    id: 7,
    area: "Comercial",
    nivel: "Diretivo",
    duracao: "16h",
    modalidade: "Presencial",
    tag: "",
    tagColor: "",
    imagem: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=450&fit=crop&q=80",
    titulo: "Liderança de Equipas Comerciais de Alta Performance",
    subtitulo: "Motivação, resiliência e resultados sustentáveis",
    descricao:
      "Formação para diretores comerciais que querem construir equipas resilientes e motivadas. Técnicas de coaching comercial, gestão da pressão de resultados e criação de uma cultura de accountability saudável.",
    objetivos: [
      "Construir uma cultura de accountability sem toxicidade",
      "Gerir a pressão de resultados de forma saudável",
      "Aplicar técnicas de coaching para desenvolvimento individual",
      "Criar rituais de equipa que aumentam a coesão",
    ],
    publicoAlvo: "Diretores Comerciais, Sales Managers, Key Account Managers",
    icon: "◈",
    accentColor: "#25749F",
  },
  {
    id: 8,
    area: "Comercial",
    nivel: "Equipa",
    duracao: "12h",
    modalidade: "Presencial / Online",
    tag: "Novo",
    tagColor: "#2A7A4B",
    imagem: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop&q=80",
    titulo: "Inteligência Emocional nas Vendas",
    subtitulo: "Vender com empatia, fechar com confiança",
    descricao:
      "A inteligência emocional é o maior diferenciador nas vendas consultivas. Aprenda a gerir as emoções em negociações difíceis, a criar rapport genuíno com clientes e a transformar objeções em oportunidades.",
    objetivos: [
      "Desenvolver autorregulação emocional em situações de pressão",
      "Criar rapport e confiança com diferentes perfis de cliente",
      "Transformar rejeições em aprendizagens",
      "Aumentar a taxa de conversão através da empatia",
    ],
    publicoAlvo: "Comerciais, Account Managers, Pré-Vendas",
    icon: "◎",
    accentColor: "#2A7A4B",
  },
  {
    id: 9,
    area: "Comercial",
    nivel: "Gestão",
    duracao: "8h",
    modalidade: "Online",
    tag: "",
    tagColor: "",
    imagem: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=450&fit=crop&q=80",
    titulo: "Gestão do Stress e Burnout em Equipas Comerciais",
    subtitulo: "Proteger a saúde mental sem perder a ambição",
    descricao:
      "As equipas comerciais são das mais expostas ao burnout. Esta formação dá aos gestores ferramentas para identificar sinais de esgotamento, criar rotinas de recuperação e manter a motivação a longo prazo.",
    objetivos: [
      "Identificar os gatilhos de burnout em contexto comercial",
      "Implementar rotinas de recuperação e descompressão",
      "Criar metas realistas que motivam sem esgotar",
      "Construir uma cultura de suporte mútuo na equipa",
    ],
    publicoAlvo: "Sales Managers, Diretores Comerciais, Gestores de Equipa",
    icon: "◉",
    accentColor: "#DB5C34",
  },

  // ── Operações ──
  {
    id: 10,
    area: "Operações",
    nivel: "Diretivo",
    duracao: "16h",
    modalidade: "Presencial",
    tag: "",
    tagColor: "",
    imagem: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop&q=80",
    titulo: "Liderança Operacional com Foco Humano",
    subtitulo: "Eficiência e bem-estar não são opostos",
    descricao:
      "Para diretores de operações que gerem equipas em contextos de alta pressão e ritmo intenso. Aprenda a otimizar processos sem sacrificar o bem-estar das pessoas, criando operações sustentáveis e resilientes.",
    objetivos: [
      "Identificar pontos de pressão nos processos operacionais",
      "Implementar pausas e rotinas de recuperação nas equipas",
      "Criar indicadores de saúde operacional (não só KPIs de produção)",
      "Gerir a mudança operacional com impacto humano mínimo",
    ],
    publicoAlvo: "Diretores de Operações, COO, Gestores de Produção",
    icon: "◈",
    accentColor: "#25749F",
  },
  {
    id: 11,
    area: "Operações",
    nivel: "Supervisão",
    duracao: "12h",
    modalidade: "Presencial / Online",
    tag: "",
    tagColor: "",
    imagem: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=450&fit=crop&q=80",
    titulo: "Supervisão de Equipas: Da Tarefa à Pessoa",
    subtitulo: "Liderar no terreno com empatia e autoridade",
    descricao:
      "Formação para supervisores e chefes de turno que gerem equipas operacionais. Técnicas de comunicação assertiva, gestão de conflitos no terreno e criação de um ambiente de trabalho seguro e motivador.",
    objetivos: [
      "Comunicar expectativas de forma clara e empática",
      "Gerir conflitos interpessoais no imediato",
      "Reconhecer e valorizar o trabalho das equipas",
      "Criar um ambiente de segurança psicológica no terreno",
    ],
    publicoAlvo: "Supervisores, Chefes de Turno, Team Leaders Operacionais",
    icon: "◎",
    accentColor: "#2A7A4B",
  },
  {
    id: 12,
    area: "Operações",
    nivel: "Todos os níveis",
    duracao: "8h",
    modalidade: "Online",
    tag: "",
    tagColor: "",
    imagem: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=450&fit=crop&q=80",
    titulo: "Prevenção de Riscos Psicossociais",
    subtitulo: "Cumprir a lei e proteger genuinamente as pessoas",
    descricao:
      "Formação obrigatória para organizações que querem ir além do cumprimento legal. Identificação de riscos psicossociais, planos de prevenção e criação de uma cultura de reporte seguro.",
    objetivos: [
      "Identificar e avaliar riscos psicossociais por função",
      "Criar planos de prevenção e intervenção",
      "Implementar canais de reporte seguros e confidenciais",
      "Cumprir os requisitos legais de saúde ocupacional",
    ],
    publicoAlvo: "Responsáveis de Segurança, RH, Gestores Operacionais",
    icon: "◉",
    accentColor: "#DB5C34",
  },
];

// ── Componente ───────────────────────────────────────────────────────────────

export default function Formacoes() {
  const [areaAtiva, setAreaAtiva] = useState("Todas");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const formacoesFiltradas =
    areaAtiva === "Todas"
      ? FORMACOES
      : FORMACOES.filter((f) => f.area === areaAtiva);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <Navbar />

      <SEO
        title="Formações e Workshops | Saúde Mental nas Empresas | TEAM 24"
        description="Formações e workshops sobre saúde mental, gestão do stress e liderança saudável para equipas e gestores. Programas certificados da TEAM 24 para empresas portuguesas."
        keywords="formações saúde mental empresas, workshops bem-estar, formação gestão stress, liderança saudável"
        canonicalPath="/formacoes"
        jsonLd={[serviceLD({ name: "Formações e Workshops", description: "Formações e workshops sobre saúde mental para equipas e gestores.", url: "/formacoes" }), breadcrumbLD([{ name: "Início", path: "/" }, { name: "Formações", path: "/formacoes" }])]}
      />
      {/* ── Hero da página ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0A1A2A 0%, #0F2D4A 60%, #1A3A5C 100%)",
          padding: "8rem 0 5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decoração geométrica */}
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-120px",
          left: "-60px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          border: "1px solid rgba(219,92,52,0.1)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ maxWidth: "780px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(219,92,52,0.15)",
              border: "1px solid rgba(219,92,52,0.3)",
              borderRadius: "2px",
              padding: "0.3rem 0.8rem",
              marginBottom: "1.5rem",
            }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#DB5C34",
              }}>
                Formações Certificadas
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "white",
              margin: "0 0 1.5rem",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}>
              Líderes que cuidam{" "}
              <em style={{ color: "#DB5C34", fontStyle: "italic" }}>
                criam equipas
              </em>{" "}
              que entregam.
            </h1>

            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              margin: "0 0 2.5rem",
              maxWidth: "600px",
            }}>
              Formações práticas e certificadas para diretivos e líderes de RH, Comercial e Operações. Aprenda a criar ambientes de trabalho onde as pessoas prosperam — e os resultados aparecem.
            </p>

            {/* Stats rápidas */}
            <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
              {[
                { valor: "12", label: "Formações disponíveis" },
                { valor: "8–20h", label: "Por programa" },
                { valor: "100%", label: "Aplicação prática" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#DB5C34",
                    lineHeight: 1,
                  }}>{s.valor}</div>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "0.25rem",
                    letterSpacing: "0.05em",
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filtros por área ── */}
      <section style={{
        backgroundColor: "#F5F8FA",
        borderBottom: "1px solid #D0E2EC",
        padding: "0",
        position: "sticky",
        top: "72px",
        zIndex: 100,
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "flex", gap: "0", overflowX: "auto" }}>
            {AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setAreaAtiva(area)}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: areaAtiva === area ? 700 : 500,
                  color: areaAtiva === area ? "#DB5C34" : "#4A6A7A",
                  background: "transparent",
                  border: "none",
                  borderBottom: areaAtiva === area ? "2px solid #DB5C34" : "2px solid transparent",
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s, border-color 0.15s",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => {
                  if (areaAtiva !== area) (e.currentTarget as HTMLButtonElement).style.color = "#25749F";
                }}
                onMouseLeave={(e) => {
                  if (areaAtiva !== area) (e.currentTarget as HTMLButtonElement).style.color = "#4A6A7A";
                }}
              >
                {area}
                <span style={{
                  marginLeft: "0.4rem",
                  fontSize: "0.7rem",
                  color: areaAtiva === area ? "#DB5C34" : "#9BAFBF",
                  fontWeight: 400,
                }}>
                  ({area === "Todas" ? FORMACOES.length : FORMACOES.filter(f => f.area === area).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Listagem de formações ── */}
      <section style={{ padding: "4rem 0", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>

          {/* Cabeçalho da listagem */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                color: "#0A1A2A",
                margin: 0,
                letterSpacing: "-0.02em",
              }}>
                {areaAtiva === "Todas" ? "Todas as Formações" : `Formações — ${areaAtiva}`}
              </h2>
            </div>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.8rem",
              color: "#6B8A9F",
            }}>
              {formacoesFiltradas.length} programa{formacoesFiltradas.length !== 1 ? "s" : ""} disponíve{formacoesFiltradas.length !== 1 ? "is" : "l"}
            </div>
          </div>

          {/* Grid de cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1.5rem",
          }}>
            {formacoesFiltradas.map((f) => (
              <div
                key={f.id}
                onMouseEnter={() => setHoveredId(f.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: "white",
                  border: `1px solid ${hoveredId === f.id ? f.accentColor : "#D0E2EC"}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0",
                  transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                  transform: hoveredId === f.id ? "translateY(-3px)" : "none",
                  boxShadow: hoveredId === f.id ? `0 8px 32px rgba(10,26,42,0.08)` : "none",
                  cursor: "default",
                  overflow: "hidden",
                }}
              >
                {/* Foto da formação */}
                <div style={{ position: "relative", overflow: "hidden", height: "200px", flexShrink: 0 }}>
                  <img
                    src={f.imagem}
                    alt={f.titulo}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.4s ease",
                      transform: hoveredId === f.id ? "scale(1.04)" : "scale(1)",
                    }}
                  />
                  {/* Barra de cor accent no topo da imagem */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: f.accentColor }} />
                  {/* Tags sobrepostas na imagem */}
                  <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                    {f.tag && (
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "white",
                        backgroundColor: f.tagColor,
                        padding: "0.2rem 0.55rem",
                      }}>
                        {f.tag}
                      </span>
                    )}
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      color: "white",
                      backgroundColor: "rgba(10,26,42,0.65)",
                      padding: "0.2rem 0.55rem",
                      backdropFilter: "blur(4px)",
                      letterSpacing: "0.05em",
                    }}>
                      {f.area}
                    </span>
                  </div>
                </div>

                {/* Conteúdo do card */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem", flex: 1 }}>

                {/* Título */}
                <div>
                  <h3 style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "#0A1A2A",
                    margin: "0 0 0.3rem",
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}>
                    {f.titulo}
                  </h3>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.82rem",
                    color: f.accentColor,
                    margin: 0,
                    fontWeight: 500,
                    fontStyle: "italic",
                  }}>
                    {f.subtitulo}
                  </p>
                </div>

                {/* Descrição */}
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.72rem",
                  color: "#4A6A7A",
                  lineHeight: 1.55,
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {f.descricao}
                </p>

                {/* Objetivos — apenas 2 primeiros para compactar */}
                <div>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#9BAFBF",
                    marginBottom: "0.5rem",
                  }}>
                    O que vai aprender
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {f.objetivos.slice(0, 2).map((obj, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                        <span style={{ color: f.accentColor, fontSize: "0.65rem", marginTop: "0.2rem", flexShrink: 0 }}>▸</span>
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.75rem",
                          color: "#3A5A6A",
                          lineHeight: 1.45,
                        }}>
                          {obj}
                        </span>
                      </li>
                    ))}
                    {f.objetivos.length > 2 && (
                      <li style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "#9BAFBF", paddingLeft: "1rem" }}>
                        +{f.objetivos.length - 2} mais na página de detalhe
                      </li>
                    )}
                  </ul>
                </div>

                {/* Metadados compactos */}
                <div style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid #D0E2EC",
                }}>
                  {[
                    { label: "Duração", valor: f.duracao },
                    { label: "Modalidade", valor: f.modalidade },
                    { label: "Nível", valor: f.nivel },
                  ].map((meta) => (
                    <div key={meta.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#9BAFBF",
                      }}>
                        {meta.label}:
                      </span>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "#0A1A2A",
                      }}>
                        {meta.valor}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTAs — Ver Detalhe + Pedir Informações */}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                  <Link href={`/formacoes/${f.id}`} style={{ flex: 1 }}>
                    <button
                      style={{
                        width: "100%",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: f.accentColor,
                        backgroundColor: "transparent",
                        border: `1.5px solid ${f.accentColor}`,
                        padding: "0.65rem 1rem",
                        cursor: "pointer",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        transition: "background-color 0.2s, color 0.2s",
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.backgroundColor = f.accentColor;
                        btn.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.backgroundColor = "transparent";
                        btn.style.color = f.accentColor;
                      }}
                    >
                      Ver Formação →
                    </button>
                  </Link>
                  <button
                    onClick={() => { window.location.href = "/contacto"; }}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "white",
                      backgroundColor: f.accentColor,
                      border: "none",
                      padding: "0.65rem 1rem",
                      cursor: "pointer",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      transition: "opacity 0.2s",
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                  >
                    Inscrever
                  </button>
                </div>
                </div>{/* fim conteúdo do card */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Secção de contacto ── */}
      <div id="contacto">
        <ContactSection />
      </div>

      <Footer />
    </div>
  );
}
