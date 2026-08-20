/* ============================================================
   TEAM 24 — Catálogo de Formação
   URL: /catalogo-formacao
   Imagens e textos exactos do site team24.pt
   ============================================================ */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, breadcrumbLD, serviceLD } from "@/components/SEO";
import ContactSection from "@/components/ContactSection";
import { Link } from "wouter";
import { useIsMobile } from "@/hooks/useMobile";

// ── URLs das imagens (CDN webdev) ────────────────────────────────────────────

const IMG = {
  heroBg: "/media/hero-bg_ec6f1c7e_2b89ea04.webp",
  // Colaboradores
  riscos: "/media/riscos_0f3813d6_c39b83b7.webp",
  segurancaSst: "/media/seguranca-sst_e937660f_d8296e47.webp",
  diversidade: "/media/diversidade_db51a8e4_c96f2cdf.webp",
  teletrabalho: "/media/teletrabalho_a549a0a7_2206d656.webp",
  assedio: "/media/assedio_6c80cf33_44ed3115.webp",
  sono: "/media/sono_79199d89_b3dd9ff8.webp",
  worklife: "/media/worklife_c86cfc78_5f7581d6.webp",
  comunicacao: "/media/comunicacao_a43fec5c_2325fcd1.webp",
  softSkills: "/media/soft-skills_e248ccf4_4bfce1ca.webp",
  psicologiaPositiva: "/media/psicologia-positiva_f8e8fcb5_ce6df324.webp",
  mindfulness: "/media/mindfulness_03cdfddd_3a87c305.webp",
  burnout: "/media/burnout_c53b9b24_2a00774c.webp",
  ansiedade: "/media/ansiedade_d72faaef_280c1edf.webp",
  depressao: "/media/depressao_288dfef1_a38692e9.webp",
  suicidio: "/media/suicidio_f9474f91_150d084b.webp",
  primeiros: "/media/primeiros-socorros_ac03af75_1e2b0e9e.webp",
  // Liderança
  liderSaudeMental: "/media/lider-saude-mental_bb7a9056_9be44b05.webp",
  liderancaSustentavel: "/media/lideranca-sustentavel_1c6a3cfd_b6a0ae54.webp",
  hibridoEquipa: "/media/hibrido-equipa_a9803b00_b9c63590.webp",
  liderComunicacao: "/media/lider-comunicacao_2433f8df_e2e410f9.webp",
  pspLideres: "/media/psp-lideres_b9a11bbd_aebf82dd.webp",
};

// ── Dados das formações ──────────────────────────────────────────────────────

const COLABORADORES = [
  { id: 1, titulo: "Promoção da Saúde Ocupacional e Riscos Psicossociais: Qual o papel dos colaboradores?", imagem: IMG.riscos },
  { id: 2, titulo: "A importância da Saúde Mental na Segurança e Saúde no Trabalho (SST)", imagem: IMG.segurancaSst },
  { id: 3, titulo: "Diversidade e Inclusão nas Organizações", imagem: IMG.diversidade },
  { id: 4, titulo: "Como gerir o teletrabalho ou o regime híbrido", imagem: IMG.teletrabalho },
  { id: 5, titulo: "Assédio no Trabalho – Identificação, Impacto e Estratégias de Prevenção", imagem: IMG.assedio },
  { id: 6, titulo: "Sono e Saúde – Como melhorar a qualidade do nosso descanso", imagem: IMG.sono },
  { id: 7, titulo: '"Work-life-integration" – Equilíbrio sustentável entre a vida pessoal e o trabalho', imagem: IMG.worklife },
  { id: 8, titulo: "O poder da Comunicação - Como ser mais assertivo", imagem: IMG.comunicacao },
  { id: 9, titulo: "Desenvolvimento de Soft Skills – Inteligência Emocional e Relações no Trabalho", imagem: IMG.softSkills },
  { id: 10, titulo: "Psicologia Positiva – Estratégias para o Florescimento e Resiliência", imagem: IMG.psicologiaPositiva },
  { id: 11, titulo: "O contributo do mindfulness na gestão do stress", imagem: IMG.mindfulness },
  { id: 12, titulo: "Burnout – Identificação dos sinais de alerta e estratégias de prevenção", imagem: IMG.burnout },
  { id: 13, titulo: "Como identificar e prevenir a Ansiedade", imagem: IMG.ansiedade },
  { id: 14, titulo: "Como identificar e prevenir a Depressão", imagem: IMG.depressao },
  { id: 15, titulo: "Suicídio – Sensibilização, Prevenção e Intervenção em Situações de Crise", imagem: IMG.suicidio },
  { id: 16, titulo: "Primeiros Socorros Psicológicos", imagem: IMG.primeiros },
];

const LIDERANCA = [
  { id: 1, titulo: "Sensibilização de líderes para a saúde mental", imagem: IMG.liderSaudeMental },
  { id: 2, titulo: "Liderança Sustentável: Promover relações saudáveis no contexto corporativo", imagem: IMG.liderancaSustentavel },
  { id: 3, titulo: "Trabalho em regime híbrido: Promoção da cooperação e produtividade na Equipa", imagem: IMG.hibridoEquipa },
  { id: 4, titulo: "Como fortalecer a liderança através da Comunicação", imagem: IMG.liderComunicacao },
  { id: 5, titulo: "Primeiros socorros Psicológicos para Líderes", imagem: IMG.pspLideres },
];

// ── Card de formação ─────────────────────────────────────────────────────────

