/* ============================================================
   TEAM 24 — Página Apoio Jurídico
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD, faqLD } from "@/components/SEO";
import { useIsMobile } from "@/hooks/useMobile";
import { trackAgendarClick } from "@/lib/analytics";

const CDN = "/media";

const servicos = [
  {
    titulo: "Consultas Jurídicas",
    desc: "Os colaboradores têm a possibilidade de aceder a apoio confidencial de consultoria jurídica, asseguradas por advogados especializados em diversas áreas do direito, nomeadamente direito civil e direito da família. Estas consultas têm um carácter exclusivamente informativo e orientador, permitindo aos colaboradores esclarecer dúvidas legais, obter enquadramento jurídico geral e compreender possíveis opções a considerar face a situações do foro pessoal, como questões familiares ou litígios de natureza civil.\n\nImporta salientar que este serviço não inclui a prestação de serviços de representação legal, a elaboração de peças processuais ou o acompanhamento judicial, nem abrange matérias relacionadas com direito laboral, o qual se encontra expressamente excluído do âmbito da consultoria disponibilizada.",
    img: `${CDN}/consulta_juridica_627f5f8b.jpg`,
  },
];

const vantagens = [
  {
    titulo: "Acesso fácil a orientação legal",
    desc: "O apoio jurídico oferecido pelo EAP proporciona aos colaboradores acesso rápido e fácil a orientação legal de qualidade, sem que tenham de enfrentar barreiras financeiras ou burocráticas para obter assistência jurídica.",
  },
  {
    titulo: "Redução do stress e da ansiedade",
    desc: "Lidar com questões legais pode ser uma fonte significativa de stress e ansiedade para os colaboradores. Ao oferecer suporte jurídico, o EAP ajuda os colaboradores a lidarem com essas questões de forma mais eficaz, reduzindo assim o impacto negativo no seu bem-estar emocional.",
  },
  {
    titulo: "Empoderamento dos colaboradores",
    desc: "Ao ter acesso a informações e orientações legais, os colaboradores sentem-se mais capacitados para tomar decisões informadas em relação a questões legais que possam enfrentar, o que pode aumentar a sua confiança e autoestima.",
  },
  {
    titulo: "Resolução mais rápida de problemas",
    desc: "O apoio jurídico prestado pelo EAP pode ajudar os colaboradores a resolverem questões legais de forma mais rápida e eficiente, o que evita prolongar o stress e a incerteza associados a processos legais prolongados.",
  },
];

// 10 exemplos — 5+5 (pares perfeitos em 2 colunas)
const exemplos = [
  "Direito de família",
  "Sinistros",
  "Direito do Consumidor",
  "Direito Civil",
];

export default function ServicoJuridico() {
  const isMobile = useIsMobile();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0A1A2A", backgroundColor: "#fff" }}>
      <Navbar />
      <SEO
        title="Apoio Jurídico para Colaboradores | TEAM 24"
        description="Consultoria jurídica confidencial para colaboradores: direito laboral, família, habitação e consumo. Advogados disponíveis 24h através da plataforma EAP da TEAM 24."
        keywords="apoio jurídico empresas, consultoria jurídica colaboradores, EAP jurídico Portugal"
        canonicalPath="/servicos/juridico"
        jsonLd={[serviceLD({ name: "Apoio Jurídico", description: "Consultoria jurídica confidencial para colaboradores, disponível 24h.", url: "/servicos/juridico" }), breadcrumbLD([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }, { name: "Apoio Jurídico", path: "/servicos/juridico" }]), faqLD([{ question: "O que inclui o apoio jurídico do EAP TEAM 24?", answer: "O apoio jurídico do EAP TEAM 24 inclui aconselhamento em direito laboral, direito da família, habitação, consumo e questões fiscais. Os colaboradores têm acesso a advogados especializados disponíveis 24 horas por dia." }, { question: "O apoio jurídico do EAP é confidencial?", answer: "Sim, todas as consultas jurídicas são 100% confidenciais. A empresa contratante nunca tem acesso ao conteúdo das consultas dos colaboradores." }, { question: "Posso usar o apoio jurídico para questões pessoais?", answer: "Sim, o apoio jurídico do EAP TEAM 24 cobre tanto questões profissionais como pessoais, incluindo direito da família, habitação, consumo e outras áreas do quotidiano." }, { question: "Como acedo ao apoio jurídico do EAP?", answer: "O acesso é feito através da app TEAM 24 ou por telefone, disponível 24h por dia, sem necessidade de marcação prévia ou autorização da empresa." }])]}
      />

      {/* ── Hero ── */}
      <section
        style={{
          backgroundImage: "linear-gradient(to right, rgba(13,43,62,0.95) 45%, rgba(13,43,62,0.6) 100%), url('/media/juridico_7529bef3_e359229b_1384ca87.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center right",
          paddingTop: isMobile ? "120px" : "140px",
          paddingBottom: isMobile ? "60px" : "80px",
          paddingLeft: "clamp(1.5rem, 6vw, 8rem)",
          paddingRight: "clamp(1.5rem, 6vw, 8rem)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "4rem", alignItems: "center" }}>
          <div>
            <Link href="/servicos">
              <span style={{ fontSize: "0.85rem", color: "#7BAFC8", cursor: "pointer", display: "inline-block", marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
                ← Serviços
              </span>
            </Link>
            <div style={{ display: "inline-block", backgroundColor: "rgba(219,92,52,0.15)", color: "#DB5C34", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.4rem 1rem", marginBottom: "1.5rem" }}>
              Apoio Jurídico Especializado
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: "1.25rem" }}>
              Orientação legal para os seus colaboradores
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: "480px" }}>
              O apoio jurídico oferecido pelo EAP é um serviço valioso que proporciona aos colaboradores acesso a orientação e consultoria legal numa variedade de questões, contribuindo para o seu bem-estar e tranquilidade no local de trabalho.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/agendar">
                <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "0.85rem 2rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => trackAgendarClick("servico_juridico")}>
                  Agendar Reuniãonstração
                </button>
              </Link>
              <Link href="/contacto">
                <button style={{ backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "0.85rem 2rem", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Fale Connosco
                </button>
              </Link>
            </div>
          </div>
          <div />
        </div>
      </section>

      {/* ── Serviços Prestados (2 colunas: texto + foto, alternando lado) ── */}
      <section style={{ padding: isMobile ? "3rem 1.5rem" : "6rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Serviços EAP TEAM 24</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A" }}>Serviços que podem ser prestados</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
            {servicos.map((s, i) => (
              <div key={s.titulo} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "4rem", alignItems: "center", direction: i % 2 === 1 ? "rtl" : "ltr" }}>
                <div style={{ direction: "ltr" }}>
                  <div style={{ display: "inline-block", backgroundColor: i % 2 === 0 ? "#EBF4FA" : "#FDF0EB", color: i % 2 === 0 ? "#25749F" : "#DB5C34", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.35rem 0.9rem", marginBottom: "1.25rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "1rem", lineHeight: 1.3 }}>{s.titulo}</h3>
                  <p style={{ color: "#5A7A8A", fontSize: "0.95rem", lineHeight: 1.8 }}>{s.desc}</p>
                </div>
                <div style={{ direction: "ltr", overflow: "hidden" }}>
                  <img
                    src={s.img}
                    alt={s.titulo}
                    style={{ width: "100%", height: "320px", objectFit: "cover", display: "block" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── Exemplos (5+5 = 2 colunas pares) ── */}
      <section style={{ padding: isMobile ? "3rem 1.5rem" : "6rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Exemplos</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A" }}>Exemplos de tipo de aconselhamento</h2>
          </div>
          {/* 5+5 = 2 colunas de 5 itens cada */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {exemplos.map((e, i) => (
              <div key={e} style={{ backgroundColor: "#F4F8FB", padding: "1.25rem 1.5rem", borderLeft: `3px solid ${i % 2 === 0 ? "#25749F" : "#DB5C34"}` }}>
                <span style={{ fontSize: "0.9rem", color: "#0A1A2A", fontWeight: 500 }}>{e}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#0D2B3E", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Ofereça apoio legal à sua equipa
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Ajude os seus colaboradores a resolver questões legais que afetam o seu bem-estar e produtividade.
          </p>
          <Link href="/contacto">
            <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "1rem 2.5rem", fontWeight: 600, fontSize: "1rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Fale Connosco
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
