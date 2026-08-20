/* ============================================================
   Ebooks — Recursos gratuitos TEAM 24
   Estrutura baseada na página de Formações
   ============================================================ */

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { breadcrumbLD } from "@/components/SEO";
import ContactSection from "@/components/ContactSection";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ── Dados dos ebooks ─────────────────────────────────────────────────────────

const TEMAS = ["Todos", "Saúde Mental Corporativa", "Bem-Estar no Trabalho"];

const EBOOKS = [
  {
    id: 1,
    tema: "Saúde Mental Corporativa",
    tag: "Novo",
    tagColor: "#DB5C34",
    imagem: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop&q=80",
    titulo: "O Custo do Silêncio",
    subtitulo: "Guia para Empresas · Edição 2026",
    descricao:
      "Um guia prático para perceber os custos invisíveis da saúde mental — absentismo, presentismo e turnover — e fazer as contas, do início ao fim, com os números da sua empresa.",
    paginas: "14 páginas",
    formato: "PDF",
    accentColor: "#25749F",
    topicos: [
      "O problema que ninguém mede: 22,9% dos portugueses com perturbação psiquiátrica",
      "As três camadas de custo: absentismo, presentismo e turnover",
      "Faça a sua própria conta com os números reais da sua empresa",
      "O que muda quando se age: o que é um EAP e o que se pode esperar",
      "De benefício a decisão de gestão: argumentos financeiro, legal e de talento",
    ],
    fileUrl: "/media/ebook_custo_silencio_0ad9dad6.pdf",
  },
  {
    id: 2,
    tema: "Bem-Estar no Trabalho",
    tag: "Novo",
    tagColor: "#DB5C34",
    imagem: "/media/ebook_ferias_thumb_53d310fd.jpg",
    titulo: "Férias, Stress e Saúde Mental",
    subtitulo: "Bem-Estar no Trabalho · Edição 2026",
    descricao:
      "Porque o descanso favorece o bem-estar e o desempenho no trabalho. Com base em evidência científica, exploramos como o descanso real é um investimento estratégico nas pessoas e nas organizações.",
    paginas: "11 páginas",
    formato: "PDF",
    accentColor: "#DB5C34",
    topicos: [
      "O paradoxo do descanso: 61% dos portugueses em risco de burnout (STADA 2025)",
      "A dificuldade de desligar: 70,4% dos profissionais trabalham durante as férias",
      "O papel da liderança: como os gestores moldam a cultura de descanso",
      "Planeamento das ausências: antecipação, delegação e gestão de expectativas",
      "O regresso saudável e o papel do EAP como suporte em períodos de pressão",
    ],
    fileUrl: "/media/ebook_team24_Ferias_Stress_Saude_Mental_7bc50ee8.pdf",
  },
];

// ── Tipos ────────────────────────────────────────────────────────────────────

interface FormData {
  nome: string;
  email: string;
  telefone: string;
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function Ebooks() {
  const [temaAtivo, setTemaAtivo] = useState("Todos");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [ebookSelecionado, setEbookSelecionado] = useState<typeof EBOOKS[0] | null>(null);
  const [form, setForm] = useState<FormData>({ nome: "", email: "", telefone: "" });
  const [enviando, setEnviando] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const ebookMutation = trpc.forms.ebook.useMutation();

  const ebooksFiltrados =
    temaAtivo === "Todos"
      ? EBOOKS
      : EBOOKS.filter((e) => e.tema === temaAtivo);

  const handleAbrirModal = (ebook: typeof EBOOKS[0]) => {
    setEbookSelecionado(ebook);
    setForm({ nome: "", email: "", telefone: "" });
    setDownloadReady(false);
    document.body.style.overflow = "hidden";
  };

  const handleFecharModal = () => {
    setEbookSelecionado(null);
    setDownloadReady(false);
    document.body.style.overflow = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebookSelecionado) return;

    // Validação básica
    if (!form.nome.trim() || !form.email.trim() || !form.telefone.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Email inválido", { description: "Introduza um email profissional válido." });
      return;
    }

    setEnviando(true);
    try {
      // Registar o lead no Odoo via tRPC forms.ebook
      await ebookMutation.mutateAsync({
        name: form.nome,
        email: form.email,
        company: "",
        ebook_title: ebookSelecionado.titulo,
      });
    } catch {
      // Não bloquear o download se o registo falhar
    }

    setEnviando(false);
    setDownloadReady(true);
  };

