/* ============================================================
   TEAM 24 — Página A Plataforma
   Design: Editorial Clarity. Carrossel automático com imagem.
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Shield, Brain, BarChart3, Users, MessageCircle, Zap, Lock, Globe, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD } from "@/components/SEO";
import { trackAgendarClick } from "@/lib/analytics";

const features = [
  {
    icon: <MessageCircle size={22} />,
    title: "Apoio Psicológico",
    desc: "Acesso ilimitado a uma equipa de psicólogos certificados pela OPP, disponíveis por videoconsulta, linha de apoio e chat de apoio. Marcação em menos de 24horas.",
    detail: ["Consulta, linha, chat, webinars", "Avaliação de Riscos Psicossociais", "Consultoria organizacional aos RH", "Anónimo e confidencial", "Disponível em 3 idiomas (Português, inglês e espanhol)"],
    color: "#2E9E6B",
    image: "/media/psicologia_0e4cf1c7_4da5b07d_71d66e27.webp",
  },
  {
    icon: <Shield size={22} />,
    title: "Apoio Jurídico e Legal",
    desc: "Serviço de consultoria que disponibiliza orientação jurídica e legal especializada, de forma confidencial e anónima.",
    detail: [],
    color: "#25749F",
    image: "/media/juridico_7529bef3_e359229b_1384ca87.webp",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Apoio Financeiro/Fiscal",
    desc: "Acesso a serviço de consultoria financeira e fiscal especializada, de forma confidencial e anónima.",
    detail: [],
    color: "#7B5EA7",
    image: "/media/financeiro_01e15531_e217f38b_10203aa7.webp",
  },
  {
    icon: <Brain size={22} />,
    title: "Apoio Nutricional",
    desc: "Acesso a acompanhamento nutricional personalizado, de forma confidencial e anónima.",
    detail: [],
    color: "#2E9E6B",
    image: "/media/nutricao_65f6dad8_b1cb1fdd_7ed1217f.webp",
  },
  {
    icon: <Users size={22} />,
    title: "Apoio Social e Familiar",
    desc: "Serviço de assessoria e orientação para apoiar na gestão de responsabilidades pessoais e profissionais, de forma confidencial e anónima.",
    detail: [],
    color: "#C9A227",
    image: "/media/social_3c105bde_5a7d333c_8ed81744.webp",
  },
];

const security = [
  { icon: <Lock size={18} />, title: "RGPD Compliant", desc: "Totalmente conforme com o Regulamento Geral de Proteção de Dados da UE. Dados armazenados em servidores europeus." },
  { icon: <Shield size={18} />, title: "ISO 27001", desc: "Certificação de segurança da informação. Auditorias anuais por entidade independente." },
  { icon: <Globe size={18} />, title: "Encriptação E2E", desc: "Todas as comunicações entre colaboradores e psicólogos são encriptadas de ponta a ponta." },
  { icon: <Smartphone size={18} />, title: "Anonimato Garantido", desc: "Dados pessoais e clínicos confidenciais e anónimos. Métricas de utilização agregadas e anonimizadas." },
];

const steps = [
  { n: "01", title: "Contrato em 24h", desc: "Assinatura do contrato e configuração da conta da empresa em menos de 24 horas." },
  { n: "02", title: "Configuração da Plataforma", desc: "Importação da lista de colaboradores via CSV ou convite por email. A nossa equipa acompanha todo o processo." },
  { n: "03", title: "Convite aos colaboradores", desc: "Envio automático de convites por email com instruções de onboarding." },
  { n: "04", title: "Ativo em 24 horas", desc: "Plataforma completamente operacional em menos de 24 horas. Suporte dedicado durante todo o processo." },
];

const AUTOPLAY_INTERVAL = 4000;

export default function Platform() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [imageVisible, setImageVisible] = useState(true);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Autoplay
  const startAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setImageVisible(false);
      setTimeout(() => {
        setActiveFeature((prev) => (prev + 1) % features.length);
        setImageVisible(true);
      }, 300);
    }, AUTOPLAY_INTERVAL);
  };

  useEffect(() => {
    startAutoplay();
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, []);

  const goTo = (i: number) => {
    setImageVisible(false);
    setTimeout(() => {
      setActiveFeature(i);
      setImageVisible(true);
    }, 300);
    startAutoplay(); // reset timer on manual click
  };

  const goPrev = () => goTo((activeFeature - 1 + features.length) % features.length);
  const goNext = () => goTo((activeFeature + 1) % features.length);

  const f = features[activeFeature];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FA" }}>
      <Navbar />

      <SEO
        title="Plataforma EAP | Tecnologia de Saúde Mental para Empresas | TEAM 24"
        description="Conheça a plataforma TEAM 24: dashboard de gestão, relatórios de bem-estar, agendamento de consultas e app mobile. A tecnologia EAP mais avançada do mercado português."
        keywords="plataforma EAP, dashboard bem-estar empresas, tecnologia saúde mental, software RH bem-estar"
        canonicalPath="/plataforma"
        jsonLd={[serviceLD({ name: "Plataforma TEAM 24", description: "Plataforma EAP com dashboard de gestão, relatórios e app mobile.", url: "/plataforma" }), breadcrumbLD([{ name: "Início", path: "/" }, { name: "Plataforma", path: "/plataforma" }])]}
      />
      {/* ── Header ── */}
      <div style={{ backgroundColor: "#0A1A2A", paddingTop: "5rem", paddingBottom: "3rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ display: "inline-block", width: "2rem", height: "2px", backgroundColor: "#DB5C34" }} />
            A nossa APP
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "3rem", alignItems: "end" }}>
            <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(3rem, 6vw, 6rem)", lineHeight: 1.0, letterSpacing: "-0.03em", color: "white", margin: 0 }}>
              Tudo o que<br />
              <em style={{ color: "#DB5C34" }}>a sua equipa</em><br />
              precisa.
            </h1>
            <div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.65)", margin: "0 0 2.5rem 0", maxWidth: "45ch" }}>
                A TEAM 24 tem uma APP completa de saúde mental empresarial. Desde a prevenção à intervenção, disponibiliza todo o apoio necessário para tomar as melhores decisões de RH.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
                {[{ v: "5", l: "Serviços disponíveis" }, { v: "500+", l: "Recursos de bem-estar" }, { v: "24h", l: "Para estar ativo" }].map((s) => (
                  <div key={s.l}>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#DB5C34", letterSpacing: "-0.03em", marginBottom: "0.35rem" }}>{s.v}</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features Carousel ── */}
      <div style={{ backgroundColor: "white", padding: "5rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
            Serviços
          </div>
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 3.5rem 0", lineHeight: 1.1 }}>
            5 Serviços<br />
            <em style={{ color: "#DB5C34" }}>numa única APP.</em>
          </h2>

          {/* Carousel container */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
            gap: isDesktop ? "5rem" : "2rem",
            alignItems: "center",
          }}>

            {/* LEFT: text content */}
            <div>
              {/* Module tabs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.5rem" }}>
                {features.map((feat, i) => (
                  <button
                    key={feat.title}
                    onClick={() => goTo(i)}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      letterSpacing: "0.03em",
                      padding: "0.4rem 1rem",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "2px",
                      transition: "all 0.2s",
                      backgroundColor: activeFeature === i ? feat.color : "#F0F4F8",
                      color: activeFeature === i ? "white" : "#6B8A9F",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Active feature content */}
              <div
                key={activeFeature}
                style={{
                  opacity: imageVisible ? 1 : 0,
                  transform: imageVisible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <div style={{ color: f.color }}>{f.icon}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: f.color }}>
                    Serviço {activeFeature + 1} de {features.length}
                  </div>
                </div>

                <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "#0A1A2A", margin: "0 0 1.25rem 0", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                  {f.title}
                </h3>

                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "#3D5A6E", lineHeight: 1.75, margin: "0 0 2rem 0" }}>
                  {f.desc}
                </p>

                <div style={{ height: "1px", backgroundColor: "#D0E2EC", marginBottom: "1.75rem" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.5rem", marginBottom: "2.5rem" }}>
                  {f.detail.map((d) => (
                    <div key={d} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: f.color, flexShrink: 0, marginTop: "0.45rem" }} />
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#3D5A6E", lineHeight: 1.5 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <button
                  onClick={goPrev}
                  style={{ width: "40px", height: "40px", border: "1.5px solid #D0E2EC", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#3D5A6E", transition: "all 0.2s", borderRadius: "2px" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = f.color; (e.currentTarget as HTMLButtonElement).style.color = f.color; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#D0E2EC"; (e.currentTarget as HTMLButtonElement).style.color = "#3D5A6E"; }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={goNext}
                  style={{ width: "40px", height: "40px", border: "1.5px solid #D0E2EC", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#3D5A6E", transition: "all 0.2s", borderRadius: "2px" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = f.color; (e.currentTarget as HTMLButtonElement).style.color = f.color; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#D0E2EC"; (e.currentTarget as HTMLButtonElement).style.color = "#3D5A6E"; }}
                >
                  <ChevronRight size={18} />
                </button>

                {/* Progress bar */}
                <div style={{ flex: 1, height: "2px", backgroundColor: "#F0F4F8", borderRadius: "1px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    backgroundColor: f.color,
                    width: `${((activeFeature + 1) / features.length) * 100}%`,
                    transition: "width 0.4s ease, background-color 0.3s ease",
                  }} />
                </div>

                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "#6B8A9F", minWidth: "3ch" }}>
                  {activeFeature + 1}/{features.length}
                </span>
              </div>
            </div>

            {/* RIGHT: image */}
            <div style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "4px",
              aspectRatio: "4/3",
              backgroundColor: "#F0F4F8",
            }}>
              {/* Color accent bar */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                backgroundColor: f.color,
                zIndex: 2,
                transition: "background-color 0.3s ease",
              }} />

              <img
                key={activeFeature}
                src={f.image}
                alt={f.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  opacity: imageVisible ? 1 : 0,
                  transform: imageVisible ? "scale(1)" : "scale(1.03)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              />

              {/* Module label overlay */}
              <div style={{
                position: "absolute",
                bottom: "1.25rem",
                left: "1.25rem",
                backgroundColor: "rgba(10,26,42,0.75)",
                backdropFilter: "blur(8px)",
                padding: "0.5rem 1rem",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                opacity: imageVisible ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}>
                <div style={{ color: f.color }}>{f.icon}</div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "white" }}>{f.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── App Mockup ── */}
      <div style={{ backgroundColor: "#0A1A2A", padding: "4rem 0", overflow: "hidden" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "1rem" }}>
                App Mobile
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "white", margin: "0 0 1.5rem 0", lineHeight: 1.1 }}>
                No bolso de<br />
                <em style={{ color: "#DB5C34" }}>cada colaborador.</em>
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.65)", margin: "0 0 2.5rem 0", maxWidth: "40ch" }}>
                Disponível para iOS e Android. Notificações inteligentes, check-ins de bem-estar e acesso a todos os serviços num só lugar.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <a href="https://apps.apple.com/pt/app/team24/id1614817254" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", backgroundColor: "white", color: "#0A1A2A", padding: "0.75rem 1.5rem", textDecoration: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", transition: "opacity 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                  <Smartphone size={16} /> App Store
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.team24.app&hl=pt_PT" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", backgroundColor: "transparent", color: "white", border: "1.5px solid rgba(255,255,255,0.4)", padding: "0.75rem 1.5rem", textDecoration: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", transition: "border-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "white")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}>
                  <Smartphone size={16} /> Google Play
                </a>
              </div>
            </div>
            {/* App mockup visual */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img
                src="/media/mockup01-global_ff098b6a_7ebff71f.webp"
                alt="App TEAM 24 — Dois telemóveis com a aplicação"
                style={{
                  width: isDesktop ? "420px" : "280px",
                  height: "auto",
                  display: "block",
                  filter: "drop-shadow(0 24px 60px rgba(0,0,0,0.3))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Security ── */}
      <div style={{ backgroundColor: "white", padding: "4rem 0", borderBottom: "1px solid #D0E2EC" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr",
            gap: "0",
            alignItems: "stretch",
          }}>
            <div style={{ padding: isDesktop ? "3rem 3rem 3rem 0" : "2rem 0", borderRight: isDesktop ? "1px solid #D0E2EC" : "none", borderBottom: !isDesktop ? "1px solid #D0E2EC" : "none", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "0.75rem" }}>
                Segurança & Privacidade
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: 0, lineHeight: 1.1 }}>
                Confiança como<br />
                <em style={{ color: "#DB5C34" }}>fundação.</em>
              </h2>
            </div>
            {security.filter(s => s.title === "RGPD Compliant" || s.title === "Anonimato Garantido").map((s, i) => (
              <div
                key={s.title}
                style={{
                  padding: isDesktop ? "3rem 2.5rem" : "2rem 0",
                  borderLeft: isDesktop ? "1px solid #D0E2EC" : "none",
                  borderBottom: !isDesktop && i === 0 ? "1px solid #D0E2EC" : "none",
                  borderTop: "3px solid transparent",
                  transition: "border-top-color 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderTopColor = "#25749F")}
                onMouseLeave={(e) => (e.currentTarget.style.borderTopColor = "transparent")}
              >
                <div style={{ color: "#25749F", marginBottom: "0.75rem" }}>{s.icon}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0A1A2A", marginBottom: "0.5rem" }}>{s.title}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", color: "#6B8A9F", lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Implementation Steps ── */}
      <div style={{ backgroundColor: "#F5F8FA", padding: "4rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
            Implementação
          </div>
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 4rem 0", lineHeight: 1.1 }}>
            Ativo em<br />
            <em style={{ color: "#DB5C34" }}>24 horas.</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: "0" }}>
            {steps.map((step, i) => (
              <div key={step.n} style={{ padding: "2.5rem 2rem", borderRight: isDesktop ? (i < 3 ? "1px solid #D0E2EC" : "none") : (i % 2 === 0 ? "1px solid #D0E2EC" : "none"), borderBottom: !isDesktop && i < 2 ? "1px solid #D0E2EC" : "none" }}>
                <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "3rem", color: "#DB5C34", opacity: 0.2, letterSpacing: "-0.05em", lineHeight: 1, marginBottom: "1rem" }}>{step.n}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0A1A2A", marginBottom: "0.75rem" }}>{step.title}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", color: "#6B8A9F", lineHeight: 1.65 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ backgroundColor: "#DB5C34", padding: "5rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "white", margin: "0 0 0.5rem 0", lineHeight: 1.1 }}>
              Pronto para começar?
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
              Agende uma demo gratuita de 30 minutos. Sem compromisso.
            </p>
          </div>
          <Link href="/contacto">
            <button style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#DB5C34", backgroundColor: "white", border: "none", padding: "1rem 2.5rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", transition: "opacity 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")} onClick={() => trackAgendarClick("platform_page")}>
              Agendar Reunião Gratuita <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
