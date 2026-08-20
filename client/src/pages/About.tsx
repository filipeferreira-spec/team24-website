/* ============================================================
   TEAM 24 — Página Quem Somos
   Design: Editorial Clarity. Sem cards, sem sombras.
   História, equipa, missão, valores, linha do tempo.
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */

import { useState, useEffect } from "react";
import { trackAgendarClick } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, breadcrumbLD, faqLD } from "@/components/SEO";

const team = [
  {
    name: "Ana Ruivo",
    role: "CEO & Co-Founder",
    bio: "Psicóloga clínica com 15 anos de experiência em saúde organizacional. Antes da TEAM 24, foi diretora de bem-estar na Randstad Portugal e investigadora no ISCTE. Acredita que a saúde mental é o maior ativo de qualquer empresa.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80",
    linkedin: "#",
  },
  {
    name: "Miguel Santos",
    role: "CTO & Co-Fundador",
    bio: "Engenheiro de software com passagem pela Feedzai e Unbabel. Especialista em plataformas de saúde digital e privacidade de dados. Lidera a equipa de tecnologia com foco em segurança e experiência de utilizador.",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80",
    linkedin: "#",
  },
  {
    name: "Inês Carvalho",
    role: "COO & Co-Fundadora",
    bio: "MBA pelo INSEAD, com experiência em operações na Farfetch e McKinsey. Responsável pela estratégia de crescimento e parcerias empresariais. Transformou a TEAM 24 de startup a empresa com presença em 5 países ibero-americanos.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80",
    linkedin: "#",
  },
  {
    name: "Dr. Rui Fonseca",
    role: "Chief Clinical Officer",
    bio: "Psiquiatra e investigador na Faculdade de Medicina de Lisboa. Coordena a rede clínica da TEAM 24 e garante a qualidade e ética de todos os protocolos terapêuticos. Autor de 3 livros sobre saúde mental no trabalho.",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&q=80",
    linkedin: "#",
  },
  {
    name: "Sara Mendes",
    role: "Head of Product",
    bio: "Designer de produto com experiência na Farfetch e Prozis. Lidera o design e desenvolvimento da app TEAM 24, com foco em acessibilidade e redução do estigma em torno da saúde mental.",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80",
    linkedin: "#",
  },
  {
    name: "João Ferreira",
    role: "Head of Sales",
    bio: "Comercial com 10 anos em SaaS B2B. Antes da TEAM 24, liderou equipas de vendas na Salesforce e HubSpot Portugal. Construiu a carteira de 200+ empresas parceiras a partir do zero.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
    linkedin: "#",
  },
];


