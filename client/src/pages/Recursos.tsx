/*
 * TEAM 24 — Página de Recursos
 * Usa apenas os recursos publicados no backoffice (tRPC).
 * Estilo editorial consistente com o resto do site.
 */

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import SEO, { ORGANIZATION_LD, breadcrumbLD } from "@/components/SEO";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type TipoRecurso = "ebook" | "ferramenta";

const TIPO_LABELS: Record<TipoRecurso, string> = {
  ebook: "E-book",
  ferramenta: "Ferramenta",
};

const TIPO_ICONS: Record<TipoRecurso, string> = {
  ebook: "📖",
  ferramenta: "🔧",
};

const TIPO_CTAS: Record<TipoRecurso, string> = {
  ebook: "Download Gratuito",
  ferramenta: "Usar Ferramenta",
};

const TIPOS_FILTRO = ["Todos", "ebook", "ferramenta"] as const;
type FiltroTipo = (typeof TIPOS_FILTRO)[number];

// ─── MODAL DE LEAD ────────────────────────────────────────────────────────────

function LeadModal({
  titulo,
  tipo,
  onClose,
}: {
  titulo: string;
  tipo: TipoRecurso;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ nome: "", email: "", empresa: "" });
  const [submitted, setSubmitted] = useState(false);

  const ebookMutation = trpc.forms.ebook.useMutation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await ebookMutation.mutateAsync({
      name: form.nome,
      email: form.email,
      company: form.empresa || undefined,
      ebook_title: `${titulo} (${tipo})`,
    });
    setSubmitted(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #D0E2EC",
          borderRadius: "4px",
          padding: "2.5rem",
          maxWidth: "480px",
          width: "100%",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: "rgba(0,0,0,0.3)",
            fontSize: "1.25rem",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {!submitted ? (
          <>
            <div style={{ marginBottom: "0.5rem" }}>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#DB5C34",
                }}
              >
                {TIPO_ICONS[tipo]} {TIPO_LABELS[tipo]}
              </span>
            </div>
            <h3
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#0A1A2A",
                margin: "0 0 0.5rem",
                lineHeight: 1.2,
              }}
            >
              {titulo}
            </h3>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.875rem",
                color: "#6B7280",
                margin: "0 0 2rem",
                lineHeight: 1.6,
              }}
            >
              Preencha os seus dados para aceder gratuitamente a este recurso.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {[
                { key: "nome", label: "Nome completo", type: "text", placeholder: "O seu nome" },
                {
                  key: "email",
                  label: "Email profissional",
                  type: "email",
                  placeholder: "email@empresa.pt",
                },
                { key: "empresa", label: "Empresa", type: "text", placeholder: "Nome da empresa" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#6B7280",
                      marginBottom: "0.4rem",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={{
                      width: "100%",
                      background: "#F8FAFB",
                      border: "1px solid #D0E2EC",
                      borderRadius: "2px",
                      padding: "0.75rem 1rem",
                      color: "#0A1A2A",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={ebookMutation.isPending}
                style={{
                  background: ebookMutation.isPending ? "#c0a090" : "#DB5C34",
                  border: "none",
                  color: "white",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  padding: "0.9rem",
                  cursor: ebookMutation.isPending ? "not-allowed" : "pointer",
                  borderRadius: "2px",
                  marginTop: "0.5rem",
                  letterSpacing: "0.04em",
                  opacity: ebookMutation.isPending ? 0.7 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {ebookMutation.isPending ? "A enviar..." : "Aceder ao Recurso →"}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <h3
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "1.5rem",
                color: "#0A1A2A",
                margin: "0 0 0.75rem",
              }}
            >
              Recurso enviado!
            </h3>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.9rem",
                color: "#6B7280",
                lineHeight: 1.6,
                margin: "0 0 2rem",
              }}
            >
              Verifique o seu email. O recurso{" "}
              <strong style={{ color: "#0A1A2A" }}>{titulo}</strong> foi enviado para a sua caixa de
              entrada.
            </p>
            <button
              onClick={onClose}
              style={{
                background: "#F8FAFB",
                border: "1px solid #D0E2EC",
                color: "#0A1A2A",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                fontSize: "0.875rem",
                padding: "0.75rem 2rem",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

function ResourceCard({
  recurso,
  onCta,
}: {
  recurso: {
    id: number;
    titulo: string;
    descricao: string | null;
    tipo: TipoRecurso;
    tema: string | null;
    imageUrl: string | null;
    isPremium: boolean;
    isNovo: boolean;
  };
  onCta: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const defaultImage = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        border: `1px solid ${hovered ? "rgba(219,92,52,0.4)" : "#E5EEF4"}`,
        borderRadius: "4px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 40px rgba(37,116,159,0.12)"
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", paddingBottom: "56.25%", overflow: "hidden" }}>
        <img
          src={recurso.imageUrl || defaultImage}
          alt={recurso.titulo}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(8,16,28,0.8) 0%, transparent 60%)",
          }}
        />
        {/* Badges topo */}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            left: "0.75rem",
            display: "flex",
            gap: "0.4rem",
          }}
        >
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "white",
              background: "rgba(8,16,28,0.8)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "0.25rem 0.6rem",
              borderRadius: "2px",
            }}
          >
            {TIPO_ICONS[recurso.tipo]} {TIPO_LABELS[recurso.tipo]}
          </span>
          {recurso.isPremium && (
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#F5C842",
                background: "rgba(245,200,66,0.15)",
                border: "1px solid rgba(245,200,66,0.3)",
                padding: "0.25rem 0.6rem",
                borderRadius: "2px",
              }}
            >
              🔒 Premium
            </span>
          )}
          {recurso.isNovo && !recurso.isPremium && (
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#4ADE80",
                background: "rgba(74,222,128,0.15)",
                border: "1px solid rgba(74,222,128,0.3)",
                padding: "0.25rem 0.6rem",
                borderRadius: "2px",
              }}
            >
              ✨ Novo
            </span>
          )}
        </div>
        {/* Tema tag fundo */}
        {recurso.tema && (
          <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem" }}>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#DB5C34",
                background: "rgba(219,92,52,0.15)",
                border: "1px solid rgba(219,92,52,0.25)",
                padding: "0.2rem 0.55rem",
                borderRadius: "2px",
              }}
            >
              {recurso.tema}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}
      >
        <h3
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#0A1A2A",
            margin: "0 0 0.6rem",
            lineHeight: 1.35,
            flex: 1,
          }}
        >
          {recurso.titulo}
        </h3>
        {recurso.descricao && (
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.8rem",
              color: "#6B7280",
              lineHeight: 1.6,
              margin: "0 0 1rem",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {recurso.descricao}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            borderTop: "1px solid #E5EEF4",
            paddingTop: "0.85rem",
          }}
        >
          <button
            onClick={onCta}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
              color: "#DB5C34",
              background: "none",
              border: "1px solid rgba(219,92,52,0.4)",
              padding: "0.4rem 0.9rem",
              cursor: "pointer",
              borderRadius: "2px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#DB5C34";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#DB5C34";
            }}
          >
            {TIPO_CTAS[recurso.tipo]} →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function Recursos() {
  const [leadRecurso, setLeadRecurso] = useState<{
    titulo: string;
    tipo: TipoRecurso;
  } | null>(null);

  const { data: dbRecursos = [], isLoading } = trpc.backoffice.recursos.listPublic.useQuery();

  return (
    <>
      <Navbar />
      <SEO
        title="Recursos Gratuitos | E-books e Ferramentas de Bem-estar | TEAM 24"
        description="Descarregue gratuitamente e-books, guias e ferramentas de bem-estar organizacional da TEAM 24. Recursos práticos para RH, gestores e colaboradores sobre saúde mental no trabalho."
        keywords="recursos saúde mental empresas, ebooks bem-estar, guias RH, ferramentas bem-estar organizacional"
        canonicalPath="/recursos"
        noIndex={true}
        jsonLd={[ORGANIZATION_LD, breadcrumbLD([{ name: "Início", path: "/" }, { name: "Recursos", path: "/recursos" }])]}
      />
      <div
        style={{
          minHeight: "100vh",
          background: "#F8FAFB",
          color: "#0A1A2A",
          paddingTop: "72px",
        }}
      >
        {/* ── HERO ── */}
        <section
          style={{
            padding: "3.5rem 0 2.5rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "800px",
              height: "400px",
              background:
                "radial-gradient(ellipse at center, rgba(37,116,159,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              padding: "0 1.5rem",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#DB5C34",
                background: "rgba(219,92,52,0.08)",
                border: "1px solid rgba(219,92,52,0.2)",
                padding: "0.35rem 0.9rem",
                borderRadius: "2px",
                marginBottom: "1.25rem",
              }}
            >
              📚 Centro de Conhecimento
            </div>

            <h1
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4vw, 2.75rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#0A1A2A",
                margin: "0 0 0.75rem",
              }}
            >
              Recursos para Transformar
              <br />
              <em style={{ color: "#DB5C34", fontStyle: "italic" }}>o Bem-Estar</em> da Sua Empresa
            </h1>

            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "#6B7280",
                margin: "0 0 2rem",
                maxWidth: "55ch",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              E-books e ferramentas de diagnóstico para líderes de RH que querem construir o futuro do trabalho.
            </p>


          </div>
        </section>

        {/* ── GRID ── */}
        <section
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1.5rem 4rem" }}
        >

          {/* Grid */}
          {isLoading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                gap: "1rem",
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    border: "1px solid #E5EEF4",
                    borderRadius: "4px",
                    height: "340px",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : dbRecursos.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                gap: "1rem",
              }}
            >
              {dbRecursos.map((r: any) => (
                <ResourceCard
                  key={r.id}
                  recurso={r}
                  onCta={() => setLeadRecurso({ titulo: r.titulo, tipo: r.tipo as TipoRecurso })}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 0",
                color: "#9CA3AF",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
              <p
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: "1.25rem",
                  color: "#0A1A2A",
                  marginBottom: "0.5rem",
                }}
              >
                Nenhum recurso encontrado.
              </p>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.9rem",
                  color: "#6B7280",
                  marginBottom: "1.5rem",
                }}
              >
                Os recursos serão publicados em breve. Subscreva a newsletter para ser notificado.
              </p>
            </div>
          )}
        </section>

        {/* ── NEWSLETTER ── */}
        <section
          style={{
            background: "#EEF5FA",
            borderTop: "1px solid #D0E2EC",
            padding: "3.5rem 1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#DB5C34",
                marginBottom: "1rem",
              }}
            >
              Newsletter Mensal
            </div>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 700,
                color: "#0A1A2A",
                margin: "0 0 0.75rem",
                letterSpacing: "-0.02em",
              }}
            >
              Receba os Melhores Recursos
              <br />
              no Seu Email
            </h2>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.9rem",
                color: "#6B7280",
                margin: "0 0 2rem",
                lineHeight: 1.6,
              }}
            >
              Junte-se a mais de 2.000 profissionais de RH que recebem insights exclusivos sobre
              bem-estar corporativo.
            </p>
            <NewsletterForm />
          </div>
        </section>

        {/* ── LEAD MODAL ── */}
        {leadRecurso && (
          <LeadModal
            titulo={leadRecurso.titulo}
            tipo={leadRecurso.tipo}
            onClose={() => setLeadRecurso(null)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div
        style={{
          background: "rgba(74,222,128,0.1)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: "4px",
          padding: "1.25rem",
          color: "#166534",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.9rem",
        }}
      >
        ✅ Subscrito com sucesso! Bem-vindo à nossa newsletter.
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await fetch("/api/trpc/forms.newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json: { email } }),
        });
        setDone(true);
      }}
      style={{ display: "flex", gap: "0.75rem", maxWidth: "440px", margin: "0 auto" }}
    >
      <input
        type="email"
        required
        placeholder="email@empresa.pt"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          flex: 1,
          background: "white",
          border: "1px solid #D0E2EC",
          borderRadius: "2px",
          padding: "0.85rem 1rem",
          color: "#0A1A2A",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.9rem",
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          background: "#DB5C34",
          border: "none",
          color: "white",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "0.85rem 1.5rem",
          cursor: "pointer",
          borderRadius: "2px",
          whiteSpace: "nowrap",
        }}
      >
        Subscrever
      </button>
    </form>
  );
}
