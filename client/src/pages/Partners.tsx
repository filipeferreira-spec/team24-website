/* ============================================================
   TEAM 24 — Página de Parceiros
   Design: Editorial Clarity. Sem cards, sem sombras.
   Tipos de parceria, benefícios, parceiros atuais, formulário.
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */

import { useState, useEffect } from "react";
import { ArrowRight, Building2, Users, Stethoscope, GraduationCap, Handshake, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD } from "@/components/SEO";
import { COMPANY_LOGOS, getLogoByName } from "@/lib/companyLogos";
import { trackPartnerFormSubmit } from "@/lib/analytics";
import { trpc } from "@/lib/trpc";

const partnerTypes = [
  {
    icon: <Building2 size={28} strokeWidth={1.5} />,
    title: "Parceiro Empresarial",
    subtitle: "Para empresas e grupos",
    description:
      "Integre a TEAM 24 no pacote de benefícios dos seus colaboradores. Acesso a condições preferenciais, onboarding dedicado e relatórios de impacto trimestrais.",
    benefits: [
      "Preço por colaborador a partir de €2/mês",
      "Implementação em menos de 24 horas",
      "Relatórios de bem-estar anónimos",
      "Gestor de conta dedicado",
    ],
    cta: "Tornar-se Parceiro",
    accent: "#25749F",
  },
  {
    icon: <Stethoscope size={28} strokeWidth={1.5} />,
    title: "Parceiro Clínico",
    subtitle: "Psicólogos e clínicas",
    description:
      "Junte-se à rede de psicólogos e terapeutas da TEAM 24. Receba encaminhamentos qualificados, aceda à plataforma de gestão de consultas e faça parte de uma comunidade de saúde mental empresarial.",
    benefits: [
      "Encaminhamentos qualificados mensais",
      "Plataforma de gestão de agenda",
      "Formação contínua certificada",
      "Comunidade de prática clínica",
    ],
    cta: "Candidatar-me",
    accent: "#DB5C34",
  },
  {
    icon: <GraduationCap size={28} strokeWidth={1.5} />,
    title: "Parceiro Académico",
    subtitle: "Universidades e centros de investigação",
    description:
      "Colabore em investigação sobre saúde mental no trabalho. Acesso a dados anonimizados, co-publicação de estudos e participação em conferências internacionais.",
    benefits: [
      "Acesso a dados anonimizados",
      "Co-publicação de artigos científicos",
      "Participação em conferências",
      "Bolsas de investigação conjunta",
    ],
    cta: "Propor Colaboração",
    accent: "#25749F",
  },
  {
    icon: <Handshake size={28} strokeWidth={1.5} />,
    title: "Parceiro Tecnológico",
    subtitle: "SaaS, RH e plataformas de benefícios",
    description:
      "Integre a TEAM 24 na sua plataforma via API. Ofereça saúde mental como módulo nativo aos seus clientes e beneficie de revenue sharing competitivo.",
    benefits: [
      "API REST documentada",
      "Revenue sharing até 30%",
      "Co-marketing e visibilidade",
      "Suporte técnico prioritário",
    ],
    cta: "Ver Documentação API",
    accent: "#DB5C34",
  },
];

const currentPartners = [
  { key: "galp", name: "Galp" },
  { key: "rtp", name: "RTP" },
  { key: "adecco", name: "Adecco" },
  { key: "ikea", name: "IKEA" },
  { key: "salvador_caetano", name: "Salvador Caetano" },
  { key: "casais", name: "Casais" },
  { key: "nova", name: "Nova" },
  { key: "stcp_new", name: "STCP" },
  { key: "norauto", name: "Norauto" },
  { key: "mds", name: "MDS" },
  { key: "aguasdeportugal", name: "Águas de Portugal" },
  { key: "bancobni", name: "Banco BNI" },
  { key: "doutor_financas", name: "Doutor Finanças" },
  { key: "sporting", name: "Sporting CP" },
  { key: "express_glass", name: "Express Glass" },
  { key: "voltalia", name: "Voltalia" },
  { key: "tangivel", name: "Tangível" },
  { key: "smartconsulting", name: "Smart Consulting" },
  { key: "servier", name: "Servier" },
  { key: "seines", name: "Seines" },
  { key: "sanitop", name: "Sanitop" },
  { key: "samsys", name: "Samsys" },
  { key: "ptisp", name: "PTISP" },
  { key: "politermicaweb", name: "Politérmica" },
  { key: "penguin", name: "Penguin" },
  { key: "nutrium", name: "Nutrium" },
  { key: "miele", name: "Miele" },
  { key: "ldauto", name: "LD Auto" },
  { key: "hanon", name: "Hanon Systems" },
  { key: "hbk", name: "HBK" },
  { key: "eurotux_new", name: "Eurotux" },
  { key: "diaverum", name: "Diaverum" },
  { key: "diatosta", name: "Diatosta" },
  { key: "davita", name: "DaVita" },
  { key: "corksupply", name: "Corksupply" },
  { key: "cepac", name: "CEPAC" },
  { key: "capricciosa", name: "Capricciosa" },
  { key: "ccalaw", name: "CCA Law" },
  { key: "boost", name: "Boost" },
];

