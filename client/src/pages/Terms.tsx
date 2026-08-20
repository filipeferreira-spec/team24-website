/* ============================================================
   TEAM 24 — Terms & Conditions Page (App TEAM 24)
   Conteúdo: Termosecondições-APPTEAM24.pdf
   Design: Editorial Clarity — clean typography, no cards, no shadows
   ============================================================ */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const sections = [
  { id: "boas-vindas", title: "1. Bem-vindo à App TEAM 24" },
  { id: "alteracoes", title: "2. Alterações nos Termos" },
  { id: "comunicacoes", title: "3. Comunicações Eletrónicas" },
  { id: "utilizacao", title: "4. Utilização da Aplicação" },
  { id: "acesso", title: "5. Acesso à Aplicação" },
  { id: "propriedade", title: "6. Propriedade Intelectual" },
  { id: "responsabilidades", title: "7. Responsabilidades do Utilizador" },
  { id: "info-aplicacao", title: "8. Utilização da Informação" },
  { id: "exoneracao", title: "9. Exoneração de Garantia" },
  { id: "cookies", title: "10. Política de Cookies" },
  { id: "lei", title: "11. Lei Aplicável" },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState("boas-vindas");
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

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <SEO
        title="Termos e Condições"
        description="Termos e condições de utilização da aplicação TEAM 24. Leia as regras de acesso e utilização da plataforma."
        canonicalPath="/termos"
        noIndex={false}
      />
      <Navbar />

      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--ink)",
          paddingTop: "5rem",
          paddingBottom: "4rem",
        }}
      >
        <div className="container">
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--coral)",
              marginBottom: "1.5rem",
            }}
          >
            Aplicação TEAM 24
          </div>
          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "#fff",
              marginBottom: "1.5rem",
            }}
          >
            Termos e Condições
          </h1>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "1rem",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              maxWidth: "60ch",
            }}
          >
            Ao aceder e utilizar esta aplicação está a aceitar os nossos termos e condições. Estes Termos e Condições abrangem todos os nossos sites, aplicações móveis e serviços fornecidos através dessas plataformas.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "280px 1fr" : "1fr",
            gap: isDesktop ? "5rem" : "2rem",
            paddingTop: "4rem",
            paddingBottom: "4rem",
          }}
        >
          {/* Sidebar TOC */}
          {isDesktop && (
            <aside style={{ position: "sticky", top: "6rem", alignSelf: "start" }}>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--stone)",
                  marginBottom: "1.5rem",
                }}
              >
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

            {/* Section 1 */}
            <section id="boas-vindas" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                1. Bem-vindo à App TEAM 24
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                A <strong style={{ color: "var(--ink)" }}>TEAM 24</strong> é uma empresa destinada à promoção da saúde mental e bem-estar das empresas e dos seus colaboradores. Ao aceder e utilizar esta aplicação está a aceitar os nossos termos e condições que apresentamos de seguida.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)" }}>
                Estes Termos e Condições abrangem todos os nossos sites, aplicações móveis, serviços fornecidos através dessas plataformas ou acedidos de outra forma por um utilizador (como os nossos serviços de aconselhamento e bem-estar) e quaisquer outras interações que o utilizador possa ter connosco (por chat, e-mail, telefone ou outra via), adiante designados por “aplicação”. Esta política abrange especificamente o tratamento de dados pessoais, incluindo, no caso de alguns dos nossos serviços, informações pessoais confidenciais.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 2 */}
            <section id="alteracoes" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                2. Alterações nos Termos e Condições
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)" }}>
                A TEAM 24 reserva-se ao direito de fazer alterações na aplicação, incluindo nos seus termos de utilização. Assim, pedimos-lhe que vá visitando os nossos termos e condições para se manter atualizado. Sujeita a estes termos e condições, a TEAM 24 concede-lhe autorização pessoal, intransmissível, limitada e revogável para aceder à aplicação para seu uso pessoal e por sua exclusiva conta e risco.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 3 */}
            <section id="comunicacoes" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                3. Comunicações Eletrónicas
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)" }}>
                Ao utilizar esta aplicação, está a dar o seu consentimento para receber comunicações eletrónicas da TEAM 24, incluindo por e-mail. Estas comunicações eletrónicas podem incluir informações de transações e outras relativamente à aplicação e às atividades ou programas da TEAM 24. Estas comunicações eletrónicas são parte integrante do seu relacionamento com a TEAM 24.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 4 */}
            <section id="utilizacao" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                4. Utilização da Aplicação
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)" }}>
                Para copiar, descarregar ou imprimir cópias dos materiais, informações, dados e outros conteúdos incluídos na app ou para qualquer outro uso do conteúdo da aplicação para uso comercial, deverá solicitar permissão previamente à TEAM 24. Não tem permissão para incorporar código fonte da aplicação (ou qualquer reutilização de código por terceiros). Nenhuma parte da aplicação pode ser reproduzida ou armazenada em nenhuma outra aplicação ou site ou incluída em qualquer sistema de recuperação eletrónica sem a permissão prévia por escrito da TEAM 24.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 5 */}
            <section id="acesso" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                5. Acesso à Aplicação
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)" }}>
                Esforçamo-nos para garantir que a aplicação esteja disponível 24 horas por dia, contudo, não seremos responsáveis se, por qualquer motivo, esta possa estar indisponível a qualquer momento ou por algum período. O acesso à aplicação pode ser suspenso temporariamente e sem aviso prévio no caso de falha, manutenção ou reparo do sistema ou por razões fora do controlo da TEAM 24.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 6 */}
            <section id="propriedade" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                6. Propriedade Intelectual
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                A TEAM 24 é única e exclusiva proprietária ou legítima possuidora de todos os direitos de propriedade intelectual desta aplicação e do material nela publicado. Estes trabalhos estão protegidos por leis e tratados sobre direitos de autor, os quais estão expressamente reservados. Pode imprimir uma cópia a partir do site, para seu uso pessoal e não comercial. Pode descarregar partes de qualquer página deste site para sua referência pessoal.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                Concorda e aceita que o material constante da aplicação não pode, de forma alguma ou por qualquer meio, ser copiado, reproduzido, distribuído ou modificado sem a prévia e expressa autorização escrita da TEAM 24. Concorda e aceita em não retirar ou modificar as referências ou identificações do autor, da marca registada ou de qualquer aviso do proprietário.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)" }}>
                Cabe à TEAM 24 gerir o design, layout e disposição de toda a informação, conteúdos e materiais na aplicação, pelo que a TEAM 24 pode, a qualquer altura e sob seu exclusivo critério, atualizar, modificar ou eliminar quaisquer conteúdos, serviços, opções ou funcionalidades, bem como modificar a sua apresentação e configuração.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 7 */}
            <section id="responsabilidades" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                7. Responsabilidades do Utilizador
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                Todos os serviços disponibilizados na aplicação apenas estão acessíveis a utilizadores registados. Deve detetar e controlar o acesso à sua conta por terceiros não autorizados. É o responsável por quaisquer prejuízos resultantes do incumprimento de manter o seu acesso totalmente confidencial.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)" }}>
                A TEAM 24 não é responsável por qualquer prejuízo relacionado com qualquer utilização desta aplicação, nomeadamente furto, roubo ou apropriação indevida de credenciais de acesso, revelação das credenciais de acesso ou a sua decisão (incumprindo estas condições) de permitir o acesso a esta aplicação por terceiros não autorizados através das suas credenciais de acesso.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 8 */}
            <section id="info-aplicacao" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                8. Utilização da Informação da Aplicação
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                Qualquer utilizador do site aceita a sua exclusiva responsabilidade por todas as atividades que desenvolva através da utilização da aplicação e pelo conteúdo integral das suas opções, declarações e informações prestadas. Estão totalmente proibidas as seguintes atividades:
              </p>
              <ul style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", lineHeight: 1.8, color: "var(--stone)", paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
                <li>Assediar, abusar, perseguir, ameaçar, difamar ou violar os direitos de qualquer outra parte (nomeadamente, direitos de publicidade ou outros direitos de propriedade);</li>
                <li>Atividades ilegais, fraudulentas ou enganosas;</li>
                <li>Usar tecnologia ou outros meios para aceder a conteúdos ou a sistemas da TEAM 24 de forma não autorizada;</li>
                <li>Usar ou acionar qualquer sistema automatizado para aceder a conteúdos ou a sistemas da TEAM 24;</li>
                <li>Tentar introduzir vírus ou qualquer outro código, ficheiro ou programa que interrompa, destrua ou limite a funcionalidade de qualquer software, hardware ou equipamento de telecomunicações;</li>
                <li>Tentar obter acesso não autorizado à rede ou às contas de utilizador da TEAM 24;</li>
                <li>Incentivar condutas que constituam um ilícito criminal ou que possam gerar responsabilidade civil;</li>
                <li>Tentar danificar, desativar, sobrecarregar ou lesar servidores ou redes da TEAM 24;</li>
                <li>Não cumprir ou não fazer cumprir as condições aplicáveis a terceiras entidades/pessoas;</li>
                <li>Qualquer tipo de comportamento que permita qualquer um dos resultados ou más condutas supramencionadas.</li>
              </ul>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)" }}>
                A TEAM 24 não é responsável por qualquer perda ou dano causados por qualquer uma destas atividades.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 9 */}
            <section id="exoneracao" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                9. Exoneração de Garantia/Responsabilidade
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                A informação presente nesta aplicação foi incluída de boa-fé e serve exclusivamente para informação geral, sendo a sua utilização de risco exclusivo do utilizador. A TEAM 24 não garante o rigor, a exatidão, a completude e a aptidão da aplicação e afirma expressamente que não é responsável por eventuais erros ou omissões.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                Tem perfeito conhecimento e concorda que está a usar esta aplicação por sua conta e risco e que a TEAM 24 não pode garantir e não garante que o seu acesso venha a ser ininterrupto, atempado, seguro ou à prova de erros ou que a aplicação esteja livre de vírus ou outros componentes danosos ou que a utilização desta aplicação corresponda às suas pretensões.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                A TEAM 24 não garante quaisquer resultados provenientes da utilização desta aplicação. Nenhuma informação, oral ou escrita, obtida por si através desta aplicação, da TEAM 24 ou de um seu parceiro poderão criar ou constituir qualquer garantia. A TEAM 24 não garante, de qualquer forma, expressa ou tácita, a segurança desta aplicação, incluindo a capacidade de terceiros não autorizados de intercetarem ou acederem a informação que lhe é transmitida através da aplicação. A TEAM 24 reserva-se ao direito de realizar alterações e correções, suspender ou encerrar a aplicação quando considerar apropriado e sem necessidade de pré-aviso.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)" }}>
                A TEAM 24 não filtra ou monitoriza previamente o conteúdo transmitido a esta aplicação por terceiros e não é responsável pela filtragem ou monitorização de nenhum conteúdo deste tipo. Tem a obrigação de reportar à TEAM 24 qualquer utilização não autorizada da sua conta, através dos contactos disponíveis na secção “Contacte-nos” da Política de Privacidade.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 10 */}
            <section id="cookies" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                10. Política de Cookies
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                A fim de garantir e proporcionar ao utilizador uma experiência única e personalizada, a TEAM 24 memoriza e armazena informações sobre como o utilizador navega na aplicação.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.8, color: "var(--ink)", marginBottom: "0.5rem" }}>O que são Cookies?</p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                Cookies são ficheiros de texto muito reduzidos que são armazenados no telemoóvel ou computador quando o utilizador visita uma aplicação ou site. A TEAM 24 utiliza os cookies para várias finalidades e para melhorar a sua experiência na aplicação. Pode alterar as suas preferências e recusar certos tipos de cookies a serem armazenados enquanto navega na aplicação. O utilizador pode igualmente remover quaisquer cookies já armazenados no seu computador ou dispositivo móvel, mas a exclusão de cookies poderá impedir a utilização de partes da aplicação.
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.8, color: "var(--ink)", marginBottom: "0.5rem" }}>Que tipo de cookies usa a TEAM 24 e porquê?</p>
              <ul style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", lineHeight: 1.8, color: "var(--stone)", paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                <li><strong style={{ color: "var(--ink)" }}>Cookies estritamente necessários:</strong> necessários para permitir que o utilizador navegue pela aplicação e use as respetivas funcionalidades.</li>
                <li><strong style={{ color: "var(--ink)" }}>Cookies de sessão:</strong> registo de informações sobre as escolhas que o utilizador faz e que permite à TEAM 24 adaptar a aplicação aos seus utilizadores; por exemplo, para memorizar o respetivo idioma ou localização.</li>
                <li><strong style={{ color: "var(--ink)" }}>Cookies primários:</strong> a TEAM 24 ou os seus fornecedores ou prestadores de serviços usam igualmente serviços analíticos para ajudar a entender a eficácia dos conteúdos da aplicação, quais são os interesses dos seus Utilizadores e para melhorar o funcionamento do Site.</li>
              </ul>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", lineHeight: 1.8, color: "var(--stone)" }}>
                Além disso, a TEAM 24 usa web beacons ou pixels de rastreamento para contabilizar o número de visitantes e cookies de desempenho para rastrear quantos Utilizadores individuais acedem ao Site e com que frequência. Essas informações são usadas apenas para fins estatísticos e não é intenção da TEAM 24 usar estas informações para identificar individualmente qualquer utilizador.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: "var(--pale-mid)", marginBottom: "3.5rem" }} />

            {/* Section 11 */}
            <section id="lei" style={{ marginBottom: "3.5rem" }}>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "var(--ink)", marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                11. Lei Aplicável
              </h2>
              <div style={{ height: "2px", width: "3rem", backgroundColor: "var(--coral)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--stone)", marginBottom: "1rem" }}>
                Se alguma disposição ou parte dos presentes Termos e Condições de Utilização não for exequível ou contrariar a lei aplicável, a validade dos restantes termos ou condições não será afetada. À gestão, administração, utilização e aplicação dos Termos e Condições de Utilização do Site é aplicável a legislação portuguesa.
              </p>
              <div style={{ marginTop: "2rem", padding: "1.5rem 2rem", backgroundColor: "var(--pale)", borderLeft: "3px solid var(--coral)" }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", marginBottom: "0.5rem" }}>TEAM 24, S.A.</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "var(--stone)", lineHeight: 1.7 }}>
                  Avenida Marechal Gomes da Costa, 1551<br />
                  4150-360 Porto<br />
                  NIF: 516 883 194<br />
                  Registo ERS: e161272<br />
                  Email: <a href="mailto:geral@team24.pt" style={{ color: "var(--coral)", textDecoration: "none" }}>geral@team24.pt</a><br />
                  Telefone: +351 220 981 284<br />
                  Website: <a href="https://www.team24.pt" style={{ color: "var(--coral)", textDecoration: "none" }}>www.team24.pt</a>
                </div>
              </div>
            </section>

            {/* Related links */}
            <div style={{ borderTop: "1px solid var(--pale-mid)", paddingTop: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              <Link href="/aviso-legal">
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "var(--coral)", fontWeight: 600, cursor: "pointer" }}>
                  Política de Privacidade →
                </span>
              </Link>
              <Link href="/suporte">
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "var(--stone)", cursor: "pointer" }}>
                  Centro de Suporte
                </span>
              </Link>
              <Link href="/contacto">
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "var(--stone)", cursor: "pointer" }}>
                  Contacto
                </span>
              </Link>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
