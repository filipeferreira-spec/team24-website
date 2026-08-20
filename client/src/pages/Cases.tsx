/* ============================================================
   TEAM 24 — Cases of Success Listing Page: Editorial Clarity
   Design: No cards, no shadows. Asymmetric editorial layout.
   Featured case full-width, rest as typographic rows.
   ============================================================ */

import { useState, useEffect, useMemo } from "react";
import { trackAgendarClick } from "@/lib/analytics";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { type CaseStudy } from "@/lib/casesData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { getLogoByName } from "@/lib/companyLogos";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

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

export default function Cases() {
  // Buscar casos publicados da base de dados
  const { data: dbCasos = [] } = trpc.backoffice.casos.listPublic.useQuery();

  // Apenas dados da BD (geridos pelo backoffice)
  const allCases = useMemo(() => {
    return dbCasos.map(dbCasoToCaseStudy);
  }, [dbCasos]);

  const featured = allCases.find((c) => c.featured) || allCases[0];
  const rest = allCases.filter((c) => c !== featured);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
      <Navbar />

      <SEO
        title="Casos de Sucesso | Empresas que Transformaram o Bem-estar | TEAM 24"
        description="Descubra como empresas portuguesas melhoraram o bem-estar dos colaboradores com o EAP da TEAM 24. Casos reais com métricas de impacto: redução do absentismo, aumento da produtividade."
        keywords="casos de sucesso EAP, empresas saúde mental Portugal, resultados bem-estar colaboradores"
        canonicalPath="/casos"
        jsonLd={[ORGANIZATION_LD, breadcrumbLD([{ name: "Início", path: "/" }, { name: "Casos de Sucesso", path: "/casos" }])]}
      />
      {/* Page header */}
      <div style={{ backgroundColor: "var(--ink)", paddingTop: "5rem", paddingBottom: "3rem" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "2rem",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              paddingBottom: "3rem",
            }}
          >
            <div>
              <div className="t-label mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                Casos de Sucesso
              </div>
              <h1
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(2.5rem, 5vw, 5rem)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.03em",
                  color: "white",
                  maxWidth: "16ch",
                }}
              >
                Empresas que{" "}
                <em style={{ color: "var(--coral)", fontStyle: "italic" }}>lideram pelo exemplo.</em>
              </h1>
            </div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.45)",
                maxWidth: "36ch",
              }}
            >
              Histórias reais, dados concretos: como empresas portuguesas transformaram resultados ao investir na saúde mental.
            </p>
          </div>

          {/* Stats bar */}
          <div
            style={{
              paddingTop: "2.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
            }}
          >
            {[
              { value: "200+", label: "Empresas parceiras" },
              { value: "200K+", label: "Colaboradores apoiados" },
              { value: "4.9/5", label: "Satisfação dos utilizadores" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    lineHeight: 1,
                    color: "var(--coral)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: "4rem", paddingBottom: "6rem" }}>

        {/* Estado vazio */}
        {allCases.length === 0 && (
          <div style={{ textAlign: "center", padding: "6rem 0" }}>
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "var(--ink)", marginBottom: "1rem" }}>
              Em breve
            </p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "var(--stone)" }}>
              Os nossos casos de sucesso estão a ser preparados. Volte em breve.
            </p>
          </div>
        )}

        {/* Grid de casos — 3 por linha */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "repeat(1, 1fr)",
            gap: "2.5rem",
          }}
        >
          {allCases.map((c) => (
            <Link key={c.slug} href={`/casos/${c.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <article
                style={{
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  height: "100%",
                  border: "1px solid var(--pale-mid)",
                  backgroundColor: "white",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(10,26,42,0.10)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  const img = (e.currentTarget as HTMLElement).querySelector("img.case-cover");
                  if (img) (img as HTMLImageElement).style.transform = "scale(1.04)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  const img = (e.currentTarget as HTMLElement).querySelector("img.case-cover");
                  if (img) (img as HTMLImageElement).style.transform = "scale(1)";
                }}
              >
                {/* Imagem de capa */}
                <div style={{ overflow: "hidden", aspectRatio: "16/9", flexShrink: 0 }}>
                  <img
                    className="case-cover"
                    src={c.coverImage}
                    alt={c.company}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>

                {/* Conteúdo */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Sector + logo */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                    {c.logo && (
                      <img
                        src={c.logo}
                        alt={c.company}
                        style={{ height: "20px", width: "auto", maxWidth: "80px", objectFit: "contain" }}
                      />
                    )}
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--coral)",
                      }}
                    >
                      {c.sector}
                    </span>
                    {c.featured && (
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "white", background: "var(--coral)", padding: "0.15rem 0.5rem" }}>
                        Destaque
                      </span>
                    )}
                  </div>

                  {/* Empresa */}
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--ink)", marginBottom: "0.75rem" }}>
                    {c.company}
                  </div>

                  {/* Excerto do texto do case study */}
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.875rem",
                      lineHeight: 1.65,
                      color: "var(--stone)",
                      marginBottom: "1.25rem",
                      flex: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                    }}
                  >
                    {c.challenge || c.tagline}
                  </p>

                  {/* Métricas */}
                  {c.metrics.length > 0 && (
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid var(--pale-mid)", marginBottom: "1rem" }}>
                      {c.metrics.slice(0, 2).map((m) => (
                        <div key={m.label}>
                          <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--coral)", lineHeight: 1 }}>
                            {m.value}
                          </div>
                          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", color: "var(--stone)", marginTop: "0.15rem" }}>
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      color: "var(--ink)",
                    }}
                  >
                    Ler caso completo
                    <ArrowRight size={13} />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA section */}
        <div
          style={{
            marginTop: "5rem",
            paddingTop: "4rem",
            borderTop: "2px solid var(--coral)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "1.5rem",
          }}
          className="md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                marginBottom: "0.5rem",
              }}
            >
              A sua empresa pode ser o próximo caso de sucesso.
            </h3>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "var(--stone)" }}>
              Comece com uma demo gratuita. Sem compromisso.
            </p>
          </div>
          <Link href="/agendar" style={{ textDecoration: "none", flexShrink: 0 }}>
            <button onClick={() => trackAgendarClick("cases_page")} className="btn-coral">
              Agendar Reunião Gratuita
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
