/* ============================================================
   TEAM 24 — Features Section v8: Telemóvel com 6 ecrãs em rotação
   Cada caixa corresponde a um ecrã da app.
   Rotação automática a cada 3s; hover pausa e muda para esse ecrã.
   O ecrã ativo anima a entrada; a caixa ativa fica destacada.
   ============================================================ */

import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { trackAgendarClick } from "@/lib/analytics";

/* ── Definição dos 6 temas + ecrã correspondente ── */
const features = [
  {
    id: 0,
    title: "Apoio Psicológico",
    desc: "Sessões individuais com psicólogos certificados, agendadas diretamente na app.",
    accentColor: "#25749F",
    screen: "psicologia",
  },
  {
    id: 1,
    title: "Programas de Bem-estar",
    desc: "Conteúdos de mindfulness, meditação e exercício integrados no dia a dia.",
    accentColor: "#2E9E6B",
    screen: "bemestar",
  },
  {
    id: 2,
    title: "Apoio Jurídico e Financeiro",
    desc: "Aconselhamento especializado em questões legais e planeamento financeiro pessoal.",
    accentColor: "#7B5EA7",
    screen: "juridico",
  },
  {
    id: 3,
    title: "Apoio Social",
    desc: "Suporte em situações de cuidado de dependentes, família e equilíbrio vida-trabalho.",
    accentColor: "#DB5C34",
    screen: "social",
  },
  {
    id: 4,
    title: "Nutrição e Saúde",
    desc: "Consultas de nutrição e planos alimentares personalizados para cada colaborador.",
    accentColor: "#D4A017",
    screen: "nutricao",
  },
  {
    id: 5,
    title: "Relatórios para RH",
    desc: "Dashboard com dados agregados e anónimos sobre o bem-estar da equipa.",
    accentColor: "#1A6B8A",
    screen: "rh",
  },
];

