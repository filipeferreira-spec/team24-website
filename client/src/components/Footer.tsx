/* ============================================================
   TEAM 24 — Footer v2: Editorial Clarity
   Design: Clean dark footer. No cards, no shadows.
   Horizontal navigation columns. Minimal social icons.
   ============================================================ */

import { Linkedin, Facebook, Instagram } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import LogoTeam24 from "./LogoTeam24";

const footerLinks = {
  Empresa: [
    { label: "Quem Somos", href: "/quem-somos" },
    { label: "Parceiros", href: "/parceiros" },
    { label: "Imprensa", href: "/imprensa" },
    { label: "Carreiras", href: "/carreiras" },
  ],
  Recursos: [
    { label: "Blog", href: "/blog" },
    { label: "Ebooks Gratuitos", href: "/ebooks" },
    { label: "Casos de Sucesso", href: "/casos" },
    { label: "Suporte", href: "/suporte" },
    { label: "Agendar Reunião", href: "/agendar" },
  ],
  // Nota: /recursos removido da navegação pública
  "Artigos de Opinião": [
    { label: "Artigos de Opinião", href: "/opiniao" },
  ],
};

export default function Footer() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const scrollTo = (href: string) => {
    if (href.startsWith("#")) {
      const el = document.getElementById(href.replace("#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer style={{ backgroundColor: "var(--ink)" }}>
      <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.12)" }} />

      {/* Main footer */}
      <div className="container">
        <div
          style={{
            paddingTop: isDesktop ? "4rem" : "2.5rem",
            paddingBottom: isDesktop ? "3rem" : "2rem",
            display: "grid",
            gridTemplateColumns: isDesktop ? "1.5fr 1fr 1fr 1fr" : "1fr",
            gap: isDesktop ? "3rem" : "1.75rem",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <LogoTeam24 height={52} white />
            </div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.85rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.7)",
                maxWidth: "28ch",
                marginBottom: "1.5rem",
              }}
            >
              A plataforma de saúde mental para empresas que colocam as pessoas em primeiro lugar.
            </p>
            {/* Phone */}
            <a
              href="tel:+351220981284"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "white",
                textDecoration: "none",
                marginBottom: "0.35rem",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--coral)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              +351 220 981 284
            </a>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              Seg – Sex, 9h–18h
            </div>

            {/* Social */}
            <div style={{ display: "flex", gap: "1rem" }}>
              {[
                { Icon: Linkedin, href: "https://www.linkedin.com/company/team24eap", label: "LinkedIn da TEAM 24" },
                { Icon: Facebook, href: "https://www.facebook.com/MyTeam24EAP", label: "Facebook da TEAM 24" },
                { Icon: Instagram, href: "https://www.instagram.com/team24eap/", label: "Instagram da TEAM 24" },
            ].map(({ Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="t24-social-link"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <style>{`
              .t24-social-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                border-radius: 8px;
                color: rgba(255,255,255,0.55) !important;
                background: rgba(255,255,255,0.07);
                border: 1px solid rgba(255,255,255,0.12);
                transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, transform 0.18s cubic-bezier(0.23,1,0.32,1);
                text-decoration: none;
              }
              .t24-social-link:hover {
                color: #fff !important;
                background: rgba(249,115,22,0.2) !important;
                border-color: rgba(249,115,22,0.5) !important;
                transform: translateY(-3px);
              }
            `}</style>
          </div>

          {/* Link columns — em mobile ficam em grid 3 colunas */}
          {!isDesktop && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "0.75rem" }}>{category}</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {isDesktop && Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "1.25rem",
                }}
              >
                {category}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.7)",
                          textDecoration: "none",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "white")}
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        onClick={(e) => {
                          if (link.href.startsWith("#")) {
                            e.preventDefault();
                            scrollTo(link.href);
                          }
                        }}
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.7)",
                          textDecoration: "none",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar — em mobile empilhado */}
      <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.12)" }} />
      <div className="container">
        <div
          style={{
            paddingTop: "1.25rem",
            paddingBottom: "1.25rem",
            display: "flex",
            flexDirection: isDesktop ? "row" : "column",
            alignItems: isDesktop ? "center" : "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: isDesktop ? "1rem" : "0.75rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              © 2026 TEAM 24, S.A. · NIF 516 883 194 · Todos os direitos reservados.
            </span>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.55)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              Entidade registada na ERS — Entidade Reguladora da Saúde · Registo n.º e161272
              <a
                href="/media/CertificadoERS2026_b4dc9d61.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="CertificadoERS2026.pdf"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.68rem",
                  color: "rgba(219,92,52,0.85)",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(219,92,52,0.4)",
                  paddingBottom: "1px",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.color = "rgba(219,92,52,1)";
                  e.currentTarget.style.borderColor = "rgba(219,92,52,0.8)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.color = "rgba(219,92,52,0.85)";
                  e.currentTarget.style.borderColor = "rgba(219,92,52,0.4)";
                }}
              >
                Download Certificado
              </a>
            </span>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/aviso-legal"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              Termos de Serviço
            </Link>
            <a
              href="https://www.livroreclamacoes.pt"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                transition: "color 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              📕 Livro de Reclamações
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
