export interface Ticket {
  number: number;
  title: string;
  createdBy: string;
  createdAt: Date;
}

export interface NewTicket {
  title: string;
  createdBy: string;
}

/** Un "board" es un chat de WhatsApp (grupo o privado): cada chat tiene su propia lista de tickets. */
export interface TicketStore {
  add(boardId: string, ticket: NewTicket): Promise<Ticket>;
  /** Devuelve el ticket borrado, o null si no existía. */
  remove(boardId: string, number: number): Promise<Ticket | null>;
  list(boardId: string): Promise<Ticket[]>;
}
