/* ============================================================
   TEAM 24 — Pop-up Campanha "O Colaborador Invisível"
   Design: Editorial dark. Fundo #0A1A2A, laranja #DB5C34.
   Aparece após 4s, apenas uma vez por sessão.
   ============================================================ */

import { useState, useEffect } from "react";

const CAMPAIGN_URL = "https://teamhealth-l3kswbrb.manus.space/";
const SESSION_KEY = "ci_popup_dismissed";

export default function CampaignPopup() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Não mostrar se já foi dispensado nesta sessão
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setClosing(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    setTimeout(() => setVisible(false), 350);
  };

  const handleCTA = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    window.open(CAMPAIGN_URL, "_blank", "noopener,noreferrer");
    setClosing(true);
    setTimeout(() => setVisible(false), 350);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
          zIndex: 9998,
          opacity: closing ? 0 : 1,
          transition: "opacity 0.35s ease",
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Campanha O Colaborador Invisível"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: closing
            ? "translate(-50%, -48%) scale(0.97)"
            : "translate(-50%, -50%) scale(1)",
          zIndex: 9999,
          width: "min(92vw, 680px)",
          backgroundColor: "#0A1A2A",
          opacity: closing ? 0 : 1,
          transition: "opacity 0.35s ease, transform 0.35s ease",
          outline: "none",
        }}
      >
        {/* Linha laranja no topo */}
        <div style={{ height: "3px", backgroundColor: "#DB5C34", width: "100%" }} />

        {/* Conteúdo */}
        <div style={{ padding: "clamp(2rem, 5vw, 3rem)" }}>

          {/* Label campanha */}
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#DB5C34",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <span style={{ display: "inline-block", width: "1.5rem", height: "1.5px", backgroundColor: "#DB5C34" }} />
            Iniciativa TEAM 24
          </div>

          {/* Título */}
          <h2 style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "white",
            margin: "0 0 1rem 0",
          }}>
            O Colaborador<br />
            <em style={{ color: "#DB5C34", fontStyle: "italic" }}>Invisível</em>
          </h2>

          {/* Subtítulo */}
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.6)",
            margin: "0 0 2rem 0",
            maxWidth: "44ch",
          }}>
            Na sua empresa, há colaboradores que sofrem em silêncio. Descubra o que realmente se passa na sua equipa — de forma anónima, gratuita e sem compromisso.
          </p>

          {/* Métricas */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "2rem",
            padding: "1.25rem 0",
          }}>
            {[
              { v: "1 em 5", l: "sofre de burnout ativo" },
              { v: "€2.400", l: "custo anual por colaborador" },
              { v: "67%", l: "dos RH desconhecem o estado da equipa" },
            ].map((m, i) => (
              <div key={m.l} style={{
                paddingRight: i < 2 ? "1.25rem" : 0,
                paddingLeft: i > 0 ? "1.25rem" : 0,
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}>
                <div style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                  color: "#DB5C34",
                  letterSpacing: "-0.02em",
                  marginBottom: "0.2rem",
                  lineHeight: 1,
                }}>
                  {m.v}
                </div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.68rem",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.4,
                }}>
                  {m.l}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={handleCTA}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "white",
                backgroundColor: "#DB5C34",
                border: "none",
                padding: "0.875rem 1.75rem",
                cursor: "pointer",
                transition: "background-color 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c04e28")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DB5C34")}
            >
              Iniciar Avaliação Gratuita
            </button>

            <button
              onClick={dismiss}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: "0.78rem",
                letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.35)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.875rem 0",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
            >
              Agora não
            </button>
          </div>

          {/* Garantias */}
          <div style={{
            marginTop: "1.5rem",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.04em",
          }}>
            100% anónimo · Gratuito · Sem compromisso
          </div>
        </div>

        {/* Botão fechar (X) */}
        <button
          onClick={dismiss}
          aria-label="Fechar"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            width: "2rem",
            height: "2rem",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.35)",
            fontSize: "1.25rem",
            lineHeight: 1,
            transition: "color 0.2s",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          ×
        </button>
      </div>
    </>
  );
}
