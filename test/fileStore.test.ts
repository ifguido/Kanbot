import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FileTicketStore } from "../src/fileStore.js";

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
    expect(ticket).toMatchObject({ number: 1, title: "a", description: "", status: "todo", createdBy: "Guido" });
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

  it("updates only the given fields", async () => {
    const store = new FileTicketStore(dir);
    await store.add("chat", { title: "a", createdBy: "x" });
    const updated = await store.update("chat", 1, { status: "doing", description: "detalle" });
    expect(updated).toMatchObject({ title: "a", status: "doing", description: "detalle" });
    expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(updated!.createdAt.getTime());
    expect(await store.update("chat", 2, { title: "b" })).toBeNull();
  });

  it("reads boards saved before statuses existed", async () => {
    await writeFile(
      path.join(dir, "chat.json"),
      JSON.stringify({
        nextNumber: 2,
        tickets: [{ number: 1, title: "viejo", createdBy: "x", createdAt: "2026-09-01T00:00:00.000Z" }],
      }),
    );
    const [ticket] = await new FileTicketStore(dir).list("chat");
    expect(ticket).toMatchObject({ title: "viejo", status: "todo", description: "" });
    expect(ticket.updatedAt).toEqual(ticket.createdAt);
  });
});
