import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Area = "comercial" | "psicologos" | "marketing" | "administrativo";
type TipoContrato = "full_time" | "part_time" | "freelancer" | "estagio" | "avenca" | "outro";

const TIPOS_CONTRATO: { id: TipoContrato; label: string; cor: string }[] = [
  { id: "full_time",   label: "Full Time",   cor: "bg-emerald-100 text-emerald-700" },
  { id: "part_time",   label: "Part Time",   cor: "bg-sky-100 text-sky-700" },
  { id: "freelancer",  label: "Freelancer",  cor: "bg-violet-100 text-violet-700" },
  { id: "estagio",     label: "Estágio",      cor: "bg-amber-100 text-amber-700" },
  { id: "avenca",      label: "Avença",       cor: "bg-pink-100 text-pink-700" },
  { id: "outro",       label: "Outro",       cor: "bg-gray-100 text-gray-600" },
];

const AREAS: { id: Area; label: string; icon: string; cor: string }[] = [
  { id: "comercial",      label: "Comercial",      icon: "💼", cor: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "psicologos",     label: "Psicólogos",     icon: "🧠", cor: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "marketing",      label: "Marketing",      icon: "📣", cor: "bg-orange-50 border-orange-200 text-orange-700" },
  { id: "administrativo", label: "Administrativo", icon: "📋", cor: "bg-green-50 border-green-200 text-green-700" },
];

const AREA_BADGE: Record<Area, string> = {
  comercial:      "bg-blue-100 text-blue-700",
  psicologos:     "bg-purple-100 text-purple-700",
  marketing:      "bg-orange-100 text-orange-700",
  administrativo: "bg-green-100 text-green-700",
};

