/* ============================================================
   TEAM 24 — Página Nutrição e Bem-estar
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD, faqLD } from "@/components/SEO";
import { useIsMobile } from "@/hooks/useMobile";
import { trackAgendarClick } from "@/lib/analytics";

const IMG_HERO = "/media/nutricao_65f6dad8_b1cb1fdd_7ed1217f.webp";
const IMG_CONSULTA = "/media/consulta_nutricao_3c169136_debc229c_f8df17e8.webp";
const IMG_CONSULTA2 = "/media/nutricao_consulta2_8882d096_56e3803c_18c305c5.webp";
const IMG_ALIMENTACAO = "/media/alimentacao_saudavel_9dcc2f3b_41e48413_ec3f7b82.webp";

export default function ServicoNutricao() {
  const isMobile = useIsMobile();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0A1A2A", backgroundColor: "#fff" }}>
      <Navbar />
      <SEO
        title="Nutrição e Bem-estar no Trabalho | TEAM 24"
        description="Acompanhamento nutricional personalizado para colaboradores. Nutricionistas certificados disponíveis 24h. Melhore a energia e produtividade da sua equipa com o EAP da TEAM 24."
        keywords="nutrição empresas, nutricionista colaboradores, bem-estar alimentar trabalho, EAP nutrição"
        canonicalPath="/servicos/nutricao"
        jsonLd={[serviceLD({ name: "Nutrição e Bem-estar", description: "Acompanhamento nutricional personalizado para colaboradores, disponível 24h.", url: "/servicos/nutricao" }), breadcrumbLD([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }, { name: "Nutrição", path: "/servicos/nutricao" }]), faqLD([{ question: "O que inclui o serviço de nutrição do EAP TEAM 24?", answer: "O serviço de nutrição do EAP TEAM 24 inclui consultas com nutricionistas certificados, planos alimentares personalizados, apoio na gestão do peso, alimentação saudável no trabalho e prevenção de doenças crónicas relacionadas com a alimentação." }, { question: "As consultas de nutrição são confidenciais?", answer: "Sim, todas as consultas de nutrição são 100% confidenciais. A empresa contratante nunca tem acesso a dados de saúde individuais dos colaboradores." }, { question: "Quantas consultas de nutrição posso ter?", answer: "O EAP TEAM 24 oferece consultas ilimitadas com nutricionistas, sem restrições de número de sessões, para acompanhamento continuado dos objetivos de saúde de cada colaborador." }, { question: "Como acedo ao serviço de nutrição do EAP?", answer: "O acesso é feito através da app TEAM 24 ou por telefone, disponível 24h por dia. O colaborador pode agendar consultas com nutricionistas sem necessidade de autorização da empresa." }])]}
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
            Apoio <em style={{ color: "#DB5C34", fontStyle: "italic" }}>Nutricional.</em>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: "52ch" }}>
            Oferecer apoio de nutrição como parte de um EAP é uma forma eficaz de promover a saúde e o bem-estar dos colaboradores, com orientação personalizada sobre alimentação saudável.
          </p>
          <Link href="/contacto">
            <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "0.9rem 2.25rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => trackAgendarClick("servico_nutricao")}>
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
              Apoio Nutricional EAP
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.5rem", lineHeight: 1.15 }}>
              Alimentação saudável<br />
              <em style={{ color: "#25749F" }}>para equipas produtivas.</em>
            </h2>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, marginBottom: "1.25rem" }}>
              Este serviço disponibiliza aconselhamento nutricional especializado, com orientação personalizada em alimentação saudável, planeamento alimentar e hábitos nutricionais equilibrados, ajustados às necessidades individuais de cada colaborador.
            </p>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, margin: 0 }}>
              A integração de apoio nutricional no âmbito de um Programa de Apoio ao Colaborador (EAP) constitui uma estratégia estruturada de promoção da saúde e do bem-estar contribuindo para a adoção de estilos de vida mais saudáveis.
            </p>
          </div>
          <div style={{ borderRadius: "2px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img loading="lazy" src={IMG_CONSULTA} alt="Consulta de nutrição" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>







      {/* ── Exemplos ── */}
      <section style={{ backgroundColor: "#F4F8FB", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.75rem" }}>
              Exemplos
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", lineHeight: 1.15, margin: 0 }}>
              O que inclui o apoio nutricional.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
              "Consulta Nutrição",
              "Avaliação Nutricional",
              "Conteúdos de Nutrição e Alimentação Saudável",
              "Reeducação Alimentar",
              "Plano Alimentar",
              "Acompanhamento Nutricional",
            ].map((exemplo) => (
              <div key={exemplo} style={{ backgroundColor: "white", padding: "1.75rem", borderLeft: "3px solid #25749F" }}>
                <div style={{ fontWeight: 600, fontSize: "1rem", color: "#0A1A2A" }}>{exemplo}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#0D2B3E", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Alimente o sucesso da sua equipa.
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
