import { FieldValue, Timestamp, type Firestore } from "firebase-admin/firestore";
import type { NewTicket, Ticket, TicketStore } from "./types.js";

/**
 * boards/{boardId}                    { nextNumber }
 * boards/{boardId}/tickets/{number}   { number, title, createdBy, createdAt }
 */
export class FirestoreTicketStore implements TicketStore {
  constructor(private readonly db: Firestore) {}

  private board(boardId: string) {
    return this.db.collection("boards").doc(boardId);
  }

  private tickets(boardId: string) {
    return this.board(boardId).collection("tickets");
  }

  async add(boardId: string, ticket: NewTicket): Promise<Ticket> {
    const boardRef = this.board(boardId);
    return this.db.runTransaction(async (tx) => {
      const board = await tx.get(boardRef);
      const number: number = board.get("nextNumber") ?? 1;
      const createdAt = new Date();
      tx.set(boardRef, { nextNumber: number + 1, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      tx.create(this.tickets(boardId).doc(String(number)), {
        number,
        title: ticket.title,
        createdBy: ticket.createdBy,
        createdAt: Timestamp.fromDate(createdAt),
      });
      return { number, ...ticket, createdAt };
    });
  }

  async remove(boardId: string, number: number): Promise<Ticket | null> {
    const ref = this.tickets(boardId).doc(String(number));
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      tx.delete(ref);
      return toTicket(snap.data()!);
    });
  }

  async list(boardId: string): Promise<Ticket[]> {
    const snap = await this.tickets(boardId).orderBy("number").get();
    return snap.docs.map((doc) => toTicket(doc.data()));
  }
}

function toTicket(data: FirebaseFirestore.DocumentData): Ticket {
  return {
    number: data.number,
    title: data.title,
    createdBy: data.createdBy,
    createdAt: (data.createdAt as Timestamp).toDate(),
  };
}
