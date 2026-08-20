import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function BackofficeLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  const loginMutation = trpc.backoffice.login.useMutation({
    onSuccess: () => {
      navigate("/backoffice");
    },
    onError: (err) => {
      setError(err.message || "Credenciais inválidas.");
    },
  });

  const seedMutation = trpc.backoffice.seedAdmin.useMutation({
    onSuccess: () => {
      setSetupDone(true);
      setShowSetup(false);
      setError("");
    },
    onError: (err) => {
      setError(err.message || "Erro ao criar administrador.");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ username, password });
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    seedMutation.mutate({ username, password, nome: username });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.95rem",
    color: "#0A1A2A",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1.5px solid #D0E2EC",
    padding: "0.75rem 0",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A1A2A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "#DB5C34",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "white",
              letterSpacing: "-0.02em",
            }}>T</div>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "white",
              letterSpacing: "-0.02em",
            }}>TEAM 24</span>
          </div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            marginTop: "0.5rem",
          }}>Backoffice</div>
        </div>

        {/* Card */}
        <div style={{
          background: "white",
          padding: "2.5rem",
        }}>
          {setupDone && (
            <div style={{
              background: "#E8F5E9",
              border: "1px solid #A5D6A7",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.85rem",
              color: "#2E7D32",
            }}>
              Administrador criado com sucesso. Pode agora fazer login.
            </div>
          )}

          <div style={{ marginBottom: "0.5rem" }}>
            <div style={{
              borderLeft: "3px solid #DB5C34",
              paddingLeft: "0.75rem",
              marginBottom: "1.75rem",
            }}>
              <h1 style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "1.6rem",
                color: "#0A1A2A",
                margin: 0,
                letterSpacing: "-0.02em",
              }}>{showSetup ? "Configuração inicial" : "Acesso restrito"}</h1>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.82rem",
                color: "#6B7280",
                margin: "0.35rem 0 0",
              }}>
                {showSetup
                  ? "Crie o primeiro administrador do backoffice."
                  : "Introduza as suas credenciais para aceder ao painel."}
              </p>
            </div>
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.85rem",
              color: "#DC2626",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={showSetup ? handleSetup : handleLogin}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#9CA3AF",
                marginBottom: "0.5rem",
              }}>Utilizador</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderBottomColor = "#25749F"; }}
                onBlur={(e) => { e.target.style.borderBottomColor = "#D0E2EC"; }}
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{
                display: "block",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#9CA3AF",
                marginBottom: "0.5rem",
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderBottomColor = "#25749F"; }}
                onBlur={(e) => { e.target.style.borderBottomColor = "#D0E2EC"; }}
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending || seedMutation.isPending}
              style={{
                width: "100%",
                background: "#DB5C34",
                color: "white",
                border: "none",
                padding: "0.9rem 1.5rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                opacity: (loginMutation.isPending || seedMutation.isPending) ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {loginMutation.isPending || seedMutation.isPending
                ? "A processar..."
                : showSetup ? "Criar Administrador" : "Entrar"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              onClick={() => { setShowSetup(!showSetup); setError(""); }}
              style={{
                background: "none",
                border: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.78rem",
                color: "#9CA3AF",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {showSetup ? "Já tenho conta — fazer login" : "Primeiro acesso? Criar administrador"}
            </button>
          </div>
        </div>

        <div style={{
          textAlign: "center",
          marginTop: "1.5rem",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.72rem",
          color: "rgba(255,255,255,0.2)",
        }}>
          © 2025 TEAM 24 — Área restrita
        </div>
      </div>
    </div>
  );
}
