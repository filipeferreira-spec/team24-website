import { useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Gestao das contas de acesso ao backoffice.
 *
 * Ate aqui nao havia forma nenhuma de mudar uma palavra-passe: as contas eram
 * criadas uma vez e ficavam assim. Este ecra resolve isso.
 */

const caixa: React.CSSProperties = {
  background: "white",
  border: "1px solid #e6e8eb",
  borderRadius: 6,
  padding: "1.5rem",
  marginBottom: "1.5rem",
};

const campo: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  border: "1px solid #d4d8dd",
  borderRadius: 4,
  fontSize: "0.9rem",
  fontFamily: "inherit",
  marginTop: "0.3rem",
};

const rotulo: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#5c646d",
  marginBottom: "0.9rem",
};

const botao: React.CSSProperties = {
  background: "#DB5C34",
  color: "white",
  border: "none",
  borderRadius: 4,
  padding: "0.65rem 1.4rem",
  fontWeight: 700,
  fontSize: "0.85rem",
  cursor: "pointer",
};

function Aviso({ tipo, texto }: { tipo: "erro" | "ok"; texto: string }) {
  const cores = tipo === "erro"
    ? { fundo: "#fdecea", borda: "#f0b4ae", cor: "#9b2226" }
    : { fundo: "#e8f4ee", borda: "#a8d5bf", cor: "#1b6b52" };
  return (
    <div style={{
      background: cores.fundo, border: `1px solid ${cores.borda}`, color: cores.cor,
      borderRadius: 4, padding: "0.7rem 0.9rem", fontSize: "0.85rem", marginBottom: "1rem",
    }}>
      {texto}
    </div>
  );
}

export default function ContasSection() {
  const contas = trpc.backoffice.admins.list.useQuery();

  // ── mudar a minha palavra-passe ──────────────────────────────────────────
  const [actual, setActual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msgPass, setMsgPass] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);

  const alterar = trpc.backoffice.admins.alterarMinhaPassword.useMutation({
    onSuccess: () => {
      setMsgPass({ tipo: "ok", texto: "Palavra-passe alterada. Usa a nova da próxima vez que entrares." });
      setActual(""); setNova(""); setConfirmar("");
    },
    onError: e => setMsgPass({ tipo: "erro", texto: e.message }),
  });

  function submeterPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsgPass(null);
    if (nova !== confirmar) {
      setMsgPass({ tipo: "erro", texto: "As duas palavras-passe novas não coincidem." });
      return;
    }
    alterar.mutate({ passwordActual: actual, passwordNova: nova });
  }

  // ── criar conta ──────────────────────────────────────────────────────────
  const [novoUser, setNovoUser] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaPass, setNovaPass] = useState("");
  const [msgNova, setMsgNova] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);

  const criar = trpc.backoffice.admins.criar.useMutation({
    onSuccess: () => {
      setMsgNova({ tipo: "ok", texto: `Conta "${novoUser}" criada. Já podes entrar com ela.` });
      setNovoUser(""); setNovoNome(""); setNovoEmail(""); setNovaPass("");
      contas.refetch();
    },
    onError: e => setMsgNova({ tipo: "erro", texto: e.message }),
  });

  function submeterNova(e: React.FormEvent) {
    e.preventDefault();
    setMsgNova(null);
    criar.mutate({
      username: novoUser,
      password: novaPass,
      nome: novoNome || undefined,
      email: novoEmail || undefined,
      role: "superadmin",
    });
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <section style={caixa}>
        <label style={rotulo}>Mudar a minha palavra-passe</label>
        {msgPass && <Aviso tipo={msgPass.tipo} texto={msgPass.texto} />}
        <form onSubmit={submeterPassword} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#5c646d" }}>Palavra-passe actual</span>
            <input type="password" value={actual} onChange={e => setActual(e.target.value)}
              style={campo} required autoComplete="current-password" />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#5c646d" }}>Nova palavra-passe (mínimo 10 caracteres)</span>
            <input type="password" value={nova} onChange={e => setNova(e.target.value)}
              style={campo} required minLength={10} autoComplete="new-password" />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#5c646d" }}>Repetir a nova</span>
            <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
              style={campo} required minLength={10} autoComplete="new-password" />
          </div>
          <div>
            <button type="submit" style={botao} disabled={alterar.isPending}>
              {alterar.isPending ? "A alterar..." : "Alterar palavra-passe"}
            </button>
          </div>
        </form>
      </section>

      <section style={caixa}>
        <label style={rotulo}>Criar uma conta nova</label>
        {msgNova && <Aviso tipo={msgNova.tipo} texto={msgNova.texto} />}
        <form onSubmit={submeterNova} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#5c646d" }}>Utilizador (é isto que se escreve para entrar)</span>
            <input value={novoUser} onChange={e => setNovoUser(e.target.value)}
              style={campo} required minLength={3} autoComplete="off" />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#5c646d" }}>Nome (opcional)</span>
            <input value={novoNome} onChange={e => setNovoNome(e.target.value)} style={campo} autoComplete="off" />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#5c646d" }}>Email (opcional)</span>
            <input type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} style={campo} autoComplete="off" />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#5c646d" }}>Palavra-passe (mínimo 10 caracteres)</span>
            <input type="password" value={novaPass} onChange={e => setNovaPass(e.target.value)}
              style={campo} required minLength={10} autoComplete="new-password" />
          </div>
          <div>
            <button type="submit" style={botao} disabled={criar.isPending}>
              {criar.isPending ? "A criar..." : "Criar conta"}
            </button>
          </div>
        </form>
      </section>

      <section style={caixa}>
        <label style={rotulo}>Contas existentes</label>
        {contas.isLoading && <p style={{ fontSize: "0.88rem", color: "#5c646d" }}>A carregar...</p>}
        {contas.data && contas.data.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e6e8eb", textAlign: "left" }}>
                  <th style={{ padding: "0.5rem 0.6rem", fontWeight: 700 }}>Utilizador</th>
                  <th style={{ padding: "0.5rem 0.6rem", fontWeight: 700 }}>Nome</th>
                  <th style={{ padding: "0.5rem 0.6rem", fontWeight: 700 }}>Perfil</th>
                  <th style={{ padding: "0.5rem 0.6rem", fontWeight: 700 }}>Estado</th>
                  <th style={{ padding: "0.5rem 0.6rem", fontWeight: 700 }}>Última entrada</th>
                </tr>
              </thead>
              <tbody>
                {contas.data.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f0f2f4" }}>
                    <td style={{ padding: "0.55rem 0.6rem", fontWeight: 600 }}>{c.username}</td>
                    <td style={{ padding: "0.55rem 0.6rem" }}>{c.nome || "—"}</td>
                    <td style={{ padding: "0.55rem 0.6rem" }}>{c.role}</td>
                    <td style={{ padding: "0.55rem 0.6rem", color: c.ativo ? "#1b6b52" : "#9b2226" }}>
                      {c.ativo ? "activa" : "desactivada"}
                    </td>
                    <td style={{ padding: "0.55rem 0.6rem", color: "#5c646d" }}>
                      {c.lastLogin ? new Date(c.lastLogin).toLocaleString("pt-PT") : "nunca"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