  const handleDownload = () => {
    if (!ebookSelecionado) return;
    // Abrir o PDF numa nova aba do browser
    window.open(ebookSelecionado.fileUrl, "_blank", "noopener,noreferrer");
    handleFecharModal();
    toast.success("Ebook aberto", { description: `"${ebookSelecionado.titulo}" foi aberto numa nova aba.` });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <Navbar />

      <SEO
        title="Ebooks Gratuitos | Saúde Mental nas Empresas | TEAM 24"
        description="Descarregue gratuitamente os nossos ebooks sobre saúde mental, burnout, liderança e bem-estar nas empresas. Recursos práticos baseados em evidência científica."
        keywords="ebooks saúde mental empresas, guias burnout, recursos RH bem-estar, liderança psicológica"
        canonicalPath="/ebooks"
        jsonLd={[breadcrumbLD([{ name: "Início", path: "/" }, { name: "Ebooks", path: "/ebooks" }])]}
      />

      {/* ── Hero ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0A1A2A 0%, #0F2D4A 60%, #1A3A5C 100%)",
          padding: "8rem 0 5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-120px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", border: "1px solid rgba(219,92,52,0.1)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ maxWidth: "780px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(219,92,52,0.15)",
              border: "1px solid rgba(219,92,52,0.3)",
              borderRadius: "2px",
              padding: "0.3rem 0.8rem",
              marginBottom: "1.5rem",
            }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#DB5C34",
              }}>
                Recursos Gratuitos
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "white",
              margin: "0 0 1.5rem",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}>
              Conhecimento que{" "}
              <em style={{ color: "#DB5C34", fontStyle: "italic" }}>transforma</em>{" "}
              organizações.
            </h1>

            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              margin: "0 0 2.5rem",
              maxWidth: "600px",
            }}>
              Guias práticos, baseados em evidência científica, para líderes e profissionais de RH que querem criar ambientes de trabalho mais saudáveis e produtivos. Totalmente gratuitos.
            </p>

          </div>
        </div>
      </section>

      {/* ── Filtros por tema ── */}
      <section style={{
        backgroundColor: "#F5F8FA",
        borderBottom: "1px solid #D0E2EC",
        padding: "0",
        position: "sticky",
        top: "72px",
        zIndex: 100,
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "flex", gap: "0", overflowX: "auto" }}>
            {TEMAS.map((tema) => (
              <button
                key={tema}
                onClick={() => setTemaAtivo(tema)}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: temaAtivo === tema ? 700 : 500,
                  color: temaAtivo === tema ? "#DB5C34" : "#4A6A7A",
                  background: "transparent",
                  border: "none",
                  borderBottom: temaAtivo === tema ? "2px solid #DB5C34" : "2px solid transparent",
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s, border-color 0.15s",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => { if (temaAtivo !== tema) (e.currentTarget as HTMLButtonElement).style.color = "#25749F"; }}
                onMouseLeave={(e) => { if (temaAtivo !== tema) (e.currentTarget as HTMLButtonElement).style.color = "#4A6A7A"; }}
              >
                {tema}
                <span style={{ marginLeft: "0.4rem", fontSize: "0.7rem", color: temaAtivo === tema ? "#DB5C34" : "#9BAFBF", fontWeight: 400 }}>
                  ({tema === "Todos" ? EBOOKS.length : EBOOKS.filter(e => e.tema === tema).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Listagem de ebooks ── */}
      <section style={{ padding: "4rem 0", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: "#0A1A2A", margin: 0, letterSpacing: "-0.02em" }}>
                {temaAtivo === "Todos" ? "Todos os Ebooks" : `Ebooks — ${temaAtivo}`}
              </h2>
            </div>

          </div>

          {/* Grid de cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
            {ebooksFiltrados.map((eb) => (
              <div
                key={eb.id}
                onMouseEnter={() => setHoveredId(eb.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: "white",
                  border: `1px solid ${hoveredId === eb.id ? eb.accentColor : "#D0E2EC"}`,
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                  transform: hoveredId === eb.id ? "translateY(-3px)" : "none",
                  boxShadow: hoveredId === eb.id ? "0 8px 32px rgba(10,26,42,0.08)" : "none",
                  overflow: "hidden",
                }}
              >
                {/* Imagem */}
                <div style={{ position: "relative", overflow: "hidden", height: "200px", flexShrink: 0 }}>
                  <img
                    src={eb.imagem}
                    alt={eb.titulo}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.4s ease",
                      transform: hoveredId === eb.id ? "scale(1.04)" : "scale(1)",
                    }}
                  />
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: eb.accentColor }} />
                  {/* Ícone PDF */}
                  <div style={{
                    position: "absolute",
                    bottom: "0.75rem",
                    left: "0.75rem",
                    backgroundColor: "rgba(10,26,42,0.75)",
                    backdropFilter: "blur(4px)",
                    padding: "0.3rem 0.6rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: "white", letterSpacing: "0.05em" }}>{eb.formato} · {eb.paginas}</span>
                  </div>
                  <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.35rem" }}>
                    {eb.tag && (
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "white", backgroundColor: eb.tagColor, padding: "0.2rem 0.55rem" }}>
                        {eb.tag}
                      </span>
                    )}
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: "white", backgroundColor: "rgba(10,26,42,0.65)", padding: "0.2rem 0.55rem", backdropFilter: "blur(4px)", letterSpacing: "0.05em" }}>
                      {eb.tema}
                    </span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem", flex: 1 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#0A1A2A", margin: "0 0 0.3rem", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                      {eb.titulo}
                    </h3>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", color: eb.accentColor, margin: 0, fontWeight: 500, fontStyle: "italic" }}>
                      {eb.subtitulo}
                    </p>
                  </div>

                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "#4A6A7A", lineHeight: 1.55, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {eb.descricao}
                  </p>

                  {/* Tópicos */}
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9BAFBF", marginBottom: "0.5rem" }}>
                      O que vai encontrar
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                      {eb.topicos.map((t, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                          <span style={{ color: eb.accentColor, fontSize: "0.65rem", marginTop: "0.2rem", flexShrink: 0 }}>▸</span>
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "#3A5A6A", lineHeight: 1.45 }}>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid #D0E2EC" }}>
                    <button
                      onClick={() => handleAbrirModal(eb)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        backgroundColor: eb.accentColor,
                        color: "white",
                        border: "none",
                        padding: "0.75rem 1.25rem",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        cursor: "pointer",
                        transition: "opacity 0.15s, transform 0.1s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                      onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                      onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Descarregar Grátis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />

      {/* ── Modal de formulário ── */}
      {ebookSelecionado && (
        <div
          onClick={handleFecharModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(10,26,42,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              animation: "modalIn 0.22s cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            {/* Barra de cor accent no topo */}
            <div style={{ height: "4px", backgroundColor: ebookSelecionado.accentColor }} />

            <div style={{ padding: "2rem" }}>
              {/* Fechar */}
              <button
                onClick={handleFecharModal}
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6B8A9F",
                  padding: "0.25rem",
                  lineHeight: 1,
                  fontSize: "1.2rem",
                }}
                aria-label="Fechar"
              >
                ✕
              </button>

              {/* Cabeçalho do modal */}
              {!downloadReady ? (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      backgroundColor: `${ebookSelecionado.accentColor}18`,
                      border: `1px solid ${ebookSelecionado.accentColor}40`,
                      borderRadius: "2px",
                      padding: "0.2rem 0.6rem",
                      marginBottom: "0.75rem",
                    }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ebookSelecionado.accentColor }}>
                        Download Gratuito
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#0A1A2A", margin: "0 0 0.4rem", lineHeight: 1.25, letterSpacing: "-0.01em", paddingRight: "2rem" }}>
                      {ebookSelecionado.titulo}
                    </h2>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#6B8A9F", margin: 0, lineHeight: 1.5 }}>
                      Preencha os seus dados para aceder ao ebook gratuitamente.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Nome */}
                    <div>
                      <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#0A1A2A", marginBottom: "0.4rem", letterSpacing: "0.02em" }}>
                        Nome completo <span style={{ color: "#DB5C34" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={form.nome}
                        onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
                        placeholder="O seu nome"
                        required
                        style={{
                          width: "100%",
                          padding: "0.7rem 0.9rem",
                          border: "1px solid #D0E2EC",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.85rem",
                          color: "#0A1A2A",
                          outline: "none",
                          transition: "border-color 0.15s",
                          boxSizing: "border-box",
                          backgroundColor: "#FAFCFD",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = ebookSelecionado.accentColor; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#D0E2EC"; }}
                      />
                    </div>

                    {/* Email profissional */}
                    <div>
                      <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#0A1A2A", marginBottom: "0.4rem", letterSpacing: "0.02em" }}>
                        Email profissional <span style={{ color: "#DB5C34" }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="nome@empresa.pt"
                        required
                        style={{
                          width: "100%",
                          padding: "0.7rem 0.9rem",
                          border: "1px solid #D0E2EC",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.85rem",
                          color: "#0A1A2A",
                          outline: "none",
                          transition: "border-color 0.15s",
                          boxSizing: "border-box",
                          backgroundColor: "#FAFCFD",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = ebookSelecionado.accentColor; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#D0E2EC"; }}
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: "#0A1A2A", marginBottom: "0.4rem", letterSpacing: "0.02em" }}>
                        Telefone <span style={{ color: "#DB5C34" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.telefone}
                        onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))}
                        placeholder="+351 9XX XXX XXX"
                        required
                        style={{
                          width: "100%",
                          padding: "0.7rem 0.9rem",
                          border: "1px solid #D0E2EC",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.85rem",
                          color: "#0A1A2A",
                          outline: "none",
                          transition: "border-color 0.15s",
                          boxSizing: "border-box",
                          backgroundColor: "#FAFCFD",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = ebookSelecionado.accentColor; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#D0E2EC"; }}
                      />
                    </div>

                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.68rem", color: "#9BAFBF", margin: "0.25rem 0 0", lineHeight: 1.5 }}>
                      Os seus dados são tratados de forma confidencial, de acordo com a nossa{" "}
                      <a href="/privacidade" style={{ color: "#25749F", textDecoration: "underline" }}>política de privacidade</a>.
                      Não partilhamos informação com terceiros.
                    </p>

                    <button
                      type="submit"
                      disabled={enviando}
                      style={{
                        backgroundColor: ebookSelecionado.accentColor,
                        color: "white",
                        border: "none",
                        padding: "0.85rem 1.5rem",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        cursor: enviando ? "not-allowed" : "pointer",
                        opacity: enviando ? 0.7 : 1,
                        transition: "opacity 0.15s, transform 0.1s",
                        marginTop: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {enviando ? (
                        <>
                          <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                          A processar...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Aceder ao Ebook Grátis
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Estado de sucesso — botão de download */
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: `${ebookSelecionado.accentColor}15`,
                    border: `2px solid ${ebookSelecionado.accentColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem",
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ebookSelecionado.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#0A1A2A", margin: "0 0 0.5rem" }}>
                    Tudo pronto!
                  </h3>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#4A6A7A", margin: "0 0 1.75rem", lineHeight: 1.6 }}>
                    O seu ebook <strong>"{ebookSelecionado.titulo}"</strong> está pronto para descarregar.
                  </p>
                  <button
                    onClick={handleDownload}
                    style={{
                      width: "100%",
                      backgroundColor: ebookSelecionado.accentColor,
                      color: "white",
                      border: "none",
                      padding: "0.9rem 1.5rem",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Descarregar Ebook (PDF)
                  </button>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", color: "#9BAFBF", marginTop: "0.75rem" }}>
                    Enviámos também uma cópia para o seu email.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
