import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HELP_TEXT, handleMessage, parseCommand } from "../src/commands.js";
import { FileTicketStore } from "../src/fileStore.js";

describe("parseCommand", () => {
  it("ignores non-commands", () => {
    expect(parseCommand("hola")).toBeNull();
  });

  it("parses add with multiline text", () => {
    expect(parseCommand("  @ADD  Comprar pan\ny leche ")).toEqual({ kind: "add", title: "Comprar pan\ny leche" });
  });

  it("parses remove with several ids", () => {
    expect(parseCommand("@remove #1, 2 x 3")).toEqual({ kind: "remove", numbers: [1, 2, 3] });
  });

  it("parses aliases and unknowns", () => {
    expect(parseCommand("@ls")).toEqual({ kind: "list" });
    expect(parseCommand("@rm 4")).toEqual({ kind: "remove", numbers: [4] });
    expect(parseCommand("@foo")).toEqual({ kind: "unknown", name: "foo" });
  });
});

describe("handleMessage", () => {
  let dir: string;
  let store: FileTicketStore;
  const send = (text: string, { boardId = "5491100000000@s.whatsapp.net", isGroup = false } = {}) =>
    handleMessage(store, { boardId, sender: "Guido", text, isGroup });

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ticketsapp-"));
    store = new FileTicketStore(dir);
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("adds, lists and removes tickets", async () => {
    expect(await send("@add Arreglar canilla")).toBe("✅ #1 Arreglar canilla");
    expect(await send("@add Pagar luz")).toBe("✅ #2 Pagar luz");
    expect(await send("@list")).toBe("*Tickets (2)*\n#1 Arreglar canilla\n#2 Pagar luz");
    expect(await send("@remove 1 9")).toBe("🗑️ #1 Arreglar canilla\n❓ #9 no existe");
    expect(await send("@list")).toBe("*Tickets (1)*\n#2 Pagar luz");
  });

  it("does not reuse numbers after removing", async () => {
    await send("@add a");
    await send("@remove 1");
    expect(await send("@add b")).toBe("✅ #2 b");
  });

  it("keeps boards separate", async () => {
    await send("@add a", { boardId: "chat-1" });
    expect(await send("@list", { boardId: "chat-2" })).toBe("No hay tickets 🎉");
  });

  it("validates input", async () => {
    expect(await send("@add")).toMatch(/Falta el texto/);
    expect(await send("@remove")).toMatch(/qué ticket borrar/);
    expect(await send(`@add ${"x".repeat(501)}`)).toMatch(/muy largo/);
  });

  it("helps in private chats", async () => {
    expect(await send("@help")).toBe(HELP_TEXT);
    expect(await send("hola")).toMatch(/@help/);
    expect(await send("@foo")).toContain("No conozco @foo");
  });

  it("stays quiet in groups unless it's a known command", async () => {
    const group = { boardId: "123@g.us", isGroup: true };
    expect(await send("hola a todos", group)).toBeNull();
    expect(await send("@5491122334455 venís?", group)).toBeNull();
    expect(await send("@add Comprar hielo", group)).toBe("✅ #1 Comprar hielo");
  });
});

describe("FileTicketStore", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ticketsapp-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("persists across instances", async () => {
    await new FileTicketStore(dir).add("chat", { title: "a", createdBy: "Guido" });
    const [ticket] = await new FileTicketStore(dir).list("chat");
    expect(ticket).toMatchObject({ number: 1, title: "a", createdBy: "Guido" });
    expect(ticket.createdAt).toBeInstanceOf(Date);
  });

  it("never hands out the same number to concurrent adds", async () => {
    const store = new FileTicketStore(dir);
    const added = await Promise.all(
      Array.from({ length: 30 }, (_, i) => store.add("chat", { title: `t${i}`, createdBy: "x" })),
    );
    expect(added.map((t) => t.number).sort((a, b) => a - b)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(await store.list("chat")).toHaveLength(30);
  });
});