function FormacaoCard({ titulo, imagem }: { titulo: string; imagem: string }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8EEF2",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(10,26,42,0.1)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Imagem */}
      <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
        <img
          loading="lazy"
          src={imagem}
          alt={titulo}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", display: "block" }}
          onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
        />
      </div>
      {/* Título */}
      <div style={{ padding: "1.1rem 1.25rem 1.35rem" }}>
        <div style={{ width: "28px", height: "2px", backgroundColor: "#DB5C34", marginBottom: "0.75rem" }} />
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
          fontSize: "0.9rem",
          color: "#25749F",
          margin: 0,
          lineHeight: 1.45,
        }}>
          {titulo}
        </h3>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function CatalogoFormacao() {
  const isMobile = useIsMobile();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <Navbar />
      <SEO
        title="Catálogo de Formação | Workshops de Saúde Mental e Liderança | TEAM 24"
        description="Catálogo de workshops on-line e em direto da TEAM 24 sobre saúde mental, bem-estar, liderança e gestão de equipas. Formações personalizadas à medida da sua organização."
        keywords="catálogo formação saúde mental, workshops empresas, formação liderança, bem-estar organizacional, team24"
        canonicalPath="/catalogo-formacao"
        jsonLd={[
          serviceLD({
            name: "Catálogo de Formação TEAM 24",
            description: "Workshops on-line e em direto sobre saúde mental, bem-estar e liderança para empresas.",
            url: "/catalogo-formacao",
          }),
          breadcrumbLD([
            { name: "Início", path: "/" },
            { name: "Catálogo de Formação", path: "/catalogo-formacao" },
          ]),
          ORGANIZATION_LD,
        ]}
      />

      {/* ── HERO com imagem de fundo ── */}
      <section
        style={{
          position: "relative",
          minHeight: isMobile ? "220px" : "320px",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Imagem de fundo */}
        <img
          src={IMG.heroBg}
          alt="Workshops TEAM 24"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />
        {/* Overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(10,26,42,0.45) 0%, rgba(10,26,42,0.7) 100%)",
        }} />
        {/* Texto */}
        <div style={{
          position: "relative",
          zIndex: 1,
          padding: isMobile ? "2.5rem 1.5rem" : "3.5rem clamp(1.5rem, 6vw, 8rem)",
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
        }}>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? "1rem" : "1.15rem",
            color: "#FFFFFF",
            margin: 0,
            lineHeight: 1.6,
            maxWidth: "560px",
          }}>
            Todos os workshops são on-line e em direto, desenhados à medida das necessidades da sua organização.
          </p>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section style={{ backgroundColor: "#FFFFFF", padding: isMobile ? "3rem 1.5rem" : "4rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "auto 1fr", gap: isMobile ? "1.5rem" : "4rem", alignItems: "start" }}>
          {/* Esquerda: label + título */}
          <div style={{ minWidth: isMobile ? "auto" : "260px" }}>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              color: "#DB5C34",
              marginBottom: "0.5rem",
            }}>
              As nossas sugestões
            </div>
            <h1 style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              color: "#0A1A2A",
              margin: 0,
              lineHeight: 1.1,
              textTransform: "uppercase" as const,
              letterSpacing: "-0.01em",
            }}>
              Catálogo de<br />formação
            </h1>
          </div>
          {/* Separador vertical */}
          {!isMobile && (
            <div style={{ borderLeft: "3px solid #DB5C34", paddingLeft: "3rem" }}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1rem",
                color: "#444",
                lineHeight: 1.8,
                margin: 0,
              }}>
                Apresentamos algumas sugestões de temas que podem ser abordados nos workshops. Para além dos temas apresentados, personalizamos e desenhamos as formações/workshops à medida das necessidades dos vossos colaboradores e da organização.
              </p>
            </div>
          )}
          {isMobile && (
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.95rem",
              color: "#444",
              lineHeight: 1.8,
              margin: 0,
            }}>
              Apresentamos algumas sugestões de temas que podem ser abordados nos workshops. Para além dos temas apresentados, personalizamos e desenhamos as formações/workshops à medida das necessidades dos vossos colaboradores e da organização.
            </p>
          )}
        </div>
      </section>

      {/* ── GRELHA DE COLABORADORES ── */}
      <section style={{ padding: isMobile ? "2rem 1.5rem 3rem" : "2rem clamp(1.5rem, 6vw, 8rem) 4rem", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "1.5rem",
          }}>
            {COLABORADORES.map(f => (
              <FormacaoCard key={f.id} titulo={f.titulo} imagem={f.imagem} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECÇÃO LIDERANÇA ── */}
      <section style={{ padding: isMobile ? "2.5rem 1.5rem 3rem" : "3rem clamp(1.5rem, 6vw, 8rem) 4rem", backgroundColor: "#F4F8FB" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Cabeçalho */}
          <h2 style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
            color: "#0A1A2A",
            textTransform: "uppercase" as const,
            letterSpacing: "0.05em",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "3px solid #DB5C34",
            display: "inline-block",
          }}>
            Liderança
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "1.5rem",
          }}>
            {LIDERANCA.map(f => (
              <FormacaoCard key={f.id} titulo={f.titulo} imagem={f.imagem} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ backgroundColor: "#0A1A2A", padding: isMobile ? "3rem 1.5rem" : "4.5rem clamp(1.5rem, 6vw, 8rem)", textAlign: "center" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            color: "white",
            margin: "0 0 1rem",
            lineHeight: 1.2,
          }}>
            Não encontrou o tema que procura?
          </h2>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "1rem",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.75,
            margin: "0 0 2rem",
          }}>
            Desenhamos formações completamente personalizadas às necessidades específicas da sua organização. Fale connosco.
          </p>
          <Link href="/contacto">
            <button
              style={{
                backgroundColor: "#DB5C34",
                color: "white",
                border: "none",
                padding: "0.95rem 2.5rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                letterSpacing: "0.03em",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#C04E2A"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#DB5C34"; }}
            >
              Contactar a equipa TEAM 24
            </button>
          </Link>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
}
