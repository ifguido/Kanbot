import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HELP_TEXT, handleMessage, parseCommand, type Deps } from "../src/commands.js";
import { FileTicketStore } from "../src/fileStore.js";
import { WebKeys } from "../src/webKeys.js";

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

  it("parses status moves", () => {
    expect(parseCommand("@done 1 #2")).toEqual({ kind: "move", status: "done", numbers: [1, 2] });
    expect(parseCommand("@Doing 3")).toEqual({ kind: "move", status: "doing", numbers: [3] });
  });

  it("parses web", () => {
    expect(parseCommand("@web")).toEqual({ kind: "web", rotate: false });
    expect(parseCommand("@web nueva")).toEqual({ kind: "web", rotate: true });
  });

  it("parses aliases and unknowns", () => {
    expect(parseCommand("@ls")).toEqual({ kind: "list" });
    expect(parseCommand("@rm 4")).toEqual({ kind: "remove", numbers: [4] });
    expect(parseCommand("@foo")).toEqual({ kind: "unknown", name: "foo" });
  });
});

describe("handleMessage", () => {
  let dir: string;
  let deps: Deps;
  const send = (text: string, { boardId = "5491100000000@s.whatsapp.net", isGroup = false } = {}) =>
    handleMessage(deps, { boardId, sender: "Guido", text, isGroup, chatName: async () => "Mi chat" });

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ticketsapp-"));
    deps = {
      store: new FileTicketStore(path.join(dir, "boards")),
      keys: new WebKeys(path.join(dir, "webkeys.json")),
      publicUrl: "https://tickets.test",
    };
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("adds, lists and removes tickets", async () => {
    expect(await send("@add Arreglar canilla")).toBe("✅ #1 Arreglar canilla");
    expect(await send("@add Pagar luz")).toBe("✅ #2 Pagar luz");
    expect(await send("@list")).toBe("*Por hacer (2)*\n#1 Arreglar canilla\n#2 Pagar luz");
    expect(await send("@remove 1 9")).toBe("🗑️ #1 Arreglar canilla\n❓ #9 no existe");
    expect(await send("@list")).toBe("*Por hacer (1)*\n#2 Pagar luz");
  });

  it("moves tickets between statuses and groups the list", async () => {
    await send("@add a");
    await send("@add b");
    expect(await send("@doing 1")).toBe("➡️ #1 Haciendo: a");
    expect(await send("@done 2 9")).toBe("➡️ #2 Hecho: b\n❓ #9 no existe");
    expect(await send("@list")).toBe("*Haciendo (1)*\n#1 a\n\n✔️ 1 hecho");
    await send("@done 1");
    expect(await send("@list")).toBe("No hay tickets pendientes 🎉\n\n✔️ 2 hechos");
    expect(await send("@todo 1")).toBe("➡️ #1 Por hacer: a");
    expect(await send("@done")).toMatch(/qué ticket mover/);
  });

  it("marks tickets with description in the list", async () => {
    await send("@add a");
    await deps.store.update("5491100000000@s.whatsapp.net", 1, { description: "detalle" });
    expect(await send("@list")).toBe("*Por hacer (1)*\n#1 a 📝");
  });

  it("gives a stable web link and rotates it on demand", async () => {
    const keyOf = (reply: string | null) => reply?.match(/https:\/\/tickets\.test\/#([\w-]+)/)?.[1];

    const first = keyOf(await send("@web"));
    expect(first).toBeTruthy();
    expect(keyOf(await send("@web"))).toBe(first);
    expect(await deps.keys.resolve(first!)).toMatchObject({
      boardId: "5491100000000@s.whatsapp.net",
      name: "Mi chat",
    });

    const rotated = keyOf(await send("@web nueva"));
    expect(rotated).toBeTruthy();
    expect(rotated).not.toBe(first);
    expect(await deps.keys.resolve(first!)).toBeNull();
    expect(await deps.keys.resolve(rotated!)).not.toBeNull();
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
