import type { NewTicket, Ticket, TicketStore } from "../src/types.js";

export class MemoryTicketStore implements TicketStore {
  private boards = new Map<string, { nextNumber: number; tickets: Map<number, Ticket> }>();

  private board(boardId: string) {
    let board = this.boards.get(boardId);
    if (!board) {
      board = { nextNumber: 1, tickets: new Map() };
      this.boards.set(boardId, board);
    }
    return board;
  }

  async add(boardId: string, ticket: NewTicket): Promise<Ticket> {
    const board = this.board(boardId);
    const created = { number: board.nextNumber++, ...ticket, createdAt: new Date() };
    board.tickets.set(created.number, created);
    return created;
  }

  async remove(boardId: string, number: number): Promise<Ticket | null> {
    const board = this.board(boardId);
    const ticket = board.tickets.get(number) ?? null;
    board.tickets.delete(number);
    return ticket;
  }

  async list(boardId: string): Promise<Ticket[]> {
    return [...this.board(boardId).tickets.values()].sort((a, b) => a.number - b.number);
  }
}
