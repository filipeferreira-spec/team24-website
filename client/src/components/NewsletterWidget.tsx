/* ============================================================
   TEAM 24 — Newsletter Widget Lateral
   Tab compacta (altura = texto + padding mínimo).
   Abre ao hover, fecha ao clicar fora.
   ============================================================ */

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { trackNewsletterSubscribe } from "@/lib/analytics";

export default function NewsletterWidget() {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const odooNewsletter = trpc.forms.newsletter.useMutation();
  const subscribeNewsletter = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      odooNewsletter.mutate({ email });
      setEmail("");
      trackNewsletterSubscribe("newsletter_widget");
    },
    onError: (err: { message?: string }) => {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
    },
  });

  // Fechar ao clicar fora do widget
  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 320);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Introduza um email válido.");
      return;
    }
    subscribeNewsletter.mutate({ email });
  };

  return (
    <div
      ref={widgetRef}
      style={{
        position: "fixed",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        filter: "drop-shadow(-4px 0 18px rgba(10,26,42,0.18))",
      }}
    >
      {/* ── Painel expandido ── */}
      <div
        style={{
          width: expanded ? "290px" : "0px",
          overflow: "hidden",
          transition: "width 0.35s cubic-bezier(0.16,1,0.3,1)",
          backgroundColor: "#0A1A2A",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: expanded ? "1.75rem 1.5rem" : "0",
          alignSelf: "stretch",
        }}
      >
        <div style={{ opacity: expanded ? 1 : 0, transition: "opacity 0.2s 0.2s" }}>
          {submitted ? (
            <>
              <div style={{ width: "28px", height: "2px", backgroundColor: "#DB5C34", marginBottom: "1rem" }} />
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1rem", color: "white", lineHeight: 1.3, marginBottom: "0.6rem" }}>
                Subscrito com sucesso!
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                Irá receber os próximos insights de bem-estar corporativo no seu email.
              </p>
            </>
          ) : (
            <>
              <div style={{ width: "28px", height: "2px", backgroundColor: "#DB5C34", marginBottom: "1rem" }} />
              <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "white", lineHeight: 1.35, marginBottom: "0.4rem" }}>
                Newsletter TEAM 24
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: "1.1rem" }}>
                Insights mensais sobre saúde mental e bem-estar corporativo.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="email@empresa.pt"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.8rem",
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: error ? "1.5px solid #E53E3E" : "1.5px solid rgba(255,255,255,0.15)",
                    padding: "0.65rem 0.85rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#25749F"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = error ? "#E53E3E" : "rgba(255,255,255,0.15)"; }}
                />
                {error && (
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", color: "#FC8181", margin: 0 }}>
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={subscribeNewsletter.isPending}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "white",
                    backgroundColor: subscribeNewsletter.isPending ? "rgba(219,92,52,0.6)" : "#DB5C34",
                    border: "none",
                    padding: "0.65rem 1rem",
                    cursor: subscribeNewsletter.isPending ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => { if (!subscribeNewsletter.isPending) e.currentTarget.style.backgroundColor = "#B84520"; }}
                  onMouseLeave={(e) => { if (!subscribeNewsletter.isPending) e.currentTarget.style.backgroundColor = "#DB5C34"; }}
                >
                  {subscribeNewsletter.isPending ? "A subscrever..." : "Subscrever"}
                </button>
              </form>

              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.62rem", color: "rgba(255,255,255,0.22)", marginTop: "0.65rem", lineHeight: 1.5 }}>
                Sem spam. Pode cancelar a qualquer momento.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Tab lateral compacta ── */}
      <div
        onMouseEnter={handleExpand}
        style={{
          /* Largura fixa; altura auto = ajustada ao conteúdo */
          width: "28px",
          backgroundColor: expanded ? "#1D5E82" : "#25749F",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "background-color 0.2s",
          flexShrink: 0,
          /* Padding vertical pequeno para a tab ficar só um pouco maior que o texto */
          paddingTop: "1rem",
          paddingBottom: "1rem",
        }}
      >
        {/* Traço laranja no topo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            backgroundColor: "#DB5C34",
          }}
        />
        {/* Texto vertical */}
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "0.62rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "white",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          Newsletter
        </span>
      </div>
    </div>
  );
}
