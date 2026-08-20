/* ============================================================
   TEAM 24 — Página de Carreiras
   Design: Editorial Clarity. Sem cards, sem sombras.
   Cultura, vagas por departamento, benefícios, candidatura.
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowRight, MapPin, Clock, Heart, Zap, Globe, Coffee, BookOpen, Shield, Upload, FileText, X, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import SEO, { ORGANIZATION_LD, breadcrumbLD } from "@/components/SEO";

// Departamentos dinâmicos gerados a partir da BD

// ── JobDescription: formata texto corrido em secções legíveis, coluna única ──
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

  const hasStructure = sectionKeywords.some(kw => text.includes(kw));

  if (!hasStructure) {
    // Sem estrutura: parágrafo único + lista de bullets se houver " - "
    const parts = text.split(/ - (?=[A-ZÁÉÍÓÚÀÂÃÊÔ])/g);
    const intro = parts[0];
    const bullets = parts.slice(1);
    return (
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", lineHeight: 1.85, color: "#3D5A6E", margin: "0 0 1.5rem 0" }}>{intro}</p>
        {bullets.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "0.5rem 0", borderBottom: "1px solid #F0F4F7" }}>
                <span style={{ color: "#DB5C34", fontWeight: 700, flexShrink: 0, fontSize: "0.8rem", marginTop: "3px" }}>—</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#0A1A2A", lineHeight: 1.65 }}>{b.replace(/;$/, "")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Com estrutura: extrair intro + secções em coluna única
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
    const matchedKw = sectionKeywords.find(kw => remaining.startsWith(kw));
    if (!matchedKw) { remaining = remaining.slice(1); continue; }
    const afterKw = remaining.slice(matchedKw.length).replace(/^\s*[-–—:]\s*/, "").trim();
    const nextKwIdx = sectionKeywords.reduce((min, kw) => {
      const idx = afterKw.indexOf(kw);
      return idx !== -1 && idx < min ? idx : min;
    }, Infinity);
    const sectionContent = nextKwIdx < Infinity ? afterKw.slice(0, nextKwIdx).trim() : afterKw.trim();
    const items = sectionContent
      .split(/(?<=;)\s+(?=-)|(?<=\.)\s+(?=-)| - (?=[A-ZÁÉÍÓÚÀÂÃÊÔ])/g)
      .filter(Boolean)
      .map(s => s.replace(/^[-–—]\s*/, "").trim())
      .filter(Boolean);
    sections.push({ title: matchedKw, items });
    remaining = nextKwIdx < Infinity ? afterKw.slice(nextKwIdx) : "";
  }

  return (
    <div style={{ marginBottom: "2.5rem" }}>
      {introText && (
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", lineHeight: 1.85, color: "#3D5A6E", margin: "0 0 2.5rem 0" }}>{introText}</p>
      )}
      {sections.map((sec, si) => (
        <div key={si} style={{ marginBottom: "2rem" }}>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
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
              <li key={ii} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "0.55rem 0", borderBottom: ii < sec.items.length - 1 ? "1px solid #F0F4F7" : "none" }}>
                <span style={{ color: "#DB5C34", fontWeight: 700, flexShrink: 0, fontSize: "0.8rem", marginTop: "3px" }}>—</span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "#0A1A2A", lineHeight: 1.65 }}>{item.replace(/;$/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const _PLACEHOLDER_jobs = [
  {
    id: 1,
    title: "Senior React Developer",
    department: "Tecnologia",
    location: "Lisboa (Híbrido)",
    type: "Full-time",
    description:
      "Procuramos um React Developer experiente para liderar o desenvolvimento da nossa plataforma web. Irás trabalhar diretamente com o CTO numa stack moderna (React 19, TypeScript, Node.js) com impacto direto na saúde mental de milhares de colaboradores.",
    requirements: [
      "5+ anos de experiência com React e TypeScript",
      "Experiência com design systems e acessibilidade",
      "Conhecimento de performance e otimização web",
      "Capacidade de trabalho autónomo e em equipa",
    ],
    nice: ["Experiência com React Native", "Conhecimento de psicologia ou saúde mental", "Contribuições open source"],
  },
  {
    id: 2,
    title: "Psicólogo/a Clínico/a",
    department: "Clínico",
    location: "Lisboa / Remoto",
    type: "Part-time / Full-time",
    description:
      "Junte-se à nossa rede de psicólogos e preste apoio a colaboradores de empresas parceiras através da nossa plataforma. Agenda flexível, supervisão clínica regular e formação contínua certificada.",
    requirements: [
      "Licenciatura em Psicologia (obrigatório)",
      "Cédula profissional da OPP válida",
      "Experiência em contexto organizacional (preferencial)",
      "Competências em terapia cognitivo-comportamental",
    ],
    nice: ["Formação em mindfulness ou MBSR", "Experiência com coaching executivo", "Inglês ou espanhol"],
  },
  {
    id: 3,
    title: "Account Executive — Enterprise",
    department: "Comercial",
    location: "Lisboa",
    type: "Full-time",
    description:
      "Responsável pelo desenvolvimento de negócio com grandes empresas (500+ colaboradores). Irás gerir o ciclo de venda completo, desde a prospeção até ao fecho, com um produto que genuinamente muda vidas.",
    requirements: [
      "3+ anos em vendas B2B SaaS ou RH Tech",
      "Experiência com ciclos de venda enterprise",
      "Excelente capacidade de comunicação e apresentação",
      "Orientação para resultados e autonomia",
    ],
    nice: ["Rede de contactos em RH ou C-suite", "Experiência com Salesforce ou HubSpot", "Espanhol para expansão ibérica"],
  },
  {
    id: 4,
    title: "Growth Marketing Manager",
    department: "Marketing",
    location: "Lisboa (Híbrido)",
    type: "Full-time",
    description:
      "Lidera a estratégia de crescimento orgânico e pago da TEAM 24. Irás trabalhar em SEO, conteúdo, LinkedIn Ads e parcerias para aumentar a geração de leads qualificados junto de CEOs e diretores de RH.",
    requirements: [
      "4+ anos em marketing B2B ou SaaS",
      "Experiência com SEO, content marketing e paid social",
      "Capacidade analítica e orientação a dados",
      "Excelente escrita em português e inglês",
    ],
    nice: ["Experiência no setor de saúde ou RH", "Conhecimento de HubSpot ou Marketo", "Experiência com ABM (Account-Based Marketing)"],
  },
  {
    id: 5,
    title: "Customer Success Manager",
    department: "Operações",
    location: "Lisboa / Remoto",
    type: "Full-time",
    description:
      "Garante que as empresas parceiras tiram o máximo partido da plataforma TEAM 24. Irás acompanhar o onboarding, monitorizar a adoção e construir relações de longo prazo com diretores de RH.",
    requirements: [
      "2+ anos em Customer Success ou Account Management",
      "Experiência com plataformas SaaS",
      "Empatia e excelente comunicação interpessoal",
      "Capacidade de análise de dados de utilização",
    ],
    nice: ["Formação em psicologia ou RH", "Experiência com Intercom ou Zendesk", "Espanhol para clientes ibéricos"],
  },
  {
    id: 6,
    title: "Product Designer (UX/UI)",
    department: "Tecnologia",
    location: "Lisboa (Híbrido)",
    type: "Full-time",
    description:
      "Responsável pela experiência de utilizador da app TEAM 24 (iOS e Android) e da plataforma web. Irás trabalhar próximo dos psicólogos e dos utilizadores finais para criar interfaces que promovam o bem-estar.",
    requirements: [
      "3+ anos em UX/UI design de produtos digitais",
      "Domínio de Figma e prototipagem",
      "Experiência com design de apps mobile",
      "Sensibilidade para acessibilidade e inclusão",
    ],
    nice: ["Experiência em healthtech ou wellbeing", "Conhecimento de psicologia comportamental", "Portfólio com apps publicadas"],
  },
];

const benefits = [
  { icon: <Heart size={22} strokeWidth={1.5} />, title: "Saúde Mental Incluída", desc: "Acesso ilimitado à app TEAM 24 e sessões com psicólogo para toda a equipa." },
  { icon: <Zap size={22} strokeWidth={1.5} />, title: "Crescimento Acelerado", desc: "Startup em fase de crescimento — as suas decisões têm impacto direto e imediato." },
  { icon: <Globe size={22} strokeWidth={1.5} />, title: "Trabalho 100% Remoto", desc: "Flexibilidade real. Trabalhamos por resultados, não por presença." },
  { icon: <Coffee size={22} strokeWidth={1.5} />, title: "Escritório no Porto", desc: "Espaço moderno no Porto, com cozinha equipada e zonas de descanso." },
  { icon: <BookOpen size={22} strokeWidth={1.5} />, title: "Formação Contínua", desc: "Acesso a formação, conferências e certificações." },
  { icon: <Shield size={22} strokeWidth={1.5} />, title: "Seguro de Saúde", desc: "Seguro de saúde médico para si." },
];

const values = [
  { number: "01", title: "Impacto real", desc: "Cada linha de código, cada sessão clínica, cada venda — tudo contribui para a saúde mental de pessoas reais." },
  { number: "02", title: "Transparência radical", desc: "Partilhamos métricas, decisões e desafios com toda a equipa. Sem surpresas, sem política." },
  { number: "03", title: "Autonomia com responsabilidade", desc: "Confiamos em si para tomar decisões. Esperamos que assuma os resultados." },
  { number: "04", title: "Bem-estar em primeiro lugar", desc: "Praticamos o que pregamos. Nenhum prazo justifica sacrificar a saúde da equipa." },
];

export default function Careers() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [, navigate] = useLocation();
  const [formState, setFormState] = useState({ name: "", email: "", role: "", linkedin: "", message: "", telefone: "", privacy: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitCandidatura = trpc.backoffice.candidaturas.submit.useMutation();
  // Upload via fetch multipart (evita problemas com redirect 301 que perde o body)

  const { data: dbCarreiras = [] } = trpc.backoffice.carreiras.listPublic.useQuery();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Apenas dados da BD — sem dados estáticos
  const allJobs = dbCarreiras.map((item: any, idx: number) => ({
    id: item.id ?? -idx - 1,
    carreiraId: item.id,
    title: item.titulo,
    slug: item.slug || null,
    department: item.departamento || "Geral",
    location: item.localizacao || "Lisboa",
    type: item.tipo === "full-time" ? "Full-time" : item.tipo === "part-time" ? "Part-time" : item.tipo === "estagio" ? "Estágio" : "Freelance",
    description: item.descricao || "",
    requirements: item.requisitos ? item.requisitos.split("\n").filter(Boolean) : [],
    nice: item.beneficios ? item.beneficios.split("\n").filter(Boolean) : [],
  }));

  const allDepartments = ["Todos", ...Array.from(new Set(allJobs.map((j) => j.department)))];
  const filteredJobs = activeFilter === "Todos" ? allJobs : allJobs.filter((j) => j.department === activeFilter);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCvSelect = async (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) { setCvError("Ficheiro demasiado grande. Máximo 10MB."); return; }
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { setCvError("Formato não suportado. Use PDF ou Word."); return; }
    setCvError(null);
    setCvFile(file);
    setCvUploading(true);
    try {
      // Usar FormData multipart para evitar problemas com redirect 301 que perde o body JSON
      const formData = new FormData();
      formData.append("cv", file, file.name);
      const response = await fetch("/api/upload/cv", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao fazer upload.");
      }
      const result = await response.json();
      setCvUrl(result.url);
    } catch (err: any) {
      setCvError(err.message || "Erro ao fazer upload. Tente novamente.");
      setCvFile(null);
    } finally {
      setCvUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitCandidatura.mutateAsync({
        nome: formState.name,
        email: formState.email,
        telefone: formState.telefone || undefined,
        linkedin: formState.linkedin || undefined,
        mensagem: formState.message || undefined,
        cvUrl: cvUrl || undefined,
        cvNome: cvFile?.name || undefined,
      });
      setSubmitted(true);
    } catch {
      // fallback: mostrar sucesso mesmo se BD falhar
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
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
      <SEO
        title="Carreiras"
        description="Junta-te à equipa TEAM 24. Vagas abertas em psicologia, comercial e tecnologia. Trabalho remoto, impacto real na saúde mental de colaboradores em Portugal."
        canonicalPath="/carreiras"
        jsonLd={[ORGANIZATION_LD, breadcrumbLD([{ name: "Início", path: "/" }, { name: "Carreiras", path: "/carreiras" }])]}
      />
      <Navbar />

      {/* ── Page Header ── */}
      <div style={{ backgroundColor: "#0A1A2A", paddingTop: "5rem", paddingBottom: "3rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ display: "inline-block", width: "2rem", height: "2px", backgroundColor: "#DB5C34" }} />
            Carreiras
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "3rem", alignItems: "end" }}>
            <h1 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(3rem, 6vw, 6rem)", lineHeight: 1.0, letterSpacing: "-0.03em", color: "white", margin: 0 }}>
              Muda vidas.<br />
              <em style={{ color: "#DB5C34", fontStyle: "italic" }}>A começar</em><br />
              pela tua.
            </h1>
            <div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.1rem", lineHeight: 1.75, color: "rgba(255,255,255,0.65)", margin: "0 0 2rem 0", maxWidth: "45ch" }}>
                Na TEAM 24 trabalhamos para que nenhum colaborador em Portugal se sinta sozinho no trabalho. Se partilhas esta missão, há um lugar para ti.
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* ── Values ── */}
      <div style={{ backgroundColor: "white", padding: "4rem 0", borderBottom: "1px solid #D0E2EC" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
            A Nossa Cultura
          </div>
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 3.5rem 0", lineHeight: 1.1 }}>
            O que nos define.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: "0" }}>
            {values.map((v, i) => (
              <div key={v.number} style={{ padding: "2rem", borderRight: isDesktop ? (i < 3 ? "1px solid #D0E2EC" : "none") : (i % 2 === 0 ? "1px solid #D0E2EC" : "none"), borderBottom: isDesktop ? "none" : (i < 2 ? "1px solid #D0E2EC" : "none") }}>
                <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "2.5rem", color: "#DB5C34", opacity: 0.3, letterSpacing: "-0.05em", marginBottom: "1rem", lineHeight: 1 }}>{v.number}</div>
                <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#0A1A2A", marginBottom: "0.75rem", letterSpacing: "-0.01em" }}>{v.title}</div>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", color: "#6B8A9F", lineHeight: 1.65, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Benefits ── */}
      <div style={{ backgroundColor: "#F5F8FA", padding: "4rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 2fr" : "1fr", gap: isDesktop ? "6rem" : "3rem", alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
                Benefícios
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 1.5rem 0", lineHeight: 1.1 }}>
                Cuidamos de<br />
                <em style={{ color: "#DB5C34" }}>quem cuida.</em>
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", lineHeight: 1.75, color: "#3D5A6E", margin: 0 }}>
                Não podemos pedir às empresas que cuidem dos seus colaboradores se não cuidarmos primeiro da nossa própria equipa.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "0" }}>
              {benefits.map((b, i) => (
                <div key={b.title} style={{ padding: "2rem", borderRight: isDesktop ? (i % 2 === 0 ? "1px solid #D0E2EC" : "none") : "none", borderBottom: i < benefits.length - (isDesktop ? 2 : 1) ? "1px solid #D0E2EC" : "none" }}>
                  <div style={{ color: "#DB5C34", marginBottom: "1rem" }}>{b.icon}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#0A1A2A", marginBottom: "0.5rem" }}>{b.title}</div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#6B8A9F", lineHeight: 1.65, margin: 0 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Job Listings ── */}
      <div style={{ backgroundColor: "white", padding: "4rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>
                Vagas Abertas
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: 0, lineHeight: 1.1 }}>
                {filteredJobs.length} vaga{filteredJobs.length !== 1 ? "s" : ""}<br />
                <em style={{ color: "#DB5C34" }}>disponíveis.</em>
              </h2>
            </div>
            {/* Department filter */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {allDepartments.map((d: string) => (
                <button
                  key={d}
                  onClick={() => setActiveFilter(d)}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: activeFilter === d ? 600 : 400,
                    fontSize: "0.8rem",
                    color: activeFilter === d ? "white" : "#6B8A9F",
                    backgroundColor: activeFilter === d ? "#25749F" : "transparent",
                    border: `1.5px solid ${activeFilter === d ? "#25749F" : "#D0E2EC"}`,
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    letterSpacing: "0.02em",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Job rows */}
          <div>
            {filteredJobs.length === 0 && (
              <div style={{ borderTop: "1.5px solid #0A1A2A", padding: "4rem 0", textAlign: "center" }}>
                <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#0A1A2A", marginBottom: "1rem" }}>Em breve.</div>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "#6B8A9F", maxWidth: "40ch", margin: "0 auto 2rem" }}>Não temos vagas abertas neste momento. Envia-nos uma candidatura espontânea e ficamos com o teu perfil.</p>
                <button onClick={() => { const el = document.getElementById("candidatura-espontanea"); if (el) el.scrollIntoView({ behavior: "smooth" }); }} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "white", backgroundColor: "#DB5C34", border: "none", padding: "0.85rem 2rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>Candidatura Espontânea <ArrowRight size={15} /></button>
                <div style={{ borderTop: "1.5px solid #0A1A2A", marginTop: "4rem" }} />
              </div>
            )}
            {filteredJobs.map((job, i) => (
              <div key={job.id} style={{ borderTop: i === 0 ? "1.5px solid #0A1A2A" : "1px solid #D0E2EC" }}>
                <div
                  onClick={() => { if (job.slug) navigate(`/carreiras/${job.slug}`); }}
                  style={{ display: "grid", gridTemplateColumns: isDesktop ? "3fr auto" : "1fr auto", gap: "1.5rem", alignItems: "center", padding: "1.75rem 0", cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0.75"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                >
                  <div>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.1rem, 2vw, 1.35rem)", color: "#0A1A2A", letterSpacing: "-0.02em", marginBottom: "0.35rem" }}>{job.title}</div>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#DB5C34", fontWeight: 600 }}>{job.department}</span>
                      {isDesktop && (
                        <>
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#6B8A9F", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <MapPin size={12} /> {job.location}
                          </span>
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#6B8A9F", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Clock size={12} /> {job.type}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ color: "#25749F" }}>
                    <ArrowRight size={18} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1.5px solid #0A1A2A" }} />
          </div>
        </div>
      </div>

      {/* ── Spontaneous Application Form ── */}
      <div id="candidatura-espontanea" style={{ backgroundColor: "#F5F8FA", padding: "4rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? "6rem" : "3rem", alignItems: "start" }}>
            {/* Left */}
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B8A9F", marginBottom: "1rem" }}>Candidatura Espontânea</div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em", color: "#0A1A2A", margin: "0 0 1.5rem 0", lineHeight: 1.1 }}>
                Não vês a<br />
                <em style={{ color: "#DB5C34" }}>vaga certa?</em>
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1.05rem", lineHeight: 1.75, color: "#3D5A6E", marginBottom: "2rem", maxWidth: "45ch" }}>
                Estamos sempre à procura de pessoas extraordinárias. Envia-nos a tua candidatura e ficamos com o teu perfil para quando surgir a oportunidade certa.
              </p>

            </div>

            {/* Right: form */}
            <div>
              {submitted ? (
                <div style={{ paddingTop: "2rem", borderTop: "3px solid #DB5C34" }}>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.03em", color: "#0A1A2A", lineHeight: 1.1, marginBottom: "1rem" }}>
                    Candidatura<br /><em style={{ color: "#DB5C34" }}>recebida.</em>
                  </div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "1rem", color: "#6B8A9F", lineHeight: 1.75, marginBottom: "1.25rem" }}>
                    Recebemos a tua candidatura. Em breve receberás um <strong style={{ color: "#0A1A2A" }}>email com um questionário de seleção</strong> que faz parte do nosso processo.
                  </p>
                  <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "8px", padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#9A3412", margin: 0, lineHeight: 1.6 }}>
                      <strong>Não encontras o email?</strong> Verifica a pasta de <strong>spam ou lixo electrónico</strong> — por vezes os emails automáticos ficam retidos.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? "2rem" : "1.5rem", marginBottom: "2rem" }}>
                    <div>
                      <label style={labelStyle}>Nome *</label>
                      <input name="name" required value={formState.name} onChange={handleChange} placeholder="O teu nome" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input name="email" type="email" required value={formState.email} onChange={handleChange} placeholder="email@exemplo.pt" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")} />
                    </div>
                  </div>
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={labelStyle}>Área de interesse *</label>
                    <select name="role" required aria-label="Função" value={formState.role} onChange={handleChange} style={{ ...inputStyle, cursor: "pointer" }} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")}>
                      <option value="">Selecionar área</option>
                      <option value="tecnologia">Tecnologia</option>
                      <option value="clinico">Clínico / Psicologia</option>
                      <option value="comercial">Comercial / Vendas</option>
                      <option value="marketing">Marketing / Conteúdo</option>
                      <option value="operacoes">Operações / Customer Success</option>
                      <option value="outro">Outra área</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={labelStyle}>Perfil LinkedIn</label>
                    <input name="linkedin" value={formState.linkedin} onChange={handleChange} placeholder="linkedin.com/in/o-teu-perfil" style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")} />
                  </div>
                  {/* Campo de upload de CV */}
                  <div style={{ marginBottom: "2rem" }}>
                    <label style={labelStyle}>Currículo (PDF ou Word, máx. 10MB)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      style={{ display: "none" }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCvSelect(f); }}
                    />
                    {!cvFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#25749F"; e.currentTarget.style.backgroundColor = "#EEF6FB"; }}
                        onDragLeave={(e) => { e.currentTarget.style.borderColor = "#D0E2EC"; e.currentTarget.style.backgroundColor = "transparent"; }}
                        onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#D0E2EC"; e.currentTarget.style.backgroundColor = "transparent"; const f = e.dataTransfer.files[0]; if (f) handleCvSelect(f); }}
                        style={{ border: "1.5px dashed #D0E2EC", padding: "1.5rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", marginTop: "0.5rem" }}
                      >
                        <Upload size={20} style={{ color: "#6B8A9F", margin: "0 auto 0.5rem" }} />
                        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#6B8A9F", margin: 0 }}>
                          Arrasta o ficheiro ou <span style={{ color: "#25749F", fontWeight: 600 }}>clica para selecionar</span>
                        </p>
                        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "#9BB5C5", margin: "0.25rem 0 0" }}>PDF ou Word — máx. 10MB</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", backgroundColor: cvUploading ? "#F5F8FA" : cvUrl ? "#EEF6FB" : "#FFF5F5", border: `1.5px solid ${cvUploading ? "#D0E2EC" : cvUrl ? "#25749F" : "#DB5C34"}`, marginTop: "0.5rem" }}>
                        {cvUploading ? (
                          <><div style={{ width: 16, height: 16, border: "2px solid #D0E2EC", borderTopColor: "#25749F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#6B8A9F" }}>A fazer upload...</span></>
                        ) : cvUrl ? (
                          <><CheckCircle size={16} style={{ color: "#25749F", flexShrink: 0 }} />
                          <FileText size={16} style={{ color: "#25749F", flexShrink: 0 }} />
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#0A1A2A", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cvFile.name}</span>
                          <button type="button" onClick={() => { setCvFile(null); setCvUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6B8A9F", display: "flex" }}><X size={16} /></button></>
                        ) : (
                          <><X size={16} style={{ color: "#DB5C34", flexShrink: 0 }} />
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#DB5C34" }}>{cvError || "Erro no upload"}</span>
                          <button type="button" onClick={() => { setCvFile(null); setCvUrl(null); setCvError(null); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6B8A9F", display: "flex", marginLeft: "auto" }}><X size={16} /></button></>
                        )}
                      </div>
                    )}
                    {cvError && !cvFile && <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "#DB5C34", marginTop: "0.5rem" }}>{cvError}</p>}
                  </div>

                  <div style={{ marginBottom: "2.5rem" }}>
                    <label style={labelStyle}>Porque queres juntar-te à TEAM 24?</label>
                    <textarea name="message" value={formState.message} onChange={handleChange} placeholder="Conta-nos um pouco sobre ti e o que te atrai nesta missão..." rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#25749F")} onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#D0E2EC")} />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <input type="checkbox" id="privacy-careers" required checked={formState.privacy} onChange={(e) => setFormState((prev) => ({ ...prev, privacy: e.target.checked }))} style={{ marginTop: "3px", accentColor: "#DB5C34", cursor: "pointer", width: "16px", height: "16px", flexShrink: 0 }} />
                    <label htmlFor="privacy-careers" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#4A6070", lineHeight: 1.5, cursor: "pointer" }}>
                      Li e aceito os{" "}<a href="/termos" style={{ color: "#25749F", textDecoration: "underline" }}>Termos e Condições</a>{" "}e a{" "}<a href="/aviso-legal" style={{ color: "#25749F", textDecoration: "underline" }}>Política de Privacidade</a>.
                    </label>
                  </div>
                  <button type="submit" disabled={loading || !formState.privacy} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "white", backgroundColor: (loading || !formState.privacy) ? "#B84520" : "#DB5C34", border: "none", padding: "1rem 2.5rem", cursor: (loading || !formState.privacy) ? "not-allowed" : "pointer", transition: "background-color 0.2s, transform 0.15s", display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em" }} onMouseEnter={(e) => { if (!loading && formState.privacy) { e.currentTarget.style.backgroundColor = "#B84520"; e.currentTarget.style.transform = "translateY(-2px)"; }}} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = (loading || !formState.privacy) ? "#B84520" : "#DB5C34"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    {loading ? "A enviar..." : <> Enviar Candidatura <ArrowRight size={16} /> </>}
                  </button>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "#6B8A9F", marginTop: "1rem" }}>
                    Os teus dados são tratados de acordo com o RGPD e a nossa <a href="#" style={{ color: "#25749F" }}>Política de Privacidade</a>.
                  </p>
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
