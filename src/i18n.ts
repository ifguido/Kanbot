import type { Status } from "./types.js";

export const LANGS = ["es", "en", "de", "it", "sw"] as const;
export type Lang = (typeof LANGS)[number];

/** Si no sabemos nada de quien escribe, el bot habla en español (el idioma de origen de Kanbot). */
export const DEFAULT_LANG: Lang = "es";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

export const LANG_NAMES: Record<Lang, string> = {
  es: "Español",
  en: "English",
  de: "Deutsch",
  it: "Italiano",
  sw: "Kiswahili",
};

/**
 * Idioma según el código de país del teléfono (solo dígitos, ej. 5491122334455).
 * Se prueba del prefijo más largo al más corto.
 */
const PREFIXES: Array<[string, Lang]> = [
  // Swahili: Kenia, Tanzania, Uganda
  ["254", "sw"],
  ["255", "sw"],
  ["256", "sw"],
  // Español
  ["54", "es"], ["52", "es"], ["34", "es"], ["56", "es"], ["57", "es"], ["51", "es"], ["58", "es"],
  ["593", "es"], ["591", "es"], ["595", "es"], ["598", "es"], ["506", "es"], ["507", "es"], ["503", "es"],
  ["502", "es"], ["504", "es"], ["505", "es"], ["53", "es"], ["240", "es"],
  ["1809", "es"], ["1829", "es"], ["1849", "es"],
  // Alemán: Alemania, Austria, Suiza, Liechtenstein
  ["49", "de"], ["43", "de"], ["41", "de"], ["423", "de"],
  // Italiano: Italia, San Marino
  ["39", "it"], ["378", "it"],
  // Inglés
  ["1", "en"], ["44", "en"], ["61", "en"], ["64", "en"], ["353", "en"], ["27", "en"],
];
PREFIXES.sort((a, b) => b[0].length - a[0].length);

export function langFromPhone(phone: string | undefined): Lang | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  return PREFIXES.find(([prefix]) => digits.startsWith(prefix))?.[1];
}

export interface Messages {
  status: Record<Status, string>;
  help: string;
  privateHint: string;
  unknown: (command: string) => string;
  addMissing: string;
  tooLong: (max: number) => string;
  removeMissing: string;
  moveMissing: (command: string) => string;
  notFound: (n: number) => string;
  empty: string;
  noPending: string;
  doneCount: (n: number) => string;
  webLink: string;
  webRotated: string;
  webWarning: string;
  langSet: (name: string) => string;
  langAuto: string;
  langUsage: string;
  error: string;
}

const LANG_OPTIONS = "es, en, de, it, sw";

