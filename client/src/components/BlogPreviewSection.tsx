/* ============================================================
   TEAM 24 — Blog Preview Section v2: Editorial Clarity
   Design: Article list without cards. Typographic rows.
   Featured article on left, list on right.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { getFeaturedPosts, categories, type BlogPost } from "@/lib/blogData";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const allFeatured = getFeaturedPosts();
  const posts = allFeatured.slice(0, 4);
  const featured = posts[0];
  const rest = posts.slice(1, 4);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 80);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!featured) return null;

  const featuredCategory = categories.find((c) => c.value === featured.category)?.label || featured.category;

  return (
    <section
      ref={sectionRef}
      style={{ backgroundColor: "var(--cream)" }}
    >
      <div style={{ height: "1px", backgroundColor: "var(--pale-mid)" }} />

      {/* Header */}
      <div className="container">
        <div
          className="reveal"
          style={{
            paddingTop: "4rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid var(--pale-mid)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          <div>
            <div className="t-label mb-4">Blog</div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                maxWidth: "18ch",
              }}
            >
              Perspetivas sobre{" "}
              <em style={{ color: "var(--coral)", fontStyle: "italic" }}>saúde mental.</em>
            </h2>
          </div>
          <Link
            href="/blog"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "var(--ink)",
              textDecoration: "none",
              borderBottom: "1px solid var(--ink)",
              paddingBottom: "1px",
              transition: "color 0.15s, border-color 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.color = "var(--coral)";
              e.currentTarget.style.borderColor = "var(--coral)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.color = "var(--ink)";
              e.currentTarget.style.borderColor = "var(--ink)";
            }}
          >
            Ver todos os artigos
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1.2fr 1fr" : "1fr",
            paddingTop: "4rem",
            paddingBottom: "4rem",
            gap: isDesktop ? "5rem" : "3rem",
          }}
        >
          {/* Featured article */}
          <Link href={`/blog/${featured.slug}`} style={{ textDecoration: "none" }}>
            <article
              className="reveal-left"
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                const img = (e.currentTarget as HTMLElement).querySelector("img");
                if (img) img.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                const img = (e.currentTarget as HTMLElement).querySelector("img");
                if (img) img.style.transform = "scale(1)";
              }}
            >
              {/* Image */}
              <div
                style={{
                  overflow: "hidden",
                  marginBottom: "1.5rem",
                  aspectRatio: "16/9",
                }}
              >
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>

              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--coral)",
                  }}
                >
                  {featuredCategory}
                </span>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.75rem",
                    color: "var(--stone)",
                  }}
                >
                  {formatDate(featured.publishedAt)}
                </span>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.75rem",
                    color: "var(--stone)",
                  }}
                >
                  {featured.readTime} min
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                  marginBottom: "0.75rem",
                  transition: "color 0.15s",
                }}
                className="hover-coral-title"
              >
                {featured.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  color: "var(--stone)",
                }}
              >
                {featured.excerpt}
              </p>
            </article>
          </Link>

          {/* Article list */}
          <div className="reveal-right">
            {rest.map((post, i) => {
              const cat = categories.find((c) => c.value === post.category)?.label || post.category;
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <article
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr",
                      gap: "1.25rem",
                      paddingTop: "1.5rem",
                      paddingBottom: "1.5rem",
                      borderBottom: "1px solid var(--pale-mid)",
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {/* Thumbnail */}
                    <div style={{ overflow: "hidden", aspectRatio: "1/1" }}>
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--coral)",
                          marginBottom: "0.35rem",
                        }}
                      >
                        {cat}
                      </div>
                      <h4
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          lineHeight: 1.35,
                          color: "var(--ink)",
                          marginBottom: "0.35rem",
                        }}
                      >
                        {post.title}
                      </h4>
                      <span
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.72rem",
                          color: "var(--stone)",
                        }}
                      >
                        {post.readTime} min · {formatDate(post.publishedAt)}
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}

            <div style={{ paddingTop: "2rem" }}>
              <Link
                href="/blog"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "var(--stone)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "var(--stone)")}
              >
                Ver todos os artigos
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--pale-mid)" }} />
    </section>
  );
}
