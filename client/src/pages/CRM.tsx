import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRMProspecting } from "./CRMProspecting";
import CRMEquipa from "./CRMEquipa";
import CRMActividade from "./CRMActividade";

// ─── Tipos ───────────────────────────────────────────────────────────────────
type Fase = "leads"|"em_tratamento"|"reuniao_agendada"|"proposta_enviada"|"proposta_adjudicada"|"won"|"renovacoes_pendente"|"contratos_renovados"|"contratos_terminados"|"servicos_isolados"|"lost";

const FASES: { id: Fase; label: string; cor: string }[] = [
  { id: "leads", label: "LEADs", cor: "bg-slate-500" },
  { id: "em_tratamento", label: "Em Tratamento", cor: "bg-blue-500" },
  { id: "reuniao_agendada", label: "Reunião Agendada", cor: "bg-purple-500" },
  { id: "proposta_enviada", label: "Proposta Enviada", cor: "bg-yellow-500" },
  { id: "proposta_adjudicada", label: "Proposta Adjudicada", cor: "bg-orange-500" },
  { id: "won", label: "Won ✓", cor: "bg-green-500" },
  { id: "renovacoes_pendente", label: "Renovações", cor: "bg-teal-500" },
  { id: "contratos_renovados", label: "Renovados", cor: "bg-emerald-600" },
  { id: "contratos_terminados", label: "Terminados", cor: "bg-red-400" },
  { id: "servicos_isolados", label: "Serviços Isolados", cor: "bg-indigo-400" },
  { id: "lost", label: "Lost", cor: "bg-red-600" },
];

const FASES_PIPELINE: Fase[] = ["leads","em_tratamento","reuniao_agendada","proposta_enviada","proposta_adjudicada","won"];

function faseCor(fase: string) {
  return FASES.find(f => f.id === fase)?.cor || "bg-slate-500";
}
function faseLabel(fase: string) {
  return FASES.find(f => f.id === fase)?.label || fase;
}

// ─── Badge de Renovação ─────────────────────────────────────────────────────
function monthsUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diff = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
  return diff;
}

