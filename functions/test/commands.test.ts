import { beforeEach, describe, expect, it } from "vitest";
import { HELP_TEXT, handleMessage, parseCommand } from "../src/commands.js";
import { MemoryTicketStore } from "./memoryStore.js";

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
  let store: MemoryTicketStore;
  const send = (text: string, boardId = "5491100000000") =>
    handleMessage(store, { boardId, sender: "Guido", text });

  beforeEach(() => {
    store = new MemoryTicketStore();
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
    await send("@add a", "chat-1");
    expect(await send("@list", "chat-2")).toBe("No hay tickets 🎉");
  });

  it("validates input", async () => {
    expect(await send("@add")).toMatch(/Falta el texto/);
    expect(await send("@remove")).toMatch(/qué ticket borrar/);
    expect(await send(`@add ${"x".repeat(501)}`)).toMatch(/muy largo/);
  });

  it("helps", async () => {
    expect(await send("@help")).toBe(HELP_TEXT);
    expect(await send("hola")).toMatch(/@help/);
    expect(await send("@foo")).toContain("No conozco @foo");
  });
});
