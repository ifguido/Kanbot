import type { TicketStore } from "./types.js";

export type Command =
  | { kind: "add"; title: string }
  | { kind: "remove"; numbers: number[] }
  | { kind: "list" }
  | { kind: "help" }
  | { kind: "unknown"; name: string };

const MAX_TITLE_LENGTH = 500;

/** Parsea "@comando args". Devuelve null si el mensaje no es un comando. */
export function parseCommand(text: string): Command | null {
  const match = text.trim().match(/^@(\w+)\s*([\s\S]*)$/);
  if (!match) return null;

  const name = match[1].toLowerCase();
  const args = match[2].trim();

  switch (name) {
    case "add":
      return { kind: "add", title: args };
    case "remove":
    case "rm":
      return {
        kind: "remove",
        numbers: args
          .split(/[\s,]+/)
          .map((token) => Number(token.replace(/^#/, "")))
          .filter((n) => Number.isInteger(n) && n > 0),
      };
    case "list":
    case "ls":
      return { kind: "list" };
    case "help":
      return { kind: "help" };
    default:
      return { kind: "unknown", name };
  }
}

export const HELP_TEXT = [
  "*Ticketsapp* 🎫",
  "",
  "@add <texto> — crea un ticket",
  "@remove <n> — borra el ticket #n (acepta varios: @remove 1 2 3)",
  "@list — muestra los tickets",
  "@help — esta ayuda",
].join("\n");

export interface MessageContext {
  boardId: string;
  sender: string;
  text: string;
}

/** Ejecuta el mensaje contra el store y devuelve el texto a responder (o null para no responder). */
export async function handleMessage(store: TicketStore, ctx: MessageContext): Promise<string | null> {
  const command = parseCommand(ctx.text);
  if (!command) return "Escribí @help para ver los comandos.";

  switch (command.kind) {
    case "add": {
      if (!command.title) return "Falta el texto. Ej: @add Arreglar la canilla";
      if (command.title.length > MAX_TITLE_LENGTH) {
        return `El ticket es muy largo (máx ${MAX_TITLE_LENGTH} caracteres).`;
      }
      const ticket = await store.add(ctx.boardId, { title: command.title, createdBy: ctx.sender });
      return `✅ #${ticket.number} ${ticket.title}`;
    }

    case "remove": {
      if (command.numbers.length === 0) return "Decime qué ticket borrar. Ej: @remove 3";
      const lines: string[] = [];
      for (const n of command.numbers) {
        const removed = await store.remove(ctx.boardId, n);
        lines.push(removed ? `🗑️ #${n} ${removed.title}` : `❓ #${n} no existe`);
      }
      return lines.join("\n");
    }

    case "list": {
      const tickets = await store.list(ctx.boardId);
      if (tickets.length === 0) return "No hay tickets 🎉";
      return [`*Tickets (${tickets.length})*`, ...tickets.map((t) => `#${t.number} ${t.title}`)].join("\n");
    }

    case "help":
      return HELP_TEXT;

    case "unknown":
      return `No conozco @${command.name}.\n\n${HELP_TEXT}`;
  }
}