function RenewalBadge({ date, label = "Renovação" }: { date: Date | string | null | undefined; label?: string }) {
  const months = monthsUntil(date);
  if (months === null) return null;
  const d = new Date(date as string);
  const dateStr = d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  let color: string, bg: string, border: string, icon: string;
  if (months < 0) {
    color = "text-red-600"; bg = "bg-red-50"; border = "border-red-300"; icon = "\u26A0";
  } else if (months <= 1) {
    color = "text-red-600"; bg = "bg-red-50"; border = "border-red-300"; icon = "\u26A0";
  } else if (months <= 3) {
    color = "text-yellow-700"; bg = "bg-yellow-50"; border = "border-yellow-300"; icon = "\u23F0";
  } else {
    color = "text-green-700"; bg = "bg-green-50"; border = "border-green-300"; icon = "\u2714";
  }
  const monthsLabel = months < 0
    ? `Vencida há ${Math.abs(months)} mês${Math.abs(months) !== 1 ? "es" : ""}`
    : months === 0
    ? "Vence este mês"
    : `${months} mês${months !== 1 ? "es" : ""}`;
  return (
    <div className={`inline-flex flex-col items-start gap-0.5 px-2.5 py-1.5 rounded-lg border ${bg} ${border}`}>
      <div className={`text-[10px] uppercase tracking-wide font-medium ${color}`}>{icon} {label}</div>
      <div className={`text-xs font-semibold ${color}`}>{monthsLabel}</div>
      <div className="text-[10px] text-gray-500">{dateStr}</div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ section, setSection, user, onLogout }: {
  section: string; setSection: (s: string) => void;
  user: any; onLogout: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Utilizadores com role gestor_comercial só vêem Actividade
  const isComercialOnly = user?.role === "gestor_comercial";

  const nav = isComercialOnly ? [
    { id: "actividade", icon: "📊", label: "Actividade" },
  ] : [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "pipeline", icon: "◈", label: "Pipeline" },
    { id: "funil", icon: "▽", label: "Funil de Vendas" },
    { id: "leads", icon: "◎", label: "Leads" },
    { id: "empresas", icon: "⬡", label: "Clientes" },
    { id: "clientes_perdidos", icon: "⬡", label: "Clientes Perdidos" },
    { id: "leads_perdidas", icon: "✕", label: "Leads Perdidas" },
    { id: "prospecting", icon: "◈", label: "Prospecção" },
    { id: "alertas", icon: "◉", label: "Alertas" },
    { id: "reunioes", icon: "◷", label: "Reuniões" },
    { id: "equipa", icon: "👥", label: "Equipa" },
    { id: "actividade", icon: "📊", label: "Actividade" },
    { id: "automacoes", icon: "⚡", label: "Automações" },
    { id: "qualidade", icon: "✦", label: "Qualidade de Dados" },
    ...(user?.role === "admin" ? [{ id: "admin", icon: "⚙", label: "Administração" }] : []),
  ];

  return (
    <aside
      className="min-h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-200"
      style={{ width: collapsed ? 56 : 224 }}
    >
      {/* Logo + toggle */}
      <div className={`border-b border-gray-200 flex items-center ${collapsed ? "justify-center p-3" : "p-4 gap-2"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 bg-[#e85d26] rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0">T</div>
            <div className="min-w-0">
              <div className="text-gray-900 font-bold text-sm leading-none">TEAM 24</div>
              <div className="text-gray-400 text-[10px] tracking-widest uppercase mt-0.5">CRM</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-[#e85d26] rounded-lg flex items-center justify-center text-white font-bold text-xs">T</div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-all"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            {collapsed
              ? <path d="M4 2l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M10 2L4 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center rounded-lg text-sm transition-all ${
              collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            } ${
              section === item.id
                ? "bg-[#e85d26]/10 text-[#e85d26] font-medium"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/80"
            }`}
          >
            <span className="text-base flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className={`border-t border-gray-200 ${collapsed ? "p-2" : "p-4"}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#e85d26]/20 flex items-center justify-center text-[#e85d26] font-bold text-xs" title={user?.nome}>
              {user?.nome?.charAt(0) || "?"}
            </div>
            <button onClick={onLogout} title="Terminar sessão" className="text-gray-400 hover:text-gray-700 transition-colors text-xs">→</button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#e85d26]/20 flex items-center justify-center text-[#e85d26] font-bold text-xs flex-shrink-0">
                {user?.nome?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-800 text-xs font-medium truncate">{user?.nome}</div>
                <div className="text-gray-400 text-[10px] capitalize">{user?.role?.replace("_", " ")}</div>
              </div>
            </div>
            <button onClick={onLogout} className="w-full text-xs text-gray-400 hover:text-gray-700 text-left transition-colors">
              Terminar sessão →
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onEmpresaClick, onNavigate }: { onEmpresaClick: (id: number) => void; onNavigate?: (s: string) => void }) {
  // ── Filtro de período ────────────────────────────────────────────────────────
  type Periodo = "mes" | "trimestre" | "ano" | "personalizado";
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [dataInicioCustom, setDataInicioCustom] = useState("");
  const [dataFimCustom, setDataFimCustom] = useState("");

  const calcPeriodo = () => {
    const hoje = new Date();
    let di: Date, df: Date = hoje;
    if (periodo === "mes") {
      di = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    } else if (periodo === "trimestre") {
      const q = Math.floor(hoje.getMonth() / 3);
      di = new Date(hoje.getFullYear(), q * 3, 1);
    } else if (periodo === "ano") {
      di = new Date(hoje.getFullYear(), 0, 1);
    } else {
      di = dataInicioCustom ? new Date(dataInicioCustom) : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      df = dataFimCustom ? new Date(dataFimCustom) : hoje;
    }
    return { dataInicio: di.toISOString(), dataFim: df.toISOString() };
  };
  const filtroData = calcPeriodo();

  const periodoLabel = () => {
    const hoje = new Date();
    if (periodo === "mes") return hoje.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
    if (periodo === "trimestre") {
      const q = Math.floor(hoje.getMonth() / 3) + 1;
      return `T${q} ${hoje.getFullYear()}`;
    }
    if (periodo === "ano") return `${hoje.getFullYear()}`;
    if (dataInicioCustom && dataFimCustom) return `${new Date(dataInicioCustom).toLocaleDateString("pt-PT")} – ${new Date(dataFimCustom).toLocaleDateString("pt-PT")}`;
    return "Período personalizado";
  };

  const { data: stats, isLoading } = trpc.crm.dashboard.stats.useQuery();
  const { data: actividades } = trpc.crm.dashboard.actividadesRecentes.useQuery();
  const { data: renovacoes } = trpc.crm.dashboard.proximasRenovacoes.useQuery();
  const { data: causas } = trpc.crm.dashboard.causasPerda.useQuery(filtroData);
  const { data: insights } = trpc.crm.dashboard.insightsClientes.useQuery(filtroData);
  const { data: qualidade } = trpc.crmQualidade.resumo.useQuery();

  if (isLoading) return <div className="p-8 text-gray-500">A carregar...</div>;

  const kpis = [
    { label: "Total Leads Activas", value: stats?.totalLeads ?? 0, icon: "◎", cor: "text-blue-600" },
    { label: "Clientes Activos", value: insights?.ativos ?? stats?.clientesAtivos ?? 0, icon: "✓", cor: "text-green-700" },
    { label: "Receita Mensal", value: insights?.receitaTotal ? `€${Number(insights.receitaTotal).toLocaleString('pt-PT')}` : "—", icon: "€", cor: "text-emerald-600", raw: true },
    { label: "Alertas Pendentes", value: stats?.alertasPendentes ?? 0, icon: "◉", cor: "text-orange-600" },
  ];

  // Cores para o gráfico de causas
  const CORES_CAUSAS = ["#e85d26","#7c3aed","#dc2626","#d97706","#2563eb","#059669","#db2777","#0891b2"];

  // Normalizar causas de leads (agrupar por categoria)
  const causasLeadsAgrupadas = (causas?.causasLeads || []).reduce<Record<string, number>>((acc, c) => {
    const m = c.motivo || "Outro";
    acc[m] = (acc[m] || 0) + Number(c.count);
    return acc;
  }, {});
  const causasLeadsOrdenadas = Object.entries(causasLeadsAgrupadas)
    .sort((a, b) => b[1] - a[1]).slice(0, 8);
  const totalCausasLeads = causasLeadsOrdenadas.reduce((s, [, v]) => s + v, 0);

  // Causas de perda de clientes
  const causasClientesOrdenadas = (causas?.causasClientes || [])
    .map(c => [c.motivo || "Outro", Number(c.count)] as [string, number])
    .sort((a, b) => b[1] - a[1]).slice(0, 8);
  const totalCausasClientes = causasClientesOrdenadas.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho + Selector de Período */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-gray-900 text-sm font-semibold">Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">Visão geral do CRM TEAM 24</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botões de período rápido */}
          {(["mes", "trimestre", "ano", "personalizado"] as Periodo[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${
                periodo === p
                  ? "bg-[#e85d26] text-white border-[#e85d26]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {p === "mes" ? "Mês" : p === "trimestre" ? "Trimestre" : p === "ano" ? "Ano" : "Personalizado"}
            </button>
          ))}
          {/* Inputs de data para período personalizado */}
          {periodo === "personalizado" && (
            <div className="flex items-center gap-1.5 ml-1">
              <input
                type="date"
                value={dataInicioCustom}
                onChange={e => setDataInicioCustom(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-[10px] text-gray-700 bg-white h-7 focus:outline-none focus:ring-1 focus:ring-[#e85d26]"
              />
              <span className="text-gray-400 text-[10px]">–</span>
              <input
                type="date"
                value={dataFimCustom}
                onChange={e => setDataFimCustom(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-[10px] text-gray-700 bg-white h-7 focus:outline-none focus:ring-1 focus:ring-[#e85d26]"
              />
            </div>
          )}
          {/* Label do período activo */}
          <span className="text-gray-400 text-[10px] ml-1 whitespace-nowrap">{periodoLabel()}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`text-2xl mb-1 ${kpi.cor}`}>{kpi.icon}</div>
            <div className="text-xl font-bold text-gray-900">{(kpi as any).raw ? kpi.value : Number(kpi.value).toLocaleString()}</div>
            <div className="text-gray-500 text-[10px] mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Insights de Clientes */}
      {insights && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-green-700 text-[10px] font-medium uppercase tracking-wide mb-1">Taxa de Retenção</div>
            <div className="text-2xl font-bold text-green-800">{insights.taxaRetencao}%</div>
            <div className="text-green-600 text-[10px] mt-1">{insights.ativos} activos / {insights.ativos + insights.perdidos} histórico</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-red-700 text-[10px] font-medium uppercase tracking-wide mb-1">Leads Perdidas</div>
            <div className="text-2xl font-bold text-red-800">{(insights as any).leadsPerdidas ?? insights.perdidos}</div>
            <div className="text-red-600 text-[10px] mt-1">No período: {periodoLabel()}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-amber-700 text-[10px] font-medium uppercase tracking-wide mb-1">Leads Ganhas</div>
            <div className="text-2xl font-bold text-amber-800">{(insights as any).leadsGanhas ?? 0}</div>
            <div className="text-amber-600 text-[10px] mt-1">Convertidas no período</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-blue-700 text-[10px] font-medium uppercase tracking-wide mb-1">Novos Clientes</div>
            <div className="text-2xl font-bold text-blue-800">{(insights as any).novosNoPeriodo ?? 0}</div>
            <div className="text-blue-600 text-[10px] mt-1">Adicionados no período</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Gráfico: Causas de Perda de Leads */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-900 font-medium text-xs mb-1">Causas de Perda — Leads</h3>
          <p className="text-gray-400 text-[10px] mb-4">{totalCausasLeads} leads perdidas com motivo registado</p>
          {causasLeadsOrdenadas.length === 0 ? (
            <p className="text-gray-400 text-xs py-4 text-center">Sem dados de motivos de perda.</p>
          ) : (
            <div className="space-y-2">
              {causasLeadsOrdenadas.map(([motivo, count], i) => {
                const pct = totalCausasLeads > 0 ? Math.round((count / totalCausasLeads) * 100) : 0;
                return (
                  <div key={motivo}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-gray-700 text-[10px] truncate max-w-[65%]">{motivo}</span>
                      <span className="text-gray-500 text-[10px]">{count} <span className="text-gray-300">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: CORES_CAUSAS[i % CORES_CAUSAS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gráfico: Causas de Perda de Clientes */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-900 font-medium text-xs mb-1">Causas de Perda — Clientes</h3>
          <p className="text-gray-400 text-[10px] mb-4">{totalCausasClientes} clientes perdidos com motivo registado</p>
          {causasClientesOrdenadas.length === 0 ? (
            <p className="text-gray-400 text-xs py-4 text-center">Sem dados. Preencha a razão de perda nos Clientes Perdidos.</p>
          ) : (
            <div className="space-y-2">
              {causasClientesOrdenadas.map(([motivo, count], i) => {
                const pct = totalCausasClientes > 0 ? Math.round((count / totalCausasClientes) * 100) : 0;
                return (
                  <div key={motivo}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-gray-700 text-[10px] truncate max-w-[65%]">{motivo}</span>
                      <span className="text-gray-500 text-[10px]">{count} <span className="text-gray-300">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: CORES_CAUSAS[i % CORES_CAUSAS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pipeline por fase */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-900 font-medium text-sm mb-4">Pipeline por Fase</h3>
          <div className="space-y-2">
            {(stats?.pipeline || [])
              .filter(p => p.fase && p.fase !== "lost" && p.fase !== "contratos_terminados")
              .sort((a, b) => Number(b.count) - Number(a.count))
              .slice(0, 8)
              .map(p => (
                <div key={p.fase} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${faseCor(p.fase)}`} />
                  <span className="text-gray-700 text-xs flex-1">{faseLabel(p.fase)}</span>
                  <span className="text-gray-500 text-xs">{Number(p.count)}</span>
                  {Number(p.valor) > 0 && (
                    <span className="text-green-700 text-xs">€{Number(p.valor).toLocaleString()}/mês</span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Distribuição de clientes por sector */}
        {insights && insights.porSector.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-900 font-medium text-sm mb-4">Clientes por Sector</h3>
            <div className="space-y-2">
              {insights.porSector.slice(0, 8).map((s, i) => {
                const total = insights.porSector.reduce((acc, x) => acc + Number(x.count), 0);
                const pct = total > 0 ? Math.round((Number(s.count) / total) * 100) : 0;
                return (
                  <div key={s.sector}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-gray-700 text-[10px] truncate max-w-[65%] capitalize">{s.sector?.replace(/_/g, " ") || "Outro"}</span>
                      <span className="text-gray-500 text-[10px]">{Number(s.count)} <span className="text-gray-300">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: CORES_CAUSAS[i % CORES_CAUSAS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Reuniões próximas (fallback) */
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-900 font-medium text-sm mb-4">Próximas Reuniões (7 dias)</h3>
            {(stats?.reunioes || []).length === 0 ? (
              <p className="text-gray-400 text-xs">Sem reuniões agendadas.</p>
            ) : (
              <div className="space-y-2">
                {stats?.reunioes.map(r => (
                  <div key={r.id} className="flex items-start gap-2 p-2 bg-gray-100/80 rounded-lg">
                    <div className="text-purple-600 text-sm mt-0.5">◷</div>
                    <div>
                      <div className="text-gray-800 text-xs font-medium">{r.titulo}</div>
                      <div className="text-gray-400 text-[10px]">
                        {new Date(r.dataInicio).toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Widget: Próximas Renovações */}
      {(renovacoes && renovacoes.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-medium text-sm">Próximas Renovações de Contrato</h3>
            <span className="text-gray-400 text-[10px] uppercase tracking-wide">Top 5 mais urgentes</span>
          </div>
          <div className="space-y-2">
            {renovacoes.map(emp => {
              const months = (() => {
                if (!emp.dataFimContrato) return null;
                const d = new Date(emp.dataFimContrato);
                const now = new Date();
                return (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
              })();
              const dateStr = emp.dataFimContrato
                ? new Date(emp.dataFimContrato).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
                : "";
              let color: string, bg: string, border: string, icon: string, label: string;
              if (months === null) { color = "text-gray-500"; bg = "bg-gray-200/50"; border = "border-gray-200"; icon = "—"; label = "—"; }
              else if (months < 0) { color = "text-red-600"; bg = "bg-red-50"; border = "border-red-300"; icon = "\u26A0"; label = `Vencida há ${Math.abs(months)} mês${Math.abs(months) !== 1 ? "es" : ""}`; }
              else if (months === 0) { color = "text-red-600"; bg = "bg-red-50"; border = "border-red-300"; icon = "\u26A0"; label = "Vence este mês"; }
              else if (months <= 1) { color = "text-red-600"; bg = "bg-red-50"; border = "border-red-300"; icon = "\u26A0"; label = `${months} mês`; }
              else if (months <= 3) { color = "text-yellow-700"; bg = "bg-yellow-50"; border = "border-yellow-300"; icon = "\u23F0"; label = `${months} meses`; }
              else { color = "text-green-700"; bg = "bg-green-50"; border = "border-green-300"; icon = "\u2714"; label = `${months} meses`; }
              const mensalidade = emp.mensalidade || emp.valorMensalidade;
              return (
                <button
                  key={emp.id}
                  onClick={() => onEmpresaClick(emp.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#e85d26]/40 hover:bg-gray-100/70 transition-all text-left group"
                >
                  {/* Urgency indicator */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold border ${bg} ${border} ${color}`}>
                    {icon}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-800 text-xs font-semibold truncate group-hover:text-gray-900">{emp.nome}</div>
                    <div className="text-gray-400 text-[10px] truncate">{emp.sector || "Sector não definido"}</div>
                  </div>
                  {/* Mensalidade */}
                  {mensalidade && (
                    <div className="text-green-700 text-xs shrink-0 font-medium">
                      €{Number(mensalidade).toLocaleString("pt-PT")}/mês
                    </div>
                  )}
                  {/* Badge */}
                  <div className={`shrink-0 text-right`}>
                    <div className={`text-[10px] font-semibold ${color}`}>{label}</div>
                    <div className="text-gray-400 text-[10px]">{dateStr}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Qualidade de Dados */}
      {qualidade && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900 font-medium text-xs">Qualidade de Dados</h3>
              <p className="text-gray-400 text-[10px] mt-0.5">Campos em falta que precisam de ser preenchidos para qualificar leads e clientes</p>
            </div>
            <button onClick={() => onNavigate?.("qualidade")}
              className="text-[10px] text-[#e85d26] hover:underline font-medium">Ver checkup completo →</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {/* Score Leads */}
            <div onClick={() => onNavigate?.("qualidade")}
              className="cursor-pointer border border-gray-200 rounded-xl p-3 hover:border-[#e85d26]/40 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500">Leads Activas</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  (qualidade.leads.scoreMedia || 0) >= 80 ? "text-green-700 bg-green-50" :
                  (qualidade.leads.scoreMedia || 0) >= 50 ? "text-yellow-700 bg-yellow-50" : "text-red-700 bg-red-50"
                }`}>{qualidade.leads.scoreMedia}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${
                  (qualidade.leads.scoreMedia || 0) >= 80 ? "bg-green-500" :
                  (qualidade.leads.scoreMedia || 0) >= 50 ? "bg-yellow-400" : "bg-red-500"
                }`} style={{ width: `${qualidade.leads.scoreMedia}%` }} />
              </div>
              <div className="text-xs font-bold text-gray-900">{qualidade.leads.total}</div>
              {qualidade.leads.criticas > 0 && (
                <div className="text-[10px] text-red-500 mt-0.5">{qualidade.leads.criticas} críticas</div>
              )}
            </div>
            {/* Score Clientes */}
            <div onClick={() => onNavigate?.("qualidade")}
              className="cursor-pointer border border-gray-200 rounded-xl p-3 hover:border-[#e85d26]/40 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500">Clientes Activos</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  (qualidade.empresas.scoreMedia || 0) >= 80 ? "text-green-700 bg-green-50" :
                  (qualidade.empresas.scoreMedia || 0) >= 50 ? "text-yellow-700 bg-yellow-50" : "text-red-700 bg-red-50"
                }`}>{qualidade.empresas.scoreMedia}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${
                  (qualidade.empresas.scoreMedia || 0) >= 80 ? "bg-green-500" :
                  (qualidade.empresas.scoreMedia || 0) >= 50 ? "bg-yellow-400" : "bg-red-500"
                }`} style={{ width: `${qualidade.empresas.scoreMedia}%` }} />
              </div>
              <div className="text-xs font-bold text-gray-900">{qualidade.empresas.total}</div>
              {qualidade.empresas.criticas > 0 && (
                <div className="text-[10px] text-red-500 mt-0.5">{qualidade.empresas.criticas} críticos</div>
              )}
            </div>
            {/* Top campo em falta: Leads */}
            {qualidade.leads.campos.filter(c => c.semCampo > 0).slice(0, 1).map(c => (
              <div key={c.campo} onClick={() => onNavigate?.("qualidade")}
                className="cursor-pointer border border-red-100 bg-red-50/50 rounded-xl p-3 hover:border-red-300 hover:shadow-sm transition-all">
                <div className="text-[10px] text-red-600 font-medium mb-1">Leads sem {c.label}</div>
                <div className="text-xl font-bold text-red-700">{c.semCampo}</div>
                <div className="text-[10px] text-red-400 mt-0.5">{c.percentagem}% do total</div>
                <div className="text-[10px] text-red-300 mt-1">Clique para qualificar →</div>
              </div>
            ))}
            {/* Top campo em falta: Clientes */}
            {qualidade.empresas.campos.filter(c => c.semCampo > 0).slice(0, 1).map(c => (
              <div key={c.campo} onClick={() => onNavigate?.("qualidade")}
                className="cursor-pointer border border-orange-100 bg-orange-50/50 rounded-xl p-3 hover:border-orange-300 hover:shadow-sm transition-all">
                <div className="text-[10px] text-orange-600 font-medium mb-1">Clientes sem {c.label}</div>
                <div className="text-xl font-bold text-orange-700">{c.semCampo}</div>
                <div className="text-[10px] text-orange-400 mt-0.5">{c.percentagem}% do total</div>
                <div className="text-[10px] text-orange-300 mt-1">Clique para qualificar →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actividades recentes */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-900 font-medium text-sm mb-4">Actividades Recentes</h3>
        <div className="space-y-1">
          {(actividades || []).slice(0, 10).map(a => (
            <div key={a.id} className="flex items-center gap-3 py-1.5 border-b border-gray-200 last:border-0">
              <span className="text-gray-400 text-xs w-16 shrink-0">
                {new Date(a.dataActividade).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}
              </span>
              <Badge variant="outline" className="text-[10px] py-0 border-gray-300 text-gray-500 capitalize">{a.tipo}</Badge>
              <span className="text-gray-700 text-xs flex-1 truncate">{a.titulo}</span>
              {a.empresaNome && <span className="text-gray-400 text-xs truncate max-w-32">{a.empresaNome}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Kanban ──────────────────────────────────────────────────────────
function Pipeline({ onLeadClick }: { onLeadClick: (id: number) => void }) {
  const { data: leads, refetch } = trpc.crm.leads.kanban.useQuery();
  const moveFase = trpc.crm.leads.moveFase.useMutation({ onSuccess: () => refetch() });
  const [dragging, setDragging] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const leadsByFase = (fase: Fase) => (leads || []).filter(l => l.fase === fase);

  const handleDrop = (e: React.DragEvent, targetFase: Fase) => {
    e.preventDefault();
    if (dragging !== null) {
      moveFase.mutate({ id: dragging, fase: targetFase });
      setDragging(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 text-sm font-semibold">Pipeline</h1>
          <p className="text-gray-500 text-xs mt-0.5">{(leads || []).length} leads activas</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900 text-sm">
          + Nova Lead
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {FASES_PIPELINE.map(fase => {
          const faseDef = FASES.find(f => f.id === fase)!;
          const items = leadsByFase(fase);
          const totalMens = items.reduce((s, l) => s + (Number(l.mensalidade) || 0), 0);
          return (
            <div
              key={fase}
              className="flex-shrink-0 w-64 bg-white rounded-xl border border-gray-200"
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, fase)}
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${faseDef.cor}`} />
                  <span className="text-gray-800 text-xs font-medium">{faseDef.label}</span>
                  <span className="ml-auto bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">{items.length}</span>
                </div>
                {totalMens > 0 && (
                  <div className="text-green-700 text-[10px] mt-1">€{totalMens.toLocaleString()}/mês</div>
                )}
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-24 max-h-[60vh] overflow-y-auto">
                {items.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragging(lead.id)}
                    onClick={() => onLeadClick(lead.id)}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:border-[#e85d26]/40 transition-all group"
                  >
                    <div className="text-gray-800 text-xs font-medium leading-tight group-hover:text-gray-900">{lead.titulo}</div>
                    {lead.empresaNome && <div className="text-gray-400 text-[10px] mt-1 truncate">{lead.empresaNome}</div>}
                    <div className="flex items-center gap-2 mt-2">
                      {lead.mensalidade && (
                        <span className="text-green-700 text-[10px]">€{Number(lead.mensalidade).toLocaleString()}</span>
                      )}
                      <span className="ml-auto flex items-center gap-1">
                        {lead.responsavelNome && (
                          <span className="text-[10px] text-gray-300 truncate max-w-20">{lead.responsavelNome.split(" ")[0]}</span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); onLeadClick(lead.id); }}
                          title="Preencher com IA"
                          className="opacity-0 group-hover:opacity-100 text-[9px] px-1.5 py-0.5 rounded border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-400 transition-all">
                          ✨
                        </button>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && <CreateLeadDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ─── Create Lead Dialog ───────────────────────────────────────────────────────
function CreateLeadDialog({ onClose, defaultEmpresaId }: { onClose: () => void; defaultEmpresaId?: number }) {
  const utils = trpc.useUtils();
  const [titulo, setTitulo] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const [mensalidade, setMensalidade] = useState("");
  const [notas, setNotas] = useState("");

  const create = trpc.crm.leads.create.useMutation({
    onSuccess: () => {
      utils.crm.leads.kanban.invalidate();
      utils.crm.leads.list.invalidate();
      utils.crm.dashboard.stats.invalidate();
      toast.success("Lead criada com sucesso!");
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-gray-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Nova Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-gray-700 text-xs">Título *</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Empresa XYZ — EAP 50 colaboradores"
              className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
          </div>
          <div>
            <Label className="text-gray-700 text-xs">Empresa</Label>
            <Input value={empresaNome} onChange={e => setEmpresaNome(e.target.value)}
              placeholder="Nome da empresa"
              className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
          </div>
          <div>
            <Label className="text-gray-700 text-xs">Mensalidade estimada (€)</Label>
            <Input type="number" value={mensalidade} onChange={e => setMensalidade(e.target.value)}
              placeholder="0"
              className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
          </div>
          <div>
            <Label className="text-gray-700 text-xs">Notas</Label>
            <Textarea value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Contexto, origem da lead, etc."
              className="bg-gray-50 border-gray-300 text-gray-900 mt-1 min-h-20" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-500">Cancelar</Button>
          <Button
            onClick={() => create.mutate({ titulo, empresaNome: empresaNome || undefined, mensalidade: mensalidade ? Number(mensalidade) : undefined, notas: notas || undefined })}
            disabled={!titulo || create.isPending}
            className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900"
          >
            {create.isPending ? "A criar..." : "Criar Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Lista de Leads ───────────────────────────────────────────────────────────
function LeadsList({ onLeadClick }: { onLeadClick: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [fase, setFase] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = trpc.crm.leads.list.useQuery({
    search: search || undefined,
    fase: fase !== "all" ? fase as Fase : undefined,
    ativo: fase === "lost" ? false : true,
    page, limit: 50,
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 text-sm font-semibold">Leads</h1>
          <p className="text-gray-500 text-xs mt-0.5">{data?.total ?? 0} leads encontradas</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900 text-sm">
          + Nova Lead
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Pesquisar leads..."
          className="bg-white border-gray-300 text-gray-900 max-w-xs"
        />
        <Select value={fase} onValueChange={v => { setFase(v); setPage(1); }}>
          <SelectTrigger className="bg-white border-gray-300 text-gray-700 w-48">
            <SelectValue placeholder="Todas as fases" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300">
            <SelectItem value="all" className="text-gray-700">Todas as fases</SelectItem>
            {FASES.map(f => (
              <SelectItem key={f.id} value={f.id} className="text-gray-700">{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Lead</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Empresa</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Fase</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Mensalidade</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Renovação</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Responsável</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Última Act.</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8">A carregar...</td></tr>
            ) : (data?.leads || []).length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8">Sem leads encontradas.</td></tr>
            ) : (data?.leads || []).map(lead => (
              <tr
                key={lead.id}
                onClick={() => onLeadClick(lead.id)}
                className="border-b border-gray-200 hover:bg-gray-100/60 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-gray-800 font-medium max-w-56 truncate">{lead.titulo}</td>
                <td className="px-4 py-3 text-gray-500 max-w-40 truncate">{lead.empresaNome || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full text-gray-900 ${faseCor(lead.fase)}`}>
                    {faseLabel(lead.fase)}
                  </span>
                </td>
                <td className="px-4 py-3 text-green-700 text-xs">
                  {lead.mensalidade ? `€${Number(lead.mensalidade).toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-3">
                  {(lead as any).dataRenovacao
                    ? <RenewalBadge date={(lead as any).dataRenovacao} label="Renov." />
                    : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{lead.responsavelNome || "—"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {lead.ultimaActividade ? new Date(lead.ultimaActividade).toLocaleDateString("pt-PT") : "—"}
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onLeadClick(lead.id)}
                    title="Preencher com IA"
                    className="text-[10px] px-2 py-1 rounded border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-400 transition-colors">
                    ✨ IA
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {(data?.total ?? 0) > 50 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-400 text-xs">Página {page} de {Math.ceil((data?.total ?? 0) / 50)}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="border-gray-300 text-gray-700">Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil((data?.total ?? 0) / 50)}
              className="border-gray-300 text-gray-700">Seguinte</Button>
          </div>
        </div>
      )}

      {showCreate && <CreateLeadDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ─── Empresas ─────────────────────────────────────────────────────────────────
function Empresas({ onEmpresaClick }: { onEmpresaClick: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, refetch } = trpc.crm.empresas.list.useQuery({
    search: search || undefined,
    clienteAtivo: true,
    page, limit: 50,
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 text-base font-semibold">Clientes Activos</h1>
          <p className="text-gray-500 text-xs mt-0.5">{data?.total ?? 0} clientes com contrato activo</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900 text-sm">
          + Novo Cliente
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Pesquisar clientes activos..."
          className="bg-white border-gray-300 text-gray-900 max-w-xs text-xs h-8"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Cliente</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Sector</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Colaboradores</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Mensalidade</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Renovação</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Cidade</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8">A carregar...</td></tr>
            ) : (data?.empresas || []).length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-400 py-8">Sem clientes encontrados.</td></tr>
            ) : (data?.empresas || []).map(emp => (
              <tr
                key={emp.id}
                onClick={() => onEmpresaClick(emp.id)}
                className="border-b border-gray-200 hover:bg-gray-100/60 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2">
                  <div className="text-gray-800 font-medium text-xs">{emp.nome}</div>
                  {emp.email && <div className="text-gray-400 text-[10px]">{emp.email}</div>}
                </td>
                <td className="px-4 py-2 text-gray-500 text-xs">{emp.sector || "—"}</td>
                <td className="px-4 py-2 text-gray-500 text-xs">{emp.numColaboradores ?? "—"}</td>
                <td className="px-4 py-2 text-green-700 text-xs">
                  {(emp as any).mensalidade ? `€${Number((emp as any).mensalidade).toLocaleString('pt-PT')}` : emp.valorMensalidade ? `€${Number(emp.valorMensalidade).toLocaleString('pt-PT')}` : "—"}
                </td>
                <td className="px-4 py-2">
                  {(emp as any).dataFimContrato
                    ? <RenewalBadge date={(emp as any).dataFimContrato} label="Renov." />
                    : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-2 text-gray-500 text-xs">{emp.cidade || "—"}</td>
                <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onEmpresaClick(emp.id)}
                    title="Preencher com IA"
                    className="text-[10px] px-2 py-1 rounded border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-400 transition-colors">
                    ✨ IA
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(data?.total ?? 0) > 50 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-400 text-xs">Página {page} de {Math.ceil((data?.total ?? 0) / 50)}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="border-gray-300 text-gray-700">Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil((data?.total ?? 0) / 50)}
              className="border-gray-300 text-gray-700">Seguinte</Button>
          </div>
        </div>
      )}

      {showCreate && <CreateEmpresaDialog onClose={() => { setShowCreate(false); refetch(); }} />}
    </div>
  );
}

function CreateEmpresaDialog({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [nome, setNome] = useState("");
  const [sector, setSector] = useState("");
  const [numColaboradores, setNumColaboradores] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");

  const create = trpc.crm.empresas.create.useMutation({
    onSuccess: () => {
      utils.crm.empresas.list.invalidate();
      toast.success("Cliente criado!");
      onClose();
    },
    onError: e => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-gray-900 max-w-md">
        <DialogHeader><DialogTitle className="text-gray-900">Novo Cliente</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-gray-700 text-xs">Nome *</Label>
            <Input value={nome} onChange={e => setNome(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-700 text-xs">Sector</Label>
              <Input value={sector} onChange={e => setSector(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
            </div>
            <div>
              <Label className="text-gray-700 text-xs">Nº Colaboradores</Label>
              <Input type="number" value={numColaboradores} onChange={e => setNumColaboradores(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-700 text-xs">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
            </div>
            <div>
              <Label className="text-gray-700 text-xs">Telefone</Label>
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-gray-700 text-xs">Cidade</Label>
            <Input value={cidade} onChange={e => setCidade(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-500">Cancelar</Button>
          <Button onClick={() => create.mutate({ nome, sector: sector || undefined, numColaboradores: numColaboradores ? Number(numColaboradores) : undefined, email: email || undefined, telefone: telefone || undefined, cidade: cidade || undefined })}
            disabled={!nome || create.isPending} className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900">
            {create.isPending ? "A criar..." : "Criar Cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Clientes Perdidos ───────────────────────────────────────────────────────
function ClientesPerdidos({ onEmpresaClick }: { onEmpresaClick: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editandoMotivoId, setEditandoMotivoId] = useState<number | null>(null);
  const [motivoEditando, setMotivoEditando] = useState("");
  const [reativandoId, setReativandoId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.crm.empresas.list.useQuery({
    search: search || undefined,
    clienteAtivo: false,
    page, limit: 50,
  });

  const updateEmpresa = trpc.crm.empresas.update.useMutation({
    onSuccess: () => {
      utils.crm.empresas.list.invalidate();
      setEditandoMotivoId(null);
      toast.success("Razão de perda guardada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const reativar = trpc.crm.empresas.update.useMutation({
    onMutate: ({ id }) => setReativandoId(id),
    onSuccess: () => {
      utils.crm.empresas.list.invalidate();
      utils.crm.dashboard.stats.invalidate();
      toast.success("Cliente reactivado com sucesso!");
      setReativandoId(null);
    },
    onError: (e) => { toast.error(e.message); setReativandoId(null); },
  });

  const iniciarEdicaoMotivo = (e: React.MouseEvent, emp: any) => {
    e.stopPropagation();
    setEditandoMotivoId(emp.id);
    setMotivoEditando(emp.motivoPerda || "");
  };

  const guardarMotivo = (e: React.MouseEvent, empId: number) => {
    e.stopPropagation();
    updateEmpresa.mutate({ id: empId, motivoPerda: motivoEditando || null });
  };

  // Contagem por motivo para o resumo
  const motivoStats = (data?.empresas || []).reduce<Record<string, number>>((acc, emp) => {
    const m = (emp as any).motivoPerda || "Sem motivo";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  const temMotivos = Object.keys(motivoStats).some(k => k !== "Sem motivo");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-gray-900 text-sm font-semibold">Clientes Perdidos</h1>
          <p className="text-gray-500 text-xs mt-0.5">{data?.total ?? 0} ex-clientes / prospects sem contrato activo</p>
        </div>
      </div>

      {/* Resumo por motivo */}
      {temMotivos && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(motivoStats)
            .filter(([m]) => m !== "Sem motivo")
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([motivo, count]) => (
              <span key={motivo} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-white text-[10px] font-medium text-gray-600">
                {motivo.length > 25 ? motivo.slice(0, 23) + "…" : motivo}
                <span className="px-1 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-500">{count}</span>
              </span>
            ))}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Pesquisar..."
          className="bg-white border-gray-300 text-gray-900 max-w-xs text-xs h-8"
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Cliente</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Razão de Perda</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Sector</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Mensalidade</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Cidade</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Acção</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8 text-xs">A carregar...</td></tr>
            ) : (data?.empresas || []).length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8 text-xs">Sem registos encontrados.</td></tr>
            ) : (data?.empresas || []).map(emp => (
              <tr
                key={emp.id}
                onClick={() => onEmpresaClick(emp.id)}
                className="border-b border-gray-200 hover:bg-gray-100/60 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2">
                  <div className="text-gray-800 font-medium text-xs">{emp.nome}</div>
                  {emp.email && <div className="text-gray-400 text-[10px]">{emp.email}</div>}
                </td>
                <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                  {editandoMotivoId === emp.id ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={motivoEditando}
                        onChange={e => setMotivoEditando(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") guardarMotivo(e as any, emp.id);
                          if (e.key === "Escape") setEditandoMotivoId(null);
                        }}
                        placeholder="Razão de perda..."
                        className="border border-gray-300 rounded px-2 py-0.5 text-[10px] text-gray-800 w-36 focus:outline-none focus:border-blue-400"
                      />
                      <button onClick={e => guardarMotivo(e, emp.id)} className="text-green-600 hover:text-green-800 text-[10px] font-medium px-1">✓</button>
                      <button onClick={e => { e.stopPropagation(); setEditandoMotivoId(null); }} className="text-gray-400 hover:text-gray-600 text-[10px] px-1">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 group/motivo">
                      <MotivoPerda motivo={(emp as any).motivoPerda} />
                      <button
                        onClick={e => iniciarEdicaoMotivo(e, emp)}
                        className="opacity-0 group-hover/motivo:opacity-100 text-gray-300 hover:text-gray-600 transition-opacity text-[10px] ml-1"
                        title="Editar razão de perda"
                      >✎</button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-500 text-xs">{emp.sector || "—"}</td>
                <td className="px-4 py-2 text-gray-400 text-xs">
                  {emp.valorMensalidade ? `€${Number(emp.valorMensalidade).toLocaleString('pt-PT')}` : "—"}
                </td>
                <td className="px-4 py-2 text-gray-500 text-xs">{emp.cidade || "—"}</td>
                <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEmpresaClick(emp.id)}
                      title="Preencher com IA"
                      className="text-[10px] px-2 py-1 rounded border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-400 transition-colors">
                      ✨ IA
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); reativar.mutate({ id: emp.id, clienteAtivo: true, motivoPerda: null }); }}
                      disabled={reativandoId === emp.id}
                      title="Reactivar cliente"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-green-200 bg-green-50 text-green-700 text-[10px] font-medium hover:bg-green-100 hover:border-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reativandoId === emp.id ? (
                        <span className="animate-spin text-[10px]">&#8635;</span>
                      ) : (
                        <span>↺</span>
                      )}
                      Reactivar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(data?.total ?? 0) > 50 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-400 text-xs">Página {page} de {Math.ceil((data?.total ?? 0) / 50)}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="border-gray-300 text-gray-700 text-xs">Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil((data?.total ?? 0) / 50)} className="border-gray-300 text-gray-700 text-xs">Seguinte</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Leads Perdidas ────────────────────────────────────────────────────────────
// Mapeamento de motivos para cor de etiqueta
function MotivoPerda({ motivo }: { motivo: string | null | undefined }) {
  if (!motivo) return <span className="text-gray-300 text-[10px]">—</span>;
  const m = motivo.toLowerCase();
  let bg: string, text: string;
  if (m.includes("financ") || m.includes("orçamento") || m.includes("preço")) {
    bg = "bg-orange-50 border-orange-200"; text = "text-orange-700";
  } else if (m.includes("concorr") || m.includes("produto semelhante") || m.includes("unamze")) {
    bg = "bg-purple-50 border-purple-200"; text = "text-purple-700";
  } else if (m.includes("sem interesse") || m.includes("desistiu") || m.includes("sem motivo")) {
    bg = "bg-red-50 border-red-200"; text = "text-red-700";
  } else if (m.includes("sem resposta") || m.includes("não compareceu") || m.includes("cancelada")) {
    bg = "bg-yellow-50 border-yellow-200"; text = "text-yellow-700";
  } else if (m.includes("oportuno") || m.includes("momento") || m.includes("adiado")) {
    bg = "bg-blue-50 border-blue-200"; text = "text-blue-700";
  } else {
    bg = "bg-gray-100 border-gray-200"; text = "text-gray-600";
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${bg} ${text}`} title={motivo}>
      {motivo.length > 30 ? motivo.slice(0, 28) + "…" : motivo}
    </span>
  );
}

function LeadsPerdidas({ onLeadClick }: { onLeadClick: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("");
  const [page, setPage] = useState(1);
  const [reativandoId, setReativandoId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const reativar = trpc.crm.leads.reativar.useMutation({
    onMutate: ({ id }) => setReativandoId(id),
    onSuccess: () => {
      utils.crm.leads.list.invalidate();
      utils.crm.dashboard.stats.invalidate();
      toast.success("Lead reactivada com sucesso!");
      setReativandoId(null);
    },
    onError: (e) => { toast.error(e.message); setReativandoId(null); },
  });

  const { data, isLoading } = trpc.crm.leads.list.useQuery({
    search: search || undefined,
    fase: "lost",
    page, limit: 50,
  });

  // Filtrar por motivo no cliente (os dados já estão carregados)
  const leads = (data?.leads || []).filter(l =>
    !filtroMotivo || ((l as any).motivoPerda || "").toLowerCase().includes(filtroMotivo.toLowerCase())
  );

  // Contagem por motivo para o resumo
  const motivoStats = (data?.leads || []).reduce<Record<string, number>>((acc, l) => {
    const m = (l as any).motivoPerda || "Sem motivo";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-gray-900 text-sm font-semibold">Leads Perdidas</h1>
          <p className="text-gray-500 text-xs mt-0.5">{data?.total ?? 0} leads com proposta/reunião que não avançaram</p>
        </div>
      </div>

      {/* Resumo por motivo */}
      {Object.keys(motivoStats).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(motivoStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([motivo, count]) => (
              <button
                key={motivo}
                onClick={() => setFiltroMotivo(filtroMotivo === motivo ? "" : motivo)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all ${
                  filtroMotivo === motivo
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                <span>{motivo.length > 25 ? motivo.slice(0, 23) + "…" : motivo}</span>
                <span className={`px-1 py-0.5 rounded-full text-[9px] font-bold ${
                  filtroMotivo === motivo ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>{count}</span>
              </button>
            ))}
          {filtroMotivo && (
            <button onClick={() => setFiltroMotivo("")} className="text-[10px] text-gray-400 hover:text-gray-700 px-2">
              ✕ limpar filtro
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Pesquisar leads perdidas..."
          className="bg-white border-gray-300 text-gray-900 max-w-xs text-xs h-8"
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Lead</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Motivo de Perda</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Responsável</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Mensalidade</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Data</th>
              <th className="text-left text-gray-500 text-[10px] font-medium px-4 py-2">Acção</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8 text-xs">A carregar...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8 text-xs">Sem leads perdidas.</td></tr>
            ) : leads.map(lead => (
              <tr
                key={lead.id}
                onClick={() => onLeadClick(lead.id)}
                className="border-b border-gray-200 hover:bg-gray-100/60 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-2">
                  <div className="text-gray-800 font-medium text-xs">{lead.titulo}</div>
                  {lead.empresaNome && <div className="text-gray-400 text-[10px]">{lead.empresaNome}</div>}
                </td>
                <td className="px-4 py-2">
                  <MotivoPerda motivo={(lead as any).motivoPerda} />
                </td>
                <td className="px-4 py-2 text-gray-500 text-xs">{lead.responsavelNome || "—"}</td>
                <td className="px-4 py-2 text-gray-400 text-xs">
                  {lead.mensalidade ? `€${Number(lead.mensalidade).toLocaleString('pt-PT')}` : "—"}
                </td>
                <td className="px-4 py-2 text-gray-400 text-xs">
                  {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString('pt-PT') : "—"}
                </td>
                <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onLeadClick(lead.id)}
                      title="Preencher com IA"
                      className="text-[10px] px-2 py-1 rounded border border-purple-200 text-purple-500 hover:bg-purple-50 hover:border-purple-400 transition-colors">
                      ✨ IA
                    </button>
                    <button
                      onClick={() => reativar.mutate({ id: lead.id, fase: "em_tratamento" })}
                      disabled={reativandoId === lead.id}
                      title="Reactivar lead"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-green-200 bg-green-50 text-green-700 text-[10px] font-medium hover:bg-green-100 hover:border-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reativandoId === lead.id ? (
                        <span className="animate-spin text-[10px]">&#8635;</span>
                      ) : (
                        <span>↺</span>
                      )}
                      Reactivar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(data?.total ?? 0) > 50 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-400 text-xs">Página {page} de {Math.ceil((data?.total ?? 0) / 50)}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="border-gray-300 text-gray-700 text-xs">Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil((data?.total ?? 0) / 50)} className="border-gray-300 text-gray-700 text-xs">Seguinte</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Alertas ──────────────────────────────────────────────────────────────────
const TIPO_ICONE: Record<string, string> = {
  renovacao_contrato: "🔄", contrato_expirado: "⚠️",
  lead_sem_actividade: "💤", proposta_sem_resposta: "📧",
  lead_nova_website: "🌐", reuniao_sem_followup: "📝",
  lead_fase_parada: "⏸️", mensalidade_alta_sem_contacto: "⭐",
  cliente_aniversario: "🎉", personalizado: "🔔",
  nova_lead: "🌐", follow_up: "📞", outro: "🔔",
  lead_sem_actividade_crm: "💤",
};
const TIPO_GRUPO: Record<string, string> = {
  renovacao_contrato: "Contratos", contrato_expirado: "Contratos",
  lead_sem_actividade: "Leads", lead_nova_website: "Leads",
  lead_fase_parada: "Leads", proposta_sem_resposta: "Propostas",
  reuniao_sem_followup: "Reuniões", mensalidade_alta_sem_contacto: "Clientes Premium",
  cliente_aniversario: "Clientes", personalizado: "Outros",
};

function Alertas() {
  const [tab, setTab] = useState<"pendentes"|"regras"|"historico">("pendentes");
  const utils = trpc.useUtils();
  const { data: alertas, refetch } = trpc.crm.alertas.list.useQuery({ estado: "pendente", limit: 50 });
  const { data: historico } = trpc.crm.alertas.list.useQuery({ estado: "resolvido", limit: 30 }, { enabled: tab === "historico" });
  const { data: regras, refetch: refetchRegras } = trpc.crm.alertas.listarRegras.useQuery(undefined, { enabled: tab === "regras" });
  const resolver = trpc.crm.alertas.resolver.useMutation({ onSuccess: () => refetch() });
  const ignorar = trpc.crm.alertas.ignorar.useMutation({ onSuccess: () => refetch() });
  const toggleRegra = trpc.crm.alertas.toggleRegra.useMutation({ onSuccess: () => refetchRegras() });
  const editarRegra = trpc.crm.alertas.editarRegra.useMutation({ onSuccess: () => refetchRegras() });
  const executar = trpc.crm.alertas.executarVerificacao.useMutation({ onSuccess: (d) => { refetch(); alert(`Verificação concluída: ${d.criados} novo(s) alerta(s) criado(s).`); } });
  const criarManual = trpc.crm.alertas.criarManual.useMutation({ onSuccess: () => { refetch(); setShowNovoAlerta(false); setNovoAlerta({ titulo: '', descricao: '', tipo: 'outro', prioridade: 'media' }); } });

  const [showNovoAlerta, setShowNovoAlerta] = useState(false);
  const [novoAlerta, setNovoAlerta] = useState({ titulo: '', descricao: '', tipo: 'outro' as any, prioridade: 'media' as any });
  const [editingRegra, setEditingRegra] = useState<number|null>(null);
  const [editDias, setEditDias] = useState('');

  const prioridadeCor: Record<string, string> = {
    urgente: "text-red-700 bg-red-50 border-red-300",
    alta: "text-orange-700 bg-orange-50 border-orange-300",
    media: "text-yellow-700 bg-yellow-50 border-yellow-300",
    baixa: "text-blue-600 bg-blue-50 border-blue-200",
  };

  const gruposAlerta = (alertas || []).reduce((acc, a) => {
    const grupo = TIPO_GRUPO[a.tipo] || "Outros";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(a);
    return acc;
  }, {} as Record<string, typeof alertas>);

  const gruposRegras = (regras || []).reduce((acc, r) => {
    const grupo = TIPO_GRUPO[r.tipo] || "Outros";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(r);
    return acc;
  }, {} as Record<string, typeof regras>);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 text-xl font-semibold">Alertas</h1>
          <p className="text-gray-500 text-sm mt-0.5">{(alertas || []).length} pendentes · {(regras || []).filter(r => r.ativo).length} regras activas</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => executar.mutate()} disabled={executar.isPending}
            className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50">
            {executar.isPending ? '⏳ A verificar...' : '▶ Executar Verificação'}
          </Button>
          <Button size="sm" onClick={() => setShowNovoAlerta(true)}
            className="bg-[#e85d26] hover:bg-[#d14e1a] text-white text-xs">
            + Novo Alerta
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {(["pendentes","regras","historico"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === "pendentes" ? `Pendentes${(alertas||[]).length > 0 ? ` (${(alertas||[]).length})` : ''}` : t === "regras" ? "Regras Automáticas" : "Histórico"}
          </button>
        ))}
      </div>

      {/* Novo Alerta Manual */}
      {showNovoAlerta && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-orange-800 text-xs font-semibold mb-3">Criar Alerta Manual</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-gray-500 text-[10px] block mb-1">Título *</label>
              <Input value={novoAlerta.titulo} onChange={e => setNovoAlerta(f => ({...f, titulo: e.target.value}))} className="bg-white border-gray-300 text-gray-900 text-xs h-8" placeholder="Ex: Follow-up com Empresa XYZ" />
            </div>
            <div>
              <label className="text-gray-500 text-[10px] block mb-1">Tipo</label>
              <select value={novoAlerta.tipo} onChange={e => setNovoAlerta(f => ({...f, tipo: e.target.value as any}))}
                className="w-full bg-white border border-gray-300 text-gray-900 text-xs h-8 rounded-md px-2">
                <option value="follow_up">Follow-up</option>
                <option value="reuniao_proxima">Reunião Próxima</option>
                <option value="contrato_renovacao">Renovação de Contrato</option>
                <option value="proposta_sem_resposta">Proposta sem Resposta</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-[10px] block mb-1">Prioridade</label>
              <select value={novoAlerta.prioridade} onChange={e => setNovoAlerta(f => ({...f, prioridade: e.target.value as any}))}
                className="w-full bg-white border border-gray-300 text-gray-900 text-xs h-8 rounded-md px-2">
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-gray-500 text-[10px] block mb-1">Descrição</label>
              <Input value={novoAlerta.descricao} onChange={e => setNovoAlerta(f => ({...f, descricao: e.target.value}))} className="bg-white border-gray-300 text-gray-900 text-xs h-8" placeholder="Notas adicionais..." />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={() => criarManual.mutate(novoAlerta)} disabled={!novoAlerta.titulo || criarManual.isPending}
              className="bg-[#e85d26] hover:bg-[#d14e1a] text-white text-xs">
              {criarManual.isPending ? 'A criar...' : 'Criar Alerta'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowNovoAlerta(false)} className="text-xs border-gray-300">Cancelar</Button>
          </div>
        </div>
      )}

      {/* Tab: Pendentes */}
      {tab === "pendentes" && (
        (alertas || []).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-gray-600 font-medium">Sem alertas pendentes</p>
            <p className="text-gray-400 text-sm mt-1">Clique em "Executar Verificação" para gerar alertas automáticos.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(gruposAlerta).map(([grupo, items]) => (
              <div key={grupo}>
                <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-2">{grupo}</p>
                <div className="space-y-2">
                  {(items || []).map(alerta => (
                    <div key={alerta.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{TIPO_ICONE[alerta.tipo] || "🔔"}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${prioridadeCor[alerta.prioridade] || prioridadeCor.media}`}>
                              {alerta.prioridade?.toUpperCase()}
                            </span>
                            <span className="text-gray-300 text-[10px]">{new Date(alerta.createdAt).toLocaleDateString("pt-PT")}</span>
                          </div>
                          <div className="text-gray-800 text-sm font-medium">{alerta.titulo}</div>
                          {alerta.descricao && <div className="text-gray-500 text-xs mt-0.5">{alerta.descricao}</div>}
                          <div className="flex gap-3 mt-1">
                            {alerta.empresaNome && <span className="text-gray-400 text-xs">⬡ {alerta.empresaNome}</span>}
                            {alerta.leadTitulo && <span className="text-gray-400 text-xs">◎ {alerta.leadTitulo}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" onClick={() => resolver.mutate({ id: alerta.id })} disabled={resolver.isPending}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs h-7">
                            ✓ Resolver
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => ignorar.mutate({ id: alerta.id })} disabled={ignorar.isPending}
                            className="text-gray-400 hover:text-gray-600 text-xs h-7">
                            Ignorar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab: Regras Automáticas */}
      {tab === "regras" && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <strong>Como funciona:</strong> As regras automáticas são verificadas diariamente (ou manualmente com "Executar Verificação"). Quando uma condição é cumprida, um alerta é criado automaticamente na tab Pendentes. Pode activar/desactivar cada regra e ajustar os dias de antecedência.
          </div>
          {Object.entries(gruposRegras).map(([grupo, items]) => (
            <div key={grupo}>
              <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-2">{grupo}</p>
              <div className="space-y-2">
                {(items || []).map(regra => (
                  <div key={regra.id} className={`bg-white rounded-xl border p-4 transition-opacity ${regra.ativo ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-xl mt-0.5">{TIPO_ICONE[regra.tipo] || "🔔"}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-800 text-sm font-medium">{regra.nome}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${prioridadeCor[regra.prioridade]}`}>{regra.prioridade?.toUpperCase()}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">{regra.descricao}</p>
                          {editingRegra === regra.id ? (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-gray-500 text-xs">Dias:</span>
                              <input type="number" value={editDias} onChange={e => setEditDias(e.target.value)}
                                className="w-16 border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-900" />
                              <Button size="sm" onClick={() => { editarRegra.mutate({ id: regra.id, diasAntecedencia: parseInt(editDias) }); setEditingRegra(null); }}
                                className="bg-[#e85d26] text-white text-xs h-6 px-2">Guardar</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingRegra(null)} className="text-gray-400 text-xs h-6">Cancelar</Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 mt-1.5">
                              {regra.diasAntecedencia !== null && regra.diasAntecedencia !== undefined && (
                                <button onClick={() => { setEditingRegra(regra.id); setEditDias(String(regra.diasAntecedencia)); }}
                                  className="text-gray-400 text-xs hover:text-gray-600 underline underline-offset-2">
                                  {regra.diasAntecedencia} dias
                                </button>
                              )}
                              {regra.ultimaExecucao && (
                                <span className="text-gray-300 text-[10px]">Última execução: {new Date(regra.ultimaExecucao).toLocaleDateString("pt-PT")}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRegra.mutate({ id: regra.id, ativo: !regra.ativo })}
                        className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          regra.ativo ? 'bg-[#e85d26]' : 'bg-gray-200'
                        }`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          regra.ativo ? 'translate-x-4' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Histórico */}
      {tab === "historico" && (
        (historico || []).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400">Sem alertas resolvidos ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(historico || []).map(alerta => (
              <div key={alerta.id} className="bg-white rounded-xl border border-gray-200 p-4 opacity-70">
                <div className="flex items-start gap-3">
                  <span className="text-base">{TIPO_ICONE[alerta.tipo] || "🔔"}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-gray-600 text-sm font-medium">{alerta.titulo}</span>
                      <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">✓ Resolvido</span>
                    </div>
                    <div className="flex gap-3">
                      {alerta.empresaNome && <span className="text-gray-400 text-xs">⬡ {alerta.empresaNome}</span>}
                      {alerta.leadTitulo && <span className="text-gray-400 text-xs">◎ {alerta.leadTitulo}</span>}
                      <span className="text-gray-300 text-[10px]">{new Date(alerta.createdAt).toLocaleDateString("pt-PT")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Automações ────────────────────────────────────────────────────────────────
function Automacoes() {
  const [tab, setTab] = useState<"regras" | "historico" | "fila">("regras");
  const [showCriador, setShowCriador] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [histFiltroEstado, setHistFiltroEstado] = useState<string>("todos");
  const [histFiltroAutomacao, setHistFiltroAutomacao] = useState<string>("todas");
  const [histPage, setHistPage] = useState(1);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const { data: statsData } = trpc.crmAutomacoes.stats.useQuery();
  const { data: listaData, refetch } = trpc.crmAutomacoes.list.useQuery();
  const { data: logsData, refetch: refetchLogs } = trpc.crmAutomacoes.logs.useQuery({
    estado: histFiltroEstado !== "todos" ? histFiltroEstado as any : undefined,
    automacaoId: histFiltroAutomacao !== "todas" ? parseInt(histFiltroAutomacao) : undefined,
    page: histPage,
    limit: 25,
  });
  const { data: filaData } = trpc.crmAutomacoes.fila.useQuery();

  const toggleAtiva = trpc.crmAutomacoes.toggleAtiva.useMutation({ onSuccess: () => refetch() });
  const deleteMut = trpc.crmAutomacoes.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Automação eliminada."); }
  });
  const executarManual = trpc.crmAutomacoes.executarManual.useMutation({
    onSuccess: (r) => toast.success(r.acaoExecutada || "Executado com sucesso."),
    onError: (e) => toast.error(e.message),
  });

  const automacoes = listaData?.automacoes || [];
  const logs = logsData?.logs || [];
  const fila = filaData || [];

  const TRIGGER_LABELS: Record<string, string> = {
    lead_criada: "Lead criada",
    lead_fase_alterada: "Lead muda de fase",
    lead_sem_actividade: "Lead sem actividade",
    proposta_enviada: "Proposta enviada",
    proposta_sem_resposta: "Proposta sem resposta",
    cliente_criado: "Novo cliente",
    contrato_a_expirar: "Contrato a expirar",
    newsletter_subscricao: "Subscrição newsletter",
    ebook_download: "Download ebook",
    reuniao_agendada: "Reunião agendada",
    reuniao_sem_followup: "Reunião sem follow-up",
    lead_perdida: "Lead perdida",
    cliente_perdido: "Cliente perdido",
    aniversario_contrato: "Aniversário de contrato",
  };
  const ACAO_LABELS: Record<string, string> = {
    enviar_email: "Enviar email",
    criar_alerta: "Criar alerta",
    criar_actividade: "Criar actividade",
    mover_fase: "Mover fase",
    notificar_responsavel: "Notificar responsável",
    enviar_email_interno: "Email interno",
    criar_reuniao: "Criar reunião",
  };
  const ACAO_CORES: Record<string, string> = {
    enviar_email: "bg-blue-100 text-blue-700",
    criar_alerta: "bg-orange-100 text-orange-700",
    criar_actividade: "bg-purple-100 text-purple-700",
    mover_fase: "bg-teal-100 text-teal-700",
    notificar_responsavel: "bg-red-100 text-red-700",
    enviar_email_interno: "bg-indigo-100 text-indigo-700",
    criar_reuniao: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 text-sm font-semibold">⚡ Automações</h1>
          <p className="text-gray-400 text-xs mt-0.5">Regras automáticas para reduzir intervenção humana</p>
        </div>
        <button
          onClick={() => { setEditId(null); setShowCriador(true); }}
          className="px-4 py-2 bg-[#e85d26] text-white text-xs font-medium rounded-lg hover:bg-[#d44e1f] transition-colors"
        >
          + Nova Automação
        </button>
      </div>

      {/* KPIs */}
      {statsData && (
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Activas", value: statsData.totalAtivas, cor: "text-green-700", bg: "bg-green-50 border-green-200" },
            { label: "Inactivas", value: statsData.totalInativas, cor: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
            { label: "Execuções OK", value: statsData.execucoesSucesso, cor: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
            { label: "Erros", value: statsData.execucoesErro, cor: "text-red-700", bg: "bg-red-50 border-red-200" },
            { label: "Pendentes", value: statsData.pendentes, cor: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          ].map(k => (
            <div key={k.label} className={`rounded-xl border p-3 ${k.bg}`}>
              <div className={`text-xl font-bold ${k.cor}`}>{k.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["regras", "historico", "fila"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t ? "border-[#e85d26] text-[#e85d26]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t === "regras" ? `Regras (${automacoes.length})` : t === "historico" ? `Histórico (${logs.length})` : `Fila (${fila.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Regras */}
      {tab === "regras" && (
        <div className="space-y-2">
          {automacoes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">⚡</div>
              <div className="text-sm font-medium">Nenhuma automação criada</div>
              <div className="text-xs mt-1">Clique em "+ Nova Automação" para começar</div>
            </div>
          ) : automacoes.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 transition-all">
              {/* Toggle activa */}
              <button
                onClick={() => toggleAtiva.mutate({ id: a.id, ativa: !a.ativa })}
                className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 relative ${
                  a.ativa ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  a.ativa ? "left-5" : "left-1"
                }`} />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-900 text-xs font-semibold">{a.nome}</span>
                  {!a.ativa && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Inactiva</span>}
                </div>
                {a.descricao && <div className="text-gray-400 text-[10px] mb-1.5 truncate">{a.descricao}</div>}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    ⚡ {TRIGGER_LABELS[a.triggerTipo] || a.triggerTipo}
                  </span>
                  {a.delayHoras > 0 && (
                    <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                      ⏰ +{a.delayHoras}h
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${ACAO_CORES[a.acaoTipo] || "bg-gray-100 text-gray-600"}`}>
                    → {ACAO_LABELS[a.acaoTipo] || a.acaoTipo}
                  </span>
                  <span className="text-[10px] text-gray-400">{a.totalExecucoes} execuções</span>
                  {a.ultimaExecucao && (
                    <span className="text-[10px] text-gray-400">última: {new Date(a.ultimaExecucao).toLocaleDateString("pt-PT")}</span>
                  )}
                </div>
              </div>

              {/* Acções */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => { setEditId(a.id); setShowCriador(true); }}
                  className="px-2.5 py-1.5 text-[10px] text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >Editar</button>
                <button
                  onClick={() => {
                    if (confirm(`Eliminar automação "${a.nome}"?`)) deleteMut.mutate({ id: a.id });
                  }}
                  className="px-2.5 py-1.5 text-[10px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Histórico */}
      {tab === "historico" && (() => {
        const histLogs = logsData?.logs || [];
        const total = logsData?.total || 0;
        const totalPages = Math.ceil(total / 25) || 1;
        const countSucesso = histLogs.filter(l => l.log.estado === "sucesso").length;
        const countErro = histLogs.filter(l => l.log.estado === "erro").length;
        const countPendente = histLogs.filter(l => l.log.estado === "pendente").length;
        return (
          <div className="space-y-3">
            {/* Contadores de estado */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total", count: total, color: "bg-gray-50 border-gray-200 text-gray-700", dot: "bg-gray-400" },
                { label: "Sucesso", count: countSucesso, color: "bg-green-50 border-green-200 text-green-700", dot: "bg-green-500" },
                { label: "Erro", count: countErro, color: "bg-red-50 border-red-200 text-red-700", dot: "bg-red-500" },
                { label: "Pendente", count: countPendente, color: "bg-yellow-50 border-yellow-200 text-yellow-700", dot: "bg-yellow-500" },
              ].map(c => (
                <div key={c.label} className={`border rounded-xl p-3 flex items-center gap-2 ${c.color}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                  <div>
                    <div className="text-xs font-bold">{c.count}</div>
                    <div className="text-[10px] opacity-70">{c.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500">Estado:</span>
                {["todos", "sucesso", "erro", "pendente", "ignorado"].map(e => (
                  <button key={e} onClick={() => { setHistFiltroEstado(e); setHistPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                      histFiltroEstado === e
                        ? e === "sucesso" ? "bg-green-100 text-green-700" : e === "erro" ? "bg-red-100 text-red-700" : e === "pendente" ? "bg-yellow-100 text-yellow-700" : "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}>{e === "todos" ? "Todos" : e.charAt(0).toUpperCase() + e.slice(1)}</button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[10px] text-gray-500">Automação:</span>
                <select value={histFiltroAutomacao} onChange={e => { setHistFiltroAutomacao(e.target.value); setHistPage(1); }}
                  className="text-[10px] border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white">
                  <option value="todas">Todas</option>
                  {automacoes.map(a => <option key={a.id} value={String(a.id)}>{a.nome}</option>)}
                </select>
                <button onClick={() => refetchLogs()} className="px-2.5 py-1 text-[10px] text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">↻ Actualizar</button>
              </div>
            </div>

            {/* Tabela */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-3 py-2.5 text-[10px] text-gray-500 font-medium w-6"></th>
                    <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Automação</th>
                    <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Entidade</th>
                    <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Estado</th>
                    <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Resultado</th>
                    <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Data / Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {histLogs.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-xs">
                      {histFiltroEstado !== "todos" || histFiltroAutomacao !== "todas"
                        ? "Nenhuma execução encontrada com os filtros seleccionados."
                        : "Ainda não existem execuções registadas. As automações irão aparecer aqui quando forem disparadas."}
                    </td></tr>
                  ) : histLogs.map(({ log, automacaoNome }) => (
                    <>
                      <tr key={log.id}
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className={`cursor-pointer transition-colors ${
                          log.estado === "erro" ? "hover:bg-red-50" : "hover:bg-gray-50"
                        } ${expandedLog === log.id ? (log.estado === "erro" ? "bg-red-50" : "bg-gray-50") : ""}` }>
                        <td className="px-3 py-2.5 text-gray-400 text-[10px]">
                          {expandedLog === log.id ? "▼" : "▶"}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{automacaoNome || `#${log.automacaoId}`}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-[10px]">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{log.triggerEntidade}</span>
                          {" "}{log.triggerEntidadeNome || `#${log.triggerEntidadeId}`}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            log.estado === "sucesso" ? "bg-green-100 text-green-700" :
                            log.estado === "erro" ? "bg-red-100 text-red-700" :
                            log.estado === "pendente" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              log.estado === "sucesso" ? "bg-green-500" :
                              log.estado === "erro" ? "bg-red-500" :
                              log.estado === "pendente" ? "bg-yellow-500" : "bg-gray-400"
                            }`} />
                            {log.estado}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 max-w-xs">
                          {log.estado === "erro"
                            ? <span className="text-red-600 truncate block max-w-[200px]">{log.erro || "Erro desconhecido"}</span>
                            : <span className="truncate block max-w-[200px]">{log.acaoExecutada || "—"}</span>
                          }
                        </td>
                        <td className="px-4 py-2.5 text-gray-400 text-[10px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString("pt-PT")}
                          {" "}
                          <span className="text-gray-300">{new Date(log.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr key={`${log.id}-detail`} className={log.estado === "erro" ? "bg-red-50" : "bg-gray-50"}>
                          <td colSpan={6} className="px-8 py-3">
                            <div className="space-y-2">
                              {log.estado === "erro" && log.erro && (
                                <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                                  <div className="text-[10px] font-semibold text-red-700 uppercase tracking-wide mb-1">Mensagem de Erro</div>
                                  <pre className="text-xs text-red-800 whitespace-pre-wrap font-mono">{log.erro}</pre>
                                </div>
                              )}
                              {log.acaoExecutada && (
                                <div className="bg-white border border-gray-200 rounded-lg p-3">
                                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Acção Executada</div>
                                  <p className="text-xs text-gray-700">{log.acaoExecutada}</p>
                                </div>
                              )}
                              <div className="flex gap-4 text-[10px] text-gray-400">
                                <span>ID: #{log.id}</span>
                                <span>Automação: #{log.automacaoId}</span>
                                <span>Entidade: {log.triggerEntidade} #{log.triggerEntidadeId}</span>
                                <span>Data completa: {new Date(log.createdAt).toLocaleString("pt-PT")}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Página {histPage} de {totalPages} ({total} execuções)</span>
                <div className="flex gap-1">
                  <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={histPage === 1}
                    className="px-3 py-1.5 text-[10px] border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">← Anterior</button>
                  <button onClick={() => setHistPage(p => Math.min(totalPages, p + 1))} disabled={histPage === totalPages}
                    className="px-3 py-1.5 text-[10px] border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Seguinte →</button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Tab: Fila */}
      {tab === "fila" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Automação</th>
                <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Entidade</th>
                <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Agendado Para</th>
                <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fila.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-xs">Sem automações pendentes.</td></tr>
              ) : fila.map(({ item, automacaoNome }) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{automacaoNome || `#${item.automacaoId}`}</td>
                  <td className="px-4 py-2.5 text-gray-500">{item.triggerEntidadeNome || `${item.triggerEntidade} #${item.triggerEntidadeId}`}</td>
                  <td className="px-4 py-2.5 text-gray-600">{new Date(item.agendadoPara).toLocaleString("pt-PT")}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700">{item.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Criador / Editor de Automação */}
      {showCriador && (
        <AutomacaoCriador
          editId={editId}
          onClose={() => { setShowCriador(false); setEditId(null); }}
          onSaved={() => { setShowCriador(false); setEditId(null); refetch(); }}
        />
      )}
    </div>
  );
}

// ─── Criador / Editor de Automação ──────────────────────────────────────────
function AutomacaoCriador({ editId, onClose, onSaved }: { editId: number | null; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [triggerTipo, setTriggerTipo] = useState("lead_criada");
  const [delayHoras, setDelayHoras] = useState(0);
  const [acaoTipo, setAcaoTipo] = useState("criar_alerta");
  const [emailAssunto, setEmailAssunto] = useState("");
  const [emailCorpo, setEmailCorpo] = useState("");
  const [acaoTitulo, setAcaoTitulo] = useState("");
  const [acaoDescricao, setAcaoDescricao] = useState("");
  const [novaFase, setNovaFase] = useState("em_tratamento");
  const [prioridade, setPrioridade] = useState("media");
  const [diasPrazo, setDiasPrazo] = useState(2);
  const [ativa, setAtiva] = useState(true);
  const [simulacaoResultado, setSimulacaoResultado] = useState<any>(null);
  const [showSimulacao, setShowSimulacao] = useState(false);

  const { data: automacaoData } = trpc.crmAutomacoes.get.useQuery(
    { id: editId! },
    { enabled: !!editId }
  );

  // Preencher form ao editar
  useState(() => {
    if (automacaoData) {
      setNome(automacaoData.nome);
      setDescricao(automacaoData.descricao || "");
      setTriggerTipo(automacaoData.triggerTipo);
      setDelayHoras(automacaoData.delayHoras);
      setAcaoTipo(automacaoData.acaoTipo);
      setEmailAssunto(automacaoData.emailAssunto || "");
      setEmailCorpo(automacaoData.emailCorpo || "");
      setAtiva(automacaoData.ativa);
      const cfg = (automacaoData.acaoConfig as any) || {};
      setAcaoTitulo(cfg.titulo || "");
      setAcaoDescricao(cfg.descricao || "");
      setNovaFase(cfg.novaFase || "em_tratamento");
      setPrioridade(cfg.prioridade || "media");
      setDiasPrazo(cfg.diasPrazo || 2);
    }
  });

  const createMut = trpc.crmAutomacoes.create.useMutation({ onSuccess: onSaved, onError: e => toast.error(e.message) });
  const updateMut = trpc.crmAutomacoes.update.useMutation({ onSuccess: onSaved, onError: e => toast.error(e.message) });
  const simularMut = trpc.crmAutomacoes.simular.useMutation({
    onSuccess: (r) => { setSimulacaoResultado(r); setShowSimulacao(true); },
    onError: (e) => toast.error(e.message),
  });

  const handleTestar = () => {
    if (!nome.trim()) { toast.error("Preencha pelo menos o nome antes de testar."); return; }
    simularMut.mutate({
      nome,
      triggerTipo: triggerTipo as any,
      delayHoras,
      acaoTipo: acaoTipo as any,
      acaoConfig: buildAcaoConfig(),
      emailAssunto: emailAssunto || undefined,
      emailCorpo: emailCorpo || undefined,
    });
  };

  const buildAcaoConfig = () => {
    const base: Record<string, any> = { titulo: acaoTitulo, descricao: acaoDescricao };
    if (acaoTipo === "mover_fase") base.novaFase = novaFase;
    if (acaoTipo === "criar_alerta" || acaoTipo === "notificar_responsavel") base.prioridade = prioridade;
    if (acaoTipo === "criar_actividade" || acaoTipo === "criar_reuniao") base.diasPrazo = diasPrazo;
    return base;
  };

  const handleSave = () => {
    if (!nome.trim()) { toast.error("Nome obrigatório."); return; }
    const payload = {
      nome, descricao, ativa,
      triggerTipo: triggerTipo as any,
      delayHoras,
      acaoTipo: acaoTipo as any,
      acaoConfig: buildAcaoConfig(),
      emailAssunto: emailAssunto || undefined,
      emailCorpo: emailCorpo || undefined,
    };
    if (editId) updateMut.mutate({ id: editId, ...payload });
    else createMut.mutate(payload);
  };

  const TRIGGERS = [
    { value: "lead_criada", label: "Lead criada", group: "Leads" },
    { value: "lead_fase_alterada", label: "Lead muda de fase", group: "Leads" },
    { value: "lead_sem_actividade", label: "Lead sem actividade (N dias)", group: "Leads" },
    { value: "lead_perdida", label: "Lead perdida", group: "Leads" },
    { value: "proposta_enviada", label: "Proposta enviada", group: "Propostas" },
    { value: "proposta_sem_resposta", label: "Proposta sem resposta (N dias)", group: "Propostas" },
    { value: "cliente_criado", label: "Novo cliente criado", group: "Clientes" },
    { value: "cliente_perdido", label: "Cliente perdido", group: "Clientes" },
    { value: "contrato_a_expirar", label: "Contrato a expirar (N dias)", group: "Clientes" },
    { value: "aniversario_contrato", label: "Aniversário de contrato", group: "Clientes" },
    { value: "reuniao_agendada", label: "Reunião agendada", group: "Reuniões" },
    { value: "reuniao_sem_followup", label: "Reunião sem follow-up (N dias)", group: "Reuniões" },
    { value: "newsletter_subscricao", label: "Subscrição de newsletter", group: "Marketing" },
    { value: "ebook_download", label: "Download de ebook/recurso", group: "Marketing" },
  ];

  const ACOES = [
    { value: "criar_alerta", label: "Criar alerta interno", icon: "◉" },
    { value: "criar_actividade", label: "Criar actividade/tarefa", icon: "✓" },
    { value: "notificar_responsavel", label: "Notificar responsável", icon: "⚡" },
    { value: "enviar_email", label: "Enviar email ao contacto", icon: "✉" },
    { value: "enviar_email_interno", label: "Email interno (equipa)", icon: "✉" },
    { value: "mover_fase", label: "Mover lead de fase", icon: "→" },
    { value: "criar_reuniao", label: "Agendar reunião de follow-up", icon: "◇" },
  ];

  const VARIAVEIS = [
    "{{nome_empresa}}", "{{data_hoje}}", "{{hora_hoje}}", "{{responsavel}}",
    "{{fase}}", "{{mensalidade}}", "{{data_renovacao}}",
  ];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-gray-900 font-semibold text-sm">{editId ? "Editar Automação" : "Nova Automação"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Nome e descrição */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-medium text-gray-600 uppercase tracking-wide block mb-1">Nome da Automação *</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Ex: Follow-up 5 dias após proposta"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#e85d26]" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-600 uppercase tracking-wide block mb-1">Descrição</label>
              <input value={descricao} onChange={e => setDescricao(e.target.value)}
                placeholder="Descrição opcional..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#e85d26]" />
            </div>
          </div>

          {/* Trigger */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-3">⚡ Quando acontece (Trigger)</div>
            <select value={triggerTipo} onChange={e => setTriggerTipo(e.target.value)}
              className="w-full border border-blue-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
              {["Leads", "Propostas", "Clientes", "Reuniões", "Marketing"].map(group => (
                <optgroup key={group} label={group}>
                  {TRIGGERS.filter(t => t.group === group).map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="mt-3">
              <label className="text-[10px] text-blue-600 block mb-1">Delay antes de executar (horas, 0 = imediato)</label>
              <input type="number" min={0} max={720} value={delayHoras} onChange={e => setDelayHoras(Number(e.target.value))}
                className="w-32 border border-blue-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none" />
              {delayHoras > 0 && <span className="text-[10px] text-blue-500 ml-2">Executa {delayHoras}h após o trigger</span>}
            </div>
          </div>

          {/* Acção */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-[10px] font-semibold text-green-700 uppercase tracking-wide mb-3">→ O que fazer (Acção)</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {ACOES.map(a => (
                <button key={a.value} onClick={() => setAcaoTipo(a.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                    acaoTipo === a.value
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                  }`}>
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>

            {/* Configuração da acção */}
            <div className="space-y-3 mt-2">
              {(acaoTipo !== "mover_fase") && (
                <div>
                  <label className="text-[10px] text-green-700 block mb-1">Título da acção</label>
                  <input value={acaoTitulo} onChange={e => setAcaoTitulo(e.target.value)}
                    placeholder="Ex: Follow-up pendente — {{nome_empresa}}"
                    className="w-full border border-green-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none" />
                </div>
              )}
              {(acaoTipo === "criar_actividade" || acaoTipo === "criar_reuniao") && (
                <div>
                  <label className="text-[10px] text-green-700 block mb-1">Prazo (dias a partir de hoje)</label>
                  <input type="number" min={1} max={90} value={diasPrazo} onChange={e => setDiasPrazo(Number(e.target.value))}
                    className="w-24 border border-green-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none" />
                </div>
              )}
              {(acaoTipo === "criar_alerta" || acaoTipo === "notificar_responsavel") && (
                <div>
                  <label className="text-[10px] text-green-700 block mb-1">Prioridade</label>
                  <select value={prioridade} onChange={e => setPrioridade(e.target.value)}
                    className="w-full border border-green-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              )}
              {acaoTipo === "mover_fase" && (
                <div>
                  <label className="text-[10px] text-green-700 block mb-1">Nova fase da lead</label>
                  <select value={novaFase} onChange={e => setNovaFase(e.target.value)}
                    className="w-full border border-green-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none">
                    <option value="leads">LEADs</option>
                    <option value="em_tratamento">Em Tratamento</option>
                    <option value="reuniao_agendada">Reunião Agendada</option>
                    <option value="proposta_enviada">Proposta Enviada</option>
                    <option value="proposta_adjudicada">Proposta Adjudicada</option>
                    <option value="won">Won</option>
                    <option value="renovacoes_pendente">Renovações Pendentes</option>
                  </select>
                </div>
              )}
              {(acaoTipo === "enviar_email" || acaoTipo === "enviar_email_interno") && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-green-700 block mb-1">Assunto do email</label>
                    <input value={emailAssunto} onChange={e => setEmailAssunto(e.target.value)}
                      placeholder="Ex: Seguimento da nossa proposta — {{nome_empresa}}"
                      className="w-full border border-green-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-green-700 block mb-1">Corpo do email</label>
                    <textarea value={emailCorpo} onChange={e => setEmailCorpo(e.target.value)}
                      rows={5} placeholder="Olá {{nome_empresa}},\n\nEstávamos a acompanhar..."
                      className="w-full border border-green-300 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none resize-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variáveis disponíveis */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="text-[10px] font-medium text-gray-500 mb-2">Variáveis disponíveis nos textos:</div>
            <div className="flex flex-wrap gap-1.5">
              {VARIAVEIS.map(v => (
                <code key={v} className="text-[10px] bg-white border border-gray-300 text-gray-600 px-2 py-0.5 rounded font-mono">{v}</code>
              ))}
            </div>
          </div>

          {/* Activa */}
          <div className="flex items-center gap-3">
            <button onClick={() => setAtiva(!ativa)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                ativa ? "bg-green-500" : "bg-gray-300"
              }`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                ativa ? "left-5" : "left-1"
              }`} />
            </button>
            <span className="text-xs text-gray-600">{ativa ? "Automação activa" : "Automação inactiva"}</span>
          </div>
        </div>

        {/* Painel de resultado da simulação */}
        {showSimulacao && simulacaoResultado && (
          <div className="mx-6 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 text-sm">✅</span>
                <span className="text-emerald-800 text-xs font-semibold">Simulação concluída — nenhum dado foi alterado</span>
              </div>
              <button onClick={() => setShowSimulacao(false)} className="text-emerald-400 hover:text-emerald-700 text-sm">×</button>
            </div>
            <div className="space-y-2">
              <div className="flex gap-4 text-[10px] text-emerald-700">
                <span>⚡ Trigger: <strong>{simulacaoResultado.triggerTipo}</strong></span>
                <span>→ Acção: <strong>{simulacaoResultado.acaoTipo}</strong></span>
                {simulacaoResultado.delayHoras > 0 && <span>⏰ Delay: <strong>+{simulacaoResultado.delayHoras}h</strong></span>}
                <span>🏢 Entidade: <strong>{simulacaoResultado.entidadeNome}</strong></span>
              </div>
              <div className="bg-white border border-emerald-200 rounded-lg p-3">
                <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide mb-2">Pré-visualização da acção:</div>
                {Object.entries(simulacaoResultado.preview || {}).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-xs mb-1">
                    <span className="text-gray-400 capitalize min-w-[80px]">{k}:</span>
                    <span className="text-gray-800 font-medium whitespace-pre-wrap">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleTestar}
            disabled={simularMut.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
          >
            {simularMut.isPending ? (
              <><span className="animate-spin inline-block">&#9696;</span> A simular...</>
            ) : (
              <>▶ Testar Automação</>
            )}
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs text-gray-500 hover:text-gray-800 transition-colors">Cancelar</button>
            <button onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
              className="px-5 py-2 bg-[#e85d26] text-white text-xs font-medium rounded-lg hover:bg-[#d44e1f] disabled:opacity-50 transition-colors">
              {createMut.isPending || updateMut.isPending ? "A guardar..." : editId ? "Guardar alterações" : "Criar Automação"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Qualidade de Dados ─────────────────────────────────────────────────────
function QualidadeDados({ onLeadClick, onEmpresaClick, onNavigate }: {
  onLeadClick: (id: number) => void;
  onEmpresaClick: (id: number) => void;
  onNavigate: (section: string) => void;
}) {
  const [vista, setVista] = useState<"resumo" | "leads" | "empresas">("resumo");
  const [campoFiltro, setCampoFiltro] = useState<string | null>(null);
  const [entidadeFiltro, setEntidadeFiltro] = useState<"lead" | "empresa">("lead");
  const [page, setPage] = useState(1);

  // Edição inline: { id, campo, valor }
  const [editCell, setEditCell] = useState<{ id: number; campo: string; valor: string } | null>(null);

  const utils = trpc.useUtils();
  const updateLead = trpc.crm.leads.update.useMutation({
    onSuccess: () => {
      utils.crmQualidade.leadsParaQualificar.invalidate();
      utils.crmQualidade.leadsComCampoEmFalta.invalidate();
      utils.crmQualidade.resumo.invalidate();
      setEditCell(null);
    },
  });
  const updateEmpresa = trpc.crm.empresas.update.useMutation({
    onSuccess: () => {
      utils.crmQualidade.empresasParaQualificar.invalidate();
      utils.crmQualidade.empresasComCampoEmFalta.invalidate();
      utils.crmQualidade.resumo.invalidate();
      setEditCell(null);
    },
  });

  // Mapeamento campo → label e tipo de input
  const CAMPOS_LEAD: Record<string, { label: string; tipo: "text" | "number" | "date" }> = {
    mensalidade: { label: "Mensalidade (€)", tipo: "number" },
    dataRenovacao: { label: "Data de Renovação", tipo: "date" },
    notas: { label: "Notas", tipo: "text" },
  };
  const CAMPOS_EMPRESA: Record<string, { label: string; tipo: "text" | "number" | "date" }> = {
    telefone: { label: "Telefone", tipo: "text" },
    email: { label: "Email", tipo: "text" },
    numColaboradores: { label: "Nº Colaboradores", tipo: "number" },
    sector: { label: "Sector", tipo: "text" },
    nif: { label: "NIF", tipo: "text" },
    cidade: { label: "Cidade", tipo: "text" },
    website: { label: "Website", tipo: "text" },
  };

  function handleSaveLead(id: number, campo: string, valor: string) {
    const payload: any = { id };
    if (campo === "mensalidade") payload.mensalidade = valor ? Number(valor) : null;
    else if (campo === "dataRenovacao") payload.dataRenovacao = valor || null;
    else payload[campo] = valor || null;
    updateLead.mutate(payload);
  }

  function handleSaveEmpresa(id: number, campo: string, valor: string) {
    const payload: any = { id };
    if (campo === "numColaboradores") payload.numColaboradores = valor ? Number(valor) : null;
    else payload[campo] = valor || null;
    updateEmpresa.mutate(payload);
  }

  // Preenchimento com IA
  const [iaLoading, setIaLoading] = useState<number | null>(null); // empresaId a carregar
  const [iaSugestoes, setIaSugestoes] = useState<{ empresaId: number; nome: string; dados: Record<string, any> } | null>(null);
  const [iaAceites, setIaAceites] = useState<Record<string, boolean>>({});

  const preencherIA = trpc.crmQualidade.preencherComIA.useMutation({
    onSuccess: (res, vars) => {
      setIaLoading(null);
      if (res.sucesso && res.total > 0) {
        // Inicializar todos os campos como aceites
        const aceites: Record<string, boolean> = {};
        Object.keys(res.dados).forEach(k => { aceites[k] = true; });
        setIaAceites(aceites);
        setIaSugestoes({ empresaId: vars.empresaId, nome: vars.nomeEmpresa, dados: res.dados });
      } else {
        alert(res.total === 0 ? `A IA não encontrou informações para "${vars.nomeEmpresa}".` : `Erro: ${(res as any).erro}`);
      }
    },
    onError: () => setIaLoading(null),
  });

  function confirmarSugestoes() {
    if (!iaSugestoes) return;
    const payload: any = { id: iaSugestoes.empresaId };
    Object.entries(iaSugestoes.dados).forEach(([k, v]) => {
      if (iaAceites[k]) payload[k] = v;
    });
    updateEmpresa.mutate(payload, {
      onSuccess: () => {
        setIaSugestoes(null);
        setIaAceites({});
      },
    });
  }

  const LABELS_CAMPOS: Record<string, string> = {
    telefone: "Telefone", email: "Email", website: "Website",
    sector: "Sector", numColaboradores: "Nº Colaboradores", nif: "NIF", cidade: "Cidade",
  };

  // Célula editável inline
  function EditableCell({ id, campo, valorActual, onSave, tipo }: {
    id: number; campo: string; valorActual: string; onSave: (id: number, campo: string, valor: string) => void; tipo: "text" | "number" | "date";
  }) {
    const isEditing = editCell?.id === id && editCell?.campo === campo;
    const [val, setVal] = useState(valorActual);

    if (isEditing) {
      return (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <input
            autoFocus
            type={tipo}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") { onSave(id, campo, val); }
              if (e.key === "Escape") { setEditCell(null); }
            }}
            className="border border-[#e85d26] rounded px-1.5 py-0.5 text-[10px] text-gray-800 bg-white w-28 focus:outline-none focus:ring-1 focus:ring-[#e85d26]"
          />
          <button onClick={() => onSave(id, campo, val)}
            className="text-[10px] text-green-600 hover:text-green-800 font-bold">✓</button>
          <button onClick={() => setEditCell(null)}
            className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>
      );
    }
    return (
      <button
        onClick={e => { e.stopPropagation(); setEditCell({ id, campo, valor: valorActual }); setVal(valorActual); }}
        className="group flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-800 transition-colors">
        <span className={valorActual ? "text-gray-700" : "text-red-400 italic"}>{valorActual || "— clique para preencher"}</span>
        <span className="opacity-0 group-hover:opacity-100 text-gray-400 text-[9px]">✎</span>
      </button>
    );
  }

  const { data: resumo, isLoading } = trpc.crmQualidade.resumo.useQuery();
  const { data: leadsParaQualificar } = trpc.crmQualidade.leadsParaQualificar.useQuery(
    { scoreMax: 70, page, limit: 50 },
    { enabled: vista === "leads" && campoFiltro === null }
  );
  const { data: empresasParaQualificar } = trpc.crmQualidade.empresasParaQualificar.useQuery(
    { scoreMax: 70, page, limit: 50 },
    { enabled: vista === "empresas" && campoFiltro === null }
  );
  const { data: leadsComCampo } = trpc.crmQualidade.leadsComCampoEmFalta.useQuery(
    { campo: campoFiltro || "", page, limit: 50 },
    { enabled: vista === "leads" && campoFiltro !== null }
  );
  const { data: empresasComCampo } = trpc.crmQualidade.empresasComCampoEmFalta.useQuery(
    { campo: campoFiltro || "", page, limit: 50 },
    { enabled: vista === "empresas" && campoFiltro !== null }
  );

  function scoreColor(score: number) {
    if (score >= 80) return "text-green-700 bg-green-50";
    if (score >= 50) return "text-yellow-700 bg-yellow-50";
    return "text-red-700 bg-red-50";
  }
  function scoreBar(score: number) {
    const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-400" : "bg-red-500";
    return (
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-center text-gray-400 text-sm">A analisar base de dados...</div>;

  const leads = resumo?.leads;
  const empresas = resumo?.empresas;
  const contactos = resumo?.contactos;

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 text-base font-semibold">Qualidade de Dados</h1>
          <p className="text-gray-500 text-xs mt-0.5">Checkup completo da base de dados — identifica campos em falta para qualificação</p>
        </div>
        <div className="flex gap-2">
          {["resumo", "leads", "empresas"].map(v => (
            <button key={v} onClick={() => { setVista(v as any); setCampoFiltro(null); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                vista === v ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {v === "resumo" ? "Resumo" : v === "leads" ? "Leads" : "Clientes"}
            </button>
          ))}
        </div>
      </div>

      {/* Vista: Resumo */}
      {vista === "resumo" && resumo && (
        <div className="space-y-5">
          {/* Cards de score global */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Leads Activas", total: leads?.total || 0, score: leads?.scoreMedia || 0, criticas: leads?.criticas || 0, icon: "◎", onClick: () => { setVista("leads"); setCampoFiltro(null); } },
              { label: "Clientes Activos", total: empresas?.total || 0, score: empresas?.scoreMedia || 0, criticas: empresas?.criticas || 0, icon: "⬡", onClick: () => { setVista("empresas"); setCampoFiltro(null); } },
              { label: "Contactos", total: contactos?.total || 0, score: contactos?.scoreMedia || 0, criticas: 0, icon: "◎", onClick: () => {} },
            ].map(c => (
              <div key={c.label} onClick={c.onClick}
                className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">{c.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(c.score)}`}>{c.score}%</span>
                </div>
                {scoreBar(c.score)}
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{c.total}</div>
                    <div className="text-[10px] text-gray-400">registos</div>
                  </div>
                  {c.criticas > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-semibold text-red-600">{c.criticas}</div>
                      <div className="text-[10px] text-red-400">críticos</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Checkup de Leads */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700">Campos em Falta — Leads</h3>
              <button onClick={() => { setVista("leads"); setCampoFiltro(null); }}
                className="text-[10px] text-[#e85d26] hover:underline">Ver todas →</button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-medium">Campo</th>
                  <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-medium">Em falta</th>
                  <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-medium">% do total</th>
                  <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-medium">Impacto</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(leads?.campos || []).map(c => (
                  <tr key={c.campo} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-800">{c.label}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-bold ${ c.semCampo === 0 ? "text-green-600" : c.semCampo > c.total * 0.5 ? "text-red-600" : "text-yellow-600" }`}>
                        {c.semCampo}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ c.percentagem === 0 ? "bg-green-500" : c.percentagem > 50 ? "bg-red-500" : "bg-yellow-400" }`}
                            style={{ width: `${c.percentagem}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500">{c.percentagem}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ c.peso >= 3 ? "bg-red-100 text-red-700" : c.peso === 2 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500" }`}>
                        {c.peso >= 3 ? "Alto" : c.peso === 2 ? "Médio" : "Baixo"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {c.semCampo > 0 && (
                        <button onClick={() => { setVista("leads"); setEntidadeFiltro("lead"); setCampoFiltro(c.campo); setPage(1); }}
                          className="text-[10px] text-[#e85d26] hover:underline whitespace-nowrap">Ver {c.semCampo} →</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Checkup de Clientes */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700">Campos em Falta — Clientes</h3>
              <button onClick={() => { setVista("empresas"); setCampoFiltro(null); }}
                className="text-[10px] text-[#e85d26] hover:underline">Ver todos →</button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-medium">Campo</th>
                  <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-medium">Em falta</th>
                  <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-medium">% do total</th>
                  <th className="text-left px-4 py-2 text-[10px] text-gray-500 font-medium">Impacto</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(empresas?.campos || []).map(c => (
                  <tr key={c.campo} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-800">{c.label}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-bold ${ c.semCampo === 0 ? "text-green-600" : c.semCampo > c.total * 0.5 ? "text-red-600" : "text-yellow-600" }`}>
                        {c.semCampo}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ c.percentagem === 0 ? "bg-green-500" : c.percentagem > 50 ? "bg-red-500" : "bg-yellow-400" }`}
                            style={{ width: `${c.percentagem}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500">{c.percentagem}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ c.peso >= 3 ? "bg-red-100 text-red-700" : c.peso === 2 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500" }`}>
                        {c.peso >= 3 ? "Alto" : c.peso === 2 ? "Médio" : "Baixo"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {c.semCampo > 0 && (
                        <button onClick={() => { setVista("empresas"); setEntidadeFiltro("empresa"); setCampoFiltro(c.campo); setPage(1); }}
                          className="text-[10px] text-[#e85d26] hover:underline whitespace-nowrap">Ver {c.semCampo} →</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista: Leads a qualificar */}
      {vista === "leads" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button onClick={() => { setVista("resumo"); setCampoFiltro(null); }}
              className="text-xs text-gray-500 hover:text-gray-800">← Resumo</button>
            <h2 className="text-sm font-semibold text-gray-800">
              {campoFiltro
                ? `Leads sem "${leads?.campos.find(c => c.campo === campoFiltro)?.label || campoFiltro}"`
                : "Leads a Qualificar (score ≤ 70%)"}
            </h2>
            {campoFiltro && (
              <button onClick={() => setCampoFiltro(null)} className="text-[10px] text-gray-400 hover:text-gray-600">✕ limpar filtro</button>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Lead</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Fase</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Score</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Campos em Falta</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {((campoFiltro ? leadsComCampo?.leads : leadsParaQualificar?.leads) || []).map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800 cursor-pointer" onClick={() => onLeadClick(l.id)}>{l.titulo || `Lead #${l.id}`}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{l.fase}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {scoreBar(l.score)}
                        <span className={`text-[10px] font-bold ${scoreColor(l.score).split(" ")[0]}`}>{l.score}%</span>
                      </div>
                    </td>
                    {/* Células editáveis para campos em falta */}
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-1.5">
                        {(l.camposFaltando || []).map((campo: string) => {
                          const def = CAMPOS_LEAD[campo];
                          if (!def) return (
                            <span key={campo} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">{campo}</span>
                          );
                          return (
                            <div key={campo} className="flex items-center gap-1.5">
                              <span className="text-[9px] text-gray-400 w-20 shrink-0">{def.label}:</span>
                              <EditableCell id={l.id} campo={campo} valorActual={l[campo] ? String(l[campo]) : ""} onSave={handleSaveLead} tipo={def.tipo} />
                            </div>
                          );
                        })}
                        {(l.camposFaltando || []).length === 0 && (
                          <span className="text-[10px] text-green-600">✓ Completo</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-[10px]">{l.responsavelNome || "—"}</td>
                  </tr>
                ))}
                {((campoFiltro ? leadsComCampo?.leads : leadsParaQualificar?.leads) || []).length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-xs">
                    {campoFiltro ? "Nenhuma lead com este campo em falta." : "Todas as leads têm score acima de 70% — boa qualidade de dados!"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {(campoFiltro ? leadsComCampo?.total : leadsParaQualificar?.total) || 0} leads encontradas
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-[10px] border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Anterior</button>
              <button onClick={() => setPage(p => p + 1)}
                disabled={(campoFiltro ? (leadsComCampo?.leads || []).length : (leadsParaQualificar?.leads || []).length) < 50}
                className="px-3 py-1.5 text-[10px] border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Seguinte →</button>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Clientes a qualificar */}
      {vista === "empresas" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button onClick={() => { setVista("resumo"); setCampoFiltro(null); }}
              className="text-xs text-gray-500 hover:text-gray-800">← Resumo</button>
            <h2 className="text-sm font-semibold text-gray-800">
              {campoFiltro
                ? `Clientes sem "${empresas?.campos.find(c => c.campo === campoFiltro)?.label || campoFiltro}"`
                : "Clientes a Qualificar (score ≤ 70%)"}
            </h2>
            {campoFiltro && (
              <button onClick={() => setCampoFiltro(null)} className="text-[10px] text-gray-400 hover:text-gray-600">✕ limpar filtro</button>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Cliente</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Sector</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Score</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Campos em Falta</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">Responsável</th>
                  <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 font-medium">IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {((campoFiltro ? empresasComCampo?.empresas : empresasParaQualificar?.empresas) || []).map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800 cursor-pointer" onClick={() => onEmpresaClick(e.id)}>{e.nome}</td>
                    <td className="px-4 py-2.5">
                      <EditableCell id={e.id} campo="sector" valorActual={e.sector || ""} onSave={handleSaveEmpresa} tipo="text" />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {scoreBar(e.score)}
                        <span className={`text-[10px] font-bold ${scoreColor(e.score).split(" ")[0]}`}>{e.score}%</span>
                      </div>
                    </td>
                    {/* Células editáveis para campos em falta */}
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-1.5">
                        {(e.camposFaltando || []).map((campo: string) => {
                          const def = CAMPOS_EMPRESA[campo];
                          if (!def) return (
                            <span key={campo} className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">{campo}</span>
                          );
                          return (
                            <div key={campo} className="flex items-center gap-1.5">
                              <span className="text-[9px] text-gray-400 w-20 shrink-0">{def.label}:</span>
                              <EditableCell id={e.id} campo={campo} valorActual={e[campo] ? String(e[campo]) : ""} onSave={handleSaveEmpresa} tipo={def.tipo} />
                            </div>
                          );
                        })}
                        {(e.camposFaltando || []).length === 0 && (
                          <span className="text-[10px] text-green-600">✓ Completo</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-[10px]">{e.responsavelNome || "—"}</td>
                    <td className="px-4 py-2.5">
                      {(e.camposFaltando || []).length > 0 && (
                        <button
                          onClick={ev => { ev.stopPropagation(); setIaLoading(e.id); preencherIA.mutate({ empresaId: e.id, nomeEmpresa: e.nome, camposEmFalta: e.camposFaltando }); }}
                          disabled={iaLoading === e.id}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 transition-colors whitespace-nowrap">
                          {iaLoading === e.id ? (
                            <><span className="animate-spin text-[10px]">⟳</span> A pesquisar...</>
                          ) : (
                            <>✨ Preencher com IA</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {((campoFiltro ? empresasComCampo?.empresas : empresasParaQualificar?.empresas) || []).length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                    {campoFiltro ? "Nenhum cliente com este campo em falta." : "Todos os clientes têm score acima de 70% — boa qualidade de dados!"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {(campoFiltro ? empresasComCampo?.total : empresasParaQualificar?.total) || 0} clientes encontrados
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-[10px] border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Anterior</button>
              <button onClick={() => setPage(p => p + 1)}
                disabled={(campoFiltro ? (empresasComCampo?.empresas || []).length : (empresasParaQualificar?.empresas || []).length) < 50}
                className="px-3 py-1.5 text-[10px] border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Seguinte →</button>
            </div>
          </div>
        </div>
      )}
      {/* Painel de confirmação das sugestões da IA */}
      {iaSugestoes && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setIaSugestoes(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✨</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Sugestões da IA</h3>
                <p className="text-[10px] text-gray-500">{iaSugestoes.nome}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-4">A IA encontrou as seguintes informações. Selecciona os campos que queres guardar:</p>
            <div className="space-y-2 mb-5">
              {Object.entries(iaSugestoes.dados).map(([campo, valor]) => (
                <label key={campo} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={iaAceites[campo] ?? true}
                    onChange={e => setIaAceites(prev => ({ ...prev, [campo]: e.target.checked }))}
                    className="rounded text-purple-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-gray-500">{LABELS_CAMPOS[campo] || campo}</div>
                    <div className="text-xs font-medium text-gray-800 truncate">{String(valor)}</div>
                  </div>
                  <span className="text-[9px] text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">IA</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIaSugestoes(null)}
                className="flex-1 px-4 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                Cancelar
              </button>
              <button
                onClick={confirmarSugestoes}
                disabled={Object.values(iaAceites).every(v => !v) || updateEmpresa.isPending}
                className="flex-1 px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
                {updateEmpresa.isPending ? "A guardar..." : `Guardar ${Object.values(iaAceites).filter(Boolean).length} campo(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin: Utilizadores ──────────────────────────────────────────────────────
function Admin() {
  const { data: users, refetch } = trpc.crm.admin.listUsers.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const updateUser = trpc.crm.admin.updateUser.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 text-xl font-semibold">Administração</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestão de utilizadores do CRM</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900 text-sm">
          + Novo Utilizador
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Nome</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Email</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Role</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Último Login</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Estado</th>
              <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Acções</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map(user => (
              <tr key={user.id} className="border-b border-gray-200">
                <td className="px-4 py-3 text-gray-800 font-medium text-xs">{user.nome}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 capitalize">
                    {user.role?.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {user.ultimoLogin ? new Date(user.ultimoLogin).toLocaleDateString("pt-PT") : "Nunca"}
                </td>
                <td className="px-4 py-3">
                  {user.ativo
                    ? <span className="text-[10px] text-green-700">● Activo</span>
                    : <span className="text-[10px] text-red-600">● Inactivo</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => updateUser.mutate({ id: user.id, ativo: !user.ativo })}
                    className="text-gray-400 hover:text-gray-700 text-xs h-6"
                  >
                    {user.ativo ? "Desactivar" : "Activar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateUserDialog onClose={() => { setShowCreate(false); refetch(); }} />}
    </div>
  );
}

function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin"|"gestor_comercial"|"psicologo">("gestor_comercial");

  const create = trpc.crm.admin.createUser.useMutation({
    onSuccess: () => { toast.success("Utilizador criado!"); onClose(); },
    onError: e => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-gray-900 max-w-md">
        <DialogHeader><DialogTitle className="text-gray-900">Novo Utilizador CRM</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-gray-700 text-xs">Nome *</Label>
            <Input value={nome} onChange={e => setNome(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
          </div>
          <div>
            <Label className="text-gray-700 text-xs">Email *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
          </div>
          <div>
            <Label className="text-gray-700 text-xs">Password *</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900 mt-1" />
          </div>
          <div>
            <Label className="text-gray-700 text-xs">Role</Label>
            <Select value={role} onValueChange={v => setRole(v as any)}>
              <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-700 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="admin" className="text-gray-700">Admin</SelectItem>
                <SelectItem value="gestor_comercial" className="text-gray-700">Gestor Comercial</SelectItem>
                <SelectItem value="psicologo" className="text-gray-700">Psicólogo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-500">Cancelar</Button>
          <Button onClick={() => create.mutate({ nome, email, password, role })}
            disabled={!nome || !email || !password || create.isPending}
            className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900">
            {create.isPending ? "A criar..." : "Criar Utilizador"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────
function LeadDetail({ leadId, onClose }: { leadId: number; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: lead, isLoading } = trpc.crm.leads.byId.useQuery({ id: leadId });
  const moveFase = trpc.crm.leads.moveFase.useMutation({
    onSuccess: () => { utils.crm.leads.byId.invalidate({ id: leadId }); utils.crm.leads.kanban.invalidate(); utils.crm.leads.list.invalidate(); }
  });
  const addActividade = trpc.crm.actividades.create.useMutation({
    onSuccess: () => utils.crm.leads.byId.invalidate({ id: leadId })
  });
  const [novaActividade, setNovaActividade] = useState("");
  const [tipoActividade, setTipoActividade] = useState<"nota"|"chamada"|"email"|"reuniao">("nota");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteLead = trpc.crm.leads.delete.useMutation({
    onSuccess: () => {
      utils.crm.leads.list.invalidate();
      utils.crm.leads.kanban.invalidate();
      utils.crm.dashboard.stats.invalidate();
      onClose();
    },
  });
  const [showConverter, setShowConverter] = useState(false);
  const [converterForm, setConverterForm] = useState({ nomeEmpresa: '', sector: '', email: '', telefone: '' });
  const converterParaEmpresa = trpc.crm.leads.converterParaEmpresa.useMutation({
    onSuccess: (data) => {
      utils.crm.leads.byId.invalidate({ id: leadId });
      utils.crm.leads.list.invalidate();
      utils.crm.leads.kanban.invalidate();
      utils.crm.empresas.list.invalidate();
      setShowConverter(false);
    },
  });

  const updateLead = trpc.crm.leads.update.useMutation({
    onSuccess: () => {
      utils.crm.leads.byId.invalidate({ id: leadId });
      utils.crm.leads.list.invalidate();
      utils.crmQualidade.leadsParaQualificar.invalidate();
      utils.crmQualidade.resumo.invalidate();
    },
  });
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [savingField, setSavingField] = useState<string | null>(null);

  // IA preenchimento
  const preencherIA = trpc.crmQualidade.preencherComIA.useMutation();
  const [iaSugestoes, setIaSugestoes] = useState<Record<string, string> | null>(null);
  const [iaAceites, setIaAceites] = useState<Record<string, boolean>>({});
  const updateEmpresa = trpc.crm.empresas.update.useMutation({
    onSuccess: () => {
      utils.crm.leads.byId.invalidate({ id: leadId });
      utils.crm.empresas.invalidate();
      utils.crmQualidade.resumo.invalidate();
      toast.success('Campos da empresa actualizados com sucesso!');
    },
    onError: (e) => toast.error('Erro ao guardar: ' + e.message),
  });
  const criarEmpresa = trpc.crm.empresas.create.useMutation();
  const updateLeadEmpresa = trpc.crm.leads.update.useMutation();

  async function handlePreencherIA() {
    if (!lead) return;
    const nomeEmpresa = lead.empresa?.nome || lead.titulo.replace(/^\[.*?\]\s*/, '').split(' — ')[0].trim();
    const camposEmFalta = ['telefone','email','website','sector','numColaboradores','nif','cidade'];
    // Passar dados actuais para que a IA não substitua campos já preenchidos
    const dadosActuais: Record<string, any> = {
      telefone: lead.empresa?.telefone || '',
      email: lead.empresa?.email || '',
      website: lead.empresa?.website || '',
      sector: lead.empresa?.sector || '',
      numColaboradores: lead.empresa?.numColaboradores || 0,
      nif: lead.empresa?.nif || '',
      cidade: lead.empresa?.cidade || '',
    };
    try {
      const result = await preencherIA.mutateAsync({ empresaId: lead.empresaId || 0, nomeEmpresa, camposEmFalta, dadosActuais });
      if (!result.sucesso) {
        toast.error('A IA não conseguiu pesquisar informações: ' + (result.erro || 'Erro desconhecido'));
        setIaSugestoes({});
        return;
      }
      const dados = result.dados as Record<string, any>;
      if (Object.keys(dados).length === 0) {
        toast.warning('A IA não encontrou informações públicas para "' + nomeEmpresa + '"');
        setIaSugestoes({});
        return;
      }
      toast.success(`IA encontrou ${Object.keys(dados).length} campo(s) para "${nomeEmpresa}"`);
      setIaSugestoes(dados);
      setIaAceites(Object.fromEntries(Object.keys(dados).map(k => [k, true])));
    } catch (err: any) {
      toast.error('Erro ao contactar a IA: ' + (err?.message || 'Erro desconhecido'));
      setIaSugestoes({});
    }
  }

  async function aplicarSugestoesIA() {
    if (!iaSugestoes || !lead) return;
    const camposAceites: any = {};
    Object.entries(iaSugestoes).forEach(([k, v]) => { if (iaAceites[k]) camposAceites[k] = v; });
    if (Object.keys(camposAceites).length === 0) { setIaSugestoes(null); return; }

    let empresaId = lead.empresaId;

    // Campos aceites + marcar como preenchidos por IA
    const camposIaKeys = Object.keys(camposAceites);
    const camposIaJson = JSON.stringify(camposIaKeys);

    // Se a lead não tem empresa ligada, criar uma automaticamente
    if (!empresaId) {
      const nomeEmpresa = lead.empresa?.nome || lead.titulo.replace(/^\[.*?\]\s*/, '').split(' — ')[0].trim();
      try {
        const nova = await criarEmpresa.mutateAsync({ nome: nomeEmpresa, ...camposAceites, camposPreenchidosIA: camposIaJson });
        empresaId = nova.id;
        // Ligar a empresa à lead
        await updateLeadEmpresa.mutateAsync({ id: leadId, empresaId: nova.id });
        await utils.crm.leads.byId.invalidate({ id: leadId });
        setIaSugestoes(null);
        return;
      } catch (e) {
        console.error('Erro ao criar empresa:', e);
        return;
      }
    }

    // Empresa já existe — actualizar os campos e registar quais foram preenchidos por IA
    // Merge com campos IA já existentes
    let camposIaExistentes: string[] = [];
    try { camposIaExistentes = JSON.parse(lead.empresa?.camposPreenchidosIA || '[]'); } catch {}
    const camposIaMerged = JSON.stringify(Array.from(new Set(camposIaExistentes.concat(camposIaKeys))));
    updateEmpresa.mutate({ id: empresaId, ...camposAceites, camposPreenchidosIA: camposIaMerged }, { onSuccess: () => setIaSugestoes(null) });
  }

  function saveField(campo: string, valor: string) {
    setSavingField(campo);
    const payload: any = { id: leadId };
    if (campo === 'mensalidade') payload.mensalidade = valor ? Number(valor) : null;
    else if (campo === 'dataRenovacao') payload.dataRenovacao = valor || null;
    else payload[campo] = valor || null;
    updateLead.mutate(payload, {
      onSuccess: () => { setSavingField(null); setEditFields(prev => { const n = {...prev}; delete n[campo]; return n; }); },
      onError: () => setSavingField(null),
    });
  }

  if (isLoading) return null;
  if (!lead) return null;

  // Campos preenchidos pela IA (array de chaves)
  const camposIA: string[] = (() => {
    try { return JSON.parse(lead.empresa?.camposPreenchidosIA || '[]'); } catch { return []; }
  })();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-gray-900 max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-gray-900 text-base">{lead.titulo}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full text-gray-900 ${faseCor(lead.fase)}`}>{faseLabel(lead.fase)}</span>
                {lead.empresa && <span className="text-gray-500 text-xs">⬡ {lead.empresa.nome}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePreencherIA}
                disabled={preencherIA.isPending}
                className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-colors disabled:opacity-50">
                {preencherIA.isPending ? <><span className="animate-spin">⟳</span> IA...</> : <><span>✨</span> IA</>}
              </button>
              {!lead.empresa && (
                <button
                  onClick={() => { setShowConverter(true); setConfirmDelete(false); setConverterForm({ nomeEmpresa: lead.titulo.replace(/^\[.*?\]\s*/, '').split(' — ')[0].trim(), sector: '', email: '', telefone: '' }); }}
                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded-lg transition-colors"
                >
                  → Empresa
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Converter para Empresa */}
        {showConverter && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 text-xs font-semibold mb-3">Converter Lead em Cliente</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                  <label className="text-gray-500 text-[10px] block mb-1">Nome do Cliente *</label>
                <Input value={converterForm.nomeEmpresa} onChange={e => setConverterForm(f => ({...f, nomeEmpresa: e.target.value}))} className="bg-white border-gray-300 text-gray-900 text-xs h-8" placeholder="Nome da empresa" />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] block mb-1">Email</label>
                <Input value={converterForm.email} onChange={e => setConverterForm(f => ({...f, email: e.target.value}))} className="bg-white border-gray-300 text-gray-900 text-xs h-8" placeholder="email@empresa.pt" />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] block mb-1">Telefone</label>
                <Input value={converterForm.telefone} onChange={e => setConverterForm(f => ({...f, telefone: e.target.value}))} className="bg-white border-gray-300 text-gray-900 text-xs h-8" placeholder="+351..." />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => converterParaEmpresa.mutate({ id: leadId, nomeEmpresa: converterForm.nomeEmpresa, email: converterForm.email || undefined, telefone: converterForm.telefone || undefined })} disabled={!converterForm.nomeEmpresa || converterParaEmpresa.isPending} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  {converterParaEmpresa.isPending ? 'A criar...' : 'Criar Cliente'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowConverter(false)} className="text-xs border-gray-300">Cancelar</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Mover fase */}
          <div>
            <Label className="text-gray-500 text-xs">Mover para fase</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {FASES.map(f => (
                <button
                  key={f.id}
                  onClick={() => moveFase.mutate({ id: leadId, fase: f.id })}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    lead.fase === f.id
                      ? `${f.cor} text-gray-900 border-transparent`
                      : "border-gray-300 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {lead.mensalidade && (
              <div className="bg-gray-100/80 rounded-lg p-3">
                <div className="text-gray-400">Mensalidade</div>
                <div className="text-green-700 font-semibold text-sm">€{Number(lead.mensalidade).toLocaleString()}/mês</div>
              </div>
            )}
            {lead.empresa?.numColaboradores && (
              <div className="bg-gray-100/80 rounded-lg p-3">
                <div className="text-gray-400 flex items-center gap-1">
                  Colaboradores
                  {camposIA.includes('numColaboradores') && <span title="Preenchido por IA" className="text-purple-400 text-[10px]">✨</span>}
                </div>
                <div className="text-gray-800 font-semibold">{lead.empresa.numColaboradores}</div>
              </div>
            )}
            {(lead as any).dataRenovacao && (
              <div className="bg-gray-100/80 rounded-lg p-3 col-span-2">
                <div className="text-gray-400 mb-2">Renovação do Contrato</div>
                <RenewalBadge date={(lead as any).dataRenovacao} label="Renovação" />
              </div>
            )}
          </div>

          {/* Notas */}
          {lead.notas && (
            <div className="bg-gray-100/60 rounded-lg p-3 text-gray-700 text-xs">{lead.notas}</div>
          )}

          {/* Dados da Empresa (campos preenchidos pela IA ou manualmente) */}
          {lead.empresa && (lead.empresa.email || lead.empresa.telefone || lead.empresa.website || lead.empresa.nif || lead.empresa.cidade || lead.empresa.sector) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Dados da Empresa</span>
                {camposIA.length > 0 && <span className="text-purple-400 text-[10px]" title="Campos preenchidos por IA">✨</span>}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {lead.empresa.email && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[9px] w-14 shrink-0">Email{camposIA.includes('email') && <span className="text-purple-400 ml-0.5">✨</span>}</span>
                    <a href={`mailto:${lead.empresa.email}`} className="text-blue-600 text-[10px] hover:underline truncate">{lead.empresa.email}</a>
                  </div>
                )}
                {lead.empresa.telefone && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[9px] w-14 shrink-0">Tel{camposIA.includes('telefone') && <span className="text-purple-400 ml-0.5">✨</span>}</span>
                    <a href={`tel:${lead.empresa.telefone}`} className="text-gray-700 text-[10px] hover:underline">{lead.empresa.telefone}</a>
                  </div>
                )}
                {lead.empresa.website && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[9px] w-14 shrink-0">Website{camposIA.includes('website') && <span className="text-purple-400 ml-0.5">✨</span>}</span>
                    <a href={lead.empresa.website.startsWith('http') ? lead.empresa.website : `https://${lead.empresa.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-[10px] hover:underline truncate">{lead.empresa.website.replace(/^https?:\/\//, '')}</a>
                  </div>
                )}
                {lead.empresa.nif && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[9px] w-14 shrink-0">NIF{camposIA.includes('nif') && <span className="text-purple-400 ml-0.5">✨</span>}</span>
                    <span className="text-gray-700 text-[10px] font-mono">{lead.empresa.nif}</span>
                  </div>
                )}
                {lead.empresa.cidade && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[9px] w-14 shrink-0">Cidade{camposIA.includes('cidade') && <span className="text-purple-400 ml-0.5">✨</span>}</span>
                    <span className="text-gray-700 text-[10px]">{lead.empresa.cidade}</span>
                  </div>
                )}
                {lead.empresa.sector && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[9px] w-14 shrink-0">Sector{camposIA.includes('sector') && <span className="text-purple-400 ml-0.5">✨</span>}</span>
                    <span className="text-gray-700 text-[10px]">{lead.empresa.sector}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Campos de Qualificação */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Qualificação da Lead</span>
                {updateLead.isPending && <span className="text-[10px] text-gray-400 animate-pulse">A guardar...</span>}
              </div>
              <button
                onClick={handlePreencherIA}
                disabled={preencherIA.isPending}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-colors disabled:opacity-50"
              >
                {preencherIA.isPending ? (
                  <><span className="animate-spin">⟳</span> A pesquisar...</>
                ) : (
                  <><span>✨</span> Preencher com IA</>
                )}
              </button>
            </div>

            {/* Painel de sugestões da IA */}
            {iaSugestoes && Object.keys(iaSugestoes).length > 0 && (
              <div className="mb-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-700">✨ Sugestões da IA</span>
                  <button onClick={() => setIaSugestoes(null)} className="text-[10px] text-gray-400 hover:text-gray-600">✕ Fechar</button>
                </div>
                <div className="space-y-1.5 mb-3">
                  {Object.entries(iaSugestoes).map(([campo, valor]) => (
                    <label key={campo} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={iaAceites[campo] ?? true}
                        onChange={e => setIaAceites(p => ({...p, [campo]: e.target.checked}))}
                        className="rounded border-purple-300"
                      />
                      <span className="text-[10px] text-gray-500 w-28 shrink-0 capitalize">{campo.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      <span className="text-xs text-gray-800 font-medium truncate">{String(valor) || <em className="text-gray-400">vazio</em>}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={aplicarSugestoesIA}
                    disabled={updateEmpresa.isPending}
                    className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updateEmpresa.isPending ? 'A guardar...' : `Guardar ${Object.values(iaAceites).filter(Boolean).length} campo(s)`}
                  </button>
                  <button onClick={() => setIaSugestoes(null)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {iaSugestoes && Object.keys(iaSugestoes).length === 0 && (
              <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-xs text-yellow-700">
                ⚠️ A IA não encontrou informações para esta empresa.
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {/* Responsável */}
              <div>
                <label className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                  Responsável
                  {camposIA.includes('responsavelNome') && <span title="Preenchido por IA" className="text-purple-400 text-[10px]">✨</span>}
                </label>
                {editFields['responsavelNome'] !== undefined ? (
                  <div className="flex gap-1">
                    <input autoFocus type="text" value={editFields['responsavelNome']}
                      onChange={e => setEditFields(p => ({...p, responsavelNome: e.target.value}))}
                      onKeyDown={e => { if (e.key === 'Enter') saveField('responsavelNome', editFields['responsavelNome']); if (e.key === 'Escape') setEditFields(p => { const n={...p}; delete n['responsavelNome']; return n; }); }}
                      className="flex-1 text-xs border border-orange-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                    <button onClick={() => saveField('responsavelNome', editFields['responsavelNome'])} disabled={savingField==='responsavelNome'} className="text-[10px] px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">✓</button>
                    <button onClick={() => setEditFields(p => { const n={...p}; delete n['responsavelNome']; return n; })} className="text-[10px] px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">✕</button>
                  </div>
                ) : (
                  <div onClick={() => setEditFields(p => ({...p, responsavelNome: (lead as any).responsavelNome || ''}))} className={`text-xs px-2 py-1.5 rounded border cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors ${ (lead as any).responsavelNome ? 'border-gray-200 text-gray-800' : 'border-dashed border-red-300 text-red-400 bg-red-50' }`}>
                    {(lead as any).responsavelNome || '+ Adicionar responsável'}
                  </div>
                )}
              </div>
              {/* Mensalidade */}
              <div>
                <label className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                  Mensalidade (€/mês)
                  {camposIA.includes('mensalidade') && <span title="Preenchido por IA" className="text-purple-400 text-[10px]">✨</span>}
                </label>
                {editFields['mensalidade'] !== undefined ? (
                  <div className="flex gap-1">
                    <input autoFocus type="number" value={editFields['mensalidade']}
                      onChange={e => setEditFields(p => ({...p, mensalidade: e.target.value}))}
                      onKeyDown={e => { if (e.key === 'Enter') saveField('mensalidade', editFields['mensalidade']); if (e.key === 'Escape') setEditFields(p => { const n={...p}; delete n['mensalidade']; return n; }); }}
                      className="flex-1 text-xs border border-orange-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                    <button onClick={() => saveField('mensalidade', editFields['mensalidade'])} disabled={savingField==='mensalidade'} className="text-[10px] px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">✓</button>
                    <button onClick={() => setEditFields(p => { const n={...p}; delete n['mensalidade']; return n; })} className="text-[10px] px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">✕</button>
                  </div>
                ) : (
                  <div onClick={() => setEditFields(p => ({...p, mensalidade: lead.mensalidade ? String(lead.mensalidade) : ''}))} className={`text-xs px-2 py-1.5 rounded border cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors ${ lead.mensalidade ? 'border-gray-200 text-gray-800' : 'border-dashed border-red-300 text-red-400 bg-red-50' }`}>
                    {lead.mensalidade ? `€${Number(lead.mensalidade).toLocaleString()}` : '+ Adicionar mensalidade'}
                  </div>
                )}
              </div>
              {/* Data de Renovação */}
              <div>
                <label className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                  Data de Renovação
                  {camposIA.includes('dataRenovacao') && <span title="Preenchido por IA" className="text-purple-400 text-[10px]">✨</span>}
                </label>
                {editFields['dataRenovacao'] !== undefined ? (
                  <div className="flex gap-1">
                    <input autoFocus type="date" value={editFields['dataRenovacao']}
                      onChange={e => setEditFields(p => ({...p, dataRenovacao: e.target.value}))}
                      onKeyDown={e => { if (e.key === 'Enter') saveField('dataRenovacao', editFields['dataRenovacao']); if (e.key === 'Escape') setEditFields(p => { const n={...p}; delete n['dataRenovacao']; return n; }); }}
                      className="flex-1 text-xs border border-orange-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                    <button onClick={() => saveField('dataRenovacao', editFields['dataRenovacao'])} disabled={savingField==='dataRenovacao'} className="text-[10px] px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">✓</button>
                    <button onClick={() => setEditFields(p => { const n={...p}; delete n['dataRenovacao']; return n; })} className="text-[10px] px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">✕</button>
                  </div>
                ) : (
                  <div onClick={() => setEditFields(p => ({...p, dataRenovacao: (lead as any).dataRenovacao ? String((lead as any).dataRenovacao).slice(0,10) : ''}))} className={`text-xs px-2 py-1.5 rounded border cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors ${ (lead as any).dataRenovacao ? 'border-gray-200 text-gray-800' : 'border-dashed border-red-300 text-red-400 bg-red-50' }`}>
                    {(lead as any).dataRenovacao ? new Date((lead as any).dataRenovacao).toLocaleDateString('pt-PT') : '+ Adicionar data'}
                  </div>
                )}
              </div>
              {/* Título / Descrição */}
              <div>
                <label className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                  Título / Descrição
                  {camposIA.includes('titulo') && <span title="Preenchido por IA" className="text-purple-400 text-[10px]">✨</span>}
                </label>
                {editFields['titulo'] !== undefined ? (
                  <div className="flex gap-1">
                    <input autoFocus type="text" value={editFields['titulo']}
                      onChange={e => setEditFields(p => ({...p, titulo: e.target.value}))}
                      onKeyDown={e => { if (e.key === 'Enter') saveField('titulo', editFields['titulo']); if (e.key === 'Escape') setEditFields(p => { const n={...p}; delete n['titulo']; return n; }); }}
                      className="flex-1 text-xs border border-orange-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                    <button onClick={() => saveField('titulo', editFields['titulo'])} disabled={savingField==='titulo'} className="text-[10px] px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">✓</button>
                    <button onClick={() => setEditFields(p => { const n={...p}; delete n['titulo']; return n; })} className="text-[10px] px-2 py-1 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">✕</button>
                  </div>
                ) : (
                  <div onClick={() => setEditFields(p => ({...p, titulo: lead.titulo || ''}))} className="text-xs px-2 py-1.5 rounded border border-gray-200 text-gray-800 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors truncate">
                    {lead.titulo || '+ Adicionar título'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Adicionar actividade */}
          <div className="border-t border-gray-300 pt-4">
            <Label className="text-gray-500 text-xs mb-2 block">Registar actividade</Label>
            <div className="flex gap-2 mb-2">
              {(["nota","chamada","email","reuniao"] as const).map(t => (
                <button key={t} onClick={() => setTipoActividade(t)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize ${
                    tipoActividade === t ? "bg-[#e85d26] border-[#e85d26] text-gray-900" : "border-gray-300 text-gray-500"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={novaActividade}
                onChange={e => setNovaActividade(e.target.value)}
                placeholder="Descreva a actividade..."
                className="bg-gray-50 border-gray-300 text-gray-900 text-xs"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!novaActividade) return;
                  addActividade.mutate({
                    leadId, tipo: tipoActividade, titulo: novaActividade,
                    dataActividade: new Date().toISOString(), concluida: true,
                  });
                  setNovaActividade("");
                }}
                disabled={!novaActividade || addActividade.isPending}
                className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900 shrink-0"
              >
                +
              </Button>
            </div>
          </div>

          {/* Histórico */}
          <div>
            <Label className="text-gray-500 text-xs mb-2 block">Histórico ({lead.actividades?.length || 0})</Label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {(lead.actividades || []).map(a => (
                <div key={a.id} className="flex items-start gap-2 py-1.5 border-b border-gray-200 last:border-0">
                  <span className="text-gray-400 text-[10px] w-16 shrink-0 mt-0.5">
                    {new Date(a.dataActividade).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}
                  </span>
                  <Badge variant="outline" className="text-[9px] py-0 border-gray-300 text-gray-400 capitalize shrink-0">{a.tipo}</Badge>
                  <span className="text-gray-700 text-xs">{a.titulo}</span>
                </div>
              ))}
              {(lead.actividades || []).length === 0 && (
                <p className="text-gray-300 text-xs">Sem actividades registadas.</p>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé com botão Eliminar */}
        <div className="border-t border-gray-200 pt-3 mt-2 flex justify-between items-center">
          <span className="text-[10px] text-gray-400">ID #{leadId}</span>
          {!confirmDelete ? (
            <button
              onClick={() => { setConfirmDelete(true); setShowConverter(false); }}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Eliminar Lead
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              <span className="text-red-600 text-xs font-medium">Confirmar eliminação?</span>
              <button
                onClick={() => deleteLead.mutate({ id: leadId })}
                disabled={deleteLead.isPending}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded transition-colors"
              >
                {deleteLead.isPending ? "..." : "Sim"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
              >
                Não
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reuniões ─────────────────────────────────────────────────────────────────────────────────
function Reunioes() {
  return (
    <div className="p-6">
      <h1 className="text-gray-900 text-xl font-semibold mb-2">Reuniões</h1>
      <p className="text-gray-500 text-sm mb-6">Calendário e gestão de reuniões (integração Teams/Outlook em breve)</p>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-4xl mb-3">◷</div>
        <p className="text-gray-700 font-medium mb-1">Módulo de Reuniões</p>
        <p className="text-gray-400 text-sm">A integração com Microsoft Teams e Outlook está em desenvolvimento.<br />Em breve poderá agendar reuniões directamente aqui.</p>
      </div>
    </div>
  );
}

// ─── Empresa Detalhe (painel lateral) ─────────────────────────────────
const TIPO_ICONS: Record<string, string> = {
  chamada: "📞", email: "✉️", reuniao: "📅", nota: "📝",
  proposta: "📄", contrato: "📋", outro: "•",
};

function EmpresaDetalhe({ empresaId, onClose }: { empresaId: number; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: empresa, isLoading, refetch } = trpc.crm.empresas.byId.useQuery({ id: empresaId });
  const [tab, setTab] = useState<"geral"|"actividades"|"propostas"|"contactos"|"leads">("geral");

  // Actividade
  const [tipoAct, setTipoAct] = useState<"chamada"|"email"|"reuniao"|"nota">("nota");
  const [textoAct, setTextoAct] = useState("");
  const addAct = trpc.crm.actividades.create.useMutation({
    onSuccess: () => { setTextoAct(""); refetch(); toast.success("Actividade registada."); },
    onError: (e) => toast.error(e.message),
  });

  // Proposta
  const [showProposta, setShowProposta] = useState(false);
  const [propTitulo, setPropTitulo] = useState("");
  const [propValor, setPropValor] = useState("");
  const [propFile, setPropFile] = useState<File | null>(null);
  const [propLoading, setPropLoading] = useState(false);
  const uploadProposta = trpc.crm.propostas.upload.useMutation({
    onSuccess: () => {
      setShowProposta(false); setPropTitulo(""); setPropValor(""); setPropFile(null);
      refetch(); toast.success("Proposta anexada com sucesso.");
    },
    onError: (e) => { toast.error(e.message); setPropLoading(false); },
  });
  function handleUploadProposta() {
    if (!propFile || !propTitulo) return;
    setPropLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadProposta.mutate({
        empresaId, titulo: propTitulo,
        valor: propValor ? parseFloat(propValor) : undefined,
        fileBase64: base64, fileName: propFile.name,
      });
      setPropLoading(false);
    };
    reader.readAsDataURL(propFile);
  }

  // Editar empresa
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const updateEmpresa = trpc.crm.empresas.update.useMutation({
    onSuccess: () => {
      setEditing(false); refetch();
      utils.crm.empresas.list.invalidate();
      toast.success("Cliente actualizado.");
    },
    onError: (e) => toast.error(e.message),
  });

  // IA preenchimento
  const preencherIA = trpc.crmQualidade.preencherComIA.useMutation();
  const updateEmpresaIA = trpc.crm.empresas.update.useMutation({
    onSuccess: () => { refetch(); utils.crm.empresas.list.invalidate(); utils.crmQualidade.resumo.invalidate(); setIaSugestoes(null); toast.success("Campos actualizados pela IA!"); },
    onError: (e) => toast.error(e.message),
  });
  const [iaSugestoes, setIaSugestoes] = useState<Record<string, string> | null>(null);
  const [iaAceites, setIaAceites] = useState<Record<string, boolean>>({});

  async function handlePreencherIA() {
    if (!empresa) return;
    const camposEmFalta = ['telefone','email','website','sector','numColaboradores','nif','cidade'];
    // Passar dados actuais para que a IA não substitua campos já preenchidos
    const dadosActuais: Record<string, any> = {
      telefone: empresa.telefone || '',
      email: empresa.email || '',
      website: empresa.website || '',
      sector: empresa.sector || '',
      numColaboradores: empresa.numColaboradores || 0,
      nif: empresa.nif || '',
      cidade: empresa.cidade || '',
    };
    try {
      const result = await preencherIA.mutateAsync({ empresaId: empresa.id, nomeEmpresa: empresa.nome, camposEmFalta, dadosActuais });
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
    if (!iaSugestoes || !empresa) return;
    const aceites: any = {};
    Object.entries(iaSugestoes).forEach(([k, v]) => { if (iaAceites[k]) aceites[k] = v; });
    if (Object.keys(aceites).length === 0) { setIaSugestoes(null); return; }
    let camposIaExistentes: string[] = [];
    try { camposIaExistentes = JSON.parse((empresa as any).camposPreenchidosIA || '[]'); } catch {}
    const camposIaMerged = JSON.stringify(Array.from(new Set(camposIaExistentes.concat(Object.keys(aceites)))));
    updateEmpresaIA.mutate({ id: empresa.id, ...aceites, camposPreenchidosIA: camposIaMerged });
  }

  const LABELS_CAMPOS_EMP: Record<string, string> = {
    telefone: 'Telefone', email: 'Email', website: 'Website',
    sector: 'Sector', numColaboradores: 'Nº Colaboradores',
    nif: 'NIF', cidade: 'Cidade',
  };

  // Campos preenchidos pela IA (array de chaves)
  const camposIA: string[] = (() => {
    try { return JSON.parse((empresa as any)?.camposPreenchidosIA || '[]'); } catch { return []; }
  })();

  function startEdit() {
    if (!empresa) return;
    setEditData({
      nome: empresa.nome ?? "",
      sector: empresa.sector ?? "",
      numColaboradores: empresa.numColaboradores?.toString() ?? "",
      email: empresa.email ?? "",
      telefone: empresa.telefone ?? "",
      website: empresa.website ?? "",
      linkedin: empresa.linkedin ?? "",
      cidade: empresa.cidade ?? "",
      morada: empresa.morada ?? "",
      nif: empresa.nif ?? "",
      notas: empresa.notas ?? "",
      dataInicioContrato: (empresa as any).dataInicioContrato ? new Date((empresa as any).dataInicioContrato).toISOString().split('T')[0] : "",
      dataFimContrato: (empresa as any).dataFimContrato ? new Date((empresa as any).dataFimContrato).toISOString().split('T')[0] : "",
    });
    setEditing(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1" />
      <div
        className="w-full max-w-2xl bg-gray-50 border-l border-gray-200 flex flex-col h-full shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: "slideInRight 220ms cubic-bezier(0.23,1,0.32,1)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-gray-900 font-semibold text-lg truncate">{empresa?.nome}</h2>
                  {empresa?.clienteAtivo
                    ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-300 shrink-0">Cliente</span>
                    : <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 shrink-0">Prospect</span>
                  }
                </div>
                {(empresa as any)?.dataFimContrato && (
                  <div className="mt-1.5">
                    <RenewalBadge date={(empresa as any).dataFimContrato} label="Renovação" />
                  </div>
                )}
                <p className="text-gray-500 text-xs mt-0.5">
                  {empresa?.sector || "Sector não definido"}
                  {empresa?.cidade ? ` · ${empresa.cidade}` : ""}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {!editing && (
              <>
                <button
                  onClick={handlePreencherIA}
                  disabled={preencherIA.isPending}
                  className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-colors disabled:opacity-50">
                  {preencherIA.isPending ? <><span className="animate-spin text-xs">⟳</span> IA...</> : <><span>✨</span> IA</>}
                </button>
                <button onClick={startEdit} className="text-gray-500 hover:text-gray-900 text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
                  Editar
                </button>
              </>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors">×</button>
          </div>
        </div>

        {/* KPIs rápidos */}
        {!isLoading && empresa && !editing && (
          <div className="grid grid-cols-4 gap-px bg-gray-200/50 shrink-0">
            {[
              { label: "Colaboradores", value: empresa.numColaboradores ?? "—", cls: "text-gray-900" },
              { label: "Mensalidade", value: empresa.valorMensalidade ? `€${Number(empresa.valorMensalidade).toLocaleString()}` : "—", cls: "text-green-700" },
              { label: "Leads", value: (empresa.leads?.length ?? 0).toString(), cls: "text-gray-900" },
              { label: "Actividades", value: (empresa.actividades?.length ?? 0).toString(), cls: "text-gray-900" },
            ].map(k => (
              <div key={k.label} className="bg-gray-50 px-4 py-3 text-center">
                <div className="text-gray-500 text-[10px] uppercase tracking-wide">{k.label}</div>
                <div className={`font-semibold text-sm mt-0.5 ${k.cls}`}>{k.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Modo editar */}
        {editing && empresa && (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <p className="text-gray-700 text-sm font-medium mb-2">Editar dados do cliente</p>
            {([
              ["nome","Nome"], ["sector","Sector"], ["numColaboradores","Nº Colaboradores"],
              ["email","Email"], ["telefone","Telefone"], ["website","Website"],
              ["linkedin","LinkedIn"], ["cidade","Cidade"], ["morada","Morada"], ["nif","NIF"],
            ] as [string,string][]).map(([k, label]) => (
              <div key={k}>
                <Label className="text-gray-500 text-xs">{label}</Label>
                <Input value={editData[k] ?? ""} onChange={e => setEditData(d => ({ ...d, [k]: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900 text-sm mt-1" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-500 text-xs">Início Contrato</Label>
                <Input type="date" value={editData.dataInicioContrato ?? ""} onChange={e => setEditData(d => ({ ...d, dataInicioContrato: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900 text-sm mt-1" />
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Data de Renovação</Label>
                <Input type="date" value={editData.dataFimContrato ?? ""} onChange={e => setEditData(d => ({ ...d, dataFimContrato: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900 text-sm mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">Notas</Label>
              <Textarea value={editData.notas ?? ""} onChange={e => setEditData(d => ({ ...d, notas: e.target.value }))}
                className="bg-white border-gray-300 text-gray-900 text-sm mt-1 min-h-[80px]" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => updateEmpresa.mutate({
                  id: empresaId, ...editData,
                  numColaboradores: editData.numColaboradores ? parseInt(editData.numColaboradores) : undefined,
                  dataInicioContrato: editData.dataInicioContrato || undefined,
                  dataFimContrato: editData.dataFimContrato || undefined,
                })}
                disabled={updateEmpresa.isPending}
                className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900"
              >Guardar</Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="border-gray-300 text-gray-700">Cancelar</Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!editing && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex gap-0 px-6 pt-3 border-b border-gray-200 shrink-0 overflow-x-auto">
              {(["geral","actividades","propostas","contactos","leads"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`text-xs px-4 py-2.5 border-b-2 transition-all whitespace-nowrap font-medium ${
                    tab === t ? "border-[#e85d26] text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}>
                  {t === "geral" ? "Visão Geral" : t === "actividades" ? `Actividades${empresa?.actividades?.length ? ` (${empresa.actividades.length})` : ""}` : t === "propostas" ? "Propostas" : t === "contactos" ? "Contactos" : `Leads${empresa?.leads?.length ? ` (${empresa.leads.length})` : ""}`}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />)}</div>
              ) : !empresa ? (
                <p className="text-gray-400 text-sm">Cliente não encontrado.</p>
              ) : (
                <>
                  {/* Visão Geral */}
                  {tab === "geral" && (
                    <div className="space-y-4">

                      {/* Painel de sugestões IA */}
                      {iaSugestoes && Object.keys(iaSugestoes).length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
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
                                  <div className="text-[10px] text-gray-500">{LABELS_CAMPOS_EMP[campo] || campo}</div>
                                  <div className="text-xs font-medium text-gray-800 truncate">{String(valor)}</div>
                                </div>
                                <span className="text-[9px] text-purple-500 bg-white border border-purple-200 px-1.5 py-0.5 rounded">IA</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setIaSugestoes(null)}
                              className="flex-1 px-4 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Cancelar</button>
                            <button onClick={confirmarSugestoesIA}
                              disabled={Object.values(iaAceites).every(v => !v) || updateEmpresaIA.isPending}
                              className="flex-1 px-4 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
                              {updateEmpresaIA.isPending ? "A guardar..." : `Guardar ${Object.values(iaAceites).filter(Boolean).length} campo(s)`}
                            </button>
                          </div>
                        </div>
                      )}
                      {iaSugestoes && Object.keys(iaSugestoes).length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-xs text-yellow-700">
                          ⚠️ A IA não encontrou informações para este cliente.
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {([
                          ["NIF", empresa.nif, "nif"],
                          ["Email", empresa.email, "email"],
                          ["Telefone", empresa.telefone, "telefone"],
                          ["Cidade", empresa.cidade, "cidade"],
                          ["Morada", empresa.morada, "morada"],
                          ["Segmento", empresa.segmento, "segmento"],
                        ] as [string, string|null|undefined, string][]).filter(([, v]) => v).map(([label, value, key]) => (
                          <div key={label} className="bg-gray-100/70 rounded-lg p-3">
                            <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1">
                              {label}
                              {camposIA.includes(key) && <span title="Preenchido por IA" className="text-purple-400">✨</span>}
                            </div>
                            <div className="text-gray-800 text-xs">{value}</div>
                          </div>
                        ))}
                        {(empresa as any).responsavelNome && (
                          <div className="bg-gray-100/70 rounded-lg p-3">
                            <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">Responsável</div>
                            <div className="text-gray-800 text-xs">{(empresa as any).responsavelNome}</div>
                          </div>
                        )}
                        {(empresa as any).mensalidade && (
                          <div className="bg-gray-100/70 rounded-lg p-3">
                            <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">Mensalidade</div>
                            <div className="text-green-700 text-sm font-semibold">€{Number((empresa as any).mensalidade).toLocaleString('pt-PT')}/mês</div>
                          </div>
                        )}
                        {(empresa as any).dataInicioContrato && (
                          <div className="bg-gray-100/70 rounded-lg p-3">
                            <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">Início Contrato</div>
                            <div className="text-gray-800 text-xs">{new Date((empresa as any).dataInicioContrato).toLocaleDateString('pt-PT')}</div>
                          </div>
                        )}
                        {(empresa as any).dataFimContrato && (
                          <div className="bg-gray-100/70 rounded-lg p-3 col-span-2">
                            <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-2">Renovação do Contrato</div>
                            <RenewalBadge date={(empresa as any).dataFimContrato} label="Renovação" />
                          </div>
                        )}
                        {empresa.website && (
                          <div className="bg-gray-100/70 rounded-lg p-3">
                            <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1">
                              Website
                              {camposIA.includes('website') && <span title="Preenchido por IA" className="text-purple-400">✨</span>}
                            </div>
                            <a href={empresa.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate block">{empresa.website}</a>
                          </div>
                        )}
                        {empresa.linkedin && (
                          <div className="bg-gray-100/70 rounded-lg p-3">
                            <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-1">LinkedIn</div>
                            <a href={empresa.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate block">{empresa.linkedin}</a>
                          </div>
                        )}
                      </div>
                      {empresa.notas && (
                        <div className="bg-gray-100/60 rounded-lg p-4">
                          <div className="text-gray-400 text-[10px] uppercase tracking-wide mb-2">Notas</div>
                          <p className="text-gray-700 text-xs whitespace-pre-wrap">{empresa.notas}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actividades */}
                  {tab === "actividades" && (
                    <div className="space-y-4">
                      <div className="bg-gray-100/60 rounded-xl p-4 space-y-3">
                        <p className="text-gray-700 text-xs font-medium">Registar actividade</p>
                        <div className="flex gap-2 flex-wrap">
                          {(["nota","chamada","email","reuniao"] as const).map(t => (
                            <button key={t} onClick={() => setTipoAct(t)}
                              className={`text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize ${
                                tipoAct === t ? "bg-[#e85d26] border-[#e85d26] text-gray-900" : "border-gray-300 text-gray-500 hover:border-gray-400"
                              }`}>
                              {TIPO_ICONS[t]} {t}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={textoAct}
                            onChange={e => setTextoAct(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter" && textoAct) {
                                addAct.mutate({ empresaId, tipo: tipoAct, titulo: textoAct, dataActividade: new Date().toISOString(), concluida: true });
                                setTextoAct("");
                              }
                            }}
                            placeholder="Descreva a actividade... (Enter para guardar)"
                            className="bg-gray-50 border-gray-300 text-gray-900 text-xs flex-1"
                          />
                          <Button size="sm"
                            onClick={() => {
                              if (!textoAct) return;
                              addAct.mutate({ empresaId, tipo: tipoAct, titulo: textoAct, dataActividade: new Date().toISOString(), concluida: true });
                              setTextoAct("");
                            }}
                            disabled={!textoAct || addAct.isPending}
                            className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900 shrink-0">+</Button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {(empresa.actividades || []).length === 0 ? (
                          <p className="text-gray-400 text-xs text-center py-8">Sem actividades registadas.</p>
                        ) : (empresa.actividades as any[]).map(a => (
                          <div key={a.id} className="flex items-start gap-3 py-2.5 border-b border-gray-200 last:border-0">
                            <span className="text-base shrink-0 mt-0.5">{TIPO_ICONS[a.tipo] ?? "•"}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-800 text-xs font-medium truncate">{a.titulo}</span>
                                <Badge variant="outline" className="text-[9px] py-0 border-gray-300 text-gray-400 capitalize shrink-0">{a.tipo}</Badge>
                              </div>
                              {a.descricao && <p className="text-gray-500 text-[10px] mt-0.5">{a.descricao}</p>}
                            </div>
                            <span className="text-gray-400 text-[10px] shrink-0">
                              {new Date(a.dataActividade).toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "2-digit" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Propostas */}
                  {tab === "propostas" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500 text-xs">{((empresa as any).propostas?.length ?? 0)} propostas</p>
                        <Button size="sm" onClick={() => setShowProposta(v => !v)} className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900 text-xs">
                          {showProposta ? "Cancelar" : "+ Anexar Proposta"}
                        </Button>
                      </div>
                      {showProposta && (
                        <div className="bg-gray-100/70 rounded-xl p-4 space-y-3 border border-gray-200">
                          <Input placeholder="Título da proposta *" value={propTitulo} onChange={e => setPropTitulo(e.target.value)}
                            className="bg-gray-50 border-gray-300 text-gray-900 text-xs" />
                          <Input placeholder="Valor (€) — opcional" type="number" value={propValor} onChange={e => setPropValor(e.target.value)}
                            className="bg-gray-50 border-gray-300 text-gray-900 text-xs" />
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#e85d26] transition-colors"
                            onClick={() => document.getElementById("proposta-file-input")?.click()}
                          >
                            {propFile
                              ? <p className="text-gray-700 text-xs">📄 {propFile.name}</p>
                              : <p className="text-gray-400 text-xs">Clique para seleccionar PDF</p>
                            }
                            <input id="proposta-file-input" type="file" accept=".pdf" className="hidden"
                              onChange={e => setPropFile(e.target.files?.[0] ?? null)} />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleUploadProposta} disabled={!propFile || !propTitulo || propLoading}
                              className="bg-[#e85d26] hover:bg-[#d14e1a] text-gray-900">
                              {propLoading ? "A enviar..." : "Guardar"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowProposta(false)} className="border-gray-300 text-gray-700">Cancelar</Button>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        {((empresa as any).propostas as any[] || []).length === 0 && !showProposta ? (
                          <p className="text-gray-400 text-xs text-center py-8">Sem propostas anexadas.</p>
                        ) : ((empresa as any).propostas as any[] || []).map(p => (
                          <div key={p.id} className="flex items-center gap-3 bg-gray-100/60 rounded-lg px-4 py-3">
                            <span className="text-xl">📄</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-800 text-xs font-medium truncate">{p.titulo}</p>
                              <p className="text-gray-400 text-[10px]">
                                {p.estado}
                                {p.valor ? ` · €${Number(p.valor).toLocaleString()}` : ""}
                                {` · ${new Date(p.createdAt).toLocaleDateString("pt-PT")}`}
                              </p>
                            </div>
                            {p.pdfUrl && (
                              <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer"
                                className="text-[#e85d26] text-xs hover:underline shrink-0">Ver PDF</a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contactos */}
                  {tab === "contactos" && (
                    <div className="space-y-2">
                      {(empresa.contactos as any[] || []).length === 0 ? (
                        <p className="text-gray-400 text-xs text-center py-8">Sem contactos registados.</p>
                      ) : (empresa.contactos as any[]).map(c => (
                        <div key={c.id} className="flex items-start gap-3 bg-gray-100/60 rounded-lg px-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-semibold shrink-0">
                            {c.nome?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 text-xs font-medium">{c.nome}</p>
                            <p className="text-gray-400 text-[10px]">{c.cargo ?? ""}{c.departamento ? ` · ${c.departamento}` : ""}</p>
                            {c.email && <p className="text-blue-600 text-[10px] truncate">{c.email}</p>}
                            {c.telefone && <p className="text-gray-500 text-[10px]">{c.telefone}</p>}
                          </div>
                          {c.decisor && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">Decisor</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Leads */}
                  {tab === "leads" && (
                    <div className="space-y-2">
                      {(empresa.leads as any[] || []).length === 0 ? (
                        <p className="text-gray-400 text-xs text-center py-8">Sem leads associadas.</p>
                      ) : (empresa.leads as any[]).map(l => {
                        const fase = FASES.find(f => f.id === l.fase);
                        return (
                          <div key={l.id} className="flex items-center gap-3 bg-gray-100/60 rounded-lg px-4 py-3">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${fase?.cor ?? "bg-slate-500"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-800 text-xs font-medium truncate">{l.titulo}</p>
                              <p className="text-gray-400 text-[10px]">{fase?.label ?? l.fase}</p>
                            </div>
                            {l.mensalidade && <span className="text-green-700 text-xs shrink-0">€{Number(l.mensalidade).toLocaleString()}/mês</span>}
                            {l.dataRenovacao && <RenewalBadge date={l.dataRenovacao} label="Renov." />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


// ─── Funil de Vendas ──────────────────────────────────────────────────────────
function FunilVendas() {
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const [dataInicio, setDataInicio] = useState(primeiroDiaMes.toISOString().slice(0, 10));
  const [dataFim, setDataFim] = useState(hoje.toISOString().slice(0, 10));
  const [periodoLabel, setPeriodoLabel] = useState("mes_atual");
  const [comercialId, setComercialId] = useState<number | undefined>(undefined);

  const { data: utilizadores } = trpc.crm.admin.listUsers.useQuery();

  const aplicarPeriodo = (valor: string) => {
    setPeriodoLabel(valor);
    const agora = new Date();
    if (valor === "mes_atual") {
      setDataInicio(new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().slice(0, 10));
      setDataFim(agora.toISOString().slice(0, 10));
    } else if (valor === "mes_anterior") {
      const inicio = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
      const fim = new Date(agora.getFullYear(), agora.getMonth(), 0);
      setDataInicio(inicio.toISOString().slice(0, 10));
      setDataFim(fim.toISOString().slice(0, 10));
    } else if (valor === "trimestre") {
      const trimestre = Math.floor(agora.getMonth() / 3);
      setDataInicio(new Date(agora.getFullYear(), trimestre * 3, 1).toISOString().slice(0, 10));
      setDataFim(agora.toISOString().slice(0, 10));
    } else if (valor === "ano_atual") {
      setDataInicio(new Date(agora.getFullYear(), 0, 1).toISOString().slice(0, 10));
      setDataFim(agora.toISOString().slice(0, 10));
    } else if (valor === "ultimos_30") {
      const inicio = new Date(agora); inicio.setDate(inicio.getDate() - 30);
      setDataInicio(inicio.toISOString().slice(0, 10));
      setDataFim(agora.toISOString().slice(0, 10));
    } else if (valor === "ultimos_90") {
      const inicio = new Date(agora); inicio.setDate(inicio.getDate() - 90);
      setDataInicio(inicio.toISOString().slice(0, 10));
      setDataFim(agora.toISOString().slice(0, 10));
    }
  };

  const { data, isLoading } = trpc.crm.funil.stats.useQuery(
    { dataInicio, dataFim, responsavelId: comercialId },
    { enabled: !!dataInicio && !!dataFim }
  );

  const fases = [
    { key: "totalLeads", label: "Leads Geradas", cor: "#6366f1", icon: "◎" },
    { key: "reuniaoAgendada", label: "Reuniões Agendadas", cor: "#8b5cf6", icon: "◷" },
    { key: "propostaEnviada", label: "Proposta Enviada", cor: "#f59e0b", icon: "◈" },
    { key: "clientes", label: "Clientes Fechados", cor: "#10b981", icon: "✓" },
  ] as const;

  const delta = (atual: number, anterior: number) => {
    if (anterior === 0) return null;
    return Math.round(((atual - anterior) / anterior) * 100);
  };

  const fmt = (n: number) => n.toLocaleString("pt-PT");
  const fmtEur = (n: number) => n > 0 ? `${n.toLocaleString("pt-PT")}€/mês` : "—";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 text-xl font-semibold">Funil de Vendas</h1>
          <p className="text-gray-500 text-sm mt-0.5">Conversão por fase com comparação temporal</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Filtro por Comercial */}
          <Select
            value={comercialId !== undefined ? String(comercialId) : "todos"}
            onValueChange={v => setComercialId(v === "todos" ? undefined : Number(v))}
          >
            <SelectTrigger className="w-44 bg-white border-gray-200 text-gray-700 text-sm">
              <SelectValue placeholder="Todos os comerciais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os comerciais</SelectItem>
              {(utilizadores ?? []).map((u: any) => (
                <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Filtro de Período */}
          <Select value={periodoLabel} onValueChange={aplicarPeriodo}>
            <SelectTrigger className="w-44 bg-white border-gray-200 text-gray-700 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes_atual">Este mês</SelectItem>
              <SelectItem value="mes_anterior">Mês anterior</SelectItem>
              <SelectItem value="trimestre">Este trimestre</SelectItem>
              <SelectItem value="ano_atual">Este ano</SelectItem>
              <SelectItem value="ultimos_30">Últimos 30 dias</SelectItem>
              <SelectItem value="ultimos_90">Últimos 90 dias</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          {periodoLabel === "personalizado" && (
            <div className="flex items-center gap-1">
              <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white" />
              <span className="text-gray-400 text-sm">→</span>
              <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-white" />
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">A carregar dados...</div>
      ) : data ? (
        <>
          {/* Funil Visual */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-gray-700 font-medium text-sm mb-5">Funil de Conversão</h2>
            <div className="space-y-3">
              {fases.map((fase, i) => {
                const valor = (data.atual as any)[fase.key] as number;
                const maxVal = (data.atual as any)["totalLeads"] as number;
                const largura = maxVal > 0 ? Math.max(15, Math.round((valor / maxVal) * 100)) : 15;
                const taxaChaves = ["taxaLeadParaTratamento", "taxaTratamentoParaReuniao", "taxaReuniaoParaProposta", "taxaPropostaParaCliente"];
                const taxa = i > 0 ? (data.atual as any)[taxaChaves[i]] as number : 100;
                return (
                  <div key={fase.key} className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 w-36 text-right shrink-0">{fase.label}</span>
                    <div className="flex-1 flex items-center gap-3">
                      <div
                        className="h-10 rounded-lg flex items-center px-4 transition-all duration-500"
                        style={{ width: `${largura}%`, backgroundColor: fase.cor, minWidth: "80px" }}
                      >
                        <span className="text-white font-bold text-sm">{fmt(valor)}</span>
                      </div>
                    </div>
                    {i > 0 ? (
                      <span className="text-xs font-semibold w-12 text-right shrink-0"
                        style={{ color: taxa >= 50 ? "#10b981" : taxa >= 20 ? "#f59e0b" : "#ef4444" }}>
                        {taxa}%
                      </span>
                    ) : <span className="w-12 shrink-0" />}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-500">Taxa geral de conversão: </span>
                <span className="font-semibold text-gray-900">{data.atual.taxaGeralConversao}%</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Valor clientes fechados: </span>
                <span className="font-semibold text-green-700">{fmtEur(data.atual.valorClientes)}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Valor propostas: </span>
                <span className="font-semibold text-yellow-700">{fmtEur(data.atual.valorPropostas)}</span>
              </div>
            </div>
          </div>

          {/* Tabela Comparativa */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-gray-700 font-medium text-sm">Comparação de Períodos</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Fase</th>
                  <th className="text-right px-4 py-3 text-gray-700 font-semibold">Período Actual</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Mês Anterior</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Ano Anterior</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">vs Mês</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">vs Ano</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fases.map(fase => {
                  const atual = (data.atual as any)[fase.key] as number;
                  const mes = (data.mesAnterior as any)[fase.key] as number;
                  const ano = (data.anoAnterior as any)[fase.key] as number;
                  const dvsMes = delta(atual, mes);
                  const dvsAno = delta(atual, ano);
                  return (
                    <tr key={fase.key} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base" style={{ color: fase.cor }}>{fase.icon}</span>
                          <span className="text-gray-700 font-medium">{fase.label}</span>
                        </div>
                      </td>
                      <td className="text-right px-4 py-3 text-gray-900 font-semibold">{fmt(atual)}</td>
                      <td className="text-right px-4 py-3 text-gray-500">{fmt(mes)}</td>
                      <td className="text-right px-4 py-3 text-gray-500">{fmt(ano)}</td>
                      <td className="text-right px-6 py-3">
                        {dvsMes !== null ? (
                          <span className={`font-medium ${dvsMes >= 0 ? "text-green-700" : "text-red-600"}`}>
                            {dvsMes >= 0 ? "+" : ""}{dvsMes}%
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="text-right px-6 py-3">
                        {dvsAno !== null ? (
                          <span className={`font-medium ${dvsAno >= 0 ? "text-green-700" : "text-red-600"}`}>
                            {dvsAno >= 0 ? "+" : ""}{dvsAno}%
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-6 py-3 text-gray-700">Taxa Geral de Conversão</td>
                  <td className="text-right px-4 py-3 text-gray-900">{data.atual.taxaGeralConversao}%</td>
                  <td className="text-right px-4 py-3 text-gray-500">{data.mesAnterior.taxaGeralConversao}%</td>
                  <td className="text-right px-4 py-3 text-gray-500">{data.anoAnterior.taxaGeralConversao}%</td>
                  <td className="text-right px-6 py-3">
                    {(() => { const d = delta(data.atual.taxaGeralConversao, data.mesAnterior.taxaGeralConversao); return d !== null ? <span className={`font-medium ${d >= 0 ? "text-green-700" : "text-red-600"}`}>{d >= 0 ? "+" : ""}{d}%</span> : <span className="text-gray-400">—</span>; })()}
                  </td>
                  <td className="text-right px-6 py-3">
                    {(() => { const d = delta(data.atual.taxaGeralConversao, data.anoAnterior.taxaGeralConversao); return d !== null ? <span className={`font-medium ${d >= 0 ? "text-green-700" : "text-red-600"}`}>{d >= 0 ? "+" : ""}{d}%</span> : <span className="text-gray-400">—</span>; })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-400">Sem dados para o período seleccionado.</div>
      )}
    </div>
  );
}

// ─── CRM Main ─────────────────────────────────────────────────────────────────
export default function CRM() {
  const [, navigate] = useLocation();
  const [section, setSection] = useState("dashboard");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);

  const { data: user, isLoading } = trpc.crm.auth.me.useQuery();

  // Redirigir comerciais para Actividade
  useEffect(() => {
    if (user?.role === "gestor_comercial") setSection("actividade");
  }, [user?.role]);
  const logout = trpc.crm.auth.logout.useMutation({
    onSuccess: () => navigate("/crm/login"),
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/crm/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">A carregar CRM...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar section={section} setSection={setSection} user={user} onLogout={() => logout.mutate()} />

      <main className="flex-1 overflow-auto">
        {section === "dashboard" && <Dashboard onEmpresaClick={id => { setSelectedEmpresaId(id); }} onNavigate={setSection} />}
        {section === "pipeline" && <Pipeline onLeadClick={id => setSelectedLeadId(id)} />}
        {section === "funil" && <FunilVendas />}
        {section === "leads" && <LeadsList onLeadClick={id => setSelectedLeadId(id)} />}
        {section === "empresas" && <Empresas onEmpresaClick={id => setSelectedEmpresaId(id)} />}
        {section === "clientes_perdidos" && <ClientesPerdidos onEmpresaClick={id => setSelectedEmpresaId(id)} />}
        {section === "leads_perdidas" && <LeadsPerdidas onLeadClick={id => setSelectedLeadId(id)} />}
        {section === "prospecting" && <CRMProspecting />}
        {section === "equipa" && <CRMEquipa />}
        {section === "actividade" && <CRMActividade />}
        {section === "alertas" && <Alertas />}
        {section === "reunioes" && <Reunioes />}
        {section === "automacoes" && <Automacoes />}
        {section === "qualidade" && <QualidadeDados onLeadClick={id => setSelectedLeadId(id)} onEmpresaClick={id => setSelectedEmpresaId(id)} onNavigate={setSection} />}
        {section === "admin" && user.role === "admin" && <Admin />}
      </main>

      {selectedLeadId && (
        <LeadDetail leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      )}
      {selectedEmpresaId && (
        <EmpresaDetalhe empresaId={selectedEmpresaId} onClose={() => setSelectedEmpresaId(null)} />
      )}
    </div>
  );
}