/* ── Ecrãs da app — cada um é um componente SVG/JSX ── */
function AppScreen({ screen, accent }: { screen: string; accent: string }) {
  switch (screen) {
    case "psicologia":
      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f4f7fa" }}>
          <div style={{ backgroundColor: accent, padding: "10px 14px 14px" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>Próxima sessão</div>
            <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "white" }}>Consulta de Psicologia</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", color: "rgba(255,255,255,0.8)", marginTop: "2px" }}>Amanhã · 10h00 · Videochamada</div>
          </div>
          <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "hidden" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "2px" }}>Os seus psicólogos</div>
            {[{ name: "Dra. Sofia Mendes", spec: "Ansiedade · Burnout", avail: "Disponível hoje" }, { name: "Dr. Rui Fonseca", spec: "Depressão · Stress", avail: "Disponível amanhã" }, { name: "Dra. Ana Costa", spec: "Relações · Autoestima", avail: "Disponível hoje" }].map((p) => (
              <div key={p.name} style={{ backgroundColor: "white", borderRadius: "8px", padding: "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: accent, opacity: 0.15, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", fontWeight: 700, color: "#0A1A2A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.42rem", color: "#6B8A9F" }}>{p.spec}</div>
                </div>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.38rem", color: accent, fontWeight: 600, whiteSpace: "nowrap" }}>{p.avail}</div>
              </div>
            ))}
            <div style={{ backgroundColor: accent, borderRadius: "8px", padding: "8px 10px", textAlign: "center", marginTop: "4px" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", fontWeight: 700, color: "white" }}>Agendar Consulta</div>
            </div>
          </div>
        </div>
      );

    case "bemestar":
      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f4f7fa" }}>
          <div style={{ backgroundColor: accent, padding: "10px 14px 14px" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>Programa ativo</div>
            <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "white" }}>Gestão do Stress</div>
            <div style={{ marginTop: "6px", height: "4px", backgroundColor: "rgba(255,255,255,0.3)", borderRadius: "2px" }}>
              <div style={{ width: "62%", height: "100%", backgroundColor: "white", borderRadius: "2px" }} />
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.42rem", color: "rgba(255,255,255,0.8)", marginTop: "2px" }}>62% concluído · 4 semanas restantes</div>
          </div>
          <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "hidden" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", fontWeight: 700, color: "#0A1A2A" }}>Sessões de hoje</div>
            {[{ title: "Meditação Matinal", dur: "10 min", done: true }, { title: "Exercício de Respiração", dur: "5 min", done: false }, { title: "Diário de Gratidão", dur: "5 min", done: false }].map((s) => (
              <div key={s.title} style={{ backgroundColor: "white", borderRadius: "8px", padding: "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: s.done ? accent : "#e8eef3", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.done && <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "white" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", fontWeight: 600, color: s.done ? "#9BB0BF" : "#0A1A2A", textDecoration: s.done ? "line-through" : "none" }}>{s.title}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.4rem", color: "#9BB0BF" }}>{s.dur}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginTop: "2px" }}>
              {["Mindfulness", "Meditação", "Yoga", "Respiração"].map((t) => (
                <div key={t} style={{ backgroundColor: "white", borderRadius: "8px", padding: "6px 8px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.42rem", fontWeight: 600, color: "#0A1A2A" }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "juridico":
      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f4f7fa" }}>
          <div style={{ backgroundColor: accent, padding: "10px 14px 14px" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>Apoio especializado</div>
            <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "white" }}>Jurídico & Financeiro</div>
          </div>
          <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
              {[{ label: "Direito Laboral", color: "#7B5EA7" }, { label: "Direito Família", color: "#25749F" }, { label: "Planeamento Financeiro", color: "#2E9E6B" }, { label: "Fiscalidade", color: "#DB5C34" }].map((s) => (
                <div key={s.label} style={{ backgroundColor: "white", borderRadius: "8px", padding: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.42rem", fontWeight: 700, color: "#0A1A2A", lineHeight: 1.3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.45rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "4px" }}>Consulta rápida</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.4rem", color: "#6B8A9F", lineHeight: 1.5 }}>Coloque a sua questão e receba resposta de um especialista em menos de 24h.</div>
            </div>
            <div style={{ backgroundColor: accent, borderRadius: "8px", padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", fontWeight: 700, color: "white" }}>Falar com Especialista</div>
            </div>
          </div>
        </div>
      );

    case "social":
      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f4f7fa" }}>
          <div style={{ backgroundColor: accent, padding: "10px 14px 14px" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>Apoio social</div>
            <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "white" }}>Família & Vida Pessoal</div>
          </div>
          <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "hidden" }}>
            {[{ title: "Cuidado de Idosos", desc: "Apoio na gestão de cuidados a familiares dependentes" }, { title: "Apoio Parental", desc: "Recursos para pais e mães em todas as fases" }, { title: "Conciliação Trabalho-Família", desc: "Estratégias para equilibrar vida profissional e pessoal" }, { title: "Psicologia Infantil", desc: "Apoio especializado para crianças e adolescentes" }].map((s) => (
              <div key={s.title} style={{ backgroundColor: "white", borderRadius: "8px", padding: "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `3px solid ${accent}` }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", fontWeight: 700, color: "#0A1A2A" }}>{s.title}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.4rem", color: "#6B8A9F", marginTop: "2px", lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "nutricao":
      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f4f7fa" }}>
          <div style={{ backgroundColor: accent, padding: "10px 14px 14px" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>Nutrição personalizada</div>
            <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "white" }}>Plano Alimentar Ativo</div>
          </div>
          <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "hidden" }}>
            <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.45rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "4px" }}>Refeições de hoje</div>
              {["Pequeno-almoço", "Almoço", "Lanche", "Jantar"].map((r, i) => (
                <div key={r} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "3px 0", borderBottom: i < 3 ? "1px solid #f0f4f8" : "none" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: i < 2 ? accent : "#e8eef3", flexShrink: 0 }} />
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.42rem", color: i < 2 ? "#0A1A2A" : "#9BB0BF", fontWeight: i < 2 ? 600 : 400 }}>{r}</div>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.45rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "4px" }}>Próxima consulta</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.42rem", color: "#6B8A9F" }}>Dra. Marta Oliveira · Sexta, 14h30</div>
            </div>
            <div style={{ backgroundColor: accent, borderRadius: "8px", padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", fontWeight: 700, color: "white" }}>Ver Plano Completo</div>
            </div>
          </div>
        </div>
      );

    case "rh":
      return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f4f7fa" }}>
          <div style={{ backgroundColor: accent, padding: "10px 14px 14px" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.5rem", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>Painel de Gestão RH</div>
            <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "white" }}>Relatórios & Dados</div>
          </div>
          <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
              {[{ label: "Utilizadores ativos", val: "87%" }, { label: "Satisfação média", val: "4.6/5" }, { label: "Sessões este mês", val: "312" }, { label: "Redução absentismo", val: "-23%" }].map((m) => (
                <div key={m.label} style={{ backgroundColor: "white", borderRadius: "8px", padding: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontFamily: "'Lato',sans-serif", fontWeight: 700, fontSize: "0.7rem", color: accent }}>{m.val}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.38rem", color: "#6B8A9F", lineHeight: 1.3, marginTop: "2px" }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "8px 10px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.45rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "4px" }}>Serviços mais utilizados</div>
              {[{ label: "Psicologia", pct: 78 }, { label: "Bem-estar", pct: 61 }, { label: "Nutrição", pct: 44 }].map((s) => (
                <div key={s.label} style={{ marginBottom: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.4rem", color: "#6B8A9F" }}>{s.label}</span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.4rem", color: accent, fontWeight: 600 }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: "3px", backgroundColor: "#e8eef3", borderRadius: "2px" }}>
                    <div style={{ width: `${s.pct}%`, height: "100%", backgroundColor: accent, borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

/* ── Componente principal ── */
export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [screenKey, setScreenKey] = useState(0); // força re-mount para animação
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((idx: number) => {
    setActiveIdx(idx);
    setScreenKey((k) => k + 1);
  }, []);

  /* Rotação automática a cada 3s */
  useEffect(() => {
    if (!visible || isPaused) return;
    intervalRef.current = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % features.length;
        setScreenKey((k) => k + 1);
        return next;
      });
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [visible, isPaused]);

  const handleHover = (idx: number) => {
    setIsPaused(true);
    if (idx !== activeIdx) goTo(idx);
  };

  const handleLeave = () => {
    setIsPaused(false);
  };

  const active = features[activeIdx];

  /* ── Divide as 6 caixas: 3 esquerda (índices pares) + 3 direita (ímpares) ── */
  const leftFeatures = features.filter((_, i) => i % 2 === 0);  // 0,2,4
  const rightFeatures = features.filter((_, i) => i % 2 !== 0); // 1,3,5

  return (
    <section id="funcionalidades" ref={sectionRef} style={{ backgroundColor: "white", overflow: "hidden" }}>
      <div style={{ height: "1px", backgroundColor: "white" }} />

      <div className="container">
        {/* ── Header ── */}
        <div
          style={{
            paddingTop: "4rem",
            paddingBottom: "2.5rem",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
            borderBottom: "1px solid var(--pale-mid)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div>
            <div className="t-label" style={{ marginBottom: "0.75rem" }}>Funcionalidades</div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: isDesktop ? "clamp(2rem, 3.5vw, 3rem)" : "clamp(1.75rem, 7vw, 2.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Tudo o que a sua equipa precisa,{" "}
              <em style={{ color: "var(--coral)", fontStyle: "italic" }}>num só lugar.</em>
            </h2>
          </div>
          <Link
            href="/plataforma"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.04em",
              color: "var(--coral)",
              textDecoration: "none",
              borderBottom: "1px solid var(--coral)",
              paddingBottom: "2px",
              transition: "opacity 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
          >
            Ver todas as funcionalidades
          </Link>
        </div>

        {/* ── Layout principal ── */}
        <div
          style={{
            display: "flex",
            flexDirection: isDesktop ? "row" : "column",
            alignItems: isDesktop ? "center" : "stretch",
            justifyContent: "center",
            paddingTop: isDesktop ? "3rem" : "2rem",
            paddingBottom: isDesktop ? "3rem" : "2rem",
            gap: isDesktop ? "0" : "1.5rem",
            minHeight: isDesktop ? "600px" : "auto",
          }}
        >
          {/* ── Coluna esquerda ── */}
          {isDesktop && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem", paddingRight: "1.5rem" }}>
              {leftFeatures.map((f) => (
                <FeatureCard
                  key={f.id}
                  feature={f}
                  isActive={activeIdx === f.id}
                  visible={visible}
                  side="left"
                  onHover={() => handleHover(f.id)}
                  onLeave={handleLeave}
                />
              ))}
            </div>
          )}

          {/* ── Telemóvel central (mockup real) ── */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: isDesktop ? "flex-start" : "center",
              justifyContent: "center",
              position: isDesktop ? "sticky" : "relative",
              top: isDesktop ? "7rem" : undefined,
              alignSelf: isDesktop ? "flex-start" : undefined,
              opacity: visible ? 1 : 0,
              transition: "opacity 0.8s ease 0.3s",
              padding: isDesktop ? "0 1.5rem" : "0",
            }}
          >
            <img
              src="/media/mockup-home-app-alpha_c31752ea_7545fe6a.webp"
              alt="App TEAM 24"
              loading="lazy"
              decoding="async"
              style={{
                width: isDesktop ? "380px" : "200px",
                height: "auto",
                display: "block",
                filter: "drop-shadow(0 24px 60px rgba(10,26,42,0.15))",
              }}
            />
          </div>

          {/* ── Coluna direita ── */}
          {isDesktop && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem", paddingLeft: "1.5rem" }}>
              {rightFeatures.map((f) => (
                <FeatureCard
                  key={f.id}
                  feature={f}
                  isActive={activeIdx === f.id}
                  visible={visible}
                  side="right"
                  onHover={() => handleHover(f.id)}
                  onLeave={handleLeave}
                />
              ))}
            </div>
          )}

          {/* ── Mobile: grid 2x3 de caixas ── */}
          {!isDesktop && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              {features.map((f) => (
                <FeatureCard
                  key={f.id}
                  feature={f}
                  isActive={activeIdx === f.id}
                  visible={visible}
                  side="left"
                  onHover={() => handleHover(f.id)}
                  onLeave={handleLeave}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Indicadores de paginação ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            paddingBottom: "1.5rem",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.4s",
          }}
        >
          {features.map((f, i) => (
            <button
              key={i}
              onClick={() => { setIsPaused(true); goTo(i); setTimeout(() => setIsPaused(false), 6000); }}
              aria-label={`Funcionalidade ${i + 1}`}
              style={{
                width: activeIdx === i ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: activeIdx === i ? active.accentColor : "#d0dce6",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.3s ease, background-color 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* ── CTA ── */}
        <div
          style={{
            paddingBottom: "3.5rem",
            borderTop: "1px solid var(--pale-mid)",
            paddingTop: "2rem",
            display: "flex",
            justifyContent: "center",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.7s ease 0.5s",
          }}
        >
          <Link href="/agendar" className="btn-coral" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }} onClick={() => trackAgendarClick("features_section")}>
            Agendar Reunião Gratuita
          </Link>
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes levitate {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes screenSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ height: "1px", backgroundColor: "white" }} />
    </section>
  );
}

/* ── Caixa de feature ── */
function FeatureCard({
  feature,
  isActive,
  visible,
  side,
  onHover,
  onLeave,
}: {
  feature: (typeof features)[0];
  isActive: boolean;
  visible: boolean;
  side: "left" | "right";
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        backgroundColor: isActive ? "#DB5C34" : "rgba(255,255,255,0.5)",
        borderRadius: "4px",
        padding: "0.6rem 0.8rem",
        boxShadow: isActive ? "0 8px 32px rgba(219,92,52,0.25)" : "0 2px 8px rgba(10,26,42,0.05)",
        borderLeft: "3px solid #DB5C34",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        style={{
          fontFamily: "'Lato', sans-serif",
          fontWeight: 700,
          fontSize: "0.78rem",
          color: isActive ? "white" : "#0A1A2A",
          marginBottom: "0.2rem",
          lineHeight: 1.2,
          transition: "color 0.3s ease",
        }}
      >
        {feature.title}
      </div>
      <div
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.65rem",
          color: isActive ? "rgba(255,255,255,0.85)" : "#8BA0AF",
          lineHeight: 1.5,
          transition: "color 0.3s ease",
        }}
      >
        {feature.desc}
      </div>
    </div>
  );
}
