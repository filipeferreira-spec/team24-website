/* ============================================================
   TEAM 24 — Hero Section v7: Slideshow 2 slides
   Slide 1: Ana Ruivo CEO — "Equipas saudáveis. Empresas produtivas."
   Slide 2: Reunião de equipa — "Transformamos saúde mental em cultura empresarial."
   ============================================================ */

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const ANA_RUIVO_URL = "/media/ANA-RUIVO_509f1795_9815983e_5fa5cf91.webp";
const CULTURA_URL = "/media/hero-cultura-empresarial_4944c078.png";

const SLIDES = [
  {
    id: "slide-1",
    eyebrow: "A maior Plataforma de Saúde Mental Empresarial em Portugal",
    headline: ["Transformamos", "bem-estar emocional", "em cultura", "empresarial."],
    headlineAccent: 1, // índice da linha com cor laranja
    body: "Apoio psicológico especializado para todos os seus colaboradores. Anónimo, confidencial e com uma APP disponível 24 horas.",
    cta: { label: "Agendar Reunião", href: "/agendar" },
    ctaSecondary: { label: "Saber mais", scrollTo: "features" },
    image: ANA_RUIVO_URL,
    imageAlt: "Ana Ruivo — CEO & Co-Founder, TEAM 24",
    caption: { name: "Ana Ruivo", role: "CEO & Co-Founder · TEAM 24" },
    imageObjectFit: "contain" as const,
    imageObjectPosition: "center bottom",
    imagePaddingTop: "2rem",
  },
  {
    id: "slide-2",
    eyebrow: "Avaliação de Riscos Psicossociais",
    headline: ["Antes de transformar,", "é preciso", "compreender."],
    headlineAccent: 1,
    body: "A TEAM24 avalia os fatores que podem estar a afetar o bem-estar, a motivação e o desempenho das equipas.",
    cta: { label: "Agendar Reunião", href: "/agendar" },
    ctaSecondary: { label: "Conhecer os serviços", scrollTo: "features" },
    image: "/media/hero-riscos-psicossociais_3e470fbc.png",
    imageAlt: "Sessão de avaliação de riscos psicossociais com equipa",
    caption: null,
    imageObjectFit: "cover" as const,
    imageObjectPosition: "center top",
    imagePaddingTop: "0",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs para animação de entrada (apenas no mount)
  const el1 = useRef<HTMLDivElement>(null);
  const el2 = useRef<HTMLHeadingElement>(null);
  const el3 = useRef<HTMLParagraphElement>(null);
  const el4 = useRef<HTMLDivElement>(null);
  const imgEl = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Animação de entrada inicial
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const elements = [el1, el2, el3, el4];
    elements.forEach((ref, i) => {
      if (!ref.current) return;
      ref.current.style.opacity = "0";
      ref.current.style.transform = "translateY(24px)";
      setTimeout(() => {
        if (!ref.current) return;
        ref.current.style.transition = "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)";
        ref.current.style.opacity = "1";
        ref.current.style.transform = "translateY(0)";
      }, 100 + i * 120);
    });
    if (imgEl.current) {
      imgEl.current.style.opacity = "0";
      imgEl.current.style.transform = "translateX(24px)";
      setTimeout(() => {
        if (!imgEl.current) return;
        imgEl.current.style.transition = "opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)";
        imgEl.current.style.opacity = "1";
        imgEl.current.style.transform = "translateX(0)";
      }, 300);
    }
  }, []);

  const goTo = useCallback((idx: number) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  // Autoplay a cada 7 segundos
  useEffect(() => {
    autoplayRef.current = setTimeout(next, 7000);
    return () => { if (autoplayRef.current) clearTimeout(autoplayRef.current); };
  }, [current, next]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const slide = SLIDES[current];

  return (
    <section id="hero" style={{ backgroundColor: "#F5F8FA", overflow: "hidden", position: "relative" }}>
      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "55fr 45fr" : "1fr",
          minHeight: isDesktop ? "88vh" : "auto",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* === TEXT SIDE === */}
        <div
          style={{
            padding: isDesktop
              ? "clamp(4rem, 6vw, 8rem) clamp(2rem, 4vw, 5rem) clamp(4rem, 6vw, 8rem) clamp(1.5rem, 4vw, 4rem)"
              : "3rem 1.5rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Eyebrow */}
          <div
            ref={el1}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#25749F",
              marginBottom: isDesktop ? "2rem" : "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              transition: "opacity 0.5s ease",
            }}
          >
            <span style={{ display: "inline-block", width: "2rem", height: "2px", backgroundColor: "#DB5C34", flexShrink: 0 }} />
            {slide.eyebrow}
          </div>

          {/* Headline */}
          <h1
            ref={el2}
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: isDesktop ? "clamp(3rem, 5vw, 6.5rem)" : "clamp(2rem, 8vw, 3.2rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#0A1A2A",
              marginBottom: "2rem",
              transition: "opacity 0.5s ease",
            }}
          >
            {slide.headline.map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                {i === slide.headlineAccent
                  ? <em style={{ color: "#DB5C34", fontStyle: "italic" }}>{line}</em>
                  : line}
              </span>
            ))}
          </h1>

          {/* === Imagem — apenas mobile === */}
          {!isDesktop && (
            <div style={{ marginBottom: "2rem" }}>
              <img
                src={slide.image}
                alt={slide.imageAlt}
                style={{
                  width: "100%",
                  maxWidth: "380px",
                  height: "240px",
                  objectFit: slide.imageObjectFit,
                  objectPosition: slide.imageObjectPosition,
                  borderRadius: "6px",
                  display: "block",
                }}
              />
              {slide.caption && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#0A1A2A" }}>{slide.caption.name}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "#6B8A9F", letterSpacing: "0.04em" }}>{slide.caption.role}</div>
                </div>
              )}
            </div>
          )}

          {/* Body */}
          <p
            ref={el3}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              fontSize: isDesktop ? "1.1rem" : "1rem",
              lineHeight: 1.75,
              color: "#6B8A9F",
              maxWidth: "40ch",
              marginBottom: isDesktop ? "2.5rem" : "1.5rem",
              transition: "opacity 0.5s ease",
            }}
          >
            {slide.body}
          </p>

          {/* CTAs */}
          <div
            ref={el4}
            style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2.5rem" }}
          >
            <Link href={slide.cta.href}>
              <button
                style={{
                  backgroundColor: "#DB5C34",
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: "0.02em",
                  padding: "0.875rem 2rem",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "background 0.2s, transform 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c44f2a"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#DB5C34"; }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
              >
                {slide.cta.label}
                <ArrowRight size={16} />
              </button>
            </Link>
            <button
              onClick={() => scrollTo(slide.ctaSecondary.scrollTo)}
              style={{
                backgroundColor: "transparent",
                color: "#25749F",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "0.875rem 1.25rem",
                borderRadius: "4px",
                border: "1.5px solid #25749F",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "#25749F"; b.style.color = "#fff"; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "transparent"; b.style.color = "#25749F"; }}
            >
              {slide.ctaSecondary.label}
            </button>
          </div>

          {/* Slide indicators + nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Dots */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  style={{
                    width: i === current ? "2rem" : "0.5rem",
                    height: "0.5rem",
                    borderRadius: "999px",
                    backgroundColor: i === current ? "#DB5C34" : "#C5D8E4",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    transition: "width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s",
                  }}
                />
              ))}
            </div>
            {/* Arrows */}
            <div style={{ display: "flex", gap: "0.4rem", marginLeft: "0.5rem" }}>
              <button
                onClick={prev}
                aria-label="Slide anterior"
                style={{
                  width: "2rem", height: "2rem", borderRadius: "50%",
                  border: "1.5px solid #C5D8E4", backgroundColor: "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#25749F", transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "#25749F"; b.style.backgroundColor = "#EEF5FA"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "#C5D8E4"; b.style.backgroundColor = "transparent"; }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={next}
                aria-label="Próximo slide"
                style={{
                  width: "2rem", height: "2rem", borderRadius: "50%",
                  border: "1.5px solid #C5D8E4", backgroundColor: "transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#25749F", transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "#25749F"; b.style.backgroundColor = "#EEF5FA"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "#C5D8E4"; b.style.backgroundColor = "transparent"; }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
            {/* Counter */}
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "#6B8A9F", letterSpacing: "0.08em" }}>
              {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* === IMAGE SIDE === */}
        <div
          ref={imgEl}
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#F5F8FA",
            display: isDesktop ? "block" : "none",
          }}
        >
          {/* Crossfade entre slides */}
          {SLIDES.map((s, i) => (
            <img
              key={s.id}
              src={s.image}
              alt={s.imageAlt}
              style={{
                position: i === 0 ? "relative" : "absolute",
                top: 0, left: 0,
                width: "100%",
                height: "100%",
                objectFit: s.imageObjectFit,
                objectPosition: s.imageObjectPosition,
                display: "block",
                paddingTop: s.imagePaddingTop,
                opacity: i === current ? 1 : 0,
                transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1)",
                zIndex: i === current ? 2 : 1,
              }}
            />
          ))}

          {/* Caption overlay — apenas quando slide tem caption */}
          {slide.caption && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "1.5rem 2rem",
                background: "linear-gradient(to top, rgba(245,248,250,0.95) 0%, rgba(245,248,250,0.6) 60%, transparent 100%)",
                zIndex: 3,
                transition: "opacity 0.5s ease",
              }}
            >
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0A1A2A", marginBottom: "2px" }}>
                {slide.caption.name}
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "#6B8A9F", letterSpacing: "0.05em" }}>
                {slide.caption.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
