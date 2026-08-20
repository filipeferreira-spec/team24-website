import { useState, useCallback, useRef } from "react";
// jsPDF carregado dinamicamente apenas quando o utilizador clica em "Exportar PDF"
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO, { breadcrumbLD, serviceLD } from "@/components/SEO";
import { useIsMobile } from "@/hooks/useMobile";
import { Link } from "wouter";

/* ─────────────────────────────────────────────
   CONSTANTES — estudo ROI TEAM24 2026
   ───────────────────────────────────────────── */
const PRESENTEEISM_FACTOR = 1.5;         // fator conservador OPP / Reino Unido (era 1,8)
const TURNOVER_COST_FACTOR = 0.50;       // custo de substituição = 50% salário (extremo baixo Gallup/SHRM)
const EAP_ADDRESSABLE_FRACTION = 0.45;   // fração do custo ligada ao bem-estar
const EAP_REDUCTION = 0.30;              // redução esperada com EAP (benchmark EAPA 25–45%)
const EAP_COST_PER_EMPLOYEE_YEAR = 100;  // custo EAP TEAM24 por colaborador/ano (€)

/* ─────────────────────────────────────────────
   HERO IMAGE
   ───────────────────────────────────────────── */
const IMG_HERO = "/media/blog-falar-saude-mental-equipa_dd5c6daf_4ff2aa03_6590aa32.webp";

/* ─────────────────────────────────────────────
   TIPOS
   ───────────────────────────────────────────── */
interface Inputs {
  employees: number;
  avgSalary: number;
  absenteeismRate: number; // % (0–30)
  turnoverRate: number;    // % (0–40) — input independente
  companyName: string;
}

interface Results {
  currentAbsenteeismCost: number;
  currentPresenteeismCost: number;
  currentTurnoverCost: number;
  currentTotalCost: number;
  poupanca: number;        // fração endereçável × redução
  eapInvestment: number;
  roiRatio: number;
  paybackMonths: number;
}

/* ─────────────────────────────────────────────
   FUNÇÃO DE CÁLCULO — estudo ROI TEAM24 2026
   ───────────────────────────────────────────── */
function calculate(inputs: Inputs): Results {
  const { employees, avgSalary, absenteeismRate, turnoverRate } = inputs;
  const absenteeismRateFrac = absenteeismRate / 100;
  const turnoverRateFrac = turnoverRate / 100;

  // Absentismo: N × salário × taxa
  const currentAbsenteeismCost = employees * avgSalary * absenteeismRateFrac;

  // Presentismo: 1,5× absentismo (fator conservador OPP / UK)
  const currentPresenteeismCost = PRESENTEEISM_FACTOR * currentAbsenteeismCost;

  // Turnover: independente do absentismo
  // taxa_turnover × N × (50% × salário) — extremo baixo Gallup/SHRM
  const currentTurnoverCost = turnoverRateFrac * employees * (TURNOVER_COST_FACTOR * avgSalary);

  const currentTotalCost = currentAbsenteeismCost + currentPresenteeismCost + currentTurnoverCost;

  // Investimento EAP (valor anual real do contrato)
  const eapInvestment = employees * EAP_COST_PER_EMPLOYEE_YEAR;

  // Poupança honesta: só a fração endereçável, com redução conservadora (~13,5% líquido)
  const poupanca = currentTotalCost * EAP_ADDRESSABLE_FRACTION * EAP_REDUCTION;

  // ROI
  const roiRatio = poupanca / eapInvestment;
  const paybackMonths = 12 / roiRatio;

  return {
    currentAbsenteeismCost,
    currentPresenteeismCost,
    currentTurnoverCost,
    currentTotalCost,
    poupanca,
    eapInvestment,
    roiRatio,
    paybackMonths,
  };
}

/* ─────────────────────────────────────────────
   UTILITÁRIOS
   ───────────────────────────────────────────── */
