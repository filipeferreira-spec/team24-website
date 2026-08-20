import { useState, useEffect } from "react";

const COOKIE_KEY = "team24_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
    // Fire GTM consent update so GA4 starts tracking
    if (typeof window !== "undefined" && Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({
        event: "cookie_consent_accepted",
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#0A1A2A",
        color: "#fff",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
        animation: "slideUp 0.3s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5, maxWidth: "700px", color: "#e0e0e0" }}>
        Utilizamos cookies para melhorar a sua experiência, analisar o tráfego do site e personalizar conteúdos.
        Ao clicar em <strong style={{ color: "#fff" }}>Aceitar</strong>, consente o uso de todos os cookies.
        Pode saber mais na nossa{" "}
        <a href="/politica-privacidade" style={{ color: "#F15A29", textDecoration: "underline" }}>
          Política de Privacidade
        </a>
        .
      </p>

      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.3)",
            background: "transparent",
            color: "#ccc",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
        >
          Recusar
        </button>
        <button
          onClick={accept}
          style={{
            padding: "8px 24px",
            borderRadius: "6px",
            border: "none",
            background: "#F15A29",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#d94e22")}
          onMouseLeave={e => (e.currentTarget.style.background = "#F15A29")}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
