/* ============================================================
   TEAM 24 — Pricing Section v2: Editorial Clarity
   Design: Horizontal comparison table. No cards, no shadows.
   Coral accent on recommended column. Clean typographic rows.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { trackAgendarClick } from "@/lib/analytics";

const plans = [
  {
    name: "Essencial",
    tagline: "Para começar",
    priceValue: "€2",
    pricePer: "/colaborador/mês",
    description: "O essencial para dar o primeiro passo no apoio à saúde mental.",
    cta: "Começar",
    highlighted: false,
  },
  {
    name: "Profissional",
    tagline: "Mais popular",
    priceValue: "€4",
    pricePer: "/colaborador/mês",
    description: "A solução completa para resultados mensuráveis e apoio abrangente.",
    cta: "Agendar Reunião",
    highlighted: true,
  },
  {
    name: "Enterprise",
    tagline: "Para grandes equipas",
    priceValue: "Custom",
    pricePer: "solução à medida",
    description: "Para grandes organizações com necessidades específicas.",
    cta: "Falar Connosco",
    highlighted: false,
  },
];

const features = [
  { label: "App para colaboradores", values: [true, true, true] },
  { label: "Chat com psicólogo", values: [true, true, true] },
  { label: "Conteúdos de bem-estar", values: [true, true, true] },
  { label: "Relatório mensal RH", values: [true, true, true] },
  { label: "Videoconsultas", values: [false, true, true] },
  { label: "Assistente IA 24h", values: [false, true, true] },
  { label: "Dashboard RH em tempo real", values: [false, true, true] },
  { label: "Workshops mensais", values: [false, true, true] },
  { label: "Apoio à família", values: [false, true, true] },
  { label: "Integração SIRH/HCM", values: [false, false, true] },
  { label: "Apoio jurídico e financeiro", values: [false, false, true] },
  { label: "Relatórios avançados", values: [false, false, true] },
  { label: "SLA dedicado", values: [false, false, true] },
];

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  return (
    <section
      id="precos"
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
            <div className="t-label mb-4">Preços</div>
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
              Menos do que um café.{" "}
              <em style={{ color: "var(--coral)", fontStyle: "italic" }}>Por colaborador.</em>
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
            Preços transparentes e acessíveis. Sem surpresas, sem compromissos de longo prazo. Cancele quando quiser.
          </p>
        </div>
      </div>

      {/* Pricing table */}
      <div className="container">
        <div
          className="reveal"
          style={{
            paddingTop: "3rem",
            paddingBottom: "4rem",
            overflowX: isMobile ? "visible" : "auto",
          }}
        >
          {/* Mobile: cards empilhados */}
          {isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  style={{
                    border: plan.highlighted ? "2px solid var(--coral)" : "1px solid var(--pale-mid)",
                    backgroundColor: plan.highlighted ? "rgba(232,96,58,0.04)" : "white",
                    padding: "1.5rem",
                  }}
                >
                  {plan.highlighted && (
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--coral)", marginBottom: "0.5rem" }}>
                      Recomendado
                    </div>
                  )}
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--ink)", marginBottom: "0.25rem" }}>{plan.name}</div>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "2rem", color: plan.highlighted ? "var(--coral)" : "var(--ink)", lineHeight: 1, marginBottom: "0.25rem" }}>{plan.priceValue}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "var(--stone)", marginBottom: "0.5rem" }}>{plan.pricePer}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "var(--stone)", marginBottom: "1.25rem", lineHeight: 1.5 }}>{plan.description}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                    {features.filter((f) => f.values[plans.indexOf(plan)]).map((f) => (
                      <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Check size={14} style={{ color: plan.highlighted ? "var(--coral)" : "var(--teal)", flexShrink: 0 }} />
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", color: "var(--stone)" }}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/agendar">
                    <button onClick={() => trackAgendarClick("pricing_section")} style={{ width: "100%", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: plan.highlighted ? "white" : "var(--ink)", backgroundColor: plan.highlighted ? "var(--coral)" : "transparent", border: plan.highlighted ? "none" : "1px solid var(--pale-mid)", cursor: "pointer", padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                      {plan.cta} <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
          {/* Desktop: tabela */}
          {!isMobile && <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "600px",
            }}
          >
            {/* Plan headers */}
            <thead>
              <tr>
                <th
                  style={{
                    width: "35%",
                    textAlign: "left",
                    paddingBottom: "2rem",
                    verticalAlign: "bottom",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.75rem",
                      color: "var(--stone)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Funcionalidades
                  </span>
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.name}
                    style={{
                      width: "21.6%",
                      textAlign: "left",
                      paddingBottom: "2rem",
                      paddingLeft: "1.5rem",
                      paddingRight: "1rem",
                      verticalAlign: "bottom",
                      borderLeft: plan.highlighted
                        ? "2px solid var(--coral)"
                        : "1px solid var(--pale-mid)",
                      backgroundColor: plan.highlighted
                        ? "rgba(232,96,58,0.04)"
                        : "transparent",
                    }}
                  >
                    {plan.highlighted && (
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--coral)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Recomendado
                      </div>
                    )}
                    <div
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "var(--ink)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {plan.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.75rem",
                        color: plan.highlighted ? "var(--coral)" : "var(--ink)",
                        lineHeight: 1,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {plan.priceValue}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.72rem",
                        color: "var(--stone)",
                        marginBottom: "1rem",
                      }}
                    >
                      {plan.pricePer}
                    </div>
                    <Link href="/agendar">
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: plan.highlighted ? "white" : "var(--ink)",
                          backgroundColor: plan.highlighted ? "var(--coral)" : "transparent",
                          border: plan.highlighted ? "none" : "1px solid var(--pale-mid)",
                          cursor: "pointer",
                          padding: "0.55rem 1rem",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          const btn = e.currentTarget as HTMLButtonElement;
                          if (plan.highlighted) {
                            btn.style.backgroundColor = "var(--coral-dark)";
                          } else {
                            btn.style.borderColor = "var(--ink)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          const btn = e.currentTarget as HTMLButtonElement;
                          if (plan.highlighted) {
                            btn.style.backgroundColor = "var(--coral)";
                          } else {
                            btn.style.borderColor = "var(--pale-mid)";
                          }
                        }}
                      >
                        {plan.cta}
                        <ArrowRight size={13} />
                      </button>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Feature rows */}
            <tbody>
              {features.map((feat, i) => (
                <tr
                  key={feat.label}
                  style={{
                    borderTop: "1px solid var(--pale-mid)",
                  }}
                >
                  <td
                    style={{
                      paddingTop: "0.875rem",
                      paddingBottom: "0.875rem",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.88rem",
                      color: "var(--stone)",
                    }}
                  >
                    {feat.label}
                  </td>
                  {feat.values.map((val, j) => (
                    <td
                      key={j}
                      style={{
                        paddingTop: "0.875rem",
                        paddingBottom: "0.875rem",
                        paddingLeft: "1.5rem",
                        borderLeft: plans[j].highlighted
                          ? "2px solid var(--coral)"
                          : "1px solid var(--pale-mid)",
                        backgroundColor: plans[j].highlighted
                          ? "rgba(232,96,58,0.04)"
                          : "transparent",
                      }}
                    >
                      {val ? (
                        <Check
                          size={16}
                          style={{ color: plans[j].highlighted ? "var(--coral)" : "var(--teal)" }}
                        />
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "1px",
                            backgroundColor: "var(--pale-mid)",
                          }}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>}
        </div>

        {/* Bottom note */}
        <div
          className="reveal"
          style={{
            paddingBottom: "4rem",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.85rem",
              color: "var(--stone)",
            }}
          >
            Todos os planos incluem onboarding, suporte e acesso à app para iOS e Android. Preços com IVA não incluído.
          </p>
          <Link href="/agendar">
            <button
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "var(--coral)",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                whiteSpace: "nowrap",
                borderBottom: "1px solid var(--coral)",
                paddingBottom: "1px",
              }}
            >
              Pedir proposta personalizada
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--pale-mid)" }} />
    </section>
  );
}
