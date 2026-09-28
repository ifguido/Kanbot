import path from "node:path";
import { KeyedMutex, readJson, writeJsonAtomic } from "./jsonFile.js";
import type { NewTicket, Status, Ticket, TicketPatch, TicketStore } from "./types.js";

interface StoredTicket {
  number: number;
  title: string;
  // Opcionales: los boards creados antes de los estados no los tienen.
  description?: string;
  status?: Status;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

interface BoardFile {
  nextNumber: number;
  tickets: StoredTicket[];
}

/**
 * Un archivo JSON por board: {dir}/{boardId}.json
 * Las escrituras de un mismo board se serializan (no hay dos #3).
 */
export class FileTicketStore implements TicketStore {
  private mutex = new KeyedMutex();

  constructor(private readonly dir: string) {}

  add(boardId: string, ticket: NewTicket): Promise<Ticket> {
    return this.mutex.run(boardId, async () => {
      const board = await this.read(boardId);
      const now = new Date().toISOString();
      const stored: StoredTicket = {
        number: board.nextNumber++,
        title: ticket.title,
        description: ticket.description ?? "",
        status: ticket.status ?? "todo",
        createdBy: ticket.createdBy,
        createdAt: now,
        updatedAt: now,
      };
      board.tickets.push(stored);
      await this.write(boardId, board);
      return toTicket(stored);
    });
  }

  update(boardId: string, number: number, patch: TicketPatch): Promise<Ticket | null> {
    return this.mutex.run(boardId, async () => {
      const board = await this.read(boardId);
      const stored = board.tickets.find((t) => t.number === number);
      if (!stored) return null;
      if (patch.title !== undefined) stored.title = patch.title;
      if (patch.description !== undefined) stored.description = patch.description;
      if (patch.status !== undefined) stored.status = patch.status;
      stored.updatedAt = new Date().toISOString();
      await this.write(boardId, board);
      return toTicket(stored);
    });
  }

  remove(boardId: string, number: number): Promise<Ticket | null> {
    return this.mutex.run(boardId, async () => {
      const board = await this.read(boardId);
      const index = board.tickets.findIndex((t) => t.number === number);
      if (index === -1) return null;
      const [removed] = board.tickets.splice(index, 1);
      await this.write(boardId, board);
      return toTicket(removed);
    });
  }

  async list(boardId: string): Promise<Ticket[]> {
    const board = await this.read(boardId);
    return board.tickets.map(toTicket).sort((a, b) => a.number - b.number);
  }

  private file(boardId: string): string {
    return path.join(this.dir, `${boardId.replace(/[^\w.@-]/g, "_")}.json`);
  }

  private read(boardId: string): Promise<BoardFile> {
    return readJson(this.file(boardId), () => ({ nextNumber: 1, tickets: [] }));
  }

  private write(boardId: string, board: BoardFile): Promise<void> {
    return writeJsonAtomic(this.file(boardId), board);
  }
}

function toTicket(stored: StoredTicket): Ticket {
  return {
    number: stored.number,
    title: stored.title,
    description: stored.description ?? "",
    status: stored.status ?? "todo",
    createdBy: stored.createdBy,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt ?? stored.createdAt),
  };
}
