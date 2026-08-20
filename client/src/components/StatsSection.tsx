/* ============================================================
   TEAM 24 — Stats Section v4: Centrado (inline styles)
   Design: Tudo centrado — título, números, descrições.
   Grid de 4 colunas em desktop, 2 em mobile.
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 200, suffix: "K+", label: "Colaboradores apoiados", description: "em empresas de todo o mundo" },
  { value: 200, suffix: "+", label: "Empresas parceiras", description: "de PMEs a grandes grupos" },
  { value: 4.9, suffix: "/5", label: "Satisfação dos utilizadores", description: "média nas avaliações", decimal: true },
];

function useCountUp(target: number, duration: number, active: boolean, decimal = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = eased * target;
      setCount(decimal ? parseFloat(val.toFixed(1)) : Math.floor(val));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [active, target, duration, decimal]);
  return count;
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const check = () => setCols(window.innerWidth >= 768 ? 3 : 1);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(true);
            entry.target.querySelectorAll(".reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 100);
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} style={{ backgroundColor: "var(--teal)" }}>
      <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />

      {/* Wrapper centrado */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "clamp(1.5rem, 4vw, 3rem)",
          paddingRight: "clamp(1.5rem, 4vw, 3rem)",
        }}
      >
        {/* Título centrado */}
        <div
          className="reveal"
          style={{
            paddingTop: "4rem",
            paddingBottom: "2.5rem",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "0.75rem",
            }}
          >
            Impacto mensurável
          </div>
          <h2
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 3.5vw, 3.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "white",
              margin: 0,
            }}
          >
            Números que falam por si.
          </h2>
        </div>

        {/* Grid de números — centrado */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            width: "100%",
          }}
        >
          {stats.map((stat, i) => {
            const count = active
              ? undefined
              : 0;
            return (
              <StatItem
                key={stat.label}
                stat={stat}
                index={i}
                active={active}
                isLast={i === stats.length - 1}
                cols={cols}
              />
            );
          })}
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
    </section>
  );
}

function StatItem({
  stat,
  index,
  active,
  isLast,
  cols,
}: {
  stat: typeof stats[0];
  index: number;
  active: boolean;
  isLast: boolean;
  cols: number;
}) {
  const count = useCountUp(stat.value, 2000, active, stat.decimal);
  const display = stat.decimal ? count.toFixed(1) : Math.round(count).toString();
  const isLastInRow = (index + 1) % cols === 0;

  return (
    <div
      className="reveal"
      style={{
        transitionDelay: `${index * 120}ms`,
        padding: "3.5rem 1.5rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        borderRight: !isLastInRow ? "1px solid rgba(255,255,255,0.07)" : "none",
      }}
    >
      {/* Number */}
      <div
        style={{
          fontFamily: "'Lato', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(3rem, 5vw, 5.5rem)",
          lineHeight: 1.0,
          letterSpacing: "-0.04em",
          color: "white",
          marginBottom: "1rem",
        }}
      >
        {display}
        <span style={{ color: "#DB5C34" }}>{stat.suffix}</span>
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.85)",
          marginBottom: "0.35rem",
          textAlign: "center",
        }}
      >
        {stat.label}
      </div>

      {/* Description */}
      <div
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.78rem",
          color: "rgba(255,255,255,0.35)",
          textAlign: "center",
        }}
      >
        {stat.description}
      </div>
    </div>
  );
}
