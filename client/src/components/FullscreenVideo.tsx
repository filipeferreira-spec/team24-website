/* ============================================================
   TEAM 24 — Fullscreen Cinematic Hero Video
   Design: 100vh fullscreen. Ken Burns zoom/pan on each frame.
   Crossfade transitions. Animated text captions. Scroll-to-content CTA.
   Slide 3 (index 2): special dark slide with real app screenshot mockup.
   No cards, no shadows — pure cinematic editorial motion.
   ============================================================ */

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown, Play, Pause } from "lucide-react";
import { Link } from "wouter";
import { trackAgendarClick } from "@/lib/analytics";

const APP_SCREEN_URL = "/media/app-screen_a6dcefb3_13817133.webp";

const FRAMES = [
  {
    type: "photo" as const,
    img: "/media/hero-cultura-empresarial_6d9431be.webp",
    headline: "Transformamos bem-estar emocional",
    sub: "em cultura",
    sub2: "empresarial.",
    description: "Ajudamos empresas a medir riscos psicossociais, implementar medidas concretas e criar equipas mais saudáveis, confiantes e felizes.",
    kbStart: { scale: 1.05, x: 1, y: -1 },
    kbEnd: { scale: 1.0, x: -1, y: 0 },
  },
  {
    type: "photo" as const,
    img: "/media/hero-riscos-psicossociais_8f08b300.webp",
    headline: "Antes de transformar,",
    sub: "é preciso",
    sub2: "compreender.",
    description: "A TEAM24 avalia os fatores que podem estar a afetar o bem-estar, a motivação e o desempenho das equipas.",
    kbStart: { scale: 1.0, x: 0, y: 0 },
    kbEnd: { scale: 1.06, x: 1, y: 1 },
  },
  {
    type: "photo" as const,
    img: "/media/hero-empresa-melhor_f9a8cd57.webp",
    headline: "A sua empresa",
    sub: "pode ser um lugar",
    subColor: "white",
    sub2: "melhor para",
    sub3: "trabalhar.",
    description: "Comece por perceber como estão realmente as suas equipas.",
    kbStart: { scale: 1.05, x: -1, y: 0 },
    kbEnd: { scale: 1.0, x: 1, y: 0 },
  },
  {
    type: "photo" as const,
    img: "/media/hero-roi-ceo-pt_89daf35e.webp",
    headline: "Saúde mental",
    sub: "é ROI.",
    subColor: "#DB5C34",
    description: "Empresas com programas EAP registam até 4x de retorno por cada euro investido. Reduza o absentismo, retenha talento e melhore a produtividade com dados reais.",
    cta: { label: "Calcular o meu ROI", href: "/roi" },
    kbStart: { scale: 1.05, x: 0, y: -1 },
    kbEnd: { scale: 1.0, x: 0, y: 1 },
  },
];

const DURATION = 7000;
const TRANSITION = 2200;

