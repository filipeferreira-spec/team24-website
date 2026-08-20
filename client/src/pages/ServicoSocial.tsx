/* ============================================================
   TEAM 24 — Página Apoio Social e Familiar
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD, faqLD } from "@/components/SEO";
import { useIsMobile } from "@/hooks/useMobile";
import { trackAgendarClick } from "@/lib/analytics";

const IMG_HERO = "/media/familia_hero_32e1d0ba_5e8168cf_5f94f764.webp";
const IMG_FAMILIA = "/media/familia_feliz_ac30b3ec_aa79d963_d18fbdda.webp";
const IMG_APOIO = "/media/apoio_familiar_7e8f092e_633a7bb0_16da3d9b.webp";
const IMG_CRIANCA = "/media/psicologia_crianca_0a9700f7_7ac771ee_f162f50f.webp";

export default function ServicoSocial() {
  const isMobile = useIsMobile();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0A1A2A", backgroundColor: "#fff" }}>
      <Navbar />
      <SEO
        title="Apoio Social e Familiar para Colaboradores | TEAM 24"
        description="Apoio social e familiar confidencial para colaboradores: cuidado de idosos, apoio à parentalidade e situações de crise. Assistentes sociais disponíveis 24h com o EAP da TEAM 24."
        keywords="apoio social empresas, assistente social colaboradores, apoio familiar trabalho, EAP social"
        canonicalPath="/servicos/social"
        jsonLd={[serviceLD({ name: "Apoio Social e Familiar", description: "Apoio social e familiar confidencial para colaboradores, disponível 24h.", url: "/servicos/social" }), breadcrumbLD([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }, { name: "Apoio Social", path: "/servicos/social" }]), faqLD([{ question: "O que inclui o apoio social do EAP TEAM 24?", answer: "O apoio social do EAP TEAM 24 inclui assistência em situações de crise familiar, apoio à parentalidade, cuidado de idosos e dependentes, violência doméstica, e encaminhamento para serviços sociais e de emergência." }, { question: "O apoio social é confidencial?", answer: "Sim, todas as consultas de apoio social são 100% confidenciais. A empresa contratante nunca tem acesso a informações pessoais ou familiares dos colaboradores." }, { question: "Posso usar o apoio social para questões familiares?", answer: "Sim, o apoio social do EAP TEAM 24 destina-se tanto ao colaborador como aos seus familiares diretos, cobrindo situações como conflitos familiares, cuidado de idosos, apoio à parentalidade e situações de crise." }, { question: "Como acedo ao apoio social do EAP?", answer: "O acesso é feito através da app TEAM 24 ou por telefone, disponível 24h por dia. Em situações de emergência, o serviço garante resposta imediata e encaminhamento para os recursos adequados." }])]}
      />

      {/* ── Hero ── */}
      <section
        style={{
          backgroundImage: `linear-gradient(to right, rgba(13,43,62,0.92) 50%, rgba(13,43,62,0.55) 100%), url('${IMG_HERO}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
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
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: "1.25rem", maxWidth: "18ch" }}>
            Apoio Social <em style={{ color: "#DB5C34", fontStyle: "italic" }}>e Familiar.</em>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: "52ch" }}>
            Serviço de assessoria e orientação para apoiar na gestão de responsabilidades pessoais e profissionais, de forma confidencial e anónima.
          </p>
          <Link href="/contacto">
            <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "0.9rem 2.25rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => trackAgendarClick("servico_social")}>
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
              Suporte à Família
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.5rem", lineHeight: 1.15 }}>
              Cuidar do colaborador<br />
              <em style={{ color: "#25749F" }}>é cuidar da sua família.</em>
            </h2>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, marginBottom: "1.25rem" }}>
              O apoio social disponibilizado pelo EAP assume uma vertente de consultoria e orientação, permitindo aos colaboradores obter informação e apoio na identificação de recursos e respostas sociais existentes, tais como creches, estabelecimentos de ensino, lares e estruturas residenciais para pessoas idosas, bem como outros serviços de apoio comunitário.
            </p>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, margin: 0 }}>
              Este serviço visa facilitar a tomada de decisão informada e o encaminhamento para soluções adequadas, sendo prestado de forma confidencial e ajustada às necessidades específicas de cada situação.
            </p>
          </div>
          <div style={{ borderRadius: "2px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img loading="lazy" src={IMG_FAMILIA} alt="Família feliz com apoio EAP" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
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
              "Lar de Idosos",
              "Creche / Escola",
              "Assistência a expatriados",
              "Saúde veterinária",
              "Serviços de saúde",
              "Direitos e apoios sociais",
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
            Cuide das famílias da sua equipa.
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
