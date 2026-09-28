import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, isStatus, type TicketPatch, type TicketStore } from "./types.js";
import type { WebKeys } from "./webKeys.js";

const WEB_DIR = new URL("../web/", import.meta.url);

const HTML = "text/html; charset=utf-8";
const JS = "text/javascript; charset=utf-8";
const CSS = "text/css; charset=utf-8";

const ASSETS: Record<string, { file: string; type: string }> = {
  "/": { file: "landing.html", type: HTML },
  "/landing.js": { file: "landing.js", type: JS },
  "/landing.css": { file: "landing.css", type: CSS },
  "/board": { file: "board.html", type: HTML },
  "/app.js": { file: "app.js", type: JS },
  "/style.css": { file: "style.css", type: CSS },
  "/favicon.svg": { file: "favicon.svg", type: "image/svg+xml" },
  "/pattern.svg": { file: "pattern.svg", type: "image/svg+xml" },
  "/og.png": { file: "og.png", type: "image/png" },
  "/kanbot.vcf": { file: "kanbot.vcf", type: "text/vcard; charset=utf-8" },
};

const MAX_BODY_BYTES = 64 * 1024;

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Tablero web: la página estática y una API JSON autenticada con la clave del chat
 * (header `Authorization: Bearer <clave>`).
 */
export function createWebServer({ store, keys }: { store: TicketStore; keys: WebKeys }): Server {
  async function route(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");

    const asset = ASSETS[url.pathname];
    if (asset && req.method === "GET") {
      res.writeHead(200, { "Content-Type": asset.type, "Cache-Control": "no-cache" });
      res.end(await readFile(new URL(asset.file, WEB_DIR)));
      return;
    }
    if (!url.pathname.startsWith("/api/")) throw new HttpError(404, "No encontrado");

    const key = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    const entry = await keys.resolve(key);
    if (!entry) throw new HttpError(401, "Clave inválida");
    const { boardId } = entry;

    if (url.pathname === "/api/board" && req.method === "GET") {
      return json(res, 200, { name: entry.name, tickets: await store.list(boardId) });
    }

    if (url.pathname === "/api/tickets" && req.method === "POST") {
      const fields = parseFields(await readBody(req));
      if (!fields.title) throw new HttpError(400, "Falta el título");
      const ticket = await store.add(boardId, { ...fields, title: fields.title, createdBy: "Web" });
      return json(res, 201, ticket);
    }

    const match = url.pathname.match(/^\/api\/tickets\/(\d+)$/);
    if (match) {
      const number = Number(match[1]);
      if (req.method === "PATCH") {
        const ticket = await store.update(boardId, number, parseFields(await readBody(req)));
        if (!ticket) throw new HttpError(404, `El ticket #${number} no existe`);
        return json(res, 200, ticket);
      }
      if (req.method === "DELETE") {
        if (!(await store.remove(boardId, number))) throw new HttpError(404, `El ticket #${number} no existe`);
        res.writeHead(204).end();
        return;
      }
    }

    throw new HttpError(404, "No encontrado");
  }

  return createServer((req, res) => {
    setSecurityHeaders(res);
    route(req, res).catch((err) => {
      if (!(err instanceof HttpError)) console.error("Error en la web", err);
      if (res.headersSent) return void res.end();
      const status = err instanceof HttpError ? err.status : 500;
      json(res, status, { error: err instanceof HttpError ? err.message : "Error interno" });
    });
  });
}

function parseFields(body: unknown): TicketPatch {
  if (typeof body !== "object" || body === null) throw new HttpError(400, "JSON inválido");
  const { title, description, status } = body as Record<string, unknown>;
  const fields: TicketPatch = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) throw new HttpError(400, "El título no puede estar vacío");
    if (title.trim().length > MAX_TITLE_LENGTH) throw new HttpError(400, `Título muy largo (máx ${MAX_TITLE_LENGTH})`);
    fields.title = title.trim();
  }
  if (description !== undefined) {
    if (typeof description !== "string") throw new HttpError(400, "Descripción inválida");
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      throw new HttpError(400, `Descripción muy larga (máx ${MAX_DESCRIPTION_LENGTH})`);
    }
    fields.description = description;
  }
  if (status !== undefined) {
    if (!isStatus(status)) throw new HttpError(400, "Estado inválido");
    fields.status = status;
  }
  return fields;
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "Demasiado grande");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "JSON inválido");
  }
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function setSecurityHeaders(res: ServerResponse): void {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      // La landing usa Google Fonts.
      "style-src 'self' https://fonts.googleapis.com",
      "font-src https://fonts.gstatic.com",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "form-action 'none'",
    ].join("; "),
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
}
