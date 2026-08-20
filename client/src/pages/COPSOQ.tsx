/* ============================================================
   TEAM 24 — Página COPSOQ III
   URL: /copsoq
   Conteúdo: apenas o que estava no Servicos.tsx (tab Avaliação)
   ============================================================ */
import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, breadcrumbLD, faqLD } from "@/components/SEO";
import { trackAgendarClick } from "@/lib/analytics";

const dimensoesCopsoq = [
  { titulo: "Exigências no trabalho", desc: "Carga quantitativa, ritmo, exigências cognitivas e emocionais." },
  { titulo: "Organização e conteúdo", desc: "Influência, desenvolvimento de competências, controlo sobre o tempo, significado do trabalho." },
  { titulo: "Relações e liderança", desc: "Previsibilidade, reconhecimento, clareza e conflito de papel, qualidade da liderança, apoio social, sentido de comunidade." },
  { titulo: "Capital social", desc: "Confiança horizontal e vertical, justiça organizacional." },
  { titulo: "Interface trabalho-indivíduo", desc: "Insegurança no emprego e nas condições, conflito trabalho-família, satisfação, compromisso." },
  { titulo: "Personalidade", desc: "Autoeficácia a confiança de cada pessoa na sua capacidade de resolver problemas." },
  { titulo: "Saúde e bem-estar", desc: "Saúde autoavaliada, sono, burnout, stress e sintomas depressivos." },
];

const faqCopsoq = [
  { q: "Quanto tempo demora o preenchimento?", a: "Cerca de 10 minutos. A versão portuguesa validada tem 84 perguntas de resposta rápida, numa escala de cinco opções, preenchidas online na plataforma TEAM 24." },
  { q: "As respostas são anónimas?", a: "São confidenciais perante a entidade empregadora: a empresa nunca acede a respostas individuais, apenas a resultados agregados, e os grupos pequenos não são reportados isoladamente." },
  { q: "O COPSOQ dá diagnósticos individuais?", a: "Não. É um instrumento de avaliação coletiva do ambiente psicossocial. Não diagnostica pessoas, não produz relatórios nominais e não serve para avaliar desempenho." },
  { q: "A minha empresa é obrigada a avaliar riscos psicossociais?", a: "A lei portuguesa (Lei n.º 102/2009) obriga o empregador a identificar e avaliar os riscos para a segurança e a saúde no trabalho e os riscos psicossociais fazem parte deles." },
  { q: "Quantos colaboradores são necessários?", a: "O COPSOQ aplica-se a organizações de qualquer dimensão. Para a leitura por equipas ou departamentos, definimos com os RH um número mínimo de respostas por grupo." },
  { q: "O que recebemos no final?", a: "Um relatório com o perfil psicossocial da organização escala a escala, a comparação com os valores de referência nacionais, a leitura por equipas, uma sessão de devolução com um psicólogo do trabalho e um plano de ação priorizado." },
];

const sectionLabel = (color = "#DB5C34") => ({
  fontSize: "0.78rem" as const,
  color,
  fontWeight: 700 as const,
  letterSpacing: "0.1em" as const,
  textTransform: "uppercase" as const,
  marginBottom: "0.75rem",
});

