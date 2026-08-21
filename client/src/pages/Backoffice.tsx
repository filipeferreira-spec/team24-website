import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { FileUpload } from "@/components/FileUpload";
import BackofficeOutreach from "./BackofficeOutreach";
import ContasSection from "@/components/ContasSection";

type Section = "recursos" | "casos" | "imprensa" | "carreiras" | "questionarios" | "candidaturas" | "envio_massa" | "outreach" | "contas";

const SECTIONS: { id: Section; label: string; group?: string }[] = [
  { id: "recursos", label: "Recursos" },
  { id: "casos", label: "Casos de Sucesso" },
  { id: "imprensa", label: "Imprensa" },
  { id: "carreiras", label: "Carreiras" },
  { id: "candidaturas", label: "Candidaturas" },
  { id: "questionarios", label: "Questionários" },
  { id: "outreach", label: "Campanhas Outreach", group: "comercial" },
  { id: "contas", label: "Contas de acesso" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: "0.9rem",
  color: "#0A1A2A",
  background: "white",
  border: "1px solid #D0E2EC",
  padding: "0.6rem 0.75rem",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "#6B7280",
  marginBottom: "0.35rem",
};

const btnPrimary: React.CSSProperties = {
  background: "#DB5C34",
  color: "white",
  border: "none",
  padding: "0.6rem 1.25rem",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 700,
  fontSize: "0.78rem",
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  background: "transparent",
  color: "#25749F",
  border: "1px solid #25749F",
  padding: "0.5rem 1rem",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 600,
  fontSize: "0.75rem",
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  background: "transparent",
  color: "#DC2626",
  border: "1px solid #FECACA",
  padding: "0.4rem 0.75rem",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 600,
  fontSize: "0.72rem",
  cursor: "pointer",
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,26,42,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "white", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: "1.3rem", color: "#0A1A2A", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#9CA3AF" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ value, trueLabel = "Publicado", falseLabel = "Rascunho" }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span style={{ background: value ? "#D1FAE5" : "#FEE2E2", color: value ? "#065F46" : "#991B1B", padding: "0.2rem 0.5rem", fontSize: "0.7rem", fontWeight: 700 }}>
      {value ? trueLabel : falseLabel}
    </span>
  );
}

// ─── RECURSOS ─────────────────────────────────────────────────────────────────

