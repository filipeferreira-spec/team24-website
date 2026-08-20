/* ============================================================
   TEAM 24 — Logo Bar
   Carrossel automático de logos de clientes.
   Aparece imediatamente após o hero (FullscreenVideo).
   ============================================================ */
import { useState, useEffect } from "react";
import { COMPANY_LOGOS } from "@/lib/companyLogos";

const LOGO_KEYS = [
  "galp", "rtp", "adecco", "ikea",
  "salvador_caetano", "casais", "nova", "stcp_new",
  "norauto", "mds", "aguasdeportugal", "bancobni",
  "mercedes", "doutor_financas",
  "sporting", "kuanto_kusta", "express_glass",
  "weezie", "xpandit", "voltalia", "tangivel",
  "smartconsulting", "servier", "seines", "sanitop",
  "samsys", "readiness", "ptisp", "politermicaweb",
  "penguin", "nutrium", "nowo", "miele",
  "manpower", "mahrla", "ldauto", "latitudde",
  "ramos_ferreira", "hanon", "hbk", "eurotux_new",
  "diaverum", "diatosta", "davita", "corksupply",
  "cepac", "capricciosa", "ccalaw", "boost",
];

// Duplicate for seamless loop
const ALL_KEYS = [...LOGO_KEYS, ...LOGO_KEYS];

export default function LogoBar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ borderTop: "2px solid #E5EEF4", background: "#FFFFFF", borderBottom: "1px solid #E5EEF4" }}>
      <div
        style={{
          padding: isMobile ? "1.25rem 1rem" : "1.75rem clamp(1.5rem, 4rem, 4rem)",
          display: "flex",
          alignItems: "center",
          gap: "2.5rem",
          overflow: "hidden",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {!isMobile && (
          <>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#DB5C34",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}>
              Confiado por
            </span>
            <div style={{ width: "1px", height: "24px", background: "#D0E2EC", flexShrink: 0 }} />
          </>
        )}
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="marquee-track" style={{ gap: "3.5rem" }}>
            {ALL_KEYS.map((key, i) => {
              const entry = COMPANY_LOGOS[key];
              if (!entry) return null;
              return (
                <img
                  key={i}
                  src={entry.logo}
                  alt={entry.name}
                  title={entry.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    height: isMobile ? "48px" : "96px",
                    width: "auto",
                    maxWidth: isMobile ? "120px" : "240px",
                    objectFit: "contain",
                    opacity: 0.85,
                    filter: "none",
                    transition: "opacity 0.25s",
                    flexShrink: 0,
                    background: "#FFFFFF",
                    padding: "6px 10px",
                    borderRadius: "6px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
