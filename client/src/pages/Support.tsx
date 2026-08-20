/* ============================================================
   TEAM 24 — Página de Suporte
   Design: Editorial Clarity. Sem cards, sem sombras.
   FAQ por categorias, centro de ajuda, ticket, status sistema.
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail, CheckCircle, AlertCircle, Clock, ArrowRight, BookOpen, Video, FileText, Zap } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD, faqLD } from "@/components/SEO";

const faqCategories = [
  {
    id: "geral",
    label: "Geral",
    questions: [
      {
        q: "O que é a TEAM 24?",
        a: "A TEAM 24 é uma plataforma de saúde mental empresarial que oferece apoio psicológico, programas de mindfulness e ferramentas de gestão para diretores de RH. Disponível em app iOS e Android para todos os colaboradores da sua empresa.",
      },
      {
        q: "Quanto custa a TEAM 24 para a minha empresa?",
        a: "O custo é calculado por colaborador por mês, com um valor muito acessível que torna a TEAM 24 um benefício de empresa (perk) ao alcance de qualquer organização. Para obter uma proposta personalizada, agende uma demo gratuita com a nossa equipa comercial.",
      },
      {
        q: "Quanto tempo demora a implementação?",
        a: "A plataforma fica completamente operacional em 5 dias úteis após a assinatura do contrato. O processo inclui configuração da conta, integração com o sistema de RH e envio automático de convites a todos os colaboradores.",
      },
      {
        q: "A TEAM 24 está disponível noutros idiomas?",
        a: "Sim. A plataforma está disponível em português, inglês e espanhol. O idioma é selecionado automaticamente com base nas preferências do dispositivo do colaborador, e pode ser alterado a qualquer momento nas definições da app.",
      },
    ],
  },
  {
    id: "privacidade",
    label: "Privacidade & RGPD",
    questions: [
      {
        q: "A empresa tem acesso às minhas conversas com o psicólogo?",
        a: "Não. As sessões com psicólogos são completamente confidenciais e protegidas pelo sigilo profissional. A empresa nunca tem acesso a dados individuais. Apenas métricas agregadas e anonimizadas são partilhadas com os diretores de RH.",
      },
      {
        q: "A TEAM 24 é conforme com o RGPD?",
        a: "Sim, totalmente. A TEAM 24 cumpre todos os requisitos do Regulamento Geral de Proteção de Dados (RGPD) da União Europeia. Os dados são armazenados em servidores europeus certificados ISO 27001, com encriptação de ponta a ponta em todas as comunicações.",
      },
      {
        q: "O meu empregador sabe que usei a plataforma?",
        a: "A empresa apenas vê métricas agregadas por equipa ou departamento (ex: 'o bem-estar da equipa de vendas melhorou 12% este mês'). Nunca são partilhados dados individuais que permitam identificar quem usou o quê.",
      },
      {
        q: "Posso apagar os meus dados?",
        a: "Sim. Tem o direito de solicitar a eliminação de todos os seus dados pessoais a qualquer momento, em conformidade com o RGPD. Basta enviar um pedido para privacidade@team24.pt e os dados são eliminados em 30 dias.",
      },
    ],
  },
  {
    id: "app",
    label: "App & Tecnologia",
    questions: [
      {
        q: "Como faço o download da app?",
        a: "A app TEAM 24 está disponível na App Store (iOS) e Google Play (Android). Após o download, utilize o email corporativo para ativar a sua conta — receberá um convite da sua empresa com as instruções de acesso.",
      },
      {
        q: "A app funciona offline?",
        a: "Algumas funcionalidades estão disponíveis offline, como os exercícios de respiração e meditações guardadas. As consultas com psicólogos e os check-ins de bem-estar requerem ligação à internet.",
      },
      {
        q: "Posso usar a plataforma no computador?",
        a: "Sim. Além da app mobile, a TEAM 24 tem uma versão web acessível em qualquer browser. O dashboard de RH é exclusivamente web para uma melhor experiência de análise de dados.",
      },

    ],
  },
  {
    id: "psicologos",
    label: "Psicólogos & Consultas",
    questions: [
      {
        q: "Os psicólogos são certificados?",
        a: "Sim. Todos os psicólogos da rede TEAM 24 são certificados pela Ordem dos Psicólogos Portugueses (OPP) e têm experiência específica em contexto organizacional e saúde mental no trabalho. A rede conta com mais de 150 profissionais.",
      },
      {
        q: "Quanto tempo demora a marcar uma consulta?",
        a: "A marcação de uma consulta demora menos de 48 horas. Em situações de crise, a linha de apoio imediato garante resposta em menos de 5 minutos, todos os dias do ano, 24 horas por dia.",
      },
      {
        q: "As consultas são por videochamada?",
        a: "As consultas podem ser por videochamada, telefone ou chat assíncrono, conforme a preferência do colaborador. Cada sessão tem a duração de 50 minutos.",
      },
      {
        q: "Existe um limite de consultas?",
        a: "O número de consultas incluídas depende do plano contratado pela empresa. A maioria dos planos inclui consultas ilimitadas ou um número generoso de sessões por colaborador por ano. Consulte a nossa equipa comercial para detalhes.",
      },
    ],
  },
  {
    id: "rh",
    label: "Para Diretores de RH",
    questions: [
      {
        q: "Que dados posso ver no dashboard de RH?",
        a: "O dashboard mostra métricas de bem-estar agregadas por equipa, departamento ou empresa — índice de bem-estar, tendências de stress, taxa de utilização da plataforma, comparação com benchmarks do setor e ROI estimado. Todos os dados são anonimizados.",
      },
      {
        q: "Posso exportar os relatórios?",
        a: "Sim. Os relatórios podem ser exportados em Excel, PDF e PowerPoint. São também gerados automaticamente relatórios mensais enviados por email para os administradores da plataforma.",
      },
      {
        q: "Como adiciono ou removo colaboradores?",
        a: "A gestão de colaboradores é feita no painel de administração. Pode adicionar colaboradores individualmente ou por importação CSV. Colaboradores que saem da empresa perdem acesso automaticamente.",
      },
      {
        q: "Existe suporte dedicado para a minha empresa?",
        a: "Sim. Todas as empresas têm um Customer Success Manager dedicado que acompanha a implementação, monitoriza a adoção da plataforma e propõe estratégias para maximizar o impacto nos colaboradores.",
      },
    ],
  },
];

const systemStatus = [
  { service: "App Mobile (iOS & Android)", status: "operational" },
  { service: "Plataforma Web", status: "operational" },
  { service: "Videochamadas", status: "operational" },
  { service: "Dashboard de RH", status: "operational" },
  { service: "Notificações Push", status: "operational" },

];

const helpArticles = [
  { icon: <BookOpen size={18} />, title: "Guia de Início Rápido", desc: "Primeiros passos na plataforma TEAM 24", time: "5 min" },
  { icon: <Video size={18} />, title: "Tutorial em Vídeo", desc: "Como marcar a primeira consulta", time: "3 min" },
  { icon: <FileText size={18} />, title: "Manual do Administrador", desc: "Configuração e gestão do dashboard de RH", time: "15 min" },
  { icon: <Zap size={18} />, title: "Notificações", desc: "Como configurar alertas e notificações push", time: "5 min" },
  { icon: <BookOpen size={18} />, title: "RGPD & Privacidade", desc: "Como os dados são protegidos", time: "7 min" },
  { icon: <FileText size={18} />, title: "Perguntas Frequentes", desc: "Respostas às dúvidas mais comuns", time: "8 min" },
];

export default function Support() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeCategory, setActiveCategory] = useState("geral");
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketForm, setTicketForm] = useState({ name: "", email: "", company: "", subject: "", message: "", priority: "normal", privacy: false });
  const [ticketSent, setTicketSent] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeCategory_data = faqCategories.find((c) => c.id === activeCategory)!;

  const filteredQuestions = searchQuery.trim()
    ? faqCategories.flatMap((c) => c.questions).filter((q) => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || q.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeCategory_data.questions;

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
  };

  const statusColor = (s: string) => (s === "operational" ? "#2E9E6B" : s === "maintenance" ? "#C9A227" : "#E53E3E");
  const statusLabel = (s: string) => (s === "operational" ? "Operacional" : s === "maintenance" ? "Manutenção" : "Problema");
  const statusIcon = (s: string) => s === "operational" ? <CheckCircle size={14} /> : s === "maintenance" ? <Clock size={14} /> : <AlertCircle size={14} />;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FA" }}>
      <Navbar />

      <SEO
        title="Suporte | Centro de Ajuda TEAM 24"
        description="Centro de suporte da TEAM 24. Encontre respostas às suas dúvidas, aceda à documentação, contacte a nossa equipa ou abra um ticket de suporte."
        keywords="suporte TEAM 24, ajuda EAP, centro de apoio, FAQ TEAM 24"
        canonicalPath="/suporte"
        jsonLd={[
          ORGANIZATION_LD,
          breadcrumbLD([{ name: "Início", path: "/" }, { name: "Suporte", path: "/suporte" }]),
          faqLD([
            { question: "O que é a TEAM 24?", answer: "A TEAM 24 é uma plataforma de saúde mental empresarial que oferece apoio psicológico, check-ins de bem-estar, programas de mindfulness e ferramentas de gestão para diretores de RH. Disponível 24h em app iOS e Android." },
            { question: "A TEAM 24 está disponível 24 horas por dia?", answer: "Sim, o EAP da TEAM 24 está disponível 24 horas por dia, 7 dias por semana, 365 dias por ano. Os colaboradores podem aceder ao apoio em qualquer momento, incluindo fins de semana e feriados." },
            { question: "A empresa tem acesso às minhas conversôes com o psicólogo?", answer: "Não. As sessões com psicólogos são completamente confidenciais e protegidas pelo sigilo profissional. A empresa nunca tem acesso a dados individuais. Apenas métricas agregadas e anonimizadas são partilhadas com os diretores de RH." },
            { question: "Quanto tempo demora a implementação do EAP TEAM 24?", answer: "A plataforma fica completamente operacional em 5 dias úteis após a assinatura do contrato. O processo inclui configuração da conta, integração com o sistema de RH e envio automático de convites a todos os colaboradores." },
          ]),
        ]}
      />
      {/* ── Header ── */}
      <div style={{ backgroundColor: "#0A1A2A", paddingTop: "5rem", paddingBottom: "3rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ display: "inline-block", width: "2rem", height: "2px", backgroundColor: "#DB5C34" }} />
            Centro de Suporte
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "3rem", alignItems: "end" }}>
            <div>
              <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(3rem, 6vw, 6rem)", lineHeight: 1.0, letterSpacing: "-0.03em", color: "white", margin: "0 0 1.5rem 0" }}>
                Como podemos<br />
                <em style={{ color: "#DB5C34" }}>ajudar?</em>
              </h1>
              {/* Search */}
              <div style={{ position: "relative", maxWidth: "500px" }}>
                <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                <input
                  type="text"
                  placeholder="Pesquisar nas perguntas frequentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "white", padding: "1rem 1rem 1rem 3rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
              {[{ v: "< 2h", l: "Tempo médio de resposta" }, { v: "98%", l: "Satisfação de suporte" }, { v: "24/7", l: "Linha de crise disponível" }].map((s) => (
                <div key={s.l}>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "2rem", color: "#DB5C34", letterSpacing: "-0.03em", marginBottom: "0.35rem" }}>{s.v}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Contact ── */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #D0E2EC" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr", gap: "0" }}>
            {[
              { icon: <MessageCircle size={20} />, title: "Chat ao Vivo", desc: "Resposta em menos de 5 minutos", action: "Iniciar Chat", color: "#25749F" },
              { icon: <Mail size={20} />, title: "Email", desc: "geral@team24.pt", action: "Enviar Email", color: "#2E9E6B" },
              { icon: <Phone size={20} />, title: "Telefone", desc: "+351 220 981 284 (dias úteis 9h–18h)", action: "Ligar Agora", color: "#DB5C34" },
            ].map((c, i) => (
              <div key={c.title} style={{ padding: "2.5rem 2rem", borderRight: isDesktop && i < 2 ? "1px solid #D0E2EC" : "none", borderBottom: !isDesktop && i < 2 ? "1px solid #D0E2EC" : "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ color: c.color }}>{c.icon}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0A1A2A" }}>{c.title}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", color: "#6B8A9F", lineHeight: 1.5 }}>{c.desc}</div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ backgroundColor: "#F5F8FA", padding: "4rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
            Perguntas Frequentes
          </div>
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 3rem 0", lineHeight: 1.1 }}>
            Respostas às<br />
            <em style={{ color: "#DB5C34" }}>dúvidas mais comuns.</em>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "240px 1fr" : "1fr", gap: isDesktop ? "4rem" : "2rem", alignItems: "start" }}>
            {/* Category tabs */}
            {!searchQuery && (
              <div style={{ display: "flex", flexDirection: isDesktop ? "column" : "row", gap: "0.25rem", flexWrap: "wrap" }}>
                {faqCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setOpenQuestion(null); }}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: activeCategory === cat.id ? 700 : 500,
                      fontSize: "0.875rem",
                      color: activeCategory === cat.id ? "#DB5C34" : "#3D5A6E",
                      background: "none",
                      border: "none",
                      padding: isDesktop ? "0.75rem 0" : "0.5rem 1rem",
                      cursor: "pointer",
                      textAlign: "left",
                      borderLeft: isDesktop ? (activeCategory === cat.id ? "3px solid #DB5C34" : "3px solid transparent") : "none",
                      borderBottom: !isDesktop ? (activeCategory === cat.id ? "2px solid #DB5C34" : "2px solid transparent") : "none",
                      paddingLeft: isDesktop ? (activeCategory === cat.id ? "1rem" : "0") : undefined,
                      transition: "all 0.2s",
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Questions */}
            <div>
              {searchQuery && (
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", color: "#6B8A9F", marginBottom: "1.5rem" }}>
                  {filteredQuestions.length} resultado{filteredQuestions.length !== 1 ? "s" : ""} para "{searchQuery}"
                </div>
              )}
              {filteredQuestions.map((item, i) => (
                <div key={i} style={{ borderBottom: "1px solid #D0E2EC" }}>
                  <button
                    onClick={() => setOpenQuestion(openQuestion === i ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0", background: "none", border: "none", cursor: "pointer", gap: "1rem", textAlign: "left" }}
                  >
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#0A1A2A", lineHeight: 1.4 }}>{item.q}</span>
                    <span style={{ color: "#25749F", flexShrink: 0 }}>{openQuestion === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                  </button>
                  {openQuestion === i && (
                    <div style={{ paddingBottom: "1.5rem" }}>
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#3D5A6E", lineHeight: 1.75, margin: 0 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredQuestions.length === 0 && (
                <div style={{ padding: "3rem 0", textAlign: "center" }}>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "#6B8A9F" }}>Nenhum resultado encontrado. Tente outra pesquisa ou contacte-nos diretamente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── System Status ── */}
      <div style={{ backgroundColor: "#F5F8FA", padding: "4rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "4rem", alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
                Estado do Sistema
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 2.5rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 0.75rem 0", lineHeight: 1.1 }}>
                Todos os sistemas<br />
                <em style={{ color: "#2E9E6B" }}>operacionais.</em>
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", color: "#6B8A9F", margin: "0 0 2.5rem 0" }}>Última atualização: há 2 minutos</p>
              {systemStatus.map((s, i) => (
                <div key={s.service} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: i < systemStatus.length - 1 ? "1px solid #D0E2EC" : "none" }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "#0A1A2A" }}>{s.service}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.75rem", color: statusColor(s.status) }}>
                    {statusIcon(s.status)} {statusLabel(s.status)}
                  </span>
                </div>
              ))}
            </div>

            {/* Ticket Form */}
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
                Abrir Ticket de Suporte
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 2.5rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 2rem 0", lineHeight: 1.1 }}>
                Não encontrou<br />
                <em style={{ color: "#DB5C34" }}>a resposta?</em>
              </h2>

              {ticketSent ? (
                <div style={{ padding: "3rem 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <CheckCircle size={24} style={{ color: "#2E9E6B" }} />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0A1A2A" }}>Ticket enviado com sucesso!</span>
                  </div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#3D5A6E", lineHeight: 1.7, margin: "0 0 1.5rem 0" }}>
                    A nossa equipa de suporte irá responder ao seu pedido em menos de 2 horas úteis. Receberá uma confirmação por email com o número do seu ticket.
                  </p>
                  <button onClick={() => setTicketSent(false)} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#25749F", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                    Abrir outro ticket →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "1.25rem" }}>
                    {[
                      { label: "Nome completo", key: "name", type: "text", placeholder: "Ana Silva" },
                      { label: "Email", key: "email", type: "email", placeholder: "ana@empresa.pt" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#0A1A2A", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{f.label}</label>
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          required
                          value={ticketForm[f.key as keyof typeof ticketForm] as string}
                          onChange={(e) => setTicketForm({ ...ticketForm, [f.key]: e.target.value })}
                          style={{ width: "100%", border: "none", borderBottom: "2px solid #D0E2EC", padding: "0.75rem 0", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#0A1A2A", backgroundColor: "transparent", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                          onFocus={(e) => (e.target.style.borderBottomColor = "#25749F")}
                          onBlur={(e) => (e.target.style.borderBottomColor = "#D0E2EC")}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#0A1A2A", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Empresa</label>
                    <input
                      type="text"
                      placeholder="Nome da empresa"
                      value={ticketForm.company}
                      onChange={(e) => setTicketForm({ ...ticketForm, company: e.target.value })}
                      style={{ width: "100%", border: "none", borderBottom: "2px solid #D0E2EC", padding: "0.75rem 0", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#0A1A2A", backgroundColor: "transparent", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#25749F")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#D0E2EC")}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#0A1A2A", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Prioridade</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      style={{ width: "100%", border: "none", borderBottom: "2px solid #D0E2EC", padding: "0.75rem 0", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#0A1A2A", backgroundColor: "transparent", outline: "none", boxSizing: "border-box" }}
                    >
                      <option value="low">Baixa — Dúvida geral</option>
                      <option value="normal">Normal — Problema técnico</option>
                      <option value="high">Alta — Impacto na operação</option>
                      <option value="urgent">Urgente — Sistema em baixo</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#0A1A2A", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Descrição do problema</label>
                    <textarea
                      placeholder="Descreva o problema com o máximo de detalhe possível..."
                      required
                      rows={4}
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      style={{ width: "100%", border: "none", borderBottom: "2px solid #D0E2EC", padding: "0.75rem 0", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#0A1A2A", backgroundColor: "transparent", outline: "none", resize: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#25749F")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "#D0E2EC")}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <input type="checkbox" id="privacy-support" required checked={ticketForm.privacy} onChange={(e) => setTicketForm((prev) => ({ ...prev, privacy: e.target.checked }))} style={{ marginTop: "3px", accentColor: "#DB5C34", cursor: "pointer", width: "16px", height: "16px", flexShrink: 0 }} />
                    <label htmlFor="privacy-support" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#4A6070", lineHeight: 1.5, cursor: "pointer" }}>
                      Li e aceito os{" "}<a href="/termos" style={{ color: "#25749F", textDecoration: "underline" }}>Termos e Condições</a>{" "}e a{" "}<a href="/aviso-legal" style={{ color: "#25749F", textDecoration: "underline" }}>Política de Privacidade</a>.
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!ticketForm.privacy}
                    style={{ alignSelf: "flex-start", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "white", backgroundColor: ticketForm.privacy ? "#DB5C34" : "rgba(219,92,52,0.5)", border: "none", padding: "1rem 2.5rem", cursor: ticketForm.privacy ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", transition: "background-color 0.2s" }}
                    onMouseEnter={(e) => { if (ticketForm.privacy) e.currentTarget.style.backgroundColor = "#B84520"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ticketForm.privacy ? "#DB5C34" : "rgba(219,92,52,0.5)"; }}
                  >
                    Enviar Ticket <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ backgroundColor: "#DB5C34", padding: "5rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "white", margin: "0 0 0.5rem 0", lineHeight: 1.1 }}>
              Ainda tem dúvidas?
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
              Agende uma chamada com a nossa equipa. Respondemos a tudo em 30 minutos.
            </p>
          </div>
          <Link href="/contacto">
            <button style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#DB5C34", backgroundColor: "white", border: "none", padding: "1rem 2.5rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", transition: "opacity 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              Falar com a Equipa <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
