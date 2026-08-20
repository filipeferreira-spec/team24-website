/* ============================================================
   TEAM 24 — Blog Post Detail (DB Articles)
   Página de detalhe para artigos gerados automaticamente
   ============================================================ */

import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, breadcrumbLD } from "@/components/SEO";
import { trackAgendarClick } from "@/lib/analytics";

function formatDate(ts: number | string | Date) {
  return new Date(ts).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

function estimateReadTime(text: string): number {
  return Math.max(3, Math.round(text.split(/\s+/).length / 200));
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const bodyStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "1.05rem",
    lineHeight: 1.8,
    color: "var(--stone)",
  };

  function formatInline(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink);font-weight:700">$1</strong>')
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)",
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginTop: "3rem",
            marginBottom: "1rem",
          }}
        >
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "1.2rem",
            color: "var(--ink)",
            marginTop: "2rem",
            marginBottom: "0.75rem",
          }}
        >
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
          {items.map((item, j) => (
            <li
              key={j}
              style={{ ...bodyStyle, marginBottom: "0.5rem" }}
              dangerouslySetInnerHTML={{ __html: formatInline(item) }}
            />
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
          {items.map((item, j) => (
            <li
              key={j}
              style={{ ...bodyStyle, marginBottom: "0.5rem" }}
              dangerouslySetInnerHTML={{ __html: formatInline(item) }}
            />
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          style={{
            borderLeft: "3px solid var(--coral)",
            paddingLeft: "1.5rem",
            marginLeft: 0,
            marginBottom: "1.5rem",
            fontStyle: "italic",
            color: "var(--stone)",
          }}
          dangerouslySetInnerHTML={{ __html: formatInline(line.replace("> ", "")) }}
        />
      );
    } else if (line.trim() === "" || line.startsWith("---")) {
      // skip
    } else if (line.trim().length > 0) {
      elements.push(
        <p
          key={i}
          style={{ ...bodyStyle, marginBottom: "1.5rem" }}
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }
    i++;
  }

  return elements;
}

export default function BlogPostDB() {
  const { id } = useParams<{ id: string }>();
  const { data: artigos, isLoading } = trpc.backoffice.recursos.listPublicArtigos.useQuery();

  const artigo = artigos?.find((a) => String(a.id) === id);

  if (isLoading) {
    return (
      <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
        <Navbar />
        <div className="container" style={{ paddingTop: "8rem", paddingBottom: "4rem", textAlign: "center" }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--stone)" }}>A carregar artigo...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artigo) {
    return (
      <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
        <Navbar />
        <div className="container" style={{ paddingTop: "8rem", paddingBottom: "4rem", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Lato', sans-serif", color: "var(--ink)", marginBottom: "1rem" }}>Artigo não encontrado</h1>
          <Link href="/blog" style={{ color: "var(--coral)" }}>Voltar ao Blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const readTime = estimateReadTime(artigo.descricao || "");
  const publishedAt = new Date(artigo.createdAt || Date.now()).toISOString();

  return (
    <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
      <SEO
        title={`${artigo.titulo} — Blog TEAM 24`}
        description={(artigo.descricao || "").substring(0, 160)}
        keywords={artigo.tema || "saúde mental trabalho, bem-estar empresas"}
        canonicalPath={`/blog/artigo/${artigo.id}`}
        jsonLd={[
          ORGANIZATION_LD,
          breadcrumbLD([
            { name: "Início", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: artigo.titulo, path: `/blog/artigo/${artigo.id}` },
          ]),
        ]}
      />
      <Navbar />

      {/* Hero */}
      <div style={{ backgroundColor: "var(--ink)", paddingTop: "5rem", paddingBottom: "4rem" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              marginBottom: "2rem",
              letterSpacing: "0.04em",
            }}
          >
            ← Blog
          </Link>

          <div style={{ marginBottom: "1.5rem" }}>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--coral)",
              }}
            >
              {artigo.tema || "Blog"}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "white",
              marginBottom: "2rem",
            }}
          >
            {artigo.titulo}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
              TEAM 24 · Equipa Editorial
            </span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)" }}>
              {formatDate(publishedAt)}
            </span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)" }}>
              {readTime} min de leitura
            </span>
          </div>
        </div>
      </div>

      {/* Cover image */}
      {artigo.imageUrl && (
        <div style={{ width: "100%", maxHeight: "480px", overflow: "hidden" }}>
          <img
            src={artigo.imageUrl}
            alt={artigo.titulo}
            style={{ width: "100%", height: "480px", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      {/* Article body */}
      <div className="container" style={{ paddingTop: "4rem", paddingBottom: "6rem", maxWidth: "860px" }}>
        <div style={{ maxWidth: "680px" }}>
          {renderMarkdown(artigo.descricao || "")}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: "4rem",
            padding: "2.5rem",
            backgroundColor: "var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "white",
                marginBottom: "0.5rem",
              }}
            >
              Pronto para transformar o bem-estar da sua equipa?
            </p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
              Agende uma demonstração gratuita da plataforma TEAM 24.
            </p>
          </div>
          <Link
            href="/agendar"
            style={{
              display: "inline-block",
              backgroundColor: "var(--coral)",
              color: "white",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.04em",
              padding: "0.85rem 1.75rem",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
            onClick={() => trackAgendarClick("blog_post_db")}
          >
            Agendar Reunião Gratuita
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
