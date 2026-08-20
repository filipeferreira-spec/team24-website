/* ============================================================
   TEAM 24 — Blog Post Detail Page v2: Editorial Clarity
   Design: Full editorial layout. No cards, no shadows.
   Clean typography, generous whitespace, sidebar with rules.
   ============================================================ */

import { useEffect, useState } from "react";
import { trackAgendarClick } from "@/lib/analytics";
import { Link, useParams } from "wouter";
import { ArrowLeft, Linkedin, Twitter } from "lucide-react";
import { getPostBySlug, getRelatedPosts, categories, type BlogPost } from "@/lib/blogData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { blogPostLD, breadcrumbLD } from "@/components/SEO";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink);font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const bodyStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.92rem",
    lineHeight: 1.75,
    color: "var(--stone)",
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)",
            lineHeight: 1.2,
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
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--ink)",
            marginTop: "2rem",
            marginBottom: "0.75rem",
          }}
        >
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("| ")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const headers = tableLines[0].split("|").filter((c) => c.trim()).map((c) => c.trim());
      const rows = tableLines.slice(2).map((row) =>
        row.split("|").filter((c) => c.trim()).map((c) => c.trim())
      );
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: "auto", margin: "2rem 0", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", minWidth: "480px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--ink)" }}>
                {headers.map((h, hi) => (
                  <th
                    key={hi}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--ink)",
                      padding: "0.75rem 1rem 0.75rem 0",
                      textAlign: "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid var(--pale-mid)" }}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.9rem",
                        color: "var(--stone)",
                        padding: "0.75rem 1rem 0.75rem 0",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.match(/^\d+\. /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: "1.5rem 0", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {listItems.map((item, li) => (
            <li
              key={li}
              style={{ ...bodyStyle, listStyleType: "decimal" }}
              dangerouslySetInnerHTML={{ __html: formatInline(item) }}
            />
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith("- ")) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].replace("- ", ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "1.5rem 0", paddingLeft: "0", display: "flex", flexDirection: "column", gap: "0.5rem", listStyle: "none" }}>
          {listItems.map((item, li) => (
            <li
              key={li}
              style={{ ...bodyStyle, display: "flex", gap: "0.75rem", alignItems: "flex-start" }}
            >
              <span style={{ display: "inline-block", width: "1.25rem", height: "2px", backgroundColor: "var(--coral)", marginTop: "0.75rem", flexShrink: 0 }} />
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.startsWith("*") && line.endsWith("*") && line.length > 2) {
      elements.push(
        <blockquote
          key={i}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontStyle: "italic",
            fontSize: "1.15rem",
            lineHeight: 1.6,
            color: "var(--ink)",
            borderLeft: "2px solid var(--coral)",
            paddingLeft: "1.5rem",
            margin: "2rem 0",
          }}
          dangerouslySetInnerHTML={{ __html: formatInline(line.slice(1, -1)) }}
        />
      );
    } else if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      // ignorar separadores horizontais
    } else if (line.trim() !== "") {
      elements.push(
        <p
          key={i}
          style={{ ...bodyStyle, margin: "1rem 0" }}
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }

    i++;
  }

  return elements;
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [copied, setCopied] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (params.slug) {
      const found = getPostBySlug(params.slug);
      if (found) {
        setPost(found);
        setRelated(getRelatedPosts(found, 3));
      }
    }
  }, [params.slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!post) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--cream)", overflowX: "hidden" }}>
        <Navbar />
        <div className="container" style={{ paddingTop: "5rem", paddingBottom: "4rem", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "2rem",
              color: "var(--ink)",
              marginBottom: "1.5rem",
            }}
          >
            Artigo não encontrado
          </h1>
          <Link href="/blog">
            <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowLeft size={16} />
              Voltar ao Blog
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryLabel = categories.find((c) => c.value === post.category)?.label || post.category;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--cream)", overflowX: "hidden" }}>
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={post.tags.join(", ")}
        ogImage={post.coverImage}
        ogType="article"
        canonicalPath={`/blog/${post.slug}`}
        publishedAt={post.publishedAt}
        author={post.author.name}
        jsonLd={[blogPostLD(post), breadcrumbLD([{ name: "Início", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }])]}
      />
      <Navbar />

      {/* Article header */}
      <div style={{ backgroundColor: "var(--ink)", paddingTop: "7rem", paddingBottom: "4rem", overflowX: "hidden" }}>
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
            <Link href="/blog" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              Blog
            </Link>
            <span>/</span>
            <span style={{ color: "var(--coral)" }}>{categoryLabel}</span>
          </div>

          {/* Category */}
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--coral)",
              marginBottom: "1rem",
            }}
          >
            {categoryLabel}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "white",
              maxWidth: "860px",
              marginBottom: "2rem",
            }}
          >
            {post.title}
          </h1>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
              {formatDate(post.publishedAt)}
            </span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
              {post.readTime} min de leitura
            </span>
          </div>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 280px" : "1fr",
            gap: isDesktop ? "5rem" : "3rem",
            paddingTop: "4rem",
            paddingBottom: "4rem",
          }}
        >
          {/* Main content */}
          <article style={{ minWidth: 0, overflow: "hidden" }}>
            {/* Cover image — inside article, editorial style */}
            <div
              style={{
                marginBottom: "2.5rem",
                overflow: "hidden",
              }}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                style={{
                  width: "100%",
                  maxHeight: "420px",
                  objectFit: "cover",
                  objectPosition: "center top",
                  display: "block",
                }}
              />
            </div>

            {/* Lead */}
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontStyle: "italic",
          fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
          lineHeight: 1.65,
          color: "var(--ink)",
          marginBottom: "2.5rem",
                paddingBottom: "2.5rem",
                borderBottom: "1px solid var(--pale-mid)",
              }}
            >
              {post.excerpt}
            </p>

            {/* Body */}
            <div>{renderContent(post.content)}</div>

            {/* References */}
            {post.references && post.references.length > 0 && (
              <div
                style={{
                  marginTop: "3rem",
                  paddingTop: "2rem",
                  borderTop: "1px solid var(--pale-mid)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "var(--stone)",
                    marginBottom: "1rem",
                  }}
                >
                  Referências
                </h3>
                <ol
                  style={{
                    listStyle: "decimal",
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  {post.references.map((ref, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.78rem",
                        lineHeight: 1.7,
                        color: "var(--stone)",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: ref.replace(
                          /(https?:\/\/[^\s]+)/g,
                          '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--coral);text-decoration:underline;word-break:break-all;">$1</a>'
                        ),
                      }}
                    />
                  ))}
                </ol>
              </div>
            )}

            {/* Tags */}
            <div
              style={{
                marginTop: "3rem",
                paddingTop: "2rem",
                borderTop: "1px solid var(--pale-mid)",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--stone)",
                    border: "1px solid var(--pale-mid)",
                    padding: "0.25rem 0.75rem",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Share */}
            <div
              style={{
                marginTop: "2rem",
                paddingTop: "2rem",
                borderTop: "1px solid var(--pale-mid)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--stone)" }}>
                Partilhar
              </span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--stone)", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stone)")}
              >
                <Linkedin size={18} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--stone)", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stone)")}
              >
                <Twitter size={18} />
              </a>
              <button
                onClick={handleShare}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.78rem",
                  color: copied ? "var(--coral)" : "var(--stone)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.15s",
                  padding: 0,
                }}
              >
                {copied ? "Link copiado!" : "Copiar link"}
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ paddingTop: "0.5rem" }}>


            {/* Related */}
            {related.length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--stone)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Artigos Relacionados
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {related.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/blog/${rel.slug}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <article
                        style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.65")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        <div style={{ overflow: "hidden", aspectRatio: "16/9", marginBottom: "0.75rem" }}>
                          <img
                            src={rel.coverImage}
                            alt={rel.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </div>
                        <div
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--coral)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {categories.find((c) => c.value === rel.category)?.label}
                        </div>
                        <h4
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            lineHeight: 1.4,
                            color: "var(--ink)",
                          }}
                        >
                          {rel.title}
                        </h4>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", margin: "3rem 0" }} />

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
                Pronto para transformar o bem-estar na sua empresa?
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
                Descubra como a TEAM 24 pode ajudar os seus colaboradores.
              </p>
              <Link href="/agendar" style={{ textDecoration: "none" }}>
                <button onClick={() => trackAgendarClick("blog_post")} className="btn-coral" style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem", padding: "0.75rem 1.5rem" }}>
                  Pedir Demo Gratuita
                </button>
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
