/* ============================================================
   TEAM 24 — Home Page
   Design: "Editorial Clarity" — tipografia massiva, sem cards, sem sombras
   Sections: 1-FullscreenVideo → 2-LogoBar → 3-StatsSection → 4-FeaturesSection → 5-CTA ROI → 6-NewsSection → 7-TestimonialsSection → 8-CTA Carreiras → Footer
   ============================================================ */

import FullscreenVideo from "@/components/FullscreenVideo";
import Navbar from "@/components/Navbar";
import LogoBar from "@/components/LogoBar";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsSection from "@/components/NewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { trackAgendarClick } from "@/lib/analytics";
import SEO, { ORGANIZATION_LD, WEBSITE_LD, faqLD } from "@/components/SEO";

const HOME_FAQ = faqLD([
  { question: "O que é um EAP (Employee Assistance Program)?", answer: "Um EAP é um programa de apoio ao colaborador que oferece serviços confidenciais de saúde mental, apoio jurídico, financeiro, nutricional e social. O TEAM 24 é a plataforma EAP líder em Portugal, disponível 24h por dia." },
  { question: "Quanto custa o EAP TEAM 24?", answer: "O EAP TEAM 24 está disponível a partir de €4 por colaborador por mês, com acesso ilimitado a todos os serviços incluídos na plataforma." },
  { question: "O apoio psicológico do TEAM 24 é confidencial?", answer: "Sim. Todo o apoio prestado pelo TEAM 24 é 100% confidencial. A empresa nunca tem acesso aos dados individuais dos colaboradores." },
  { question: "Quais os serviços incluídos no EAP TEAM 24?", answer: "O TEAM 24 inclui apoio psicológico 24/7, apoio jurídico, apoio financeiro, nutrição e bem-estar, apoio social e familiar, e serviços de work-life balance." },
  { question: "O TEAM 24 opera em Portugal?", answer: "Sim. O TEAM 24 é uma plataforma EAP portuguesa, com foco no mercado nacional e suporte em língua portuguesa." },
]);

export default function Home() {
  return (
    <div className="min-h-screen">
      <SEO
        canonicalPath="/"
        jsonLd={[ORGANIZATION_LD, WEBSITE_LD, HOME_FAQ]}
      />
      {/* Fullscreen cinematic video — first thing visible, no navbar overlay */}
      <FullscreenVideo />

      {/* Logo bar — imediatamente após o hero, primeiro scroll */}
      <LogoBar />

      {/* Rest of the page below the fold */}
      <div id="hero-content">
        <Navbar />
        <StatsSection />
        <FeaturesSection />
        {/* ── CTA Calculadora ROI ───────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#0A1A2A", padding: "5rem 0" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2.5rem" }}>
            <div style={{ maxWidth: "55ch" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "0.75rem" }}>
                Ferramenta gratuita
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "white", margin: "0 0 1rem 0", lineHeight: 1.1 }}>
                Quanto está a custar o absentismo
                <span style={{ color: "#DB5C34" }}> à sua empresa?</span>
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.7 }}>
                Calcule em 30 segundos o custo real do stresse, absentismo e presentismo e descubra o ROI de implementar um EAP. Baseado em dados EAPA e na metodologia WPAI.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
                {[
                  { value: "€3–10", label: "ROI por €1 investido" },
                  { value: "35%", label: "redução de absentismo" },
                  { value: "30 seg", label: "para calcular" },
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 800, color: "#DB5C34", lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <a
                href="/roi"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#0A1A2A", backgroundColor: "white", border: "none", padding: "0.9rem 2.25rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", textDecoration: "none", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
              >
                Calcular o meu ROI
              </a>
            </div>
          </div>
        </div>
        <NewsSection />
        <TestimonialsSection />
        {/* ── CTA Carreiras ────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#DB5C34", padding: "5rem 0" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
            <div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "white", margin: "0 0 0.5rem 0", lineHeight: 1.1 }}>
                Quer fazer parte desta missão?
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                Veja as vagas abertas e junta-te à equipa TEAM 24.
              </p>
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a
                href="/carreiras"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#DB5C34", backgroundColor: "white", border: "none", padding: "0.85rem 2rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", textDecoration: "none", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
              >
                Ver Carreiras
              </a>
              <a
                href="/agendar"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "white", backgroundColor: "transparent", border: "2px solid rgba(255,255,255,0.6)", padding: "0.85rem 2rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", textDecoration: "none", transition: "border-color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "white"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.6)"; }}
                onClick={() => trackAgendarClick("home_page")}
              >
                Agendar Reunião
              </a>
            </div>
          </div>
        </div>

        <ContactSection />

        <Footer />
      </div>
    </div>
  );
}
