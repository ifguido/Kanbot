import { MAX_TITLE_LENGTH, STATUS_LABELS, type Status, type Ticket, type TicketStore } from "./types.js";
import type { WebKeys } from "./webKeys.js";

export type Command =
  | { kind: "add"; title: string }
  | { kind: "remove"; numbers: number[] }
  | { kind: "move"; status: Status; numbers: number[] }
  | { kind: "list" }
  | { kind: "web"; rotate: boolean }
  | { kind: "help" }
  | { kind: "unknown"; name: string };

function parseNumbers(args: string): number[] {
  return args
    .split(/[\s,]+/)
    .map((token) => Number(token.replace(/^#/, "")))
    .filter((n) => Number.isInteger(n) && n > 0);
}

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
      return { kind: "remove", numbers: parseNumbers(args) };
    case "todo":
    case "doing":
    case "done":
      return { kind: "move", status: name, numbers: parseNumbers(args) };
    case "list":
    case "ls":
      return { kind: "list" };
    case "web":
      return { kind: "web", rotate: /^(nueva|new|reset)$/i.test(args) };
    case "help":
      return { kind: "help" };
    default:
      return { kind: "unknown", name };
  }
}

export const HELP_TEXT = [
  "*Kanbot* 📋",
  "",
  "@add <texto> — crea un ticket",
  "@list — muestra los tickets",
  "@doing <n> — pasa el #n a Haciendo",
  "@done <n> — pasa el #n a Hecho",
  "@todo <n> — lo vuelve a Por hacer",
  "@remove <n> — borra el ticket",
  "@web — link al tablero web",
  "@help — esta ayuda",
  "",
  "Los que llevan <n> aceptan varios: @done 1 2 3",
].join("\n");

export interface Deps {
  store: TicketStore;
  keys: WebKeys;
  /** URL pública del tablero web, sin barra final. */
  publicUrl: string;
}

export interface MessageContext {
  boardId: string;
  sender: string;
  text: string;
  /** En grupos solo respondemos a comandos conocidos; la gente también charla ahí. */
  isGroup: boolean;
  /** Nombre del grupo o contacto. Es una función porque en grupos cuesta una consulta a WhatsApp. */
  chatName: () => Promise<string>;
}

/** Ejecuta el mensaje y devuelve el texto a responder (o null para no responder). */
export async function handleMessage({ store, keys, publicUrl }: Deps, ctx: MessageContext): Promise<string | null> {
  const command = parseCommand(ctx.text);
  if (!command) return ctx.isGroup ? null : "Escribí @help para ver los comandos.";

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

    case "move": {
      if (command.numbers.length === 0) return `Decime qué ticket mover. Ej: @${command.status} 3`;
      const lines: string[] = [];
      for (const n of command.numbers) {
        const moved = await store.update(ctx.boardId, n, { status: command.status });
        lines.push(moved ? `➡️ #${n} ${STATUS_LABELS[command.status]}: ${moved.title}` : `❓ #${n} no existe`);
      }
      return lines.join("\n");
    }

    case "list":
      return formatList(await store.list(ctx.boardId));

    case "web": {
      const key = await keys.keyFor(ctx.boardId, await ctx.chatName(), { rotate: command.rotate });
      return [
        command.rotate ? "🔑 Link nuevo (el anterior ya no funciona):" : "🔗 Tablero web:",
        `${publicUrl}/board#${key}`,
        "",
        "Cualquiera con este link puede ver y editar los tickets de este chat. Para invalidarlo: @web nueva",
      ].join("\n");
    }

    case "help":
      return HELP_TEXT;

    case "unknown":
      // En grupos "@juan" es una mención, no un comando mal escrito.
      return ctx.isGroup ? null : `No conozco @${command.name}.\n\n${HELP_TEXT}`;
  }
}

/** Pendientes agrupados por estado; los hechos solo se cuentan (se ven en la web). */
function formatList(tickets: Ticket[]): string {
  if (tickets.length === 0) return "No hay tickets 🎉";

  const sections: string[] = [];
  for (const status of ["todo", "doing"] as const) {
    const group = tickets.filter((t) => t.status === status);
    if (group.length === 0) continue;
    sections.push(
      [
        `*${STATUS_LABELS[status]} (${group.length})*`,
        ...group.map((t) => `#${t.number} ${t.title}${t.description ? " 📝" : ""}`),
      ].join("\n"),
    );
  }
  if (sections.length === 0) sections.push("No hay tickets pendientes 🎉");

  const done = tickets.filter((t) => t.status === "done").length;
  if (done > 0) sections.push(`✔️ ${done} ${done === 1 ? "hecho" : "hechos"}`);

  return sections.join("\n\n");
}