function fmt(n: number): string {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
function fmtN(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(".", ",");
}
function fmtROI(roi: number): string {
  if (roi > 7) return "Acima de 7×";
  return `${fmtN(roi, 1)}×`;
}

/* ─────────────────────────────────────────────
   COMPONENTE SLIDER
   ───────────────────────────────────────────── */
function SliderInput({
  label, sublabel, value, min, max, step, unit, format,
  onChange,
}: {
  label: string; sublabel?: string; value: number; min: number; max: number; step: number;
  unit?: string; format?: (v: number) => string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <div>
          <span style={{ fontWeight: 600, color: "#0A1A2A", fontSize: "0.95rem" }}>{label}</span>
          {sublabel && <span style={{ fontSize: "0.78rem", color: "#7A9AAA", marginLeft: "0.5rem" }}>{sublabel}</span>}
        </div>
        <span style={{ fontWeight: 700, color: "#DB5C34", fontSize: "1.1rem", fontVariantNumeric: "tabular-nums" }}>
          {format ? format(value) : `${value.toLocaleString("pt-PT")}${unit ? " " + unit : ""}`}
        </span>
      </div>
      <div style={{ position: "relative", height: "6px", borderRadius: "3px", background: "#E2EBF0" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #25749F, #DB5C34)", borderRadius: "3px", transition: "width 0.15s" }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: "-7px", left: 0, width: "100%", height: "20px", opacity: 0, cursor: "pointer", margin: 0 }}
        />
        <div style={{
          position: "absolute", top: "50%", left: `${pct}%`, transform: "translate(-50%, -50%)",
          width: "18px", height: "18px", borderRadius: "50%", background: "#DB5C34",
          border: "3px solid white", boxShadow: "0 2px 6px rgba(219,92,52,0.4)", pointerEvents: "none",
          transition: "left 0.15s",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
        <span style={{ fontSize: "0.72rem", color: "#A0B8C4" }}>{format ? format(min) : `${min.toLocaleString("pt-PT")}${unit ? " " + unit : ""}`}</span>
        <span style={{ fontSize: "0.72rem", color: "#A0B8C4" }}>{format ? format(max) : `${max.toLocaleString("pt-PT")}${unit ? " " + unit : ""}`}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
   ───────────────────────────────────────────── */
export default function ROI() {
  const isMobile = useIsMobile();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [inputs, setInputs] = useState<Inputs>({
    employees: 100,
    avgSalary: 23700,   // INE 2025: €1.694/mês × 14
    absenteeismRate: 4.1, // GEP/MTSSS 2023
    turnoverRate: 15,   // gama típica 12–18%
    companyName: "",
  });

  const [showResults, setShowResults] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const results = calculate(inputs);

  const handleCalculate = useCallback(() => {
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  /* ── PDF via jsPDF ── */
  const handlePDF = useCallback(async () => {
    setPdfLoading(true);
    await new Promise(r => setTimeout(r, 100));
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210;
      const margin = 18;
      const contentW = W - margin * 2;
      let y = 0;

      const addPage = () => { doc.addPage(); y = 20; };
      const checkY = (needed: number) => { if (y + needed > 270) addPage(); };

      // ── Cabeçalho ──
      doc.setFillColor(10, 26, 42);
      doc.rect(0, 0, W, 42, "F");
      doc.setTextColor(219, 92, 52);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("TEAM 24", margin, 18);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.text("Calculadora de ROI do EAP", margin, 27);
      doc.setFontSize(8);
      doc.setTextColor(160, 184, 196);
      const dateStr = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
      doc.text(`Relatório gerado em ${dateStr}`, margin, 35);
      y = 52;

      // ── Nome da empresa ──
      if (inputs.companyName) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(10, 26, 42);
        doc.text(`Relatório para: ${inputs.companyName}`, margin, y);
        y += 10;
      }

      // ── Parâmetros ──
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90, 122, 138);
      doc.text(`${inputs.employees.toLocaleString("pt-PT")} colaboradores  ·  Salário médio ${fmt(inputs.avgSalary)}  ·  Absentismo ${fmtN(inputs.absenteeismRate)}%  ·  Turnover ${fmtN(inputs.turnoverRate)}%`, margin, y);
      y += 12;

      // ── Linha separadora ──
      doc.setDrawColor(226, 235, 240);
      doc.line(margin, y, W - margin, y);
      y += 10;

      // ── Métricas principais ──
      const metrics = [
        { label: "Custo actual total (anual)", value: fmt(results.currentTotalCost), color: [219, 92, 52] as [number,number,number] },
        { label: "Investimento EAP (anual)", value: fmt(results.eapInvestment), color: [37, 116, 159] as [number,number,number] },
        { label: "Poupança anual estimada", value: fmt(results.poupanca), color: [22, 163, 74] as [number,number,number] },
        { label: "ROI do investimento", value: `${fmtROI(results.roiRatio)} (payback em ${fmtN(results.paybackMonths, 1)} meses)`, color: [219, 92, 52] as [number,number,number] },
      ];
      const colW = contentW / 2 - 4;
      metrics.forEach((m, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = margin + col * (colW + 8);
        const by = y + row * 28;
        doc.setFillColor(244, 248, 251);
        doc.roundedRect(bx, by, colW, 24, 2, 2, "F");
        doc.setFillColor(...m.color);
        doc.rect(bx, by, 3, 24, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(122, 154, 170);
        doc.text(m.label, bx + 7, by + 8);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...m.color);
        doc.text(m.value, bx + 7, by + 18);
      });
      y += 64;

      // ── Linha separadora ──
      doc.setDrawColor(226, 235, 240);
      doc.line(margin, y, W - margin, y);
      y += 10;

      // ── Comparação Sem EAP vs Com EAP ──
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 26, 42);
      doc.text("Comparação: Sem EAP vs Com EAP TEAM 24", margin, y);
      y += 8;

      const tableHeaders = ["Componente", "Sem EAP", "Com EAP", "Poupança"];
      const tableRows = [
        ["Absentismo", fmt(results.currentAbsenteeismCost), "", ""],
        [`Presentismo (${PRESENTEEISM_FACTOR}× absentismo)`, fmt(results.currentPresenteeismCost), "", ""],
        ["Turnover (custo subst. 50%)", fmt(results.currentTurnoverCost), "", ""],
        ["CUSTO TOTAL", fmt(results.currentTotalCost), "", ""],
        ["Fração endereçável (45%)", "", fmt(results.currentTotalCost * 0.45), ""],
        ["Redução esperada (30%)", "", "", fmt(results.poupanca)],
        ["Investimento EAP", "", fmt(results.eapInvestment), ""],
        ["ROI", "", "", `${fmtN(results.roiRatio, 1)}×`],
      ];
      const colWidths = [55, 38, 38, 38];
      const colXs = [margin, margin + 55, margin + 93, margin + 131];

      // Header da tabela
      doc.setFillColor(10, 26, 42);
      doc.rect(margin, y, contentW, 8, "F");
      tableHeaders.forEach((h, i) => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(h, colXs[i] + 2, y + 5.5);
      });
      y += 8;

      tableRows.forEach((row, ri) => {
        checkY(8);
        const isTotal = ri === tableRows.length - 1;
        doc.setFillColor(isTotal ? 240 : ri % 2 === 0 ? 250 : 255, isTotal ? 253 : ri % 2 === 0 ? 252 : 255, isTotal ? 244 : ri % 2 === 0 ? 251 : 255);
        doc.rect(margin, y, contentW, 8, "F");
        row.forEach((cell, ci) => {
          doc.setFontSize(ci === 0 ? 8 : 7.5);
          doc.setFont("helvetica", isTotal ? "bold" : "normal");
          doc.setTextColor(ci === 3 ? 22 : 10, ci === 3 ? 163 : 26, ci === 3 ? 74 : 42);
          doc.text(cell, colXs[ci] + 2, y + 5.5);
        });
        y += 8;
      });
      y += 10;

      // ── ROI final ──
      checkY(30);
      doc.setFillColor(10, 26, 42);
      doc.roundedRect(margin, y, contentW, 28, 2, 2, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(160, 184, 196);
      doc.text("ROI do investimento EAP", margin + contentW / 2, y + 8, { align: "center" });
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(219, 92, 52);
      doc.text(`${fmtN(results.roiRatio, 1)}× por cada €1 investido`, margin + contentW / 2, y + 19, { align: "center" });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(160, 184, 196);
      doc.text(`Payback em ${fmtN(results.paybackMonths, 1)} meses  ·  Poupança estimada: ${fmt(results.poupanca)}`, margin + contentW / 2, y + 25, { align: "center" });
      y += 36;

      // ── Fontes ──
      checkY(40);
      doc.setDrawColor(226, 235, 240);
      doc.line(margin, y, W - margin, y);
      y += 6;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 116, 159);
      doc.text("Fontes e Metodologia", margin, y);
      y += 5;
      const sources = [
        "Deloitte (2024). Mental Health and Employers: The case for investment.",
        "EAPA (2023). EAP Value Survey. Employee Assistance Professionals Association.",
        "Ordem dos Psicólogos Portugueses (2014). Relatório do Custo do Stresse e dos Problemas de Saúde Psicológica no Trabalho.",
        "GEP/MTSSS (2023). Estatísticas em Síntese — Absentismo. Gab. de Estratégia e Planeamento.",
        "Gallup (2023). State of the Global Workplace. Gallup Press.",
        "SHRM (2022). The Cost of Turnover. Society for Human Resource Management.",
      ];
      doc.setFont("helvetica", "normal");
      doc.setTextColor(122, 154, 170);
      sources.forEach(s => {
        checkY(5);
        const lines = doc.splitTextToSize(s, contentW);
        doc.text(lines, margin, y);
        y += lines.length * 4 + 1;
      });

      // ── Rodapé ──
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 184, 196);
        doc.text("www.team24.pt  ·  Calculadora de ROI do EAP  ·  Os valores são estimativas baseadas em benchmarks — resultados reais podem variar.", margin, 290);
        doc.text(`${p} / ${totalPages}`, W - margin, 290, { align: "right" });
      }

      const fileName = inputs.companyName
        ? `ROI-EAP-${inputs.companyName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`
        : "ROI-EAP-TEAM24.pdf";
      doc.save(fileName);
    } catch (err) {
      console.error("PDF error:", err);
      window.print();
    } finally {
      setPdfLoading(false);
    }
  }, [inputs, results]);

  const s = {
    section: {
      padding: isMobile ? "3rem 1.5rem" : "5rem clamp(1.5rem, 6vw, 8rem)",
    } as React.CSSProperties,
    maxW: {
      maxWidth: "1200px",
      margin: "0 auto",
    } as React.CSSProperties,
  };

  return (
    <>
      <SEO
        title="Calculadora de ROI do EAP | TEAM 24"
        description="Calcule o retorno do investimento de um EAP na sua empresa. Baseado em dados EAPA e WPAI: cada €1 investido gera €3 a €10 em poupança."
        canonicalPath="/roi"
        jsonLd={[
          serviceLD({ name: "Calculadora ROI EAP", description: "Ferramenta gratuita para calcular o ROI de um Programa de Apoio ao Colaborador.", url: "/roi" }),
          breadcrumbLD([{ name: "Início", path: "/" }, { name: "Calculadora ROI", path: "/roi" }]),
        ]}
      />
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{
          backgroundImage: `linear-gradient(to right, rgba(10,26,42,0.94) 55%, rgba(10,26,42,0.6) 100%), url('${IMG_HERO}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: isMobile ? "120px" : "140px",
          paddingBottom: isMobile ? "60px" : "80px",
          paddingLeft: "clamp(1.5rem, 6vw, 8rem)",
          paddingRight: "clamp(1.5rem, 6vw, 8rem)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ fontSize: "0.78rem", color: "#DB5C34", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>
            Ferramenta Gratuita
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: "1.25rem", maxWidth: "20ch" }}>
            Calculadora de <em style={{ color: "#DB5C34", fontStyle: "italic" }}>ROI do EAP.</em>
          </h1>
          <p style={{ fontSize: isMobile ? "1rem" : "1.1rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.75, marginBottom: "2rem", maxWidth: "54ch" }}>
            Descubra em 30 segundos quanto está a perder em absentismo, presentismo e turnover, e qual o retorno real de investir num Programa de Apoio ao Colaborador.
          </p>
          {/* Badges de credibilidade */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {["Estudo ROI TEAM24 2026", "Metodologia conservadora", "Benchmark Deloitte: 4–6× por €1"].map(b => (
              <span key={b} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", fontSize: "0.78rem", padding: "0.35rem 0.85rem", borderRadius: "2px", fontWeight: 500 }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calculadora ── */}
      <section style={{ ...s.section, background: "#F4F8FB" }}>
        <div style={{ ...s.maxW }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "2rem" : "4rem",
            alignItems: "start",
          }}>
            {/* ── Coluna esquerda: inputs ── */}
            <div>
              <div style={{ fontSize: "0.78rem", color: "#DB5C34", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Dados da sua empresa
              </div>
              <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "0.75rem", lineHeight: 1.2 }}>
                Insira os dados<br />
                <em style={{ color: "#25749F" }}>para calcular o ROI.</em>
              </h2>
              <p style={{ color: "#5A7A8A", lineHeight: 1.7, marginBottom: "2.5rem", fontSize: "0.9rem" }}>
                Os valores são estimativas baseadas em benchmarks nacionais e internacionais. Pode ajustar todos os parâmetros.
              </p>

              {/* Nome da empresa (opcional) */}
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", fontWeight: 600, color: "#0A1A2A", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                  Nome da empresa <span style={{ color: "#A0B8C4", fontWeight: 400 }}>(opcional, para o PDF)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Empresa XYZ, Lda."
                  value={inputs.companyName}
                  onChange={e => setInputs(p => ({ ...p, companyName: e.target.value }))}
                  style={{
                    width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #D0E0EA",
                    borderRadius: "2px", fontSize: "0.95rem", color: "#0A1A2A",
                    background: "white", outline: "none", boxSizing: "border-box",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#25749F")}
                  onBlur={e => (e.target.style.borderColor = "#D0E0EA")}
                />
              </div>

              <SliderInput
                label="Número de colaboradores"
                value={inputs.employees}
                min={10} max={2000} step={10}
                onChange={v => setInputs(p => ({ ...p, employees: v }))}
              />
              <SliderInput
                label="Salário médio anual bruto"
                sublabel="por colaborador"
                value={inputs.avgSalary}
                min={14000} max={80000} step={500}
                format={v => fmt(v)}
                onChange={v => setInputs(p => ({ ...p, avgSalary: v }))}
              />
              <SliderInput
                label="Taxa de absentismo estimada"
                sublabel="média nacional: 4,1% (GEP/MTSSS 2023)"
                value={inputs.absenteeismRate}
                min={1} max={20} step={0.1}
                unit="%"
                format={v => `${fmtN(v)}%`}
                onChange={v => setInputs(p => ({ ...p, absenteeismRate: v }))}
              />
              <SliderInput
                label="Taxa de turnover"
                sublabel="gama típica: 12–18%"
                value={inputs.turnoverRate}
                min={1} max={40} step={0.5}
                unit="%"
                format={v => `${fmtN(v)}%`}
                onChange={v => setInputs(p => ({ ...p, turnoverRate: v }))}
              />

              <button
                onClick={handleCalculate}
                style={{
                  width: "100%", background: "#DB5C34", color: "white", border: "none",
                  padding: "1rem 2rem", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", borderRadius: "2px",
                  transition: "background 0.15s, transform 0.1s",
                  marginTop: "0.5rem",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#B84520")}
                onMouseLeave={e => (e.currentTarget.style.background = "#DB5C34")}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                Calcular ROI
              </button>

              {/* Nota metodológica */}
              <p style={{ fontSize: "0.75rem", color: "#A0B8C4", marginTop: "1rem", lineHeight: 1.6 }}>
                Cálculo baseado em: Deloitte (2024) <em>Mental Health and Employers</em>; EAPA (2023) <em>EAP Value Survey</em>; OPP (2014); GEP/MTSSS (2023); Gallup/SHRM — custo de substituição.
              </p>
            </div>

            {/* ── Coluna direita: pré-visualização dinâmica ── */}
            <div>
              <div style={{
                background: "white", border: "1px solid #E2EBF0", borderRadius: "4px",
                padding: isMobile ? "1.5rem" : "2rem", position: "sticky", top: "100px",
              }}>
                <div style={{ fontSize: "0.78rem", color: "#25749F", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                  Estimativa em tempo real
                </div>

                {/* Custo actual */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.82rem", color: "#7A9AAA", marginBottom: "0.35rem" }}>Custo actual estimado (anual)</div>
                  <div style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#0A1A2A", lineHeight: 1 }}>
                    {fmt(results.currentTotalCost)}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#A0B8C4", marginTop: "0.35rem" }}>
                    absentismo + presentismo + turnover
                  </div>
                </div>

                <div style={{ height: "1px", background: "#E2EBF0", margin: "1.25rem 0" }} />

                {/* Decomposição */}
                {[
                  { label: "Absentismo", value: results.currentAbsenteeismCost, color: "#DB5C34" },
                  { label: "Presentismo", value: results.currentPresenteeismCost, color: "#E8A87C" },
                  { label: "Turnover", value: results.currentTurnoverCost, color: "#25749F" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.85rem", color: "#5A7A8A" }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0A1A2A" }}>{fmt(item.value)}</span>
                  </div>
                ))}

                <div style={{ height: "1px", background: "#E2EBF0", margin: "1.25rem 0" }} />

                {/* ROI estimado */}
                <div style={{ background: "linear-gradient(135deg, #0A1A2A, #1A3A5A)", borderRadius: "4px", padding: "1.25rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.35rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    ROI estimado do EAP
                  </div>
                  <div style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#DB5C34", lineHeight: 1 }}>
                    {fmtN(results.roiRatio, 1)}×
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", marginTop: "0.35rem" }}>
                    por cada €1 investido
                  </div>
                  <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>
                    Payback em {fmtN(results.paybackMonths, 1)} meses
                  </div>
                  <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    redução 30% · custo substituição 50% · fração endereçável 45%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Resultados detalhados (aparece após clicar Calcular) ── */}
      {showResults && (
        <section ref={resultsRef} style={{ ...s.section, background: "white" }} id="resultados">
          <div style={{ ...s.maxW }}>
            {/* Cabeçalho dos resultados */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "3rem" }}>
              <div>
                <div style={{ fontSize: "0.78rem", color: "#DB5C34", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Análise completa
                </div>
                <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", margin: 0, lineHeight: 1.15 }}>
                  {inputs.companyName ? `Relatório ROI: ${inputs.companyName}` : "Relatório ROI da sua empresa"}
                </h2>
                <p style={{ color: "#5A7A8A", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                  {inputs.employees.toLocaleString("pt-PT")} colaboradores | Salário médio {fmt(inputs.avgSalary)} | Absentismo {fmtN(inputs.absenteeismRate)}%
                </p>
              </div>
              <button
                onClick={handlePDF}
                disabled={pdfLoading}
                style={{
                  background: "#0A1A2A", color: "white", border: "none",
                  padding: "0.75rem 1.5rem", fontWeight: 600, fontSize: "0.9rem",
                  cursor: pdfLoading ? "wait" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  borderRadius: "2px", display: "flex", alignItems: "center", gap: "0.5rem",
                  opacity: pdfLoading ? 0.7 : 1, transition: "opacity 0.15s",
                  flexShrink: 0,
                }}
              >
                {pdfLoading ? "A gerar..." : "Exportar PDF"}
              </button>
            </div>

            {/* Grid de métricas principais */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: "1rem",
              marginBottom: "3rem",
            }}>
              {[
                { label: "Custo actual total", value: fmt(results.currentTotalCost), sub: "absentismo + presentismo + turnover", color: "#DB5C34" },
                { label: "Investimento EAP", value: fmt(results.eapInvestment), sub: `${fmt(EAP_COST_PER_EMPLOYEE_YEAR)}/colaborador/ano`, color: "#25749F" },
                { label: "Poupança anual estimada", value: fmt(results.poupanca), sub: "fração endereçável × redução esperada", color: "#16A34A" },
                { label: "ROI do EAP", value: `${fmtN(results.roiRatio, 1)}×`, sub: `payback em ${fmtN(results.paybackMonths, 1)} meses`, color: "#DB5C34" },
              ].map(m => (
                <div key={m.label} style={{
                  background: "#F4F8FB", borderRadius: "4px", padding: "1.5rem",
                  borderTop: `3px solid ${m.color}`,
                }}>
                  <div style={{ fontSize: "0.78rem", color: "#7A9AAA", marginBottom: "0.25rem", fontWeight: 500 }}>{m.label}</div>
                  <div style={{ fontSize: isMobile ? "1.3rem" : "1.6rem", fontWeight: 800, color: m.color, lineHeight: 1, marginBottom: "0.35rem" }}>{m.value}</div>
                  <div style={{ fontSize: "0.72rem", color: "#A0B8C4" }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Comparação Antes vs Depois */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "1.5rem",
              marginBottom: "3rem",
            }}>
              {/* Decomposição de custos */}
              <div style={{ background: "#FFF5F2", border: "1px solid #FDDDD4", borderRadius: "4px", padding: "2rem" }}>
                <div style={{ fontSize: "0.78rem", color: "#DB5C34", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem" }}>
                  Custo actual estimado
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#DB5C34", marginBottom: "1.5rem" }}>
                  {fmt(results.currentTotalCost)}
                </div>
                {[
                  { label: "Absentismo", value: results.currentAbsenteeismCost },
                  { label: `Presentismo (${PRESENTEEISM_FACTOR}× absentismo)`, value: results.currentPresenteeismCost },
                  { label: `Turnover (custo substituição 50% salário)`, value: results.currentTurnoverCost },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid #FDDDD4" }}>
                    <span style={{ fontSize: "0.88rem", color: "#5A7A8A" }}>{r.label}</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0A1A2A" }}>{fmt(r.value)}</span>
                  </div>
                ))}
              </div>

              {/* Poupança com EAP */}
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "4px", padding: "2rem" }}>
                <div style={{ fontSize: "0.78rem", color: "#16A34A", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem" }}>
                  Poupança estimada com EAP TEAM 24
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#16A34A", marginBottom: "1.5rem" }}>
                  {fmt(results.poupanca)}
                </div>
                {[
                  { label: "Custo total endereçável (45%)", value: results.currentTotalCost * EAP_ADDRESSABLE_FRACTION },
                  { label: "Redução esperada com EAP (30%)", value: results.poupanca },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid #BBF7D0" }}>
                    <span style={{ fontSize: "0.88rem", color: "#5A7A8A" }}>{r.label}</span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0A1A2A" }}>{fmt(r.value)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid #BBF7D0" }}>
                  <span style={{ fontSize: "0.88rem", color: "#5A7A8A" }}>Investimento EAP anual</span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#DB5C34" }}>−{fmt(results.eapInvestment)}</span>
                </div>
                <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(22,163,74,0.08)", borderRadius: "3px", fontSize: "0.75rem", color: "#5A7A8A", lineHeight: 1.5 }}>
                  Pressupostos: redução 30% · custo substituição 50% · fração endereçável 45%
                </div>
              </div>
            </div>

            {/* Barra de ROI visual */}
            <div style={{ background: "#0A1A2A", borderRadius: "4px", padding: isMobile ? "2rem 1.5rem" : "2.5rem 3rem", marginBottom: "3rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "2rem", textAlign: "center" }}>
                {[
                  { label: "ROI do investimento", value: fmtROI(results.roiRatio), sub: "retorno por €1 investido", highlight: true },
                  { label: "Poupança anual estimada", value: fmt(results.poupanca), sub: "fração endereçável × redução esperada" },
                  { label: "Payback do investimento", value: `${fmtN(results.paybackMonths, 1)} meses`, sub: "tempo de recuperação" },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{m.label}</div>
                    <div style={{ fontSize: isMobile ? "2rem" : "2.5rem", fontWeight: 800, color: m.highlight ? "#DB5C34" : "white", lineHeight: 1 }}>{m.value}</div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginTop: "0.35rem" }}>{m.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", margin: 0, lineHeight: 1.6 }}>
                  Benchmark empregador: 4–6× por €1 (Deloitte, 2024). Pressupostos: fração endereçável 45% · redução esperada 30% · custo de substituição 50% (Gallup/SHRM). Os resultados reais podem variar.
                </p>
              </div>
            </div>

            {/* CTA-placeholder para separar do bloco de resultados */}
            {/* (Metodologia movida para baixo, sempre visível) */}
            <div style={{ background: "#F4F8FB", borderRadius: "4px", padding: "2rem", marginBottom: "3rem", display: "none" }}>
              <div style={{ fontSize: "0.78rem", color: "#25749F", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                Metodologia e Fontes dos Cálculos
              </div>
              <p style={{ fontSize: "0.85rem", color: "#5A7A8A", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Cada parâmetro utilizado nesta calculadora tem origem em estudos académicos peer-reviewed ou em relatórios de entidades de referência. Abaixo detalhamos a fonte de cada variável.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  {
                    param: "ROI de €3 a €10 por cada €1 investido",
                    detail: "Baseado em mais de 4.100 cálculos reais de empresas britânicas com 11 milhões de colaboradores. O ROI médio em 2022 foi de £10,85 por £1 investido, acima dos £8,00 do ano anterior.",
                    source: "EAPA UK (2023). Financial Return on EAPs 2023. Employee Assistance Professionals Association.",
                    url: "https://www.eapa.org.uk/wp-content/uploads/2023/03/EAPA-ROI-Report-2023.pdf"
                  },
                  {
                    param: "Redução de 35% no absentismo com EAP",
                    detail: "Estudos longitudinais em empresas com EAP ativo mostram reduções de 25% a 45% no absentismo por razões de saúde mental. Usamos 35% como valor conservador intermediário.",
                    source: "EAPA (2023). EAP Value Survey; Attridge & Pawlowski (2025). ROI for EAP: outcomes from 166,116 cases.",
                    url: "https://eapassn.org/page/research"
                  },
                  {
                    param: "Presentismo custa 1,8× mais que absentismo",
                    detail: "Em Portugal, o absentismo por stresse custou €1,8 mil milhões e o presentismo €3,5 mil milhões em 2022, um rácio de 1,94×. Usamos 1,8× como valor conservador.",
                    source: "Ordem dos Psicólogos Portugueses (2023). Relatório do Custo do Stresse e dos Problemas de Saúde Psicológica no Trabalho em Portugal.",
                    url: "https://www.ordemdospsicologos.pt/pt/noticia/4466"
                  },
                  {
                    param: "Taxa de absentismo nacional: 4,1% (2023)",
                    detail: "A taxa média de absentismo em Portugal em 2023 foi de 4,1%, com impacto estimado de 2,5 mil milhões de euros anuais. A média europeia situa-se entre 8 a 9 dias perdidos por trabalhador.",
                    source: "PORDATA / OCDE (2023), citados em RH Magazine (2025). Absentismo em Portugal: 11 dias, 2,5 mil milhões.",
                    url: "https://rhmagazine.pt/absentismo-em-portugal-o-custo-invisivel-das-emocoes-nao-geridas/"
                  },
                  {
                    param: "Custo de substituição: 75% do salário anual",
                    detail: "Inclui recrutamento, formação, perda de produtividade durante a integração e transferência de conhecimento. Para funções técnicas e de gestão o custo pode atingir 150-200%.",
                    source: "SHRM (2022). The Cost of Turnover. Society for Human Resource Management.",
                    url: "https://www.shrm.org"
                  },
                  {
                    param: "Custo EAP: €100 a €180/colaborador/ano",
                    detail: "Benchmark para Portugal e mercados do Sul da Europa. O valor inclui acesso a psicologia, apoio jurídico, financeiro, nutrição e social. Nos EUA o custo médio situa-se entre $10 e $50/colaborador/ano (EAPA).",
                    source: "Kotola (2024). Mental Health in the Workplace: A cost-benefit analysis. EAPA benchmark data.",
                    url: "https://eapassn.org/page/research"
                  },
                ].map((item, i) => (
                  <div key={i} style={{ background: "white", border: "1px solid #D0E0EA", borderRadius: "4px", padding: "1.25rem" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "0.5rem" }}>{item.param}</div>
                    <div style={{ fontSize: "0.78rem", color: "#5A7A8A", lineHeight: 1.6, marginBottom: "0.75rem" }}>{item.detail}</div>
                    <div style={{ fontSize: "0.7rem", color: "#A0B8C4", lineHeight: 1.4, paddingLeft: "0.75rem", borderLeft: "2px solid #D0E0EA" }}>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#25749F", textDecoration: "none" }}>{item.source}</a>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#A0B8C4", lineHeight: 1.6, paddingTop: "1rem", borderTop: "1px solid #D0E0EA" }}>
                Os valores apresentados são estimativas baseadas em benchmarks nacionais e internacionais. Os resultados reais dependem do setor, dimensão da empresa, taxa de utilização do EAP e contexto organizacional. Esta calculadora não substitui uma análise personalizada.
              </div>
            </div>

            {/* CTA */}
            <div style={{ background: "linear-gradient(135deg, #DB5C34, #B84520)", borderRadius: "4px", padding: isMobile ? "2rem 1.5rem" : "3rem", textAlign: "center" }}>
              <h3 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 700, color: "white", marginBottom: "0.75rem" }}>
                Quer um relatório personalizado para a sua empresa?
              </h3>
              <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "1.75rem", maxWidth: "50ch", margin: "0 auto 1.75rem" }}>
                A nossa equipa prepara uma análise detalhada com dados específicos do seu setor e dimensão, sem qualquer compromisso.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/contacto">
                  <button style={{
                    background: "white", color: "#DB5C34", border: "none",
                    padding: "0.9rem 2rem", fontWeight: 700, fontSize: "0.95rem",
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", borderRadius: "2px",
                  }}>
                    Falar com a equipa
                  </button>
                </Link>
                <button
                  onClick={handlePDF}
                  style={{
                    background: "transparent", color: "white", border: "2px solid rgba(255,255,255,0.5)",
                    padding: "0.9rem 2rem", fontWeight: 600, fontSize: "0.95rem",
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", borderRadius: "2px",
                  }}
                >
                  Guardar como PDF
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Metodologia e Fontes (sempre visível) ── */}
      <section style={{ ...s.section, background: "#F4F8FB" }}>
        <div style={{ ...s.maxW }}>
          <div style={{ fontSize: "0.78rem", color: "#25749F", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Metodologia e Fontes dos Cálculos
          </div>
          <h2 style={{ fontSize: "clamp(1.6rem, 2.5vw, 2rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1rem", lineHeight: 1.2 }}>
            De onde vêm <em style={{ color: "#25749F" }}>os números?</em>
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#5A7A8A", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "70ch" }}>
            Cada parâmetro utilizado nesta calculadora tem origem em estudos académicos peer-reviewed ou em relatórios de entidades de referência. Abaixo detalhamos a fonte de cada variável.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
              {
                param: "Benchmark empregador: 4–6× por €1 investido",
                detail: "Análise de programas de saúde mental em empregadores britânicos e europeus. O retorno médio situa-se entre 4× e 6× por cada euro investido, na perspetiva do empregador. Usamos este intervalo como referência defensável perante um Diretor Financeiro.",
                source: "Deloitte (2024). Mental Health and Employers: The case for investment.",
                url: "https://www2.deloitte.com/uk/en/pages/consulting/articles/mental-health-and-employers.html"
              },
              {
                param: "Fator de presentismo: 1,5× absentismo",
                detail: "Em Portugal, o absentismo por stresse custou €1,8 mil milhões e o presentismo €3,5 mil milhões em 2022. Usamos 1,5× como âncora conservadora, alinhada com os benchmarks do Reino Unido e da Ordem dos Psicólogos Portugueses.",
                source: "Ordem dos Psicólogos Portugueses (2014). Relatório do Custo do Stresse e dos Problemas de Saúde Psicológica no Trabalho em Portugal.",
                url: "https://www.ordemdospsicologos.pt/pt/noticia/4466"
              },
              {
                param: "Taxa de absentismo nacional: 4,1% (GEP/MTSSS 2023)",
                detail: "A taxa média de absentismo em Portugal em 2023 foi de 4,1%, segundo o Gabinete de Estratégia e Planeamento do Ministério do Trabalho. Usamos este valor como default em substituição de estimativas menos rigorosas.",
                source: "GEP/MTSSS (2023). Estatísticas em Síntese — Absentismo.",
                url: "https://www.gep.msess.gov.pt"
              },
              {
                param: "Custo de substituição: 50% do salário anual",
                detail: "Extremo baixo do intervalo Gallup/SHRM (50–200%). Inclui recrutamento, formação e perda de produtividade durante a integração. Usamos 50% para manter a estimativa conservadora e defensável.",
                source: "Gallup (2023). State of the Global Workplace; SHRM (2022). The Cost of Turnover.",
                url: "https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx"
              },
              {
                param: "Fração endereçável pelo EAP: 45%",
                detail: "Nem todo o absentismo, presentismo ou turnover tem origem em fatores de bem-estar. Estimamos que 45% do custo total é endereçável por um programa EAP — os restantes 55% têm causas externas.",
                source: "EAPA (2023). EAP Value Survey; Attridge & Pawlowski (2025). ROI for EAP: outcomes from 166,116 cases.",
                url: "https://eapassn.org/page/research"
              },
              {
                param: "Custo EAP: €100 a €180/colaborador/ano",
                detail: "Benchmark para Portugal e mercados do Sul da Europa. O valor inclui acesso a psicologia, apoio jurídico, financeiro, nutrição e social. Nos EUA o custo médio situa-se entre $10 e $50/colaborador/ano (EAPA).",
                source: "EAPA (2023). EAP Value Survey. Employee Assistance Professionals Association.",
                url: "https://eapassn.org/page/research"
              },
            ].map((item, i) => (
              <div key={i} style={{ background: "white", border: "1px solid #D0E0EA", borderRadius: "4px", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0A1A2A", marginBottom: "0.5rem" }}>{item.param}</div>
                <div style={{ fontSize: "0.78rem", color: "#5A7A8A", lineHeight: 1.6, marginBottom: "0.75rem" }}>{item.detail}</div>
                <div style={{ fontSize: "0.7rem", color: "#A0B8C4", lineHeight: 1.4, paddingLeft: "0.75rem", borderLeft: "2px solid #D0E0EA" }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#25749F", textDecoration: "none" }}>{item.source}</a>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#A0B8C4", lineHeight: 1.6, paddingTop: "1rem", borderTop: "1px solid #D0E0EA" }}>
            Os valores apresentados são estimativas baseadas em benchmarks nacionais e internacionais. Os resultados reais dependem do setor, dimensão da empresa, taxa de utilização do EAP e contexto organizacional. Esta calculadora não substitui uma análise personalizada.
          </div>
        </div>
      </section>
      {/* ── Contexto / Porquê esta calculadora ── */}
      <section style={{ ...s.section, background: showResults ? "#F4F8FB" : "white" }}>
        <div style={{ ...s.maxW }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "2.5rem" : "5rem",
            alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: "0.78rem", color: "#DB5C34", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Porquê medir o ROI?
              </div>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0A1A2A", marginBottom: "1.5rem", lineHeight: 1.15 }}>
                Os números que os<br />
                <em style={{ color: "#25749F" }}>DRH precisam de ver.</em>
              </h2>
              <p style={{ color: "#5A7A8A", lineHeight: 1.8, marginBottom: "1.25rem" }}>
                A decisão de implementar um EAP é frequentemente bloqueada por falta de dados concretos. Esta calculadora usa a metodologia WPAI, o instrumento de medição de produtividade mais validado internacionalmente, e os benchmarks da EAPA para transformar o argumento de saúde mental num argumento financeiro.
              </p>
              <p style={{ color: "#5A7A8A", lineHeight: 1.8 }}>
                O ROI médio comprovado de 3 a 10 euros por cada euro investido (EAPA, 2023) não é uma promessa de marketing. É o resultado de décadas de estudos longitudinais em empresas de todos os setores e dimensões.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { value: "4–6×", label: "ROI por €1 investido (benchmark empregador)", source: "Deloitte 2024" },
                { value: "30%", label: "redução esperada com EAP", source: "EAPA 2023" },
                { value: "1,5×", label: "presentismo vs absentismo", source: "OPP 2014 / UK" },
                { value: "50%", label: "custo de substituição de um colaborador", source: "Gallup/SHRM" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "white", border: "1px solid #E2EBF0", borderRadius: "4px", padding: "1.25rem" }}>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#DB5C34", lineHeight: 1, marginBottom: "0.35rem" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.8rem", color: "#0A1A2A", fontWeight: 600, marginBottom: "0.25rem", lineHeight: 1.3 }}>{stat.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "#A0B8C4" }}>{stat.source}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          nav, footer, button, .no-print { display: none !important; }
          section { break-inside: avoid; }
          body { font-size: 12px; }
        }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; }
        input[type=range]::-moz-range-thumb { border: none; }
      `}</style>

      <Footer />
    </>
  );
}
