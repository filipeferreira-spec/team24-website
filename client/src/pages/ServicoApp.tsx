/* ============================================================
   TEAM 24 — Página App Mobile
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { serviceLD, breadcrumbLD, faqLD } from "@/components/SEO";
import { useIsMobile } from "@/hooks/useMobile";
import { trackAgendarClick } from "@/lib/analytics";

const funcionalidades = [
  {
    titulo: "Check-ins de Bem-estar",
    desc: "Avaliações rápidas de 2 minutos que acompanham o estado emocional ao longo do tempo. O algoritmo aprende com cada resposta e personaliza as recomendações.",
    pontos: ["Avaliação diária ou semanal", "Histórico visual de evolução", "Alertas personalizados"],
  },
  {
    titulo: "Consultas com Psicólogos",
    desc: "Acesso direto à rede de psicólogos certificados por chat, videochamada ou telefone, diretamente na app.",
    pontos: ["Agendamento em 2 cliques", "Chat em tempo real", "Videochamada integrada"],
  },
  {
    titulo: "Biblioteca de Recursos",
    desc: "Mais de 500 recursos de bem-estar: meditações, exercícios de respiração, técnicas de gestão de stress e programas estruturados.",
    pontos: ["Meditações guiadas", "Exercícios de respiração", "Programas de 4-8 semanas"],
  },
  {
    titulo: "Apoio Multidisciplinar",
    desc: "Acesso a todos os serviços TEAM 24 numa única app: psicologia, apoio jurídico, social, financeiro e nutrição.",
    pontos: ["Todos os serviços integrados", "Histórico unificado", "Notificações personalizadas"],
  },
];

const stats = [
  { valor: "4.8/5", label: "Avaliação App Store" },
  { valor: "50k+", label: "Utilizadores ativos" },
  { valor: "2min", label: "Check-in diário" },
  { valor: "iOS & Android", label: "Plataformas" },
];

export default function ServicoApp() {
  const isMobile = useIsMobile();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0A1A2A", backgroundColor: "#fff" }}>
      <Navbar />
      <SEO
        title="App de Saúde Mental para Empresas | TEAM 24"
        description="A app TEAM 24 coloca o apoio psicológico, jurídico, financeiro e nutricional no bolso dos seus colaboradores. Disponível 24h, confidencial, iOS e Android. Experimente gratuitamente."
        keywords="app saúde mental empresas, app EAP Portugal, app bem-estar colaboradores, TEAM 24 app"
        canonicalPath="/app"
        jsonLd={[
          serviceLD({ name: "App TEAM 24", description: "App de saúde mental e bem-estar para colaboradores, disponível 24h.", url: "/app" }),
          breadcrumbLD([{ name: "Início", path: "/" }, { name: "App TEAM 24", path: "/app" }]),
          faqLD([
            { question: "A app TEAM 24 está disponível para iOS e Android?", answer: "Sim, a app TEAM 24 está disponível para iOS (App Store) e Android (Google Play). Pode ser descarregada gratuitamente e o acesso é feito com as credenciais fornecidas pela empresa." },
            { question: "O que posso fazer na app TEAM 24?", answer: "Na app TEAM 24 pode fazer check-ins de bem-estar, agendar consultas com psicólogos, aceder a recursos de meditação e gestão de stress, e contactar apoio jurídico, financeiro, social e nutricional — tudo num único lugar." },
            { question: "A app TEAM 24 é confidencial?", answer: "Sim, todos os dados são 100% confidenciais. A empresa contratante nunca tem acesso a dados individuais dos colaboradores. A privacidade é garantida por lei e pelos nossos protocolos de segurança." },
            { question: "Como a empresa implementa a app TEAM 24?", answer: "A implementação é simples: a empresa contrata o serviço EAP TEAM 24, os colaboradores recebem um código de acesso e podem descarregar a app imediatamente. O onboarding demora menos de 5 minutos." },
          ]),
        ]}
      />

      {/* ── Hero ── */}
      <section
        style={{
          backgroundImage: "linear-gradient(to right, rgba(13,43,62,0.95) 45%, rgba(13,43,62,0.6) 100%), url('/media/bemestar_5a5edb3b_c761bc61.webp')",
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
              App TEAM 24
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 700, color: "white", lineHeight: 1.15, marginBottom: "1.25rem" }}>
              Bem-estar no bolso dos seus colaboradores
            </h1>
            <p style={{ fontSize: isMobile ? "1rem" : "1.1rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: "480px" }}>
              A app TEAM 24 centraliza todos os serviços de bem-estar numa experiência simples e intuitiva. Disponível para iOS e Android.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/agendar">
                <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "0.85rem 2rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => trackAgendarClick("servico_app_hero")}>
                  Agendar Reuniãonstração
                </button>
              </Link>
              <Link href="/plataforma">
                <button style={{ backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "0.85rem 2rem", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Ver Plataforma
                </button>
              </Link>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {stats.map((s) => (
              <div key={s.valor} style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: isMobile ? "1rem" : "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? "1.2rem" : "1.5rem", fontWeight: 700, color: "#DB5C34" }}>{s.valor}</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginTop: "0.35rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ── */}
      <section style={{ padding: isMobile ? "3rem 1.5rem" : "6rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Tudo Integrado</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A" }}>O que encontra na app</h2>
            <p style={{ color: "#5A7A8A", marginTop: "0.75rem", maxWidth: "520px", margin: "0.75rem auto 0" }}>Uma experiência completa de bem-estar, desenhada para ser simples e eficaz no dia-a-dia.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: isMobile ? "2rem" : "2.5rem" }}>
            {funcionalidades.map((f, i) => (
              <div key={f.titulo} style={{ borderTop: `3px solid ${i % 2 === 0 ? "#25749F" : "#DB5C34"}`, paddingTop: "2rem" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "0.75rem" }}>{f.titulo}</h3>
                <p style={{ color: "#5A7A8A", lineHeight: 1.7, marginBottom: "1.25rem", fontSize: "0.95rem" }}>{f.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {f.pontos.map((p) => (
                    <li key={p} style={{ fontSize: "0.88rem", color: "#0A1A2A", paddingLeft: "1rem", borderLeft: "2px solid #D0E2EC" }}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacidade ── */}
      <section style={{ backgroundColor: "#F4F8FB", padding: isMobile ? "3rem 1.5rem" : "6rem clamp(1.5rem, 6vw, 8rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "5rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Segurança e Privacidade</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.5rem" }}>Desenhada com privacidade desde o início</h2>
            <p style={{ color: "#5A7A8A", lineHeight: 1.7, marginBottom: "1.5rem" }}>A app TEAM 24 foi construída com os mais altos padrões de segurança e conformidade com o RGPD.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {["Dados encriptados em trânsito e em repouso", "Autenticação biométrica disponível", "Sem partilha de dados com terceiros", "Conformidade total com RGPD", "Servidores na União Europeia"].map((p) => (
                <li key={p} style={{ fontSize: "0.95rem", color: "#0A1A2A", paddingLeft: "1.25rem", borderLeft: "2px solid #2E9E6B" }}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ backgroundColor: "white", padding: isMobile ? "1.5rem" : "2.5rem", borderTop: "3px solid #25749F" }}>
              <div style={{ fontSize: "0.8rem", color: "#5A7A8A", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Compatibilidade</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[{ s: "iOS", d: "iPhone & iPad" }, { s: "Android", d: "Versão 8.0+" }, { s: "Web", d: "Todos os browsers" }, { s: "Offline", d: "Recursos disponíveis" }].map((item) => (
                  <div key={item.s} style={{ backgroundColor: "#F4F8FB", padding: "1rem" }}>
                    <div style={{ fontWeight: 700, color: "#0A1A2A", fontSize: "0.95rem" }}>{item.s}</div>
                    <div style={{ fontSize: "0.82rem", color: "#5A7A8A", marginTop: "0.25rem" }}>{item.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ backgroundColor: "#0D2B3E", padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
            Veja a app em ação
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2rem" }}>Agende uma demonstração e descubra como a app TEAM 24 pode transformar o bem-estar da sua equipa.</p>
          <Link href="/agendar">
            <button style={{ backgroundColor: "#DB5C34", color: "white", border: "none", padding: "1rem 2.5rem", fontWeight: 600, fontSize: "1rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }} onClick={() => trackAgendarClick("servico_app_cta")}>
              Agendar Reuniãonstração Gratuita
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
