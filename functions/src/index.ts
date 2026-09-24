import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";
import { logger, setGlobalOptions } from "firebase-functions/v2";
import { handleMessage } from "./commands.js";
import { FirestoreTicketStore } from "./firestoreStore.js";
import { extractTextMessages, isValidSignature, sendText } from "./whatsapp.js";

setGlobalOptions({ region: "southamerica-east1", maxInstances: 5 });

const WHATSAPP_TOKEN = defineSecret("WHATSAPP_TOKEN");
const WHATSAPP_APP_SECRET = defineSecret("WHATSAPP_APP_SECRET");
const WHATSAPP_VERIFY_TOKEN = defineSecret("WHATSAPP_VERIFY_TOKEN");
const GRAPH_API_VERSION = defineString("GRAPH_API_VERSION", { default: "v23.0" });

initializeApp();
const db = getFirestore();
const store = new FirestoreTicketStore(db);

/** Días que se guarda el id de un mensaje procesado (configurar TTL de Firestore sobre `expiresAt`). */
const PROCESSED_TTL_DAYS = 7;

/**
 * Meta reintenta los webhooks si no respondemos 200 a tiempo.
 * Registramos cada message id una sola vez para no crear tickets duplicados.
 */
async function claimMessage(messageId: string): Promise<boolean> {
  try {
    await db.collection("processedMessages").doc(messageId).create({
      expiresAt: Timestamp.fromMillis(Date.now() + PROCESSED_TTL_DAYS * 24 * 60 * 60 * 1000),
    });
    return true;
  } catch (err: any) {
    if (err?.code === 6 /* ALREADY_EXISTS */) return false;
    throw err;
  }
}

export const whatsappWebhook = onRequest(
  { secrets: [WHATSAPP_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN] },
  async (req, res) => {
    // Verificación del webhook al configurarlo en Meta.
    if (req.method === "GET") {
      if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === WHATSAPP_VERIFY_TOKEN.value()) {
        res.status(200).send(req.query["hub.challenge"]);
      } else {
        res.sendStatus(403);
      }
      return;
    }

    if (req.method !== "POST") {
      res.sendStatus(405);
      return;
    }

    if (!isValidSignature(req.rawBody, req.get("x-hub-signature-256"), WHATSAPP_APP_SECRET.value())) {
      logger.warn("Invalid webhook signature");
      res.sendStatus(401);
      return;
    }

    for (const message of extractTextMessages(req.body)) {
      try {
        if (!(await claimMessage(message.id))) continue;

        const reply = await handleMessage(store, {
          boardId: message.from,
          sender: message.senderName ?? message.from,
          text: message.text,
        });
        if (reply) {
          await sendText(message.phoneNumberId, message.from, reply, {
            token: WHATSAPP_TOKEN.value(),
            graphApiVersion: GRAPH_API_VERSION.value(),
          });
        }
      } catch (err) {
        logger.error("Failed to process message", { messageId: message.id, err });
      }
    }

    // Siempre 200: si fallamos, reintentar no ayuda (el mensaje ya quedó reclamado).
    res.sendStatus(200);
  },
);
