/* ============================================================
   TEAM 24 — Página de Detalhe de Vaga
   URL: /carreiras/:slug
   Design: Editorial Clarity. Coluna única, sem cards.
   ============================================================ */

import { useParams, Link } from "wouter";
import { ArrowLeft, ArrowRight, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import SEO, { ORGANIZATION_LD, breadcrumbLD, jobPostingLD } from "@/components/SEO";

// ── Helpers ──────────────────────────────────────────────────
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatTipo(tipo: string): string {
  const map: Record<string, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    freelance: "Freelance",
    estagio: "Estágio",
  };
  return map[tipo] ?? tipo;
}

// ── JobDescription ────────────────────────────────────────────
function JobDescription({ text }: { text: string }) {
  if (!text) return null;

  const sectionKeywords = [
    "Principais responsabilidades",
    "Responsabilidades",
    "O que valorizamos",
    "O que procuramos",
    "Perfil",
    "Sobre a empresa",
    "Quem somos",
    "O que oferecemos",
    "Benefícios",
    "Condições",
    "Como candidatar",
    "Candidatura",
  ];

  const hasStructure = sectionKeywords.some((kw) => text.includes(kw));

  if (!hasStructure) {
    const parts = text.split(/ - (?=[A-ZÁÉÍÓÚÀÂÃÊÔ])/g);
    const intro = parts[0];
    const bullets = parts.slice(1);
    return (
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", lineHeight: 1.85, color: "#3D5A6E", margin: "0 0 1.5rem 0" }}>{intro}</p>
        {bullets.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "0.6rem 0", borderBottom: "1px solid #F0F4F7" }}>
                <span style={{ color: "#DB5C34", fontWeight: 700, flexShrink: 0, fontSize: "0.8rem", marginTop: "4px" }}>—</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "#0A1A2A", lineHeight: 1.65 }}>{b.replace(/;$/, "")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  let remaining = text;
  let introText = "";

  const firstKeywordIdx = sectionKeywords.reduce((min, kw) => {
    const idx = remaining.indexOf(kw);
    return idx !== -1 && idx < min ? idx : min;
  }, Infinity);

  if (firstKeywordIdx < Infinity) {
    introText = remaining.slice(0, firstKeywordIdx).trim();
    remaining = remaining.slice(firstKeywordIdx);
  } else {
    introText = remaining;
    remaining = "";
  }

  const sections: { title: string; items: string[] }[] = [];
  while (remaining.length > 0) {
    const matchedKw = sectionKeywords.find((kw) => remaining.startsWith(kw));
    if (!matchedKw) { remaining = remaining.slice(1); continue; }
    const afterKw = remaining.slice(matchedKw.length).replace(/^\s*[-–—:]\s*/, "").trim();
    const nextKwIdx = sectionKeywords.reduce((min, kw) => {
      const idx = afterKw.indexOf(kw);
      return idx !== -1 && idx < min ? idx : min;
    }, Infinity);
    const sectionContent = nextKwIdx < Infinity ? afterKw.slice(0, nextKwIdx).trim() : afterKw.trim();
    const items = sectionContent
      // divide por: newline, ponto-e-vírgula seguido de espaço/newline, ou " - " antes de maiúscula
      .split(/\n|;\s*| - (?=[A-ZÁÉÍÓÚÀÂÃÊÔ])/g)
      .map((s) => s.replace(/^[-–—+]\s*/, "").trim())
      .filter(Boolean);
    sections.push({ title: matchedKw, items });
    remaining = nextKwIdx < Infinity ? afterKw.slice(nextKwIdx) : "";
  }

  // Divide o introText em parágrafos: por \n\n ou por frases que terminam em ponto final seguidas de maiúscula
  const introParagraphs = introText
    ? introText
        .split(/\n{2,}/)
        .flatMap((block) =>
          block
            .split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÀÂÃÊÔ])/g)
            .map((s) => s.trim())
            .filter(Boolean)
        )
    : [];

  return (
    <div style={{ marginBottom: "2.5rem" }}>
      {introParagraphs.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          {introParagraphs.map((para, pi) => (
            <p key={pi} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", lineHeight: 1.8, color: "#3D5A6E", margin: pi < introParagraphs.length - 1 ? "0 0 1.1rem 0" : "0" }}>{para}</p>
          ))}
        </div>
      )}
      {!introText && null}
      {sections.map((sec, si) => (
        <div key={si} style={{ marginBottom: "2.25rem" }}>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#25749F",
            marginBottom: "1rem",
            paddingBottom: "0.75rem",
            borderBottom: "2px solid #E8F4FA",
          }}>
            {sec.title}
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sec.items.map((item, ii) => (
              <li key={ii} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "0.6rem 0", borderBottom: ii < sec.items.length - 1 ? "1px solid #F0F4F7" : "none" }}>
                <span style={{ color: "#DB5C34", fontWeight: 700, flexShrink: 0, fontSize: "0.8rem", marginTop: "4px" }}>—</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.88rem", color: "#0A1A2A", lineHeight: 1.65 }}>{item.replace(/;$/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ── Formulário de Candidatura ─────────────────────────────────
function CandidaturaForm({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const [form, setForm] = useState({ name: "", email: "", telefone: "", linkedin: "", message: "", privacy: false });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitCandidatura = trpc.backoffice.candidaturas.submit.useMutation();

  // Upload via FormData multipart (evita problemas com redirect 301 que perde o body JSON)
  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setCvError("Ficheiro demasiado grande. Máximo 10MB."); return; }
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { setCvError("Formato não suportado. Use PDF ou Word."); return; }
    setCvFile(file);
    setCvError(null);
    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", file, file.name);
      const response = await fetch("/api/upload/cv", { method: "POST", body: formData });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any).error || "Erro ao fazer upload.");
      }
      const result = await response.json();
      setCvUrl(result.url);
    } catch (err: any) {
      setCvError(err.message || "Erro ao carregar o ficheiro. Tente novamente.");
      setCvFile(null);
    } finally {
      setCvUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.privacy) return;
    if (!cvUrl) {
      setCvError("O currículo é obrigatório. Por favor carregue o seu CV.");
      return;
    }
    setLoading(true);
    try {
      await submitCandidatura.mutateAsync({
        nome: form.name,
        email: form.email,
        telefone: form.telefone || undefined,
        linkedin: form.linkedin || undefined,
        mensagem: form.message || undefined,
        cvUrl: cvUrl || undefined,
        carreiraId: jobId,
      });
      setSubmitted(true);
    } catch {
      // erro silencioso
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: "3rem 0", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", background: "#D1FAE5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#0A1A2A", marginBottom: "1rem" }}>Candidatura enviada com sucesso!</div>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "#4B6A7F", maxWidth: "44ch", margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
          Recebemos a sua candidatura. Em breve receberá um <strong>email com um questionário de seleção</strong> que faz parte do nosso processo.
        </p>
        <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "8px", padding: "1rem 1.5rem", maxWidth: "44ch", margin: "0 auto", display: "flex", alignItems: "flex-start", gap: "0.75rem", textAlign: "left" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#9A3412", margin: 0, lineHeight: 1.6 }}>
            <strong>Não encontra o email?</strong> Por favor verifique a pasta de <strong>spam ou lixo electrónico</strong> — por vezes os emails automáticos ficam retidos.
          </p>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.85rem 1rem",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.9rem",
    color: "#0A1A2A",
    backgroundColor: "#F8FAFB",
    border: "1.5px solid #D0E2EC",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#6B8A9F",
    marginBottom: "0.5rem",
  };

  return (
    <form onSubmit={handleSubmit} style={{ paddingTop: "2rem" }}>
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "2rem", paddingBottom: "0.75rem", borderBottom: "2px solid #FDF0EB" }}>
        Candidatar a esta vaga
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <div>
          <label style={labelStyle}>Nome *</label>
          <input required style={inputStyle} placeholder="O seu nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>Email *</label>
          <input required type="email" style={inputStyle} placeholder="email@exemplo.pt" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <div>
          <label style={labelStyle}>Telefone *</label>
          <input required style={inputStyle} placeholder="+351 9XX XXX XXX" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
        </div>
        <div>
          <label style={labelStyle}>LinkedIn</label>
          <input style={inputStyle} placeholder="linkedin.com/in/..." value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} />
        </div>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={labelStyle}>Mensagem</label>
        <textarea style={{ ...inputStyle, height: "120px", resize: "vertical" }} placeholder="Diga-nos porque é a pessoa certa para esta vaga..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle}>Curriculum Vitae * (PDF, máx. 10MB)</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{ border: "1.5px dashed #D0E2EC", padding: "1.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", backgroundColor: "#F8FAFB", transition: "border-color 0.2s" }}
        >
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: cvFile ? "#0A1A2A" : "#6B8A9F" }}>
            {cvUploading ? "A carregar..." : cvFile ? cvFile.name : "Clique para seleccionar o ficheiro"}
          </span>
          {cvUrl && <span style={{ marginLeft: "auto", color: "#25749F", fontSize: "0.8rem", fontWeight: 600 }}>Carregado</span>}
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleCvChange} />
        {cvError && <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#DB5C34", marginTop: "0.4rem" }}>{cvError}</p>}
      </div>

      <div style={{ marginBottom: "2rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
        <input
          type="checkbox"
          id="privacy-detail"
          checked={form.privacy}
          onChange={e => setForm(f => ({ ...f, privacy: e.target.checked }))}
          style={{ marginTop: "3px", accentColor: "#DB5C34", flexShrink: 0 }}
        />
        <label htmlFor="privacy-detail" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#6B8A9F", lineHeight: 1.6, cursor: "pointer" }}>
          Ao enviar esta candidatura, autorizo o tratamento dos meus dados pessoais pela TEAM 24 para fins de recrutamento, de acordo com a Política de Privacidade.
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !form.privacy || cvUploading || !cvUrl}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "white", backgroundColor: loading ? "#6B8A9F" : "#DB5C34", border: "none", padding: "0.95rem 2.5rem", cursor: loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em", transition: "opacity 0.2s" }}
      >
        {loading ? "A enviar..." : "Enviar Candidatura"} {!loading && <ArrowRight size={15} />}
      </button>
    </form>
  );
}

