import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, parseISO } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { pt } from "date-fns/locale";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Periodo = "hoje" | "semana" | "mes" | "personalizado";

interface FormState {
  data: string;
  comercialNome: string;
  leadsContactadas: number;
  reunioesAgendadas: number;
  reunioesRealizadas: number;
  propostasEnviadas: number;
  contratosFechados: number;
  notas: string;
}

const ETAPAS = [
  { key: "leadsContactadas",   label: "Leads Contactadas",    cor: "#3B82F6" },
  { key: "reunioesAgendadas",  label: "Reuniões Agendadas",   cor: "#8B5CF6" },
  { key: "reunioesRealizadas", label: "Reuniões Realizadas",  cor: "#F59E0B" },
  { key: "propostasEnviadas",  label: "Propostas Enviadas",   cor: "#EF4444" },
  { key: "contratosFechados",  label: "Contratos Fechados",   cor: "#10B981" },
] as const;

type EtapaKey = typeof ETAPAS[number]["key"];

// ─── Utilitários de período ───────────────────────────────────────────────────
function getPeriodo(periodo: Periodo, custom: { inicio: string; fim: string }) {
  const hoje = new Date();
  switch (periodo) {
    case "hoje":
      return { dataInicio: format(hoje, "yyyy-MM-dd"), dataFim: format(hoje, "yyyy-MM-dd") };
    case "semana":
      return {
        dataInicio: format(startOfWeek(hoje, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        dataFim: format(endOfWeek(hoje, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    case "mes":
      return {
        dataInicio: format(startOfMonth(hoje), "yyyy-MM-dd"),
        dataFim: format(endOfMonth(hoje), "yyyy-MM-dd"),
      };
    case "personalizado":
      return { dataInicio: custom.inicio, dataFim: custom.fim };
  }
}

// ─── Componente Funil ─────────────────────────────────────────────────────────
function Funil({ totais }: { totais: Record<EtapaKey, number> }) {
  const max = Math.max(totais.leadsContactadas, 1);

  return (
    <div className="space-y-2">
      {ETAPAS.map((etapa, i) => {
        const valor = totais[etapa.key];
        const anterior = i > 0 ? totais[ETAPAS[i - 1].key] : valor;
        const pct = Math.round((valor / max) * 100);
        const conv = anterior > 0 ? Math.round((valor / anterior) * 100) : 0;

        return (
          <div key={etapa.key} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {etapa.label}
              </span>
              <div className="flex items-center gap-3">
                {i > 0 && (
                  <span className="text-xs text-gray-400">
                    {conv}% conversão
                  </span>
                )}
                <span className="text-sm font-bold" style={{ color: etapa.cor }}>
                  {valor}
                </span>
              </div>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3"
                style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: etapa.cor + "33", borderLeft: `3px solid ${etapa.cor}` }}
              >
              </div>
              <div
                className="absolute inset-0 h-full rounded-lg transition-all duration-700 ease-out opacity-80"
                style={{ width: `${Math.max(pct, 4)}%`, background: `linear-gradient(90deg, ${etapa.cor}22, ${etapa.cor}55)` }}
              />
            </div>
          </div>
        );
      })}

      {/* Taxa de fecho final */}
      {totais.leadsContactadas > 0 && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
          <p className="text-xs text-emerald-600 font-medium">Taxa de Fecho Global</p>
          <p className="text-2xl font-bold text-emerald-700">
            {Math.round((totais.contratosFechados / totais.leadsContactadas) * 100)}%
          </p>
          <p className="text-xs text-emerald-500">leads → contratos</p>
        </div>
      )}
    </div>
  );
}

// Comerciais fixos da equipa
const COMERCIAIS_FIXOS = ["Rita Condeça", "Sérgio Caldas", "Vanda Brás"];

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function CRMActividade() {
  const utils = trpc.useUtils();
  const hoje = format(new Date(), "yyyy-MM-dd");

  // Estado do formulário
  const [form, setForm] = useState<FormState>({
    data: hoje,
    comercialNome: "",
    leadsContactadas: 0,
    reunioesAgendadas: 0,
    reunioesRealizadas: 0,
    propostasEnviadas: 0,
    contratosFechados: 0,
    notas: "",
  });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Filtros
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [custom, setCustom] = useState({ inicio: format(subDays(new Date(), 30), "yyyy-MM-dd"), fim: hoje });
  const [filtroComercial, setFiltroComercial] = useState("");

  const intervalo = getPeriodo(periodo, custom);

  // Queries
  const { data: registos = [], isLoading } = trpc.actividadeComercial.list.useQuery({
    dataInicio: intervalo.dataInicio,
    dataFim: intervalo.dataFim,
    comercialNome: filtroComercial || undefined,
  });

  const { data: comerciais = [] } = trpc.actividadeComercial.comerciais.useQuery();

  // Mutations
  const criar = trpc.actividadeComercial.create.useMutation({
    onSuccess: () => {
      toast.success("Registo criado com sucesso!");
      utils.actividadeComercial.list.invalidate();
      utils.actividadeComercial.comerciais.invalidate();
      resetForm();
    },
    onError: () => toast.error("Erro ao criar registo"),
  });

  const actualizar = trpc.actividadeComercial.update.useMutation({
    onSuccess: () => {
      toast.success("Registo actualizado!");
      utils.actividadeComercial.list.invalidate();
      resetForm();
    },
    onError: () => toast.error("Erro ao actualizar registo"),
  });

  const eliminar = trpc.actividadeComercial.delete.useMutation({
    onSuccess: () => {
      toast.success("Registo eliminado");
      utils.actividadeComercial.list.invalidate();
    },
    onError: () => toast.error("Erro ao eliminar registo"),
  });

  function resetForm() {
    setForm({ data: hoje, comercialNome: "", leadsContactadas: 0, reunioesAgendadas: 0, reunioesRealizadas: 0, propostasEnviadas: 0, contratosFechados: 0, notas: "" });
    setEditandoId(null);
    setMostrarForm(false);
  }

  function handleEditar(r: typeof registos[0]) {
    setForm({
      data: r.data,
      comercialNome: r.comercialNome,
      leadsContactadas: r.leadsContactadas,
      reunioesAgendadas: r.reunioesAgendadas,
      reunioesRealizadas: r.reunioesRealizadas,
      propostasEnviadas: r.propostasEnviadas,
      contratosFechados: r.contratosFechados,
      notas: r.notas || "",
    });
    setEditandoId(r.id);
    setMostrarForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.comercialNome.trim()) { toast.error("Nome do comercial é obrigatório"); return; }
    if (editandoId) {
      actualizar.mutate({ id: editandoId, ...form });
    } else {
      criar.mutate(form);
    }
  }

  // Totais agregados para o funil
  const totais = useMemo(() => {
    return registos.reduce(
      (acc, r) => ({
        leadsContactadas:    acc.leadsContactadas    + r.leadsContactadas,
        reunioesAgendadas:   acc.reunioesAgendadas   + r.reunioesAgendadas,
        reunioesRealizadas:  acc.reunioesRealizadas  + r.reunioesRealizadas,
        propostasEnviadas:   acc.propostasEnviadas   + r.propostasEnviadas,
        contratosFechados:   acc.contratosFechados   + r.contratosFechados,
      }),
      { leadsContactadas: 0, reunioesAgendadas: 0, reunioesRealizadas: 0, propostasEnviadas: 0, contratosFechados: 0 }
    );
  }, [registos]);

  // Totais por comercial
  const porComercial = useMemo(() => {
    const map: Record<string, typeof totais> = {};
    for (const r of registos) {
      if (!map[r.comercialNome]) map[r.comercialNome] = { leadsContactadas: 0, reunioesAgendadas: 0, reunioesRealizadas: 0, propostasEnviadas: 0, contratosFechados: 0 };
      for (const k of Object.keys(totais) as EtapaKey[]) map[r.comercialNome][k] += r[k];
    }
    return Object.entries(map).sort((a, b) => b[1].contratosFechados - a[1].contratosFechados);
  }, [registos, totais]);

  const labelPeriodo: Record<Periodo, string> = {
    hoje: "Hoje",
    semana: "Esta Semana",
    mes: "Este Mês",
    personalizado: "Personalizado",
  };

  // Dados por dia para o gráfico de linhas (ordenados ascendente)
  const dadosDiarios = useMemo(() => {
    const map: Record<string, Record<EtapaKey, number>> = {};
    for (const r of registos) {
      if (!map[r.data]) map[r.data] = { leadsContactadas: 0, reunioesAgendadas: 0, reunioesRealizadas: 0, propostasEnviadas: 0, contratosFechados: 0 };
      for (const k of Object.keys(map[r.data]) as EtapaKey[]) map[r.data][k] += r[k];
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, vals]) => ({
        data: format(parseISO(data + "T12:00:00"), "dd/MM"),
        ...vals,
      }));
  }, [registos]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Actividade Comercial</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registo diário de actividade por comercial</p>
        </div>
        <Button
          onClick={() => { resetForm(); setMostrarForm(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          + Novo Registo
        </Button>
      </div>

      {/* Formulário de registo */}
      {mostrarForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editandoId ? "✏️ Editar Registo" : "➕ Novo Registo de Actividade"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Data *</label>
                <Input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Comercial *</label>
                <select
                  value={form.comercialNome}
                  onChange={e => setForm(f => ({ ...f, comercialNome: e.target.value }))}
                  required
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground"
                >
                  <option value="">Seleccionar comercial...</option>
                  {Array.from(new Set([...COMERCIAIS_FIXOS, ...comerciais])).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campos numéricos do funil */}
            <div className="grid grid-cols-5 gap-3">
              {ETAPAS.map(etapa => (
                <div key={etapa.key} className="text-center">
                  <label className="text-xs font-medium text-gray-600 block mb-1 leading-tight">
                    {etapa.label}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form[etapa.key]}
                    onChange={e => setForm(f => ({ ...f, [etapa.key]: parseInt(e.target.value) || 0 }))}
                    className="text-center font-bold text-lg"
                    style={{ borderColor: etapa.cor + "66" }}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Notas (opcional)</label>
              <Textarea
                placeholder="Observações, contexto, bloqueios..."
                value={form.notas}
                onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={criar.isPending || actualizar.isPending}
              >
                {criar.isPending || actualizar.isPending ? "A guardar..." : editandoId ? "Guardar Alterações" : "Criar Registo"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Gráfico de linhas diário */}
      {dadosDiarios.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Evolução Diária
            <span className="ml-2 text-xs font-normal text-gray-400">{labelPeriodo[periodo]}</span>
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dadosDiarios} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="data" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                labelStyle={{ fontWeight: 600, color: "#374151" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              {ETAPAS.map(e => (
                <Line
                  key={e.key}
                  type="monotone"
                  dataKey={e.key}
                  name={e.label}
                  stroke={e.cor}
                  strokeWidth={2}
                  dot={{ r: 3, fill: e.cor }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filtros de período */}
      <div className="flex flex-wrap items-center gap-2">
        {(["hoje", "semana", "mes", "personalizado"] as Periodo[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              periodo === p
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
            }`}
          >
            {labelPeriodo[p]}
          </button>
        ))}
        {periodo === "personalizado" && (
          <div className="flex items-center gap-2 ml-2">
            <Input type="date" value={custom.inicio} onChange={e => setCustom(c => ({ ...c, inicio: e.target.value }))} className="w-36 h-8 text-sm" />
            <span className="text-gray-400 text-sm">→</span>
            <Input type="date" value={custom.fim} onChange={e => setCustom(c => ({ ...c, fim: e.target.value }))} className="w-36 h-8 text-sm" />
          </div>
        )}
        <select
          value={filtroComercial}
          onChange={e => setFiltroComercial(e.target.value)}
          className="ml-auto border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white"
        >
          <option value="">Todos os comerciais</option>
          {Array.from(new Set([...COMERCIAIS_FIXOS, ...comerciais])).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Conteúdo principal: funil + tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funil de conversão */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              🔻 Funil de Conversão
              <span className="ml-2 text-xs font-normal text-gray-400">{labelPeriodo[periodo]}</span>
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <Funil totais={totais} />
            )}
          </div>

        </div>

        {/* Tabela de registos */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                📋 Registos
                <span className="ml-2 text-sm font-normal text-gray-400">({registos.length})</span>
              </h3>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : registos.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-gray-500 font-medium">Sem registos para este período</p>
                <p className="text-gray-400 text-sm mt-1">Clique em "+ Novo Registo" para começar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Data</th>
                      <th className="px-4 py-3 text-left">Comercial</th>
                      {ETAPAS.map(e => (
                        <th key={e.key} className="px-3 py-3 text-center text-xs">
                          {e.label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right">Acções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {registos.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {format(new Date(r.data + "T12:00:00"), "d MMM yyyy", { locale: pt })}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{r.comercialNome}</td>
                        {ETAPAS.map(e => (
                          <td key={e.key} className="px-3 py-3 text-center">
                            <span className={`inline-block min-w-[28px] px-1.5 py-0.5 rounded text-xs font-bold ${r[e.key] > 0 ? "text-white" : "text-gray-300 bg-gray-100"}`}
                              style={r[e.key] > 0 ? { backgroundColor: e.cor } : {}}>
                              {r[e.key]}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditar(r)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => { if (confirm("Eliminar este registo?")) eliminar.mutate({ id: r.id }); }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Linha de totais */}
                  <tfoot>
                    <tr className="bg-gray-50 font-bold text-gray-700 border-t-2 border-gray-200">
                      <td className="px-4 py-3" colSpan={2}>Total</td>
                      {ETAPAS.map(e => (
                        <td key={e.key} className="px-3 py-3 text-center">
                          <span className="text-sm font-bold" style={{ color: e.cor }}>
                            {totais[e.key]}
                          </span>
                        </td>
                      ))}
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