export const MESSAGES: Record<Lang, Messages> = {
  es: {
    status: { todo: "Por hacer", doing: "Haciendo", done: "Hecho" },
    help: [
      "*Kanbot* 📋",
      "",
      "@add <texto> — crea un ticket (o @@ <texto>)",
      "@list — muestra los tickets",
      "@doing <n> — pasa el #n a Haciendo",
      "@done <n> — pasa el #n a Hecho",
      "@todo <n> — lo vuelve a Por hacer",
      "@remove <n> — borra el ticket",
      "@web — link al tablero web",
      `@lang <${LANG_OPTIONS.replace(/, /g, "|")}> — cambia el idioma`,
      "@help — esta ayuda",
      "",
      "Los que llevan <n> aceptan varios: @done 1 2 3",
    ].join("\n"),
    privateHint: "Escribí @help para ver los comandos.",
    unknown: (c) => `No conozco @${c}.`,
    addMissing: "Falta el texto. Ej: @add Arreglar la canilla",
    tooLong: (max) => `El ticket es muy largo (máx ${max} caracteres).`,
    removeMissing: "Decime qué ticket borrar. Ej: @remove 3",
    moveMissing: (c) => `Decime qué ticket mover. Ej: @${c} 3`,
    notFound: (n) => `❓ #${n} no existe`,
    empty: "No hay tickets 🎉",
    noPending: "No hay tickets pendientes 🎉",
    doneCount: (n) => `✔️ ${n} ${n === 1 ? "hecho" : "hechos"}`,
    webLink: "🔗 Tablero web:",
    webRotated: "🔑 Link nuevo (el anterior ya no funciona):",
    webWarning: "Cualquiera con este link puede ver y editar los tickets de este chat. Para invalidarlo: @web nueva",
    langSet: (name) => `🌐 Idioma: ${name}`,
    langAuto: "🌐 Idioma automático: respondo en el idioma del país de quien escribe.",
    langUsage: `Idiomas: ${LANG_OPTIONS} (o auto). Ej: @lang en`,
    error: "⚠️ Hubo un error, probá de nuevo.",
  },
  en: {
    status: { todo: "To do", doing: "Doing", done: "Done" },
    help: [
      "*Kanbot* 📋",
      "",
      "@add <text> — creates a ticket (or @@ <text>)",
      "@list — shows the tickets",
      "@doing <n> — moves #n to Doing",
      "@done <n> — moves #n to Done",
      "@todo <n> — moves it back to To do",
      "@remove <n> — deletes the ticket",
      "@web — link to the web board",
      `@lang <${LANG_OPTIONS.replace(/, /g, "|")}> — changes the language`,
      "@help — this help",
      "",
      "Commands with <n> accept several: @done 1 2 3",
    ].join("\n"),
    privateHint: "Type @help to see the commands.",
    unknown: (c) => `I don't know @${c}.`,
    addMissing: "The text is missing. E.g.: @add Fix the tap",
    tooLong: (max) => `The ticket is too long (max ${max} characters).`,
    removeMissing: "Tell me which ticket to delete. E.g.: @remove 3",
    moveMissing: (c) => `Tell me which ticket to move. E.g.: @${c} 3`,
    notFound: (n) => `❓ #${n} doesn't exist`,
    empty: "No tickets 🎉",
    noPending: "Nothing pending 🎉",
    doneCount: (n) => `✔️ ${n} done`,
    webLink: "🔗 Web board:",
    webRotated: "🔑 New link (the old one no longer works):",
    webWarning: "Anyone with this link can see and edit this chat's tickets. To revoke it: @web new",
    langSet: (name) => `🌐 Language: ${name}`,
    langAuto: "🌐 Automatic language: I reply in the language of each sender's country.",
    langUsage: `Languages: ${LANG_OPTIONS} (or auto). E.g.: @lang en`,
    error: "⚠️ Something went wrong, try again.",
  },
  de: {
    status: { todo: "Zu erledigen", doing: "In Arbeit", done: "Erledigt" },
    help: [
      "*Kanbot* 📋",
      "",
      "@add <Text> — erstellt ein Ticket (oder @@ <Text>)",
      "@list — zeigt die Tickets",
      "@doing <n> — verschiebt #n nach In Arbeit",
      "@done <n> — verschiebt #n nach Erledigt",
      "@todo <n> — zurück nach Zu erledigen",
      "@remove <n> — löscht das Ticket",
      "@web — Link zum Web-Board",
      `@lang <${LANG_OPTIONS.replace(/, /g, "|")}> — ändert die Sprache`,
      "@help — diese Hilfe",
      "",
      "Befehle mit <n> nehmen mehrere: @done 1 2 3",
    ].join("\n"),
    privateHint: "Schreib @help, um die Befehle zu sehen.",
    unknown: (c) => `@${c} kenne ich nicht.`,
    addMissing: "Der Text fehlt. Z. B.: @add Wasserhahn reparieren",
    tooLong: (max) => `Das Ticket ist zu lang (max. ${max} Zeichen).`,
    removeMissing: "Sag mir, welches Ticket ich löschen soll. Z. B.: @remove 3",
    moveMissing: (c) => `Sag mir, welches Ticket ich verschieben soll. Z. B.: @${c} 3`,
    notFound: (n) => `❓ #${n} gibt es nicht`,
    empty: "Keine Tickets 🎉",
    noPending: "Nichts offen 🎉",
    doneCount: (n) => `✔️ ${n} erledigt`,
    webLink: "🔗 Web-Board:",
    webRotated: "🔑 Neuer Link (der alte funktioniert nicht mehr):",
    webWarning:
      "Jeder mit diesem Link kann die Tickets dieses Chats sehen und bearbeiten. Zum Widerrufen: @web neu",
    langSet: (name) => `🌐 Sprache: ${name}`,
    langAuto: "🌐 Automatische Sprache: Ich antworte in der Sprache des Landes, aus dem geschrieben wird.",
    langUsage: `Sprachen: ${LANG_OPTIONS} (oder auto). Z. B.: @lang de`,
    error: "⚠️ Etwas ist schiefgelaufen, versuch es nochmal.",
  },
  it: {
    status: { todo: "Da fare", doing: "In corso", done: "Fatto" },
    help: [
      "*Kanbot* 📋",
      "",
      "@add <testo> — crea un ticket (o @@ <testo>)",
      "@list — mostra i ticket",
      "@doing <n> — sposta il #n in In corso",
      "@done <n> — sposta il #n in Fatto",
      "@todo <n> — lo riporta in Da fare",
      "@remove <n> — elimina il ticket",
      "@web — link alla bacheca web",
      `@lang <${LANG_OPTIONS.replace(/, /g, "|")}> — cambia la lingua`,
      "@help — questo aiuto",
      "",
      "I comandi con <n> ne accettano diversi: @done 1 2 3",
    ].join("\n"),
    privateHint: "Scrivi @help per vedere i comandi.",
    unknown: (c) => `Non conosco @${c}.`,
    addMissing: "Manca il testo. Es.: @add Riparare il rubinetto",
    tooLong: (max) => `Il ticket è troppo lungo (max ${max} caratteri).`,
    removeMissing: "Dimmi quale ticket eliminare. Es.: @remove 3",
    moveMissing: (c) => `Dimmi quale ticket spostare. Es.: @${c} 3`,
    notFound: (n) => `❓ Il #${n} non esiste`,
    empty: "Nessun ticket 🎉",
    noPending: "Niente in sospeso 🎉",
    doneCount: (n) => `✔️ ${n} ${n === 1 ? "fatto" : "fatti"}`,
    webLink: "🔗 Bacheca web:",
    webRotated: "🔑 Nuovo link (quello vecchio non funziona più):",
    webWarning: "Chiunque abbia questo link può vedere e modificare i ticket di questa chat. Per revocarlo: @web nuovo",
    langSet: (name) => `🌐 Lingua: ${name}`,
    langAuto: "🌐 Lingua automatica: rispondo nella lingua del paese di chi scrive.",
    langUsage: `Lingue: ${LANG_OPTIONS} (o auto). Es.: @lang it`,
    error: "⚠️ Qualcosa è andato storto, riprova.",
  },
  sw: {
    status: { todo: "Za kufanya", doing: "Zinaendelea", done: "Zimekamilika" },
    help: [
      "*Kanbot* 📋",
      "",
      "@add <maandishi> — huunda tiketi (au @@ <maandishi>)",
      "@list — huonyesha tiketi",
      "@doing <n> — huhamisha #n kwenda Zinaendelea",
      "@done <n> — huhamisha #n kwenda Zimekamilika",
      "@todo <n> — huirudisha kwenye Za kufanya",
      "@remove <n> — hufuta tiketi",
      "@web — kiungo cha ubao wa wavuti",
      `@lang <${LANG_OPTIONS.replace(/, /g, "|")}> — hubadilisha lugha`,
      "@help — msaada huu",
      "",
      "Amri zenye <n> hukubali namba kadhaa: @done 1 2 3",
    ].join("\n"),
    privateHint: "Andika @help kuona amri.",
    unknown: (c) => `Siijui amri @${c}.`,
    addMissing: "Maandishi hayapo. Mfano: @add Kurekebisha bomba",
    tooLong: (max) => `Tiketi ni ndefu mno (kiwango cha juu ni herufi ${max}).`,
    removeMissing: "Niambie nifute tiketi ipi. Mfano: @remove 3",
    moveMissing: (c) => `Niambie nihamishe tiketi ipi. Mfano: @${c} 3`,
    notFound: (n) => `❓ #${n} haipo`,
    empty: "Hakuna tiketi 🎉",
    noPending: "Hakuna tiketi zinazosubiri 🎉",
    doneCount: (n) => `✔️ ${n} ${n === 1 ? "imekamilika" : "zimekamilika"}`,
    webLink: "🔗 Ubao wa wavuti:",
    webRotated: "🔑 Kiungo kipya (cha zamani hakifanyi kazi tena):",
    webWarning: "Yeyote mwenye kiungo hiki anaweza kuona na kuhariri tiketi za mazungumzo haya. Kukibatilisha: @web mpya",
    langSet: (name) => `🌐 Lugha: ${name}`,
    langAuto: "🌐 Lugha ya kiotomatiki: ninajibu kwa lugha ya nchi ya anayeandika.",
    langUsage: `Lugha: ${LANG_OPTIONS} (au auto). Mfano: @lang sw`,
    error: "⚠️ Kuna hitilafu, jaribu tena.",
  },
};
