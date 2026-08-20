/* ============================================================
   TEAM 24 — Resources Section v2: Editorial Clarity
   Design: Ebooks as editorial list items. Abstract art image.
   No cards, no shadows, no rounded corners.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Download } from "lucide-react";

const ABSTRACT_IMG = "/media/t24-abstract-mind-fayEszZqPAH5fJBdrvUpzm_be72c3b6.webp";

const ebooks = [
  {
    num: "01",
    title: "Guia de Saúde Mental para Líderes",
    description: "Como identificar sinais de stress na sua equipa e criar uma cultura de bem-estar psicológico.",
    pages: "32 páginas",
    tag: "Para CEOs & Diretores",
  },
  {
    num: "02",
    title: "ROI do Bem-Estar Empresarial",
    description: "Dados e metodologia para calcular o retorno do investimento em saúde mental na sua empresa.",
    pages: "24 páginas",
    tag: "Para RH & Financeiro",
  },
  {
    num: "03",
    title: "Burnout: Guia de Prevenção",
    description: "Estratégias práticas para prevenir o burnout e construir equipas resilientes e produtivas.",
    pages: "28 páginas",
    tag: "Para Gestores",
  },
];

const aiTools = [
  { title: "Avaliação de Clima Organizacional", description: "Questionário de 5 minutos com relatório personalizado" },
  { title: "Calculadora de Custo do Absentismo", description: "Descubra quanto está a perder por ano" },
  { title: "Plano de Bem-Estar Personalizado", description: "IA gera um plano adaptado à sua empresa" },
];

export default function ResourcesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [downloadForm, setDownloadForm] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState<Set<number>>(new Set());
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

  const handleDownload = (idx: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted((prev) => new Set(prev).add(idx));
    setDownloadForm(null);
    setEmail("");
  };

  return (
    <section
      id="recursos"
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
            <div className="t-label mb-4">Recursos Gratuitos</div>
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
              Conhecimento que{" "}
              <em style={{ color: "var(--coral)", fontStyle: "italic" }}>transforma.</em>
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
            Ebooks gratuitos e ferramentas de IA para ajudar líderes e equipas de RH a tomar melhores decisões sobre bem-estar.
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 360px" : "1fr",
            paddingTop: "4rem",
            paddingBottom: "4rem",
            gap: isDesktop ? "5rem" : "3rem",
          }}
>
          {/* Left: lists */}
          <div className="reveal-left">
            {/* Ebooks */}
            {ebooks.map((eb, i) => (
              <div
                key={eb.num}
                className="reveal"
                style={{
                  transitionDelay: `${i * 80}ms`,
                  borderBottom: "1px solid var(--pale-mid)",
                  paddingTop: "2rem",
                  paddingBottom: "2rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3rem 1fr auto",
                    gap: "1.5rem",
                    alignItems: "start",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      letterSpacing: "0.08em",
                      color: "var(--coral)",
                      paddingTop: "3px",
                    }}
                  >
                    {eb.num}
                  </span>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <h3
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          color: "var(--ink)",
                        }}
                      >
                        {eb.title}
                      </h3>
                      <span
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--teal)",
                          backgroundColor: "rgba(26,74,74,0.08)",
                          padding: "2px 8px",
                        }}
                      >
                        {eb.tag}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                        color: "var(--stone)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {eb.description}
                    </p>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "var(--stone)", opacity: 0.5 }}>
                      {eb.pages}
                    </span>

                    {downloadForm === i && !submitted.has(i) && (
                      <form
                        onSubmit={(e) => handleDownload(i, e)}
                        style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                      >
                        <input
                          type="email"
                          placeholder="O seu email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: "0.85rem",
                            padding: "0.6rem 1rem",
                            border: "1px solid var(--pale-mid)",
                            backgroundColor: "white",
                            color: "var(--ink)",
                            outline: "none",
                            flex: "1 1 200px",
                          }}
                        />
                        <button type="submit" className="btn-coral" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
                          Descarregar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDownloadForm(null)}
                          style={{ background: "none", border: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "var(--stone)", cursor: "pointer" }}
                        >
                          Cancelar
                        </button>
                      </form>
                    )}
                    {submitted.has(i) && (
                      <p style={{ marginTop: "0.75rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "var(--teal)", fontWeight: 600 }}>
                        ✓ Enviado para o seu email!
                      </p>
                    )}
                  </div>

                  {!submitted.has(i) && downloadForm !== i && (
                    <button
                      onClick={() => setDownloadForm(i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        color: "var(--ink)",
                        background: "none",
                        border: "none",
                        borderBottom: "1px solid var(--ink)",
                        cursor: "pointer",
                        padding: "0.4rem 0",
                        whiteSpace: "nowrap",
                        transition: "color 0.15s, border-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--coral)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--coral)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink)";
                      }}
                    >
                      <Download size={14} />
                      Descarregar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* AI Tools */}
            <div style={{ marginTop: "3rem" }}>
              <div className="t-label mb-4">Ferramentas de IA</div>
              {aiTools.map((tool, i) => (
                <div
                  key={i}
                  className="reveal"
                  style={{
                    transitionDelay: `${(i + 3) * 80}ms`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    paddingTop: "1.25rem",
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid var(--pale-mid)",
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.65")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  onClick={() => {
                    const el = document.getElementById("contacto");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "var(--ink)", marginBottom: "2px" }}>
                      {tool.title}
                    </div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "var(--stone)" }}>
                      {tool.description}
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: "var(--stone)", flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: abstract art */}
          <div
            className="reveal-right hidden lg:block"
            style={{ position: "sticky", top: "6rem", alignSelf: "start" }}
          >
            <img
              src={ABSTRACT_IMG}
              alt="Arte abstrata — saúde mental"
              style={{ width: "100%", display: "block" }}
            />
            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--pale-mid)" }}>
              <p style={{ fontFamily: "'Lato', sans-serif", fontStyle: "italic", fontSize: "0.95rem", color: "var(--stone)", lineHeight: 1.6 }}>
                "A saúde mental é a fundação de tudo o resto que queremos alcançar."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--pale-mid)" }} />
    </section>
  );
}
