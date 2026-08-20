/* ============================================================
   TEAM 24 — Página da Equipa
   Design: Editorial Clarity — grid assimétrico, sem cards com sombra
   Cores: teal #25749F + coral #DB5C34 sobre fundo claro #F5F8FA
   ============================================================ */

import { useState, useEffect } from "react";
import { Linkedin } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { ORGANIZATION_LD, serviceLD, breadcrumbLD } from "@/components/SEO";

const team = [
  {
    name: "Ana Ruivo",
    role: "CEO & Co-Fundadora",
    bio: "Psicóloga clínica com 15 anos de experiência em saúde organizacional. Antes da TEAM 24, foi diretora de bem-estar na Randstad Portugal e investigadora no ISCTE. Acredita que a saúde mental é o maior ativo de qualquer empresa.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop&q=80",
    linkedin: "https://linkedin.com",
    featured: true,
  },
  {
    name: "Miguel Santos",
    role: "CTO & Co-Fundador",
    bio: "Engenheiro de software com passagem pela Feedzai e Unbabel. Especialista em plataformas de saúde digital e privacidade de dados. Lidera a equipa de tecnologia com foco em segurança e experiência de utilizador.",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=700&fit=crop&q=80",
    linkedin: "https://linkedin.com",
    featured: false,
  },
  {
    name: "Inês Carvalho",
    role: "COO & Co-Fundadora",
    bio: "MBA pelo INSEAD, com experiência em operações na Farfetch e McKinsey. Responsável pela estratégia de crescimento e parcerias empresariais. Transformou a TEAM 24 de startup a empresa com presença em 5 países ibero-americanos.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=700&fit=crop&q=80",
    linkedin: "https://linkedin.com",
    featured: false,
  },
  {
    name: "Dr. Rui Fonseca",
    role: "Chief Clinical Officer",
    bio: "Psiquiatra e investigador na Faculdade de Medicina de Lisboa. Coordena a rede clínica da TEAM 24 e garante a qualidade e ética de todos os protocolos terapêuticos. Autor de 3 livros sobre saúde mental no trabalho.",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=700&fit=crop&q=80",
    linkedin: "https://linkedin.com",
    featured: false,
  },
  {
    name: "Sara Mendes",
    role: "Head of Product",
    bio: "Designer de produto com experiência na Farfetch e Prozis. Lidera o design e desenvolvimento da app TEAM 24, com foco em acessibilidade e redução do estigma em torno da saúde mental.",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=700&fit=crop&q=80",
    linkedin: "https://linkedin.com",
    featured: false,
  },
  {
    name: "João Ferreira",
    role: "Head of Sales",
    bio: "Comercial com 10 anos em SaaS B2B. Antes da TEAM 24, liderou equipas de vendas na Salesforce e HubSpot Portugal. Construiu a carteira de 200+ empresas parceiras a partir do zero.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop&q=80",
    linkedin: "https://linkedin.com",
    featured: false,
  },
  {
    name: "Catarina Lopes",
    role: "Head of Marketing",
    bio: "Especialista em marketing digital e brand strategy. Antes da TEAM 24, liderou campanhas de awareness para marcas de saúde e bem-estar em Portugal e Espanha. Responsável por triplicar o inbound em 18 meses.",
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=700&fit=crop&q=80",
    linkedin: "https://linkedin.com",
    featured: false,
  },
  {
    name: "Pedro Alves",
    role: "Head of Customer Success",
    bio: "Psicólogo organizacional com foco em implementação e adoção de plataformas de bem-estar. Garante que cada empresa parceira retira o máximo valor da TEAM 24 desde o primeiro dia.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=700&fit=crop&q=80",
    linkedin: "https://linkedin.com",
    featured: false,
  },
];

const advisors = [
  { name: "Prof. António Damásio", role: "Conselheiro Científico", org: "University of Southern California" },
  { name: "Dra. Helena Costa", role: "Conselheira Clínica", org: "Ordem dos Psicólogos Portugueses" },
  { name: "Pedro Rocha", role: "Conselheiro de Negócio", org: "Ex-CEO Randstad Portugal" },
  { name: "Catarina Fonseca", role: "Conselheira de Investimento", org: "Armilar Venture Partners" },
];

const values = [
  { label: "Empatia", desc: "Cada decisão começa pela experiência humana." },
  { label: "Rigor", desc: "Ciência e evidência clínica em tudo o que fazemos." },
  { label: "Impacto", desc: "Medimos o que fazemos. Melhoramos sempre." },
  { label: "Confiança", desc: "Privacidade e ética são inegociáveis." },
];

