/* ============================================================
   TEAM 24 — Case Study Detail Page: Editorial Clarity
   Design: Full editorial layout. No cards, no shadows.
   Large pull quote, metrics bar, narrative sections.
   Dados carregados da base de dados via backoffice.
   ============================================================ */

import { useEffect, useState } from "react";
import { trackAgendarClick } from "@/lib/analytics";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { type CaseStudy } from "@/lib/casesData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import SEO, { ORGANIZATION_LD, breadcrumbLD } from "@/components/SEO";

// Converter caso da BD para o formato CaseStudy
function dbCasoToCaseStudy(c: any): CaseStudy {
  return {
    id: String(c.id),
    slug: `caso-${c.id}`,
    company: c.empresa,
    sector: c.setor || "Empresa",
    size: "",
    location: "Portugal",
    logo: c.logoUrl || "",
    coverImage: c.imagemUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop&auto=format",
    tagline: c.resultado || c.empresa,
    challenge: c.descricao || "",
    solution: "",
    results: c.descricao || "",
    quote: c.citacao || "",
    quoteName: c.citacaoAutor || "",
    quoteRole: c.citacaoRole || "",
    quoteAvatar: "",
    metrics: [
      c.metrica1Label ? { value: c.metrica1Valor || "", label: c.metrica1Label, description: "" } : null,
      c.metrica2Label ? { value: c.metrica2Valor || "", label: c.metrica2Label, description: "" } : null,
      c.metrica3Label ? { value: c.metrica3Valor || "", label: c.metrica3Label, description: "" } : null,
    ].filter(Boolean) as CaseStudy["metrics"],
    timeline: "",
    featured: c.destaque || false,
  };
}

