/* ============================================================
   TEAM 24 Página de Serviços
   Layout igual à versão de referência: sem tabs, layout linear
   ============================================================ */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, breadcrumbLD } from "@/components/SEO";
import { trackAgendarClick } from "@/lib/analytics";

/* ── Dados EAP ── */
const servicosEAP = [
  {
    href: "/servicos/psicologia",
    titulo: "Apoio Psicológico",
    desc: "Acesso ilimitado a psicólogos certificados através de chat, videochamada ou telefone. Confidencial e disponível 24/7.",
    img: "/media/psicologia_0e4cf1c7_4da5b07d_71d66e27.webp",
  },
  {
    href: "/servicos/juridico",
    titulo: "Apoio Jurídico",
    desc: "Orientação legal confidencial em questões de habitação, família, fiscalidade e consumo. Advogados inscritos na Ordem dos Advogados.",
    img: "/media/juridico_7529bef3_e359229b_1384ca87.webp",
  },
  {
    href: "/servicos/social",
    titulo: "Apoio Social e Familiar",
    desc: "Suporte especializado para os desafios da vida pessoal e familiar. Avaliação psicológica e mediação.",
    img: "/media/familia_hero_32e1d0ba_5e8168cf_5f94f764.webp",
  },
  {
    href: "/servicos/financeiro",
    titulo: "Apoio Financeiro",
    desc: "Consultoria em orçamentação familiar, compra de casa, consolidação de dívida, poupança para a reforma e apoio fiscal.",
    img: "/media/financeiro_01e15531_e217f38b_10203aa7.webp",
  },
  {
    href: "/servicos/nutricao",
    titulo: "Nutrição e Bem-estar",
    desc: "Nutricionistas certificados com planos alimentares personalizados para melhorar energia, concentração e qualidade de vida.",
    img: "/media/nutricao_65f6dad8_b1cb1fdd_7ed1217f.webp",
  },
];

/* ── Formações preview (4 imagens) ── */
const formacoesPreview = [
  { titulo: "Burnout: sinais de alerta e prevenção", img: "/media/burnout_c53b9b24_2a00774c.webp" },
  { titulo: "Mindfulness na gestão do stress", img: "/media/mindfulness_03cdfddd_3a87c305.webp" },
  { titulo: "Sensibilização de líderes para a saúde mental", img: "/media/lider-saude-mental_bb7a9056_9be44b05.webp" },
  { titulo: "Primeiros Socorros Psicológicos", img: "/media/primeiros-socorros_ac03af75_1e2b0e9e.webp" },
];

const sectionLabel = (color = "#DB5C34") => ({
  fontSize: "0.78rem" as const,
  color,
  fontWeight: 700 as const,
  letterSpacing: "0.1em" as const,
  textTransform: "uppercase" as const,
  marginBottom: "0.75rem",
});

