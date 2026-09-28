import { rm } from "node:fs/promises";
import path from "node:path";
import { DisconnectReason, makeWASocket, useMultiFileAuthState, type WAMessage } from "baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { handleMessage } from "./commands.js";
import { FileTicketStore } from "./fileStore.js";

const DATA_DIR = path.resolve(process.env.DATA_DIR ?? "data");
const AUTH_DIR = path.join(DATA_DIR, "auth");

const store = new FileTicketStore(path.join(DATA_DIR, "boards"));
const logger = pino({ level: process.env.LOG_LEVEL ?? "warn" });

function textOf(msg: WAMessage): string | undefined {
  // Los chats con mensajes temporales envuelven el contenido en ephemeralMessage.
  const content = msg.message?.ephemeralMessage?.message ?? msg.message;
  return content?.conversation ?? content?.extendedTextMessage?.text ?? undefined;
}

async function start(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const sock = makeWASocket({ auth: state, logger });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("Escaneá este QR desde WhatsApp → Dispositivos vinculados:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") console.log("✅ Conectado a WhatsApp");

    if (connection === "close") {
      const status = (lastDisconnect?.error as any)?.output?.statusCode;
      if (status === DisconnectReason.loggedOut) {
        // La sesión ya no sirve: la borramos para que el próximo arranque (systemd) muestre un QR nuevo.
        console.error("Sesión cerrada desde el celular. Borrando credenciales; reiniciá para escanear de nuevo.");
        await rm(AUTH_DIR, { recursive: true, force: true });
        process.exit(1);
      }
      console.warn(`Conexión cerrada (status ${status}), reconectando…`);
      setTimeout(() => void start().catch(fatal), 2_000);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      const chat = msg.key.remoteJid;
      if (!chat || msg.key.fromMe || chat === "status@broadcast" || chat.endsWith("@newsletter")) continue;

      const text = textOf(msg);
      if (!text) continue;

      const isGroup = chat.endsWith("@g.us");
      let reply: string | null;
      try {
        reply = await handleMessage(store, {
          boardId: chat,
          sender: msg.pushName ?? (msg.key.participant ?? chat).split("@")[0],
          text,
          isGroup,
        });
      } catch (err) {
        console.error("Error procesando mensaje", { chat, err });
        reply = "⚠️ Hubo un error, probá de nuevo.";
      }

      if (reply) {
        await sock.sendMessage(chat, { text: reply }, { quoted: msg }).catch((err) => {
          console.error("Error enviando respuesta", { chat, err });
        });
      }
    }
  });
}

function fatal(err: unknown): never {
  console.error(err);
  process.exit(1);
}

start().catch(fatal);
