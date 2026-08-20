/* ============================================================
   TEAM 24 — Testimonials Section v3: Centrado
   Design: Citações centradas, fundo teal escuro, sem cards.
   Navegação por dots centrada. Empresas centradas em baixo.
   Cores: azul #25749F + laranja #DB5C34
   ============================================================ */

import { useEffect, useRef, useState } from "react";
const testimonials = [
  {
    quote: "O maior impacto que verificámos prende-se com o facto de sabermos que temos colaboradores a serem acompanhados e que, se a empresa não proporcionasse este serviço, provavelmente estariam sem suporte.",
    name: "Vânia Borges",
    role: "Diretora de Recursos Humanos",
    company: "Adecco",
  },
  {
    quote: "A parceria com a TEAM 24 visa criar awareness na organização para um tema que ainda tende a ser algo estigmatizado na nossa sociedade.",
    name: "Henrique Dias Duarte",
    role: "Diretor de Recursos Humanos",
    company: "Sporting Clube de Portugal",
  },
  {
    quote: "Com a disponibilização de um serviço de psicologia online, contamos contribuir para aumentar o bem-estar dos trabalhadores da ACT, nas suas diferentes dimensões, reduzindo expressivamente o impacto de situações como o stress e a ansiedade em contexto de trabalho.",
    name: "Daniel Alves",
    role: "Chefe de Divisão de Formação e Recursos Humanos",
    company: "ACT",
  },
  {
    quote: "A saúde mental deve ser levada muito a sério, é tão ou mais importante que a saúde física.",
    name: "Rui Bairrada",
    role: "CEO",
    company: "Doutor Finanças",
  },
  {
    quote: "A TEAM 24 não só veio dar resposta a esta necessidade como trouxe uma solução que nos permitiu abranger colaboradores de todo o país, graças ao digital, algo que nas soluções estudadas anteriormente se restringiam a um espaço geográfico e a uma utilização mais restrita.",
    name: "Paula Arriscado",
    role: "Diretora de Recursos Humanos",
    company: "Salvador Caetano",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % testimonials.length), 5500);
    return () => clearInterval(timer);
  }, [auto]);

  const t = testimonials[active];

  return (
    <section
      ref={sectionRef}
      style={{ backgroundColor: "var(--teal)" }}
    >
      <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "3.5rem clamp(1.5rem, 4vw, 4rem)",
          textAlign: "center",
        }}
      >
        {/* Eyebrow */}
        <div
          className="reveal"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginBottom: "3.5rem",
          }}
        >
          O que dizem os nossos clientes
        </div>

        {/* Quote area */}
        <div
          style={{
            position: "relative",
            minHeight: "260px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Decorative large quote mark */}
          <div
            aria-hidden="true"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "14rem",
              lineHeight: 1,
              color: "rgba(255,255,255,0.04)",
              position: "absolute",
              top: "-2rem",
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 0,
            }}
          >
            "
          </div>

          <div
            key={active}
            style={{
              animation: "fadeIn 0.45s ease forwards",
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <blockquote
              style={{
                fontFamily: "'Lato', sans-serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1.25rem, 2.2vw, 1.9rem)",
                lineHeight: 1.55,
                letterSpacing: "-0.01em",
                color: "white",
                maxWidth: "38ch",
                marginBottom: "2.5rem",
                textAlign: "center",
              }}
            >
              "{t.quote}"
            </blockquote>

            {/* Author */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {/* Avatar initials */}
              <div
                style={{
                  width: "2.75rem",
                  height: "2.75rem",
                  backgroundColor: "#DB5C34",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginBottom: "0.25rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "white",
                  }}
                >
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "white",
                }}
              >
                {t.name}
              </div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {t.role} — {t.company}
              </div>
            </div>
          </div>
        </div>

        {/* Dot navigation — centrado */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "3rem",
            marginBottom: "4rem",
          }}
        >
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAuto(false); setActive(i); }}
              style={{
                width: i === active ? "2rem" : "0.5rem",
                height: "0.5rem",
                backgroundColor: i === active ? "#DB5C34" : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>


      </div>

      <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />
    </section>
  );
}
