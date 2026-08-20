/* ============================================================
   TEAM 24 — Navbar v6: Menu dropdown "Serviços"
   Tudo com estilos inline + isDesktop hook para responsividade.
   Cores: #25749F + #DB5C34
   ============================================================ */

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import LogoTeam24 from "./LogoTeam24";
import { trackAgendarClick } from "@/lib/analytics";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/";
  const isTransparent = isHome && !isScrolled;
  const isServicosActive = location.startsWith("/servicos");

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      if (!isHome) {
        setIsScrolled(scrollY > 40);
      } else {
        setIsScrolled(scrollY > vh * 0.75);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Fechar menu mobile ao mudar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isContactPage = location === "/contacto";

  const linkStyle = (active: boolean) => ({
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: active ? 600 : 500,
    fontSize: "0.8rem",
    color: active ? "#DB5C34" : (isTransparent ? "rgba(255,255,255,0.9)" : "#0A1A2A"),
    cursor: "pointer",
    transition: "color 0.15s",
    letterSpacing: "0.01em",
    textDecoration: "none",
  });

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1000,
        backgroundColor: isTransparent ? "rgba(0,0,0,0.15)" : "white",
        backdropFilter: isTransparent ? "blur(4px)" : "none",
        borderBottom: isTransparent ? "none" : "1px solid #D0E2EC",
        boxShadow: isScrolled ? "0 2px 20px rgba(37,116,159,0.08)" : "none",
        transition: "background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.3s ease",
      }}
    >
      {/* Inner bar */}
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          paddingLeft: "clamp(1.5rem, 4vw, 4rem)",
          paddingRight: "clamp(1.5rem, 4vw, 4rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* ── Logo ── */}
        <Link href="/">
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0, textDecoration: "none" }}>
            <LogoTeam24 height={52} />
          </div>
        </Link>

        {/* ── Desktop Nav Links ── */}
        {isDesktop && (
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <Link href="/quem-somos">
              <span
                style={linkStyle(location.startsWith("/quem-somos"))}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#DB5C34")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = location.startsWith("/quem-somos") ? "#DB5C34" : (isTransparent ? "rgba(255,255,255,0.9)" : "#0A1A2A"))}
              >
                Quem Somos
              </span>
            </Link>
            <Link href="/plataforma">
              <span
                style={linkStyle(location.startsWith("/plataforma"))}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#DB5C34")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = location.startsWith("/plataforma") ? "#DB5C34" : (isTransparent ? "rgba(255,255,255,0.9)" : "#0A1A2A"))}
              >
                Plataforma
              </span>
            </Link>

            <Link href="/servicos">
              <span
                style={linkStyle(isServicosActive)}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#DB5C34")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = isServicosActive ? "#DB5C34" : (isTransparent ? "rgba(255,255,255,0.9)" : "#0A1A2A"))}
              >
                Serviços
              </span>
            </Link>
            <Link href="/casos">
              <span
                style={linkStyle(location.startsWith("/casos"))}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#DB5C34")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = location.startsWith("/casos") ? "#DB5C34" : (isTransparent ? "rgba(255,255,255,0.9)" : "#0A1A2A"))}
              >
                Casos de Sucesso
              </span>
            </Link>
            <Link href="/roi">
              <span
                style={linkStyle(location.startsWith("/roi"))}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#DB5C34")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = location.startsWith("/roi") ? "#DB5C34" : (isTransparent ? "rgba(255,255,255,0.9)" : "#0A1A2A"))}
              >
                ROI EAP
              </span>
            </Link>
            <Link href="/contacto">
              <span
                style={linkStyle(location.startsWith("/contacto"))}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#DB5C34")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = location.startsWith("/contacto") ? "#DB5C34" : (isTransparent ? "rgba(255,255,255,0.9)" : "#0A1A2A"))}
              >
                Contactos
              </span>
            </Link>

          </div>
        )}
        {/* ── Desktop CTAs ── */}
        {isDesktop && (
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>

            <Link href="/agendar">
              <button
                onClick={() => trackAgendarClick("navbar_desktop")}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "white",
                  backgroundColor: "#DB5C34",
                  border: "none",
                  padding: "0.65rem 1.6rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s, transform 0.15s",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#B84520";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#DB5C34";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Agendar Reunião
              </button>
            </Link>
          </div>
        )}

        {/* ── Mobile CTAs + Hamburger ── */}
        {!isDesktop && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/agendar">
              <button
                onClick={() => trackAgendarClick("navbar_mobile")}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  color: "white",
                  backgroundColor: "#DB5C34",
                  border: "none",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                Agendar Reunião
              </button>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              style={{
                color: isTransparent ? "white" : "#0A1A2A",
                background: "none",
                border: "none",
                padding: "0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mobileOpen ? <X size={22} color={isTransparent ? "white" : "#0A1A2A"} /> : <Menu size={22} color={isTransparent ? "white" : "#0A1A2A"} />}
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && !isDesktop && (
        <div style={{ backgroundColor: "white", borderTop: "1px solid #D0E2EC" }}>
          <div
            style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "1.25rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0rem",
            }}
          >
            <Link href="/quem-somos">
              <span style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: "1rem", color: location.startsWith("/quem-somos") ? "#DB5C34" : "#0A1A2A", cursor: "pointer", textDecoration: "none", padding: "0.85rem 0", borderBottom: "1px solid #F0F5F8" }} onClick={() => setMobileOpen(false)}>
                Quem Somos
              </span>
            </Link>
            <Link href="/plataforma">
              <span style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: "1rem", color: location.startsWith("/plataforma") ? "#DB5C34" : "#0A1A2A", cursor: "pointer", textDecoration: "none", padding: "0.85rem 0", borderBottom: "1px solid #F0F5F8" }} onClick={() => setMobileOpen(false)}>
                Plataforma
              </span>
            </Link>

            <Link href="/servicos">
              <span style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: "1rem", color: isServicosActive ? "#DB5C34" : "#0A1A2A", cursor: "pointer", textDecoration: "none", padding: "0.85rem 0", borderBottom: "1px solid #F0F5F8" }} onClick={() => setMobileOpen(false)}>
                Serviços
              </span>
            </Link>

            <Link href="/casos">
              <span style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: "1rem", color: location.startsWith("/casos") ? "#DB5C34" : "#0A1A2A", cursor: "pointer", textDecoration: "none", padding: "0.85rem 0", borderBottom: "1px solid #F0F5F8" }} onClick={() => setMobileOpen(false)}>
                Casos de Sucesso
              </span>
            </Link>
            <Link href="/roi">
              <span style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: "1rem", color: location.startsWith("/roi") ? "#DB5C34" : "#0A1A2A", cursor: "pointer", textDecoration: "none", padding: "0.85rem 0", borderBottom: "1px solid #F0F5F8" }} onClick={() => setMobileOpen(false)}>
                ROI EAP
              </span>
            </Link>
            <Link href="/contacto">
              <span style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: "1rem", color: location.startsWith("/contacto") ? "#DB5C34" : "#0A1A2A", cursor: "pointer", textDecoration: "none", padding: "0.85rem 0", borderBottom: "1px solid #F0F5F8" }} onClick={() => setMobileOpen(false)}>
                Contactos
              </span>
            </Link>

            <div style={{ height: "1px", backgroundColor: "#D0E2EC", margin: "0.5rem 0" }} />
            <Link href="/agendar">
              <button
                onClick={() => trackAgendarClick("navbar_mobile_menu")}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "white",
                  backgroundColor: "#DB5C34",
                  border: "none",
                  padding: "1rem 2rem",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "center",
                  marginTop: "0.25rem",
                }}
              >
                Agendar Reunião Gratuita
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
