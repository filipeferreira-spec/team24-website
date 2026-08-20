/* ============================================================
   TEAM 24 — Corporate Video Component: Embedded Cinematic Reel
   Design: Full-bleed cinematic slideshow with crossfade transitions.
   Overlaid text captions, brand identity, mute/unmute control.
   No cards, no shadows — pure editorial motion.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

const FRAMES = [
  {
    img: "/media/t24-vid-frame4-BdWuu29u8XvgZd4fCytov7_70db3e23.webp",
    caption: "Empresas que colocam as pessoas em primeiro lugar",
    sub: "Mais de 200 empresas em Portugal confiam na TEAM 24",
  },
  {
    img: "/media/t24-vid-frame1-gwLmf7ETYLvTz2pmuGo7pi_f70f117e.webp",
    caption: "Apoio psicológico profissional, disponível 24 horas",
    sub: "Chat, telefone e videoconsulta com psicólogos certificados",
  },
  {
    img: "/media/t24-vid-frame3-MNarjr69vfrbKXfkxPQzu2_1dc21696.webp",
    caption: "Psicólogos experientes, sempre disponíveis",
    sub: "Sessões confidenciais adaptadas ao ritmo de cada colaborador",
  },
  {
    img: "/media/t24-vid-frame2-F5recHNLTQbmdbhLcqnVbM_9c91e8c4.webp",
    caption: "Uma app simples. Um impacto transformador.",
    sub: "Disponível em iOS e Android. Implementação em 24 horas.",
  },
];

const DURATION = 5000; // ms per frame

export default function CorporateVideo() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [captionVisible, setCaptionVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = () => {
    setCurrent((c) => {
      setPrev(c);
      return (c + 1) % FRAMES.length;
    });
    setCaptionVisible(false);
    setTimeout(() => setCaptionVisible(true), 400);
  };

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(advance, DURATION);
  };

  useEffect(() => {
    if (isPlaying) {
      startInterval();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const goTo = (idx: number) => {
    setPrev(current);
    setCurrent(idx);
    setCaptionVisible(false);
    setTimeout(() => setCaptionVisible(true), 400);
    if (isPlaying) startInterval();
  };

  const togglePlay = () => setIsPlaying((p) => !p);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        overflow: "hidden",
        backgroundColor: "#0d1a18",
      }}
    >
      {/* Frames */}
      {FRAMES.map((frame, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.2s cubic-bezier(0.4,0,0.2,1)",
            zIndex: i === current ? 2 : i === prev ? 1 : 0,
          }}
        >
          <img
            src={frame.img}
            alt={frame.caption}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: i === current ? "scale(1.04)" : "scale(1)",
              transition: "transform 6s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </div>
      ))}

      {/* Gradient overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(13,26,24,0.85) 0%, rgba(13,26,24,0.2) 50%, rgba(13,26,24,0.1) 100%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(13,26,24,0.3) 0%, transparent 60%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Brand mark top-left */}
      <div
        style={{
          position: "absolute",
          top: "1.25rem",
          left: "1.5rem",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            width: "1.75rem",
            height: "1.75rem",
            backgroundColor: "var(--coral)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              color: "white",
              lineHeight: 1,
            }}
          >
            T
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          TEAM 24
        </span>
      </div>

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          bottom: "3.5rem",
          left: "1.5rem",
          right: "1.5rem",
          zIndex: 5,
          opacity: captionVisible ? 1 : 0,
          transform: captionVisible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(0.9rem, 2vw, 1.35rem)",
            lineHeight: 1.3,
            color: "white",
            marginBottom: "0.35rem",
            maxWidth: "40ch",
          }}
        >
          {FRAMES[current].caption}
        </p>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(0.7rem, 1.2vw, 0.82rem)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
          }}
        >
          {FRAMES[current].sub}
        </p>
      </div>

      {/* Progress dots + controls */}
      <div
        style={{
          position: "absolute",
          bottom: "1.25rem",
          left: "1.5rem",
          right: "1.5rem",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Dots */}
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {FRAMES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? "1.75rem" : "0.4rem",
                height: "0.25rem",
                backgroundColor: i === current ? "var(--coral)" : "rgba(255,255,255,0.3)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "width 0.4s cubic-bezier(0.16,1,0.3,1), background-color 0.3s",
              }}
              aria-label={`Ir para cena ${i + 1}`}
            />
          ))}
        </div>

        {/* Play/pause */}
        <button
          onClick={togglePlay}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "white",
            width: "2rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          backgroundColor: "rgba(255,255,255,0.1)",
          zIndex: 6,
        }}
      >
        {isPlaying && (
          <div
            key={`${current}-${isPlaying}`}
            style={{
              height: "100%",
              backgroundColor: "var(--coral)",
              animation: `progress-bar ${DURATION}ms linear forwards`,
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
