/* ============================================================
   TEAM 24 — Página de Agendamento
   Widget Calendly inline: ritacondeca-team24/30min
   ============================================================ */

import { useEffect } from "react";
import SEO from "../components/SEO";

export default function Agendar() {
  useEffect(() => {
    // Carregar o script do Calendly dinamicamente
    const existingScript = document.querySelector(
      'script[src="https://assets.calendly.com/assets/external/widget.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    } else {
      // Se o script já existe, re-inicializar o widget
      if (window.Calendly) {
        window.Calendly.initInlineWidgets();
      }
    }

    return () => {
      // Não remover o script ao desmontar — pode ser reutilizado
    };
  }, []);

  return (
    <>
      <SEO
        title="Agendar Reunião | TEAM 24 — EAP Portugal"
        description="Agende uma reunião com a equipa TEAM 24 e descubra como o nosso programa EAP pode transformar o bem-estar dos seus colaboradores."
      />

      {/* Hero */}
      <div
        style={{
          backgroundColor: "#0A1A2A",
          paddingTop: "120px",
          paddingBottom: "4rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "0 1.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#DB5C34",
              marginBottom: "1rem",
            }}
          >
            Agendar Reunião
          </p>
          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "white",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
            }}
          >
            Vamos falar sobre{" "}
            <em style={{ color: "#DB5C34", fontStyle: "italic" }}>
              o bem-estar
            </em>{" "}
            da sua equipa.
          </h1>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Escolha um horário que lhe seja conveniente. A reunião tem a duração
            de 30 minutos e é realizada por videochamada.
          </p>
        </div>
      </div>

      {/* Calendly Widget */}
      <div
        style={{
          backgroundColor: "#F4F8FB",
          padding: "3rem 1.5rem 5rem",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            backgroundColor: "white",
            boxShadow: "0 4px 40px rgba(37,116,159,0.08)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/ritacondeca-team24/30min?hide_gdpr_banner=1"
            style={{
              position: "relative",
              minWidth: "320px",
              height: "min(900px, calc(100vh - 80px))",
            }}
          />
        </div>

        {/* Info abaixo do widget */}
        <div
          style={{
            maxWidth: "700px",
            margin: "3rem auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          {[
            {
              label: "Duração",
              value: "30 minutos",
              desc: "Reunião focada e objetiva",
            },
            {
              label: "Formato",
              value: "Videochamada",
              desc: "Link enviado por email após confirmação",
            },
            {
              label: "Sem compromisso",
              value: "100% gratuito",
              desc: "Sem pressão, sem obrigações",
            },
          ].map((item) => (
            <div key={item.label}>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#25749F",
                  marginBottom: "0.4rem",
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  color: "#0A1A2A",
                  marginBottom: "0.3rem",
                }}
              >
                {item.value}
              </p>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.85rem",
                  color: "#6B8CA8",
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Declaração de tipo para o Calendly global
declare global {
  interface Window {
    Calendly?: {
      initInlineWidgets: () => void;
    };
  }
}
