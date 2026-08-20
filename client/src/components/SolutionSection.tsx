/* ============================================================
   TEAM 24 — Solution Section v3: Desktop-first
   Design: Asymmetric layout. No cards, no shadows.
   Problem/solution as editorial lists. Image bleeds.
   Uses JS-driven responsive grid for reliability.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trackAgendarClick } from "@/lib/analytics";

const PEOPLE_IMG = "/media/t24-people-work-c4eaNku6fZ6xJscDCS2qLn_87d042b5.webp";

const problems = [
  "1 em cada 5 colaboradores sofre de burnout",
  "Absentismo custa €1.600/ano por colaborador",
  "34% dos talentos considera abandonar a empresa",
  "Estigma impede que colaboradores peçam ajuda",
];

const solutions = [
  "Apoio psicológico disponível 24h, no telemóvel",
  "Anónimo e confidencial — sem passar pelo RH",
  "IA que identifica padrões de stress antes da crise",
  "Relatórios agregados para decisões informadas",
];

export default function SolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="solucao"
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
            display: "flex",
            alignItems: "flex-start",
            gap: "3rem",
            flexWrap: isDesktop ? "nowrap" : "wrap",
          }}
        >
          <div style={{ flex: "0 0 auto" }}>
            <div className="t-label" style={{ marginBottom: "1.25rem" }}>A Solução</div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: isDesktop ? "clamp(2rem, 3.5vw, 3.75rem)" : "clamp(2rem, 8vw, 3rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                maxWidth: "14ch",
              }}
            >
              O problema é real.{" "}
              <em style={{ color: "var(--coral)", fontStyle: "italic" }}>A solução também.</em>
            </h2>
          </div>
          <div style={{ flex: "1 1 280px", paddingTop: isDesktop ? "0.25rem" : "0" }}>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "var(--stone)",
                maxWidth: "42ch",
              }}
            >
              A saúde mental no trabalho é a crise silenciosa do século XXI. As empresas que ignoram este tema perdem talento, produtividade e reputação. As que agem, destacam-se.
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--pale-mid)" }} />

      {/* Main split */}
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
            paddingTop: "4rem",
            paddingBottom: "4rem",
            gap: isDesktop ? "5rem" : "3rem",
          }}
        >
          {/* Left: Lists */}
          <div className="reveal-left">
            {/* Problem */}
            <div style={{ marginBottom: "3rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "2rem",
                    height: "1px",
                    backgroundColor: "var(--stone)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--stone)",
                  }}
                >
                  Sem a TEAM 24
                </span>
              </div>
              {problems.map((p, i) => (
                <div
                  key={i}
                  className="reveal"
                  style={{
                    transitionDelay: `${i * 60}ms`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    paddingTop: "0.875rem",
                    paddingBottom: "0.875rem",
                    borderBottom: "1px solid var(--pale-mid)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--stone)",
                      opacity: 0.35,
                      minWidth: "1.25rem",
                      lineHeight: 1.5,
                    }}
                  >
                    ×
                  </span>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.95rem",
                      color: "var(--stone)",
                      lineHeight: 1.5,
                    }}
                  >
                    {p}
                  </span>
                </div>
              ))}
            </div>

            {/* Solution */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "2rem",
                    height: "1px",
                    backgroundColor: "var(--coral)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--coral)",
                  }}
                >
                  Com a TEAM 24
                </span>
              </div>
              {solutions.map((s, i) => (
                <div
                  key={i}
                  className="reveal"
                  style={{
                    transitionDelay: `${(i + 4) * 60}ms`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    paddingTop: "0.875rem",
                    paddingBottom: "0.875rem",
                    borderBottom: "1px solid var(--pale-mid)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--coral)",
                      minWidth: "1.25rem",
                      lineHeight: 1.5,
                    }}
                  >
                    →
                  </span>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.95rem",
                      color: "var(--ink)",
                      lineHeight: 1.5,
                    }}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>

            <Link href="/agendar">
              <button
                onClick={() => trackAgendarClick("solution_section")}
                className="btn-coral"
                style={{ marginTop: "2rem" }}
              >
                Quero saber mais
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          {/* Right: Image with quote */}
          {isDesktop && (
            <div
              className="reveal-right"
              style={{ position: "relative" }}
            >
              <img
                src={PEOPLE_IMG}
                alt="Ambiente de trabalho saudável"
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "480px",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
              {/* Quote overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  backgroundColor: "var(--ink)",
                  padding: "1.75rem 2rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontStyle: "italic",
                    fontSize: "0.95rem",
                    color: "white",
                    lineHeight: 1.6,
                    marginBottom: "0.75rem",
                  }}
                >
                  "Implementar a TEAM 24 foi a melhor decisão que tomámos para o bem-estar da nossa equipa."
                </p>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.45)",
                    letterSpacing: "0.04em",
                  }}
                >
                  Ana Costa, Diretora de RH — Grupo Casais
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--pale-mid)" }} />
    </section>
  );
}