const stats = [
  { value: "200+", label: "Clientes ativos" },
  { value: "200K+", label: "Colaboradores apoiados" },
  { value: "4.9/5", label: "Satisfação média" },
  { value: "98%", label: "Taxa de renovação" },
];

export default function Partners() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [formState, setFormState] = useState({
    name: "", company: "", email: "", phone: "", type: "empresarial", message: "", privacy: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const partnerMutation = trpc.forms.partner.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await partnerMutation.mutateAsync({
      name: formState.name,
      email: formState.email,
      company: formState.company,
      phone: formState.phone,
      partnerType: formState.type,
      message: formState.message || undefined,
    });
    trackPartnerFormSubmit();
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
    textTransform: "uppercase" as const,
    color: "#6B8A9F",
    display: "block",
    marginBottom: "0.25rem",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FA", overflowX: "hidden" }}>
      <Navbar />

      <SEO
        title="Parceiros | TEAM 24 — Rede de Parceiros EAP"
        description="Conheça os parceiros da TEAM 24 e junte-se à nossa rede. Empresas de referência que confiam no nosso programa EAP para cuidar dos seus colaboradores em Portugal."
        keywords="parceiros TEAM 24, rede parceiros EAP, empresas parceiras saúde mental"
        canonicalPath="/parceiros"
        jsonLd={[ORGANIZATION_LD, breadcrumbLD([{ name: "Início", path: "/" }, { name: "Parceiros", path: "/parceiros" }])]}
      />
      {/* ── Page Header ── */}
      <div style={{ backgroundColor: "#0A1A2A", paddingTop: "5rem", paddingBottom: "3rem", overflowX: "hidden" }}>
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
            Os Nossos Clientes
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
              gap: "3rem",
              alignItems: "end",
            }}
          >
            <h1
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 8vw, 6rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
                color: "white",
                margin: 0,
              }}
            >
              Empresas que<br />
              <em style={{ color: "#DB5C34", fontStyle: "italic" }}>confiam em nós.</em>
            </h1>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1.1rem",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.65)",
                margin: 0,
                maxWidth: "45ch",
              }}
            >
              Mais de 200 empresas em Portugal e outros países confiam na TEAM 24 para cuidar da saúde psicológica e bem-estar dos seus colaboradores. Conheça quem já faz parte desta comunidade.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ backgroundColor: "#DB5C34" }}>
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "2.5rem clamp(1.5rem, 4vw, 4rem)",
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(2rem, 3vw, 2.75rem)",
                  color: "white",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: "0.35rem",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.75)",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* ── Current Partners ── */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "4rem 0", borderTop: "1px solid #E8EEF3", borderBottom: "1px solid #E8EEF3" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#DB5C34",
              marginBottom: "1rem",
            }}
          >
            Clientes TEAM 24
          </div>
          <h2
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              letterSpacing: "-0.03em",
              color: "#0A1A2A",
              margin: "0 0 3rem 0",
              lineHeight: 1.1,
            }}
          >
            Algumas das 200 empresas<br />
            <em style={{ color: "#DB5C34" }}>que confiam em nós.</em>
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(6, 1fr)" : "repeat(3, 1fr)",
              gap: "0",
            }}
          >
            {currentPartners.map((p, i) => {
              const cols = isDesktop ? 6 : 3;
              const entry = COMPANY_LOGOS[p.key] || getLogoByName(p.name);
              return (
                <div
                  key={p.name}
                  style={{
                    padding: isDesktop ? "1.75rem 1.5rem" : "1rem 0.75rem",
                    borderRight: i % cols !== cols - 1 ? "1px solid #E8EEF3" : "none",
                    borderBottom: "1px solid #E8EEF3",
                    transition: "background 0.2s",
                    cursor: "default",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    minHeight: isDesktop ? "110px" : "80px",
                  }}

                >
                  {entry ? (
                    <img
                      src={entry.logo}
                      alt={entry.name}
                      title={entry.name}
                      style={{
                        height: isDesktop ? "48px" : "36px",
                        width: "auto",
                        maxWidth: isDesktop ? "140px" : "90px",
                        objectFit: "contain",
                        filter: "none",
                        opacity: 0.85,
                        transition: "opacity 0.2s",
                      }}

                    />
                  ) : (
                    <div style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      color: "#0A1A2A",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                      textAlign: "center",
                    }}>{p.name}</div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Partner Application Form ── */}
      <div
        id="parceiros-form"
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "4rem clamp(1.5rem, 4vw, 4rem)" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
            gap: isDesktop ? "6rem" : "3rem",
            alignItems: "start",
          }}
        >
          {/* Left: heading */}
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#6B8A9F",
                marginBottom: "1rem",
              }}
            >
            </div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                letterSpacing: "-0.03em",
                color: "#0A1A2A",
                margin: "0 0 1.5rem 0",
                lineHeight: 1.1,
              }}
            >
              Torne-se<br />
              <em style={{ color: "#DB5C34" }}>cliente.</em>
            </h2>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "#3D5A6E",
                marginBottom: "2.5rem",
                maxWidth: "45ch",
              }}
            >
              Equipa disponível de 2ª a 6ª, 9h–18h
            </p>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.85rem",
                lineHeight: 1.7,
                color: "#6B8A9F",
                maxWidth: "45ch",
              }}
            >
              Ao enviar o pedido, os seus dados serão tratados de acordo com o RGPD e a nossa Política de Privacidade.
            </p>
          </div>

          {/* Right: form */}
          <div>
            {submitted ? (
              <div style={{ paddingTop: "2rem", borderTop: "3px solid #DB5C34" }}>
                <div
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    letterSpacing: "-0.03em",
                    color: "#0A1A2A",
                    lineHeight: 1.1,
                    marginBottom: "1rem",
                  }}
                >
                  Pedido<br />
                  <em style={{ color: "#DB5C34" }}>recebido.</em>
                </div>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "#6B8A9F", lineHeight: 1.75 }}>
                  A nossa equipa comercial irá analisar o seu pedido e entrar em contacto em menos de 24 horas com uma proposta personalizada.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Type selector */}
                <div style={{ marginBottom: "2rem" }}>
                  <label style={labelStyle}>Tipo de Empresa *</label>
                  <select
                    name="type"
                    required
                    aria-label="Tipo de empresa"
                    value={formState.type}
                    onChange={handleChange}
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")}
                    onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}
                  >
                    <option value="pme">PME (até 250 colaboradores)</option>
                    <option value="grande">Grande Empresa (250+)</option>
                    <option value="multinacional">Multinacional / Grupo</option>
                    <option value="setor_publico">Setor Público / Instituição</option>
                  </select>
                </div>

                {/* Name + Company */}
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
                    <label style={labelStyle}>Empresa / Organização *</label>
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

                {/* Email + Phone */}
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

                {/* Message */}
                <div style={{ marginBottom: "2.5rem" }}>
                  <label style={labelStyle}>Como podemos colaborar?</label>
                  <textarea
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="Descreva o que procura e quantos colaboradores tem a sua empresa..."
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")}
                    onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <input type="checkbox" id="privacy-partners" required checked={formState.privacy} onChange={(e) => setFormState((prev) => ({ ...prev, privacy: e.target.checked }))} style={{ marginTop: "3px", accentColor: "#DB5C34", cursor: "pointer", width: "16px", height: "16px", flexShrink: 0 }} />
                  <label htmlFor="privacy-partners" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#4A6070", lineHeight: 1.5, cursor: "pointer" }}>
                    Li e aceito os{" "}<a href="/termos" style={{ color: "#25749F", textDecoration: "underline" }}>Termos e Condições</a>{" "}e a{" "}<a href="/aviso-legal" style={{ color: "#25749F", textDecoration: "underline" }}>Política de Privacidade</a>.
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading || !formState.privacy}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "white",
                    backgroundColor: (loading || !formState.privacy) ? "#B84520" : "#DB5C34",
                    border: "none",
                    padding: "1rem 2.5rem",
                    cursor: (loading || !formState.privacy) ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s, transform 0.15s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => { if (!loading && formState.privacy) { e.currentTarget.style.backgroundColor = "#B84520"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = (loading || !formState.privacy) ? "#B84520" : "#DB5C34"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {loading ? "A enviar..." : <> Enviar Pedido <ArrowRight size={16} /> </>}
                </button>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "#6B8A9F", marginTop: "1rem" }}>
                  Os seus dados são tratados de acordo com o RGPD e a nossa{" "}
                  <a href="#" style={{ color: "#25749F" }}>Política de Privacidade</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