export default function COPSOQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0A1A2A", backgroundColor: "#fff" }}>
      <Navbar />
      <SEO
        title="COPSOQ III — Avaliação de Riscos Psicossociais | TEAM 24"
        description="O Questionário Psicossocial de Copenhaga é o instrumento internacional de referência para avaliar os fatores psicossociais no trabalho. A TEAM 24 aplica-o com plataforma digital própria e devolução por psicólogos."
        keywords="COPSOQ III Portugal, avaliação riscos psicossociais, questionário psicossocial, saúde mental trabalho, TEAM 24"
        canonicalPath="/copsoq"
        jsonLd={[
          ORGANIZATION_LD,
          breadcrumbLD([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }, { name: "COPSOQ III", path: "/copsoq" }]),
          faqLD(faqCopsoq.map((f) => ({ question: f.q, answer: f.a }))),
        ]}
      />

      {/* ── Hero ── */}
      <section
        style={{
          backgroundColor: "#0D2B3E",
          paddingTop: "140px",
          paddingBottom: "72px",
          paddingLeft: "clamp(1.5rem, 6vw, 8rem)",
          paddingRight: "clamp(1.5rem, 6vw, 8rem)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", backgroundColor: "rgba(37,116,159,0.2)", color: "#7BAFC8", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
            Validado para Portugal · maio de 2026
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: "1.25rem" }}>
            COPSOQ III: medir o ambiente psicossocial deixou de ser{" "}
            <em style={{ color: "#DB5C34" }}>opinião.</em>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, maxWidth: "560px", margin: "0 auto 2rem" }}>
            O Questionário Psicossocial de Copenhaga é o instrumento internacional de referência para avaliar os fatores psicossociais no trabalho. Em maio de 2026 foi publicada a validação da versão 3 para a população portuguesa e a TEAM 24 passa, desde já, a aplicá-lo nas empresas, com plataforma digital própria e devolução por psicólogos.
          </p>
          <p style={{ color: "rgba(123,175,200,0.9)", fontSize: "0.88rem" }}>
            84 perguntas · cerca de 10 minutos por colaborador · resultados comparados com valores de referência nacionais
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "4rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem" }}>
          {[
            { num: "84", label: "perguntas (versão média)" },
            { num: "31", label: "escalas psicossociais" },
            { num: "7", label: "dimensões" },
            { num: "7.506", label: "trabalhadores na amostra de validação" },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: "#F4F8FB", padding: "1.75rem 1.5rem", textAlign: "center" as const }}>
              <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#25749F", lineHeight: 1 }}>{stat.num}</div>
              <div style={{ fontSize: "0.82rem", color: "#5A7A8A", marginTop: "0.5rem", lineHeight: 1.4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7 Dimensões ── */}
      <section style={{ padding: "5rem clamp(1.5rem, 6vw, 8rem)", backgroundColor: "#F4F8FB" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={sectionLabel()}>Versão portuguesa validada · COPSOQ III-PT</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)", fontWeight: 700, color: "#0A1A2A" }}>
              As 7 dimensões da versão portuguesa
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {dimensoesCopsoq.map((d, i) => (
              <div key={i} style={{ backgroundColor: "white", padding: "1.5rem", borderTop: "3px solid #25749F" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "0.5rem" }}>{d.titulo}</h4>
                <p style={{ fontSize: "0.88rem", color: "#5A7A8A", lineHeight: 1.6, margin: 0 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como aplicamos ── */}
      <section style={{ padding: "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={sectionLabel()}>O Serviço TEAM 24</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)", fontWeight: 700, color: "#0A1A2A" }}>
              Como aplicamos o COPSOQ III na sua empresa
            </h2>
            <p style={{ color: "#5A7A8A", maxWidth: "560px", margin: "1rem auto 0", lineHeight: 1.75, fontSize: "0.95rem" }}>
              O questionário é o instrumento; o valor está no processo à volta dele. A TEAM 24 trata de tudo da comunicação interna ao plano de ação com psicólogos inscritos na Ordem dos Psicólogos Portugueses.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
            {[
              { num: "01", titulo: "Diagnóstico e desenho", desc: "Reunião com a equipa de RH para definir âmbito, calendário, segmentação por equipas e comunicação interna que maximize a adesão." },
              { num: "02", titulo: "Aplicação digital", desc: "Cada colaborador responde na plataforma TEAM 24 em cerca de 10 minutos por link ou código QR, no computador ou no telemóvel, de forma confidencial." },
              { num: "03", titulo: "Relatório com referência nacional", desc: "Perfil psicossocial da organização, escala a escala, comparado com os valores de referência portugueses e com leitura por equipas." },
              { num: "04", titulo: "Devolução e plano de ação", desc: "Sessão de apresentação de resultados com um psicólogo do trabalho, medidas priorizadas por impacto e, quando faz sentido, reavaliação." },
            ].map((step, i) => (
              <div key={i}>
                <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#D0E2EC", lineHeight: 1, marginBottom: "0.75rem" }}>{step.num}</div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "0.6rem" }}>{step.titulo}</h4>
                <p style={{ fontSize: "0.88rem", color: "#5A7A8A", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rigor e confiança ── */}
      <section style={{ backgroundColor: "#F4F8FB", padding: "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={sectionLabel()}>Rigor e Confiança</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)", fontWeight: 700, color: "#0A1A2A" }}>
              As regras que seguimos e dizemos em voz alta
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {[
              { titulo: "Ciência aberta, serviço profissional", desc: "O COPSOQ é disponibilizado pela rede internacional como instrumento de utilização livre, e seguimos as suas diretrizes. O que contrata à TEAM 24 é a plataforma, a aplicação, a análise, os valores de referência e o acompanhamento por psicólogos." },
              { titulo: "Confidencialidade e RGPD", desc: "As respostas são confidenciais perante a entidade empregadora. A empresa recebe apenas resultados agregados; grupos pequenos não são reportados isoladamente. Os dados de saúde são tratados nos termos do artigo 9.º do RGPD." },
              { titulo: "Avaliação coletiva, não vigilância", desc: "O COPSOQ avalia condições de trabalho, não pessoas. Não produz diagnósticos individuais nem relatórios nominais. A devolução é feita por psicólogos OPP, com limites claros sobre o que os resultados dizem e não dizem." },
            ].map((item, i) => (
              <div key={i} style={{ backgroundColor: "white", padding: "2rem", borderLeft: "4px solid #25749F" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "0.75rem" }}>{item.titulo}</h4>
                <p style={{ fontSize: "0.88rem", color: "#5A7A8A", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={sectionLabel()}>Perguntas Frequentes</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)", fontWeight: 700, color: "#0A1A2A" }}>
              O que os RH nos perguntam
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "0" }}>
            {faqCopsoq.map((item, i) => (
              <div key={i} style={{ borderBottom: "1px solid #D0E2EC" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "1.25rem 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.97rem",
                    color: "#0A1A2A",
                    textAlign: "left" as const,
                    gap: "1rem",
                  }}
                >
                  {item.q}
                  <span style={{ fontSize: "1.2rem", color: "#25749F", flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p style={{ color: "#5A7A8A", lineHeight: 1.75, fontSize: "0.93rem", paddingBottom: "1.25rem", margin: 0 }}>
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#0D2B3E", padding: "5rem clamp(1.5rem, 6vw, 8rem)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Pronto para avaliar o ambiente psicossocial da sua empresa?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem", lineHeight: 1.75 }}>
            Fale connosco e saiba como aplicar o COPSOQ III na sua organização.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" as const }}>
            <Link href="/contacto">
              <button
                style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "0.9rem 2rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                onClick={() => trackAgendarClick("copsoq_cta")}
              >
                Agendar Reunião de Diagnóstico
              </button>
            </Link>
            <Link href="/servicos">
              <button style={{ backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "0.9rem 2rem", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Ver todos os Serviços
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
