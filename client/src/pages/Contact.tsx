/* ============================================================
   TEAM 24 — Página de Contacto
   Design: Editorial Clarity. Sem cards, sem sombras.
   Apenas formulário de "Pedir Mais Informações".
   ============================================================ */

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD, faqLD } from "@/components/SEO";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    role: "",
    employees: "",
    message: "",
    privacy: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactMutation = trpc.forms.contact.useMutation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await contactMutation.mutateAsync({
      name: formState.name,
      email: formState.email,
      company: formState.company || undefined,
      phone: formState.phone || undefined,
      message: [
        formState.role ? `Cargo: ${formState.role}` : null,
        formState.employees ? `Colaboradores: ${formState.employees}` : null,
        formState.message,
      ].filter(Boolean).join("\n") || undefined,
    });
    setLoading(false);
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.95rem",
    color: "#0A1A2A",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1.5px solid #D0E2EC",
    padding: "0.75rem 0",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#6B8A9F",
    display: "block",
    marginBottom: "0.25rem",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FA" }}>
      <Navbar />

      <SEO
        title="Contacto | Fale com a TEAM 24"
        description="Entre em contacto com a TEAM 24. Solicite uma demonstração gratuita, peça uma proposta ou tire as suas dúvidas sobre o nosso programa EAP para empresas."
        keywords="contacto TEAM 24, demonstração EAP, proposta saúde mental empresas, falar com TEAM 24"
        canonicalPath="/contacto"
        jsonLd={[
          ORGANIZATION_LD,
          breadcrumbLD([{ name: "Início", path: "/" }, { name: "Contacto", path: "/contacto" }]),
          faqLD([
            { question: "Como posso contactar a TEAM 24?", answer: "Pode contactar a TEAM 24 pelo email geral@team24.pt, por telefone ou preenchendo o formulário de contacto no nosso website. A nossa equipa responde em menos de 24 horas úteis." },
            { question: "Onde fica a sede da TEAM 24?", answer: "A TEAM 24 tem sede em Lisboa, Portugal. Temos também presença em Espanha e Brasil. Os nossos serviços estão disponíveis em todo o território nacional e internacionalmente." },
            { question: "Como posso agendar uma demonstração gratuita?", answer: "Para agendar uma demonstração gratuita do EAP TEAM 24, preencha o formulário de contacto ou envie um email para geral@team24.pt. A nossa equipa comercial entra em contacto em menos de 24 horas para agendar a demo." },
            { question: "A TEAM 24 tem parceiros em Portugal?", answer: "Sim, a TEAM 24 tem uma rede de parceiros em Portugal, incluindo consultoras de RH, seguradoras e empresas de medicina do trabalho. Se quiser tornar-se parceiro, contacte-nos através do formulário de parceiros." },
          ]),
        ]}
      />
      {/* ── Page Header ── */}
      <div style={{ backgroundColor: "#0A1A2A", paddingTop: "5rem", paddingBottom: "3rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#DB5C34",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ display: "inline-block", width: "2rem", height: "2px", backgroundColor: "#DB5C34" }} />
            Contacto
          </div>
          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.5rem, 5vw, 5rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "white",
              margin: 0,
              maxWidth: "20ch",
              marginBottom: "2rem",
            }}
          >
            Peça mais{" "}
            <em style={{ color: "#DB5C34", fontStyle: "italic" }}>informações</em>
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <a
              href="tel:+351220981284"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "white",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ display: "inline-block", width: "2px", height: "1.2rem", backgroundColor: "#DB5C34" }} />
              +351 220 981 284
            </a>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ display: "inline-block", width: "2px", height: "1.2rem", backgroundColor: "#DB5C34" }} />
              Av. Marechal Gomes da Costa, 1551 &middot; Porto
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "5rem clamp(1.5rem, 4vw, 4rem)",
        }}
      >
        {submitted ? (
          <div
            style={{
              padding: "4rem 0",
              borderTop: "3px solid #DB5C34",
            }}
          >
            <div
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                letterSpacing: "-0.03em",
                color: "#0A1A2A",
                lineHeight: 1.1,
                marginBottom: "1.5rem",
              }}
            >
              Pedido<br />
              <em style={{ color: "#DB5C34" }}>recebido.</em>
            </div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1.05rem",
                color: "#6B8A9F",
                lineHeight: 1.75,
                maxWidth: "45ch",
                marginBottom: "2.5rem",
              }}
            >
              A nossa equipa irá entrar em contacto consigo em menos de 24 horas.
              Entretanto, explore os nossos casos de sucesso.
            </p>
            <a
              href="/casos"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#DB5C34",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Ver Casos de Sucesso
            </a>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit}>

            {/* Row 1: Name + Company */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                gap: isDesktop ? "2rem" : "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <label style={labelStyle}>Nome *</label>
                <input
                  name="name"
                  required
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="O seu nome"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}
                />
              </div>
              <div>
                <label style={labelStyle}>Empresa *</label>
                <input
                  name="company"
                  required
                  value={formState.company}
                  onChange={handleChange}
                  placeholder="Nome da empresa"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}
                />
              </div>
            </div>

            {/* Row 2: Email + Phone */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                gap: isDesktop ? "2rem" : "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="email@empresa.pt"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}
                />
              </div>
              <div>
                <label style={labelStyle}>Telefone</label>
                <input
                  name="phone"
                  type="tel"
                  value={formState.phone}
                  onChange={handleChange}
                  placeholder="+351 9XX XXX XXX"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}
                />
              </div>
            </div>

            {/* Row 3: Role + Employees */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                gap: isDesktop ? "2rem" : "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <label style={labelStyle}>Cargo</label>
                <select
                  name="role"
                  aria-label="Cargo"
                  value={formState.role}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}
                >
                  <option value="">Selecionar cargo</option>
                  <option value="ceo">CEO / Administrador</option>
                  <option value="rh">Diretor de Recursos Humanos</option>
                  <option value="financeiro">Diretor Financeiro</option>
                  <option value="operacoes">Diretor de Operações</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nº de Colaboradores</label>
                <select
                  name="employees"
                  aria-label="Número de colaboradores"
                  value={formState.employees}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}
                >
                  <option value="">Selecionar dimensão</option>
                  <option value="1-50">1 – 50</option>
                  <option value="51-200">51 – 200</option>
                  <option value="201-500">201 – 500</option>
                  <option value="501-1000">501 – 1.000</option>
                  <option value="1000+">Mais de 1.000</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: "3rem" }}>
              <label style={labelStyle}>Mensagem</label>
              <textarea
                name="message"
                value={formState.message}
                onChange={handleChange}
                placeholder="Conte-nos um pouco sobre a sua empresa e o que procura..."
                rows={5}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}
              />
            </div>

            {/* Privacy checkbox */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input
                type="checkbox"
                id="privacy-contact"
                required
                checked={formState.privacy}
                onChange={(e) => setFormState((prev) => ({ ...prev, privacy: e.target.checked }))}
                style={{ marginTop: "3px", accentColor: "#DB5C34", cursor: "pointer", width: "16px", height: "16px", flexShrink: 0 }}
              />
              <label htmlFor="privacy-contact" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#4A6070", lineHeight: 1.5, cursor: "pointer" }}>
                Li e aceito os{" "}
                <a href="/termos" style={{ color: "#25749F", textDecoration: "underline" }}>Termos e Condições</a>
                {" "}e a{" "}
                <a href="/aviso-legal" style={{ color: "#25749F", textDecoration: "underline" }}>Política de Privacidade</a>.
              </label>
            </div>
            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !formState.privacy}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "white",
                backgroundColor: loading ? "#B84520" : "#DB5C34",
                border: "none",
                padding: "1rem 2.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s, transform 0.15s",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#B84520";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = loading ? "#B84520" : "#DB5C34";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? "A enviar..." : "Enviar Pedido de Informação"}
            </button>

            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.75rem",
                color: "#6B8A9F",
                marginTop: "1rem",
              }}
            >
              Ao submeter, aceita a nossa{" "}
              <a href="/aviso-legal" style={{ color: "#25749F" }}>
                Política de Privacidade
              </a>
              . Os seus dados são tratados de acordo com o RGPD.
            </p>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}
