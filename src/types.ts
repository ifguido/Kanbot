export const STATUSES = ["todo", "doing", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  todo: "Por hacer",
  doing: "Haciendo",
  done: "Hecho",
};

export const MAX_TITLE_LENGTH = 500;
export const MAX_DESCRIPTION_LENGTH = 10_000;

export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export interface Ticket {
  number: number;
  title: string;
  description: string;
  status: Status;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTicket {
  title: string;
  createdBy: string;
  description?: string;
  status?: Status;
}

export type TicketPatch = Partial<Pick<Ticket, "title" | "description" | "status">>;

/** Un "board" es un chat de WhatsApp (grupo o privado): cada chat tiene su propia lista de tickets. */
export interface TicketStore {
  add(boardId: string, ticket: NewTicket): Promise<Ticket>;
  /** Devuelve el ticket actualizado, o null si no existía. */
  update(boardId: string, number: number, patch: TicketPatch): Promise<Ticket | null>;
  /** Devuelve el ticket borrado, o null si no existía. */
  remove(boardId: string, number: number): Promise<Ticket | null>;
  list(boardId: string): Promise<Ticket[]>;
}