export default function CaseDetail() {
  const params = useParams<{ slug: string }>();
  const [isDesktop, setIsDesktop] = useState(false);

  // Extrair o ID do slug (formato: "caso-{id}")
  const caseId = params.slug?.startsWith("caso-") ? parseInt(params.slug.replace("caso-", ""), 10) : NaN;

  // Buscar todos os casos publicados para encontrar o actual e o próximo
  const { data: dbCasos = [], isLoading } = trpc.backoffice.casos.listPublic.useQuery();

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [params.slug]);

  const allCases = dbCasos.map(dbCasoToCaseStudy);
  const idx = allCases.findIndex((c) => c.id === String(caseId));
  const study = idx >= 0 ? allCases[idx] : null;
  const next = allCases.length > 1 ? allCases[(idx + 1) % allCases.length] : null;

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
        <Navbar />
        <div className="container" style={{ paddingTop: "5rem", paddingBottom: "4rem", textAlign: "center" }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--stone)" }}>A carregar...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!study) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
        <Navbar />
        <div className="container" style={{ paddingTop: "5rem", paddingBottom: "4rem", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "2rem", color: "var(--ink)", marginBottom: "1.5rem" }}>
            Caso não encontrado
          </h1>
          <Link href="/casos">
            <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowLeft size={16} />
              Ver todos os casos
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
      <Navbar />
      <SEO
        title={`${study.company} — Caso de Sucesso | TEAM 24`}
        description={study.tagline || `Descubra como ${study.company} transformou o bem-estar dos seus colaboradores com o programa EAP da TEAM 24.`}
        keywords={`caso de sucesso ${study.company}, EAP ${study.sector}, bem-estar colaboradores, TEAM 24`}
        canonicalPath={`/casos/${params.slug}`}
        jsonLd={[ORGANIZATION_LD, breadcrumbLD([{ name: "Início", path: "/" }, { name: "Casos de Sucesso", path: "/casos" }, { name: study.company, path: `/casos/${params.slug}` }])]}
      />

      {/* Header */}
      <div style={{ backgroundColor: "var(--ink)", paddingTop: "7rem", paddingBottom: "4rem" }}>
        <div className="container">
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "2rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            <Link href="/" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              Início
            </Link>
            <span>/</span>
            <Link href="/casos" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              Casos de Sucesso
            </Link>
            <span>/</span>
            <span style={{ color: "var(--coral)" }}>{study.company}</span>
          </div>

          {/* Sector label */}
          <div className="t-label mb-4" style={{ color: "var(--coral)" }}>
            {study.sector}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3.75rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "white",
              maxWidth: "22ch",
              marginBottom: "2rem",
            }}
          >
            {study.tagline}
          </h1>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "2.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {[
              { label: "Empresa", value: study.company },
              { label: "Setor", value: study.sector },
              { label: "Localização", value: study.location },
            ].filter(item => item.value).map((item) => (
              <div key={item.label}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "0.2rem" }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.75)" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cover image — inserida no texto como notícia */}

      {/* Metrics bar */}
      {study.metrics.length > 0 && (
        <div style={{ backgroundColor: "var(--pale)", borderBottom: "1px solid var(--pale-mid)" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${study.metrics.length}, 1fr)`,
                gap: "0",
              }}
            >
              {study.metrics.map((m, i) => (
                <div
                  key={m.label}
                  style={{
                    paddingTop: "2rem",
                    paddingBottom: "2rem",
                    paddingRight: "2rem",
                    borderRight: i < study.metrics.length - 1 ? "1px solid var(--pale-mid)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                      lineHeight: 1,
                      color: "var(--coral)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {m.value}
                  </div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "var(--ink)", marginBottom: "0.15rem" }}>
                    {m.label}
                  </div>
                  {m.description && (
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "var(--stone)", lineHeight: 1.4 }}>
                      {m.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Narrative content */}
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 300px" : "1fr",
            gap: isDesktop ? "5rem" : "3rem",
            paddingTop: "4rem",
            paddingBottom: "4rem",
          }}
        >
          {/* Main narrative */}
          <article style={{ order: isDesktop ? 1 : 2 }}>



            {/* Description */}
            {study.challenge && (
              <section style={{ marginBottom: "3.5rem" }}>
                <div className="t-label mb-3">Sobre o Caso</div>
                {study.challenge.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "1.05rem",
                      lineHeight: 1.8,
                      color: "var(--stone)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {para}
                  </p>
                ))}
              </section>
            )}

            {/* Pull quote */}
            {study.quote && (
              <blockquote
                style={{
                  borderLeft: "2px solid var(--coral)",
                  paddingLeft: "2rem",
                  margin: "3rem 0",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontStyle: "italic",
                    fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)",
                    lineHeight: 1.6,
                    color: "var(--ink)",
                    marginBottom: "1rem",
                  }}
                >
                  "{study.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {study.quoteAvatar && (
                    <img
                      src={study.quoteAvatar}
                      alt={study.quoteName}
                      style={{ width: "2.25rem", height: "2.25rem", objectFit: "cover", borderRadius: "50%" }}
                    />
                  )}
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>
                      {study.quoteName}
                    </div>
                    {study.quoteRole && (
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "var(--stone)" }}>
                        {study.quoteRole} · {study.company}
                      </div>
                    )}
                  </div>
                </div>
              </blockquote>
            )}
          </article>

          {/* Sidebar */}
          <aside style={{ paddingTop: "0.5rem", order: isDesktop ? 2 : 1 }}>
            {/* Foto da empresa na sidebar */}
            {study.coverImage && (
              <div style={{ marginBottom: "2rem" }}>
                <img
                  src={study.coverImage}
                  alt={`Caso de sucesso TEAM 24 — ${study.company}`}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    objectPosition: "center top",
                    display: "block",
                    borderRadius: "4px",
                  }}
                />
              </div>
            )}
            {/* Company info */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--stone)",
                  marginBottom: "1rem",
                }}
              >
                Sobre a Empresa
              </div>
              {[
                { label: "Empresa", value: study.company },
                { label: "Setor", value: study.sector },
                { label: "Localização", value: study.location },
              ].filter(item => item.value).map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid var(--pale-mid)",
                  }}
                >
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "var(--stone)" }}>
                    {item.label}
                  </span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.78rem", color: "var(--ink)", textAlign: "right", maxWidth: "55%" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "2.5rem" }} />

            {/* CTA */}
            <div>
              <div
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  lineHeight: 1.3,
                  color: "var(--ink)",
                  marginBottom: "0.75rem",
                }}
              >
                Quer resultados semelhantes?
              </div>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                  color: "var(--stone)",
                  marginBottom: "1.25rem",
                }}
              >
                Fale connosco e receba uma proposta personalizada em menos de 24 horas.
              </p>
              <Link href="/agendar" style={{ textDecoration: "none" }}>
                <button onClick={() => trackAgendarClick("case_detail")} className="btn-coral" style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem", padding: "0.75rem 1.5rem" }}>
                  Agendar Reunião Gratuita
                </button>
              </Link>
            </div>

            {/* All cases link */}
            <div style={{ marginTop: "1.5rem" }}>
              <Link
                href="/casos"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "var(--stone)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--stone)")}
              >
                <ArrowLeft size={14} />
                Ver todos os casos
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Next case */}
      {next && next.id !== study.id && (
        <div style={{ backgroundColor: "var(--pale)", borderTop: "1px solid var(--pale-mid)" }}>
          <div className="container">
            <Link href={`/casos/${next.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  paddingTop: "3rem",
                  paddingBottom: "3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "2rem",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--stone)", marginBottom: "0.5rem" }}>
                    Próximo caso
                  </div>
                  <div
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                      color: "var(--ink)",
                    }}
                  >
                    {next.company} — {next.sector}
                  </div>
                </div>
                <ArrowRight size={24} style={{ color: "var(--coral)", flexShrink: 0 }} />
              </div>
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
