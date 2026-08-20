/**
 * Serve as paginas pre-geradas (ver scripts/prerender.mjs).
 *
 * Guardamos apenas o interior do <div id="root">. O modelo vem SEMPRE do
 * index.html do build actual, por isso os enderecos dos ficheiros JavaScript
 * estao sempre correctos, mesmo depois de reconstruir o site.
 *
 * Cuidado: o cliente tem de limpar o contentor antes de montar (ver main.tsx).
 * Hidratar por cima disto da sempre "Hydration failed", porque este HTML vem de
 * um browser que ja executou tudo e nunca coincide com o primeiro desenho do React.
 */
import type { Express, Request, Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";

type Entrada = {
  ficheiro: string;
  titulo: string;
  descricao: string;
};

const PASTA = path.resolve(process.cwd(), "prerendered");

function escaparHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function registerPrerendered(app: Express, indexHtmlPath: string) {
  const manifestoPath = path.join(PASTA, "manifesto.json");
  if (!fs.existsSync(manifestoPath) || !fs.existsSync(indexHtmlPath)) {
    console.log("[Pre-geracao] sem paginas pre-geradas; a servir a SPA normal");
    return;
  }

  const manifesto: Record<string, Entrada> = JSON.parse(fs.readFileSync(manifestoPath, "utf8"));
  const modelo = fs.readFileSync(indexHtmlPath, "utf8");
  const MARCA = '<div id="root"></div>';

  if (!modelo.includes(MARCA)) {
    console.log("[Pre-geracao] o index.html do build nao tem o marcador do root; desactivada");
    return;
  }

  const cache = new Map<string, string>();
  console.log(`[Pre-geracao] ${Object.keys(manifesto).length} paginas disponiveis`);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (!(req.headers.accept || "").includes("text/html")) return next();

    const rota = req.path.replace(/\/+$/, "") || "/";
    const entrada = manifesto[rota];
    if (!entrada) return next();

    try {
      let pagina = cache.get(rota);
      if (!pagina) {
        const fragmento = gunzipSync(fs.readFileSync(path.join(PASTA, entrada.ficheiro))).toString("utf8");
        pagina = modelo.replace(MARCA, `<div id="root">${fragmento}</div>`);

        // Titulo e descricao proprios de cada pagina (o modelo tem os genericos)
        if (entrada.titulo) {
          pagina = pagina.replace(/<title>[\s\S]*?<\/title>/, `<title>${escaparHtml(entrada.titulo)}</title>`);
        }
        if (entrada.descricao) {
          pagina = pagina.replace(
            /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
            `<meta name="description" content="${escaparHtml(entrada.descricao)}" />`
          );
        }
        cache.set(rota, pagina);
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Prerendered", "1");
      return res.send(pagina);
    } catch (e) {
      console.warn("[Pre-geracao] falhou para", rota, e);
      return next();
    }
  });
}
