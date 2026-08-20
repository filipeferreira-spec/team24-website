/* ============================================================
   TEAM 24 — Blog Listing Page v2: Editorial Clarity
   Design: Article list without cards. Category filters as text tabs.
   Featured article full-width at top. Clean typographic rows.
   Artigos: estáticos (blogData.ts) + gerados automaticamente (BD via tRPC)
   ============================================================ */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { blogPosts, categories } from "@/lib/blogData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, breadcrumbLD } from "@/components/SEO";
import { trpc } from "@/lib/trpc";

function formatDate(dateStr: string | number | Date) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(3, Math.round(words / 200));
}

function extractExcerpt(descricao: string): string {
  // Remove o comentário de keywords e o separador, pega a primeira frase do conteúdo
  const cleaned = descricao
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^---\s*/m, "")
    .replace(/#+\s/g, "")
    .replace(/\*\*/g, "")
    .trim();
  // Pega a primeira linha não vazia que não seja a meta descrição
  const lines = cleaned.split("\n").filter((l) => l.trim().length > 20);
  return lines[0]?.substring(0, 180) + "..." || "";
}

// Imagem de fallback para artigos sem imagem
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80";

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isDesktop, setIsDesktop] = useState(false);
  const POSTS_PER_PAGE = 9;
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Buscar artigos gerados automaticamente da BD
  const { data: dbArtigos, isLoading } = trpc.backoffice.recursos.listPublicArtigos.useQuery();

  // Converter artigos da BD para o formato BlogPost
  const dbPosts = (dbArtigos || []).map((a) => ({
    id: String(a.id),
    slug: `db-${a.id}`,
    title: a.titulo,
    excerpt: extractExcerpt(a.descricao || ""),
    content: a.descricao || "",
    category: mapTemaToCategory(a.tema || ""),
    categoryColor: "var(--coral)",
    author: { name: "TEAM 24", role: "Equipa Editorial", avatar: "" },
    publishedAt: new Date(a.createdAt || Date.now()).toISOString(),
    readTime: estimateReadTime(a.descricao || ""),
    coverImage: a.imageUrl || FALLBACK_IMAGE,
    tags: [],
    isFromDB: true,
  }));

  // Combinar artigos estáticos + BD e ordenar por data decrescente (mais recentes primeiro)
  const allPosts = [...dbPosts, ...blogPosts.map((p) => ({ ...p, isFromDB: false }))]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Filtrar por categoria
  const filtered =
    activeCategory === "all"
      ? allPosts
      : allPosts.filter((p) => p.category === activeCategory);

  // Reset visibleCount quando muda de categoria
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(POSTS_PER_PAGE);
  };

  const visiblePosts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const columns = isDesktop ? 3 : 1;

  return (
    <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
      <SEO
        title="Blog — Saúde Mental, Burnout e Bem-Estar nas Empresas"
        description="Artigos, guias e perspetivas sobre saúde mental no trabalho, prevenção de burnout, bem-estar corporativo e gestão de RH. Conteúdo especializado para líderes e profissionais de RH."
        keywords="saúde mental trabalho, burnout empresas, bem-estar corporativo, EAP Portugal, gestão RH, engagement colaboradores, absentismo, produtividade"
        canonicalPath="/blog"
        jsonLd={[ORGANIZATION_LD, breadcrumbLD([{ name: "Início", path: "/" }, { name: "Blog", path: "/blog" }])]}
      />
      <Navbar />

      {/* Page header */}
      <div style={{ backgroundColor: "var(--ink)", paddingTop: isDesktop ? "5rem" : "3rem", paddingBottom: isDesktop ? "4rem" : "2.5rem" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              flexDirection: isDesktop ? "row" : "column",
              alignItems: isDesktop ? "flex-end" : "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: isDesktop ? "2rem" : "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              paddingBottom: isDesktop ? "3rem" : "1.5rem",
            }}
          >
            <div>
              <div className="t-label mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                Blog
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
                Saúde mental{" "}
                <em style={{ color: "var(--coral)", fontStyle: "italic" }}>no trabalho.</em>
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
              Artigos, guias e perspetivas para líderes e profissionais de RH que querem criar ambientes de trabalho mais saudáveis.
            </p>
          </div>

          {/* Category filters */}
          <div style={{ paddingTop: "2rem", display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: activeCategory === cat.value ? 700 : 400,
                  fontSize: "0.82rem",
                  letterSpacing: "0.02em",
                  color: activeCategory === cat.value ? "white" : "rgba(255,255,255,0.35)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.4rem 0.75rem",
                  borderBottom: activeCategory === cat.value ? "1px solid var(--coral)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: isDesktop ? "4rem" : "2rem", paddingBottom: isDesktop ? "4rem" : "2.5rem" }}>
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: "2.5rem",
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "white",
                  border: "1px solid var(--pale-mid)",
                  height: "380px",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "4rem", paddingBottom: "4rem" }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "var(--stone)" }}>
              Nenhum artigo encontrado nesta categoria.
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
            {visiblePosts.map((post) => {
              const cat = categories.find((c) => c.value === post.category)?.label || post.category;
              const href = post.isFromDB ? `/blog/artigo/${post.id}` : `/blog/${post.slug}`;
              return (
                <Link
                  key={post.id}
                  href={href}
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
                    <div style={{ overflow: "hidden", aspectRatio: "16/9", flexShrink: 0 }}>
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        width={640}
                        height={360}
                        loading="lazy"
                        decoding="async"
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
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
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
                          {cat}
                        </span>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "var(--stone)" }}>
                          {post.readTime} min
                        </span>
                      </div>

                      <h3
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                          color: "var(--ink)",
                          marginBottom: "0.6rem",
                        }}
                      >
                        {post.title}
                      </h3>

                      <p
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.85rem",
                          lineHeight: 1.6,
                          color: "var(--stone)",
                          flex: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                          marginBottom: "1.25rem",
                        }}
                      >
                        {post.excerpt}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "1rem",
                          borderTop: "1px solid var(--pale-mid)",
                        }}
                      >
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "var(--stone)", opacity: 0.7 }}>
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* Botão Carregar mais */}
        {hasMore && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "3rem", paddingBottom: "1rem" }}>
            <button
              onClick={() => setVisibleCount((prev) => prev + POSTS_PER_PAGE)}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                letterSpacing: "0.04em",
                color: "var(--ink)",
                backgroundColor: "transparent",
                border: "1.5px solid var(--ink)",
                padding: "0.85rem 2.5rem",
                cursor: "pointer",
                transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--ink)";
                (e.currentTarget as HTMLButtonElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
              }}
            >
              Carregar mais ({filtered.length - visibleCount} artigos restantes)
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Mapeia o tema da BD para a categoria do blog
function mapTemaToCategory(tema: string): string {
  const map: Record<string, string> = {
    "Saúde Mental no Trabalho": "burnout",
    "Gestão de Recursos Humanos": "rh-cultura",
    "Liderança e Gestão": "lideranca",
    "Bem-Estar e Produtividade": "produtividade",
    "Apoio Social e Familiar": "bem-estar",
    "Apoio Jurídico e Financeiro": "investigacao",
  };
  return map[tema] || "bem-estar";
}
