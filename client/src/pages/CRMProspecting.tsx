import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Linkedin, Building2, Users, ExternalLink, AlertTriangle, CheckCircle2,
  MessageSquare, ChevronRight, X, Send, Plus, ArrowRight, Trash2
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Estado = "identificado" | "pedido_enviado" | "ligado" | "mensagem_1" | "mensagem_2" |
  "mensagem_3" | "resposta_positiva" | "resposta_negativa" | "reuniao_agendada" | "sem_resposta" | "descartado";

type DuplicadoTipo = "nenhum" | "lead_existente" | "empresa_existente" | "ambos";

interface Prospect {
  id: number;
  nome: string;
  urlLinkedin?: string | null;
  cargo?: string | null;
  email?: string | null;
  empresa?: string | null;
  sectore?: string | null;
  nFuncionarios?: string | null;
  estado: Estado;
  duplicadoTipo: DuplicadoTipo;
  duplicadoLeadId?: number | null;
  duplicadoEmpresaId?: number | null;
  agenteNome?: string | null;
  notas?: string | null;
  fonte?: string | null;
  ultimaActualizacao: Date | string;
  createdAt: Date | string;
}

// ─── Configuração de estados ──────────────────────────────────────────────────
const ESTADOS: Record<Estado, { label: string; cor: string; bg: string }> = {
  identificado:       { label: "Identificado",       cor: "text-gray-600",   bg: "bg-gray-100" },
  pedido_enviado:     { label: "Pedido Enviado",      cor: "text-blue-700",   bg: "bg-blue-50" },
  ligado:             { label: "Ligado",              cor: "text-indigo-700", bg: "bg-indigo-50" },
  mensagem_1:         { label: "1ª Mensagem",         cor: "text-violet-700", bg: "bg-violet-50" },
  mensagem_2:         { label: "2ª Mensagem",         cor: "text-purple-700", bg: "bg-purple-50" },
  mensagem_3:         { label: "3ª Mensagem",         cor: "text-fuchsia-700",bg: "bg-fuchsia-50" },
  resposta_positiva:  { label: "Resposta Positiva",   cor: "text-green-700",  bg: "bg-green-50" },
  resposta_negativa:  { label: "Resposta Negativa",   cor: "text-red-700",    bg: "bg-red-50" },
  reuniao_agendada:   { label: "Reunião Agendada",    cor: "text-orange-700", bg: "bg-orange-50" },
  sem_resposta:       { label: "Sem Resposta",        cor: "text-yellow-700", bg: "bg-yellow-50" },
  descartado:         { label: "Descartado",          cor: "text-gray-500",   bg: "bg-gray-50" },
};

