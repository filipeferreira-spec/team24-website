import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── ESTILOS PARTILHADOS ─────────────────────────────────────────────────────
const font = "'Plus Jakarta Sans', sans-serif";
const inputStyle: React.CSSProperties = { width: "100%", fontFamily: font, fontSize: "0.9rem", color: "#0A1A2A", background: "white", border: "1px solid #D0E2EC", padding: "0.6rem 0.75rem", outline: "none", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontFamily: font, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#6B7280", marginBottom: "0.35rem" };
const btnPrimary: React.CSSProperties = { background: "#DB5C34", color: "white", border: "none", padding: "0.6rem 1.25rem", fontFamily: font, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.05em", textTransform: "uppercase" as const, cursor: "pointer" };
const btnSecondary: React.CSSProperties = { background: "white", color: "#0A1A2A", border: "1px solid #D0E2EC", padding: "0.55rem 1rem", fontFamily: font, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" };
const card: React.CSSProperties = { background: "white", border: "1px solid #E5EEF4", padding: "1.5rem", marginBottom: "1rem" };
const sectionTitle: React.CSSProperties = { fontFamily: font, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#6B7280", margin: "0 0 1rem" };

type Tab = "campanhas" | "sequencias" | "contactos";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "#6B7280" },
  ativa: { label: "Activa", color: "#065F46" },
  pausada: { label: "Pausada", color: "#92400E" },
  concluida: { label: "Concluída", color: "#1E40AF" },
};

const SEG_LABELS: Record<string, string> = {
  geral: "Geral",
  np4552: "NP4552",
  clientes: "Clientes",
  outro: "Outro",
  em_tratamento: "Em Tratamento",
  reuniao_agendada: "Reunião Agendada",
  proposta_enviada: "Proposta Enviada",
  proposta_adjudicada: "Proposta Adjudicada",
  won: "Won",
  renovacoes_pendente: "Renovações Pendente",
  contratos_renovados: "Contratos Renovados",
  contratos_terminados: "Contratos Terminados",
  servicos_isolados: "Serviços Isolados",
  perdido: "Perdido (Lost)",
};

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function BackofficeOutreach() {
  const [tab, setTab] = useState<Tab>("campanhas");

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "2px solid #E5EEF4" }}>
        {(["campanhas", "sequencias", "contactos"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? "2px solid #DB5C34" : "2px solid transparent", marginBottom: "-2px", padding: "0.6rem 1.25rem", fontFamily: font, fontWeight: tab === t ? 700 : 400, fontSize: "0.88rem", color: tab === t ? "#DB5C34" : "#6B7280", cursor: "pointer", textTransform: "capitalize" as const }}>
            {t === "campanhas" ? "Campanhas" : t === "sequencias" ? "Sequências" : "Contactos"}
          </button>
        ))}
      </div>

      {tab === "campanhas" && <CampanhasTab />}
      {tab === "sequencias" && <SequenciasTab />}
      {tab === "contactos" && <ContactosTab />}
    </div>
  );
}