export default function FullscreenVideo() {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const advance = useCallback(() => {
    const nextIdx = (current + 1) % FRAMES.length;
    setTextVisible(false);
    setTimeout(() => {
      setNext(nextIdx);
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(nextIdx);
        setNext(null);
        setTransitioning(false);
        setTimeout(() => setTextVisible(true), 400);
      }, TRANSITION);
    }, 400);
  }, [current]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(advance, DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, isPlaying, advance]);

  const goTo = (idx: number) => {
    if (transitioning || idx === current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setTextVisible(false);
    setTimeout(() => {
      setNext(idx);
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(idx);
        setNext(null);
        setTransitioning(false);
        setTimeout(() => setTextVisible(true), 400);
      }, TRANSITION);
    }, 300);
  };

  const scrollDown = () => {
    const hero = document.getElementById("hero-content");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  const frame = FRAMES[current];

  /* ── Ken Burns animation names per slide index ── */
  const KB_ANIM = ["kenburns-a", "kenburns-b", "kenburns-c", "kenburns-d"];
  const BG_POS = ["center", "center 40%", "center 30%", "center 40%"];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        overflow: "hidden",
        backgroundColor: "#0a1a16",
      }}
    >
      {/* === ALL FRAMES — always mounted, only opacity changes === */}
      {FRAMES.map((f, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: idx === current ? 2 : (next !== null && idx === next ? 3 : 1),
            opacity: idx === current && !transitioning ? 1
              : (next !== null && idx === next && transitioning ? 1
              : (idx === current && transitioning ? 0 : 0)),
            transition: `opacity ${TRANSITION}ms ease-in-out`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${f.img})`,
              backgroundSize: "cover",
              backgroundPosition: BG_POS[idx] || "center",
              animation: idx === current || (next !== null && idx === next)
                ? `${KB_ANIM[idx % KB_ANIM.length]} ${DURATION + TRANSITION}ms ease-in-out both`
                : undefined,
            }}
          />
        </div>
      ))}

      {/* === GRADIENT OVERLAYS === */}
      <>
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            background: "linear-gradient(to top, rgba(10,26,22,0.92) 0%, rgba(10,26,22,0.45) 40%, rgba(10,26,22,0.15) 70%, rgba(10,26,22,0.3) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            background: "linear-gradient(to right, rgba(10,26,22,0.5) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />
      </>

      {/* === APP SLIDE SPECIAL CONTENT (removed) === */}
      {false && (
        <>
          <div />

          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 4,
              display: "grid",
              gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
              alignItems: "center",
              padding: isDesktop ? "0 clamp(3rem, 7vw, 7rem)" : "5rem 1.5rem 8rem",
              gap: isDesktop ? "4rem" : "2rem",
            }}
          >
            {/* Left: text */}
            <div
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? "translateX(0)" : "translateX(-24px)",
                transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {/* Eyebrow */}
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#DB5C34",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}>
                <span style={{ display: "inline-block", width: "2.5rem", height: "2px", backgroundColor: "#DB5C34", flexShrink: 0 }} />
                App TEAM 24
              </div>

              {/* Headline */}
              <h2 style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: isDesktop ? "clamp(3rem, 5vw, 5.5rem)" : "clamp(2.5rem, 9vw, 4rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
                color: "white",
                margin: "0 0 1.5rem 0",
              }}>
                Uma app.<br />
                <em style={{ color: "#DB5C34", fontStyle: "italic" }}>Um impacto.</em>
              </h2>

              {/* Sub */}
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: isDesktop ? "1.1rem" : "0.95rem",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.55)",
                margin: "0 0 2.5rem 0",
                maxWidth: "36ch",
              }}>
                Psicólogos certificados no bolso de cada colaborador — disponível 24 horas, anónimo e confidencial.
              </p>

              {/* CTA */}
              <Link href="/agendar">
                <button
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    letterSpacing: "0.05em",
                    color: "white",
                    backgroundColor: "#DB5C34",
                    border: "none",
                    padding: "1rem 2.25rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#B84520"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#DB5C34"; e.currentTarget.style.transform = "translateY(0)"; }}
                  onClick={() => trackAgendarClick("fullscreen_video")}
                >
                  Agendar Reunião Gratuita
                </button>
              </Link>
            </div>

            {/* Right: iPhone 3D perspective floating */}
            {isDesktop && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: textVisible ? 1 : 0,
                  transform: textVisible ? "translateY(0)" : "translateY(50px)",
                  transition: "opacity 1.1s 0.2s cubic-bezier(0.16,1,0.3,1), transform 1.1s 0.2s cubic-bezier(0.16,1,0.3,1)",
                  perspective: "1200px",
                }}
              >
                <style>{`
                  @keyframes float-phone {
                    0%, 100% { transform: rotateY(-22deg) rotateX(4deg) translateY(0px); }
                    50% { transform: rotateY(-22deg) rotateX(4deg) translateY(-14px); }
                  }
                `}</style>
                {/* Glow behind phone */}
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    inset: "-80px",
                    background: "radial-gradient(ellipse at 60% 50%, rgba(37,116,159,0.35) 0%, transparent 65%)",
                    pointerEvents: "none",
                    filter: "blur(20px)",
                  }} />
                  {/* Reflection shadow on floor */}
                  <div style={{
                    position: "absolute",
                    bottom: "-30px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "160px",
                    height: "20px",
                    background: "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 70%)",
                    filter: "blur(8px)",
                    pointerEvents: "none",
                  }} />
                  {/* iPhone frame — 3D perspective + float animation */}
                  <div style={{
                    position: "relative",
                    width: "230px",
                    background: "linear-gradient(160deg, #1a1a1e 0%, #0D1117 60%, #111318 100%)",
                    borderRadius: "46px",
                    padding: "13px 11px",
                    boxShadow: "0 60px 120px rgba(0,0,0,0.85), 0 0 0 1.5px rgba(255,255,255,0.13), inset 0 0 0 1.5px rgba(255,255,255,0.04), 12px 20px 40px rgba(0,0,0,0.5)",
                    animation: textVisible ? "float-phone 4s ease-in-out infinite" : "none",
                    transformStyle: "preserve-3d",
                  }}>
                    {/* Dynamic island */}
                    <div style={{
                      position: "absolute",
                      top: "15px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "80px",
                      height: "26px",
                      background: "#0D1117",
                      borderRadius: "18px",
                      zIndex: 10,
                    }} />
                    {/* Power button */}
                    <div style={{
                      position: "absolute",
                      right: "-3px",
                      top: "80px",
                      width: "3px",
                      height: "58px",
                      background: "#2a3040",
                      borderRadius: "0 3px 3px 0",
                    }} />
                    {/* Volume up */}
                    <div style={{
                      position: "absolute",
                      left: "-3px",
                      top: "70px",
                      width: "3px",
                      height: "36px",
                      background: "#2a3040",
                      borderRadius: "3px 0 0 3px",
                    }} />
                    {/* Volume down */}
                    <div style={{
                      position: "absolute",
                      left: "-3px",
                      top: "116px",
                      width: "3px",
                      height: "36px",
                      background: "#2a3040",
                      borderRadius: "3px 0 0 3px",
                    }} />
                    {/* Screen */}
                    <div style={{
                      borderRadius: "34px",
                      overflow: "hidden",
                      lineHeight: 0,
                      background: "white",
                    }}>
                      <img
                        src={APP_SCREEN_URL}
                        alt="App TEAM 24 — Ecrã de Perfil"
                        style={{ width: "100%", display: "block" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* === MAIN TEXT === */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: isDesktop ? "clamp(1.5rem, 5vw, 5rem)" : "1.25rem",
          right: isDesktop ? "clamp(4rem, 10vw, 10rem)" : "1.25rem",
          zIndex: 10,
          maxWidth: isDesktop ? "700px" : "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: isDesktop ? "center" : "flex-end",
          paddingBottom: isDesktop ? "0" : "6rem",
        }}
      >
          {/* Scene counter */}
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "1rem",
              opacity: textVisible ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          >
            {String(current + 1).padStart(2, "0")} / {String(FRAMES.length).padStart(2, "0")}
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: isDesktop ? "clamp(2rem, 5.5vw, 5rem)" : "clamp(1.6rem, 7vw, 2.8rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "white",
              marginBottom: "0.5rem",
              whiteSpace: (frame as any).sub3 ? (isDesktop ? "nowrap" as const : "normal" as const) : "normal" as const,
              overflow: "visible",
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {frame.headline}
          </h1>

          {/* Subline — mesmo tamanho do headline, em laranja */}
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: isDesktop ? "clamp(2rem, 5.5vw, 5rem)" : "clamp(1.6rem, 7vw, 2.8rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: (frame as any).subColor ?? "#DB5C34",
              marginBottom: (frame as any).sub2 ? "0.5rem" : "1rem",
              whiteSpace: (frame as any).sub3 ? (isDesktop ? "nowrap" as const : "normal" as const) : "normal" as const,
              overflow: "visible",
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.7s 0.1s cubic-bezier(0.16,1,0.3,1), transform 0.7s 0.1s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {frame.sub}
          </p>

          {/* Sub2 — terceira linha em laranja */}
          {(frame as any).sub2 && (
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: isDesktop ? "clamp(2rem, 5.5vw, 5rem)" : "clamp(1.6rem, 7vw, 2.8rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
                color: (frame as any).sub2Color ?? "#DB5C34",
                marginBottom: (frame as any).sub3 ? "0.5rem" : "1rem",
                whiteSpace: isDesktop ? "nowrap" as const : "normal" as const,
                overflow: "visible",
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.7s 0.15s cubic-bezier(0.16,1,0.3,1), transform 0.7s 0.15s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {(frame as any).sub2}
            </p>
          )}
          {/* Sub3 — quarta linha em laranja */}
          {(frame as any).sub3 && (
            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 5.5vw, 5rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
                color: "#DB5C34",
                marginBottom: "1rem",
                whiteSpace: "nowrap" as const,
                overflow: "visible",
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.7s 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.7s 0.2s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {(frame as any).sub3}
            </p>
          )}

          {/* Description — linha descritiva opcional */}
          {(frame as any).description && (
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 400,
                fontSize: isDesktop ? "clamp(0.95rem, 1.5vw, 1.15rem)" : "clamp(0.9rem, 3.5vw, 1rem)",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.72)",
                maxWidth: "44ch",
                marginTop: "1.5rem",
                marginBottom: 0,
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.7s 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.7s 0.2s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {(frame as any).description}
            </p>
          )}

          {/* CTA por slide — ex: slide ROI */}
          {(frame as any).cta && (
            <div
              style={{
                marginTop: "2rem",
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.7s 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.7s 0.3s cubic-bezier(0.16,1,0.3,1)",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                href={(frame as any).cta.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.75rem",
                  background: "#DB5C34",
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e: any) => { e.currentTarget.style.background = "#c44f2a"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.background = "#DB5C34"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                {(frame as any).cta.label}
              </Link>
              <Link
                href="/agendar"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.75rem 1.75rem",
                  background: "transparent",
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.25)",
                  cursor: "pointer",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
              >
                Agendar Reunião
              </Link>
            </div>
          )}

        </div>

      {/* === BOTTOM CONTROLS === */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "clamp(1.5rem, 5vw, 5rem)",
          right: "clamp(1.5rem, 5vw, 5rem)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Progress dots */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {FRAMES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? "2.5rem" : "0.5rem",
                height: "2px",
                backgroundColor: i === current ? "#e8603a" : "rgba(255,255,255,0.3)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "width 0.5s cubic-bezier(0.16,1,0.3,1), background-color 0.3s",
              }}
              aria-label={`Cena ${i + 1}`}
            />
          ))}
        </div>

        {/* Play/pause */}
        <button
          onClick={() => setIsPlaying(p => !p)}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)",
            width: "2.25rem",
            height: "2.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        </button>
      </div>

      {/* === SCROLL DOWN ARROW === */}
      <button
        onClick={scrollDown}
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          cursor: "pointer",
          animation: "bounce-down 2s ease-in-out infinite",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.25rem",
        }}
        aria-label="Rolar para baixo"
      >
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Descobrir
        </span>
        <ChevronDown size={18} />
      </button>

      {/* === PROGRESS BAR === */}
      {isPlaying && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            backgroundColor: "rgba(255,255,255,0.08)",
            zIndex: 11,
          }}
        >
          <div
            key={`progress-${current}`}
            style={{
              height: "100%",
              backgroundColor: "#DB5C34",
              animation: `progress-fill ${DURATION}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* === CSS ANIMATIONS === */}
      <style>{`
        @keyframes kenburns-a {
          from { transform: scale(1.08) translate(-2%, -1%); }
          to   { transform: scale(1.0)  translate(0%, 0%); }
        }
        @keyframes kenburns-b {
          from { transform: scale(1.0)  translate(0%, 0%); }
          to   { transform: scale(1.08) translate(2%, 1%); }
        }
        @keyframes kenburns-c {
          from { transform: scale(1.05) translate(1%, 0%); }
          to   { transform: scale(1.0)  translate(-1%, 0%); }
        }
        @keyframes kenburns-d {
          from { transform: scale(1.06) translate(-1%, 1%); }
          to   { transform: scale(1.0)  translate(1%, -1%); }
        }
        @keyframes progress-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes bounce-down {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.4; }
          50%       { transform: translateX(-50%) translateY(6px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
