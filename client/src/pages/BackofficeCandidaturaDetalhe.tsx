import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

const estadoColors: Record<string, string> = {
  pendente: "#F59E0B",
  em_analise: "#3B82F6",
  entrevista: "#8B5CF6",
  rejeitado: "#EF4444",
  aceite: "#10B981",
};

const estadoLabels: Record<string, string> = {
  pendente: "Pendente",
  em_analise: "Em Análise",
  entrevista: "Entrevista",
  rejeitado: "Rejeitado",
  aceite: "Aceite",
};

export default function BackofficeCandidaturaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const candidaturaId = parseInt(id || "0", 10);

  const { data: cand, isLoading, refetch } = trpc.backoffice.candidaturas.getById.useQuery(
    { id: candidaturaId },
    { enabled: !!candidaturaId }
  );
  const updateEstado = trpc.backoffice.candidaturas.updateEstado.useMutation({ onSuccess: () => refetch() });
  const setClassificacao = trpc.backoffice.candidaturas.setClassificacao.useMutation({ onSuccess: () => refetch() });
  const deleteCandidatura = trpc.backoffice.candidaturas.delete.useMutation({
    onSuccess: () => navigate("/backoffice"),
  });

  const [estadoLocal, setEstadoLocal] = useState<string | null>(null);
  const [notasLocal, setNotasLocal] = useState<string>("");
  const [notasSaving, setNotasSaving] = useState(false);
  const [notasSaved, setNotasSaved] = useState(false);

  useEffect(() => {
    if (cand?.notasInternas !== undefined) {
      setNotasLocal(cand.notasInternas || "");
    }
  }, [cand?.notasInternas]);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFB", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>A carregar...</div>
      </div>
    );
  }

  if (!cand) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#EF4444" }}>Candidatura não encontrada.</div>
        <button onClick={() => navigate("/backoffice")} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#25749F", background: "none", border: "none", cursor: "pointer" }}>← Voltar ao Backoffice</button>
      </div>
    );
  }

  const estadoAtual = estadoLocal || cand.estado;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFB", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0A1A2A", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => navigate("/backoffice")}
          style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.4rem 1rem", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          ← Candidaturas
        </button>
        <div style={{ color: "white", fontSize: "0.85rem", opacity: 0.7 }}>TEAM 24 Backoffice</div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Título */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#DB5C34", marginBottom: "0.4rem" }}>
            CANDIDATURA #{cand.id}
          </div>
          <h1 style={{ fontFamily: "'Lato', sans-serif", fontSize: "2rem", color: "#0A1A2A", margin: 0, fontWeight: 700 }}>
            {cand.nome}
          </h1>
          {(cand as any).carreiraTitulo && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#25749F" }}>
              Vaga: <strong>{(cand as any).carreiraTitulo}</strong>
            </div>
          )}
          <div style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "#9CA3AF" }}>
            Submetida em {new Date(cand.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* Dados Pessoais */}
          <div style={{ background: "white", border: "1px solid #E5E7EB", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "1rem" }}>Dados de Contacto</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginBottom: "0.15rem" }}>Email</div>
                <a href={`mailto:${cand.email}`} style={{ fontSize: "0.9rem", color: "#25749F", textDecoration: "none", fontWeight: 500 }}>{cand.email}</a>
              </div>
              {cand.telefone && (
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginBottom: "0.15rem" }}>Telefone</div>
                  <a href={`tel:${cand.telefone}`} style={{ fontSize: "0.9rem", color: "#0A1A2A", textDecoration: "none" }}>{cand.telefone}</a>
                </div>
              )}
              {cand.linkedin && (
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginBottom: "0.15rem" }}>LinkedIn</div>
                  <a href={cand.linkedin.startsWith("http") ? cand.linkedin : `https://${cand.linkedin}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.9rem", color: "#25749F", textDecoration: "none" }}>Ver perfil →</a>
                </div>
              )}
            </div>
          </div>

          {/* Estado + CV */}
          <div style={{ background: "white", border: "1px solid #E5E7EB", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "1rem" }}>Estado & Documentos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginBottom: "0.4rem" }}>Estado da candidatura</div>
                <select
                  value={estadoAtual}
                  onChange={(e) => {
                    setEstadoLocal(e.target.value);
                    updateEstado.mutate({ id: cand.id, estado: e.target.value as any });
                  }}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: estadoColors[estadoAtual] || "#6B7280", border: `2px solid ${estadoColors[estadoAtual] || "#D1D5DB"}`, padding: "0.4rem 0.75rem", background: "white", cursor: "pointer", width: "100%" }}
                >
                  {Object.entries(estadoLabels).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
              {cand.cvUrl && (
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginBottom: "0.4rem" }}>Curriculum Vitae</div>
                  <a
                    href={cand.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#DB5C34", color: "white", padding: "0.5rem 1rem", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}
                  >
                    ⬇ {cand.cvNome || "Descarregar CV"}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mensagem de motivação */}
        {cand.mensagem && (
          <div style={{ background: "white", border: "1px solid #E5E7EB", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "0.75rem" }}>Mensagem de Motivação</div>
            <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.7, margin: 0 }}>{cand.mensagem}</p>
          </div>
        )}

        {/* Classificação */}
        <div style={{ background: "white", border: "1px solid #E5E7EB", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "1rem" }}>Avaliação Interna</div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", alignItems: "start" }}>
            {/* Classificação 1-10 */}
            <div>
              <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginBottom: "0.5rem" }}>Classificação (1-10)</div>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => {
                  const isSelected = cand.classificacao === n;
                  const color = n <= 4 ? "#EF4444" : n <= 6 ? "#F59E0B" : n <= 8 ? "#3B82F6" : "#10B981";
                  return (
                    <button
                      key={n}
                      onClick={() => setClassificacao.mutate({ id: cand.id, classificacao: isSelected ? null : n })}
                      title={isSelected ? "Clica para remover" : `Classificar com ${n}`}
                      style={{
                        width: "2.2rem", height: "2.2rem",
                        border: isSelected ? `2px solid ${color}` : "2px solid #E5E7EB",
                        background: isSelected ? color : "white",
                        color: isSelected ? "white" : "#6B7280",
                        fontWeight: 700, fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              {cand.classificacao && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#6B7280" }}>
                  Classificação actual: <strong style={{ fontSize: "1.1rem", color: cand.classificacao <= 4 ? "#EF4444" : cand.classificacao <= 6 ? "#F59E0B" : cand.classificacao <= 8 ? "#3B82F6" : "#10B981" }}>{cand.classificacao}/10</strong>
                </div>
              )}
            </div>
            {/* Notas internas */}
            <div>
              <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginBottom: "0.5rem" }}>Notas internas</div>
              <textarea
                value={notasLocal}
                onChange={e => { setNotasLocal(e.target.value); setNotasSaved(false); }}
                onBlur={() => {
                  if (notasLocal !== (cand.notasInternas || "")) {
                    setNotasSaving(true);
                    setClassificacao.mutate(
                      { id: cand.id, classificacao: cand.classificacao ?? null, notasInternas: notasLocal },
                      { onSettled: () => { setNotasSaving(false); setNotasSaved(true); setTimeout(() => setNotasSaved(false), 2000); } }
                    );
                  }
                }}
                placeholder="Notas privadas sobre o candidato (não visíveis pelo candidato)..."
                rows={4}
                style={{
                  width: "100%", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem",
                  border: "1px solid #E5E7EB", padding: "0.75rem", resize: "vertical",
                  color: "#374151", outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: "0.7rem", color: notasSaving ? "#F59E0B" : notasSaved ? "#10B981" : "#9CA3AF", marginTop: "0.25rem", textAlign: "right" }}>
                {notasSaving ? "A guardar..." : notasSaved ? "✓ Guardado" : "Guardado automaticamente ao sair do campo"}
              </div>
            </div>
          </div>
        </div>

        {/* Questionário */}
        <div style={{ background: "white", border: "1px solid #E5E7EB", padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "1rem" }}>Questionário de Seleção</div>

          {!cand.questionario ? (
            <div style={{ color: "#9CA3AF", fontSize: "0.875rem", padding: "1rem 0" }}>
              Não existe questionário associado a esta candidatura.
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#0A1A2A" }}>{cand.questionario.titulo}</div>
                <span style={{
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  background: cand.questionario.respondido ? "#D1FAE5" : "#FEF3C7",
                  color: cand.questionario.respondido ? "#065F46" : "#92400E",
                }}>
                  {cand.questionario.respondido
                    ? `✓ Respondido em ${new Date(cand.questionario.respondidoAt!).toLocaleDateString("pt-PT")}`
                    : "⏳ Aguarda resposta"}
                </span>
                {cand.questionario.emailEnviado && (
                  <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                    Email enviado em {cand.questionario.emailEnviadoAt ? new Date(cand.questionario.emailEnviadoAt).toLocaleDateString("pt-PT") : "—"}
                  </span>
                )}
              </div>

              {cand.questionario.respondido && cand.questionario.respostas.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {cand.questionario.respostas.map((r: any, i: number) => (
                    <div key={i} style={{ borderLeft: "3px solid #DB5C34", paddingLeft: "1rem" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "0.35rem" }}>
                        {i + 1}. {r.pergunta}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.6 }}>{r.resposta}</div>
                    </div>
                  ))}
                </div>
              ) : cand.questionario.respondido ? (
                <div style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>Sem respostas registadas.</div>
              ) : (
                <div style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>
                  O candidato ainda não respondeu ao questionário.
                  {cand.questionario.expiraAt && (
                    <span> O link expira em {new Date(cand.questionario.expiraAt).toLocaleDateString("pt-PT")}.</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acções */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => navigate("/backoffice")}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#25749F", background: "none", border: "1px solid #25749F", padding: "0.5rem 1.25rem", cursor: "pointer" }}
          >
            ← Voltar às Candidaturas
          </button>
          <button
            onClick={() => { if (confirm("Eliminar esta candidatura? Esta acção é irreversível.")) deleteCandidatura.mutate({ id: cand.id }); }}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#EF4444", background: "none", border: "1px solid #EF4444", padding: "0.5rem 1.25rem", cursor: "pointer" }}
          >
            Eliminar Candidatura
          </button>
        </div>
      </div>
    </div>
  );
}
