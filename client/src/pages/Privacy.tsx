/* ============================================================
   TEAM 24 — Privacy Policy Page (App TEAM 24)
   Conteúdo: PolíticadePrivacidade-APPTEAM24.pdf
   Design: Editorial Clarity — clean typography, no cards, no shadows
   ============================================================ */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const sections = [
  { id: "finalidade", title: "1. Finalidade do Tratamento" },
  { id: "dados-saude", title: "2. Dados de Saúde da Aplicação" },
  { id: "consentimento", title: "3. O Seu Consentimento" },
  { id: "categoria-dados", title: "4. Categoria de Dados" },
  { id: "conservacao", title: "5. Conservação dos Dados" },
  { id: "direitos", title: "6. Os Seus Direitos" },
  { id: "contacto", title: "7. Contacto" },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState("finalidade");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= scrollY) setActiveSection(s.id);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.95rem",
    lineHeight: 1.8,
    color: "var(--stone)",
    marginBottom: "1rem",
  };

  const h2Style: React.CSSProperties = {
    fontFamily: "'Lato', sans-serif",
    fontWeight: 700,
    fontSize: "1.75rem",
    color: "var(--ink)",
    marginBottom: "1.25rem",
    letterSpacing: "-0.02em",
  };

  const dividerBarStyle: React.CSSProperties = {
    height: "2px",
    width: "3rem",
    backgroundColor: "var(--coral)",
    marginBottom: "1.5rem",
  };

  const sectionDividerStyle: React.CSSProperties = {
    height: "1px",
    backgroundColor: "var(--pale-mid)",
    marginBottom: "3.5rem",
  };

  const liStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.9rem",
    lineHeight: 1.8,
    color: "var(--stone)",
    marginBottom: "0.25rem",
  };

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <SEO
        title="Política de Privacidade"
        description="Política de privacidade da aplicação TEAM 24. Saiba como tratamos os seus dados pessoais de forma confidencial e segura."
        canonicalPath="/aviso-legal"
        noIndex={false}
      />
      <Navbar />

      {/* Header */}
      <div style={{ backgroundColor: "var(--ink)", paddingTop: "5rem", paddingBottom: "4rem" }}>
        <div className="container">
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--coral)", marginBottom: "1.5rem" }}>
            Aplicação TEAM 24
          </div>
          <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1.05, letterSpacing: "-0.025em", color: "#fff", marginBottom: "1.5rem" }}>
            Política de Privacidade
          </h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: "60ch" }}>
            Esta Política de Privacidade explica como a TEAM 24 coleciona e utiliza a informação disponibilizada pelos nossos utilizadores quando acedem ou utilizam a nossa aplicação e quando contactam o nosso serviço de apoio.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "280px 1fr" : "1fr", gap: isDesktop ? "5rem" : "2rem", paddingTop: "4rem", paddingBottom: "4rem" }}>

          {/* Sidebar TOC */}
          {isDesktop && (
            <aside style={{ position: "sticky", top: "6rem", alignSelf: "start" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--stone)", marginBottom: "1.5rem" }}>
                Índice
              </div>
              <nav>
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "0.5rem 0",
                      paddingLeft: activeSection === s.id ? "1rem" : "0",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.85rem",
                      color: activeSection === s.id ? "var(--coral)" : "var(--stone)",
                      fontWeight: activeSection === s.id ? 600 : 400,
                      cursor: "pointer",
                      borderLeft: activeSection === s.id ? "2px solid var(--coral)" : "2px solid transparent",
                      transition: "all 0.2s ease",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>
            </aside>
          )}

          {/* Main Content */}
          <main>

            {/* Section 1 — Finalidade */}
            <section id="finalidade" style={{ marginBottom: "3.5rem" }}>
              <h2 style={h2Style}>1. Finalidade do Tratamento de Dados Pessoais</h2>
              <div style={dividerBarStyle} />
              <p style={pStyle}>
                A <strong style={{ color: "var(--ink)" }}>TEAM 24</strong>, no âmbito das atividades que desenvolve, procede ao tratamento de dados pessoais para as seguintes finalidades:
              </p>
              <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                <li style={liStyle}>Gestão do utilizador da aplicação;</li>
                <li style={liStyle}>Atendimento a pedidos de esclarecimento e reclamações, no âmbito do apoio ao cliente;</li>
                <li style={liStyle}>Cumprimento de obrigações legais perante as autoridades ou outras entidades públicas relevantes;</li>
                <li style={liStyle}>Caso tenha obtido consentimento prévio e específico do utilizador, para fins de marketing, nomeadamente: Newsletter; Envio de conteúdos como artigos, papers, brochuras; Ações promocionais.</li>
              </ul>
            </section>

            <div style={sectionDividerStyle} />

            {/* Section 2 — Dados de Saúde */}
            <section id="dados-saude" style={{ marginBottom: "3.5rem" }}>
              <h2 style={h2Style}>2. Dados de Saúde da Aplicação</h2>
              <div style={dividerBarStyle} />
              <p style={pStyle}>
                A TEAM 24 é uma empresa sediada em Portugal e neste contexto pode contactar-nos através do email <strong style={{ color: "var(--ink)" }}>geral@team24.pt</strong>. A TEAM 24 é uma empresa cujo objetivo é a promoção do bem-estar e da saúde mental, de uso gratuito pelo utilizador.
              </p>
            </section>

            <div style={sectionDividerStyle} />

            {/* Section 3 — Consentimento */}
            <section id="consentimento" style={{ marginBottom: "3.5rem" }}>
              <h2 style={h2Style}>3. O Seu Consentimento</h2>
              <div style={dividerBarStyle} />
              <p style={pStyle}>
                A aplicação precisa de processar os seus dados para funcionar. Estes dados são classificados como dados de saúde. Como a utilização da aplicação é voluntária, precisamos da sua autorização para processar esses dados.
              </p>
              <p style={pStyle}>
                Pode retirar o seu consentimento em qualquer altura removendo a sua conta.
              </p>
              <p style={pStyle}>
                Com esta autorização, consente ainda na transmissão do seu nome e e-mail à Entidade Empregadora, enquanto utilizador registado na aplicação, que procederá ao tratamento desses dados pessoais para a finalidade de gestão da aplicação, designadamente para desativar a conta no caso de deixar de ser colaborador da Entidade Empregadora.
              </p>
            </section>

            <div style={sectionDividerStyle} />

            {/* Section 4 — Categoria de Dados */}
            <section id="categoria-dados" style={{ marginBottom: "3.5rem" }}>
              <h2 style={h2Style}>4. Categoria de Dados</h2>
              <div style={dividerBarStyle} />
              <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Informação do perfil:</strong> nome, fotografia ou imagem, idade, género, definições de língua, correio eletrónico e palavra-passe.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Dados de comunicação:</strong> chat, videochamadas e chamadas de voz.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Dados de autotestes:</strong> pontuações relativas aos autotestes e autoavaliações e dados relativos ao humor.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>(Opcional) Comentários:</strong> avaliações da aplicação.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>(Opcional) Relatório de erros:</strong> versão aplicação, modelo telemóvel, versão e sistema operativo.</li>
              </ul>
            </section>

            <div style={sectionDividerStyle} />

            {/* Section 5 — Conservação */}
            <section id="conservacao" style={{ marginBottom: "3.5rem" }}>
              <h2 style={h2Style}>5. Por Quanto Tempo Guardamos os Seus Dados?</h2>
              <div style={dividerBarStyle} />
              <p style={pStyle}>
                Se remover a sua conta anonimizamos e apagamos os seus dados. Se não utilizar a conta, anonimizamos e apagamos os dados, após um ano de inatividade. De outra forma continuaremos a processar os seus dados enquanto utilizar a aplicação.
              </p>
            </section>

            <div style={sectionDividerStyle} />

            {/* Section 6 — Direitos */}
            <section id="direitos" style={{ marginBottom: "3.5rem" }}>
              <h2 style={h2Style}>6. Os Seus Direitos</h2>
              <div style={dividerBarStyle} />
              <p style={pStyle}>
                Na União Europeia os seus dados e a sua privacidade são direitos humanos fundamentais. Estes direitos incluem:
              </p>
              <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Direito ao acesso:</strong> Pode sempre pedir-nos uma cópia dos seus dados.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Direito ao esquecimento:</strong> Remova a conta no seu perfil e apagamos todos os seus dados.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Direito a correção:</strong> Se os seus dados estão errados, pode pedir para corrigirmos ou alterarmos.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Direito a restringir o processamento:</strong> Se em algum momento pensar que estamos a processar os seus dados de forma ilegal ou com a qual não concorde, pode pedir para pararmos o processamento desses dados até finalizarmos uma investigação.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Direito de retirar o consentimento:</strong> Pode retirar o seu consentimento em qualquer altura. Encontra as suas definições de consentimento no seu perfil.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Direito de objeção:</strong> Pode objetar à forma como processamos os seus dados.</li>
                <li style={liStyle}><strong style={{ color: "var(--ink)" }}>Direito de reclamar junto a um regulador:</strong> Tem o direito de submeter uma reclamação formal acerca do modo como processamos os seus dados. Envie mensagem para <strong style={{ color: "var(--ink)" }}>rgpd@team24.pt</strong>.</li>
              </ul>
            </section>

            <div style={sectionDividerStyle} />

            {/* Section 7 — Contacto */}
            <section id="contacto" style={{ marginBottom: "3.5rem" }}>
              <h2 style={h2Style}>7. Contacte-nos</h2>
              <div style={dividerBarStyle} />
              <p style={pStyle}>
                Se tiver alguma questão acerca da nossa política de privacidade contacte-nos enviando um e-mail para <strong style={{ color: "var(--ink)" }}>geral@team24.pt</strong>. Empenhamo-nos em responder prontamente a cada questão. As informações fornecidas serão usadas para responder diretamente às suas dúvidas ou comentários.
              </p>
              <p style={pStyle}>
                Em caso de dúvidas sobre o contrato ou as práticas da TEAM 24 fique à vontade para entrar em contacto connosco através do e-mail <strong style={{ color: "var(--ink)" }}>geral@team24.pt</strong>.
              </p>
              <div style={{ marginTop: "2rem", padding: "1.5rem 2rem", backgroundColor: "var(--pale)", borderLeft: "3px solid var(--coral)" }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
                  TEAM 24, S.A.
                </div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "var(--stone)", lineHeight: 1.7 }}>
                  Avenida Marechal Gomes da Costa, 1551<br />
                  4150-360 Porto<br />
                  NIF: 516 883 194<br />
                  Registo ERS: e161272<br />
                  Email: <a href="mailto:geral@team24.pt" style={{ color: "var(--coral)", textDecoration: "none" }}>geral@team24.pt</a><br />
                  Telefone: +351 220 981 284
                </div>
              </div>
            </section>

            {/* Back link */}
            <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--pale-mid)" }}>
              <Link href="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "var(--coral)", textDecoration: "none", fontWeight: 600, letterSpacing: "0.04em" }}>
                Voltar ao início
              </Link>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