function RecursosSection() {
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const { data: list = [], isLoading, error } = trpc.backoffice.recursos.list.useQuery(undefined, { retry: false });

  useEffect(() => {
    if ((error as any)?.data?.code === 'UNAUTHORIZED') navigate('/backoffice/login');
  }, [error]);
  const createMut = trpc.backoffice.recursos.create.useMutation({ onSuccess: () => { utils.backoffice.recursos.list.invalidate(); setShowModal(false); resetForm(); } });
  const updateMut = trpc.backoffice.recursos.update.useMutation({ onSuccess: () => { utils.backoffice.recursos.list.invalidate(); setShowModal(false); setEditing(null); } });
  const deleteMut = trpc.backoffice.recursos.delete.useMutation({ onSuccess: () => utils.backoffice.recursos.list.invalidate() });
  const toggleMut = trpc.backoffice.recursos.togglePublicado.useMutation({ onSuccess: () => utils.backoffice.recursos.list.invalidate() });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const emptyForm = { titulo: "", descricao: "", tipo: "artigo" as any, tema: "", imageUrl: "", downloadUrl: "", isPremium: false, isNovo: false, publicado: false };
  const [form, setForm] = useState(emptyForm);
  const resetForm = () => setForm(emptyForm);

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ titulo: item.titulo, descricao: item.descricao || "", tipo: item.tipo, tema: item.tema || "", imageUrl: item.imageUrl || "", downloadUrl: item.downloadUrl || "", isPremium: item.isPremium, isNovo: item.isNovo, publicado: item.publicado });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing.id, ...form });
    else createMut.mutate(form);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: "1.5rem", color: "#0A1A2A", margin: 0 }}>Recursos</h2>
        <button style={btnPrimary} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>+ Novo Recurso</button>
      </div>
      {isLoading ? <p style={{ color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>A carregar...</p> : (
        <div style={{ background: "white", border: "1px solid #E5EEF4" }}>
          {list.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nenhum recurso criado ainda. Clique em "+ Novo Recurso" para começar.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E5EEF4", background: "#F8FAFB" }}>
                  {["Título", "Tipo", "Tema", "Premium", "Publicado", "Ações"].map(h => <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {list.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #F0F7FB" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#0A1A2A", fontWeight: 600 }}>{item.titulo}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280" }}>{item.tipo}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280" }}>{item.tema || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}><StatusBadge value={item.isPremium} trueLabel="Sim" falseLabel="Não" /></td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => toggleMut.mutate({ id: item.id, publicado: !item.publicado })}
                        disabled={toggleMut.isPending}
                        style={{ background: item.publicado ? "#D1FAE5" : "#FEE2E2", color: item.publicado ? "#065F46" : "#991B1B", border: "none", padding: "0.25rem 0.6rem", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {item.publicado ? "✓ Publicado" : "Rascunho — Publicar"}
                      </button>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem" }}>
                      <button style={btnSecondary} onClick={() => openEdit(item)}>Editar</button>
                      <button style={btnDanger} onClick={() => { if (confirm("Eliminar este recurso?")) deleteMut.mutate({ id: item.id }); }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {showModal && (
        <Modal title={editing ? "Editar Recurso" : "Novo Recurso"} onClose={() => { setShowModal(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div><label style={labelStyle}>Título *</label><input required style={inputStyle} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} /></div>
            <div><label style={labelStyle}>Descrição</label><textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>Tipo *</label>
                <select style={inputStyle} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any }))}>
                  {["ebook", "artigo", "webinar", "ferramenta", "guia", "template"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Tema</label><input style={inputStyle} value={form.tema} onChange={e => setForm(f => ({ ...f, tema: e.target.value }))} /></div>
            </div>
            <FileUpload
              label="Imagem de Capa"
              accept="image/*"
              folder="recursos/imagens"
              currentUrl={form.imageUrl}
              onUpload={(url) => setForm(f => ({ ...f, imageUrl: url }))}
              maxSizeMB={5}
            />
            {form.imageUrl && (
              <div style={{ marginTop: "-0.5rem" }}>
                <label style={labelStyle}>URL da Imagem (pode editar manualmente)</label>
                <input style={inputStyle} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
              </div>
            )}
            <FileUpload
              label="Ficheiro para Download (PDF / E-book)"
              accept=".pdf,application/pdf"
              folder="recursos/ficheiros"
              currentUrl={form.downloadUrl}
              onUpload={(url) => setForm(f => ({ ...f, downloadUrl: url }))}
              maxSizeMB={50}
            />
            {form.downloadUrl && (
              <div style={{ marginTop: "-0.5rem" }}>
                <label style={labelStyle}>URL do Ficheiro (pode editar manualmente)</label>
                <input style={inputStyle} value={form.downloadUrl} onChange={e => setForm(f => ({ ...f, downloadUrl: e.target.value }))} placeholder="https://..." />
              </div>
            )}
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {[["isPremium", "Premium"], ["isNovo", "Novo"], ["publicado", "Publicado"]].map(([k, l]) => (
                <label key={k} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} /> {l}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" style={btnSecondary} onClick={() => { setShowModal(false); setEditing(null); }}>Cancelar</button>
              <button type="submit" style={btnPrimary} disabled={createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "A guardar..." : "Guardar"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── CASOS ────────────────────────────────────────────────────────────────────

function CasosSection() {
  const utils = trpc.useUtils();
  const { data: list = [], isLoading } = trpc.backoffice.casos.list.useQuery();
  const createMut = trpc.backoffice.casos.create.useMutation({ onSuccess: () => { utils.backoffice.casos.list.invalidate(); setShowModal(false); resetForm(); } });
  const updateMut = trpc.backoffice.casos.update.useMutation({ onSuccess: () => { utils.backoffice.casos.list.invalidate(); setShowModal(false); setEditing(null); } });
  const deleteMut = trpc.backoffice.casos.delete.useMutation({ onSuccess: () => utils.backoffice.casos.list.invalidate() });
  const toggleMut = trpc.backoffice.casos.togglePublicado.useMutation({ onSuccess: () => utils.backoffice.casos.list.invalidate() });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const emptyForm = { empresa: "", setor: "", resultado: "", descricao: "", citacao: "", citacaoAutor: "", citacaoRole: "", logoUrl: "", imagemUrl: "", metrica1Label: "", metrica1Valor: "", metrica2Label: "", metrica2Valor: "", metrica3Label: "", metrica3Valor: "", destaque: false, publicado: false };
  const [form, setForm] = useState(emptyForm);
  const resetForm = () => setForm(emptyForm);

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ empresa: item.empresa, setor: item.setor || "", resultado: item.resultado || "", descricao: item.descricao || "", citacao: item.citacao || "", citacaoAutor: item.citacaoAutor || "", citacaoRole: item.citacaoRole || "", logoUrl: item.logoUrl || "", imagemUrl: item.imagemUrl || "", metrica1Label: item.metrica1Label || "", metrica1Valor: item.metrica1Valor || "", metrica2Label: item.metrica2Label || "", metrica2Valor: item.metrica2Valor || "", metrica3Label: item.metrica3Label || "", metrica3Valor: item.metrica3Valor || "", destaque: item.destaque, publicado: item.publicado });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing.id, ...form });
    else createMut.mutate(form);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: "1.5rem", color: "#0A1A2A", margin: 0 }}>Casos de Sucesso</h2>
        <button style={btnPrimary} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>+ Novo Caso</button>
      </div>
      {isLoading ? <p style={{ color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>A carregar...</p> : (
        <div style={{ background: "white", border: "1px solid #E5EEF4" }}>
          {list.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nenhum caso criado ainda. Clique em "+ Novo Caso" para começar.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E5EEF4", background: "#F8FAFB" }}>
                  {["Empresa", "Setor", "Resultado", "Destaque", "Publicado", "Ações"].map(h => <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {list.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #F0F7FB" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#0A1A2A", fontWeight: 600 }}>{item.empresa}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280" }}>{item.setor || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.resultado || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}><StatusBadge value={item.destaque} trueLabel="Sim" falseLabel="Não" /></td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => toggleMut.mutate({ id: item.id, publicado: !item.publicado })}
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.3rem 0.75rem",
                          borderRadius: "2px",
                          border: "none",
                          cursor: "pointer",
                          background: item.publicado ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                          color: item.publicado ? "#059669" : "#DC2626",
                        }}
                      >
                        {item.publicado ? "Publicado" : "Rascunho — Publicar"}
                      </button>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem" }}>
                      <button style={btnSecondary} onClick={() => openEdit(item)}>Editar</button>
                      <button style={btnDanger} onClick={() => { if (confirm("Eliminar este caso?")) deleteMut.mutate({ id: item.id }); }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {showModal && (
        <Modal title={editing ? "Editar Caso" : "Novo Caso de Sucesso"} onClose={() => { setShowModal(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>Empresa *</label><input required style={inputStyle} value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} /></div>
              <div><label style={labelStyle}>Setor</label><input style={inputStyle} value={form.setor} onChange={e => setForm(f => ({ ...f, setor: e.target.value }))} /></div>
            </div>
            <div><label style={labelStyle}>Resultado (resumo)</label><input style={inputStyle} value={form.resultado} onChange={e => setForm(f => ({ ...f, resultado: e.target.value }))} placeholder="ex: 40% menos absentismo em 6 meses" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <FileUpload
                label="Logo da Empresa"
                accept="image/*"
                currentUrl={form.logoUrl}
                onUpload={(url) => setForm(f => ({ ...f, logoUrl: url }))}
              />
              <FileUpload
                label="Imagem de Capa"
                accept="image/*"
                currentUrl={form.imagemUrl}
                onUpload={(url) => setForm(f => ({ ...f, imagemUrl: url }))}
              />
            </div>
            <div><label style={labelStyle}>Descrição</label><textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} /></div>
            <div><label style={labelStyle}>Citação</label><textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.citacao} onChange={e => setForm(f => ({ ...f, citacao: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>Autor da Citação</label><input style={inputStyle} value={form.citacaoAutor} onChange={e => setForm(f => ({ ...f, citacaoAutor: e.target.value }))} /></div>
              <div><label style={labelStyle}>Cargo</label><input style={inputStyle} value={form.citacaoRole} onChange={e => setForm(f => ({ ...f, citacaoRole: e.target.value }))} /></div>
            </div>
            <div style={{ borderTop: "1px solid #E5EEF4", paddingTop: "1rem" }}>
              <p style={{ ...labelStyle, marginBottom: "0.75rem" }}>Métricas de Impacto</p>
              {[1, 2, 3].map(n => (
                <div key={n} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div><label style={labelStyle}>Métrica {n} — Label</label><input style={inputStyle} value={(form as any)[`metrica${n}Label`]} onChange={e => setForm(f => ({ ...f, [`metrica${n}Label`]: e.target.value }))} placeholder="ex: Redução de absentismo" /></div>
                  <div><label style={labelStyle}>Valor</label><input style={inputStyle} value={(form as any)[`metrica${n}Valor`]} onChange={e => setForm(f => ({ ...f, [`metrica${n}Valor`]: e.target.value }))} placeholder="ex: 40%" /></div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {[["destaque", "Destaque"], ["publicado", "Publicado"]].map(([k, l]) => (
                <label key={k} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} /> {l}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" style={btnSecondary} onClick={() => { setShowModal(false); setEditing(null); }}>Cancelar</button>
              <button type="submit" style={btnPrimary} disabled={createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "A guardar..." : "Guardar"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── IMPRENSA ─────────────────────────────────────────────────────────────────

function ImprensaSection() {
  const utils = trpc.useUtils();
  const { data: list = [], isLoading } = trpc.backoffice.imprensa.list.useQuery();
  const createMut = trpc.backoffice.imprensa.create.useMutation({ onSuccess: () => { utils.backoffice.imprensa.list.invalidate(); setShowModal(false); resetForm(); } });
  const updateMut = trpc.backoffice.imprensa.update.useMutation({ onSuccess: () => { utils.backoffice.imprensa.list.invalidate(); setShowModal(false); setEditing(null); } });
  const deleteMut = trpc.backoffice.imprensa.delete.useMutation({ onSuccess: () => utils.backoffice.imprensa.list.invalidate() });
  const toggleMut = trpc.backoffice.imprensa.togglePublicado.useMutation({ onSuccess: () => utils.backoffice.imprensa.list.invalidate() });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const emptyForm = { titulo: "", publicacao: "", tipo: "artigo" as any, resumo: "", url: "", dataPublicacao: "", destaque: false, publicado: false };
  const [form, setForm] = useState(emptyForm);
  const resetForm = () => setForm(emptyForm);

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ titulo: item.titulo, publicacao: item.publicacao, tipo: item.tipo, resumo: item.resumo || "", url: item.url || "", dataPublicacao: item.dataPublicacao ? new Date(item.dataPublicacao).toISOString().split("T")[0] : "", destaque: item.destaque, publicado: item.publicado });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing.id, ...form });
    else createMut.mutate(form);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: "1.5rem", color: "#0A1A2A", margin: 0 }}>Imprensa</h2>
        <button style={btnPrimary} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>+ Nova Notícia</button>
      </div>
      {isLoading ? <p style={{ color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>A carregar...</p> : (
        <div style={{ background: "white", border: "1px solid #E5EEF4" }}>
          {list.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nenhuma notícia criada ainda. Clique em "+ Nova Notícia" para começar.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E5EEF4", background: "#F8FAFB" }}>
                  {["Título", "Publicação", "Tipo", "Data", "Publicado", "Ações"].map(h => <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {list.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #F0F7FB" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#0A1A2A", fontWeight: 600, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.titulo}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280" }}>{item.publicacao}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280" }}>{item.tipo}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280" }}>{item.dataPublicacao ? new Date(item.dataPublicacao).toLocaleDateString("pt-PT") : "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => toggleMut.mutate({ id: item.id, publicado: !item.publicado })}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: "2px", border: "none", cursor: "pointer", background: item.publicado ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: item.publicado ? "#059669" : "#DC2626" }}
                      >
                        {item.publicado ? "Publicado" : "Rascunho — Publicar"}
                      </button>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem" }}>
                      <button style={btnSecondary} onClick={() => openEdit(item)}>Editar</button>
                      <button style={btnDanger} onClick={() => { if (confirm("Eliminar esta notícia?")) deleteMut.mutate({ id: item.id }); }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {showModal && (
        <Modal title={editing ? "Editar Notícia" : "Nova Notícia de Imprensa"} onClose={() => { setShowModal(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div><label style={labelStyle}>Título *</label><input required style={inputStyle} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>Publicação *</label><input required style={inputStyle} value={form.publicacao} onChange={e => setForm(f => ({ ...f, publicacao: e.target.value }))} placeholder="ex: Público, Expresso" /></div>
              <div><label style={labelStyle}>Tipo *</label>
                <select style={inputStyle} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any }))}>
                  {["artigo", "entrevista", "comunicado", "mencao"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div><label style={labelStyle}>Resumo</label><textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.resumo} onChange={e => setForm(f => ({ ...f, resumo: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>URL do Artigo</label><input style={inputStyle} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." /></div>
              <div><label style={labelStyle}>Data de Publicação</label><input type="date" style={inputStyle} value={form.dataPublicacao} onChange={e => setForm(f => ({ ...f, dataPublicacao: e.target.value }))} /></div>
            </div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {[["destaque", "Destaque"], ["publicado", "Publicado"]].map(([k, l]) => (
                <label key={k} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} /> {l}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" style={btnSecondary} onClick={() => { setShowModal(false); setEditing(null); }}>Cancelar</button>
              <button type="submit" style={btnPrimary} disabled={createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "A guardar..." : "Guardar"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── CARREIRAS ────────────────────────────────────────────────────────────────

function CarreirasSection() {
  const utils = trpc.useUtils();
  const { data: list = [], isLoading } = trpc.backoffice.carreiras.list.useQuery();
  const createMut = trpc.backoffice.carreiras.create.useMutation({ onSuccess: () => { utils.backoffice.carreiras.list.invalidate(); setShowModal(false); resetForm(); } });
  const updateMut = trpc.backoffice.carreiras.update.useMutation({ onSuccess: () => { utils.backoffice.carreiras.list.invalidate(); setShowModal(false); setEditing(null); } });
  const deleteMut = trpc.backoffice.carreiras.delete.useMutation({ onSuccess: () => utils.backoffice.carreiras.list.invalidate() });
  const toggleMut = trpc.backoffice.carreiras.togglePublicado.useMutation({ onSuccess: () => utils.backoffice.carreiras.list.invalidate() });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const emptyForm = { titulo: "", departamento: "", localizacao: "Lisboa, Portugal", tipo: "full-time" as any, nivel: "medio" as any, descricao: "", requisitos: "", beneficios: "", salarioMin: undefined as number | undefined, salarioMax: undefined as number | undefined, ativo: true, publicado: false };
  const [form, setForm] = useState(emptyForm);
  const resetForm = () => setForm(emptyForm);

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ titulo: item.titulo, departamento: item.departamento || "", localizacao: item.localizacao || "", tipo: item.tipo, nivel: item.nivel || "medio", descricao: item.descricao || "", requisitos: item.requisitos || "", beneficios: item.beneficios || "", salarioMin: item.salarioMin || undefined, salarioMax: item.salarioMax || undefined, ativo: item.ativo, publicado: item.publicado });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing.id, ...form });
    else createMut.mutate(form);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: "1.5rem", color: "#0A1A2A", margin: 0 }}>Carreiras</h2>
        <button style={btnPrimary} onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>+ Nova Vaga</button>
      </div>
      {isLoading ? <p style={{ color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>A carregar...</p> : (
        <div style={{ background: "white", border: "1px solid #E5EEF4" }}>
          {list.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nenhuma vaga criada ainda. Clique em "+ Nova Vaga" para começar.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E5EEF4", background: "#F8FAFB" }}>
                  {["Título", "Departamento", "Tipo", "Nível", "Publicado", "Ações"].map(h => <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {list.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #F0F7FB" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#0A1A2A", fontWeight: 600 }}>{item.titulo}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280" }}>{item.departamento || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280" }}>{item.tipo}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280" }}>{item.nivel || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => toggleMut.mutate({ id: item.id, publicado: !item.publicado })}
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: "2px", border: "none", cursor: "pointer", background: item.publicado ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: item.publicado ? "#059669" : "#DC2626" }}
                      >
                        {item.publicado ? "Publicado" : "Rascunho — Publicar"}
                      </button>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem" }}>
                      <button style={btnSecondary} onClick={() => openEdit(item)}>Editar</button>
                      <button style={btnDanger} onClick={() => { if (confirm("Eliminar esta vaga?")) deleteMut.mutate({ id: item.id }); }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {showModal && (
        <Modal title={editing ? "Editar Vaga" : "Nova Vaga"} onClose={() => { setShowModal(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div><label style={labelStyle}>Título *</label><input required style={inputStyle} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="ex: Psicólogo Clínico Sénior" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>Departamento</label><input style={inputStyle} value={form.departamento} onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))} /></div>
              <div><label style={labelStyle}>Localização</label><input style={inputStyle} value={form.localizacao} onChange={e => setForm(f => ({ ...f, localizacao: e.target.value }))} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>Tipo *</label>
                <select style={inputStyle} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any }))}>
                  {["full-time", "part-time", "freelance", "estagio"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Nível</label>
                <select style={inputStyle} value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value as any }))}>
                  {["junior", "medio", "senior", "lead", "diretor"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div><label style={labelStyle}>Descrição</label><textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} /></div>
            <div><label style={labelStyle}>Requisitos</label><textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.requisitos} onChange={e => setForm(f => ({ ...f, requisitos: e.target.value }))} placeholder="Um requisito por linha" /></div>
            <div><label style={labelStyle}>Benefícios</label><textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.beneficios} onChange={e => setForm(f => ({ ...f, beneficios: e.target.value }))} placeholder="Um benefício por linha" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>Salário Mínimo (€)</label><input type="number" style={inputStyle} value={form.salarioMin || ""} onChange={e => setForm(f => ({ ...f, salarioMin: e.target.value ? parseInt(e.target.value) : undefined }))} /></div>
              <div><label style={labelStyle}>Salário Máximo (€)</label><input type="number" style={inputStyle} value={form.salarioMax || ""} onChange={e => setForm(f => ({ ...f, salarioMax: e.target.value ? parseInt(e.target.value) : undefined }))} /></div>
            </div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {[["ativo", "Ativo"], ["publicado", "Publicado"]].map(([k, l]) => (
                <label key={k} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} /> {l}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" style={btnSecondary} onClick={() => { setShowModal(false); setEditing(null); }}>Cancelar</button>
              <button type="submit" style={btnPrimary} disabled={createMut.isPending || updateMut.isPending}>{createMut.isPending || updateMut.isPending ? "A guardar..." : "Guardar"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Backoffice() {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>("recursos");
  const { data: meData, isLoading: meLoading } = trpc.backoffice.me.useQuery();
  const logoutMut = trpc.backoffice.logout.useMutation({ onSuccess: () => navigate("/backoffice/login") });

  useEffect(() => {
    if (!meLoading && meData && !meData.loggedIn) {
      navigate("/backoffice/login");
    }
  }, [meData, meLoading]);

  if (meLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A1A2A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>A verificar sessão...</p>
      </div>
    );
  }

  if (!meData?.loggedIn) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", minHeight: "100vh", background: "#0A1A2A", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "1.75rem 1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "32px", height: "32px", background: "#DB5C34", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>T</div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "white" }}>TEAM 24</span>
          </div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: "0.35rem" }}>Backoffice</div>
        </div>
        <nav style={{ padding: "1rem 0", flex: 1 }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ width: "100%", textAlign: "left", background: activeSection === s.id ? "rgba(219,92,52,0.12)" : "transparent", border: "none", borderLeft: activeSection === s.id ? "3px solid #DB5C34" : "3px solid transparent", padding: "0.75rem 1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: activeSection === s.id ? 700 : 400, fontSize: "0.85rem", color: activeSection === s.id ? "white" : "rgba(255,255,255,0.45)", cursor: "pointer" }}>
              {s.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.5rem" }}>{meData.username}</div>
          <button onClick={() => logoutMut.mutate()} style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", padding: "0.4rem 0.75rem", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", cursor: "pointer", width: "100%" }}>Terminar Sessão</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, background: "#F8FAFB", minHeight: "100vh", overflowY: "auto" }}>
        <div style={{ background: "white", borderBottom: "1px solid #E5EEF4", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#0A1A2A", margin: 0 }}>{SECTIONS.find(s => s.id === activeSection)?.label}</h1>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "#25749F", textDecoration: "none" }}>Ver site →</a>
        </div>
        <div style={{ padding: "2rem" }}>
          {activeSection === "recursos" && <RecursosSection />}
          {activeSection === "casos" && <CasosSection />}
          {activeSection === "imprensa" && <ImprensaSection />}
          {activeSection === "carreiras" && <CarreirasSection />}
          {activeSection === "candidaturas" && <CandidaturasSection />}
          {activeSection === "questionarios" && <QuestionariosSection />}
          {activeSection === "envio_massa" && <EnvioMassaSection />}
          {activeSection === "outreach" && <BackofficeOutreach />}
          {activeSection === "contas" && <ContasSection />}
        </div>
      </main>
    </div>
  );
}

function CandidaturasSection() {
  const { data: allCandidaturas = [], refetch } = trpc.backoffice.candidaturas.list.useQuery();
  const deleteCandidatura = trpc.backoffice.candidaturas.delete.useMutation({ onSuccess: () => refetch() });

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

  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroQuestionario, setFiltroQuestionario] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroClassificacao, setFiltroClassificacao] = useState("");
  const [ordenacao, setOrdenacao] = useState<"recente" | "antiga" | "nota_desc" | "nota_asc">("recente");
  const [, navigate] = useLocation();

  const areasUnicas = Array.from(
    new Set((allCandidaturas as any[]).map((c) => c.carreiraDepartamento).filter(Boolean))
  ).sort() as string[];

  const candidaturas = (allCandidaturas as any[])
    .filter((c) => {
      const q = search.toLowerCase();
      if (q && !c.nome.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !(c.carreiraTitulo || "").toLowerCase().includes(q)) return false;
      if (filtroEstado && c.estado !== filtroEstado) return false;
      if (filtroArea && c.carreiraDepartamento !== filtroArea) return false;
      if (filtroQuestionario === "respondido" && !c.questionarioRespondido) return false;
      if (filtroQuestionario === "aguarda" && (!c.questionarioEnviado || c.questionarioRespondido)) return false;
      if (filtroQuestionario === "sem" && c.questionarioEnviado) return false;
      if (filtroTipo === "espontanea" && c.carreiraId) return false;
      if (filtroTipo === "vaga" && !c.carreiraId) return false;
      if (filtroClassificacao === "sem") { if (c.classificacao) return false; }
      else if (filtroClassificacao === "baixa") { if (!c.classificacao || c.classificacao > 4) return false; }
      else if (filtroClassificacao === "media") { if (!c.classificacao || c.classificacao < 5 || c.classificacao > 6) return false; }
      else if (filtroClassificacao === "boa") { if (!c.classificacao || c.classificacao < 7 || c.classificacao > 8) return false; }
      else if (filtroClassificacao === "excelente") { if (!c.classificacao || c.classificacao < 9) return false; }
      return true;
    })
    .sort((a, b) => {
      if (ordenacao === "nota_desc") return (b.classificacao || 0) - (a.classificacao || 0);
      if (ordenacao === "nota_asc") return (a.classificacao || 0) - (b.classificacao || 0);
      const da = new Date(a.createdAt).getTime();
      const db2 = new Date(b.createdAt).getTime();
      return ordenacao === "recente" ? db2 - da : da - db2;
    });

  const activeFilters = [filtroEstado, filtroArea, filtroQuestionario, filtroTipo, filtroClassificacao, search].filter(Boolean).length;

  const selStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.8rem",
    color: "#374151",
    background: "white",
    border: "1px solid #D0E2EC",
    padding: "0.45rem 0.65rem",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: "1.5rem", color: "#0A1A2A", margin: 0 }}>Candidaturas Recebidas</h2>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#6B7280" }}>
          {candidaturas.length} de {allCandidaturas.length} candidatura{allCandidaturas.length !== 1 ? "s" : ""}
          {activeFilters > 0 && (
            <span style={{ marginLeft: "0.5rem", background: "#DB5C34", color: "white", borderRadius: "999px", padding: "0.1rem 0.5rem", fontSize: "0.7rem" }}>
              {activeFilters} filtro{activeFilters > 1 ? "s" : ""}
            </span>
          )}
        </span>
      </div>

      {/* Barra de filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.5rem", padding: "0.875rem", background: "#F8FAFB", border: "1px solid #E5EEF4" }}>
        <input
          type="text"
          placeholder="Pesquisar nome, email ou vaga..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...selStyle, minWidth: "200px", flex: 1 }}
        />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={selStyle}>
          <option value="">Todos os estados</option>
          {Object.entries(estadoLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {areasUnicas.length > 0 && (
          <select value={filtroArea} onChange={e => setFiltroArea(e.target.value)} style={selStyle}>
            <option value="">Todas as áreas</option>
            {areasUnicas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={selStyle}>
          <option value="">Todos os tipos</option>
          <option value="vaga">Candidatura a vaga</option>
          <option value="espontanea">Espontânea</option>
        </select>
        <select value={filtroQuestionario} onChange={e => setFiltroQuestionario(e.target.value)} style={selStyle}>
          <option value="">Questionário (todos)</option>
          <option value="respondido">✓ Respondido</option>
          <option value="aguarda">⏳ Aguarda resposta</option>
          <option value="sem">— Sem questionário</option>
        </select>
        <select value={filtroClassificacao} onChange={e => setFiltroClassificacao(e.target.value)} style={selStyle}>
          <option value="">Nota (todas)</option>
          <option value="excelente">🟢 Excelente (9-10)</option>
          <option value="boa">🔵 Boa (7-8)</option>
          <option value="media">🟡 Média (5-6)</option>
          <option value="baixa">🔴 Baixa (1-4)</option>
          <option value="sem">— Sem classificação</option>
        </select>
        <select value={ordenacao} onChange={e => setOrdenacao(e.target.value as any)} style={selStyle}>
          <option value="recente">Mais recentes</option>
          <option value="antiga">Mais antigas</option>
          <option value="nota_desc">Nota: maior primeiro</option>
          <option value="nota_asc">Nota: menor primeiro</option>
        </select>
        {activeFilters > 0 && (
          <button
            onClick={() => { setSearch(""); setFiltroEstado(""); setFiltroArea(""); setFiltroQuestionario(""); setFiltroTipo(""); setFiltroClassificacao(""); }}
            style={{ ...selStyle, color: "#DB5C34", border: "1px solid #DB5C34", background: "white" }}
          >
            × Limpar
          </button>
        )}
      </div>

      {candidaturas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {activeFilters > 0 ? "Nenhuma candidatura corresponde aos filtros seleccionados." : "Ainda não há candidaturas recebidas."}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
                {["Nome", "Email", "Vaga / Área", "Estado", "Nota", "Questionário", "Data", "Ações"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidaturas.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => window.open(`/backoffice/candidaturas/${c.id}`, '_blank')}
                  style={{ borderBottom: "1px solid #F3F4F6", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#0A1A2A", fontWeight: 600 }}>{c.nome}</td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#25749F" }}>{c.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "#0A1A2A", fontWeight: 500 }}>
                      {c.carreiraTitulo || <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>Espontânea</span>}
                    </div>
                    {c.carreiraDepartamento && (
                      <div style={{ fontSize: "0.7rem", color: "#6B7280", marginTop: "0.1rem" }}>{c.carreiraDepartamento}</div>
                    )}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: estadoColors[c.estado] || "#6B7280", background: `${estadoColors[c.estado]}22` || "#F3F4F6", padding: "0.2rem 0.6rem" }}>
                      {estadoLabels[c.estado] || c.estado}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {(c as any).classificacao ? (
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: (c as any).classificacao <= 4 ? "#EF4444" : (c as any).classificacao <= 6 ? "#F59E0B" : (c as any).classificacao <= 8 ? "#3B82F6" : "#10B981" }}>
                        {(c as any).classificacao}/10
                      </span>
                    ) : <span style={{ color: "#D1D5DB", fontSize: "0.8rem" }}>—</span>}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {c.questionarioRespondido === true ? (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#D1FAE5", color: "#065F46", padding: "0.2rem 0.6rem" }}>✓ Respondido</span>
                    ) : c.questionarioEnviado === true ? (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#FEF3C7", color: "#92400E", padding: "0.2rem 0.6rem" }}>⏳ Aguarda</span>
                    ) : (
                      <span style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                    {new Date(c.createdAt).toLocaleDateString("pt-PT")}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { if (confirm("Eliminar candidatura?")) deleteCandidatura.mutate({ id: c.id }); }} style={btnDanger}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── QUESTIONÁRIOS SECTION ───────────────────────────────────────────────────
function QuestionariosSection() {
  const utils = trpc.useUtils();
  const { data: lista = [], isLoading } = trpc.backoffice.questionarios.list.useQuery();
  const { data: carreirasData = [] } = trpc.backoffice.carreiras.list.useQuery();
  const createMut = trpc.backoffice.questionarios.create.useMutation({
    onSuccess: () => { utils.backoffice.questionarios.list.invalidate(); setShowCreate(false); resetCreate(); },
  });
  const deleteMut = trpc.backoffice.questionarios.delete.useMutation({
    onSuccess: () => utils.backoffice.questionarios.list.invalidate(),
  });
  const addPerguntaMut = trpc.backoffice.questionarios.addPergunta.useMutation({
    onSuccess: () => { utils.backoffice.questionarios.list.invalidate(); setSelectedQ(null); },
  });

  const [showCreate, setShowCreate] = React.useState(false);
  const [selectedQ, setSelectedQ] = React.useState<number | null>(null);
  const [viewRespostas, setViewRespostas] = React.useState<number | null>(null);
  const [createForm, setCreateForm] = React.useState({ titulo: "", descricao: "", carreiraId: "" });
  const [perguntas, setPerguntas] = React.useState<{ texto: string; tipo: "texto" | "escolha_multipla" | "escala" | "sim_nao"; opcoes: string; obrigatoria: boolean }[]>([]);
  const [novaPergunta, setNovaPergunta] = React.useState({ texto: "", tipo: "texto" as "texto" | "escolha_multipla" | "escala" | "sim_nao", opcoes: "", obrigatoria: true });

  function resetCreate() {
    setCreateForm({ titulo: "", descricao: "", carreiraId: "" });
    setPerguntas([]);
    setNovaPergunta({ texto: "", tipo: "texto", opcoes: "", obrigatoria: true });
  }

  const handleCreate = () => {
    createMut.mutate({
      titulo: createForm.titulo,
      descricao: createForm.descricao || undefined,
      carreiraId: createForm.carreiraId ? Number(createForm.carreiraId) : null,
      ativo: true,
      perguntas: perguntas.map((p, i) => ({ ...p, ordem: i, opcoes: p.opcoes || undefined })),
    });
  };

  const addPerguntaToList = () => {
    if (!novaPergunta.texto.trim()) return;
    setPerguntas(prev => [...prev, { ...novaPergunta }]);
    setNovaPergunta({ texto: "", tipo: "texto", opcoes: "", obrigatoria: true });
  };

  if (isLoading) return <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>A carregar...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#6B7280" }}>{lista.length} questionário{lista.length !== 1 ? "s" : ""}</span>
        <button style={btnPrimary} onClick={() => setShowCreate(true)}>+ Novo Questionário</button>
      </div>

      {lista.length === 0 ? (
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#9CA3AF", fontSize: "0.9rem" }}>Ainda não há questionários criados.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E5EEF4" }}>
              <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", color: "#6B7280", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Título</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", color: "#6B7280", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Vaga</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", color: "#6B7280", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Estado</th>
              <th style={{ textAlign: "right", padding: "0.6rem 0.75rem", color: "#6B7280", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {(lista as any[]).map((q) => {
              const vaga = carreirasData.find((c: any) => c.id === q.carreiraId);
              return (
                <tr key={q.id} style={{ borderBottom: "1px solid #F0F4F8" }}>
                  <td style={{ padding: "0.75rem" }}><span style={{ fontWeight: 600, color: "#0A1A2A" }}>{q.titulo}</span></td>
                  <td style={{ padding: "0.75rem", color: "#6B7280" }}>{vaga ? vaga.titulo : <em>Genérico</em>}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{ background: q.ativo ? "#D1FAE5" : "#F3F4F6", color: q.ativo ? "#065F46" : "#6B7280", padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: 700, borderRadius: "2px" }}>
                      {q.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button style={btnSecondary} onClick={() => setViewRespostas(q.id)}>Respostas</button>
                    <button style={btnDanger} onClick={() => { if (confirm("Eliminar questionário?")) deleteMut.mutate({ id: q.id }); }}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Modal criar questionário */}
      {showCreate && (
        <Modal title="Novo Questionário" onClose={() => { setShowCreate(false); resetCreate(); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Título *</label>
              <input style={inputStyle} value={createForm.titulo} onChange={e => setCreateForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Questionário de Seleção — Psicólogo Clínico" />
            </div>
            <div>
              <label style={labelStyle}>Descrição (opcional)</label>
              <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={createForm.descricao} onChange={e => setCreateForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Breve descrição do questionário..." />
            </div>
            <div>
              <label style={labelStyle}>Associar a Vaga (opcional)</label>
              <select style={inputStyle} value={createForm.carreiraId} onChange={e => setCreateForm(f => ({ ...f, carreiraId: e.target.value }))}>
                <option value="">Genérico (todas as vagas)</option>
                {(carreirasData as any[]).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>

            {/* Perguntas */}
            <div style={{ borderTop: "1px solid #E5EEF4", paddingTop: "1rem" }}>
              <label style={labelStyle}>Perguntas ({perguntas.length})</label>
              {perguntas.map((p, i) => (
                <div key={i} style={{ background: "#F8FAFB", padding: "0.6rem 0.75rem", marginBottom: "0.4rem", fontSize: "0.82rem", color: "#0A1A2A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span><strong>{i + 1}.</strong> {p.texto} <em style={{ color: "#9CA3AF" }}>({p.tipo})</em></span>
                  <button style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: "1rem" }} onClick={() => setPerguntas(prev => prev.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.75rem", background: "#F0F4F8", padding: "0.75rem" }}>
                <input style={inputStyle} placeholder="Texto da pergunta *" value={novaPergunta.texto} onChange={e => setNovaPergunta(p => ({ ...p, texto: e.target.value }))} />
                <select style={inputStyle} value={novaPergunta.tipo} onChange={e => setNovaPergunta(p => ({ ...p, tipo: e.target.value as any }))}>
                  <option value="texto">Resposta livre (texto)</option>
                  <option value="sim_nao">Sim / Não</option>
                  <option value="escala">Escala 1–5</option>
                  <option value="escolha_multipla">Escolha múltipla</option>
                </select>
                {novaPergunta.tipo === "escolha_multipla" && (
                  <input style={inputStyle} placeholder='Opções em JSON, ex: ["Opção A","Opção B"]' value={novaPergunta.opcoes} onChange={e => setNovaPergunta(p => ({ ...p, opcoes: e.target.value }))} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" checked={novaPergunta.obrigatoria} onChange={e => setNovaPergunta(p => ({ ...p, obrigatoria: e.target.checked }))} id="obrig" />
                  <label htmlFor="obrig" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: "#374151" }}>Obrigatória</label>
                </div>
                <button style={btnSecondary} onClick={addPerguntaToList}>+ Adicionar Pergunta</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button style={btnSecondary} onClick={() => { setShowCreate(false); resetCreate(); }}>Cancelar</button>
              <button style={btnPrimary} onClick={handleCreate} disabled={!createForm.titulo || createMut.isPending}>
                {createMut.isPending ? "A guardar..." : "Criar Questionário"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal respostas */}
      {viewRespostas !== null && (
        <RespostasModal questionarioId={viewRespostas} onClose={() => setViewRespostas(null)} />
      )}
    </div>
  );
}

function RespostasModal({ questionarioId, onClose }: { questionarioId: number; onClose: () => void }) {
  const { data, isLoading } = trpc.backoffice.questionarios.listRespostas.useQuery({ questionarioId });
  return (
    <Modal title="Respostas dos Candidatos" onClose={onClose}>
      {isLoading && <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#9CA3AF" }}>A carregar...</p>}
      {data && data.length === 0 && (
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#9CA3AF", fontSize: "0.9rem" }}>Ainda não há respostas para este questionário.</p>
      )}
      {data && data.map((item: any, i: number) => (
        <div key={i} style={{ borderBottom: "1px solid #E5EEF4", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#0A1A2A", margin: 0 }}>
                {item.candidato?.nome ?? "Candidato desconhecido"}
              </p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", color: "#6B7280", margin: "0.15rem 0 0" }}>
                {item.candidato?.email}
              </p>
            </div>
            <span style={{ background: item.token.respondido ? "#D1FAE5" : "#FEF3C7", color: item.token.respondido ? "#065F46" : "#92400E", padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: 700 }}>
              {item.token.respondido ? "Respondido" : "Pendente"}
            </span>
          </div>
          {item.respostas.map((r: any, j: number) => (
            <div key={j} style={{ marginBottom: "0.6rem" }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.2rem" }}>{r.pergunta}</p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: r.resposta ? "#0A1A2A" : "#9CA3AF", margin: 0, fontStyle: r.resposta ? "normal" : "italic" }}>
                {r.resposta ?? "Sem resposta"}
              </p>
            </div>
          ))}
        </div>
      ))}
    </Modal>
  );
}

// ── ENVIO EM MASSA ─────────────────────────────────────────────────────────────

function EnvioMassaSection() {
  const [testEmail, setTestEmail] = React.useState("filipeferreira@team24.pt");
  const [testNome, setTestNome] = React.useState("Filipe Ferreira");
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [bulkResult, setBulkResult] = React.useState<any | null>(null);
  const [confirming, setConfirming] = React.useState(false);

  const { data: preview } = trpc.backoffice.candidaturas_bulk.previewEmAnalise.useQuery({ testEmail: undefined });

  const sendTestMut = trpc.backoffice.candidaturas_bulk.sendTest.useMutation({
    onSuccess: (data) => setTestResult(`✅ Email de teste enviado para ${data.sentTo}`),
    onError: (err) => setTestResult(`❌ Erro: ${err.message}`),
  });

  const sendAllMut = trpc.backoffice.candidaturas_bulk.sendAll.useMutation({
    onSuccess: (data) => { setBulkResult(data); setConfirming(false); },
    onError: (err) => { setBulkResult({ error: err.message }); setConfirming(false); },
  });

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: "1.5rem", color: "#0A1A2A", margin: "0 0 0.5rem" }}>
        Envio em Massa — Candidaturas em Análise
      </h2>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.88rem", color: "#6B7280", marginBottom: "2rem", lineHeight: 1.6 }}>
        Envia um email a todos os candidatos que não foram rejeitados nem aceites, a informar que a candidatura está em análise e a divulgar a nova vaga de Psicólogo/a 24/7.
      </p>

      {/* Preview */}
      <div style={{ background: "#F0F7FB", border: "1px solid #D0E2EC", padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#25749F", margin: "0 0 0.5rem" }}>Destinatários</p>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "2rem", fontWeight: 800, color: "#0A1A2A", margin: "0 0 0.25rem" }}>
          {preview?.total ?? "..."}
        </p>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#6B7280", margin: 0 }}>
          candidatos com estado pendente, em análise ou em entrevista
        </p>
        {preview && preview.candidatos.length > 0 && (
          <div style={{ marginTop: "1rem", fontSize: "0.78rem", color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <strong style={{ color: "#0A1A2A" }}>Primeiros 10:</strong>{" "}
            {preview.candidatos.map((c: any) => c.email).join(", ")}
            {preview.total > 10 && ` ... e mais ${preview.total - 10}`}
          </div>
        )}
      </div>

      {/* Envio de teste */}
      <div style={{ background: "white", border: "1px solid #E5EEF4", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7280", margin: "0 0 1rem" }}>1. Envio de Teste</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={labelStyle}>Nome</label>
            <input style={inputStyle} value={testNome} onChange={e => setTestNome(e.target.value)} placeholder="Nome do destinatário" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="email@exemplo.pt" />
          </div>
        </div>
        <button
          style={{ ...btnPrimary, background: "#25749F" }}
          disabled={sendTestMut.isPending}
          onClick={() => sendTestMut.mutate({ email: testEmail, nome: testNome })}
        >
          {sendTestMut.isPending ? "A enviar..." : "Enviar Email de Teste"}
        </button>
        {testResult && (
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", marginTop: "0.75rem", color: testResult.startsWith("✅") ? "#065F46" : "#991B1B" }}>
            {testResult}
          </p>
        )}
      </div>

      {/* Envio em massa */}
      <div style={{ background: "white", border: "1px solid #E5EEF4", padding: "1.5rem" }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7280", margin: "0 0 1rem" }}>2. Envio em Massa</p>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#6B7280", marginBottom: "1rem", lineHeight: 1.6 }}>
          Confirme que testou o email acima antes de enviar para todos os <strong style={{ color: "#0A1A2A" }}>{preview?.total ?? "..."} candidatos</strong>. Esta acção não pode ser desfeita.
        </p>
        {!confirming && !bulkResult && (
          <button style={{ ...btnPrimary, background: "#DC2626" }} onClick={() => setConfirming(true)}>
            Enviar para Todos os Candidatos
          </button>
        )}
        {confirming && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", padding: "1rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.85rem", color: "#991B1B", margin: 0 }}>
              Tem a certeza? Irá enviar {preview?.total ?? "..."} emails.
            </p>
            <button style={{ ...btnPrimary, background: "#DC2626" }} disabled={sendAllMut.isPending} onClick={() => sendAllMut.mutate()}>
              {sendAllMut.isPending ? "A enviar..." : "Confirmar Envio"}
            </button>
            <button style={btnSecondary} onClick={() => setConfirming(false)}>Cancelar</button>
          </div>
        )}
        {bulkResult && !bulkResult.error && (
          <div style={{ background: "#D1FAE5", border: "1px solid #6EE7B7", padding: "1rem" }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: "#065F46", margin: "0 0 0.25rem" }}>
              ✅ Envio concluído: {bulkResult.enviados} emails enviados com sucesso.
            </p>
            {bulkResult.erros > 0 && (
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", color: "#991B1B", margin: "0.25rem 0 0" }}>
                {bulkResult.erros} erros: {bulkResult.errosList.slice(0, 5).join("; ")}
              </p>
            )}
          </div>
        )}
        {bulkResult?.error && (
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#991B1B", fontSize: "0.85rem" }}>❌ {bulkResult.error}</p>
        )}
      </div>
    </div>
  );
}
