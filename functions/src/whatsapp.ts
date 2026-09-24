import { createHmac, timingSafeEqual } from "node:crypto";

export interface IncomingTextMessage {
  id: string;
  /** Teléfono del remitente (wa_id). */
  from: string;
  senderName?: string;
  text: string;
  /** Número del bot que recibió el mensaje; se usa para responder. */
  phoneNumberId: string;
}

/** Valida el header X-Hub-Signature-256 que firma Meta con el App Secret. */
export function isValidSignature(rawBody: Buffer, signatureHeader: string | undefined, appSecret: string): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = Buffer.from(createHmac("sha256", appSecret).update(rawBody).digest("hex"));
  const received = Buffer.from(signatureHeader.slice("sha256=".length));
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Extrae los mensajes de texto de un webhook de WhatsApp Cloud API. Ignora estados, media, etc. */
export function extractTextMessages(body: any): IncomingTextMessage[] {
  if (body?.object !== "whatsapp_business_account") return [];

  const messages: IncomingTextMessage[] = [];
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const phoneNumberId: string | undefined = value.metadata?.phone_number_id;
      if (!phoneNumberId) continue;

      for (const message of value.messages ?? []) {
        if (message.type !== "text" || typeof message.text?.body !== "string") continue;
        const contact = (value.contacts ?? []).find((c: any) => c.wa_id === message.from);
        messages.push({
          id: message.id,
          from: message.from,
          senderName: contact?.profile?.name,
          text: message.text.body,
          phoneNumberId,
        });
      }
    }
  }
  return messages;
}

export interface SendOptions {
  token: string;
  graphApiVersion: string;
}

export async function sendText(phoneNumberId: string, to: string, text: string, opts: SendOptions): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/${opts.graphApiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text, preview_url: false },
    }),
  });
  if (!res.ok) {
    throw new Error(`WhatsApp send failed (${res.status}): ${await res.text()}`);
  }
}
