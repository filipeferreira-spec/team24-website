/* ============================================================
   TEAM 24 — Página de Imprensa
   Design: Editorial Clarity. Sem cards, sem sombras.
   Press releases, cobertura mediática, media kit, contacto.
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */

import { useState, useEffect } from "react";
import { ArrowRight, Download, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD } from "@/components/SEO";
import { trpc } from "@/lib/trpc";





const mediaKitItems = [
  { title: "Logotipo TEAM 24", formats: "SVG, PNG (fundo branco e transparente)", size: "93 KB", url: "/media/LogotipoTEAM24_a5acac36.zip" },
  { title: "Apresentação Institucional", formats: "PDF, PPTX", size: "8.5 MB", url: "" },
];

const tagColors: Record<string, string> = {
  Financiamento: "#25749F",
  Marco: "#2E9E6B",
  Parceria: "#7B5EA7",
  Produto: "#DB5C34",
  Investigação: "#0A1A2A",
  Prémio: "#C9A227",
};

export default function Press() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [contactForm, setContactForm] = useState({ name: "", outlet: "", email: "", message: "", privacy: false });
  const [submitted, setSubmitted] = useState(false);

  const { data: dbImprensa = [] } = trpc.backoffice.imprensa.listPublic.useQuery();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Apenas dados da BD (geridos pelo backoffice)
  const allPressReleases = dbImprensa.map((item: any) => ({
    date: item.dataPublicacao ? new Date(item.dataPublicacao).toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" }) : "—",
    title: item.titulo,
    summary: item.resumo || "",
    tag: item.tipo === "comunicado" ? "Comunicado" : item.tipo === "entrevista" ? "Entrevista" : item.tipo === "mencao" ? "Menção" : "Artigo",
    link: item.url || "#",
    destaque: item.destaque,
  }));

  const tags = ["Todos", ...Array.from(new Set(allPressReleases.map((p) => p.tag)))];
  const filtered = activeFilter === "Todos" ? allPressReleases : allPressReleases.filter((p) => p.tag === activeFilter);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setSubmitted(true), 1000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.95rem",
    color: "#0A1A2A",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1.5px solid #D0E2EC",
    padding: "0.75rem 0",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#6B8A9F",
    display: "block",
    marginBottom: "0.25rem",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FA" }}>
      <Navbar />

      <SEO
        title="Imprensa | TEAM 24 na Media"
        description="Sala de imprensa da TEAM 24. Comunicados, artigos de media, kit de imprensa e contactos para jornalistas. A TEAM 24 na comunicação social portuguesa e internacional."
        keywords="imprensa TEAM 24, media saúde mental, comunicados TEAM 24, kit imprensa"
        canonicalPath="/imprensa"
        jsonLd={[ORGANIZATION_LD, breadcrumbLD([{ name: "Início", path: "/" }, { name: "Imprensa", path: "/imprensa" }])]}
      />
      {/* ── Header ── */}
      <div style={{ backgroundColor: "#0A1A2A", paddingTop: "5rem", paddingBottom: "3rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ display: "inline-block", width: "2rem", height: "2px", backgroundColor: "#DB5C34" }} />
            Imprensa
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "3rem", alignItems: "end" }}>
            <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(3rem, 6vw, 6rem)", lineHeight: 1.0, letterSpacing: "-0.03em", color: "white", margin: 0 }}>
              A TEAM 24<br />
              <em style={{ color: "#DB5C34" }}>nos media.</em>
            </h1>
            <div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.65)", margin: "0 0 2rem 0", maxWidth: "45ch" }}>
                Para pedidos de entrevista, comentários de especialistas ou acesso ao media kit, contacte a nossa equipa de comunicação.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#DB5C34", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "white" }}>CM</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "white" }}>Catarina Melo</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>Head of Communications · geral@team24.pt</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Press Releases ── */}
      <div style={{ backgroundColor: "white", padding: "4rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
                Comunicados de Imprensa
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: 0, lineHeight: 1.1 }}>
                As nossas<br />
                <em style={{ color: "#DB5C34" }}>novidades.</em>
              </h2>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {tags.map((t) => (
                <button key={t} onClick={() => setActiveFilter(t)} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: activeFilter === t ? 600 : 400, fontSize: "0.8rem", color: activeFilter === t ? "white" : "#6B8A9F", backgroundColor: activeFilter === t ? "#25749F" : "transparent", border: `1.5px solid ${activeFilter === t ? "#25749F" : "#D0E2EC"}`, padding: "0.5rem 1rem", cursor: "pointer", transition: "all 0.2s" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {filtered.map((pr, i) => (
            <div key={pr.title} style={{ borderTop: i === 0 ? "1.5px solid #0A1A2A" : "1px solid #D0E2EC", padding: "2rem 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "auto 1fr auto" : "1fr", gap: isDesktop ? "3rem" : "1rem", alignItems: "start" }}>
                <div style={{ minWidth: isDesktop ? "120px" : "auto" }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#6B8A9F" }}>{pr.date}</div>
                  <span style={{ display: "inline-block", marginTop: "0.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "white", backgroundColor: tagColors[pr.tag] || "#25749F", padding: "0.2rem 0.6rem" }}>
                    {pr.tag}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "#0A1A2A", margin: "0 0 0.75rem 0", letterSpacing: "-0.02em", lineHeight: 1.3 }}>{pr.title}</h3>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "#6B8A9F", lineHeight: 1.65, margin: 0, maxWidth: "65ch" }}>{pr.summary}</p>
                </div>
                <a href={pr.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#25749F", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                  Ler mais <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1.5px solid #0A1A2A" }} />
        </div>
      </div>



      {/* ── Media Kit ── */}
      <div style={{ backgroundColor: "white", padding: "4rem 0", borderBottom: "1px solid #D0E2EC" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 2fr" : "1fr", gap: isDesktop ? "6rem" : "3rem", alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
                Media Kit
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 1.5rem 0", lineHeight: 1.1 }}>
                Recursos para<br />
                <em style={{ color: "#DB5C34" }}>jornalistas.</em>
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", lineHeight: 1.75, color: "#6B8A9F", margin: 0 }}>
                Todos os assets visuais, dados e documentos institucionais da TEAM 24 disponíveis para download imediato.
              </p>
            </div>
            <div>
              {mediaKitItems.map((item, i) => (
                <div key={item.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0", borderBottom: i < mediaKitItems.length - 1 ? "1px solid #D0E2EC" : "none", gap: "1rem" }}>
                  <div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#0A1A2A", marginBottom: "0.25rem" }}>{item.title}</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#6B8A9F" }}>{item.formats} · {item.size}</div>
                  </div>
                  {item.url ? (
                    <a
                      href={item.url}
                      download
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#25749F", background: "none", border: "1.5px solid #25749F", padding: "0.5rem 1rem", cursor: "pointer", flexShrink: 0, transition: "all 0.2s", textDecoration: "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#25749F"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#25749F"; }}
                    >
                      <Download size={13} /> Download
                    </a>
                  ) : (
                    <button disabled style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#aaa", background: "none", border: "1.5px solid #D0E2EC", padding: "0.5rem 1rem", cursor: "not-allowed", flexShrink: 0 }}>
                      <Download size={13} /> Em breve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Press Contact Form ── */}
      <div style={{ backgroundColor: "#F5F8FA", padding: "4rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? "6rem" : "3rem", alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
                Contacto de Imprensa
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 1.5rem 0", lineHeight: 1.1 }}>
                Fale com<br />
                <em style={{ color: "#DB5C34" }}>a nossa equipa.</em>
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", lineHeight: 1.75, color: "#3D5A6E", marginBottom: "2rem", maxWidth: "40ch" }}>
                Respondemos a todos os pedidos de imprensa em menos de 4 horas em dias úteis.
              </p>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "#0A1A2A" }}>
                <div style={{ marginBottom: "0.5rem" }}><strong>Email:</strong> geral@team24.pt</div>
                <div><strong>Telefone:</strong> +351 220 981 284</div>
              </div>
            </div>
            <div>
              {submitted ? (
                <div style={{ paddingTop: "2rem", borderTop: "3px solid #DB5C34" }}>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "#0A1A2A", lineHeight: 1.1, marginBottom: "1rem" }}>
                    Mensagem<br /><em style={{ color: "#DB5C34" }}>recebida.</em>
                  </div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "#6B8A9F", lineHeight: 1.75 }}>
                    A nossa equipa de comunicação entrará em contacto em menos de 4 horas.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? "2rem" : "1.5rem", marginBottom: "2rem" }}>
                    <div>
                      <label style={labelStyle}>Nome *</label>
                      <input name="name" required value={contactForm.name} onChange={handleChange} placeholder="O seu nome" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")} />
                    </div>
                    <div>
                      <label style={labelStyle}>Órgão de Comunicação *</label>
                      <input name="outlet" required value={contactForm.outlet} onChange={handleChange} placeholder="Ex: Público, RTP..." style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")} />
                    </div>
                  </div>
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={labelStyle}>Email *</label>
                    <input name="email" type="email" required value={contactForm.email} onChange={handleChange} placeholder="email@redacao.pt" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")} />
                  </div>
                  <div style={{ marginBottom: "2.5rem" }}>
                    <label style={labelStyle}>Pedido / Tema *</label>
                    <textarea name="message" required value={contactForm.message} onChange={handleChange} placeholder="Descreva o seu pedido de entrevista, comentário ou informação..." rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")} />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <input type="checkbox" id="privacy-press" required checked={contactForm.privacy} onChange={(e) => setContactForm((prev) => ({ ...prev, privacy: e.target.checked }))} style={{ marginTop: "3px", accentColor: "#DB5C34", cursor: "pointer", width: "16px", height: "16px", flexShrink: 0 }} />
                    <label htmlFor="privacy-press" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#4A6070", lineHeight: 1.5, cursor: "pointer" }}>
                      Li e aceito os{" "}<a href="/termos" style={{ color: "#25749F", textDecoration: "underline" }}>Termos e Condições</a>{" "}e a{" "}<a href="/aviso-legal" style={{ color: "#25749F", textDecoration: "underline" }}>Política de Privacidade</a>.
                    </label>
                  </div>
                  <button type="submit" disabled={!contactForm.privacy} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "white", backgroundColor: contactForm.privacy ? "#DB5C34" : "rgba(219,92,52,0.5)", border: "none", padding: "1rem 2.5rem", cursor: contactForm.privacy ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", transition: "background-color 0.2s, transform 0.15s" }} onMouseEnter={(e) => { if (contactForm.privacy) { e.currentTarget.style.backgroundColor = "#B84520"; e.currentTarget.style.transform = "translateY(-2px)"; } }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = contactForm.privacy ? "#DB5C34" : "rgba(219,92,52,0.5)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    Enviar Pedido <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
