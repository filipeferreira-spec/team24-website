/* ============================================================
   TEAM 24 — Landing Page de Conversão (/demo)
   Design: Editorial Clarity — mesmo layout do site principal
   Navbar + Footer reais. Sem ícones emoji. Tipografia Syne + Plus Jakarta Sans.
   Cores: azul #25749F + laranja #DB5C34 + fundo branco/escuro
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { COMPANY_LOGOS } from "@/lib/companyLogos";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2, Users, TrendingUp, Clock, Shield, BarChart3, Brain } from "lucide-react";
import { trackAgendarClick } from "@/lib/analytics";
import SEO from "@/components/SEO";

// ─── DADOS ────────────────────────────────────────────────────────────────────

const BENEFICIOS = [
  {
    Icon: Brain,
    titulo: "Apoio Psicológico 24/7",
    desc: "Psicólogos certificados disponíveis por chat, voz e vídeo, a qualquer hora do dia.",
  },
  {
    Icon: BarChart3,
    titulo: "Dashboard de Bem-Estar",
    desc: "Métricas em tempo real sobre o estado emocional da sua equipa, de forma anónima e RGPD-compliant.",
  },
  {
    Icon: Brain,
    titulo: "IA de Diagnóstico",
    desc: "Algoritmos que identificam padrões de burnout antes de se tornarem problemas graves.",
  },
  {
    Icon: TrendingUp,
    titulo: "ROI Comprovado",
    desc: "Em média, as empresas parceiras registam 40% menos absentismo e 35% mais produtividade.",
  },
  {
    Icon: Shield,
    titulo: "Privacidade Total",
    desc: "Dados 100% anónimos para a empresa. Os colaboradores confiam porque a privacidade é garantida.",
  },
  {
    Icon: Clock,
    titulo: "Implementação em 24h",
    desc: "Da assinatura ao primeiro acesso dos colaboradores em menos de 24 horas.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Em 6 meses, o absentismo reduziu 40% e a equipa está visivelmente mais motivada. O ROI foi imediato.",
    name: "Ricardo Ferreira",
    role: "Diretor de RH",
    empresa: "Galp Energia",
    initials: "RF",
  },
  {
    quote: "A TEAM 24 transformou a forma como olhamos para o bem-estar. Já não é um custo — é um investimento estratégico.",
    name: "Sofia Mendes",
    role: "CEO",
    empresa: "Sonae MC",
    initials: "SM",
  },
  {
    quote: "Os nossos colaboradores adoram a app. A taxa de utilização mensal é de 78%, muito acima da média do setor.",
    name: "António Costa",
    role: "CHRO",
    empresa: "EDP",
    initials: "AC",
  },
];

const STATS = [
  { value: "200+", label: "Empresas Parceiras" },
  { value: "200.000+", label: "Colaboradores Ativos" },
  { value: "4.9★", label: "Avaliação App Store" },
];

const LOGOS = ["Galp", "Sonae", "EDP", "Millennium BCP", "NOS", "Jerónimo Martins"];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function LandingPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    empresa: "",
    telefone: "",
    colaboradores: "",
    privacy: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const beneficiosRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Intersection observer for reveal animations
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
    [beneficiosRef, testimonialsRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.95rem",
    color: "white",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    padding: "0.75rem 0",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.68rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.4)",
    display: "block",
    marginBottom: "0.25rem",
  };

  return (
    <div style={{ minHeight: "100vh", background: "white" }}>
      <SEO
        title="Agendar Reunião | TEAM 24"
        description="Agende uma demonstração gratuita do EAP TEAM 24 e descubra como melhorar o bem-estar dos seus colaboradores."
        canonicalPath="/demo"
        noIndex
      />
      <Navbar />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        style={{
          background: "var(--ink, #0A1A2A)",
          padding: isDesktop ? "5rem 2rem 4rem" : "3.5rem 1.5rem 3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative line */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #DB5C34 0%, transparent 60%)",
        }} />

        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isDesktop ? "1fr 420px" : "1fr",
          gap: isDesktop ? "5rem" : "3rem",
          alignItems: "start",
        }}>
          {/* Left: Copy */}
          <div>
            {/* Eyebrow */}
            <div style={{
              display: "inline-block",
              borderLeft: "3px solid #DB5C34",
              paddingLeft: "0.85rem",
              marginBottom: "2rem",
            }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
              }}>
                Plataforma de Bem-Estar Corporativo
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: isDesktop ? "3.5rem" : "2.4rem",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              margin: "0 0 1.5rem",
            }}>
              Transforme o Bem-Estar<br />
              da Sua Equipa em<br />
              <em style={{ color: "#DB5C34", fontStyle: "italic" }}>Vantagem Competitiva</em>
            </h1>

            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.75,
              margin: "0 0 2.5rem",
              maxWidth: "52ch",
            }}>
              A TEAM 24 é a plataforma de saúde mental que as melhores empresas portuguesas usam para reduzir absentismo, aumentar produtividade e reter talento.
            </p>

            {/* Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "3rem" }}>
              {["Sem compromisso — demo gratuita de 30 minutos", "Implementação em menos de 24 horas", "Conformidade total com RGPD"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <CheckCircle2 size={16} color="#DB5C34" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5rem 2.5rem",
              paddingTop: "2.5rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
              {STATS.map((s) => (
                <div key={s.label}>
                  <div style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "#DB5C34",
                    lineHeight: 1,
                    marginBottom: "0.3rem",
                  }}>{s.value}</div>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div id="formulario" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "2.5rem",
          }}>
            {!submitted ? (
              <>
                <div style={{ marginBottom: "2rem" }}>
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#DB5C34",
                    marginBottom: "0.75rem",
                  }}>
                    Demo Gratuita
                  </div>
                  <h2 style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "white",
                    margin: "0 0 0.5rem",
                    lineHeight: 1.2,
                  }}>
                    Agende a sua demonstração
                  </h2>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.4)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    Veja como a TEAM 24 pode transformar a sua empresa em 30 minutos.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {[
                    { key: "nome", label: "Nome completo", type: "text", placeholder: "O seu nome" },
                    { key: "email", label: "Email profissional", type: "email", placeholder: "email@empresa.pt" },
                    { key: "empresa", label: "Empresa", type: "text", placeholder: "Nome da empresa" },
                    { key: "telefone", label: "Telefone", type: "tel", placeholder: "+351 9XX XXX XXX" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        type={type}
                        required
                        placeholder={placeholder}
                        value={formData[key as keyof typeof formData] as string}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        style={inputStyle}
                        onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#DB5C34"; }}
                        onBlur={(e) => { e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.2)"; }}
                      />
                    </div>
                  ))}

                  <div>
                    <label style={labelStyle}>Nº de Colaboradores</label>
                    <select
                      required
                      value={formData.colaboradores}
                      onChange={(e) => setFormData({ ...formData, colaboradores: e.target.value })}
                      style={{
                        ...inputStyle,
                        color: formData.colaboradores ? "white" : "rgba(255,255,255,0.3)",
                        cursor: "pointer",
                      }}
                    >
                      <option value="" disabled style={{ color: "#0A1A2A" }}>Selecionar...</option>
                      <option value="10-50" style={{ color: "#0A1A2A" }}>10 – 50</option>
                      <option value="50-200" style={{ color: "#0A1A2A" }}>50 – 200</option>
                      <option value="200-500" style={{ color: "#0A1A2A" }}>200 – 500</option>
                      <option value="500-1000" style={{ color: "#0A1A2A" }}>500 – 1.000</option>
                      <option value="1000+" style={{ color: "#0A1A2A" }}>Mais de 1.000</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", marginBottom: "0.75rem" }}>
                    <input
                      type="checkbox"
                      id="privacy-landing"
                      required
                      checked={formData.privacy}
                      onChange={(e) => setFormData((prev) => ({ ...prev, privacy: e.target.checked }))}
                      style={{ marginTop: "3px", accentColor: "#DB5C34", cursor: "pointer", width: "15px", height: "15px", flexShrink: 0 }}
                    />
                    <label htmlFor="privacy-landing" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, cursor: "pointer" }}>
                      Li e aceito os{" "}
                      <a href="/termos" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}>Termos</a>
                      {" "}e a{" "}
                      <a href="/aviso-legal" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}>Política de Privacidade</a>.
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !formData.privacy}
                    style={{
                      marginTop: "0.5rem",
                      background: (loading || !formData.privacy) ? "rgba(219,92,52,0.5)" : "#DB5C34",
                      color: "white",
                      border: "none",
                      padding: "1rem 1.5rem",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#B84520"; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#DB5C34"; }}
                    onClick={() => !loading && trackAgendarClick("landing_page_form")}
                  >
                    {loading ? "A enviar..." : (
                      <>Agendar Reunião Gratuita <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>

                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.25)",
                  textAlign: "center",
                  marginTop: "1.25rem",
                  lineHeight: 1.6,
                }}>
                  Os seus dados são tratados com total confidencialidade ao abrigo do RGPD.
                </p>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <CheckCircle2 size={48} color="#DB5C34" style={{ marginBottom: "1.5rem" }} />
                <h3 style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "white",
                  margin: "0 0 0.75rem",
                }}>
                  Pedido recebido!
                </h3>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                  margin: "0 0 2rem",
                }}>
                  A nossa equipa vai entrar em contacto em menos de 24 horas para agendar a sua demonstração personalizada.
                </p>
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "1.5rem",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.4)",
                }}>
                  Prefere ligar?{" "}
                  <a href="tel:+351220981284" style={{ color: "#DB5C34", textDecoration: "none", fontWeight: 600 }}>
                    +351 220 981 284
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── LOGOS CLIENTES ── */}
      <section style={{
        padding: isDesktop ? "4rem 2rem" : "3rem 1.5rem",
        borderBottom: "1px solid #E5EEF4",
        background: "#F8FAFB",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
            <div style={{ height: "1px", flex: 1, background: "#E5EEF4" }} />
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#DB5C34",
              margin: 0,
              whiteSpace: "nowrap",
            }}>
              500+ empresas confiam na TEAM 24
            </p>
            <div style={{ height: "1px", flex: 1, background: "#E5EEF4" }} />
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(6, 1fr)" : "repeat(3, 1fr)",
            gap: "0",
          }}>
            {[
              { key: "galp", name: "Galp", sector: "Energia" },
              { key: "rtp", name: "RTP", sector: "Media" },
              { key: "adecco", name: "Adecco", sector: "RH" },
              { key: "ikea", name: "IKEA", sector: "Retalho" },
              { key: "salvador_caetano", name: "Salvador Caetano", sector: "Automóvel" },
              { key: "casais", name: "Casais", sector: "Construção" },
            ].map((c, i) => {
              const entry = COMPANY_LOGOS[c.key];
              return (
                <div
                  key={c.name}
                  style={{
                    padding: "1.5rem 1.25rem",
                    borderRight: i < 5 ? "1px solid #E5EEF4" : "none",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "white"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  {entry ? (
                    <img
                      src={entry.logo}
                      alt={entry.name}
                      style={{
                        height: isDesktop ? "32px" : "24px",
                        width: "auto",
                        maxWidth: "100px",
                        objectFit: "contain",
                        filter: "none",
                        opacity: 1,
                        transition: "opacity 0.2s, filter 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                    />
                  ) : (
                    <div style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: isDesktop ? "1.05rem" : "0.8rem",
                      color: "#25749F",
                    }}>{c.name}</div>
                  )}
                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#9CA3AF",
                  }}>{c.sector}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ── */}
      <section ref={beneficiosRef} style={{ padding: isDesktop ? "4rem 2rem" : "3rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "4rem" }}>
            <div style={{
              borderLeft: "3px solid #DB5C34",
              paddingLeft: "0.85rem",
              marginBottom: "1.5rem",
            }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#DB5C34",
              }}>
                O que incluímos
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: isDesktop ? "2.75rem" : "2rem",
              fontWeight: 700,
              color: "#0A1A2A",
              margin: "0 0 1rem",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}>
              Tudo o que a sua empresa precisa<br />
              <em style={{ color: "#25749F", fontStyle: "italic" }}>numa única plataforma</em>
            </h2>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "1rem",
              color: "#6B7280",
              maxWidth: "55ch",
              lineHeight: 1.7,
              margin: 0,
            }}>
              Da prevenção ao apoio em crise, a TEAM 24 cobre todo o espectro da saúde mental corporativa.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr",
            gap: "0",
          }}>
            {BENEFICIOS.map((b, i) => {
              const isLastRow = i >= 3;
              const isLastCol = (i + 1) % 3 === 0;
              return (
                <div
                  key={b.titulo}
                  className="reveal"
                  style={{
                    padding: "2.5rem",
                    borderBottom: isLastRow ? "none" : "1px solid #E5EEF4",
                    borderRight: isDesktop && !isLastCol ? "1px solid #E5EEF4" : "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFB"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <b.Icon size={24} color="#25749F" strokeWidth={1.5} style={{ marginBottom: "1.25rem", display: "block" }} />
                  <h3 style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "#0A1A2A",
                    margin: "0 0 0.75rem",
                  }}>{b.titulo}</h3>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    lineHeight: 1.7,
                    margin: 0,
                  }}>{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        ref={testimonialsRef}
        style={{
          background: "var(--ink, #0A1A2A)",
          padding: isDesktop ? "4rem 2rem" : "3rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "4rem" }}>
            <div style={{
              borderLeft: "3px solid #DB5C34",
              paddingLeft: "0.85rem",
              marginBottom: "1.5rem",
            }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
              }}>
                Resultados reais
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: isDesktop ? "2.75rem" : "2rem",
              fontWeight: 700,
              color: "white",
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}>
              O que dizem os nossos clientes
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr",
            gap: "0",
          }}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="reveal"
                style={{
                  padding: "2.5rem",
                  borderRight: isDesktop && i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <p style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "1.05rem",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.75,
                  fontStyle: "italic",
                  margin: "0 0 2rem",
                }}>
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "#25749F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "white",
                    }}>{t.initials}</span>
                  </div>
                  <div>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "white",
                      margin: 0,
                    }}>{t.name}</p>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.35)",
                      margin: 0,
                    }}>{t.role} · {t.empresa}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: isDesktop ? "4rem 2rem" : "3rem 1.5rem", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
            gap: isDesktop ? "5rem" : "3rem",
            alignItems: "center",
            borderTop: "1px solid #E5EEF4",
            paddingTop: isDesktop ? "4rem" : "3rem",
          }}>
            <div>
              <div style={{
                borderLeft: "3px solid #DB5C34",
                paddingLeft: "0.85rem",
                marginBottom: "1.5rem",
              }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#DB5C34",
                }}>
                  Pronto para começar?
                </span>
              </div>
              <h2 style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: isDesktop ? "2.75rem" : "2rem",
                fontWeight: 700,
                color: "#0A1A2A",
                margin: "0 0 1rem",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}>
                A sua equipa merece<br />
                <em style={{ color: "#DB5C34", fontStyle: "italic" }}>o melhor apoio</em>
              </h2>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1rem",
                color: "#6B7280",
                lineHeight: 1.75,
                margin: 0,
                maxWidth: "48ch",
              }}>
                Junte-se a mais de 500 empresas que já transformaram o bem-estar dos seus colaboradores com a TEAM 24.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <a
                href="/agendar"
                style={{
                  background: "#DB5C34",
                  color: "white",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "1.1rem 2rem",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "background 0.2s",
                  width: "fit-content",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#B84520"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#DB5C34"; }}
                onClick={() => trackAgendarClick("landing_page_cta")}
              >
                Agendar Reunião Gratuita <ArrowRight size={16} />
              </a>
              <a
                href="tel:+351220981284"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.875rem",
                  color: "#25749F",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Users size={16} />
                Falar com a equipa comercial
              </a>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.72rem",
                color: "#9CA3AF",
                margin: 0,
              }}>
                Sem cartão de crédito · Sem compromisso · Resposta em menos de 24h
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
