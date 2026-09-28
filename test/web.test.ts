import { mkdtemp, rm } from "node:fs/promises";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FileTicketStore } from "../src/fileStore.js";
import { createWebServer } from "../src/web.js";
import { WebKeys } from "../src/webKeys.js";

describe("web", () => {
  let dir: string;
  let store: FileTicketStore;
  let server: Server;
  let base: string;
  let key: string;

  const api = (route: string, init: { method?: string; body?: unknown; key?: string } = {}) =>
    fetch(base + route, {
      method: init.method ?? "GET",
      headers: { Authorization: `Bearer ${init.key ?? key}`, "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : typeof init.body === "string" ? init.body : JSON.stringify(init.body),
    });

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ticketsapp-"));
    store = new FileTicketStore(path.join(dir, "boards"));
    const keys = new WebKeys(path.join(dir, "webkeys.json"));
    key = await keys.keyFor("chat@g.us", "Mi grupo");
    server = createWebServer({ store, keys });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(dir, { recursive: true, force: true });
  });

  it("serves the landing and the board with a strict CSP", async () => {
    const landing = await fetch(base + "/");
    expect(landing.status).toBe(200);
    expect(landing.headers.get("content-type")).toMatch(/text\/html/);
    expect(landing.headers.get("content-security-policy")).toContain("default-src 'self'");
    expect(await landing.text()).toContain("Organizá a tu equipo");

    const board = await fetch(base + "/board");
    expect(board.status).toBe(200);
    expect(await board.text()).toContain('id="editor"');

    const terms = await fetch(base + "/terminos");
    expect(terms.status).toBe(200);
    expect(await terms.text()).toContain("guido@weball.me");

    for (const asset of ["/app.js", "/landing.js", "/i18n.js", "/landing.css", "/favicon.svg", "/pattern.svg", "/og.png", "/kanbot.vcf"]) {
      expect((await fetch(base + asset)).status, asset).toBe(200);
    }
    expect((await fetch(base + "/package.json")).status).toBe(404);
    expect((await fetch(base + "/../package.json")).status).toBe(404);
  });

  it("rejects missing or wrong keys", async () => {
    expect((await fetch(base + "/api/board")).status).toBe(401);
    expect((await api("/api/board", { key: "nope" })).status).toBe(401);
    expect((await api("/api/board", { key: "__proto__" })).status).toBe(401);
  });

  it("creates, edits, lists and deletes tickets", async () => {
    const created = await api("/api/tickets", { method: "POST", body: { title: " Comprar hielo " } });
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ number: 1, title: "Comprar hielo", status: "todo", createdBy: "Web" });

    const edited = await api("/api/tickets/1", { method: "PATCH", body: { status: "doing", description: "2 bolsas" } });
    expect(edited.status).toBe(200);
    expect(await edited.json()).toMatchObject({ title: "Comprar hielo", status: "doing", description: "2 bolsas" });

    const board = await (await api("/api/board")).json();
    expect(board.name).toBe("Mi grupo");
    expect(board.lang).toBeNull();
    expect(board.tickets).toHaveLength(1);
    expect(board.tickets[0]).toMatchObject({ number: 1, status: "doing" });

    expect((await api("/api/tickets/1", { method: "DELETE" })).status).toBe(204);
    expect((await api("/api/tickets/1", { method: "DELETE" })).status).toBe(404);
  });

  it("validates input", async () => {
    await store.add("chat@g.us", { title: "a", createdBy: "x" });
    const expectError = async (res: Response, status: number) => {
      expect(res.status).toBe(status);
      const body = await res.json();
      expect(body.error).toBeTruthy();
      expect(body.code).toMatch(/^[a-z_]+$/);
    };
    await expectError(await api("/api/tickets", { method: "POST", body: {} }), 400);
    await expectError(await api("/api/tickets", { method: "POST", body: "{nope" }), 400);
    await expectError(await api("/api/tickets/1", { method: "PATCH", body: { status: "archivado" } }), 400);
    await expectError(await api("/api/tickets/1", { method: "PATCH", body: { title: "  " } }), 400);
    await expectError(await api("/api/tickets/1", { method: "PATCH", body: { description: "x".repeat(10_001) } }), 400);
    await expectError(await api("/api/tickets/99", { method: "PATCH", body: { title: "x" } }), 404);
  });

  it("returns the chat's pinned language so the board opens in it", async () => {
    await store.setLang("chat@g.us", "de");
    expect((await (await api("/api/board")).json()).lang).toBe("de");
  });

  it("only exposes the key's own board", async () => {
    await store.add("otro-chat", { title: "secreto", createdBy: "x" });
    const board = await (await api("/api/board")).json();
    expect(board.tickets).toEqual([]);
    expect((await api("/api/tickets/1", { method: "DELETE" })).status).toBe(404);
  });
});
