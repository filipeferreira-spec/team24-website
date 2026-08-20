/* ============================================================
   TEAM 24 — Artigos de Opinião: Listagem
   Área para psicólogos e especialistas TEAM 24 partilharem
   perspetivas e conhecimento. Sem filtros, layout editorial.
   ============================================================ */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ARTIGOS_OPINIAO } from "@/lib/opiniaoData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, breadcrumbLD } from "@/components/SEO";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export default function Opiniao() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const artigos = [...ARTIGOS_OPINIAO].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const columns = isDesktop ? 3 : 1;

  const jsonLd = [
    ORGANIZATION_LD,
    breadcrumbLD([
      { name: "Início", path: "/" },
      { name: "Artigos de Opinião", path: "/opiniao" },
    ]),
  ];

  return (
    <>
      <SEO
        title="Artigos de Opinião | TEAM 24"
        description="Perspetivas e conhecimento dos psicólogos e especialistas TEAM 24 sobre saúde mental, bem-estar organizacional e liderança."
        canonicalPath="/opiniao"
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{
          paddingTop: "120px",
          paddingBottom: "4rem",
          backgroundColor: "var(--ink)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            paddingLeft: "clamp(1.5rem, 5vw, 4rem)",
            paddingRight: "clamp(1.5rem, 5vw, 4rem)",
            display: isDesktop ? "flex" : "block",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "2rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "0.75rem",
              }}
            >
              Perspetivas dos nossos especialistas
            </p>
            <h1
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "white",
                marginBottom: "1rem",
              }}
            >
              Artigos de{" "}
              <em style={{ color: "var(--coral)", fontStyle: "italic" }}>Opinião.</em>
            </h1>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.45)",
                maxWidth: "520px",
              }}
            >
              Os psicólogos e especialistas da TEAM 24 partilham o seu conhecimento sobre saúde mental,
              bem-estar organizacional e liderança saudável.
            </p>
          </div>
        </div>
      </section>

      {/* ── Grid de artigos ── */}
      <div
        className="container"
        style={{
          paddingTop: isDesktop ? "4rem" : "2rem",
          paddingBottom: isDesktop ? "4rem" : "2.5rem",
        }}
      >
        {artigos.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "4rem", paddingBottom: "4rem" }}>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1rem",
                color: "var(--stone)",
              }}
            >
              Em breve, os nossos especialistas partilharão os seus artigos aqui.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: "2.5rem",
            }}
          >
            {artigos.map((artigo) => (
              <Link
                key={artigo.id}
                href={`/opiniao/${artigo.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <article
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    backgroundColor: "white",
                    border: "1px solid var(--pale-mid)",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(10,26,42,0.10)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Imagem */}
                  <div
                    style={{
                      overflow: "hidden",
                      aspectRatio: "16/9",
                      backgroundColor: "var(--pale)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={artigo.imagemCapa}
                      alt={artigo.titulo}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.4s ease",
                        display: "block",
                      }}
                    />
                  </div>

                  {/* Conteúdo */}
                  <div
                    style={{
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    {/* Categoria / subtítulo */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--coral)",
                        }}
                      >
                        {artigo.subtitulo ?? "Opinião"}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.72rem",
                          color: "var(--stone)",
                        }}
                      >
                        {formatDate(artigo.data)}
                      </span>
                    </div>

                    {/* Título */}
                    <h3
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        lineHeight: 1.35,
                        letterSpacing: "-0.01em",
                        color: "var(--ink)",
                        marginBottom: "0.75rem",
                        flex: 1,
                      }}
                    >
                      {artigo.titulo}
                    </h3>

                    {/* Resumo */}
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.85rem",
                        lineHeight: 1.65,
                        color: "var(--stone)",
                        marginBottom: "1.25rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {artigo.resumo}
                    </p>

                    {/* Autor */}
                    <div
                      style={{
                        borderTop: "1px solid var(--pale-mid)",
                        paddingTop: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.78rem",
                          color: "var(--stone)",
                          opacity: 0.7,
                        }}
                      >
                        {artigo.autor} · {artigo.autorCargo}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
