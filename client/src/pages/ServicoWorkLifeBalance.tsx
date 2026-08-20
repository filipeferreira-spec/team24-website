/* ============================================================
   TEAM 24 — Página Work-Life Balance
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD, faqLD } from "@/components/SEO";
import { useIsMobile } from "@/hooks/useMobile";
import { trackAgendarClick } from "@/lib/analytics";

const IMG_HERO = "/media/worklife_hero_dc4a9062_5cfe83c6_9c6a0f3a.webp";
const IMG_FAMILIA = "/media/familia_trabalho_b8769eda_88c733ba_4648d32b.webp";
const IMG_LAR = "/media/servicos_lar_3b325bf9_a33b012f_be746a1d.webp";
const IMG_IDOSOS = "/media/cuidados_idosos_8de09bf5_9c468221_2d2f24be.webp";

export default function ServicoWorkLifeBalance() {
  const isMobile = useIsMobile();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0A1A2A", backgroundColor: "#fff" }}>
      <Navbar />
      <SEO
        title="Work-Life Balance nas Empresas | TEAM 24"
        description="Programas de work-life balance para colaboradores: gestão do tempo, mindfulness e prevenção do burnout. Especialistas disponíveis 24h através do EAP da TEAM 24."
        keywords="work-life balance empresas, equilíbrio trabalho vida, mindfulness empresarial, prevenção burnout"
        canonicalPath="/servicos/work-life-balance"
        jsonLd={[
          serviceLD({ name: "Work-Life Balance", description: "Programas de equilíbrio trabalho-vida para colaboradores, disponível 24h.", url: "/servicos/work-life-balance" }),
          breadcrumbLD([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }, { name: "Work-Life Balance", path: "/servicos/work-life-balance" }]),
          faqLD([
            { question: "O que inclui o serviço de Work-Life Balance do EAP TEAM 24?", answer: "O serviço de Work-Life Balance do EAP TEAM 24 inclui apoio na gestão de responsabilidades pessoais e profissionais, serviços ao lar, apoio a crianças e idosos, marcação de viagens e assistência a expatriados." },
            { question: "Como o EAP ajuda no equilíbrio trabalho-vida?", answer: "O EAP TEAM 24 oferece uma bolsa de horas gratuitas para serviços do quotidiano, parceiros certificados para serviços ao lar, apoio a crianças e idosos, e aconselhamento para gerir melhor o tempo e reduzir o stress." },
            { question: "O serviço de Work-Life Balance é confidencial?", answer: "Sim, todos os serviços são 100% confidenciais. A empresa contratante nunca tem acesso a dados individuais dos colaboradores." },
            { question: "Como acedo ao serviço de Work-Life Balance do EAP?", answer: "O acesso é feito através da app TEAM 24 ou por telefone, disponível 24h por dia. O colaborador pode solicitar serviços ou obter apoio imediato sem autorização da empresa." },
          ]),
        ]}
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
            Work-Life <em style={{ color: "#DB5C34", fontStyle: "italic" }}>Balance.</em>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: "52ch" }}>
            O apoio ao equilíbrio entre vida profissional e pessoal é fundamental para promover o bem-estar dos colaboradores. O EAP oferece uma variedade de serviços para ajudar a gerir responsabilidades pessoais e profissionais de forma mais eficaz.
          </p>
          <Link href="/contacto">
            <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "0.9rem 2.25rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => trackAgendarClick("servico_worklife_balance")}>
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
              Pesquisa de Mercado
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.5rem", lineHeight: 1.15 }}>
              Serviços que libertam<br />
              <em style={{ color: "#25749F" }}>tempo para o que importa.</em>
            </h2>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, marginBottom: "1.25rem" }}>
              Ajudamos os colaboradores a encontrar serviços locais — limpeza doméstica, manutenção de casa, creches e muito mais — para equilibrar as suas responsabilidades pessoais e profissionais. Todos os parceiros são certificados e com garantia de oferta.
            </p>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, margin: 0 }}>
              A nossa rede de parceiros certificados garante que cada colaborador encontra o serviço certo, ao melhor preço, sem perder tempo em pesquisas e comparações.
            </p>
          </div>
          <div style={{ borderRadius: "2px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img loading="lazy" src={IMG_FAMILIA} alt="Família e equilíbrio trabalho-vida" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* ── Serviços ao Lar e Família ── */}
      <section style={{ padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "5rem", alignItems: "center" }}>
          <div style={{ borderRadius: "2px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img loading="lazy" src={IMG_LAR} alt="Serviços ao lar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ display: "inline-block", backgroundColor: "#EBF4FA", color: "#25749F", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "0.4rem 0.9rem", marginBottom: "1.5rem" }}>
              Serviços ao Lar e Família
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.75rem", lineHeight: 1.15 }}>
              Apoio completo para o dia a dia dos colaboradores.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {[
                {
                  titulo: "Serviços ao lar",
                  desc: "Reparos domésticos, assistência técnica e outros serviços para manter a casa em ordem, sem preocupações.",
                  cor: "#25749F",
                },
                {
                  titulo: "Apoio a crianças",
                  desc: "Serviços de babysitting, explicações escolares e atividades extracurriculares para os filhos dos colaboradores.",
                  cor: "#DB5C34",
                },
                {
                  titulo: "Apoio saúde animal",
                  desc: "Assistência veterinária e cuidados para os animais de estimação, garantindo o bem-estar de toda a família.",
                  cor: "#DB5C34",
                },
                {
                  titulo: "Maternidade",
                  desc: "Apoio e informações sobre cuidados de maternidade e amamentação para as colaboradoras que são mães.",
                  cor: "#25749F",
                },
              ].map((item) => (
                <div key={item.titulo} style={{ borderLeft: `3px solid ${item.cor}`, paddingLeft: "1.25rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0A1A2A", marginBottom: "0.5rem" }}>{item.titulo}</div>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "#6B8A9F", margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Serviços EAP TEAM 24 ── */}
      <section style={{ backgroundColor: "#F4F8FB", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "5rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", backgroundColor: "#FEF0EB", color: "#DB5C34", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "0.4rem 0.9rem", marginBottom: "1.5rem" }}>
              Serviços EAP TEAM 24
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.75rem", lineHeight: 1.15 }}>
              Serviços personalizados e bolsa de horas gratuitas.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {[
                {
                  titulo: "Bolsa de horas gratuitas",
                  desc: "A empresa oferece pacotes de horas gratuitas para os colaboradores usarem nos serviços disponibilizados pelo EAP, proporcionando um alívio financeiro adicional.",
                  cor: "#25749F",
                },
                {
                  titulo: "Idosos e cuidados de saúde",
                  desc: "Suporte para cuidados de saúde para idosos, incluindo acompanhamento médico e assistência domiciliar, para quem cuida de familiares dependentes.",
                  cor: "#DB5C34",
                },
                {
                  titulo: "Marcação de viagens e transportes",
                  desc: "Ajuda os colaboradores a organizar viagens e transportes, facilitando a sua mobilidade e gestão do tempo no dia a dia.",
                  cor: "#DB5C34",
                },
                {
                  titulo: "Assistência a expatriados",
                  desc: "Apoio e orientação para colaboradores deslocados do seu país, com acompanhamento aos serviços públicos e sociais para uma transição suave.",
                  cor: "#25749F",
                },
              ].map((item) => (
                <div key={item.titulo} style={{ borderLeft: `3px solid ${item.cor}`, paddingLeft: "1.25rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0A1A2A", marginBottom: "0.5rem" }}>{item.titulo}</div>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "#6B8A9F", margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderRadius: "2px", overflow: "hidden", aspectRatio: "4/3" }}>
            <img loading="lazy" src={IMG_IDOSOS} alt="Cuidados a idosos e família" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </section>

      {/* ── Vantagens ── */}
      <section style={{ padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "0.75rem" }}>
              Vantagens
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", margin: "0 auto", lineHeight: 1.1, maxWidth: "28ch" }}>
              O impacto do work-life balance na sua organização.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1.5rem" }}>
            {[
              {
                titulo: "Redução do stress e da sobrecarga",
                desc: "Ao oferecer serviços para ajudar os colaboradores a gerir as suas responsabilidades pessoais e profissionais, o EAP reduz o stress e a sobrecarga associados a equilibrar essas duas áreas da vida.",
                cor: "#25749F",
              },
              {
                titulo: "Melhoria da qualidade de vida",
                desc: "Os serviços oferecidos pelo EAP permitem que os colaboradores desfrutem de mais tempo livre e se dediquem às suas atividades pessoais, melhorando assim a sua qualidade de vida geral.",
                cor: "#DB5C34",
              },
              {
                titulo: "Aumento da satisfação no trabalho",
                desc: "Ao proporcionar suporte para o equilíbrio entre vida profissional e pessoal, o EAP contribui para uma maior satisfação no trabalho, pois os colaboradores sentem-se mais apoiados e valorizados pela empresa.",
                cor: "#DB5C34",
              },
              {
                titulo: "Aumento da produtividade e do engagement",
                desc: "Colaboradores com um melhor equilíbrio entre vida profissional e pessoal tendem a ser mais produtivos e engajados no trabalho, resultando em benefícios para a empresa como um todo.",
                cor: "#25749F",
              },
            ].map((item) => (
              <div key={item.titulo} style={{ backgroundColor: "#F4F8FB", padding: "2rem", borderTop: `3px solid ${item.cor}` }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0A1A2A", marginBottom: "0.75rem" }}>{item.titulo}</div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "#6B8A9F", margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#0D2B3E", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Proporcione equilíbrio à sua equipa.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem", lineHeight: 1.75 }}>
            O apoio ao work-life balance é essencial para promover o bem-estar e a produtividade dos colaboradores, proporcionando-lhes os recursos necessários para gerir com sucesso as suas responsabilidades pessoais e profissionais.
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
