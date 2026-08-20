/* ============================================================
   TEAM 24 — Artigo de Opinião: Detalhe
   Layout editorial limpo, sem filtros, com referências.
   ============================================================ */
import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Linkedin } from "lucide-react";
import { ARTIGOS_OPINIAO } from "@/lib/opiniaoData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { breadcrumbLD, ORGANIZATION_LD } from "@/components/SEO";
import { renderContent } from "@/lib/renderContent";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export default function OpiniaoPost() {
  const { slug } = useParams<{ slug: string }>();
  const artigo = ARTIGOS_OPINIAO.find((a) => a.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  if (!artigo) {
    return (
      <>
        <Navbar />
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "120px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#4A6A7A",
          }}
        >
          <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>Artigo não encontrado.</p>
          <Link href="/opiniao">
            <span style={{ color: "#25749F", fontWeight: 600, cursor: "pointer" }}>
              Voltar aos Artigos de Opinião
            </span>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const jsonLd = [
    ORGANIZATION_LD,
    breadcrumbLD([
      { name: "Início", path: "/" },
      { name: "Artigos de Opinião", path: "/opiniao" },
      { name: artigo.titulo, path: `/opiniao/${artigo.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: artigo.titulo,
      author: {
        "@type": "Person",
        name: artigo.autor,
        jobTitle: artigo.autorCargo,
      },
      publisher: ORGANIZATION_LD,
      datePublished: artigo.data,
      image: artigo.imagemCapa,
      description: artigo.resumo,
    },
  ];

  const shareUrl = `https://www.team24.pt/opiniao/${artigo.slug}`;

  return (
    <>
      <SEO
        title={`${artigo.titulo} | TEAM 24`}
        description={artigo.resumo}
        canonicalPath={`/opiniao/${artigo.slug}`}
        ogType="article"
        ogImage={artigo.imagemCapa}
        publishedAt={artigo.data}
        author={artigo.autor}
        jsonLd={jsonLd}
      />
      <Navbar />

      {/* ── Breadcrumb ── */}
      <div
        style={{
          paddingTop: "100px",
          paddingBottom: "0",
          backgroundColor: "#F4F8FB",
          borderBottom: "1px solid #D0E2EC",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "1.25rem clamp(1.5rem, 5vw, 2rem)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.8rem",
            color: "#7BAFC8",
          }}
        >
          <Link href="/">
            <span style={{ cursor: "pointer" }}>Início</span>
          </Link>
          <span>/</span>
          <Link href="/opiniao">
            <span style={{ cursor: "pointer" }}>Artigos de Opinião</span>
          </Link>
          <span>/</span>
          <span style={{ color: "#4A6A7A", fontWeight: 500 }}>{artigo.titulo.substring(0, 40)}...</span>
        </div>
      </div>

      {/* ── Hero do artigo ── */}
      <header
        style={{
          backgroundColor: "#F4F8FB",
          paddingBottom: "3rem",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "2.5rem clamp(1.5rem, 5vw, 2rem) 0",
          }}
        >
          {artigo.subtitulo && (
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#DB5C34",
                marginBottom: "0.75rem",
              }}
            >
              {artigo.subtitulo}
            </p>
          )}
          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#0A1A2A",
              marginBottom: "2rem",
            }}
          >
            {artigo.titulo}
          </h1>

          {/* Autor + data */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid #D0E2EC",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#0A1A2A",
                }}
              >
                {artigo.autor}
              </p>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.8rem",
                  color: "#7BAFC8",
                }}
              >
                {artigo.autorCargo} · {formatDate(artigo.data)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Imagem de capa ── */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 clamp(1.5rem, 5vw, 2rem)",
        }}
      >
        <div
          style={{
            marginTop: "-1px",
            overflow: "hidden",
            aspectRatio: "16/9",
            backgroundColor: "#E8F0F5",
          }}
        >
          <img
            src={artigo.imagemCapa}
            alt={artigo.titulo}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* ── Corpo do artigo ── */}
      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "3rem clamp(1.5rem, 5vw, 2rem) 5rem",
        }}
      >
        <div>{renderContent(artigo.conteudo)}</div>

        {/* ── Tags ── */}
        {artigo.tags.length > 0 && (
          <div
            style={{
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "1px solid #D0E2EC",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {artigo.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#25749F",
                  backgroundColor: "#E8F4FB",
                  padding: "0.3rem 0.75rem",
                  letterSpacing: "0.03em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}



        {/* ── Partilhar ── */}
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid #D0E2EC",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#0A1A2A",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Partilhar
          </span>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(artigo.titulo)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#25749F",
              textDecoration: "none",
            }}
          >
            <Linkedin size={16} />
            LinkedIn
          </a>
        </div>

        {/* ── Voltar ── */}
        <div style={{ marginTop: "3rem" }}>
          <Link href="/opiniao">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#25749F",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
              Voltar aos Artigos de Opinião
            </span>
          </Link>
        </div>
      </main>

      {/* ── Artigos relacionados ── */}
      {(() => {
        const outros = ARTIGOS_OPINIAO.filter((a) => a.slug !== artigo.slug).slice(0, 4);
        if (outros.length === 0) return null;
        return (
          <section
            style={{
              backgroundColor: "#F4F8FB",
              borderTop: "1px solid #D0E2EC",
              padding: "4rem clamp(1.5rem, 5vw, 4rem)",
            }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--coral)",
                  marginBottom: "0.75rem",
                }}
              >
                Outros Artigos
              </p>
              <h2
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
                  color: "var(--ink)",
                  marginBottom: "2rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Continue a ler
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(outros.length, 4)}, 1fr)`,
                  gap: "1.5rem",
                }}
              >
                {outros.map((outro) => (
                  <Link
                    key={outro.id}
                    href={`/opiniao/${outro.slug}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <article
                      style={{
                        backgroundColor: "white",
                        border: "1px solid var(--pale-mid)",
                        cursor: "pointer",
                        transition: "box-shadow 0.2s, transform 0.2s",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(10,26,42,0.10)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          overflow: "hidden",
                          aspectRatio: "16/9",
                          backgroundColor: "var(--pale)",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={outro.imagemCapa}
                          alt={outro.titulo}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                            display: "block",
                          }}
                        />
                      </div>
                      {/* Texto */}
                      <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                        <span
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--coral)",
                            marginBottom: "0.4rem",
                            display: "block",
                          }}
                        >
                          {outro.subtitulo ?? "Opinião"}
                        </span>
                        <h3
                          style={{
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            lineHeight: 1.35,
                            color: "var(--ink)",
                            marginBottom: "0.5rem",
                            flex: 1,
                          }}
                        >
                          {outro.titulo}
                        </h3>
                        <p
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: "0.75rem",
                            color: "var(--stone)",
                            opacity: 0.7,
                          }}
                        >
                          {outro.autor}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      <Footer />
    </>
  );
}