// ── Página Principal ──────────────────────────────────────────
export default function CareerDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: job, isLoading } = trpc.backoffice.carreiras.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B8A9F" }}>A carregar...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#0A1A2A" }}>Vaga não encontrada.</p>
          <Link href="/carreiras" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", color: "#25749F", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ArrowLeft size={14} /> Ver todas as vagas
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const requirements = job.requisitos
    ? job.requisitos.split(/\n|;/).map(r => r.trim()).filter(Boolean)
    : [];

  return (
    <>
      <SEO
        title={job.titulo}
        description={job.descricao ? job.descricao.slice(0, 160).replace(/\n/g, " ") : `Vaga ${job.titulo} na TEAM 24.`}
        canonicalPath={`/carreiras/${job.slug || job.id}`}
        jsonLd={[
          ORGANIZATION_LD,
          breadcrumbLD([{ name: "Início", path: "/" }, { name: "Carreiras", path: "/carreiras" }, { name: job.titulo, path: `/carreiras/${job.slug || job.id}` }]),
          jobPostingLD({
            title: job.titulo,
            description: job.descricao || `Vaga ${job.titulo} na TEAM 24.`,
            slug: job.slug || String(job.id),
            department: job.departamento || undefined,
            location: job.localizacao || undefined,
            tipo: job.tipo,
            salarioMin: job.salarioMin,
            salarioMax: job.salarioMax,
            publishedAt: new Date(job.createdAt).toISOString().split("T")[0],
          }),
        ]}
      />
      <Navbar />
      <main style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}>

        {/* Breadcrumb + header */}
        <section style={{ backgroundColor: "#F8FAFB", borderBottom: "1px solid #E8F0F5", padding: "2rem 0" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 2rem" }}>
            <Link
              href="/carreiras"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#0A1A2A",
                textDecoration: "none",
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #CBD8E0",
                padding: "0.5rem 1rem",
                marginBottom: "1.75rem",
                letterSpacing: "0.01em",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#25749F"; (e.currentTarget as HTMLAnchorElement).style.color = "#25749F"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#CBD8E0"; (e.currentTarget as HTMLAnchorElement).style.color = "#0A1A2A"; }}
            >
              <ArrowLeft size={13} /> Voltar às Carreiras
            </Link>

            {job.departamento && (
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "0.75rem" }}>
                {job.departamento}
              </div>
            )}

            <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "#0A1A2A", letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 1.25rem 0" }}>
              {job.titulo}
            </h1>

            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {job.localizacao && (
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#6B8A9F", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <MapPin size={13} /> {job.localizacao}
                </span>
              )}
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#6B8A9F", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Clock size={13} /> {formatTipo(job.tipo)}
              </span>
            </div>
          </div>
        </section>

        {/* Conteúdo */}
        <section style={{ maxWidth: "860px", margin: "0 auto", padding: "3.5rem 2rem 5rem" }}>

          {/* Descrição */}
          {job.descricao && <JobDescription text={job.descricao} />}

          {/* Requisitos */}
          {requirements.length > 0 && (
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#25749F", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "2px solid #E8F4FA" }}>
                Requisitos
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {requirements.map((r, i) => (
                  <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "0.6rem 0", borderBottom: i < requirements.length - 1 ? "1px solid #F0F4F7" : "none" }}>
                    <span style={{ color: "#DB5C34", fontWeight: 700, flexShrink: 0, fontSize: "0.8rem", marginTop: "4px" }}>—</span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.88rem", color: "#0A1A2A", lineHeight: 1.65 }}>{r.replace(/^[-–—]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefícios da vaga */}
          {job.beneficios && (
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "2px solid #FDF0EB" }}>
                O que oferecemos
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {job.beneficios.split(/\n|;/).map(b => b.trim()).filter(Boolean).map((b, i, arr) => (
                  <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "0.6rem 0", borderBottom: i < arr.length - 1 ? "1px solid #F0F4F7" : "none" }}>
                    <span style={{ color: "#DB5C34", fontWeight: 700, flexShrink: 0, fontSize: "0.9rem", marginTop: "1px" }}>+</span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.88rem", color: "#3D5A6E", lineHeight: 1.65 }}>{b.replace(/^[-–—+]\s*/, "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Separador */}
          <div style={{ borderTop: "1.5px solid #0A1A2A", margin: "3rem 0" }} />

          {/* Formulário */}
          <CandidaturaForm jobId={job.id} jobTitle={job.titulo} />

          {/* Botão voltar */}
          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #E8F0F5" }}>
            <Link
              href="/carreiras"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#0A1A2A",
                textDecoration: "none",
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #CBD8E0",
                padding: "0.5rem 1rem",
                letterSpacing: "0.01em",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#25749F"; (e.currentTarget as HTMLAnchorElement).style.color = "#25749F"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#CBD8E0"; (e.currentTarget as HTMLAnchorElement).style.color = "#0A1A2A"; }}
            >
              <ArrowLeft size={13} /> Voltar às Carreiras
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
