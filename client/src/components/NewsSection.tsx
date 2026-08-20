/* ============================================================
   NewsSection — Notícias do Blog
   Mostra 3 artigos aleatórios do blog com link para o detalhe
   ============================================================ */

import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "wouter";
import { blogPosts } from "@/lib/blogData";

const CATEGORY_COLORS: Record<string, string> = {
  burnout: "#DB5C34",
  "bem-estar": "#2A7A4B",
  lideranca: "#25749F",
  produtividade: "#7B5EA7",
  investigacao: "#C0392B",
  "rh-cultura": "#1A6B8A",
};

const CATEGORY_LABELS: Record<string, string> = {
  burnout: "Burnout",
  "bem-estar": "Bem-Estar",
  lideranca: "Liderança",
  produtividade: "Produtividade",
  investigacao: "Investigação",
  "rh-cultura": "RH & Cultura",
};

function getRandomPosts(count: number) {
  const shuffled = [...blogPosts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function NewsSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Memoize so the random selection doesn't change on every render
  const randomPosts = useMemo(() => getRandomPosts(3), []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: "#F5F8FA",
        padding: "4rem 0",
        borderTop: "1px solid #D0E2EC",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
        {/* Cabeçalho */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#6B8A9F",
                marginBottom: "0.5rem",
              }}
            >
              Blog & Recursos
            </div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.03em",
                color: "#0A1A2A",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Notícias{" "}
              <em style={{ color: "#DB5C34" }}>& Artigos.</em>
            </h2>
          </div>

        </div>

        {/* Grid de cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {randomPosts.map((post, i) => {
            const tagColor = CATEGORY_COLORS[post.category] || "#25749F";
            const tagLabel = CATEGORY_LABELS[post.category] || post.category;

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    overflow: "hidden",
                    borderRadius: "2px",
                    border: "1px solid #D0E2EC",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(20px)",
                    transitionDelay: `${i * 0.1}s`,
                    transitionProperty: "opacity, transform, box-shadow",
                    transitionDuration: "0.5s, 0.5s, 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(10,26,42,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  {/* Imagem de capa */}
                  <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16/9" }}>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.4s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    />
                    {/* Tag overlay */}
                    <span
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        left: "0.75rem",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "white",
                        backgroundColor: tagColor,
                        padding: "0.25rem 0.6rem",
                        borderRadius: "2px",
                      }}
                    >
                      {tagLabel}
                    </span>
                  </div>

                  {/* Conteúdo */}
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                    {/* Título */}
                    <h3
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#0A1A2A",
                        margin: 0,
                        lineHeight: 1.4,
                        flex: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      } as React.CSSProperties}
                    >
                      {post.title}
                    </h3>

                    {/* Excerto */}
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.82rem",
                        color: "#6B8A9F",
                        lineHeight: 1.65,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      } as React.CSSProperties}
                    >
                      {post.excerpt}
                    </p>


                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
