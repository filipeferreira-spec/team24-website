/* ============================================================
   TEAM 24 — Contact Section v2: Editorial Clarity
   Design: Clean asymmetric layout. Form on right, info on left.
   No cards, no shadows. Inputs with bottom-border only.
   ============================================================ */

import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { trackFormSubmit } from "@/lib/analytics";
import { trpc } from "@/lib/trpc";

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    employees: "",
    message: "",
    privacy: false,
  });

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

  const contactMutation = trpc.forms.contact.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackFormSubmit("formulario_contacto");
    await contactMutation.mutateAsync({
      name: form.name,
      email: form.email,
      company: form.company,
      phone: form.phone,
      message: [form.employees ? `Colaboradores: ${form.employees}` : null, form.message].filter(Boolean).join("\n") || undefined,
    });
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.95rem",
    color: "white",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    padding: "0.75rem 0",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.4)",
    display: "block",
    marginBottom: "0.25rem",
  };

  return (
    <section
      id="contacto"
      ref={sectionRef}
      style={{ backgroundColor: "var(--ink)" }}
    >
      <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />

      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1.4fr" : "1fr",
            paddingTop: "4rem",
            paddingBottom: "4rem",
            gap: isDesktop ? "5rem" : "3rem",
          }}
        >
          {/* Left: info */}
          <div className="reveal-left" style={{ paddingTop: "0.5rem" }}>
            <div className="t-label mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
              Contacto
            </div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "white",
                maxWidth: "16ch",
                marginBottom: "1.5rem",
              }}
            >
              Vamos transformar a sua empresa{" "}
              <em style={{ color: "var(--coral)", fontStyle: "italic" }}>juntos.</em>
            </h2>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.5)",
                maxWidth: "34ch",
                marginBottom: "3rem",
              }}
            >
              Fale connosco e receba uma proposta personalizada para a sua empresa em menos de 24 horas.
            </p>

            {/* Contact details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                { label: "Telefone", value: "+351 220 981 284", href: "tel:+351220981284" },
                { label: "Email", value: "geral@team24.pt", href: "mailto:geral@team24.pt" },
                { label: "Morada", value: "Av. Marechal Gomes da Costa, 1551 · Porto", href: "#" },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "0.25rem" }}>
                    {item.label}
                  </div>
                  <a
                    href={item.href}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.95rem",
                      color: "rgba(255,255,255,0.75)",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                  >
                    {item.value}
                  </a>
                </div>
              ))}
            </div>

            {/* Trust signals */}
            <div
              style={{
                marginTop: "3rem",
                paddingTop: "2rem",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {[
                "Resposta em menos de 24 horas",
                "Sem compromisso, sem pressão",
                "Demo gratuita incluída",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "1.5rem",
                      height: "1px",
                      backgroundColor: "var(--coral)",
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="reveal-right">
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div>
                    <label style={labelStyle}>Nome *</label>
                    <input
                      type="text"
                      required
                      placeholder="O seu nome"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--coral)")}
                      onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Empresa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome da empresa"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--coral)")}
                      onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)")}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="email@empresa.pt"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--coral)")}
                      onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Telefone</label>
                    <input
                      type="tel"
                      placeholder="+351 9xx xxx xxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--coral)")}
                      onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)")}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Nº de Colaboradores</label>
                  <select
                    aria-label="Número de colaboradores"
                    value={form.employees}
                    onChange={(e) => setForm({ ...form, employees: e.target.value })}
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--coral)")}
                    onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)")}
                  >
                    <option value="" style={{ backgroundColor: "var(--ink)" }}>Selecione uma opção</option>
                    <option value="1-25" style={{ backgroundColor: "var(--ink)" }}>1 a 25 colaboradores</option>
                    <option value="26-100" style={{ backgroundColor: "var(--ink)" }}>26 a 100 colaboradores</option>
                    <option value="101-500" style={{ backgroundColor: "var(--ink)" }}>101 a 500 colaboradores</option>
                    <option value="501-1000" style={{ backgroundColor: "var(--ink)" }}>501 a 1.000 colaboradores</option>
                    <option value="1000+" style={{ backgroundColor: "var(--ink)" }}>Mais de 1.000 colaboradores</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Mensagem</label>
                  <textarea
                    rows={3}
                    placeholder="Como podemos ajudar?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{
                      ...inputStyle,
                      resize: "none",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--coral)")}
                    onBlur={(e) => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)")}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <input
                    type="checkbox"
                    id="privacy"
                    required
                    checked={form.privacy}
                    onChange={(e) => setForm({ ...form, privacy: e.target.checked })}
                    style={{ marginTop: "3px", accentColor: "var(--coral)", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="privacy"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.35)",
                      lineHeight: 1.5,
                      cursor: "pointer",
                    }}
                  >
                    Aceito a{" "}
                    <a href="#" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "underline" }}>
                      Política de Privacidade
                    </a>{" "}
                    e consinto o tratamento dos meus dados para contacto comercial.
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-coral"
                  style={{ alignSelf: "flex-start", padding: "0.875rem 2rem", fontSize: "0.95rem" }}
                >
                  Enviar Pedido
                  <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <div
                style={{
                  paddingTop: "3rem",
                  paddingBottom: "3rem",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    backgroundColor: "var(--coral)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span style={{ color: "white", fontSize: "1.25rem" }}>✓</span>
                </div>
                <h3
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.75rem",
                    color: "white",
                    marginBottom: "0.75rem",
                  }}
                >
                  Mensagem recebida.
                </h3>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "1rem",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.7,
                    maxWidth: "36ch",
                  }}
                >
                  A nossa equipa irá entrar em contacto em menos de 24 horas. Obrigado pelo interesse na TEAM 24.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
    </section>
  );
}