// ─── Fontes / bases de dados ──────────────────────────────────────────────────
const FONTES_LABELS: Record<string, { label: string; cor: string }> = {
  pme_excelencia:    { label: "PME Excelência",       cor: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  iso45001:          { label: "ISO 45001",             cor: "bg-sky-50 text-sky-700 hover:bg-sky-100" },
  np4552:            { label: "NP 4552",               cor: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
  camaras:           { label: "Câmaras Municipais",    cor: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  ipac:              { label: "Certificadas IPAC",     cor: "bg-teal-50 text-teal-700 hover:bg-teal-100" },
  "1000_funcionarios": { label: "+1000 Funcionários",  cor: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
  maiores_empresas:  { label: "Maiores Empresas PT",   cor: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
  crm_forum:         { label: "CRM Forum",             cor: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
  website:           { label: "Website",               cor: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  linkedin_agente:   { label: "Agente LinkedIn",       cor: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
};

// ─── Badge de duplicado ───────────────────────────────────────────────────────
function DuplicadoBadge({ tipo }: { tipo: DuplicadoTipo }) {
  if (tipo === "nenhum") return null;
  const config = {
    lead_existente:    { label: "Lead existente",        bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300" },
    empresa_existente: { label: "Cliente no CRM",        bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
    ambos:             { label: "Lead + Cliente no CRM", bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300" },
  }[tipo];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <AlertTriangle className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── Painel de detalhe do prospecto ──────────────────────────────────────────
function ProspectDetalhe({ id, onClose, onConverted }: { id: number; onClose: () => void; onConverted: () => void }) {
  const { data, refetch } = trpc.crm.prospecting.byId.useQuery({ id });
  const [novaMensagem, setNovaMensagem] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"enviada" | "recebida" | "nota_interna">("enviada");
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState("");

  // IA preenchimento
  const preencherIA = trpc.crmQualidade.preencherComIA.useMutation();
  const actualizarCampos = trpc.crm.prospecting.actualizarCampos.useMutation({
    onSuccess: () => { refetch(); toast.success("Campos actualizados pela IA!"); setIaSugestoes(null); },
    onError: (e) => toast.error(e.message),
  });
  const [iaSugestoes, setIaSugestoes] = useState<Record<string, string> | null>(null);
  const [iaAceites, setIaAceites] = useState<Record<string, boolean>>({});

  async function handlePreencherIA() {
    if (!data) return;
    const p = data as any;
    const nomeEmp = p.empresa || p.nome;
    const camposEmFalta = ['telefone','email','website','sector','numColaboradores','nif','cidade'];
    // Passar dados actuais para que a IA não substitua campos já preenchidos
    const dadosActuais: Record<string, any> = {
      telefone: p.telefone || '',
      email: p.email || '',
      website: p.website || '',
      sector: p.sectore || '',
      numColaboradores: p.nFuncionarios ? parseInt(p.nFuncionarios) : 0,
      nif: p.nif || '',
      cidade: p.cidade || '',
    };
    try {
      const result = await preencherIA.mutateAsync({ empresaId: 0, nomeEmpresa: nomeEmp, camposEmFalta, dadosActuais });
      if (Object.keys(result.dados || {}).length === 0) {
        toast.info('Todos os campos já estão preenchidos ou a IA não encontrou informações adicionais.');
        setIaSugestoes({});
        return;
      }
      setIaSugestoes(result.dados as Record<string, string> || {});
      setIaAceites(Object.fromEntries(Object.keys(result.dados || {}).map(k => [k, true])));
    } catch { setIaSugestoes({}); }
  }

  function confirmarSugestoesIA() {
    if (!iaSugestoes || !data) return;
    const p = data as any;
    const aceites: Record<string, string> = {};
    // Mapear chaves da IA para chaves do prospecto
    const MAPA: Record<string, string> = { sector: 'sectore', numColaboradores: 'nFuncionarios' };
    Object.entries(iaSugestoes).forEach(([k, v]) => {
      if (iaAceites[k]) aceites[MAPA[k] || k] = String(v);
    });
    if (Object.keys(aceites).length === 0) { setIaSugestoes(null); return; }
    actualizarCampos.mutate({ id: p.id, ...aceites });
  }

  const LABELS_CAMPOS_PROSP: Record<string, string> = {
    telefone: 'Telefone', email: 'Email', website: 'Website',
    sector: 'Sector', numColaboradores: 'Nº Colaboradores',
    nif: 'NIF', cidade: 'Cidade',
  };

  const actualizarEstado = trpc.crm.prospecting.actualizarEstado.useMutation({
    onSuccess: () => { refetch(); toast.success("Estado actualizado"); },
  });

  const adicionarMensagem = trpc.crm.prospecting.adicionarMensagem.useMutation({
    onSuccess: () => { refetch(); setNovaMensagem(""); toast.success("Mensagem guardada"); },
  });

  const converterEmLead = trpc.crm.prospecting.converterEmLead.useMutation({
    onSuccess: () => { toast.success("Convertido em Lead com sucesso!"); onConverted(); },
    onError: (e) => toast.error(e.message),
  });

  const eliminar = trpc.crm.prospecting.eliminar.useMutation({
    onSuccess: () => { toast.success("Prospecto eliminado"); onClose(); },
  });

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const p = data as any;

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-gray-900 font-semibold text-lg leading-tight">{p.nome}</h2>
          {p.cargo && <p className="text-gray-500 text-sm mt-0.5">{p.cargo}</p>}
          {p.empresa && (
            <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
              <Building2 className="w-3.5 h-3.5" /> {p.empresa}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADOS[p.estado as Estado]?.bg} ${ESTADOS[p.estado as Estado]?.cor}`}>
              {ESTADOS[p.estado as Estado]?.label}
            </span>
            <DuplicadoBadge tipo={p.duplicadoTipo} />
            {p.fonte && FONTES_LABELS[p.fonte] && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${FONTES_LABELS[p.fonte].cor}`}>
                {FONTES_LABELS[p.fonte].label}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {p.urlLinkedin && (
            <a href={p.urlLinkedin} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alterar estado */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">Alterar estado</p>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(ESTADOS).map(([k, v]) => (
            <button key={k}
              onClick={() => actualizarEstado.mutate({ id: p.id, estado: k as Estado })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                p.estado === k ? `${v.bg} ${v.cor} ring-1 ring-current` : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aviso de duplicado */}
      {p.duplicadoTipo !== "nenhum" && (
        <div className={`rounded-lg p-3 text-sm border ${
          p.duplicadoTipo === "empresa_existente" ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <p className="font-medium flex items-center gap-1.5 mb-0.5">
            <AlertTriangle className="w-4 h-4" /> Duplicado detectado
          </p>
          {p.duplicadoTipo === "lead_existente" && <p>Esta pessoa já existe como Lead #{p.duplicadoLeadId} no CRM.</p>}
              {p.duplicadoTipo === "empresa_existente" && <p>O cliente "{p.empresa}" já existe no CRM (ID #{p.duplicadoEmpresaId}).</p>}
              {p.duplicadoTipo === "ambos" && <p>Esta pessoa (Lead #{p.duplicadoLeadId}) e o cliente (ID #{p.duplicadoEmpresaId}) já existem no CRM.</p>}
        </div>
      )}

      {/* Info básica + botão IA */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-medium">Informações</span>
          <button
            onClick={handlePreencherIA}
            disabled={preencherIA.isPending}
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-colors disabled:opacity-50">
            {preencherIA.isPending ? <><span className="animate-spin">&#x27F3;</span> A pesquisar...</> : <><span>✨</span> Preencher com IA</>}
          </button>
        </div>

        {/* Painel de sugestões IA */}
        {iaSugestoes && Object.keys(iaSugestoes).length > 0 && (
          <div className="mb-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-700">✨ Sugestões da IA</span>
              <button onClick={() => setIaSugestoes(null)} className="text-[10px] text-gray-400 hover:text-gray-600">✕ Fechar</button>
            </div>
            <div className="space-y-1.5 mb-3">
              {Object.entries(iaSugestoes).map(([campo, valor]) => (
                <label key={campo} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={iaAceites[campo] ?? true}
                    onChange={e => setIaAceites(prev => ({ ...prev, [campo]: e.target.checked }))}
                    className="rounded text-purple-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-gray-500">{LABELS_CAMPOS_PROSP[campo] || campo}</div>
                    <div className="text-xs font-medium text-gray-800 truncate">{String(valor)}</div>
                  </div>
                  <span className="text-[9px] text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">IA</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIaSugestoes(null)}
                className="flex-1 px-4 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Cancelar</button>
              <button onClick={confirmarSugestoesIA}
                disabled={Object.values(iaAceites).every(v => !v) || actualizarCampos.isPending}
                className="flex-1 px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
                {actualizarCampos.isPending ? "A guardar..." : `Guardar ${Object.values(iaAceites).filter(Boolean).length} campo(s)`}
              </button>
            </div>
          </div>
        )}
        {iaSugestoes && Object.keys(iaSugestoes).length === 0 && (
          <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-xs text-yellow-700">
            ⚠️ A IA não encontrou informações para esta empresa.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          {p.email && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-0.5">Email</p>
              <p className="text-gray-800 font-medium truncate">{p.email}</p>
            </div>
          )}
          {p.nFuncionarios && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-0.5">Nº Funcionários</p>
              <p className="text-gray-800 font-medium">{p.nFuncionarios}</p>
            </div>
          )}
          {p.sectore && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-0.5">Sector</p>
              <p className="text-gray-800 font-medium">{p.sectore}</p>
            </div>
          )}
          {p.website && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-0.5">Website</p>
              <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate block">{p.website}</a>
            </div>
          )}
          {p.telefone && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-0.5">Telefone</p>
              <p className="text-gray-800 font-medium">{p.telefone}</p>
            </div>
          )}
          {p.agenteNome && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-0.5">Agente</p>
              <p className="text-gray-800 font-medium">{p.agenteNome}</p>
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      {p.notas && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <p className="text-gray-500 text-xs mb-1">Notas</p>
          <p className="text-gray-700 whitespace-pre-wrap">{p.notas}</p>
        </div>
      )}

      {/* Histórico de mensagens */}
      <div>
        <h3 className="text-gray-700 font-medium text-sm mb-3">
          Histórico de Mensagens ({p.mensagens?.length ?? 0})
        </h3>
        {p.mensagens?.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">Nenhuma mensagem registada</p>
        )}
        <div className="space-y-2">
          {p.mensagens?.map((m: any) => (
            <div key={m.id} className={`rounded-lg p-3 text-sm ${
              m.tipo === "recebida" ? "bg-green-50 border border-green-100 ml-4" :
              m.tipo === "nota_interna" ? "bg-yellow-50 border border-yellow-100" :
              "bg-blue-50 border border-blue-100 mr-4"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  m.tipo === "recebida" ? "text-green-700" :
                  m.tipo === "nota_interna" ? "text-yellow-700" : "text-blue-700"
                }`}>
                  {m.tipo === "enviada" ? "✉ Enviada" : m.tipo === "recebida" ? "↩ Recebida" : "📝 Nota interna"}
                  {" · "}{m.canal}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(m.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{m.conteudo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Adicionar mensagem */}
      <div className="border border-gray-200 rounded-lg p-3">
        <p className="text-gray-600 text-sm font-medium mb-2">Adicionar mensagem</p>
        <div className="flex gap-2 mb-2">
          {(["enviada", "recebida", "nota_interna"] as const).map(t => (
            <button key={t} onClick={() => setTipoMsg(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                tipoMsg === t ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {t === "enviada" ? "Enviada" : t === "recebida" ? "Recebida" : "Nota interna"}
            </button>
          ))}
        </div>
        <Textarea
          value={novaMensagem}
          onChange={e => setNovaMensagem(e.target.value)}
          placeholder="Escrever mensagem..."
          className="text-sm resize-none mb-2 border-gray-200"
          rows={3}
        />
        <Button size="sm" onClick={() => adicionarMensagem.mutate({ prospectingId: p.id, tipo: tipoMsg, conteudo: novaMensagem })}
          disabled={!novaMensagem.trim() || adicionarMensagem.isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white">
          <Send className="w-3.5 h-3.5 mr-1" />
          Guardar
        </Button>
      </div>

      {/* Converter em Lead */}
      {!p.leadId && (
        <div>
          {!showConverter ? (
            <button onClick={() => { setShowConverter(true); setNomeEmpresa(p.empresa || p.nome); }}
              className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium">
              <ArrowRight className="w-4 h-4" /> Converter em Lead
            </button>
          ) : (
            <div className="border border-orange-200 rounded-lg p-3 bg-orange-50 space-y-2">
              <p className="text-orange-800 text-sm font-medium">Converter em Lead</p>
              <Input
                value={nomeEmpresa}
                onChange={e => setNomeEmpresa(e.target.value)}
                  placeholder="Nome do cliente"
                className="text-sm border-orange-200 bg-white"
              />
              <div className="flex gap-2">
                    <Button size="sm" onClick={() => converterEmLead.mutate({ id: p.id, nomeEmpresa })}
                  disabled={!nomeEmpresa.trim() || converterEmLead.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white">
                  Confirmar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowConverter(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Eliminar */}
      {!confirmEliminar ? (
        <button onClick={() => setConfirmEliminar(true)}
          className="text-red-500 text-sm hover:text-red-700 flex items-center gap-1">
          <Trash2 className="w-3.5 h-3.5" /> Eliminar prospecto
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <p className="text-red-700 text-sm flex-1">Confirmar eliminação?</p>
          <Button size="sm" variant="destructive" onClick={() => eliminar.mutate({ id: p.id })} disabled={eliminar.isPending}>Sim</Button>
          <Button size="sm" variant="outline" onClick={() => setConfirmEliminar(false)}>Não</Button>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function CRMProspecting() {
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroFonte, setFiltroFonte] = useState<string>("todas");
  const [pagina, setPagina] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const POR_PAGINA = 50;

  // Reset página quando filtros mudam
  const setFiltroEstadoReset = (v: string) => { setFiltroEstado(v); setPagina(1); };
  const setFiltroFonteReset = (v: string) => { setFiltroFonte(v); setPagina(1); };
  const setSearchReset = (v: string) => { setSearch(v); setPagina(1); };

  const { data, refetch } = trpc.crm.prospecting.listar.useQuery({
    estado: filtroEstado !== "todos" ? filtroEstado : undefined,
    search: search || undefined,
    fonte: filtroFonte !== "todas" ? filtroFonte : undefined,
    pagina,
    porPagina: POR_PAGINA,
  });

  const list: Prospect[] = (data as any)?.prospectos ?? [];
  const total: number = (data as any)?.total ?? 0;
  const totalPaginas: number = (data as any)?.paginas ?? 1;
  const totalPorFonte: Record<string, number> = (data as any)?.totalPorFonte ?? {};

  const duplicados = list.filter(p => p.duplicadoTipo !== "nenhum");

  return (
    <div className="flex h-full">
      {/* Lista principal */}
      <div className={`flex flex-col ${selectedId ? "w-1/2 border-r border-gray-200" : "w-full"} bg-gray-50`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-gray-900 text-xl font-semibold flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-blue-600" />
                Prospecção LinkedIn
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {total.toLocaleString("pt-PT")} prospectos
                {duplicados.length > 0 && (
                  <span className="ml-2 text-red-600 font-medium">· {duplicados.length} duplicados nesta página</span>
                )}
              </p>
            </div>
          </div>

          {/* Filtro por base de dados (fonte) */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 font-medium mb-1.5">Base de dados</p>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setFiltroFonteReset("todas")}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filtroFonte === "todas" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                Todas
              </button>
              {Object.entries(FONTES_LABELS)
                .filter(([k]) => (totalPorFonte[k] ?? 0) > 0)
                .map(([k, v]) => (
                <button key={k}
                  onClick={() => setFiltroFonteReset(filtroFonte === k ? "todas" : k)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    filtroFonte === k
                      ? "bg-gray-800 text-white"
                      : v.cor
                  }`}>
                  {v.label}
                  {totalPorFonte[k] !== undefined && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                      filtroFonte === k ? "bg-white/20 text-white" : "bg-black/10"
                    }`}>
                      {totalPorFonte[k].toLocaleString("pt-PT")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de pesquisa */}
          <Input
            value={search}
            onChange={e => setSearchReset(e.target.value)}
            placeholder="Pesquisar por nome ou empresa..."
            className="bg-gray-50 border-gray-200 text-sm mb-3"
          />

          {/* Filtros de estado */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFiltroEstadoReset("todos")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filtroEstado === "todos" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              Todos os estados
            </button>
            {Object.entries(ESTADOS).map(([k, v]) => (
              <button key={k} onClick={() => setFiltroEstadoReset(filtroEstado === k ? "todos" : k)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filtroEstado === k ? `${v.bg} ${v.cor} ring-1 ring-current` : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de prospectos */}
        <div className="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Linkedin className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Nenhum prospecto encontrado</p>
              <p className="text-xs mt-1 text-center max-w-xs">Os prospectos são criados automaticamente pelo agente LinkedIn via webhook</p>
            </div>
          ) : (
            list.map(p => {
              const estadoCfg = ESTADOS[p.estado];
              const isDuplicado = p.duplicadoTipo !== "nenhum";
              const isSelected = selectedId === p.id;

              return (
                <div key={p.id}
                  onClick={() => setSelectedId(isSelected ? null : p.id)}
                  className={`border-b border-gray-100 p-4 cursor-pointer transition-colors ${
                    isSelected ? "bg-orange-50 border-l-2 border-l-orange-400" :
                    isDuplicado ? "bg-red-50/50 hover:bg-red-50" : "bg-white hover:bg-gray-50"
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-gray-900 font-medium text-sm">{p.nome}</span>
                        {isDuplicado && (
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                            p.duplicadoTipo === "empresa_existente"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {p.duplicadoTipo === "lead_existente" ? "Lead" :
                             p.duplicadoTipo === "empresa_existente" ? "Empresa" : "Lead+Empresa"}
                          </span>
                        )}
                        {p.fonte && FONTES_LABELS[p.fonte] && (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${FONTES_LABELS[p.fonte].cor}`}>
                            {FONTES_LABELS[p.fonte].label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        {p.cargo && <span>{p.cargo}</span>}
                        {p.empresa && (
                          <>
                            {p.cargo && <span>·</span>}
                            <span className="flex items-center gap-0.5">
                              <Building2 className="w-3 h-3" />
                              {p.empresa}
                            </span>
                          </>
                        )}
                        {p.nFuncionarios && (
                          <span className="flex items-center gap-0.5">
                            <Users className="w-3 h-3" />
                            {p.nFuncionarios}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoCfg.bg} ${estadoCfg.cor}`}>
                        {estadoCfg.label}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(p.ultimaActualizacao).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Página {pagina} de {totalPaginas} · {total.toLocaleString("pt-PT")} registos
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-3 py-1.5 text-xs font-medium rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ← Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const start = Math.max(1, Math.min(pagina - 2, totalPaginas - 4));
                const pg = start + i;
                return (
                  <button key={pg} onClick={() => setPagina(pg)}
                    className={`w-8 h-7 text-xs font-medium rounded border transition-colors ${
                      pg === pagina
                        ? "bg-gray-800 text-white border-gray-800"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}>
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-3 py-1.5 text-xs font-medium rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Seguinte →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Painel de detalhe */}
      {selectedId && (
        <div className="w-1/2 bg-white overflow-y-auto">
          <ProspectDetalhe
            id={selectedId}
            onClose={() => setSelectedId(null)}
            onConverted={() => { refetch(); setSelectedId(null); }}
          />
        </div>
      )}
    </div>
  );
}