export default function Equipa() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const featured = team.find((m) => m.featured);
  const rest = team.filter((m) => !m.featured);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F8FA" }}>
      <Navbar />

      <SEO
        title="A Nossa Equipa | Especialistas em Saúde Mental | TEAM 24"
        description="Conheça a equipa de psicólogos, coaches e especialistas da TEAM 24. Profissionais certificados dedicados ao bem-estar dos colaboradores das empresas portuguesas."
        keywords="equipa TEAM 24, psicólogos empresariais, especialistas saúde mental, coaches bem-estar"
        canonicalPath="/equipa"
        jsonLd={[ORGANIZATION_LD, breadcrumbLD([{ name: "Início", path: "/" }, { name: "Equipa", path: "/equipa" }])]}
      />
      {/* ── Hero Header ── */}
      <div style={{ backgroundColor: "#0A1A2A", paddingTop: "5rem", paddingBottom: "3.5rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#DB5C34",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ display: "inline-block", width: "2rem", height: "2px", backgroundColor: "#DB5C34" }} />
            A Nossa Equipa
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
              gap: "3rem",
              alignItems: "end",
            }}
          >
            <h1
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(3rem, 6vw, 6rem)",
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
                color: "white",
                margin: 0,
              }}
            >
              As pessoas<br />
              por trás da<br />
              <em style={{ color: "#DB5C34" }}>missão.</em>
            </h1>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "1.1rem",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.65)",
                margin: 0,
                maxWidth: "45ch",
              }}
            >
              Uma equipa multidisciplinar de psicólogos, engenheiros, designers e especialistas em negócio, unidos pela convicção de que a saúde mental transforma empresas e vidas.
            </p>
          </div>

          {/* Stats strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
              gap: "2rem",
              marginTop: "3.5rem",
              paddingTop: "3rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              { v: "28", l: "Pessoas na equipa" },
              { v: "12", l: "Psicólogos clínicos" },
              { v: "5", l: "Países com presença" },
              { v: "2019", l: "Fundada em Lisboa" },
            ].map((s) => (
              <div key={s.l}>
                <div
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: "2.25rem",
                    color: "#DB5C34",
                    letterSpacing: "-0.03em",
                    marginBottom: "0.35rem",
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Founder ── */}
      {featured && (
        <div style={{ backgroundColor: "white", borderBottom: "1px solid #D0E2EC" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "1fr 1.5fr" : "1fr",
                gap: isDesktop ? "5rem" : "2.5rem",
                alignItems: "center",
                padding: "5rem 0",
              }}
            >
              {/* Photo */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    left: "1.5rem",
                    right: "-1.5rem",
                    bottom: "-1.5rem",
                    backgroundColor: "#DB5C34",
                    opacity: 0.12,
                    borderRadius: "2px",
                  }}
                />
                <img
                  src={featured.photo}
                  alt={featured.name}
                  style={{
                    width: "100%",
                    maxWidth: "420px",
                    aspectRatio: "3/4",
                    objectFit: "cover",
                    display: "block",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              </div>

              {/* Bio */}
              <div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#DB5C34",
                    marginBottom: "1.25rem",
                  }}
                >
                  Fundadora
                </div>
                <h2
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                    letterSpacing: "-0.03em",
                    color: "#0A1A2A",
                    margin: "0 0 0.5rem 0",
                    lineHeight: 1.05,
                  }}
                >
                  {featured.name}
                </h2>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#25749F",
                    marginBottom: "2rem",
                  }}
                >
                  {featured.role}
                </div>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "1.05rem",
                    lineHeight: 1.75,
                    color: "#3D5A6B",
                    margin: "0 0 2rem 0",
                    maxWidth: "50ch",
                  }}
                >
                  {featured.bio}
                </p>
                <blockquote
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontStyle: "italic",
                    fontSize: "1.15rem",
                    lineHeight: 1.55,
                    color: "#0A1A2A",
                    margin: "0 0 2rem 0",
                    borderLeft: "3px solid #DB5C34",
                    paddingLeft: "1.5rem",
                  }}
                >
                  "Em Portugal, 1 em cada 5 trabalhadores sofre de burnout. Existimos para mudar estes números — tornando o apoio psicológico tão normal como o seguro de saúde."
                </blockquote>
                <a
                  href={featured.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LinkedIn de ${featured.name}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#25749F",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#DB5C34")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#25749F")}
                >
                  <Linkedin size={16} />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rest of Team Grid ── */}
      <div style={{ backgroundColor: "#F5F8FA", padding: "5rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ marginBottom: "3.5rem" }}>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#6B8A9F",
                marginBottom: "0.75rem",
              }}
            >
              A Equipa de Liderança
            </div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.03em",
                color: "#0A1A2A",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Construídos para <em style={{ color: "#DB5C34" }}>impacto.</em>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
              gap: isDesktop ? "2.5rem" : "1.5rem",
            }}
          >
            {rest.map((member) => {
              const isHovered = hoveredMember === member.name;
              return (
                <div
                  key={member.name}
                  onMouseEnter={() => setHoveredMember(member.name)}
                  onMouseLeave={() => setHoveredMember(null)}
                  style={{ cursor: "default" }}
                >
                  {/* Photo */}
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <img
                      src={member.photo}
                      alt={member.name}
                      style={{
                        width: "100%",
                        aspectRatio: "3/4",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.4s ease",
                        transform: isHovered ? "scale(1.04)" : "scale(1)",
                      }}
                    />
                    {/* Overlay on hover */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "#0A1A2A",
                        opacity: isHovered ? 0.55 : 0,
                        transition: "opacity 0.3s ease",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: "1.25rem",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.78rem",
                          lineHeight: 1.6,
                          color: "rgba(255,255,255,0.9)",
                          margin: 0,
                        }}
                      >
                        {member.bio}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "#0A1A2A",
                          letterSpacing: "-0.01em",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {member.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#25749F",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {member.role}
                      </div>
                    </div>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn de ${member.name}`}
                      style={{
                        color: "rgba(0,0,0,0.2)",
                        transition: "color 0.15s",
                        flexShrink: 0,
                        marginTop: "0.1rem",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#25749F")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.2)")}
                    >
                      <Linkedin size={16} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Valores ── */}
      <div style={{ backgroundColor: "white", padding: "5rem 0", borderTop: "1px solid #D0E2EC", borderBottom: "1px solid #D0E2EC" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "1fr 2fr" : "1fr",
              gap: isDesktop ? "6rem" : "3rem",
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#6B8A9F",
                  marginBottom: "0.75rem",
                }}
              >
                O Que Nos Une
              </div>
              <h2
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  letterSpacing: "-0.03em",
                  color: "#0A1A2A",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Os nossos<br />
                <em style={{ color: "#DB5C34" }}>valores.</em>
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "repeat(2, 1fr)" : "1fr",
                gap: "2.5rem",
              }}
            >
              {values.map((v, i) => (
                <div key={v.label} style={{ borderTop: "2px solid #D0E2EC", paddingTop: "1.5rem" }}>
                  <div
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#DB5C34",
                      marginBottom: "0.5rem",
                    }}
                  >
                    0{i + 1}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.35rem",
                      color: "#0A1A2A",
                      letterSpacing: "-0.02em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {v.label}
                  </div>
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                      color: "#3D5A6B",
                      margin: 0,
                    }}
                  >
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Conselho Consultivo ── */}
      <div style={{ backgroundColor: "#F5F8FA", padding: "5rem 0" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(1.5rem, 4vw, 4rem)" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#6B8A9F",
                marginBottom: "0.75rem",
              }}
            >
              Conselho Consultivo
            </div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                letterSpacing: "-0.03em",
                color: "#0A1A2A",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Guiados pelos<br />
              <em style={{ color: "#DB5C34" }}>melhores.</em>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
              gap: "1px",
              backgroundColor: "#D0E2EC",
              border: "1px solid #D0E2EC",
            }}
          >
            {advisors.map((a) => (
              <div
                key={a.name}
                style={{
                  backgroundColor: "white",
                  padding: "2rem 1.75rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#0A1A2A",
                    letterSpacing: "-0.01em",
                    marginBottom: "0.35rem",
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#25749F",
                    marginBottom: "0.35rem",
                  }}
                >
                  {a.role}
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.72rem",
                    color: "#6B8A9F",
                  }}
                >
                  {a.org}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ backgroundColor: "#0A1A2A", padding: "5rem 0" }}>
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 clamp(1.5rem, 4vw, 4rem)",
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr auto" : "1fr",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#DB5C34",
                marginBottom: "1rem",
              }}
            >
              Junte-se à equipa
            </div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                letterSpacing: "-0.03em",
                color: "white",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Quer fazer parte desta<br />
              <em style={{ color: "#DB5C34" }}>missão?</em>
            </h2>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/carreiras"
              style={{
                display: "inline-block",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                backgroundColor: "#DB5C34",
                color: "white",
                padding: "0.9rem 2rem",
                textDecoration: "none",
                transition: "background-color 0.15s",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = "#c24e28")}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = "#DB5C34")}
            >
              Ver Vagas Abertas
            </Link>
            <Link
              href="/contacto"
              style={{
                display: "inline-block",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                backgroundColor: "transparent",
                color: "rgba(255,255,255,0.7)",
                padding: "0.9rem 2rem",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.15)",
                transition: "color 0.15s, border-color 0.15s",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}
            >
              Falar Connosco
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
