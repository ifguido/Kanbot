import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NewTicket, Ticket, TicketStore } from "./types.js";

interface BoardFile {
  nextNumber: number;
  tickets: Array<Omit<Ticket, "createdAt"> & { createdAt: string }>;
}

/**
 * Un archivo JSON por board: {dir}/{boardId}.json
 *
 * - Las escrituras de un mismo board se serializan (no hay dos #3).
 * - Se escribe a un .tmp y se renombra, así un crash nunca deja un archivo a medias.
 */
export class FileTicketStore implements TicketStore {
  private locks = new Map<string, Promise<unknown>>();

  constructor(private readonly dir: string) {}

  async add(boardId: string, ticket: NewTicket): Promise<Ticket> {
    return this.exclusive(boardId, async () => {
      const board = await this.read(boardId);
      const created: Ticket = { number: board.nextNumber, ...ticket, createdAt: new Date() };
      board.nextNumber++;
      board.tickets.push({ ...created, createdAt: created.createdAt.toISOString() });
      await this.write(boardId, board);
      return created;
    });
  }

  async remove(boardId: string, number: number): Promise<Ticket | null> {
    return this.exclusive(boardId, async () => {
      const board = await this.read(boardId);
      const index = board.tickets.findIndex((t) => t.number === number);
      if (index === -1) return null;
      const [removed] = board.tickets.splice(index, 1);
      await this.write(boardId, board);
      return { ...removed, createdAt: new Date(removed.createdAt) };
    });
  }

  async list(boardId: string): Promise<Ticket[]> {
    const board = await this.read(boardId);
    return board.tickets
      .map((t) => ({ ...t, createdAt: new Date(t.createdAt) }))
      .sort((a, b) => a.number - b.number);
  }

  private file(boardId: string): string {
    return path.join(this.dir, `${boardId.replace(/[^\w.@-]/g, "_")}.json`);
  }

  private async read(boardId: string): Promise<BoardFile> {
    try {
      return JSON.parse(await readFile(this.file(boardId), "utf8"));
    } catch (err: any) {
      if (err?.code === "ENOENT") return { nextNumber: 1, tickets: [] };
      throw err;
    }
  }

  private async write(boardId: string, board: BoardFile): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const file = this.file(boardId);
    const tmp = `${file}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(board, null, 2));
    await rename(tmp, file);
  }

  /** Encola la tarea detrás de las anteriores del mismo board. */
  private exclusive<T>(boardId: string, task: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(boardId) ?? Promise.resolve();
    const result = previous.then(task, task);
    const tail = result.catch(() => {});
    this.locks.set(boardId, tail);
    void tail.then(() => {
      if (this.locks.get(boardId) === tail) this.locks.delete(boardId);
    });
    return result;
  }
}
