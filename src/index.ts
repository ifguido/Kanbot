import { rm } from "node:fs/promises";
import path from "node:path";
import {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState,
  type WAMessage,
} from "baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { handleMessage, type Deps } from "./commands.js";
import { DEFAULT_LANG, MESSAGES, langFromPhone } from "./i18n.js";
import { FileTicketStore } from "./fileStore.js";
import { createWebServer } from "./web.js";
import { WebKeys } from "./webKeys.js";

const DATA_DIR = path.resolve(process.env.DATA_DIR ?? "data");
const AUTH_DIR = path.join(DATA_DIR, "auth");
/** Si está definido (ej. 5491122334455), se vincula con código de 8 letras en vez de QR. */
const PAIRING_PHONE = process.env.PAIRING_PHONE?.replace(/\D/g, "");

const PORT = Number(process.env.PORT ?? 3000);
/** Por defecto solo escucha local: en el droplet Caddy pone el HTTPS adelante. */
const WEB_HOST = process.env.WEB_HOST ?? "127.0.0.1";
const PUBLIC_URL = (process.env.PUBLIC_URL ?? `http://localhost:${PORT}`).replace(/\/+$/, "");

const deps: Deps = {
  store: new FileTicketStore(path.join(DATA_DIR, "boards")),
  keys: new WebKeys(path.join(DATA_DIR, "webkeys.json")),
  publicUrl: PUBLIC_URL,
};
const logger = pino({ level: process.env.LOG_LEVEL ?? "warn" });

function textOf(msg: WAMessage): string | undefined {
  // Los chats con mensajes temporales envuelven el contenido en ephemeralMessage.
  const content = msg.message?.ephemeralMessage?.message ?? msg.message;
  return content?.conversation ?? content?.extendedTextMessage?.text ?? undefined;
}

/**
 * Teléfono de quien escribe. WhatsApp puede identificar el chat con un ID anónimo (@lid);
 * en ese caso el número real viene en participantAlt / remoteJidAlt.
 */
function phoneOf(msg: WAMessage): string | undefined {
  const { participant, participantAlt, remoteJid, remoteJidAlt } = msg.key;
  const jid = [participantAlt, participant, remoteJidAlt, remoteJid].find((j) => j?.endsWith("@s.whatsapp.net"));
  return jid?.split("@")[0].split(":")[0];
}

async function start(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  // WhatsApp rechaza la vinculación si la versión del cliente quedó vieja.
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ auth: state, logger, version });
  let pairingRequested = false;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr && PAIRING_PHONE) {
      if (!pairingRequested && !state.creds.registered) {
        pairingRequested = true;
        const code = await sock.requestPairingCode(PAIRING_PHONE);
        console.log(`Código de vinculación: ${code}`);
        console.log("En el celular del bot: Dispositivos vinculados → Vincular con el número de teléfono");
      }
    } else if (qr) {
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
      const sender = msg.pushName ?? (msg.key.participant ?? chat).split("@")[0];
      const senderPhone = phoneOf(msg);
      let reply: string | null;
      try {
        reply = await handleMessage(deps, {
          boardId: chat,
          sender,
          senderPhone,
          text,
          isGroup,
          chatName: async () => (isGroup ? (await sock.groupMetadata(chat)).subject : sender),
        });
      } catch (err) {
        console.error("Error procesando mensaje", { chat, err });
        reply = MESSAGES[langFromPhone(senderPhone) ?? DEFAULT_LANG].error;
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

createWebServer(deps).listen(PORT, WEB_HOST, () => console.log(`🌐 Tablero web en ${PUBLIC_URL}`));
start().catch(fatal);
