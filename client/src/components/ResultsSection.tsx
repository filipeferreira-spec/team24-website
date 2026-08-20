/* ============================================================
   TEAM 24 — Results / ROI Section v2: Editorial Clarity
   Design: Large typographic metrics. ROI calculator with clean inputs.
   No cards, no shadows, no rounded corners.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trackAgendarClick } from "@/lib/analytics";

const metrics = [
  { value: "+47%", label: "Produtividade", sub: "reportada pelas empresas parceiras" },
  { value: "-35%", label: "Absentismo", sub: "redução de dias de baixa" },
  { value: "-28%", label: "Turnover", sub: "menor rotatividade de talento" },
  { value: "24h", label: "Implementação", sub: "da assinatura ao primeiro utilizador" },
];

export default function ResultsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [employees, setEmployees] = useState(100);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const costPerEmployee = 4;
  const annualCost = employees * costPerEmployee * 12;
  const absentismSaving = employees * 1600 * 0.35;
  const productivityGain = employees * 800 * 0.47;
  const totalROI = absentismSaving + productivityGain - annualCost;
  const roiMultiplier = Math.max(1, Math.round(totalROI / annualCost));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
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

  const fmt = (n: number) =>
    n >= 1000 ? `€${(n / 1000).toFixed(0)}K` : `€${n}`;

  return (
    <section
      id="resultados"
      ref={sectionRef}
      style={{ backgroundColor: "var(--pale)" }}
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
            <div className="t-label mb-4">Resultados</div>
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
              Números que{" "}
              <em style={{ color: "var(--coral)", fontStyle: "italic" }}>falam por si.</em>
            </h2>
          </div>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "var(--stone)",
              maxWidth: "36ch",
            }}
          >
            Dados reais das empresas que já implementaram a TEAM 24. Resultados medidos ao longo de 12 meses.
          </p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
            borderBottom: "1px solid var(--pale-mid)",
          }}
        >
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="reveal"
              style={{
                transitionDelay: `${i * 80}ms`,
                paddingTop: "3rem",
                paddingBottom: "3rem",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                borderRight: i < metrics.length - 1 ? "1px solid var(--pale-mid)" : "none",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(2.5rem, 4vw, 3.75rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: "var(--coral)",
                  marginBottom: "0.5rem",
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--ink)",
                  marginBottom: "0.25rem",
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.78rem",
                  color: "var(--stone)",
                  lineHeight: 1.4,
                  maxWidth: "16ch",
                }}
              >
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="container">
        <div
          style={{
            paddingTop: "4rem",
            paddingBottom: "4rem",
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
            gap: isDesktop ? "4rem" : "2.5rem",
          }}
>
          {/* Left: explanation */}
          <div className="reveal">
            <div className="t-label mb-4">Calculadora de ROI</div>
            <h3
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                marginBottom: "1rem",
              }}
            >
              Quanto pode a sua empresa poupar?
            </h3>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                color: "var(--stone)",
                marginBottom: "2rem",
              }}
            >
              Calcule o retorno estimado do investimento em saúde mental para a sua empresa. Baseado em dados reais das nossas empresas parceiras.
            </p>

            {/* Slider */}
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--stone)",
                  }}
                >
                  Nº de Colaboradores
                </span>
                <span
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: "var(--ink)",
                  }}
                >
                  {employees}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "var(--coral)",
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0.25rem",
                }}
              >
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "var(--stone)" }}>10</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "var(--stone)" }}>2.000</span>
              </div>
            </div>

            <Link href="/agendar">
              <button onClick={() => trackAgendarClick("results_section")} className="btn-coral">
                Pedir Proposta
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          {/* Right: results */}
          <div className="reveal">
            <div
              style={{
                borderTop: "2px solid var(--coral)",
                paddingTop: "2rem",
              }}
            >
              {[
                { label: "Investimento anual TEAM 24", value: fmt(annualCost), highlight: false },
                { label: "Poupança em absentismo", value: fmt(absentismSaving), highlight: false },
                { label: "Ganho em produtividade", value: fmt(productivityGain), highlight: false },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "1.25rem",
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid var(--pale-mid)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.9rem",
                      color: "var(--stone)",
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--ink)",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}

              {/* Total ROI */}
              <div
                style={{
                  paddingTop: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--stone)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    ROI Estimado
                  </div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.8rem",
                      color: "var(--stone)",
                    }}
                  >
                    Retorno líquido anual
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(2rem, 3vw, 3rem)",
                      color: "var(--coral)",
                      lineHeight: 1,
                    }}
                  >
                    {fmt(totalROI)}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.8rem",
                      color: "var(--stone)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {roiMultiplier}× o investimento
                  </div>
                </div>
              </div>

              <p
                style={{
                  marginTop: "1.5rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.72rem",
                  color: "var(--stone)",
                  opacity: 0.6,
                  lineHeight: 1.5,
                }}
              >
                * Estimativa baseada em dados médios das empresas parceiras. Resultados reais podem variar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--pale-mid)" }} />
    </section>
  );
}
