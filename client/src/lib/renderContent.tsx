/* ============================================================
   TEAM 24 — Renderizador de conteúdo partilhado
   Usado em BlogPost e OpiniaoPost para garantir formatação
   idêntica em todos os artigos do site.
   ============================================================ */
import React from "react";

export function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink);font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export function renderContent(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const bodyStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.92rem",
    lineHeight: 1.75,
    color: "var(--stone)",
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginTop: "3rem",
            marginBottom: "1rem",
          }}
        >
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--ink)",
            marginTop: "2rem",
            marginBottom: "0.75rem",
          }}
        >
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("| ")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const headers = tableLines[0].split("|").filter((c) => c.trim()).map((c) => c.trim());
      const rows = tableLines.slice(2).map((row) =>
        row.split("|").filter((c) => c.trim()).map((c) => c.trim())
      );
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: "auto", margin: "2rem 0", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", minWidth: "480px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--ink)" }}>
                {headers.map((h, hi) => (
                  <th
                    key={hi}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--ink)",
                      padding: "0.75rem 1rem 0.75rem 0",
                      textAlign: "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid var(--pale-mid)" }}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.9rem",
                        color: "var(--stone)",
                        padding: "0.75rem 1rem 0.75rem 0",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.match(/^\d+\. /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: "1.5rem 0", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {listItems.map((item, li) => (
            <li
              key={li}
              style={{ ...bodyStyle, listStyleType: "decimal" }}
              dangerouslySetInnerHTML={{ __html: formatInline(item) }}
            />
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith("- ")) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].replace("- ", ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "1.5rem 0", paddingLeft: "0", display: "flex", flexDirection: "column", gap: "0.5rem", listStyle: "none" }}>
          {listItems.map((item, li) => (
            <li
              key={li}
              style={{ ...bodyStyle, display: "flex", gap: "0.75rem", alignItems: "flex-start" }}
            >
              <span style={{ display: "inline-block", width: "1.25rem", height: "2px", backgroundColor: "var(--coral)", marginTop: "0.75rem", flexShrink: 0 }} />
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.startsWith("*") && line.endsWith("*") && line.length > 2) {
      elements.push(
        <blockquote
          key={i}
          style={{
            fontFamily: "'Lato', sans-serif",
            fontStyle: "italic",
            fontSize: "1.15rem",
            lineHeight: 1.6,
            color: "var(--ink)",
            borderLeft: "2px solid var(--coral)",
            paddingLeft: "1.5rem",
            margin: "2rem 0",
          }}
          dangerouslySetInnerHTML={{ __html: formatInline(line.slice(1, -1)) }}
        />
      );
    } else if (line.trim() !== "") {
      elements.push(
        <p
          key={i}
          style={{ ...bodyStyle, margin: "1rem 0" }}
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }
    i++;
  }

  return elements;
}