type Membro = {
  id: number;
  nome: string;
  area: Area;
  cargo: string | null;
  email: string | null;
  telefone: string | null;
  linkedin: string | null;
  morada: string | null;
  idade: number | null;
  fotoUrl: string | null;
  fotoKey: string | null;
  tipoContrato: TipoContrato | null;
  ferias: string | null;
  notas: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function CRMEquipa() {
  const [areaActiva, setAreaActiva] = useState<Area | "todas">("todas");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, refetch } = trpc.equipa.list.useQuery({
    area: areaActiva !== "todas" ? areaActiva : undefined,
    search: search || undefined,
    ativo: true,
  });

  const membros = data?.membros ?? [];

  // Contagem por área
  const { data: allData } = trpc.equipa.list.useQuery({ ativo: true });
  const countByArea = (allData?.membros ?? []).reduce<Record<string, number>>((acc, m) => {
    acc[m.area] = (acc[m.area] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 text-base font-semibold">Equipa</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {(allData?.membros ?? []).length} membros activos
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[#e85d26] hover:bg-[#d14e1a] text-white text-sm"
        >
          + Novo Membro
        </Button>
      </div>

      {/* Tabs por área */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setAreaActiva("todas")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            areaActiva === "todas"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          Todas
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${areaActiva === "todas" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
            {(allData?.membros ?? []).length}
          </span>
        </button>
        {AREAS.map(a => (
          <button
            key={a.id}
            onClick={() => setAreaActiva(a.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              areaActiva === a.id
                ? "bg-gray-900 text-white border-gray-900"
                : `bg-white ${a.cor.split(" ")[2]} border-gray-200 hover:border-gray-400`
            }`}
          >
            <span>{a.icon}</span>
            {a.label}
            {countByArea[a.id] !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${areaActiva === a.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {countByArea[a.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pesquisa */}
      <div className="mb-5">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por nome, cargo ou email..."
          className="bg-white border-gray-300 text-gray-900 max-w-sm text-xs h-8"
        />
      </div>

      {/* Grid de membros */}
      {membros.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">👥</div>
          <div className="text-sm font-medium">Nenhum membro encontrado</div>
          <div className="text-xs mt-1">Clique em "+ Novo Membro" para adicionar alguém</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {membros.map(m => (
            <MembroCard
              key={m.id}
              membro={m as Membro}
              onClick={() => setSelectedId(m.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <MembroFormDialog
          onClose={() => { setShowCreate(false); refetch(); }}
        />
      )}
      {selectedId !== null && (
        <MembroDetalheDialog
          id={selectedId}
          onClose={() => { setSelectedId(null); refetch(); }}
        />
      )}
    </div>
  );
}

// ─── Card de membro ───────────────────────────────────────────────────────────
function MembroCard({ membro, onClick }: { membro: Membro; onClick: () => void }) {
  const areaDef = AREAS.find(a => a.id === membro.area);
  const iniciais = membro.nome
    ? membro.nome.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-[#e85d26]/40 hover:shadow-md transition-all group relative"
    >
      {/* Botão editar ao hover */}
      <button
        onClick={e => { e.stopPropagation(); onClick(); }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 bg-white z-10"
      >
        ✎ Editar
      </button>

      {/* Foto + nome */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#e85d26]/20 to-[#e85d26]/10 shrink-0 flex items-center justify-center border border-gray-100">
          {membro.fotoUrl ? (
            <img src={membro.fotoUrl} alt={membro.nome} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#e85d26] font-bold text-base">{iniciais}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 pr-8">
          <div className="text-gray-900 text-sm font-semibold truncate group-hover:text-[#e85d26] transition-colors">
            {membro.nome || <span className="text-gray-400 italic text-xs">Sem nome</span>}
          </div>
          {membro.cargo && (
            <div className="text-gray-500 text-[10px] truncate mt-0.5">{membro.cargo}</div>
          )}
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${AREA_BADGE[membro.area]}`}>
              {areaDef?.icon} {areaDef?.label}
            </span>
            {membro.tipoContrato && (() => {
              const tc = TIPOS_CONTRATO.find(t => t.id === membro.tipoContrato);
              return tc ? (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${tc.cor}`}>{tc.label}</span>
              ) : null;
            })()}
          </div>
        </div>
      </div>

      {/* Contactos rápidos */}
      <div className="space-y-1 border-t border-gray-100 pt-2">
        {membro.email && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 truncate">
            <span className="text-gray-400">✉</span>
            <span className="truncate">{membro.email}</span>
          </div>
        )}
        {membro.telefone && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="text-gray-400">📞</span>
            <span>{membro.telefone}</span>
          </div>
        )}
        {membro.linkedin && (
          <div className="flex items-center gap-1.5 text-[10px] text-blue-500 truncate">
            <span className="font-bold text-[9px] bg-blue-100 px-1 rounded">in</span>
            <a
              href={membro.linkedin.startsWith("http") ? membro.linkedin : `https://${membro.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="hover:underline truncate"
            >
              LinkedIn
            </a>
          </div>
        )}
        {!membro.email && !membro.telefone && !membro.linkedin && (
          <div className="text-[10px] text-gray-300 italic">Sem contactos adicionados</div>
        )}
      </div>
    </div>
  );
}

// ─── Formulário de criação/edição ─────────────────────────────────────────────
function MembroFormDialog({
  membro,
  onClose,
}: {
  membro?: Membro;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const isEdit = !!membro;

  const [form, setForm] = useState({
    nome: membro?.nome ?? "",
    area: (membro?.area ?? "comercial") as Area,
    cargo: membro?.cargo ?? "",
    email: membro?.email ?? "",
    telefone: membro?.telefone ?? "",
    linkedin: membro?.linkedin ?? "",
    morada: membro?.morada ?? "",
    idade: membro?.idade?.toString() ?? "",
    tipoContrato: (membro?.tipoContrato ?? "") as TipoContrato | "",
    ferias: membro?.ferias ?? "",
    notas: membro?.notas ?? "",
  });

  // Foto
  const [fotoPreview, setFotoPreview] = useState<string | null>(membro?.fotoUrl ?? null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [fotoMime, setFotoMime] = useState<string>("image/jpeg");
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const uploadFotoMutation = trpc.equipa.uploadFoto.useMutation({
    onSuccess: () => { utils.equipa.list.invalidate(); },
    onError: e => toast.error("Erro ao fazer upload da foto: " + e.message),
  });

  const handleFotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Foto demasiado grande (máx 5MB)"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      // result = "data:image/jpeg;base64,..."
      const base64 = result.split(",")[1];
      setFotoPreview(result);
      setFotoBase64(base64);
      setFotoMime(file.type);
    };
    reader.readAsDataURL(file);
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const create = trpc.equipa.create.useMutation({
    onSuccess: async (novo) => {
      // Se há foto pendente, fazer upload agora
      if (fotoBase64 && novo?.id) {
        setUploadingFoto(true);
        try {
          await uploadFotoMutation.mutateAsync({ id: novo.id, base64: fotoBase64, mimeType: fotoMime });
        } finally {
          setUploadingFoto(false);
        }
      }
      utils.equipa.list.invalidate();
      toast.success("Membro adicionado!");
      onClose();
    },
    onError: e => toast.error(e.message),
  });

  const update = trpc.equipa.update.useMutation({
    onSuccess: async () => {
      if (fotoBase64 && membro?.id) {
        setUploadingFoto(true);
        try {
          await uploadFotoMutation.mutateAsync({ id: membro.id, base64: fotoBase64, mimeType: fotoMime });
        } finally {
          setUploadingFoto(false);
        }
      }
      utils.equipa.list.invalidate();
      toast.success("Membro actualizado!");
      onClose();
    },
    onError: e => toast.error(e.message),
  });

  function handleSubmit() {
    const payload = {
      nome: form.nome,
      area: form.area,
      cargo: form.cargo || undefined,
      email: form.email || undefined,
      telefone: form.telefone || undefined,
      linkedin: form.linkedin || undefined,
      morada: form.morada || undefined,
      idade: form.idade ? parseInt(form.idade) : undefined,
      tipoContrato: (form.tipoContrato || null) as TipoContrato | null | undefined,
      ferias: form.ferias || undefined,
      notas: form.notas || undefined,
    };
    if (isEdit && membro) {
      update.mutate({ id: membro.id, ...payload });
    } else {
      create.mutate(payload);
    }
  }

  const isPending = create.isPending || update.isPending || uploadingFoto;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-gray-900 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {isEdit ? "Editar Membro" : "Novo Membro da Equipa"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Foto */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => fotoInputRef.current?.click()}
              className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-[#e85d26] cursor-pointer overflow-hidden flex items-center justify-center bg-gray-50 transition-colors group relative"
            >
              {fotoPreview ? (
                <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-[#e85d26] transition-colors">
                  <span className="text-2xl">📷</span>
                  <span className="text-[10px]">Adicionar foto</span>
                </div>
              )}
              {fotoPreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                  <span className="text-white text-[10px] font-medium">Alterar</span>
                </div>
              )}
            </div>
            <input
              ref={fotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
            <span className="text-[10px] text-gray-400">JPG, PNG ou WebP — máx 5MB</span>
          </div>

          {/* Nome + Área */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-gray-700 text-xs">Nome *</Label>
              <Input value={form.nome} onChange={set("nome")} className="bg-gray-50 border-gray-300 text-gray-900 mt-1 text-sm" placeholder="Nome completo" />
            </div>
            <div>
              <Label className="text-gray-700 text-xs">Área *</Label>
              <select
                value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value as Area }))}
                className="w-full mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e85d26]/30"
              >
                {AREAS.map(a => (
                  <option key={a.id} value={a.id}>{a.icon} {a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-gray-700 text-xs">Cargo / Funções</Label>
              <Input value={form.cargo} onChange={set("cargo")} className="bg-gray-50 border-gray-300 text-gray-900 mt-1 text-sm" placeholder="Ex: Psicóloga Clínica" />
            </div>
            <div className="col-span-2">
              <Label className="text-gray-700 text-xs">Tipo de Contrato</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {TIPOS_CONTRATO.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, tipoContrato: f.tipoContrato === t.id ? "" : t.id }))}
                    className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                      form.tipoContrato === t.id
                        ? t.cor + " border-current ring-1 ring-current"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contactos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-700 text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={set("email")} className="bg-gray-50 border-gray-300 text-gray-900 mt-1 text-sm" placeholder="nome@team24.pt" />
            </div>
            <div>
              <Label className="text-gray-700 text-xs">Telefone</Label>
              <Input value={form.telefone} onChange={set("telefone")} className="bg-gray-50 border-gray-300 text-gray-900 mt-1 text-sm" placeholder="+351 9XX XXX XXX" />
            </div>
          </div>

          {/* LinkedIn + Idade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-700 text-xs">LinkedIn</Label>
              <Input value={form.linkedin} onChange={set("linkedin")} className="bg-gray-50 border-gray-300 text-gray-900 mt-1 text-sm" placeholder="linkedin.com/in/nome" />
            </div>
            <div>
              <Label className="text-gray-700 text-xs">Idade</Label>
              <Input type="number" min={16} max={99} value={form.idade} onChange={set("idade")} className="bg-gray-50 border-gray-300 text-gray-900 mt-1 text-sm" placeholder="Ex: 32" />
            </div>
          </div>

          {/* Morada */}
          <div>
            <Label className="text-gray-700 text-xs">Morada</Label>
            <Input value={form.morada} onChange={set("morada")} className="bg-gray-50 border-gray-300 text-gray-900 mt-1 text-sm" placeholder="Rua, Cidade, Código Postal" />
          </div>

          {/* Férias */}
          <div>
            <Label className="text-gray-700 text-xs">Férias</Label>
            <textarea
              value={form.ferias}
              onChange={set("ferias")}
              rows={2}
              className="w-full mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e85d26]/30 resize-none"
              placeholder="Ex: Agosto 2025 (1-31), Natal 2025 (23-27 Dez)"
            />
          </div>

          {/* Notas */}
          <div>
            <Label className="text-gray-700 text-xs">Notas</Label>
            <textarea
              value={form.notas}
              onChange={set("notas")}
              rows={2}
              className="w-full mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e85d26]/30 resize-none"
              placeholder="Informação adicional..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-500">Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.nome || isPending}
            className="bg-[#e85d26] hover:bg-[#d14e1a] text-white"
          >
            {isPending ? "A guardar..." : isEdit ? "Guardar Alterações" : "Adicionar Membro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Detalhe/Edição de membro ─────────────────────────────────────────────────
function MembroDetalheDialog({ id, onClose }: { id: number; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: membro, refetch } = trpc.equipa.byId.useQuery({ id });
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFoto = trpc.equipa.uploadFoto.useMutation({
    onSuccess: () => { refetch(); utils.equipa.list.invalidate(); toast.success("Foto actualizada!"); },
    onError: e => toast.error(e.message),
  });

  const deleteMut = trpc.equipa.delete.useMutation({
    onSuccess: () => { utils.equipa.list.invalidate(); toast.success("Membro removido."); onClose(); },
    onError: e => toast.error(e.message),
  });

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !membro) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Foto demasiado grande (máx. 5MB)"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = (ev.target?.result as string).split(",")[1];
      uploadFoto.mutate({ id: membro.id, base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  }

  if (!membro) return null;

  const areaDef = AREAS.find(a => a.id === membro.area);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-gray-900 max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header com foto */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 pb-4 border-b border-gray-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors">×</button>

          <div className="flex items-start gap-4">
            {/* Foto */}
            <div className="relative group/foto shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center">
                {membro.fotoUrl ? (
                  <img src={membro.fotoUrl} alt={membro.nome} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-3xl">{membro.nome.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadFoto.isPending}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/foto:opacity-100 flex items-center justify-center transition-opacity"
              >
                <span className="text-white text-[10px] font-medium">{uploadFoto.isPending ? "..." : "📷"}</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-gray-900 text-lg font-bold">{membro.nome}</h2>
              {membro.cargo && <p className="text-gray-500 text-sm">{membro.cargo}</p>}
              <div className="mt-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${AREA_BADGE[membro.area as Area]}`}>
                  {areaDef?.icon} {areaDef?.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          {editing ? (
            <MembroFormDialog
              membro={membro as Membro}
              onClose={() => { setEditing(false); refetch(); utils.equipa.list.invalidate(); }}
            />
          ) : (
            <>
              {/* Campos de info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email", value: membro.email, href: membro.email ? `mailto:${membro.email}` : undefined },
                  { label: "Telefone", value: membro.telefone, href: membro.telefone ? `tel:${membro.telefone}` : undefined },
                  { label: "LinkedIn", value: membro.linkedin ? "Ver perfil" : null, href: membro.linkedin ? (membro.linkedin.startsWith("http") ? membro.linkedin : `https://${membro.linkedin}`) : undefined },
                  { label: "Idade", value: membro.idade ? `${membro.idade} anos` : null },
                  { label: "Morada", value: membro.morada },
                  { label: "ID Equipa", value: `#${membro.id}`, hint: "Usado para associar leads" },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-0.5">{f.label}</div>
                    {f.href ? (
                      <a href={f.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">{f.value}</a>
                    ) : (
                      <div className="text-gray-800 text-xs">{f.value}</div>
                    )}
                    {f.hint && <div className="text-gray-400 text-[9px] mt-0.5">{f.hint}</div>}
                  </div>
                ))}
              </div>

              {/* Tipo de Contrato */}
              {membro.tipoContrato && (() => {
                const tc = TIPOS_CONTRATO.find(t => t.id === membro.tipoContrato);
                return tc ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[10px] uppercase tracking-wide">Tipo de Contrato</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${tc.cor}`}>{tc.label}</span>
                  </div>
                ) : null;
              })()}

              {/* Férias */}
              {membro.ferias && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="text-blue-600 text-[10px] uppercase tracking-wide font-semibold mb-1">🏖 Férias</div>
                  <div className="text-gray-700 text-xs whitespace-pre-wrap">{membro.ferias}</div>
                </div>
              )}

              {/* Notas */}
              {membro.notas && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">Notas</div>
                  <div className="text-gray-700 text-xs whitespace-pre-wrap">{membro.notas}</div>
                </div>
              )}

              {/* Acções */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="flex-1 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  ✎ Editar
                </Button>
                {!confirmDelete ? (
                  <Button
                    onClick={() => setConfirmDelete(true)}
                    variant="outline"
                    className="text-xs border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400"
                  >
                    Remover
                  </Button>
                ) : (
                  <div className="flex gap-1.5">
                    <Button
                      onClick={() => deleteMut.mutate({ id: membro.id })}
                      disabled={deleteMut.isPending}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleteMut.isPending ? "..." : "Confirmar"}
                    </Button>
                    <Button
                      onClick={() => setConfirmDelete(false)}
                      variant="outline"
                      className="text-xs border-gray-200 text-gray-500"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
