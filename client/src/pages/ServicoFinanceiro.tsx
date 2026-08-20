/* ============================================================
   TEAM 24 — Página Apoio Financeiro
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { serviceLD, breadcrumbLD, faqLD } from "@/components/SEO";
import { useIsMobile } from "@/hooks/useMobile";
import { trackAgendarClick } from "@/lib/analytics";

const IMG_HERO = "/media/financeiro_01e15531_e217f38b_10203aa7.webp";
const IMG_CONSULTORIA = "/media/consultoria_financeira_760168b4_9b77a04b_715c8913.webp";

export default function ServicoFinanceiro() {
  const isMobile = useIsMobile();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0A1A2A", backgroundColor: "#fff" }}>
      <Navbar />
      <SEO
        title="Apoio Financeiro para Colaboradores | TEAM 24"
        description="Consultoria financeira e gestão de dívidas para colaboradores. Especialistas em finanças pessoais disponíveis 24h. Reduza o stress financeiro na sua equipa com o EAP da TEAM 24."
        keywords="apoio financeiro empresas, consultoria financeira colaboradores, gestão dívidas EAP"
        canonicalPath="/servicos/financeiro"
        jsonLd={[serviceLD({ name: "Apoio Financeiro", description: "Consultoria financeira confidencial para colaboradores, disponível 24h.", url: "/servicos/financeiro" }), breadcrumbLD([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }, { name: "Apoio Financeiro", path: "/servicos/financeiro" }]), faqLD([{ question: "O que inclui o apoio financeiro do EAP TEAM 24?", answer: "O apoio financeiro do EAP TEAM 24 inclui consultoria em gestão de dívidas, planeamento financeiro pessoal, poupança, investimento e apoio em situações de dificuldade financeira, com consultores certificados disponíveis 24h." }, { question: "O apoio financeiro é confidencial?", answer: "Sim, todas as consultas financeiras são 100% confidenciais. A empresa contratante nunca tem acesso aos dados financeiros pessoais dos colaboradores." }, { question: "Posso usar o apoio financeiro para questões pessoais?", answer: "Sim, o apoio financeiro do EAP TEAM 24 destina-se a questões financeiras pessoais dos colaboradores, como gestão do orçamento familiar, dívidas, crédito e planeamento da reforma." }, { question: "Como acedo ao apoio financeiro do EAP?", answer: "O acesso é feito através da app TEAM 24 ou por telefone, disponível 24h por dia. O colaborador pode agendar uma consulta ou obter apoio imediato sem autorização da empresa." }])]}
      />

      {/* ── Hero ── */}
      <section
        style={{
          backgroundImage: `linear-gradient(to right, rgba(13,43,62,0.92) 50%, rgba(13,43,62,0.55) 100%), url('${IMG_HERO}')`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
          paddingTop: isMobile ? "120px" : "140px",
          paddingBottom: isMobile ? "60px" : "80px",
          paddingLeft: "clamp(1.5rem, 6vw, 8rem)",
          paddingRight: "clamp(1.5rem, 6vw, 8rem)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Link href="/servicos">
            <span style={{ fontSize: "0.85rem", color: "#7BAFC8", cursor: "pointer", display: "inline-block", marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
              ← Serviços
            </span>
          </Link>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: "1.25rem", maxWidth: "16ch" }}>
            Apoio <em style={{ color: "#DB5C34", fontStyle: "italic" }}>Financeiro.</em>
          </h1>
          <p style={{ fontSize: isMobile ? "1rem" : "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: "52ch" }}>
            O EAP oferece apoio e orientação em questões financeiras e fiscais, orientado para o esclarecimento de dúvidas e para o enquadramento geral de questões relacionadas com a gestão do orçamento pessoal, contribuindo para uma gestão financeira mais apoiada e para o bem-estar global.
          </p>
          <Link href="/contacto">
            <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "0.9rem 2.25rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => trackAgendarClick("servico_financeiro")}>
              Agendar Reunião
            </button>
          </Link>
        </div>
      </section>

      {/* ── Introdução + foto ── */}
      <section style={{ backgroundColor: "#F4F8FB", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "5rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.75rem" }}>
              Apoio Financeiro EAP
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.5rem", lineHeight: 1.15 }}>
              Saúde financeira<br />
              <em style={{ color: "#25749F" }}>é saúde mental.</em>
            </h2>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, marginBottom: "1.25rem" }}>
              As preocupações financeiras constituem uma fonte relevante de stress e de impacto no bem-estar dos colaboradores. O EAP TEAM 24 democratiza o acesso à informação fiscal e financeira, disponibilizando esclarecimentos claros, sem condicionantes comerciais ou conflitos de interesse.
            </p>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, margin: 0 }}>
              Os colaboradores beneficiam de apoio personalizado de consultoria financeira, assegurando total confidencialidade e disponibilidade ajustada às suas necessidades.
            </p>
          </div>
          {!isMobile && (
            <div style={{ borderRadius: "2px", overflow: "hidden", aspectRatio: "4/3" }}>
              <img loading="lazy" src={IMG_CONSULTORIA} alt="Consultoria financeira" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>
      </section>

      {/* ── Exemplos ── */}
      <section style={{ padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.75rem" }}>
              Exemplos
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", margin: "0 auto", lineHeight: 1.1, maxWidth: "28ch" }}>
              Exemplos de apoio disponível
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1rem", maxWidth: "700px", margin: "0 auto" }}>
            {[
              "Crédito Habitação",
              "Consolidação de dívida",
              "Deduções / Benefícios Fiscais",
              "Plano Poupança Reforma",
              "Investimentos",
              "Declaração IRS / impostos",
            ].map((item) => (
              <div key={item} style={{ backgroundColor: "#F4F8FB", padding: "1.25rem 1.5rem", borderLeft: "3px solid #25749F", fontWeight: 600, fontSize: "0.95rem", color: "#0A1A2A" }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#0D2B3E", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Reduza o stress financeiro das suas equipas.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem", lineHeight: 1.75 }}>
            Oferecer um serviço integrado de apoio psicológico e EAP é uma estratégia valiosa para promover o bem-estar e alcançar benefícios concretos para a empresa.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contacto">
              <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "1rem 2.5rem", fontWeight: 600, fontSize: "1rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Fale Connosco
              </button>
            </Link>
            <Link href="/servicos">
              <button style={{ backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "1rem 2.5rem", fontWeight: 500, fontSize: "1rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Ver todos os serviços
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
