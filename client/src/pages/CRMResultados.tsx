/**
 * CRM TEAM 24 — Resultados Comerciais
 *
 * Fonte: Odoo (histórico real de mudanças de fase), não a base de dados do site.
 * Os números daqui NÃO coincidem com a secção "Actividade", que é preenchida à
 * mão pelos comerciais. A divergência entre as duas é, por si só, informação.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, LabelList,
} from "recharts";

const COR = { azul: "#3B82F6", laranja: "#F59E0B", verde: "#10B981", vermelho: "#EF4444" };
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const eur = (n: number) => Math.round(n).toLocaleString("pt-PT") + " €";
const num = (n: number) => n.toLocaleString("pt-PT");
const ptData = (s: string) => (s ? s.slice(8, 10) + "/" + s.slice(5, 7) + "/" + s.slice(0, 4) : "");
const soma = (a: number[]) => a.reduce((x, y) => x + y, 0);

type Preset = "12m" | "6m" | "mes-anterior" | "este-mes" | "custom";

// ─── Eixo do tempo: meses, ou semanas quando o período é curto ────────────────
function eixo(de: string, ate: string) {
  const dias = (new Date(ate).getTime() - new Date(de).getTime()) / 86400000;
  if (dias <= 70) {
    const chaveDe = (s: string) => {
      const x = new Date(s);
      x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
      return x.toISOString().slice(0, 10);
    };
    const chaves: string[] = [];
    let c = chaveDe(de);
    while (c <= ate) {
      chaves.push(c);
      const x = new Date(c);
      x.setDate(x.getDate() + 7);
      c = x.toISOString().slice(0, 10);
    }
    return { chaves, chaveDe, rotulo: (k: string) => k.slice(8, 10) + "/" + k.slice(5, 7) };
  }
  const chaveDe = (s: string) => s.slice(0, 7);
  const chaves: string[] = [];
  let c = chaveDe(de);
  while (c <= ate.slice(0, 7)) {
    chaves.push(c);
    let [a, m] = c.split("-").map(Number);
    m++;
    if (m > 12) { m = 1; a++; }
    c = a + "-" + String(m).padStart(2, "0");
  }
  return { chaves, chaveDe, rotulo: (k: string) => MESES[+k.slice(5, 7) - 1] + " " + k.slice(2, 4) };
}

// ─── Peças de interface ───────────────────────────────────────────────────────
function Cartao({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
      {nota && <p className="text-sm text-gray-500 mt-0.5 mb-4">{nota}</p>}
      {children}
    </div>
  );
}

function Tile({ n, l, h }: { n: string; l: string; h: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3.5">
      <div className="text-2xl font-bold text-gray-900 leading-tight tabular-nums">{n}</div>
      <div className="text-xs text-gray-600 mt-0.5">{l}</div>
      <div className="text-[11px] text-gray-400 mt-1.5">{h}</div>
    </div>
  );
}

function SemDados({ texto }: { texto: string }) {
  return <p className="text-sm text-gray-400 py-6 text-center">{texto}</p>;
}

// ─── Secção ───────────────────────────────────────────────────────────────────
export default function CRMResultados() {
  const [preset, setPreset] = useState<Preset>("12m");
  const [custom, setCustom] = useState<{ de: string; ate: string }>({ de: "", ate: "" });

  const { data, isLoading, error, refetch, isRefetching } = trpc.crmResultados.dados.useQuery(
    {},
    { staleTime: 10 * 60 * 1000, refetchOnWindowFocus: false }
  );

  const intervalo = useMemo(() => {
    if (!data?.ultimo) return { de: "", ate: "" };
    const fim = data.ultimo;
    const recuar = (n: number) => {
      const x = new Date(fim);
      x.setDate(x.getDate() - n);
      return x.toISOString().slice(0, 10);
    };
    if (preset === "custom") {
      const de = custom.de || data.primeiro;
      const ate = custom.ate || fim;
      return de > ate ? { de: ate, ate: de } : { de, ate };
    }
    if (preset === "6m") return { de: recuar(183), ate: fim };
    if (preset === "este-mes") return { de: fim.slice(0, 7) + "-01", ate: fim };
    if (preset === "mes-anterior") {
      let [a, m] = fim.split("-").map(Number);
      m--;
      if (m < 1) { m = 12; a--; }
      const mm = String(m).padStart(2, "0");
      return { de: `${a}-${mm}-01`, ate: `${a}-${mm}-${new Date(a, m, 0).getDate()}` };
    }
    return { de: recuar(365), ate: fim };
  }, [preset, custom, data?.ultimo, data?.primeiro]);

  const calc = useMemo(() => {
    if (!data || !intervalo.de) return null;
    const { de, ate } = intervalo;
    const dentro = (x: string) => x >= de && x <= ate;
    const ex = eixo(de, ate);
    const pos = Object.fromEntries(ex.chaves.map((k, i) => [k, i])) as Record<string, number>;
    const idx = (s: string) => pos[ex.chaveDe(s)];
    const zero = () => ex.chaves.map(() => 0);

    const criados = zero(), reunioes = zero(), propostas = zero();
    const ganhos = zero(), valor = zero(), renov = zero();

    const leads = data.L.filter((l) => dentro(l.d) && l.d !== data.importacao);
    leads.forEach((l) => { const i = idx(l.d); if (i !== undefined) criados[i]++; });

    const gs = data.G.filter((g) => dentro(g.d));
    gs.forEach((g) => { const i = idx(g.d); if (i !== undefined) { ganhos[i]++; valor[i] += g.v; } });

    data.E.forEach((e) => {
      if (!dentro(e.d)) return;
      if (e.t === "n" && e.d === data.arrumacao) return;
      const i = idx(e.d);
      if (i === undefined) return;
      if (e.t === "r") reunioes[i]++;
      else if (e.t === "p") propostas[i]++;
      else renov[i]++;
    });

    const tempo = ex.chaves.map((k, i) => ({
      k, rotulo: ex.rotulo(k),
      leads: criados[i], reunioes: reunioes[i], propostas: propostas[i],
      contratos: ganhos[i], valor: valor[i], renovacoes: renov[i],
    }));

    const pp: Record<string, { n: number; v: number; c: number }> = {};
    gs.forEach((g) => {
      const p = (pp[g.u] = pp[g.u] || { n: 0, v: 0, c: 0 });
      p.n++; p.v += g.v; if (g.p) p.c++;
    });
    const comerciais = Object.entries(pp)
      .map(([nome, p]) => ({ nome, ...p }))
      .sort((a, b) => b.n - a.n);

    const org: Record<string, number> = {};
    leads.forEach((l) => { const k = l.s || "Por preencher"; org[k] = (org[k] || 0) + 1; });
    const origens = Object.entries(org)
      .map(([nome, n]) => ({ nome, n, pc: Math.round((n / Math.max(leads.length, 1)) * 100) }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 10);

    const processo = comerciais
      .filter((c) => c.n >= 2)
      .map((c) => ({ nome: c.nome, pc: Math.round((c.c / c.n) * 100), com: c.c, total: c.n }))
      .sort((a, b) => b.pc - a.pc);

    const exemplos = gs.filter((g) => !g.p && g.v > 0).sort((a, b) => b.v - a.v).slice(0, 6);

    const ultimoPor: Record<string, string> = {};
    data.G.forEach((g) => { if (!ultimoPor[g.u] || g.d > ultimoPor[g.u]) ultimoPor[g.u] = g.d; });
    const ultimos = Object.entries(ultimoPor)
      .sort((a, b) => b[1].localeCompare(a[1]))
      .map(([nome, d]) => ({
        nome, data: d,
        dias: Math.round((new Date(data.ultimo).getTime() - new Date(d).getTime()) / 86400000),
      }));

    const comPercurso = gs.filter((g) => g.p).length;
    return {
      de, ate, tempo, leads, gs, comerciais, origens, processo, exemplos, ultimos, comPercurso,
      totais: {
        leads: leads.length, contratos: gs.length, valor: soma(valor),
        reunioes: soma(reunioes), propostas: soma(propostas),
        pcPercurso: gs.length ? Math.round((comPercurso / gs.length) * 100) : 0,
      },
    };
  }, [data, intervalo]);

  if (isLoading) {
    return <div className="p-8 text-gray-500">A ler o Odoo...</div>;
  }
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-5">
          <h3 className="font-semibold text-red-800">Não foi possível ler o Odoo</h3>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          <button onClick={() => refetch()} className="mt-3 px-3 py-1.5 text-sm bg-white border border-red-300 rounded hover:bg-red-50">
            Tentar outra vez
          </button>
        </div>
      </div>
    );
  }
  if (!data || !calc) return null;

  const botoes: { id: Preset; label: string }[] = [
    { id: "12m", label: "12 meses" },
    { id: "6m", label: "6 meses" },
    { id: "mes-anterior", label: "Mês anterior" },
    { id: "este-mes", label: "Este mês" },
    { id: "custom", label: "Personalizado" },
  ];

  return (
    <div className="p-6 max-w-[1200px]">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Resultados Comerciais</h1>
        <p className="text-sm text-gray-500">
          De {ptData(calc.de)} a {ptData(calc.ate)} · {num(calc.totais.leads)} leads, {num(calc.totais.contratos)} contratos
          <span className="text-gray-400"> · fonte: Odoo</span>
        </p>
      </div>

      {/* Filtro */}
      <div className="flex flex-wrap gap-2 items-center bg-white border border-gray-200 rounded-lg p-3 mb-5">
        {botoes.map((b) => (
          <button
            key={b.id}
            onClick={() => setPreset(b.id)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              preset === b.id
                ? "bg-[#e85d26] border-[#e85d26] text-white font-medium"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900"
            }`}
          >
            {b.label}
          </button>
        ))}
        {preset === "custom" && (
          <span className="flex items-center gap-2 text-sm text-gray-600">
            <label className="flex items-center gap-1">
              de
              <input type="date" value={custom.de || data.primeiro} min={data.primeiro} max={data.ultimo}
                onChange={(e) => setCustom((c) => ({ ...c, de: e.target.value }))}
                className="border border-gray-200 rounded px-2 py-1 text-sm" />
            </label>
            <label className="flex items-center gap-1">
              até
              <input type="date" value={custom.ate || data.ultimo} min={data.primeiro} max={data.ultimo}
                onChange={(e) => setCustom((c) => ({ ...c, ate: e.target.value }))}
                className="border border-gray-200 rounded px-2 py-1 text-sm" />
            </label>
          </span>
        )}
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="ml-auto text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50"
          title="Vai buscar dados novos ao Odoo"
        >
          {isRefetching ? "a actualizar..." : "↻ actualizar do Odoo"}
        </button>
      </div>

      {/* Números de topo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <Tile n={num(calc.totais.contratos)} l="Contratos fechados" h="negócios distintos" />
        <Tile n={eur(calc.totais.valor)} l="Valor fechado" h="receita esperada" />
        <Tile n={num(calc.totais.leads)} l="Leads criados" h="sem a importação inicial" />
        <Tile n={num(calc.totais.reunioes)} l="Reuniões agendadas" h="passagens pela fase" />
        <Tile n={num(calc.totais.propostas)} l="Propostas enviadas" h="passagens pela fase" />
        <Tile n={calc.totais.pcPercurso + "%"} l="Com percurso registado" h={`${calc.comPercurso} de ${calc.totais.contratos} contratos`} />
      </div>

      {/* Aviso */}
      <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg p-4 mb-5">
        <h3 className="font-semibold text-sm text-gray-900 mb-1.5">O que este painel não diz</h3>
        <p className="text-sm text-gray-700 mb-2">
          Não mostra taxas de conversão entre fases, e isso é de propósito. Dos{" "}
          <b>{calc.totais.contratos} contratos ganhos</b> neste período, só <b>{calc.comPercurso}</b>{" "}
          tinham alguma fase registada antes de serem dados como ganhos. A maioria dos negócios é
          arrastada diretamente para "Ganho" sem registar o percurso, por isso dividir propostas
          por contratos daria uma taxa sem significado.
        </p>
        <p className="text-sm text-gray-700 mb-2">
          Os números desta secção vêm do <b>Odoo</b>. A secção "Actividade" é preenchida à mão
          pelos comerciais — se os dois não baterem certo, é isso que está a acontecer.
        </p>
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-0.5">
          <li><b>{ptData(data.importacao)}</b> — oportunidades criadas em massa nesse dia (importação inicial): sempre excluídas.</li>
          <li><b>{ptData(data.arrumacao)}</b> — movimentos de renovação em massa nesse dia (arrumação): sempre excluídos.</li>
          <li>O último período pode estar incompleto — há dados até {ptData(data.ultimo)}.</li>
        </ul>
      </div>

      <Cartao titulo="Contratos fechados" nota='Entradas na fase "Ganho", a partir do histórico do Odoo.'>
        {calc.totais.contratos === 0 ? <SemDados texto="Nenhum contrato fechado neste período." /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={calc.tempo} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="rotulo" tick={{ fontSize: 11, fill: "#9ca3af" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip formatter={(v: any) => [num(v as number), "Contratos"]} />
              <Bar dataKey="contratos" fill={COR.azul} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="contratos" position="top" style={{ fontSize: 11, fill: "#6b7280" }}
                  formatter={(v: any) => (v > 0 ? v : "")} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Cartao>

      <Cartao titulo="Valor dos contratos fechados" nota="Receita esperada dos negócios ganhos. Preenchida em 96% dos casos.">
        {calc.totais.valor === 0 ? <SemDados texto="Sem valor registado neste período." /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={calc.tempo} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="rotulo" tick={{ fontSize: 11, fill: "#9ca3af" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => Math.round(v / 1000) + "k"} />
              <Tooltip formatter={(v: any) => [eur(v as number), "Valor"]} />
              <Bar dataKey="valor" fill={COR.verde} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="valor" position="top" style={{ fontSize: 11, fill: "#6b7280" }}
                  formatter={(v: any) => (v > 0 ? Math.round(v / 1000) + "k" : "")} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Cartao>

      <Cartao titulo="Atividade comercial registada" nota="Três contagens independentes. Não são fases do mesmo funil — ver aviso acima.">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={calc.tempo} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="rotulo" tick={{ fontSize: 11, fill: "#9ca3af" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="leads" name="Leads criados" stroke={COR.azul} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="reunioes" name="Reuniões agendadas" stroke={COR.laranja} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="propostas" name="Propostas enviadas" stroke={COR.verde} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>

        <details className="mt-3">
          <summary className="text-sm text-gray-500 cursor-pointer">Ver tabela com os números</summary>
          <table className="w-full text-sm mt-2 tabular-nums">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left py-1.5 px-2 border-b border-gray-200">Período</th>
                {["Leads", "Reuniões", "Propostas", "Contratos", "Valor"].map((h) => (
                  <th key={h} className="text-right py-1.5 px-2 border-b border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calc.tempo.map((t) => (
                <tr key={t.k} className="hover:bg-gray-50">
                  <td className="py-1.5 px-2 border-b border-gray-100">{t.rotulo}</td>
                  <td className="text-right py-1.5 px-2 border-b border-gray-100">{num(t.leads)}</td>
                  <td className="text-right py-1.5 px-2 border-b border-gray-100">{num(t.reunioes)}</td>
                  <td className="text-right py-1.5 px-2 border-b border-gray-100">{num(t.propostas)}</td>
                  <td className="text-right py-1.5 px-2 border-b border-gray-100">{num(t.contratos)}</td>
                  <td className="text-right py-1.5 px-2 border-b border-gray-100">{t.valor ? eur(t.valor) : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td className="py-2 px-2">Total</td>
                <td className="text-right py-2 px-2">{num(calc.totais.leads)}</td>
                <td className="text-right py-2 px-2">{num(calc.totais.reunioes)}</td>
                <td className="text-right py-2 px-2">{num(calc.totais.propostas)}</td>
                <td className="text-right py-2 px-2">{num(calc.totais.contratos)}</td>
                <td className="text-right py-2 px-2">{eur(calc.totais.valor)}</td>
              </tr>
            </tfoot>
          </table>
        </details>
      </Cartao>

      <Cartao titulo="Contratos por comercial" nota="Quem fechou negócio no período, e que valor trouxe.">
        {calc.comerciais.length === 0 ? <SemDados texto="Ninguém fechou negócio neste período." /> : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(calc.comerciais.length * 34 + 20, 120)}>
              <BarChart data={calc.comerciais} layout="vertical" margin={{ top: 0, right: 110, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="nome" width={140} tick={{ fontSize: 12, fill: "#4b5563" }} />
                <Tooltip formatter={(v: any, _n: any, p: any) => [`${num(v as number)} contratos · ${eur(p.payload.v)}`, ""]} />
                <Bar dataKey="n" fill={COR.azul} radius={[0, 4, 4, 0]} barSize={18}>
                  <LabelList dataKey="n" position="right" style={{ fontSize: 11, fill: "#6b7280" }}
                    formatter={(v: any) => `${v} contratos`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <details className="mt-2">
              <summary className="text-sm text-gray-500 cursor-pointer">Ver há quanto tempo cada um não fecha nada</summary>
              <table className="w-full text-sm mt-2 tabular-nums">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-gray-500">
                    <th className="text-left py-1.5 px-2 border-b border-gray-200">Comercial</th>
                    <th className="text-right py-1.5 px-2 border-b border-gray-200">Último contrato</th>
                    <th className="text-right py-1.5 px-2 border-b border-gray-200">Há quanto tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.ultimos.map((u) => (
                    <tr key={u.nome} className="hover:bg-gray-50">
                      <td className="py-1.5 px-2 border-b border-gray-100">{u.nome}</td>
                      <td className="text-right py-1.5 px-2 border-b border-gray-100">{ptData(u.data)}</td>
                      <td className={`text-right py-1.5 px-2 border-b border-gray-100 ${u.dias > 90 ? "text-red-600 font-medium" : ""}`}>
                        {u.dias === 0 ? "hoje" : num(u.dias) + " dias"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        )}
      </Cartao>

      <Cartao titulo="Origem dos leads" nota="De onde vieram as oportunidades criadas no período.">
        {calc.origens.length === 0 ? <SemDados texto="Nenhum lead criado neste período." /> : (
          <ResponsiveContainer width="100%" height={Math.max(calc.origens.length * 32 + 20, 120)}>
            <BarChart data={calc.origens} layout="vertical" margin={{ top: 0, right: 90, left: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nome" width={170} tick={{ fontSize: 12, fill: "#4b5563" }} />
              <Tooltip formatter={(v: any) => [num(v as number) + " oportunidades", ""]} />
              <Bar dataKey="n" radius={[0, 4, 4, 0]} barSize={16}>
                {calc.origens.map((o) => (
                  <Cell key={o.nome} fill={o.nome === "Por preencher" ? COR.vermelho : COR.azul} />
                ))}
                <LabelList dataKey="n" position="right" style={{ fontSize: 11, fill: "#6b7280" }}
                  formatter={(v: any) => num(v)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Cartao>

      <Cartao
        titulo="O que está a ser mal feito"
        nota="Isto não é um ranking de desempenho. Mede só se o percurso do negócio ficou registado no Odoo antes de ser dado como ganho."
      >
        {calc.processo.length === 0 ? <SemDados texto="Poucos contratos neste período para comparar." /> : (
          <ResponsiveContainer width="100%" height={Math.max(calc.processo.length * 34 + 20, 120)}>
            <BarChart data={calc.processo} layout="vertical" margin={{ top: 0, right: 130, left: 10, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="nome" width={140} tick={{ fontSize: 12, fill: "#4b5563" }} />
              <Tooltip formatter={(v: any, _n: any, p: any) => [`${p.payload.com} de ${p.payload.total} com percurso registado`, ""]} />
              <Bar dataKey="pc" radius={[0, 4, 4, 0]} barSize={18}>
                {calc.processo.map((p) => (
                  <Cell key={p.nome} fill={p.pc >= 50 ? COR.verde : COR.vermelho} />
                ))}
                <LabelList dataKey="pc" position="right" style={{ fontSize: 11, fill: "#6b7280" }}
                  formatter={(v: any) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {calc.exemplos.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-5">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Exemplos concretos</h4>
            <p className="text-sm text-gray-700 mb-2">
              Contratos de valor alto que entraram em "Ganho" sem uma única fase registada antes:
            </p>
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="text-left py-1.5 px-2 border-b border-amber-200">Cliente</th>
                  <th className="text-right py-1.5 px-2 border-b border-amber-200">Valor</th>
                  <th className="text-right py-1.5 px-2 border-b border-amber-200">Criado</th>
                  <th className="text-right py-1.5 px-2 border-b border-amber-200">Ganho</th>
                  <th className="text-right py-1.5 px-2 border-b border-amber-200">Dias</th>
                </tr>
              </thead>
              <tbody>
                {calc.exemplos.map((g, i) => {
                  const dias = Math.max(0, Math.round((new Date(g.d).getTime() - new Date(g.c).getTime()) / 86400000));
                  return (
                    <tr key={i}>
                      <td className="py-1.5 px-2 border-b border-amber-100">{g.n}</td>
                      <td className="text-right py-1.5 px-2 border-b border-amber-100">{eur(g.v)}</td>
                      <td className="text-right py-1.5 px-2 border-b border-amber-100">{ptData(g.c)}</td>
                      <td className="text-right py-1.5 px-2 border-b border-amber-100">{ptData(g.d)}</td>
                      <td className={`text-right py-1.5 px-2 border-b border-amber-100 ${dias === 0 ? "text-red-600 font-medium" : ""}`}>
                        {dias}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-sm text-gray-700 mt-3">
              Quando um negócio de dezenas de milhares de euros aparece criado e ganho <b>no mesmo dia</b>,
              o que aconteceu foi que só foi lançado no Odoo depois de estar fechado. O CRM está a servir
              de arquivo do que já aconteceu, não de ferramenta de acompanhamento.
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <b>O que mudar:</b> mover o negócio para "Reunião Agendada" quando a reunião é marcada, e para
              "Proposta Enviada" no dia em que a proposta sai. São dois arrastos de rato por negócio.
            </p>
          </div>
        )}
      </Cartao>

      <Cartao titulo="Renovações e upsell" nota="Contados à parte do negócio novo. Quase tudo o que a Team24 vende é contrato recorrente.">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={calc.tempo} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="rotulo" tick={{ fontSize: 11, fill: "#9ca3af" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
            <Tooltip formatter={(v: any) => [num(v as number), "Movimentos"]} />
            <Bar dataKey="renovacoes" fill={COR.laranja} radius={[4, 4, 0, 0]}>
              <LabelList dataKey="renovacoes" position="top" style={{ fontSize: 11, fill: "#6b7280" }}
                formatter={(v: any) => (v > 0 ? v : "")} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Cartao>

      <p className="text-xs text-gray-400 mt-6 leading-relaxed">
        Fonte: Odoo da Team24. As fases são cruzadas pelo número interno e não pelo nome — a fase hoje
        chamada "Won" já se chamou "Ganho", e cruzar por nome perderia 160 contratos. Um negócio que
        volte a "Ganho" depois de renovar conta uma vez só, na data da primeira vitória.
        Os dados são relidos do Odoo a cada 15 minutos.
      </p>
    </div>
  );
}