export default function Servicos() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0A1A2A", backgroundColor: "#fff" }}>
      <Navbar />
      <SEO
        title="Serviços | TEAM 24"
        description="Apoio ao colaborador, formação em saúde mental e avaliação científica do ambiente psicossocial — tudo numa única parceria."
        keywords="serviços EAP empresas, formações saúde mental, COPSOQ III Portugal, avaliação riscos psicossociais, TEAM 24"
        canonicalPath="/servicos"
        jsonLd={[
          ORGANIZATION_LD,
          breadcrumbLD([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }]),
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
          <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.5rem)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: "1.25rem" }}>
            Serviços
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, maxWidth: "560px", margin: "0 auto" }}>
            Apoio ao colaborador, formação em saúde mental e avaliação científica do ambiente psicossocial — tudo numa única parceria.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECÇÃO EAP — Cards de serviço
      ══════════════════════════════════════════ */}
      <section style={{ padding: "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={sectionLabel()}>Employee Assistance Program</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#0A1A2A", lineHeight: 1.2 }}>
              Apoio integral ao colaborador,<br />
              <em style={{ color: "#25749F" }}>disponível 24 horas por dia.</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem" }}>
            {servicosEAP.map((s) => (
              <Link key={s.href} href={s.href}>
                <div
                  style={{ cursor: "pointer", overflow: "hidden", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-4px)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
                >
                  <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
                    <img
                      src={s.img}
                      alt={s.titulo}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
                    />
                  </div>
                  <div style={{ paddingTop: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "0.6rem" }}>{s.titulo}</h3>
                    <p style={{ color: "#5A7A8A", lineHeight: 1.7, fontSize: "0.93rem", marginBottom: "1rem" }}>{s.desc}</p>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#25749F" }}>Saber mais →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          Bloco informativo EAP (2 colunas)
      ══════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#F4F8FB", padding: "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "start" }}>
          <div>
            <div style={sectionLabel()}>Employee Assistance Program</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.25rem", lineHeight: 1.2 }}>
              Melhoria do Ambiente<br />
              <em style={{ color: "#25749F" }}>de Trabalho.</em>
            </h2>
            <p style={{ color: "#5A7A8A", lineHeight: 1.85, margin: 0, fontSize: "0.95rem" }}>
              A implementação eficaz de um Programa de Assistência ao Empregado pode ter um impacto positivo significativo no ambiente de trabalho, promovendo uma cultura organizacional assente no apoio estruturado e no bem-estar integral dos colaboradores. Ao disponibilizar um conjunto integrado de recursos e serviços especializados, o EAP contribui para o aumento da satisfação no trabalho, da produtividade e da retenção de talento.
            </p>
          </div>
          <div>
            <div style={sectionLabel()}>Impacto Financeiro</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.25rem", lineHeight: 1.2 }}>
              Impacto Positivo nos Custos<br />
              <em style={{ color: "#25749F" }}>Relacionados com a Saúde.</em>
            </h2>
            <p style={{ color: "#5A7A8A", lineHeight: 1.85, margin: 0, fontSize: "0.95rem" }}>
              Para além dos benefícios diretos para os colaboradores, a implementação de um EAP pode gerar um impacto financeiro positivo na gestão dos custos associados à saúde ocupacional. Ao integrar diferentes áreas do bem-estar do colaborador, o EAP contribui para uma maior estabilidade no contexto laboral e para a redução do absentismo.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECÇÃO FORMAÇÕES — preview + CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding: "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ maxWidth: "680px", marginBottom: "3rem" }}>
            <div style={sectionLabel()}>Workshops TEAM 24</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#0A1A2A", lineHeight: 1.2, marginBottom: "1.25rem" }}>
              Catálogo de<br />
              <em style={{ color: "#25749F" }}>Formação.</em>
            </h2>
            <p style={{ color: "#5A7A8A", lineHeight: 1.8, fontSize: "0.97rem", marginBottom: "1.5rem" }}>
              Todos os workshops são <strong>online e em direto</strong>, desenhados à medida das necessidades da sua organização. Para além dos temas apresentados, personalizamos e desenhamos as formações à medida dos vossos colaboradores — para colaboradores e para líderes.
            </p>
            <Link href="/catalogo-formacao">
              <button
                style={{ backgroundColor: "transparent", color: "#25749F", border: "1.5px solid #25749F", padding: "0.75rem 1.75rem", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Ver catálogo completo →
              </button>
            </Link>
          </div>

          {/* 4 imagens preview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {formacoesPreview.map((item, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
                  <img
                    src={item.img}
                    alt={item.titulo}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <p style={{ fontSize: "0.82rem", color: "#5A7A8A", marginTop: "0.6rem", lineHeight: 1.4 }}>{item.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECÇÃO COPSOQ — preview + CTA
      ══════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#F4F8FB", padding: "5rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Badge */}
          <div style={{ display: "inline-block", backgroundColor: "rgba(37,116,159,0.1)", color: "#25749F", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "0.35rem 0.9rem", marginBottom: "1.5rem" }}>
            Validado para Portugal · maio de 2026
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "4rem", alignItems: "center" }}>
            <div>
              <div style={sectionLabel()}>Avaliação de Riscos Psicossociais</div>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", lineHeight: 1.2, marginBottom: "1.25rem" }}>
                COPSOQ III: medir o ambiente psicossocial deixou de ser{" "}
                <em style={{ color: "#DB5C34" }}>opinião.</em>
              </h2>
              <p style={{ color: "#5A7A8A", lineHeight: 1.8, fontSize: "0.97rem", marginBottom: "1.25rem" }}>
                O Questionário Psicossocial de Copenhaga é o instrumento internacional de referência para avaliar os fatores psicossociais no trabalho. A TEAM 24 aplica-o nas empresas com plataforma digital própria e devolução por psicólogos.
              </p>
              <p style={{ color: "#7BAFC8", fontSize: "0.85rem", marginBottom: "2rem" }}>
                84 perguntas · cerca de 10 minutos por colaborador · resultados comparados com valores de referência nacionais
              </p>
              <Link href="/copsoq">
                <button
                  style={{ backgroundColor: "transparent", color: "#DB5C34", border: "1.5px solid #DB5C34", padding: "0.75rem 1.75rem", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Saber mais sobre o COPSOQ →
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {[
                { num: "84", label: "perguntas (versão média)" },
                { num: "31", label: "escalas psicossociais" },
                { num: "7", label: "dimensões" },
                { num: "7.506", label: "trabalhadores na amostra de validação" },
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: "white", padding: "1.75rem 1.5rem", textAlign: "center" as const }}>
                  <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#25749F", lineHeight: 1 }}>{stat.num}</div>
                  <div style={{ fontSize: "0.82rem", color: "#5A7A8A", marginTop: "0.5rem", lineHeight: 1.4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Global ── */}
      <section style={{ backgroundColor: "#0D2B3E", padding: "5rem clamp(1.5rem, 6vw, 8rem)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Pronto para transformar o bem-estar da sua equipa?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem", lineHeight: 1.75 }}>
            Fale connosco e descubra qual a solução mais adequada para a sua organização.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" as const }}>
            <Link href="/contacto">
              <button
                style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "0.9rem 2rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                onClick={() => trackAgendarClick("servicos_cta")}
              >
                Agendar Reunião Gratuita
              </button>
            </Link>
            <Link href="/contacto">
              <button style={{ backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "0.9rem 2rem", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Falar com a Equipa
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