export default function About() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FA" }}>
      <SEO
        title="Quem Somos | TEAM 24 — EAP Portugal"
        description="Conheça a TEAM 24: a empresa portuguesa de saúde mental empresarial fundada em 2019 em Lisboa. Missão, história, equipa e valores de uma plataforma EAP líder em Portugal."
        canonicalPath="/quem-somos"
        jsonLd={[
          ORGANIZATION_LD,
          breadcrumbLD([{ name: "Início", path: "/" }, { name: "Quem Somos", path: "/quem-somos" }]),
          faqLD([
            { question: "Quando foi fundada a TEAM 24?", answer: "A TEAM 24 foi fundada em 2019 em Lisboa com a missão de democratizar o acesso à saúde mental no trabalho. Hoje apoia mais de 200.000 colaboradores em Portugal e internacionalmente." },
            { question: "Qual é a missão da TEAM 24?", answer: "A missão da TEAM 24 é tornar o apoio à saúde mental acessível a todos os colaboradores, independentemente da empresa ou setor. Acreditamos que o bem-estar no trabalho é um direito, não um privilégio." },
            { question: "Em que países opera a TEAM 24?", answer: "A TEAM 24 opera em Portugal, Espanha e Brasil, com expansão para outros países de língua portuguesa e Europa. Os serviços estão disponíveis em português e inglês." },
            { question: "Quantos colaboradores apoia a TEAM 24?", answer: "A TEAM 24 apoia mais de 200.000 colaboradores em centenas de empresas, desde PMEs a grandes multinacionais em Portugal e no estrangeiro." },
          ]),
        ]}
      />
      <Navbar />

      {/* ── Header ── */}
      <div style={{ backgroundColor: "#0A1A2A", paddingTop: "5rem", paddingBottom: "3rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ display: "inline-block", width: "2rem", height: "2px", backgroundColor: "#DB5C34" }} />
            Quem Somos
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "3rem", alignItems: "end" }}>
            <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(3rem, 6vw, 6rem)", lineHeight: 1.0, letterSpacing: "-0.03em", color: "white", margin: 0 }}>
              Uma missão.<br />
              <em style={{ color: "#DB5C34" }}>Mudar</em><br />
              o trabalho.
            </h1>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.65)", margin: 0, maxWidth: "45ch" }}>
              A TEAM 24 nasceu da convicção de que nenhum colaborador deve sentir-se sozinho no trabalho. Somos uma empresa portuguesa de saúde mental empresarial que combina tecnologia, psicologia e dados para transformar culturas organizacionais.
            </p>
          </div>
        </div>
      </div>

      {/* ── Mission Statement ── */}
      <div style={{ backgroundColor: "white", padding: "4rem 0", borderBottom: "1px solid #D0E2EC" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 2fr" : "1fr", gap: isDesktop ? "6rem" : "3rem", alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
                A Nossa Missão
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: 0, lineHeight: 1.1 }}>
                Porquê<br />
                <em style={{ color: "#DB5C34" }}>existimos.</em>
              </h2>
            </div>
            <div>
              <blockquote style={{ fontFamily: "'Lato', sans-serif", fontStyle: "italic", fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", lineHeight: 1.55, color: "#0A1A2A", margin: "0 0 2rem 0", borderLeft: "3px solid #DB5C34", paddingLeft: "2rem" }}>
                A Saúde Mental é um direito. O acesso a apoio psicológico deveria ser fácil, imediato e gratuito. Foi com esse foco que construímos a TEAM 24. É essa a nossa missão: levar a saúde mental ao maior número de pessoas possível!
              </blockquote>


            </div>
          </div>
        </div>
      </div>



      {/* ── Conformidade e Regulamentação ── */}
      <div style={{ backgroundColor: "white", padding: "4rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "3rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1", minWidth: "260px" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "1rem" }}>Regulamentação</div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", letterSpacing: "-0.025em", color: "#0A1A2A", marginBottom: "1rem", lineHeight: 1.2 }}>
                Entidade Regulada e Certificada
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", lineHeight: 1.75, color: "#4A6070", maxWidth: "44ch", margin: 0 }}>
                A TEAM 24 opera em total conformidade com a legislação portuguesa e europeia de saúde, garantindo qualidade e segurança nos serviços prestados.
              </p>
            </div>
            <div style={{ flex: "2", minWidth: "280px", display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr", gap: "1.25rem" }}>
              <div style={{ backgroundColor: "#EBF4FA", padding: "1.5rem", borderLeft: "3px solid #DB5C34" }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "0.5rem" }}>ERS</div>
                <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#0A1A2A", marginBottom: "0.4rem" }}>Entidade Reguladora da Saúde</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", color: "#4A6070", lineHeight: 1.6 }}>Registo n.º <strong>e161272</strong></div>
              </div>
              <div style={{ backgroundColor: "#EBF4FA", padding: "1.5rem", borderLeft: "3px solid #0A1A2A" }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A1A2A", marginBottom: "0.5rem" }}>RGPD</div>
                <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#0A1A2A", marginBottom: "0.4rem" }}>Proteção de Dados</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", color: "#4A6070", lineHeight: 1.6 }}>Conformidade com o Regulamento (UE) 2016/679</div>
              </div>
              <div style={{ backgroundColor: "#EBF4FA", padding: "1.5rem", borderLeft: "3px solid #25749F" }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#25749F", marginBottom: "0.5rem" }}>Ordem dos Psicólogos</div>
                <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#0A1A2A", marginBottom: "0.4rem" }}>Profissionais Certificados</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", color: "#4A6070", lineHeight: 1.6 }}>Ordem dos Psicólogos Portugueses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ backgroundColor: "#DB5C34", padding: "5rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "white", margin: "0 0 0.5rem 0", lineHeight: 1.1 }}>
              Quer fazer parte desta missão?
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
              Veja as vagas abertas ou agende uma demo para a sua empresa.
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/carreiras">
              <button style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#DB5C34", backgroundColor: "white", border: "none", padding: "0.85rem 2rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", transition: "opacity 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                Ver Carreiras <ArrowRight size={15} />
              </button>
            </Link>
            <Link href="/agendar">
              <button onClick={() => trackAgendarClick("about_page")} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "white", backgroundColor: "transparent", border: "2px solid rgba(255,255,255,0.6)", padding: "0.85rem 2rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", transition: "border-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "white")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)")}>
                Agendar Reunião
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
