/* ============================================================
   TEAM 24 — Página Apoio Psicológico
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD, faqLD } from "@/components/SEO";
import { useIsMobile } from "@/hooks/useMobile";
import { trackAgendarClick } from "@/lib/analytics";

const IMG_HERO = "/media/psicologia_0e4cf1c7_4da5b07d_71d66e27.webp";
const IMG_CONSULTA = "/media/consulta-psicologia-hq-VhJSXjbj6E9LxYeB4C3X8d_ef455ae5.webp";
const IMG_APP = "/media/app_saude_mental_078fa38b_298e1f9a_ca2e00a5.webp";

export default function ServicoPsicologia() {
  const isMobile = useIsMobile();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0A1A2A", backgroundColor: "#fff" }}>
      <Navbar />
      <SEO
        title="Apoio Psicológico nas Empresas | TEAM 24"
        description="Apoio psicológico confidencial para colaboradores. Psicólogos clínicos disponíveis 24h. Reduza o absentismo e melhore o bem-estar da sua equipa com o EAP da TEAM 24."
        keywords="apoio psicológico empresas, psicólogo empresarial, saúde mental trabalho, EAP Portugal"
        canonicalPath="/servicos/psicologia"
        jsonLd={[serviceLD({ name: "Apoio Psicológico", description: "Apoio psicológico confidencial para colaboradores, disponível 24h.", url: "/servicos/psicologia" }), breadcrumbLD([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }, { name: "Apoio Psicológico", path: "/servicos/psicologia" }]), faqLD([{ question: "O que é o apoio psicológico do EAP TEAM 24?", answer: "O apoio psicológico do EAP TEAM 24 é um serviço confidencial que disponibiliza psicólogos clínicos 24 horas por dia, 365 dias por ano, para colaboradores e seus familiares. Inclui consultas ilimitadas por chat, voz e vídeo." }, { question: "As consultas psicológicas do EAP são confidenciais?", answer: "Sim, todas as consultas são 100% confidenciais e conformes com o RGPD. A empresa contratante nunca tem acesso a dados individuais dos colaboradores." }, { question: "Quantas sessões de psicologia posso ter?", answer: "O EAP TEAM 24 oferece consultas ilimitadas, sem restrições de número de sessões, garantindo que o apoio está sempre disponível quando mais é preciso." }, { question: "Como acedo ao apoio psicológico do EAP?", answer: "O acesso é feito através da app TEAM 24, por telefone ou por videochamada, disponível 24h por dia. O colaborador contacta diretamente sem necessidade de autorização da empresa." }])]}
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
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: "1.25rem", maxWidth: "18ch" }}>
            Apoio <em style={{ color: "#DB5C34", fontStyle: "italic" }}>Psicológico.</em>
          </h1>
          <p style={{ fontSize: isMobile ? "1rem" : "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: "52ch" }}>
A TEAM 24 disponibiliza uma aplicação onde os colaboradores podem obter apoio psicológico sempre que necessitarem, com videoconsultas ilimitadas, bem como apoio por chat e voz.
          </p>
          <Link href="/contacto">
            <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "0.9rem 2.25rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => trackAgendarClick("servico_psicologia")}>
              Agendar Reunião
            </button>
          </Link>
        </div>
      </section>

      {/* ── Suporte Ilimitado + foto ── */}
      <section style={{ backgroundColor: "#F4F8FB", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "5rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.75rem" }}>
Apoio Psicológico Ilimitado
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.5rem", lineHeight: 1.15 }}>
              Apoio disponível a qualquer<br />
              <em style={{ color: "#25749F" }}>hora do dia ou da noite.</em>
            </h2>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, marginBottom: "1.25rem" }}>
A aplicação TEAM 24 oferece uma variedade de opções de comunicação, incluindo chat, voz e vídeo.
            </p>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, margin: 0 }}>
              As consultas são ilimitadas, garantindo que os colaboradores possam encontrar ajuda sempre que necessitarem, sem restrições quanto ao número de sessões. Os colaboradores podem ainda explorar conteúdos de bem-estar e literacia com o objetivo de promover e prevenir questões de saúde mental.
            </p>
          </div>
          <div style={{ borderRadius: "2px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img loading="lazy" src={IMG_CONSULTA} alt="Consulta psicológica" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* ── Vantagens ── */}
      <section style={{ backgroundColor: "#F4F8FB", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "5rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", backgroundColor: "#FEF0EB", color: "#DB5C34", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "0.4rem 0.9rem", marginBottom: "1.5rem" }}>
              Vantagens
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.75rem", lineHeight: 1.15 }}>
              Porque investir na saúde mental dos colaboradores.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5rem" }}>
              {[
                {
                  titulo: "Promoção do Bem-Estar",
                  desc: "Ao oferecer uma solução de apoio à saúde mental e bem-estar demonstra o seu compromisso com a sua equipa, criando um ambiente de trabalho mais saudável onde os colaboradores se sentem valorizados.",
                },
                {
                  titulo: "Redução do Absentismo",
                  desc: "O suporte eficaz para questões de saúde mental ajuda a reduzir o absentismo. Colaboradores que se sentem apoiados tendem a estar mais presentes no trabalho e a serem mais produtivos.",
                },
                {
                  titulo: "Melhoria do Clima Organizacional",
                  desc: "Oferecer suporte para saúde mental contribui para promover um clima organizacional de apoio, compreensão e empatia, onde os colaboradores se sentem mais valorizados e comprometidos.",
                },
                {
                  titulo: "Atração e Retenção de Talento",
                  desc: "Empresas que priorizam a saúde mental são mais atrativas para profissionais qualificados. Este suporte abrangente ajuda a atrair e reter talentos, demonstrando o compromisso com o desenvolvimento integral dos colaboradores.",
                },
              ].map((item) => (
                <div key={item.titulo} style={{ borderLeft: "3px solid #25749F", paddingLeft: "1.25rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0A1A2A", marginBottom: "0.5rem" }}>{item.titulo}</div>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "#6B8A9F", margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {!isMobile && (
            <div style={{ borderRadius: "2px", overflow: "hidden", aspectRatio: "4/3" }}>
              <img loading="lazy" src="/media/board-meeting-vantagens-o4uS9nmwoGZKpPQcmqb6uc_692a8531.webp" alt="Reunião de gestão" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#0D2B3E", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Cuide da saúde mental da sua equipa.
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