// ─── TAB: CAMPANHAS ──────────────────────────────────────────────────────────
function CampanhasTab() {
  const { data: campanhas = [], refetch } = trpc.outreach.campanhas.list.useQuery();
  const { data: sequencias = [] } = trpc.outreach.sequencias.list.useQuery();
  const createMut = trpc.outreach.campanhas.create.useMutation({ onSuccess: () => { refetch(); setCreating(false); } });
  const deleteMut = trpc.outreach.campanhas.delete.useMutation({ onSuccess: () => refetch() });
  const seedMut = trpc.outreach.sequencias.seedDefaults.useMutation({ onSuccess: () => { refetch(); } });

  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: "", sequenciaId: 0, segmento: "geral" as "geral" | "np4552" | "outro", remetentNome: "Filipe Ferreira", remetentEmail: "marketing@team24.pt" });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <p style={sectionTitle}>Campanhas de Outreach</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {sequencias.length === 0 && (
            <button style={{ ...btnSecondary, fontSize: "0.72rem" }} onClick={() => seedMut.mutate()} disabled={seedMut.isPending}>
              {seedMut.isPending ? "A criar..." : "Criar Sequências Padrão"}
            </button>
          )}
          <button style={btnPrimary} onClick={() => setCreating(true)}>+ Nova Campanha</button>
        </div>
      </div>

      {seedMut.data && <p style={{ fontFamily: font, fontSize: "0.82rem", color: "#065F46", marginBottom: "1rem" }}>✅ {seedMut.data.message}</p>}

      {/* Formulário de criação */}
      {creating && (
        <div style={{ ...card, border: "1px solid #DB5C34" }}>
          <p style={sectionTitle}>Nova Campanha</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>Nome da Campanha</label>
              <input style={inputStyle} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Outreach NP4552 — Julho 2025" />
            </div>
            <div>
              <label style={labelStyle}>Sequência de Emails</label>
              <select style={{ ...inputStyle }} value={form.sequenciaId} onChange={e => setForm(f => ({ ...f, sequenciaId: parseInt(e.target.value) }))}>
                <option value={0}>Seleccionar sequência...</option>
                {sequencias.map((s: any) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Segmento</label>
              <select style={{ ...inputStyle }} value={form.segmento} onChange={e => setForm(f => ({ ...f, segmento: e.target.value as any }))}>
                <optgroup label="Segmentos Gerais">
                  <option value="geral">Geral</option>
                  <option value="np4552">NP4552 — Certificação Saúde Mental</option>
                  <option value="clientes">Clientes</option>
                  <option value="outro">Outro</option>
                </optgroup>
                <optgroup label="Pipeline CRM">
                  <option value="em_tratamento">Em Tratamento</option>
                  <option value="reuniao_agendada">Reunião Agendada</option>
                  <option value="proposta_enviada">Proposta Enviada</option>
                  <option value="proposta_adjudicada">Proposta Adjudicada</option>
                  <option value="won">Won</option>
                  <option value="renovacoes_pendente">Renovações Pendente</option>
                  <option value="contratos_renovados">Contratos Renovados</option>
                  <option value="contratos_terminados">Contratos Terminados</option>
                  <option value="servicos_isolados">Serviços Isolados</option>
              <option value="perdido">Perdido (Lost)</option>
                </optgroup>
                <optgroup label="Outros">
                  <option value="teste">Teste</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Nome do Remetente</label>
              <input style={inputStyle} value={form.remetentNome} onChange={e => setForm(f => ({ ...f, remetentNome: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Email do Remetente</label>
              <input style={inputStyle} value={form.remetentEmail} onChange={e => setForm(f => ({ ...f, remetentEmail: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button style={btnPrimary} disabled={createMut.isPending || !form.nome || !form.sequenciaId} onClick={() => createMut.mutate(form)}>
              {createMut.isPending ? "A criar..." : "Criar Campanha"}
            </button>
            <button style={btnSecondary} onClick={() => setCreating(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista de campanhas */}
      {campanhas.length === 0 && !creating && (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <p style={{ fontFamily: font, color: "#6B7280", marginBottom: "1rem" }}>Ainda não há campanhas. Comece por criar as sequências padrão e depois crie a primeira campanha.</p>
        </div>
      )}

      {campanhas.map((c: any) => (
        <CampanhaCard key={c.id} c={c} selectedId={selectedId} setSelectedId={setSelectedId} deleteMut={deleteMut} refetch={refetch} />
      ))}
    </div>
  );
}

function CampanhaCard({ c, selectedId, setSelectedId, deleteMut, refetch }: { c: any; selectedId: number | null; setSelectedId: (id: number | null) => void; deleteMut: any; refetch: () => void }) {
  const [editingNome, setEditingNome] = useState(false);
  const [nomeEdit, setNomeEdit] = useState(c.nome);
  const updateNomeMut = trpc.outreach.campanhas.updateNome.useMutation({ onSuccess: () => { refetch(); setEditingNome(false); } });

  return (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                {editingNome ? (
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <input
                      style={{ ...inputStyle, fontSize: "0.95rem", fontWeight: 700, padding: "0.3rem 0.5rem", width: "280px" }}
                      value={nomeEdit}
                      onChange={e => setNomeEdit(e.target.value)}
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") updateNomeMut.mutate({ id: c.id, nome: nomeEdit }); if (e.key === "Escape") { setEditingNome(false); setNomeEdit(c.nome); } }}
                    />
                    <button style={{ ...btnPrimary, fontSize: "0.7rem", padding: "0.3rem 0.6rem" }} onClick={() => updateNomeMut.mutate({ id: c.id, nome: nomeEdit })} disabled={updateNomeMut.isPending}>✓</button>
                    <button style={{ ...btnSecondary, fontSize: "0.7rem", padding: "0.3rem 0.6rem" }} onClick={() => { setEditingNome(false); setNomeEdit(c.nome); }}>✕</button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontFamily: font, fontWeight: 700, fontSize: "1rem", color: "#0A1A2A" }}>{c.nome}</span>
                    <button onClick={() => setEditingNome(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "0.75rem", padding: "0.1rem 0.3rem" }} title="Renomear campanha">✏️</button>
                  </>
                )}
                <span style={{ fontFamily: font, fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", background: ESTADO_LABELS[c.estado]?.color + "18", color: ESTADO_LABELS[c.estado]?.color, border: `1px solid ${ESTADO_LABELS[c.estado]?.color}40` }}>
                  {ESTADO_LABELS[c.estado]?.label}
                </span>
                <span style={{ fontFamily: font, fontSize: "0.7rem", color: "#6B7280", background: "#F3F4F6", padding: "0.2rem 0.5rem" }}>{SEG_LABELS[c.segmento]}</span>
              </div>
              <div style={{ fontFamily: font, fontSize: "0.78rem", color: "#6B7280" }}>
                {c.remetentNome} &lt;{c.remetentEmail}&gt; · {c.totalContactos} contactos
                {c.lancadaAt && ` · Lançada em ${new Date(c.lancadaAt).toLocaleDateString("pt-PT")}`}
              </div>
              {/* Métricas rápidas */}
              {c.metricas && (
                <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}>
                  <MetricBadge label="Enviados" value={c.metricas.enviados} color="#065F46" />
                  <MetricBadge label="Erros" value={c.metricas.erros} color="#991B1B" />
                  <MetricBadge label="Respostas" value={c.metricas.respondidos} color="#1E40AF" />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              <button style={{ ...btnSecondary, fontSize: "0.72rem" }} onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}>
                {c.id === selectedId ? "Fechar" : "Gerir"}
              </button>
              <button style={{ ...btnSecondary, fontSize: "0.72rem", color: "#991B1B", borderColor: "#FECACA" }} onClick={() => { if (confirm("Apagar esta campanha?")) deleteMut.mutate({ id: c.id }); }}>
                Apagar
              </button>
            </div>
          </div>

          {/* Painel de gestão expandido */}
          {selectedId === c.id && <CampanhaGestao campanha={c} onClose={() => setSelectedId(null)} />}
        </div>
  );
}

function MetricBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <span style={{ fontFamily: font, fontSize: "1.1rem", fontWeight: 800, color }}>{value}</span>
      <span style={{ fontFamily: font, fontSize: "0.7rem", color: "#6B7280", marginLeft: "0.3rem" }}>{label}</span>
    </div>
  );
}

function CampanhaGestao({ campanha, onClose }: { campanha: any; onClose: () => void }) {
  const { data: preview } = trpc.outreach.campanhas.preview.useQuery({ campanhaId: campanha.id });
  const { data: metricas, refetch: refetchMetricas } = trpc.outreach.campanhas.metricas.useQuery({ campanhaId: campanha.id });
  const sendTestMut = trpc.outreach.campanhas.sendTest.useMutation();
  const launchMut = trpc.outreach.campanhas.launch.useMutation({ onSuccess: () => refetchMetricas() });

  const [testEmail, setTestEmail] = useState("");
  const [testNome, setTestNome] = useState("");
  const [testEmpresa, setTestEmpresa] = useState("");
  const [testOrdem, setTestOrdem] = useState(1);
  const [testResult, setTestResult] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [launchResult, setLaunchResult] = useState<any>(null);

  return (
    <div style={{ marginTop: "1.5rem", borderTop: "1px solid #E5EEF4", paddingTop: "1.5rem" }}>
      {/* Preview */}
      {preview && (
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={sectionTitle}>Preview da Campanha</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
            <InfoBox label="Segmento" value={SEG_LABELS[campanha.segmento]} />
            <InfoBox label="Contactos elegíveis" value={String(preview.totalContactos)} />
            <InfoBox label="Emails na sequência" value={String(preview.emails?.length ?? 0)} />
          </div>
          {preview.emails && (
            <div style={{ background: "#F8FAFB", border: "1px solid #E5EEF4", padding: "1rem" }}>
              <p style={{ ...sectionTitle, marginBottom: "0.75rem" }}>Sequência de Emails</p>
              {preview.emails.map((e: any) => (
                <div key={e.id} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.5rem", padding: "0.5rem", background: "white", border: "1px solid #E5EEF4" }}>
                  <span style={{ fontFamily: font, fontSize: "0.7rem", fontWeight: 700, color: "#DB5C34", minWidth: "50px" }}>Email {e.ordem}</span>
                  <span style={{ fontFamily: font, fontSize: "0.7rem", color: "#6B7280", minWidth: "60px" }}>Dia {e.diaCadencia}</span>
                  <span style={{ fontFamily: font, fontSize: "0.82rem", color: "#0A1A2A" }}>{e.assunto}</span>
                </div>
              ))}
            </div>
          )}
          {preview.amostra && preview.amostra.length > 0 && (
            <p style={{ fontFamily: font, fontSize: "0.78rem", color: "#6B7280", marginTop: "0.5rem" }}>
              Primeiros contactos: {preview.amostra.map((c: any) => c.nome).join(", ")}
              {preview.totalContactos > 5 && ` ... e mais ${preview.totalContactos - 5}`}
            </p>
          )}
        </div>
      )}

      {/* Envio de Teste */}
      <div style={{ ...card, marginBottom: "1rem" }}>
        <p style={sectionTitle}>Envio de Teste</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.75rem", alignItems: "flex-end" }}>
          <div>
            <label style={labelStyle}>Nome</label>
            <input style={inputStyle} value={testNome} onChange={e => setTestNome(e.target.value)} placeholder="João Silva" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="joao@empresa.pt" />
          </div>
          <div>
            <label style={labelStyle}>Empresa</label>
            <input style={inputStyle} value={testEmpresa} onChange={e => setTestEmpresa(e.target.value)} placeholder="Empresa Teste" />
          </div>
          <div>
            <label style={labelStyle}>Email nº</label>
            <select style={{ ...inputStyle, width: "80px" }} value={testOrdem} onChange={e => setTestOrdem(parseInt(e.target.value))}>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button style={{ ...btnSecondary, background: "#25749F", color: "white", borderColor: "#25749F" }}
            disabled={sendTestMut.isPending || !testEmail || !testNome}
            onClick={() => sendTestMut.mutate({ campanhaId: campanha.id, emailOrdem: testOrdem, testEmail, testNome, testEmpresa }, {
              onSuccess: () => setTestResult("✅ Email de teste enviado com sucesso"),
              onError: (e) => setTestResult(`❌ Erro: ${e.message}`),
            })}>
            {sendTestMut.isPending ? "A enviar..." : "Enviar Teste"}
          </button>
          {testResult && <span style={{ fontFamily: font, fontSize: "0.82rem", color: testResult.startsWith("✅") ? "#065F46" : "#991B1B" }}>{testResult}</span>}
        </div>
      </div>

      {/* Lançamento */}
      {campanha.estado === "rascunho" && (
        <div style={{ ...card, border: confirming ? "2px solid #DC2626" : "1px solid #FECACA", transition: "border 0.2s" }}>
          <p style={sectionTitle}>Lançar Campanha</p>

          {/* Estado inicial: botão de lançamento */}
          {!confirming && !launchResult && (
            <>
              <p style={{ fontFamily: font, fontSize: "0.85rem", color: "#6B7280", marginBottom: "1.25rem" }}>
                Envia o <strong style={{ color: "#0A1A2A" }}>Email 1</strong> para todos os contactos activos do segmento <strong style={{ color: "#0A1A2A" }}>{SEG_LABELS[campanha.segmento]}</strong>.
                Os emails seguintes são enviados nos dias de cadência definidos na sequência.
              </p>
              <button style={{ ...btnPrimary, background: "#DC2626" }} onClick={() => setConfirming(true)}>
                Lançar Campanha
              </button>
            </>
          )}

          {/* Painel de confirmação */}
          {confirming && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", padding: "1.25rem", borderRadius: "2px" }}>
              <p style={{ fontFamily: font, fontWeight: 700, fontSize: "0.95rem", color: "#991B1B", margin: "0 0 0.75rem" }}>
                Confirmar lançamento da campanha?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ background: "white", border: "1px solid #FECACA", padding: "0.75rem 1rem" }}>
                  <div style={{ fontFamily: font, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#6B7280", marginBottom: "0.25rem" }}>Destinatários</div>
                  <div style={{ fontFamily: font, fontWeight: 800, fontSize: "1.4rem", color: "#991B1B" }}>{preview?.totalContactos ?? "..."}</div>
                </div>
                <div style={{ background: "white", border: "1px solid #FECACA", padding: "0.75rem 1rem" }}>
                  <div style={{ fontFamily: font, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#6B7280", marginBottom: "0.25rem" }}>Remetente</div>
                  <div style={{ fontFamily: font, fontWeight: 600, fontSize: "0.82rem", color: "#0A1A2A" }}>{campanha.remetentNome}</div>
                  <div style={{ fontFamily: font, fontSize: "0.75rem", color: "#6B7280" }}>{campanha.remetentEmail}</div>
                </div>
                <div style={{ background: "white", border: "1px solid #FECACA", padding: "0.75rem 1rem" }}>
                  <div style={{ fontFamily: font, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#6B7280", marginBottom: "0.25rem" }}>Primeiro Email</div>
                  <div style={{ fontFamily: font, fontWeight: 600, fontSize: "0.82rem", color: "#0A1A2A" }}>{preview?.emails?.[0]?.assunto ?? "—"}</div>
                </div>
              </div>
              <p style={{ fontFamily: font, fontSize: "0.8rem", color: "#991B1B", marginBottom: "1rem" }}>
                ⚠️ Esta acção não pode ser desfeita. Os emails serão enviados imediatamente.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  style={{ ...btnPrimary, background: "#DC2626", minWidth: "180px" }}
                  disabled={launchMut.isPending}
                  onClick={() => launchMut.mutate({ campanhaId: campanha.id }, {
                    onSuccess: (r) => { setLaunchResult(r); setConfirming(false); },
                    onError: (e) => { setLaunchResult({ error: e.message }); setConfirming(false); },
                  })}>
                  {launchMut.isPending ? "A enviar emails..." : "Confirmar e Lançar"}
                </button>
                <button style={{ ...btnSecondary }} onClick={() => setConfirming(false)} disabled={launchMut.isPending}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Resultado do lançamento */}
          {launchResult && !launchResult.error && (
            <div style={{ background: "#D1FAE5", border: "1px solid #6EE7B7", padding: "1rem" }}>
              <p style={{ fontFamily: font, fontWeight: 700, color: "#065F46", margin: "0 0 0.25rem" }}>✅ {launchResult.enviados} emails enviados com sucesso.</p>
              {launchResult.erros > 0 && <p style={{ fontFamily: font, fontSize: "0.82rem", color: "#991B1B", margin: 0 }}>{launchResult.erros} erros: {launchResult.errosList?.slice(0, 3).join("; ")}</p>}
            </div>
          )}
          {launchResult?.error && <p style={{ fontFamily: font, color: "#991B1B", fontSize: "0.85rem" }}>❌ {launchResult.error}</p>}
        </div>
      )}

      {/* Métricas detalhadas */}
      {metricas && metricas.totalEnvios > 0 && (
        <div>
          {/* KPIs principais */}
          <div style={card}>
            <p style={sectionTitle}>Resumo da Campanha</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              <MetricCard label="Total Enviados" value={metricas.totalEnviados} color="#065F46" />
              <MetricCard label="Aberturas Únicas" value={metricas.uniqueAberturas ?? 0} color="#1E40AF" sub={`${metricas.taxaAbertura ?? 0}% taxa`} />
              <MetricCard label="Cliques Únicos" value={metricas.uniqueCliques ?? 0} color="#7C3AED" sub={`${metricas.taxaClique ?? 0}% taxa`} />
              <MetricCard label="Respostas" value={metricas.totalRespondidos} color="#DB5C34" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <MetricCard label="Erros de Envio" value={metricas.totalErros} color="#991B1B" />
              <MetricCard label="Total Aberturas" value={metricas.totalAberturas ?? 0} color="#6B7280" sub="incl. reabertura" />
              <MetricCard label="Total Cliques" value={metricas.totalCliques ?? 0} color="#6B7280" sub="incl. recliques" />
            </div>
          </div>

          {/* Gráfico de timeline */}
          {metricas.timeline && metricas.timeline.length > 0 && (
            <div style={card}>
              <p style={sectionTitle}>Actividade ao Longo do Tempo</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #E5EEF4" }}>
                      {["Data", "Aberturas", "Cliques"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#6B7280" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metricas.timeline.map((row: any) => (
                      <tr key={row.date} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "0.6rem 0.75rem", color: "#0A1A2A", fontWeight: 600 }}>{row.date}</td>
                        <td style={{ padding: "0.6rem 0.75rem" }}>
                          <span style={{ display: "inline-block", background: "#DBEAFE", color: "#1E40AF", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "2px" }}>{row.aberturas}</span>
                        </td>
                        <td style={{ padding: "0.6rem 0.75rem" }}>
                          <span style={{ display: "inline-block", background: "#EDE9FE", color: "#7C3AED", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "2px" }}>{row.cliques}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Breakdown por email */}
          <div style={card}>
            <p style={sectionTitle}>Desempenho por Email</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #E5EEF4" }}>
                    {["#", "Assunto", "Enviados", "Aberturas", "Taxa Aber.", "Cliques", "Taxa Cli.", "Respostas", "Erros"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#6B7280", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metricas.porEmail.map((row: any) => (
                    <tr key={row.email.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "0.6rem 0.75rem", color: "#DB5C34", fontWeight: 700 }}>#{row.email.ordem}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "#0A1A2A", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.email.assunto}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "#065F46", fontWeight: 700 }}>{row.enviados}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "#1E40AF", fontWeight: 700 }}>{row.aberturas ?? 0}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}><TaxaBadge value={row.taxaAbertura ?? 0} /></td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "#7C3AED", fontWeight: 700 }}>{row.cliques ?? 0}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}><TaxaBadge value={row.taxaClique ?? 0} color="#7C3AED" /></td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "#DB5C34", fontWeight: 700 }}>{row.respondidos}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: row.erros > 0 ? "#991B1B" : "#6B7280", fontWeight: row.erros > 0 ? 700 : 400 }}>{row.erros}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top URLs clicadas */}
          {metricas.topUrls && metricas.topUrls.length > 0 && (
            <div style={card}>
              <p style={sectionTitle}>Links Mais Clicados</p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #E5EEF4" }}>
                    {["URL", "Cliques"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#6B7280" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metricas.topUrls.map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        <a href={row.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1E40AF", textDecoration: "none", fontWeight: 500 }}>{row.url}</a>
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        <span style={{ background: "#EDE9FE", color: "#7C3AED", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "2px" }}>{row.clicks}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabela detalhada por contacto */}
          {metricas.porContacto && metricas.porContacto.length > 0 && (
            <ContactoTrackingTable rows={metricas.porContacto} campanhaId={campanha.id} refetch={refetchMetricas} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── TABELA DETALHADA POR CONTACTO ─────────────────────────────────────────
function ContactoTrackingTable({ rows, campanhaId, refetch }: { rows: any[]; campanhaId: number; refetch: () => void }) {
  const marcarMut = trpc.outreach.campanhas.marcarResposta.useMutation({ onSuccess: () => refetch() });
  const [filtro, setFiltro] = useState<"todos" | "abriu" | "clicou" | "respondeu">("todos");
  const [pesquisa, setPesquisa] = useState("");

  const filtrados = rows.filter(r => {
    const matchFiltro = filtro === "todos" || (filtro === "abriu" && r.abriu) || (filtro === "clicou" && r.clicou) || (filtro === "respondeu" && r.respondeu);
    const matchPesquisa = !pesquisa || r.nome.toLowerCase().includes(pesquisa.toLowerCase()) || r.email.toLowerCase().includes(pesquisa.toLowerCase()) || r.empresa.toLowerCase().includes(pesquisa.toLowerCase());
    return matchFiltro && matchPesquisa;
  });

  const fmtDate = (d: Date | null) => d ? new Date(d).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <p style={{ ...sectionTitle, margin: 0 }}>Actividade por Contacto</p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Pesquisar nome, email ou empresa..."
            value={pesquisa}
            onChange={e => setPesquisa(e.target.value)}
            style={{ ...inputStyle, width: "220px", fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
          />
          {(["todos", "abriu", "clicou", "respondeu"] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              ...btnSecondary,
              background: filtro === f ? "#0A1A2A" : "white",
              color: filtro === f ? "white" : "#0A1A2A",
              fontSize: "0.72rem", padding: "0.35rem 0.75rem"
            }}>
              {f === "todos" ? `Todos (${rows.length})` : f === "abriu" ? `Abriu (${rows.filter(r => r.abriu).length})` : f === "clicou" ? `Clicou (${rows.filter(r => r.clicou).length})` : `Respondeu (${rows.filter(r => r.respondeu).length})`}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E5EEF4", background: "#F8FAFB" }}>
              {["Nome", "Email", "Empresa", "Email #", "Abriu", "Clicou", "Respondeu", "1ª Abertura", "1º Clique", "Links Clicados", "Acção"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#6B7280", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={11} style={{ padding: "1.5rem", textAlign: "center", color: "#6B7280", fontFamily: font }}>Sem resultados</td></tr>
            )}
            {filtrados.map((row: any, i: number) => (
              <tr key={i} style={{ borderBottom: "1px solid #F3F4F6", background: row.respondeu ? "#FFF7F5" : row.clicou ? "#F5F3FF" : row.abriu ? "#EFF6FF" : "white" }}>
                <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, color: "#0A1A2A", whiteSpace: "nowrap" }}>{row.nome}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#1E40AF", fontSize: "0.78rem" }}>{row.email}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#6B7280", fontSize: "0.78rem", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.empresa}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#DB5C34", fontWeight: 700, textAlign: "center" }}>#{row.emailOrdem}</td>
                <td style={{ padding: "0.6rem 0.75rem", textAlign: "center" }}>
                  <span style={{ fontSize: "1rem" }}>{row.abriu ? "✅" : "—"}</span>
                </td>
                <td style={{ padding: "0.6rem 0.75rem", textAlign: "center" }}>
                  <span style={{ fontSize: "1rem" }}>{row.clicou ? "🔗" : "—"}</span>
                </td>
                <td style={{ padding: "0.6rem 0.75rem", textAlign: "center" }}>
                  <span style={{ fontSize: "1rem" }}>{row.respondeu ? "💬" : "—"}</span>
                </td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#1E40AF", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{fmtDate(row.primeiraAbertura)}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#7C3AED", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{fmtDate(row.primeiroClique)}</td>
                <td style={{ padding: "0.6rem 0.75rem", maxWidth: "200px" }}>
                  {row.urlsClicadas.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                      {row.urlsClicadas.map((url: string, j: number) => (
                        <a key={j} href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#7C3AED", fontSize: "0.72rem", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: "180px" }}>{url.replace(/^https?:\/\//, "")}</a>
                      ))}
                    </div>
                  ) : <span style={{ color: "#D1D5DB" }}>—</span>}
                </td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  {!row.respondeu && (
                    <button
                      onClick={() => marcarMut.mutate({ campanhaId, contactoId: row.contactoId })}
                      disabled={marcarMut.isPending}
                      style={{ ...btnSecondary, fontSize: "0.7rem", padding: "0.25rem 0.6rem", whiteSpace: "nowrap" }}
                    >
                      Marcar Resposta
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontFamily: font, fontSize: "0.7rem", color: "#9CA3AF", marginTop: "0.75rem" }}>
        {filtrados.length} de {rows.length} contactos · Ordenado por: Respondeu &gt; Clicou &gt; Abriu &gt; Enviado
      </p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#F8FAFB", border: "1px solid #E5EEF4", padding: "0.75rem 1rem" }}>
      <div style={{ fontFamily: font, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#6B7280", marginBottom: "0.25rem" }}>{label}</div>
      <div style={{ fontFamily: font, fontWeight: 700, fontSize: "1.1rem", color: "#0A1A2A" }}>{value}</div>
    </div>
  );
}

function MetricCard({ label, value, color = "#0A1A2A", sub }: { label: string; value: number; color?: string; sub?: string }) {
  return (
    <div style={{ background: "#F8FAFB", border: "1px solid #E5EEF4", padding: "1rem", textAlign: "center" }}>
      <div style={{ fontFamily: font, fontSize: "1.75rem", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontFamily: font, fontSize: "0.7rem", color: "#6B7280", marginTop: "0.25rem" }}>{label}</div>
      {sub && <div style={{ fontFamily: font, fontSize: "0.65rem", color, fontWeight: 600, marginTop: "0.15rem" }}>{sub}</div>}
    </div>
  );
}

function TaxaBadge({ value, color = "#1E40AF" }: { value: number; color?: string }) {
  const bg = color === "#7C3AED" ? "#EDE9FE" : "#DBEAFE";
  return (
    <span style={{ display: "inline-block", background: bg, color, fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "2px", fontSize: "0.78rem" }}>
      {value}%
    </span>
  );
}

// ─── TAB: SEQUÊNCIAS ─────────────────────────────────────────────────────────
function SequenciasTab() {
  const { data: sequencias = [], refetch } = trpc.outreach.sequencias.list.useQuery();
  const deleteMut = trpc.outreach.sequencias.delete.useMutation({ onSuccess: () => refetch() });
  const seedMut = trpc.outreach.sequencias.seedDefaults.useMutation({ onSuccess: () => refetch() });
  const [editId, setEditId] = useState<number | null>(null);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <p style={sectionTitle}>Sequências de Email</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={btnSecondary} onClick={() => seedMut.mutate()} disabled={seedMut.isPending}>
            {seedMut.isPending ? "A criar..." : "Criar Sequências Padrão"}
          </button>
          <button style={btnPrimary} onClick={() => setEditId(-1)}>+ Nova Sequência</button>
        </div>
      </div>

      {seedMut.data && <p style={{ fontFamily: font, fontSize: "0.82rem", color: "#065F46", marginBottom: "1rem" }}>✅ {seedMut.data.message}</p>}

      {editId === -1 && <SequenciaForm onSave={() => { refetch(); setEditId(null); }} onCancel={() => setEditId(null)} />}

      {sequencias.map((s: any) => (
        <div key={s.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: font, fontWeight: 700, fontSize: "0.95rem", color: "#0A1A2A", marginBottom: "0.2rem" }}>{s.nome}</div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span style={{ fontFamily: font, fontSize: "0.7rem", background: "#F3F4F6", color: "#6B7280", padding: "0.2rem 0.5rem" }}>{SEG_LABELS[s.segmento]}</span>
                <span style={{ fontFamily: font, fontSize: "0.78rem", color: "#6B7280" }}>{s.emailCount} emails</span>
                {s.descricao && <span style={{ fontFamily: font, fontSize: "0.78rem", color: "#6B7280" }}>{s.descricao}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button style={{ ...btnSecondary, fontSize: "0.72rem" }} onClick={() => setEditId(editId === s.id ? null : s.id)}>
                {editId === s.id ? "Fechar" : "Editar"}
              </button>
              <button style={{ ...btnSecondary, fontSize: "0.72rem", color: "#991B1B", borderColor: "#FECACA" }} onClick={() => { if (confirm("Apagar esta sequência?")) deleteMut.mutate({ id: s.id }); }}>
                Apagar
              </button>
            </div>
          </div>
          {editId === s.id && <SequenciaForm seqId={s.id} onSave={() => { refetch(); setEditId(null); }} onCancel={() => setEditId(null)} />}
        </div>
      ))}

      {sequencias.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <p style={{ fontFamily: font, color: "#6B7280" }}>Sem sequências. Clique em "Criar Sequências Padrão" para carregar as sequências Geral e NP4552.</p>
        </div>
      )}
    </div>
  );
}

function SequenciaForm({ seqId, onSave, onCancel }: { seqId?: number; onSave: () => void; onCancel: () => void }) {
  const { data: existing } = trpc.outreach.sequencias.get.useQuery({ id: seqId! }, { enabled: !!seqId });
  const createMut = trpc.outreach.sequencias.create.useMutation({ onSuccess: onSave });
  const updateMut = trpc.outreach.sequencias.update.useMutation({ onSuccess: onSave });

  const [nome, setNome] = useState(existing?.nome || "");
  const [descricao, setDescricao] = useState(existing?.descricao || "");
  const [segmento, setSegmento] = useState<"geral" | "np4552" | "outro" | "clientes" | "em_tratamento" | "reuniao_agendada" | "proposta_enviada" | "proposta_adjudicada" | "won" | "renovacoes_pendente" | "contratos_renovados" | "contratos_terminados" | "servicos_isolados" | "perdido" | "teste">(existing?.segmento || "geral");
  const [emails, setEmails] = useState<{ ordem: number; diaCadencia: number; assunto: string; corpo: string }[]>(
    existing?.emails || [{ ordem: 1, diaCadencia: 0, assunto: "", corpo: "" }]
  );
  const [activeEmail, setActiveEmail] = useState(0);

  const save = () => {
    if (seqId) {
      updateMut.mutate({ id: seqId, nome, descricao, segmento, emails });
    } else {
      createMut.mutate({ nome, descricao, segmento, emails });
    }
  };

  return (
    <div style={{ marginTop: "1.25rem", borderTop: "1px solid #E5EEF4", paddingTop: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={labelStyle}>Nome</label>
          <input style={inputStyle} value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da sequência" />
        </div>
        <div>
          <label style={labelStyle}>Segmento</label>
          <select style={{ ...inputStyle }} value={segmento} onChange={e => setSegmento(e.target.value as any)}>
            <optgroup label="Segmentos Gerais">
              <option value="geral">Geral</option>
              <option value="np4552">NP4552</option>
              <option value="clientes">Clientes</option>
              <option value="outro">Outro</option>
            </optgroup>
            <optgroup label="Pipeline CRM">
              <option value="em_tratamento">Em Tratamento</option>
              <option value="reuniao_agendada">Reunião Agendada</option>
              <option value="proposta_enviada">Proposta Enviada</option>
              <option value="proposta_adjudicada">Proposta Adjudicada</option>
              <option value="won">Won</option>
              <option value="renovacoes_pendente">Renovações Pendente</option>
              <option value="contratos_renovados">Contratos Renovados</option>
              <option value="contratos_terminados">Contratos Terminados</option>
              <option value="servicos_isolados">Serviços Isolados</option>
              <option value="perdido">Perdido (Lost)</option>
            </optgroup>
            <optgroup label="Outros">
              <option value="teste">Teste</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Descrição</label>
          <input style={inputStyle} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição opcional" />
        </div>
      </div>

      {/* Editor de emails */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
        {emails.map((_, i) => (
          <button key={i} onClick={() => setActiveEmail(i)} style={{ background: activeEmail === i ? "#DB5C34" : "#F3F4F6", color: activeEmail === i ? "white" : "#0A1A2A", border: "none", padding: "0.4rem 0.75rem", fontFamily: font, fontWeight: 700, fontSize: "0.72rem", cursor: "pointer" }}>
            Email {i + 1}
          </button>
        ))}
        <button onClick={() => setEmails(e => [...e, { ordem: e.length + 1, diaCadencia: 0, assunto: "", corpo: "" }])} style={{ background: "none", border: "1px dashed #D0E2EC", padding: "0.4rem 0.75rem", fontFamily: font, fontSize: "0.72rem", color: "#6B7280", cursor: "pointer" }}>
          + Email
        </button>
      </div>

      {emails[activeEmail] && (
        <div style={{ background: "#F8FAFB", border: "1px solid #E5EEF4", padding: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "1rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Assunto</label>
              <input style={inputStyle} value={emails[activeEmail].assunto} onChange={e => setEmails(em => em.map((x, i) => i === activeEmail ? { ...x, assunto: e.target.value } : x))} placeholder="Assunto do email" />
            </div>
            <div>
              <label style={labelStyle}>Dia de Envio</label>
              <input style={inputStyle} type="number" min={0} value={emails[activeEmail].diaCadencia} onChange={e => setEmails(em => em.map((x, i) => i === activeEmail ? { ...x, diaCadencia: parseInt(e.target.value) || 0 } : x))} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Corpo do Email (use {"{{nome_contacto}}"} e {"{{empresa}}"})</label>
            <textarea style={{ ...inputStyle, minHeight: "200px", resize: "vertical" as const }} value={emails[activeEmail].corpo} onChange={e => setEmails(em => em.map((x, i) => i === activeEmail ? { ...x, corpo: e.target.value } : x))} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button style={btnPrimary} onClick={save} disabled={createMut.isPending || updateMut.isPending || !nome}>
          {createMut.isPending || updateMut.isPending ? "A guardar..." : seqId ? "Actualizar" : "Criar Sequência"}
        </button>
        <button style={btnSecondary} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── TAB: CONTACTOS ──────────────────────────────────────────────────────────
function ContactosTab() {
  const [segmento, setSegmento] = useState<"todos" | "geral" | "np4552" | "outro" | "clientes" | "em_tratamento" | "reuniao_agendada" | "proposta_enviada" | "proposta_adjudicada" | "won" | "renovacoes_pendente" | "contratos_renovados" | "contratos_terminados" | "servicos_isolados" | "perdido" | "teste">("todos");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data, refetch } = trpc.outreach.contactos.list.useQuery({ segmento, page, search: search || undefined });
  const { data: statsColab } = trpc.outreach.contactos.statsColaboradores.useQuery({ segmento });
  const importMut = trpc.outreach.contactos.importFromOdoo.useMutation({ onSuccess: () => refetch() });
  const deleteMut = trpc.outreach.contactos.delete.useMutation({ onSuccess: () => refetch() });
  const descartarMut = trpc.outreach.contactos.descartar.useMutation({ onSuccess: () => refetch() });

  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div>
      {/* Barra de pesquisa global */}
      <div style={{ marginBottom: "1rem" }}>
        <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(1); }} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou empresa em todos os segmentos..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ ...inputStyle, flex: 1, fontSize: "0.85rem" }}
          />
          <button type="submit" style={{ ...btnPrimary, fontSize: "0.82rem", padding: "0.5rem 1rem" }}>Pesquisar</button>
          {search && (
            <button type="button" style={{ ...btnSecondary, fontSize: "0.82rem", padding: "0.5rem 0.75rem" }} onClick={() => { setSearch(""); setSearchInput(""); setPage(1); setSegmento("todos"); }}>Limpar</button>
          )}
        </form>
        {search && (
          <p style={{ fontFamily: font, fontSize: "0.78rem", color: "#6B7280", marginTop: "0.4rem" }}>A mostrar resultados para <strong>"{search}"</strong> em todos os segmentos — {total} resultado(s)</p>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <p style={sectionTitle}>Contactos ({total})</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select style={{ ...inputStyle, width: "auto" }} value={segmento} onChange={e => { setSegmento(e.target.value as any); setPage(1); }}>
            <option value="todos">Todos os segmentos</option>
            <optgroup label="Segmentos Gerais">
              <option value="geral">Geral</option>
              <option value="np4552">NP4552</option>
              <option value="clientes">Clientes</option>
              <option value="outro">Outro</option>
            </optgroup>
            <optgroup label="Pipeline CRM">
              <option value="em_tratamento">Em Tratamento</option>
              <option value="reuniao_agendada">Reunião Agendada</option>
              <option value="proposta_enviada">Proposta Enviada</option>
              <option value="proposta_adjudicada">Proposta Adjudicada</option>
              <option value="won">Won</option>
              <option value="renovacoes_pendente">Renovações Pendente</option>
              <option value="contratos_renovados">Contratos Renovados</option>
              <option value="contratos_terminados">Contratos Terminados</option>
              <option value="servicos_isolados">Serviços Isolados</option>
              <option value="perdido">Perdido (Lost)</option>
            </optgroup>
            <optgroup label="Outros">
              <option value="teste">Teste</option>
            </optgroup>
          </select>
          <button style={{ ...btnSecondary, fontSize: "0.72rem" }} onClick={() => importMut.mutate({ segmento: "np4552" })} disabled={importMut.isPending}>
            {importMut.isPending ? "A importar..." : "Importar NP4552 do Odoo"}
          </button>
          <button style={{ ...btnSecondary, fontSize: "0.72rem" }} onClick={() => importMut.mutate({ segmento: "geral" })} disabled={importMut.isPending}>
            {importMut.isPending ? "A importar..." : "Importar Clientes do Odoo"}
          </button>
        </div>
      </div>

      {importMut.data && (
        <p style={{ fontFamily: font, fontSize: "0.82rem", color: "#065F46", marginBottom: "1rem" }}>✅ {importMut.data.importados} contactos importados</p>
      )}

      {/* Gráfico de distribuição por nº de colaboradores */}
      {statsColab && (
        <div style={{ ...card, marginBottom: "1.5rem" }}>
          <p style={sectionTitle}>Distribuição por Nº de Colaboradores</p>
          {(() => {
            const comDados = statsColab.total - statsColab.semDados;
            const chartData = statsColab.data.filter(d => d.total > 0);
            return (
              <>
                <p style={{ fontFamily: font, fontSize: "0.78rem", color: "#6B7280", marginBottom: "1rem" }}>
                  <strong style={{ color: "#0A1A2A" }}>{comDados}</strong> contactos com dados de colaboradores de <strong style={{ color: "#0A1A2A" }}>{statsColab.total}</strong> total
                  {statsColab.semDados > 0 && <span style={{ marginLeft: "0.5rem", color: "#9CA3AF" }}>({statsColab.semDados} sem dados)</span>}
                </p>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={statsColab.data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontFamily: font, fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontFamily: font, fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip
                        contentStyle={{ fontFamily: font, fontSize: "0.78rem", border: "1px solid #E5EEF4", borderRadius: 0 }}
                        formatter={(value: number) => [value + " contactos", "Total"]}
                        cursor={{ fill: "#F9FAFB" }}
                      />
                      <Bar dataKey="total" radius={[2, 2, 0, 0]}>
                        {statsColab.data.map((entry, index) => (
                          <Cell key={index} fill={entry.total > 0 ? "#DB5C34" : "#E5EEF4"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ fontFamily: font, fontSize: "0.82rem", color: "#9CA3AF", textAlign: "center", padding: "2rem 0" }}>Sem dados de colaboradores para este segmento.</p>
                )}
              </>
            );
          })()}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "3rem" }}>
          <p style={{ fontFamily: font, color: "#6B7280" }}>Sem contactos neste segmento. Importe do Odoo ou adicione manualmente.</p>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E5EEF4" }}>
              {["Nome", "Email", "Empresa", "Nº Colab.", ...(segmento === "perdido" ? ["Motivo Perda"] : ["Segmento"]), "Estado", "Acções"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #F3F4F6", opacity: c.descartado ? 0.4 : 1 }}>
                <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, color: "#0A1A2A" }}>{c.nome}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#25749F" }}>{c.email}</td>
                <td style={{ padding: "0.6rem 0.75rem", color: "#6B7280" }}>{c.empresa || "—"}</td>
                <td style={{ padding: "0.6rem 0.75rem", textAlign: "center", fontWeight: 600, color: c.numColaboradores ? "#0A1A2A" : "#D1D5DB", fontSize: "0.82rem" }}>
                  {c.numColaboradores ? c.numColaboradores.toLocaleString("pt-PT") : "—"}
                </td>
                {segmento === "perdido" ? (
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    {c.motivoPerda ? (
                      <span style={{ background: "#FEF2F2", color: "#991B1B", padding: "0.15rem 0.5rem", fontSize: "0.7rem", borderRadius: "3px" }}>{c.motivoPerda}</span>
                    ) : (
                      <span style={{ color: "#D1D5DB", fontSize: "0.7rem" }}>Sem motivo</span>
                    )}
                  </td>
                ) : (
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    <span style={{ background: "#F3F4F6", padding: "0.15rem 0.5rem", fontSize: "0.7rem", color: "#6B7280" }}>{SEG_LABELS[c.segmento]}</span>
                  </td>
                )}
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  {c.descartado ? <span style={{ color: "#991B1B", fontSize: "0.72rem" }}>Descartado</span> : <span style={{ color: "#065F46", fontSize: "0.72rem" }}>Activo</span>}
                </td>
                <td style={{ padding: "0.6rem 0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {!c.descartado && (
                      <button style={{ background: "none", border: "1px solid #D0E2EC", padding: "0.2rem 0.5rem", fontFamily: font, fontSize: "0.68rem", cursor: "pointer", color: "#6B7280" }} onClick={() => descartarMut.mutate({ id: c.id })}>
                        Descartar
                      </button>
                    )}
                    <button style={{ background: "none", border: "1px solid #FECACA", padding: "0.2rem 0.5rem", fontFamily: font, fontSize: "0.68rem", cursor: "pointer", color: "#991B1B" }} onClick={() => { if (confirm("Apagar contacto?")) deleteMut.mutate({ id: c.id }); }}>
                      Apagar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginação */}
      {pages > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.5rem" }}>
          <button style={btnSecondary} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
          <span style={{ fontFamily: font, fontSize: "0.82rem", color: "#6B7280", padding: "0.55rem 0.75rem" }}>Página {page} de {pages}</span>
          <button style={btnSecondary} disabled={page === pages} onClick={() => setPage(p => p + 1)}>Seguinte →</button>
        </div>
      )}
    </div>
  );
}
