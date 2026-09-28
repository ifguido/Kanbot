/*
 * i18n de la web: es, en, de, it, sw.
 *
 * Se carga bloqueante en el <head> (sin defer) para decidir el idioma antes del primer paint.
 * Si no es español, oculta el body (clase i18n-pending) hasta traducir: así no hay un flash en español.
 *
 * Cómo se elige el idioma, en orden:
 *   1. El que la persona eligió en el selector (localStorage).
 *   2. ?lang= en la URL (sin guardarlo).
 *   3. El idioma del navegador, si es uno de los nuestros y no es inglés (señal explícita).
 *   4. Dónde está: la zona horaria del navegador (Berlín → de, Roma → it, Nairobi → sw, Buenos Aires → es).
 *   5. Inglés.
 *
 * En el HTML: data-i18n (texto), data-i18n-html (HTML propio del diccionario, nunca datos de usuarios)
 * y data-i18n-placeholder / -title / -aria-label / -content (atributos).
 */
(function () {
  "use strict";

  var LANGS = ["es", "en", "de", "it", "sw"];
  var STORAGE_KEY = "kanbot.lang";
  var PHONE = "+54 9 11 7073-6993";

  var D = {};

  D.es = {
    locale: "es-AR",
    "lang.label": "Idioma",
    "nav.how": "Cómo funciona",
    "nav.pricing": "Precios",
    "cta.try": "Probar gratis",
    "meta.landing.title": "Kanbot — Organizá a tu equipo sin salir de WhatsApp",
    "meta.landing.description":
      "Kanbot es un tablero de tareas que vive en tus chats de WhatsApp. @add, @list, @done y listo. Gratis, sin apps y sin cuentas.",
    "hero.eyebrow": "Tareas en WhatsApp",
    "hero.title": "Organizá a tu equipo sin salir de <mark>WhatsApp</mark>.",
    "hero.lead":
      "Kanbot es un tablero de tareas que vive en tus chats. Escribís <code>@add</code> y tu grupo ya tiene su propio Trello.",
    "cta.chat": "Hablar con Kanbot ↗",
    "cta.group": "Agregar a un grupo",
    "facts.free": "Gratis",
    "facts.noApps": "Sin apps",
    "facts.noAccounts": "Sin cuentas",
    "status.todo": "Por hacer",
    "status.doing": "Haciendo",
    "status.done": "Hecho",
    "task.1": "Diseñar la landing",
    "task.2": "Configurar el dominio",
    "task.3": "Grabar el video",
    "chat.group": "Equipo Lanzamiento",
    "chat.input": "Mensaje",
    marquee:
      "Equipos de trabajo|Consorcios|Familias|Viajes con amigos|Startups|Clubes|Mudanzas|Eventos|Cumpleaños|Agencias|Freelancers|Proyectos de facu",
    "story.title": "Cuatro comandos. <mark>Eso es todo.</mark>",
    step: "Paso",
    "step1.title": "Anotá en segundos.",
    "step1.text":
      "Cualquiera del grupo escribe <code>@add</code> (o <code>@@</code>) y la tarea queda anotada, numerada y a la vista de todos. Sin abrir otra app.",
    "step2.title": "Todos ven lo mismo.",
    "step2.text":
      "Un <code>@list</code> y el grupo entero sabe qué falta. Chau planillas, chau “¿quién estaba con eso?”.",
    "step3.title": "Tachá lo que terminaste.",
    "step3.text":
      "<code>@doing</code> cuando arrancás, <code>@done</code> cuando terminás. El tablero se ordena solo y todos se enteran.",
    "step4.title": "Y cuando querés ver todo junto…",
    "step4.text":
      "Kanbot te pasa un link a un tablero kanban: columnas, arrastrar y soltar, descripciones largas. Sin cuentas ni contraseñas.",
    "features.title": "Tu equipo ya vive en WhatsApp. Ahora sus tareas también.",
    "f1.label": "Grupos",
    "f1.title": "Hecho para grupos",
    "f1.text": "Sumalo al grupo y el tablero es de todos. En privado, es tu lista personal.",
    "f2.label": "Idiomas",
    "f2.title": "Habla tu idioma",
    "f2.text":
      "Responde en español, inglés, alemán, italiano o suajili según el país de quien escribe. O fijalo con @lang.",
    "f3.label": "Web",
    "f3.title": "Tablero web con un link",
    "f3.text": "Columnas, arrastrar y soltar, descripciones largas. Se sincroniza con el chat.",
    "f4.label": "Velocidad",
    "f4.title": "Rapidísimo",
    "f4.text": "Mandás el comando y la respuesta ya está ahí. Sin cargas, sin esperas.",
    "f5.label": "Silencio",
    "f5.title": "No molesta",
    "f5.text": "En los grupos solo habla cuando lo llamás. La charla sigue como siempre.",
    "f6.label": "Código",
    "f6.title": "Open source",
    "f6.text": "Todo el código está en GitHub. Nada de cajas negras con tus datos.",
    "pricing.title": "Precios",
    "free.price": "Gratis",
    "free.desc": "Sumá a Kanbot a tus chats y empezá ahora. Para siempre.",
    "free.1": "Grupos y chats privados",
    "free.2": "Tableros ilimitados",
    "free.3": "Tablero web con un link",
    "free.4": "Sin cuentas ni tarjetas",
    "free.terms": 'Sujeto a los <a href="/terminos">términos</a>',
    "free.cta": "Empezar gratis ↗",
    "self.once": "Pago único",
    "self.desc": "Tu propio Kanbot, con tu número y tus datos en tu servidor. Te guiamos y lo dejamos funcionando.",
    "self.1": "Instalación y configuración completa",
    "self.2": "Con tu propio número de WhatsApp",
    "self.3": "Tus datos quedan en tu servidor",
    "self.4": "En un servidor gratis o un droplet de USD 4/mes",
    "self.cta": "Quiero el mío ↗",
    "final.label": "04 — Empezar",
    "final.title": "Arrancá en diez segundos.",
    "final.text": "Abrí el chat, escribí <code>@help</code> y listo. O sumalo directo a tu grupo.",
    "footer.tagline": "Tareas en WhatsApp",
    "footer.sections": "Secciones",
    "footer.links": "Links",
    "footer.terms": "Términos",
    "footer.strip": "© 2026 Kanbot · No afiliado a WhatsApp ni a Meta",
    "dialog.head": "Agregar a un grupo",
    "dialog.close": "Cerrar ✕",
    "dialog.title": "Sumá a Kanbot a tu grupo",
    "dialog.1": "<strong>Guardá el contacto</strong> de Kanbot en tu celular.",
    "dialog.2": "En el grupo: <strong>Info del grupo → Añadir participante → Kanbot</strong>.",
    "dialog.3": "Escribí <code>@help</code> en el grupo. Listo.",
    "dialog.save": "Guardar contacto",
    "dialog.open": "Abrir chat ↗",
    "dialog.manual": "O agendalo a mano: " + PHONE,
    "bot.web": "🔗 Tablero web:",
    "board.loginText":
      "Escribí <code>@web</code> en el chat de WhatsApp para recibir el link, o pegá la clave acá.",
    "board.key": "Clave",
    "board.enter": "Entrar",
    "board.logout": "Salir",
    "board.refresh": "Actualizar",
    "board.add": "+ Agregar ticket",
    "board.statusLabel": "Estado",
    "board.title": "Título",
    "board.description": "Descripción",
    "board.descPlaceholder": "Detalles, links, pasos…",
    "board.delete": "Borrar",
    "board.cancel": "Cancelar",
    "board.save": "Guardar",
    "board.meta": "Creado por {by} · {date}",
    "board.edited": " · editado {date}",
    "board.confirmDelete": "¿Borrar el ticket #{n}?",
    "board.invalidKey": "La clave no es válida o fue renovada con @web nueva.",
    "board.defaultName": "Tickets",
    "err.missing_title": "El ticket necesita un título.",
    "err.empty_title": "El ticket necesita un título.",
    "err.title_too_long": "El título es muy largo.",
    "err.description_too_long": "La descripción es muy larga.",
    "err.ticket_not_found": "Ese ticket ya no existe.",
    "err.generic": "Algo salió mal. Probá de nuevo.",
    "meta.terms.title": "Términos y condiciones — Kanbot",
    "terms.eyebrow": "Legal",
    "terms.title": "Términos y condiciones",
    "terms.lead":
      "Kanbot es un <mark>proyecto personal</mark> de Guido Faranna. No es una empresa ni un servicio comercial. Al usarlo (escribirle al bot, sumarlo a un grupo o entrar al tablero web) aceptás estos términos.",
    "terms.updated": "Última actualización: 28 de septiembre de 2026",
    "terms.note": "",
    "t1.label": "01 — Qué es Kanbot",
    "t1.body":
      "<p>Kanbot es un bot de WhatsApp para organizar tareas con comandos (<code>@add</code>, <code>@list</code>, <code>@done</code>, etc.) y un tablero web para verlas y editarlas.</p><p>Kanbot no está afiliado a WhatsApp ni a Meta. No usa la API oficial de WhatsApp: se conecta como un dispositivo vinculado, igual que WhatsApp Web.</p>",
    "t2.label": "02 — El número",
    "t2.body":
      "<p>El número de WhatsApp de Kanbot (" +
      PHONE +
      ") pertenece a <strong>Weball</strong>, una empresa de la que Guido Faranna es cofundador.</p>",
    "t3.label": "03 — Tus datos",
    "t3.body":
      "<p>Kanbot guarda solo lo necesario para funcionar:</p><ul><li>El identificador de cada chat donde se usa (en los chats privados, es tu número de teléfono; en los grupos, el identificador del grupo).</li><li>Las tareas: número, texto, descripción, estado, el nombre de WhatsApp de quien la creó y las fechas.</li><li>La clave del tablero web de cada chat y el nombre del grupo o contacto.</li><li>El idioma de cada chat, si se eligió uno con <code>@lang</code>.</li></ul><p>Para elegir el idioma, el bot mira el código de país del número de quien escribe. Ese dato no se guarda.</p><p>En los grupos, el bot recibe los mensajes como cualquier participante, pero solo guarda las tareas que se crean con comandos. El resto de la charla no se guarda.</p><p>Todo se guarda en archivos <code>.json</code> dentro de un servidor (droplet) de DigitalOcean. Los datos no se venden ni se comparten con terceros.</p><p>Cualquier persona que tenga el link del tablero web de un chat puede ver y editar sus tareas. Para invalidar el link, escribí <code>@web nueva</code> en ese chat.</p>",
    "t4.label": "04 — Plan gratis",
    "t4.body":
      '<p>El plan gratis está sujeto a lo siguiente:</p><ol class="legal-list"><li><span><strong>Es decisión 100% de Guido Faranna.</strong> El servicio puede cambiar, pausarse o darse de baja en cualquier momento.</span></li><li><span><strong>Si querés recuperar tu información</strong>, enviá un email a <a href="mailto:guido@weball.me">guido@weball.me</a>. Tus tareas las podés borrar vos mismo con <code>@remove</code>.</span></li><li><span><strong>Puede haber límites</strong> si Kanbot empieza a ser usado por mucha gente.</span></li></ol>',
    "t5.label": "05 — Sin garantías",
    "t5.body":
      "<p>Kanbot se ofrece tal cual, sin garantía de disponibilidad ni de que los datos no se pierdan. No lo uses para información sensible o crítica.</p>",
    "t6.label": "06 — Cambios",
    "t6.body":
      "<p>Estos términos pueden cambiar. La versión vigente es siempre la que está en esta página, con su fecha de actualización.</p>",
    "t7.label": "07 — Contacto",
    "t7.body": '<p>Por cualquier consulta: <a href="mailto:guido@weball.me">guido@weball.me</a>.</p>',
  };

  D.en = {
    locale: "en-US",
    "lang.label": "Language",
    "nav.how": "How it works",
    "nav.pricing": "Pricing",
    "cta.try": "Try it free",
    "meta.landing.title": "Kanbot — Organize your team without leaving WhatsApp",
    "meta.landing.description":
      "Kanbot is a task board that lives in your WhatsApp chats. @add, @list, @done and that's it. Free, no apps, no accounts.",
    "hero.eyebrow": "Tasks in WhatsApp",
    "hero.title": "Organize your team without leaving <mark>WhatsApp</mark>.",
    "hero.lead":
      "Kanbot is a task board that lives in your chats. Type <code>@add</code> and your group has its own Trello.",
    "cta.chat": "Chat with Kanbot ↗",
    "cta.group": "Add to a group",
    "facts.free": "Free",
    "facts.noApps": "No apps",
    "facts.noAccounts": "No accounts",
    "status.todo": "To do",
    "status.doing": "Doing",
    "status.done": "Done",
    "task.1": "Design the landing page",
    "task.2": "Set up the domain",
    "task.3": "Record the video",
    "chat.group": "Launch Team",
    "chat.input": "Message",
    marquee:
      "Work teams|Building committees|Families|Trips with friends|Startups|Clubs|Moving house|Events|Birthdays|Agencies|Freelancers|College projects",
    "story.title": "Four commands. <mark>That's it.</mark>",
    step: "Step",
    "step1.title": "Jot it down in seconds.",
    "step1.text":
      "Anyone in the group types <code>@add</code> (or <code>@@</code>) and the task is saved, numbered and visible to everyone. No other app to open.",
    "step2.title": "Everyone sees the same thing.",
    "step2.text":
      "One <code>@list</code> and the whole group knows what's left. No more spreadsheets, no more “who was on that?”.",
    "step3.title": "Cross off what you finished.",
    "step3.text":
      "<code>@doing</code> when you start, <code>@done</code> when you finish. The board sorts itself out and everyone knows.",
    "step4.title": "And when you want the big picture…",
    "step4.text":
      "Kanbot sends you a link to a kanban board: columns, drag and drop, long descriptions. No accounts or passwords.",
    "features.title": "Your team already lives in WhatsApp. Now so do its tasks.",
    "f1.label": "Groups",
    "f1.title": "Built for groups",
    "f1.text": "Add it to a group and the board belongs to everyone. In a private chat, it's your personal list.",
    "f2.label": "Languages",
    "f2.title": "Speaks your language",
    "f2.text":
      "It replies in Spanish, English, German, Italian or Swahili depending on the sender's country. Or pin one with @lang.",
    "f3.label": "Web",
    "f3.title": "A web board with one link",
    "f3.text": "Columns, drag and drop, long descriptions. It stays in sync with the chat.",
    "f4.label": "Speed",
    "f4.title": "Really fast",
    "f4.text": "Send the command and the reply is already there. No loading, no waiting.",
    "f5.label": "Quiet",
    "f5.title": "Never in the way",
    "f5.text": "In groups it only speaks when you call it. The conversation goes on as usual.",
    "f6.label": "Code",
    "f6.title": "Open source",
    "f6.text": "All the code is on GitHub. No black boxes holding your data.",
    "pricing.title": "Pricing",
    "free.price": "Free",
    "free.desc": "Add Kanbot to your chats and start now. Forever.",
    "free.1": "Groups and private chats",
    "free.2": "Unlimited boards",
    "free.3": "A web board with one link",
    "free.4": "No accounts or cards",
    "free.terms": 'Subject to the <a href="/terminos">terms</a>',
    "free.cta": "Start for free ↗",
    "self.once": "One-time payment",
    "self.desc":
      "Your own Kanbot, with your number and your data on your server. We guide you and leave it up and running.",
    "self.1": "Full installation and setup",
    "self.2": "With your own WhatsApp number",
    "self.3": "Your data stays on your server",
    "self.4": "On a free server or a USD 4/month droplet",
    "self.cta": "I want mine ↗",
    "final.label": "04 — Get started",
    "final.title": "Get started in ten seconds.",
    "final.text": "Open the chat, type <code>@help</code> and you're set. Or add it straight to your group.",
    "footer.tagline": "Tasks in WhatsApp",
    "footer.sections": "Sections",
    "footer.links": "Links",
    "footer.terms": "Terms",
    "footer.strip": "© 2026 Kanbot · Not affiliated with WhatsApp or Meta",
    "dialog.head": "Add to a group",
    "dialog.close": "Close ✕",
    "dialog.title": "Add Kanbot to your group",
    "dialog.1": "<strong>Save Kanbot's contact</strong> on your phone.",
    "dialog.2": "In the group: <strong>Group info → Add participant → Kanbot</strong>.",
    "dialog.3": "Type <code>@help</code> in the group. Done.",
    "dialog.save": "Save contact",
    "dialog.open": "Open chat ↗",
    "dialog.manual": "Or add it manually: " + PHONE,
    "bot.web": "🔗 Web board:",
    "board.loginText": "Type <code>@web</code> in the WhatsApp chat to get the link, or paste the key here.",
    "board.key": "Key",
    "board.enter": "Enter",
    "board.logout": "Log out",
    "board.refresh": "Refresh",
    "board.add": "+ Add ticket",
    "board.statusLabel": "Status",
    "board.title": "Title",
    "board.description": "Description",
    "board.descPlaceholder": "Details, links, steps…",
    "board.delete": "Delete",
    "board.cancel": "Cancel",
    "board.save": "Save",
    "board.meta": "Created by {by} · {date}",
    "board.edited": " · edited {date}",
    "board.confirmDelete": "Delete ticket #{n}?",
    "board.invalidKey": "The key is not valid or was renewed with @web new.",
    "board.defaultName": "Tickets",
    "err.missing_title": "The ticket needs a title.",
    "err.empty_title": "The ticket needs a title.",
    "err.title_too_long": "The title is too long.",
    "err.description_too_long": "The description is too long.",
    "err.ticket_not_found": "That ticket no longer exists.",
    "err.generic": "Something went wrong. Try again.",
    "meta.terms.title": "Terms and conditions — Kanbot",
    "terms.eyebrow": "Legal",
    "terms.title": "Terms and conditions",
    "terms.lead":
      "Kanbot is a <mark>personal project</mark> by Guido Faranna. It is not a company or a commercial service. By using it (messaging the bot, adding it to a group or opening the web board) you accept these terms.",
    "terms.updated": "Last updated: September 28, 2026",
    "terms.note": "This is a courtesy translation. If there are differences, the Spanish version prevails.",
    "t1.label": "01 — What Kanbot is",
    "t1.body":
      "<p>Kanbot is a WhatsApp bot to organize tasks with commands (<code>@add</code>, <code>@list</code>, <code>@done</code>, etc.) plus a web board to view and edit them.</p><p>Kanbot is not affiliated with WhatsApp or Meta. It does not use the official WhatsApp API: it connects as a linked device, just like WhatsApp Web.</p>",
    "t2.label": "02 — The number",
    "t2.body":
      "<p>Kanbot's WhatsApp number (" +
      PHONE +
      ") belongs to <strong>Weball</strong>, a company co-founded by Guido Faranna.</p>",
    "t3.label": "03 — Your data",
    "t3.body":
      "<p>Kanbot only stores what it needs to work:</p><ul><li>The identifier of each chat where it's used (in private chats, that's your phone number; in groups, the group's identifier).</li><li>The tasks: number, text, description, status, the WhatsApp name of whoever created it, and the dates.</li><li>The web board key for each chat and the name of the group or contact.</li><li>Each chat's language, if one was set with <code>@lang</code>.</li></ul><p>To pick a language, the bot looks at the country code of the sender's number. That is not stored.</p><p>In groups, the bot receives messages like any other participant, but it only stores tasks created with commands. The rest of the conversation is not stored.</p><p>Everything is stored in <code>.json</code> files on a DigitalOcean server (droplet). The data is not sold or shared with third parties.</p><p>Anyone with the link to a chat's web board can view and edit its tasks. To revoke the link, type <code>@web new</code> in that chat.</p>",
    "t4.label": "04 — Free plan",
    "t4.body":
      '<p>The free plan is subject to the following:</p><ol class="legal-list"><li><span><strong>It is entirely Guido Faranna\'s decision.</strong> The service may change, be paused or be shut down at any time.</span></li><li><span><strong>If you want to recover your information</strong>, send an email to <a href="mailto:guido@weball.me">guido@weball.me</a>. You can delete your tasks yourself with <code>@remove</code>.</span></li><li><span><strong>There may be limits</strong> if Kanbot starts being used by a lot of people.</span></li></ol>',
    "t5.label": "05 — No warranty",
    "t5.body":
      "<p>Kanbot is provided as is, with no guarantee of availability or that data won't be lost. Don't use it for sensitive or critical information.</p>",
    "t6.label": "06 — Changes",
    "t6.body":
      "<p>These terms may change. The current version is always the one on this page, with its last-updated date.</p>",
    "t7.label": "07 — Contact",
    "t7.body": '<p>For any questions: <a href="mailto:guido@weball.me">guido@weball.me</a>.</p>',
  };

  D.de = {
    locale: "de-DE",
    "lang.label": "Sprache",
    "nav.how": "So funktioniert's",
    "nav.pricing": "Preise",
    "cta.try": "Kostenlos testen",
    "meta.landing.title": "Kanbot — Organisiere dein Team, ohne WhatsApp zu verlassen",
    "meta.landing.description":
      "Kanbot ist ein Aufgaben-Board, das in deinen WhatsApp-Chats lebt. @add, @list, @done – fertig. Kostenlos, ohne Apps, ohne Konten.",
    "hero.eyebrow": "Aufgaben in WhatsApp",
    "hero.title": "Organisiere dein Team, ohne <mark>WhatsApp</mark> zu verlassen.",
    "hero.lead":
      "Kanbot ist ein Aufgaben-Board, das in deinen Chats lebt. Schreib <code>@add</code> und deine Gruppe hat ihr eigenes Trello.",
    "cta.chat": "Mit Kanbot chatten ↗",
    "cta.group": "Zu einer Gruppe hinzufügen",
    "facts.free": "Kostenlos",
    "facts.noApps": "Keine Apps",
    "facts.noAccounts": "Keine Konten",
    "status.todo": "Zu erledigen",
    "status.doing": "In Arbeit",
    "status.done": "Erledigt",
    "task.1": "Landingpage gestalten",
    "task.2": "Domain einrichten",
    "task.3": "Video aufnehmen",
    "chat.group": "Launch-Team",
    "chat.input": "Nachricht",
    marquee:
      "Arbeitsteams|Hausgemeinschaften|Familien|Reisen mit Freunden|Startups|Vereine|Umzüge|Events|Geburtstage|Agenturen|Freelancer|Uni-Projekte",
    "story.title": "Vier Befehle. <mark>Das ist alles.</mark>",
    step: "Schritt",
    "step1.title": "In Sekunden notiert.",
    "step1.text":
      "Jeder in der Gruppe schreibt <code>@add</code> (oder <code>@@</code>) und die Aufgabe ist gespeichert, nummeriert und für alle sichtbar. Ohne eine andere App zu öffnen.",
    "step2.title": "Alle sehen dasselbe.",
    "step2.text":
      "Ein <code>@list</code> und die ganze Gruppe weiß, was noch fehlt. Schluss mit Tabellen und „Wer war nochmal dran?“.",
    "step3.title": "Abhaken, was erledigt ist.",
    "step3.text":
      "<code>@doing</code>, wenn du anfängst, <code>@done</code>, wenn du fertig bist. Das Board ordnet sich von selbst und alle wissen Bescheid.",
    "step4.title": "Und wenn du alles auf einen Blick willst …",
    "step4.text":
      "Kanbot schickt dir einen Link zu einem Kanban-Board: Spalten, Drag & Drop, lange Beschreibungen. Ohne Konten oder Passwörter.",
    "features.title": "Dein Team lebt schon in WhatsApp. Jetzt auch seine Aufgaben.",
    "f1.label": "Gruppen",
    "f1.title": "Für Gruppen gemacht",
    "f1.text": "Füg es einer Gruppe hinzu und das Board gehört allen. Im Einzelchat ist es deine persönliche Liste.",
    "f2.label": "Sprachen",
    "f2.title": "Spricht deine Sprache",
    "f2.text":
      "Es antwortet auf Spanisch, Englisch, Deutsch, Italienisch oder Swahili, je nach Land des Absenders. Oder leg sie mit @lang fest.",
    "f3.label": "Web",
    "f3.title": "Web-Board mit einem Link",
    "f3.text": "Spalten, Drag & Drop, lange Beschreibungen. Synchron mit dem Chat.",
    "f4.label": "Tempo",
    "f4.title": "Blitzschnell",
    "f4.text": "Befehl senden und die Antwort ist schon da. Kein Laden, kein Warten.",
    "f5.label": "Ruhe",
    "f5.title": "Stört nicht",
    "f5.text": "In Gruppen meldet es sich nur, wenn du es rufst. Der Chat läuft weiter wie immer.",
    "f6.label": "Code",
    "f6.title": "Open Source",
    "f6.text": "Der gesamte Code liegt auf GitHub. Keine Blackbox mit deinen Daten.",
    "pricing.title": "Preise",
    "free.price": "Kostenlos",
    "free.desc": "Füg Kanbot zu deinen Chats hinzu und leg los. Für immer.",
    "free.1": "Gruppen und Einzelchats",
    "free.2": "Unbegrenzte Boards",
    "free.3": "Web-Board mit einem Link",
    "free.4": "Keine Konten, keine Karten",
    "free.terms": 'Es gelten die <a href="/terminos">Bedingungen</a>',
    "free.cta": "Kostenlos starten ↗",
    "self.once": "Einmalzahlung",
    "self.desc":
      "Dein eigenes Kanbot, mit deiner Nummer und deinen Daten auf deinem Server. Wir begleiten dich und übergeben es lauffähig.",
    "self.1": "Komplette Installation und Einrichtung",
    "self.2": "Mit deiner eigenen WhatsApp-Nummer",
    "self.3": "Deine Daten bleiben auf deinem Server",
    "self.4": "Auf einem kostenlosen Server oder einem Droplet für 4 USD/Monat",
    "self.cta": "Ich will meins ↗",
    "final.label": "04 — Loslegen",
    "final.title": "In zehn Sekunden startklar.",
    "final.text": "Öffne den Chat, schreib <code>@help</code> und fertig. Oder füg es direkt deiner Gruppe hinzu.",
    "footer.tagline": "Aufgaben in WhatsApp",
    "footer.sections": "Bereiche",
    "footer.links": "Links",
    "footer.terms": "Bedingungen",
    "footer.strip": "© 2026 Kanbot · Nicht mit WhatsApp oder Meta verbunden",
    "dialog.head": "Zu einer Gruppe hinzufügen",
    "dialog.close": "Schließen ✕",
    "dialog.title": "Kanbot zu deiner Gruppe hinzufügen",
    "dialog.1": "<strong>Speichere den Kontakt</strong> von Kanbot auf deinem Handy.",
    "dialog.2": "In der Gruppe: <strong>Gruppeninfo → Teilnehmer hinzufügen → Kanbot</strong>.",
    "dialog.3": "Schreib <code>@help</code> in die Gruppe. Fertig.",
    "dialog.save": "Kontakt speichern",
    "dialog.open": "Chat öffnen ↗",
    "dialog.manual": "Oder manuell speichern: " + PHONE,
    "bot.web": "🔗 Web-Board:",
    "board.loginText":
      "Schreib <code>@web</code> in den WhatsApp-Chat, um den Link zu bekommen, oder füge den Schlüssel hier ein.",
    "board.key": "Schlüssel",
    "board.enter": "Öffnen",
    "board.logout": "Abmelden",
    "board.refresh": "Aktualisieren",
    "board.add": "+ Ticket hinzufügen",
    "board.statusLabel": "Status",
    "board.title": "Titel",
    "board.description": "Beschreibung",
    "board.descPlaceholder": "Details, Links, Schritte …",
    "board.delete": "Löschen",
    "board.cancel": "Abbrechen",
    "board.save": "Speichern",
    "board.meta": "Erstellt von {by} · {date}",
    "board.edited": " · bearbeitet {date}",
    "board.confirmDelete": "Ticket #{n} löschen?",
    "board.invalidKey": "Der Schlüssel ist ungültig oder wurde mit @web neu erneuert.",
    "board.defaultName": "Tickets",
    "err.missing_title": "Das Ticket braucht einen Titel.",
    "err.empty_title": "Das Ticket braucht einen Titel.",
    "err.title_too_long": "Der Titel ist zu lang.",
    "err.description_too_long": "Die Beschreibung ist zu lang.",
    "err.ticket_not_found": "Dieses Ticket gibt es nicht mehr.",
    "err.generic": "Etwas ist schiefgelaufen. Versuch es nochmal.",
    "meta.terms.title": "Nutzungsbedingungen — Kanbot",
    "terms.eyebrow": "Rechtliches",
    "terms.title": "Nutzungsbedingungen",
    "terms.lead":
      "Kanbot ist ein <mark>persönliches Projekt</mark> von Guido Faranna. Es ist weder ein Unternehmen noch ein kommerzieller Dienst. Wer es nutzt (dem Bot schreibt, es einer Gruppe hinzufügt oder das Web-Board öffnet), akzeptiert diese Bedingungen.",
    "terms.updated": "Zuletzt aktualisiert: 28. September 2026",
    "terms.note": "Dies ist eine Übersetzung aus Gefälligkeit. Bei Abweichungen gilt die spanische Fassung.",
    "t1.label": "01 — Was Kanbot ist",
    "t1.body":
      "<p>Kanbot ist ein WhatsApp-Bot, um Aufgaben mit Befehlen zu organisieren (<code>@add</code>, <code>@list</code>, <code>@done</code> usw.), plus ein Web-Board, um sie anzusehen und zu bearbeiten.</p><p>Kanbot ist nicht mit WhatsApp oder Meta verbunden. Es nutzt nicht die offizielle WhatsApp-API, sondern verbindet sich als verknüpftes Gerät, genau wie WhatsApp Web.</p>",
    "t2.label": "02 — Die Nummer",
    "t2.body":
      "<p>Die WhatsApp-Nummer von Kanbot (" +
      PHONE +
      ") gehört <strong>Weball</strong>, einem Unternehmen, das Guido Faranna mitgegründet hat.</p>",
    "t3.label": "03 — Deine Daten",
    "t3.body":
      "<p>Kanbot speichert nur, was es zum Funktionieren braucht:</p><ul><li>Die Kennung jedes Chats, in dem es genutzt wird (in Einzelchats ist das deine Telefonnummer, in Gruppen die Kennung der Gruppe).</li><li>Die Aufgaben: Nummer, Text, Beschreibung, Status, der WhatsApp-Name der Person, die sie erstellt hat, und die Daten.</li><li>Den Schlüssel des Web-Boards jedes Chats und den Namen der Gruppe oder des Kontakts.</li><li>Die Sprache jedes Chats, falls eine mit <code>@lang</code> festgelegt wurde.</li></ul><p>Um die Sprache zu wählen, schaut der Bot auf die Ländervorwahl der Nummer, von der geschrieben wird. Diese wird nicht gespeichert.</p><p>In Gruppen empfängt der Bot die Nachrichten wie jedes andere Mitglied, speichert aber nur Aufgaben, die mit Befehlen erstellt werden. Der Rest des Chats wird nicht gespeichert.</p><p>Alles wird in <code>.json</code>-Dateien auf einem Server (Droplet) von DigitalOcean gespeichert. Die Daten werden weder verkauft noch an Dritte weitergegeben.</p><p>Wer den Link zum Web-Board eines Chats hat, kann dessen Aufgaben sehen und bearbeiten. Um den Link ungültig zu machen, schreib <code>@web neu</code> in diesen Chat.</p>",
    "t4.label": "04 — Kostenloser Plan",
    "t4.body":
      '<p>Für den kostenlosen Plan gilt Folgendes:</p><ol class="legal-list"><li><span><strong>Es ist allein die Entscheidung von Guido Faranna.</strong> Der Dienst kann sich jederzeit ändern, pausiert oder eingestellt werden.</span></li><li><span><strong>Wenn du deine Daten zurückhaben willst</strong>, schick eine E-Mail an <a href="mailto:guido@weball.me">guido@weball.me</a>. Deine Aufgaben kannst du selbst mit <code>@remove</code> löschen.</span></li><li><span><strong>Es kann Grenzen geben</strong>, wenn Kanbot von sehr vielen Menschen genutzt wird.</span></li></ol>',
    "t5.label": "05 — Keine Gewährleistung",
    "t5.body":
      "<p>Kanbot wird so bereitgestellt, wie es ist, ohne Garantie für Verfügbarkeit oder dafür, dass keine Daten verloren gehen. Nutze es nicht für sensible oder kritische Informationen.</p>",
    "t6.label": "06 — Änderungen",
    "t6.body":
      "<p>Diese Bedingungen können sich ändern. Gültig ist immer die Fassung auf dieser Seite mit ihrem Aktualisierungsdatum.</p>",
    "t7.label": "07 — Kontakt",
    "t7.body": '<p>Bei Fragen: <a href="mailto:guido@weball.me">guido@weball.me</a>.</p>',
  };

  D.it = {
    locale: "it-IT",
    "lang.label": "Lingua",
    "nav.how": "Come funziona",
    "nav.pricing": "Prezzi",
    "cta.try": "Prova gratis",
    "meta.landing.title": "Kanbot — Organizza il tuo team senza uscire da WhatsApp",
    "meta.landing.description":
      "Kanbot è una bacheca di attività che vive nelle tue chat di WhatsApp. @add, @list, @done e basta. Gratis, senza app e senza account.",
    "hero.eyebrow": "Attività su WhatsApp",
    "hero.title": "Organizza il tuo team senza uscire da <mark>WhatsApp</mark>.",
    "hero.lead":
      "Kanbot è una bacheca di attività che vive nelle tue chat. Scrivi <code>@add</code> e il tuo gruppo ha già il suo Trello.",
    "cta.chat": "Scrivi a Kanbot ↗",
    "cta.group": "Aggiungi a un gruppo",
    "facts.free": "Gratis",
    "facts.noApps": "Senza app",
    "facts.noAccounts": "Senza account",
    "status.todo": "Da fare",
    "status.doing": "In corso",
    "status.done": "Fatto",
    "task.1": "Progettare la landing",
    "task.2": "Configurare il dominio",
    "task.3": "Registrare il video",
    "chat.group": "Team Lancio",
    "chat.input": "Messaggio",
    marquee:
      "Team di lavoro|Condomini|Famiglie|Viaggi con amici|Startup|Club|Traslochi|Eventi|Compleanni|Agenzie|Freelance|Progetti universitari",
    "story.title": "Quattro comandi. <mark>Tutto qui.</mark>",
    step: "Passo",
    "step1.title": "Annota in pochi secondi.",
    "step1.text":
      "Chiunque nel gruppo scrive <code>@add</code> (o <code>@@</code>) e l'attività viene salvata, numerata e visibile a tutti. Senza aprire un'altra app.",
    "step2.title": "Tutti vedono la stessa cosa.",
    "step2.text":
      "Un <code>@list</code> e tutto il gruppo sa cosa manca. Addio fogli di calcolo, addio “chi se ne stava occupando?”.",
    "step3.title": "Spunta ciò che hai finito.",
    "step3.text":
      "<code>@doing</code> quando inizi, <code>@done</code> quando finisci. La bacheca si riordina da sola e tutti lo sanno.",
    "step4.title": "E quando vuoi vedere tutto insieme…",
    "step4.text":
      "Kanbot ti manda un link a una bacheca kanban: colonne, trascina e rilascia, descrizioni lunghe. Senza account né password.",
    "features.title": "Il tuo team vive già su WhatsApp. Ora anche le sue attività.",
    "f1.label": "Gruppi",
    "f1.title": "Fatto per i gruppi",
    "f1.text": "Aggiungilo al gruppo e la bacheca è di tutti. In privato, è la tua lista personale.",
    "f2.label": "Lingue",
    "f2.title": "Parla la tua lingua",
    "f2.text":
      "Risponde in spagnolo, inglese, tedesco, italiano o swahili a seconda del paese di chi scrive. Oppure fissala con @lang.",
    "f3.label": "Web",
    "f3.title": "Una bacheca web con un link",
    "f3.text": "Colonne, trascina e rilascia, descrizioni lunghe. Sincronizzata con la chat.",
    "f4.label": "Velocità",
    "f4.title": "Velocissimo",
    "f4.text": "Mandi il comando e la risposta è già lì. Niente caricamenti, niente attese.",
    "f5.label": "Silenzio",
    "f5.title": "Non disturba",
    "f5.text": "Nei gruppi parla solo quando lo chiami. La conversazione continua come sempre.",
    "f6.label": "Codice",
    "f6.title": "Open source",
    "f6.text": "Tutto il codice è su GitHub. Nessuna scatola nera con i tuoi dati.",
    "pricing.title": "Prezzi",
    "free.price": "Gratis",
    "free.desc": "Aggiungi Kanbot alle tue chat e inizia subito. Per sempre.",
    "free.1": "Gruppi e chat private",
    "free.2": "Bacheche illimitate",
    "free.3": "Bacheca web con un link",
    "free.4": "Niente account né carte",
    "free.terms": 'Soggetto ai <a href="/terminos">termini</a>',
    "free.cta": "Inizia gratis ↗",
    "self.once": "Pagamento unico",
    "self.desc":
      "Il tuo Kanbot, con il tuo numero e i tuoi dati sul tuo server. Ti guidiamo e lo lasciamo funzionante.",
    "self.1": "Installazione e configurazione completa",
    "self.2": "Con il tuo numero di WhatsApp",
    "self.3": "I tuoi dati restano sul tuo server",
    "self.4": "Su un server gratuito o un droplet da 4 USD/mese",
    "self.cta": "Voglio il mio ↗",
    "final.label": "04 — Inizia",
    "final.title": "Inizia in dieci secondi.",
    "final.text": "Apri la chat, scrivi <code>@help</code> e sei pronto. Oppure aggiungilo direttamente al tuo gruppo.",
    "footer.tagline": "Attività su WhatsApp",
    "footer.sections": "Sezioni",
    "footer.links": "Link",
    "footer.terms": "Termini",
    "footer.strip": "© 2026 Kanbot · Non affiliato a WhatsApp né a Meta",
    "dialog.head": "Aggiungi a un gruppo",
    "dialog.close": "Chiudi ✕",
    "dialog.title": "Aggiungi Kanbot al tuo gruppo",
    "dialog.1": "<strong>Salva il contatto</strong> di Kanbot sul tuo telefono.",
    "dialog.2": "Nel gruppo: <strong>Info gruppo → Aggiungi partecipante → Kanbot</strong>.",
    "dialog.3": "Scrivi <code>@help</code> nel gruppo. Fatto.",
    "dialog.save": "Salva contatto",
    "dialog.open": "Apri la chat ↗",
    "dialog.manual": "Oppure salvalo a mano: " + PHONE,
    "bot.web": "🔗 Bacheca web:",
    "board.loginText":
      "Scrivi <code>@web</code> nella chat di WhatsApp per ricevere il link, oppure incolla qui la chiave.",
    "board.key": "Chiave",
    "board.enter": "Entra",
    "board.logout": "Esci",
    "board.refresh": "Aggiorna",
    "board.add": "+ Aggiungi ticket",
    "board.statusLabel": "Stato",
    "board.title": "Titolo",
    "board.description": "Descrizione",
    "board.descPlaceholder": "Dettagli, link, passaggi…",
    "board.delete": "Elimina",
    "board.cancel": "Annulla",
    "board.save": "Salva",
    "board.meta": "Creato da {by} · {date}",
    "board.edited": " · modificato {date}",
    "board.confirmDelete": "Eliminare il ticket #{n}?",
    "board.invalidKey": "La chiave non è valida o è stata rinnovata con @web nuovo.",
    "board.defaultName": "Ticket",
    "err.missing_title": "Il ticket ha bisogno di un titolo.",
    "err.empty_title": "Il ticket ha bisogno di un titolo.",
    "err.title_too_long": "Il titolo è troppo lungo.",
    "err.description_too_long": "La descrizione è troppo lunga.",
    "err.ticket_not_found": "Quel ticket non esiste più.",
    "err.generic": "Qualcosa è andato storto. Riprova.",
    "meta.terms.title": "Termini e condizioni — Kanbot",
    "terms.eyebrow": "Note legali",
    "terms.title": "Termini e condizioni",
    "terms.lead":
      "Kanbot è un <mark>progetto personale</mark> di Guido Faranna. Non è un'azienda né un servizio commerciale. Usandolo (scrivendo al bot, aggiungendolo a un gruppo o aprendo la bacheca web) accetti questi termini.",
    "terms.updated": "Ultimo aggiornamento: 28 settembre 2026",
    "terms.note": "Questa è una traduzione di cortesia. In caso di differenze, prevale la versione in spagnolo.",
    "t1.label": "01 — Cos'è Kanbot",
    "t1.body":
      "<p>Kanbot è un bot di WhatsApp per organizzare attività con comandi (<code>@add</code>, <code>@list</code>, <code>@done</code>, ecc.) e una bacheca web per vederle e modificarle.</p><p>Kanbot non è affiliato a WhatsApp né a Meta. Non usa l'API ufficiale di WhatsApp: si collega come dispositivo collegato, proprio come WhatsApp Web.</p>",
    "t2.label": "02 — Il numero",
    "t2.body":
      "<p>Il numero WhatsApp di Kanbot (" +
      PHONE +
      ") appartiene a <strong>Weball</strong>, un'azienda di cui Guido Faranna è cofondatore.</p>",
    "t3.label": "03 — I tuoi dati",
    "t3.body":
      "<p>Kanbot salva solo ciò che serve per funzionare:</p><ul><li>L'identificativo di ogni chat in cui viene usato (nelle chat private è il tuo numero di telefono; nei gruppi, l'identificativo del gruppo).</li><li>Le attività: numero, testo, descrizione, stato, il nome WhatsApp di chi l'ha creata e le date.</li><li>La chiave della bacheca web di ogni chat e il nome del gruppo o del contatto.</li><li>La lingua di ogni chat, se ne è stata impostata una con <code>@lang</code>.</li></ul><p>Per scegliere la lingua, il bot guarda il prefisso internazionale del numero di chi scrive. Questo dato non viene salvato.</p><p>Nei gruppi, il bot riceve i messaggi come qualsiasi partecipante, ma salva solo le attività create con i comandi. Il resto della conversazione non viene salvato.</p><p>Tutto viene salvato in file <code>.json</code> su un server (droplet) di DigitalOcean. I dati non vengono venduti né condivisi con terzi.</p><p>Chiunque abbia il link alla bacheca web di una chat può vederne e modificarne le attività. Per revocare il link, scrivi <code>@web nuovo</code> in quella chat.</p>",
    "t4.label": "04 — Piano gratuito",
    "t4.body":
      '<p>Il piano gratuito è soggetto a quanto segue:</p><ol class="legal-list"><li><span><strong>È una decisione al 100% di Guido Faranna.</strong> Il servizio può cambiare, essere sospeso o chiuso in qualsiasi momento.</span></li><li><span><strong>Se vuoi recuperare le tue informazioni</strong>, invia un\'email a <a href="mailto:guido@weball.me">guido@weball.me</a>. Le tue attività puoi eliminarle da solo con <code>@remove</code>.</span></li><li><span><strong>Potrebbero esserci dei limiti</strong> se Kanbot inizia a essere usato da molte persone.</span></li></ol>',
    "t5.label": "05 — Nessuna garanzia",
    "t5.body":
      "<p>Kanbot è fornito così com'è, senza garanzia di disponibilità né che i dati non vadano persi. Non usarlo per informazioni sensibili o critiche.</p>",
    "t6.label": "06 — Modifiche",
    "t6.body":
      "<p>Questi termini possono cambiare. La versione valida è sempre quella su questa pagina, con la sua data di aggiornamento.</p>",
    "t7.label": "07 — Contatti",
    "t7.body": '<p>Per qualsiasi domanda: <a href="mailto:guido@weball.me">guido@weball.me</a>.</p>',
  };

  D.sw = {
    locale: "sw-KE",
    "lang.label": "Lugha",
    "nav.how": "Jinsi inavyofanya kazi",
    "nav.pricing": "Bei",
    "cta.try": "Jaribu bure",
    "meta.landing.title": "Kanbot — Panga timu yako bila kutoka WhatsApp",
    "meta.landing.description":
      "Kanbot ni ubao wa kazi unaoishi ndani ya mazungumzo yako ya WhatsApp. @add, @list, @done basi. Bure, bila programu, bila akaunti.",
    "hero.eyebrow": "Kazi ndani ya WhatsApp",
    "hero.title": "Panga timu yako bila kutoka <mark>WhatsApp</mark>.",
    "hero.lead":
      "Kanbot ni ubao wa kazi unaoishi ndani ya mazungumzo yako. Andika <code>@add</code> na kikundi chako kina Trello yake.",
    "cta.chat": "Ongea na Kanbot ↗",
    "cta.group": "Ongeza kwenye kikundi",
    "facts.free": "Bure",
    "facts.noApps": "Bila programu",
    "facts.noAccounts": "Bila akaunti",
    "status.todo": "Za kufanya",
    "status.doing": "Zinaendelea",
    "status.done": "Zimekamilika",
    "task.1": "Kubuni ukurasa wa mwanzo",
    "task.2": "Kusanidi kikoa",
    "task.3": "Kurekodi video",
    "chat.group": "Timu ya Uzinduzi",
    "chat.input": "Ujumbe",
    marquee:
      "Timu za kazi|Majirani wa jengo|Familia|Safari na marafiki|Startups|Vilabu|Kuhama nyumba|Matukio|Siku za kuzaliwa|Mashirika|Wafanyakazi huru|Miradi ya chuo",
    "story.title": "Amri nne. <mark>Basi.</mark>",
    step: "Hatua",
    "step1.title": "Andika kwa sekunde chache.",
    "step1.text":
      "Yeyote kwenye kikundi anaandika <code>@add</code> (au <code>@@</code>) na kazi inahifadhiwa, inapewa namba na inaonekana kwa wote. Bila kufungua programu nyingine.",
    "step2.title": "Wote wanaona kitu kimoja.",
    "step2.text":
      "<code>@list</code> moja na kikundi kizima kinajua kilichobaki. Hakuna tena majedwali wala “nani alikuwa anashughulikia hilo?”.",
    "step3.title": "Weka alama kwenye ulichomaliza.",
    "step3.text":
      "<code>@doing</code> unapoanza, <code>@done</code> unapomaliza. Ubao unajipanga wenyewe na kila mtu anajua.",
    "step4.title": "Na ukitaka kuona kila kitu pamoja…",
    "step4.text":
      "Kanbot inakutumia kiungo cha ubao wa kanban: safu, buruta na uachilie, maelezo marefu. Bila akaunti wala nenosiri.",
    "features.title": "Timu yako tayari iko WhatsApp. Sasa na kazi zake pia.",
    "f1.label": "Vikundi",
    "f1.title": "Imetengenezwa kwa vikundi",
    "f1.text":
      "Iongeze kwenye kikundi na ubao ni wa kila mtu. Kwenye mazungumzo ya faragha, ni orodha yako binafsi.",
    "f2.label": "Lugha",
    "f2.title": "Inaongea lugha yako",
    "f2.text":
      "Inajibu kwa Kihispania, Kiingereza, Kijerumani, Kiitaliano au Kiswahili kulingana na nchi ya anayeandika. Au iweke kwa @lang.",
    "f3.label": "Wavuti",
    "f3.title": "Ubao wa wavuti kwa kiungo kimoja",
    "f3.text": "Safu, buruta na uachilie, maelezo marefu. Unaendana na mazungumzo.",
    "f4.label": "Kasi",
    "f4.title": "Haraka sana",
    "f4.text": "Tuma amri na jibu liko tayari. Bila kusubiri.",
    "f5.label": "Kimya",
    "f5.title": "Haisumbui",
    "f5.text": "Kwenye vikundi inaongea tu unapoiita. Mazungumzo yanaendelea kama kawaida.",
    "f6.label": "Msimbo",
    "f6.title": "Chanzo huria",
    "f6.text": "Msimbo wote uko GitHub. Hakuna siri kuhusu data yako.",
    "pricing.title": "Bei",
    "free.price": "Bure",
    "free.desc": "Ongeza Kanbot kwenye mazungumzo yako na uanze sasa. Milele.",
    "free.1": "Vikundi na mazungumzo ya faragha",
    "free.2": "Mbao bila kikomo",
    "free.3": "Ubao wa wavuti kwa kiungo kimoja",
    "free.4": "Bila akaunti wala kadi",
    "free.terms": 'Kwa kuzingatia <a href="/terminos">masharti</a>',
    "free.cta": "Anza bure ↗",
    "self.once": "Malipo ya mara moja",
    "self.desc":
      "Kanbot yako mwenyewe, kwa namba yako na data yako kwenye seva yako. Tunakuongoza na kuiacha ikifanya kazi.",
    "self.1": "Usakinishaji na usanidi kamili",
    "self.2": "Kwa namba yako ya WhatsApp",
    "self.3": "Data yako inabaki kwenye seva yako",
    "self.4": "Kwenye seva ya bure au droplet ya USD 4 kwa mwezi",
    "self.cta": "Nataka yangu ↗",
    "final.label": "04 — Anza",
    "final.title": "Anza kwa sekunde kumi.",
    "final.text": "Fungua mazungumzo, andika <code>@help</code> basi. Au iongeze moja kwa moja kwenye kikundi chako.",
    "footer.tagline": "Kazi ndani ya WhatsApp",
    "footer.sections": "Sehemu",
    "footer.links": "Viungo",
    "footer.terms": "Masharti",
    "footer.strip": "© 2026 Kanbot · Haihusiani na WhatsApp wala Meta",
    "dialog.head": "Ongeza kwenye kikundi",
    "dialog.close": "Funga ✕",
    "dialog.title": "Ongeza Kanbot kwenye kikundi chako",
    "dialog.1": "<strong>Hifadhi mawasiliano</strong> ya Kanbot kwenye simu yako.",
    "dialog.2": "Kwenye kikundi: <strong>Maelezo ya kikundi → Ongeza mshiriki → Kanbot</strong>.",
    "dialog.3": "Andika <code>@help</code> kwenye kikundi. Tayari.",
    "dialog.save": "Hifadhi mawasiliano",
    "dialog.open": "Fungua mazungumzo ↗",
    "dialog.manual": "Au ihifadhi mwenyewe: " + PHONE,
    "bot.web": "🔗 Ubao wa wavuti:",
    "board.loginText":
      "Andika <code>@web</code> kwenye mazungumzo ya WhatsApp kupata kiungo, au bandika ufunguo hapa.",
    "board.key": "Ufunguo",
    "board.enter": "Ingia",
    "board.logout": "Toka",
    "board.refresh": "Onyesha upya",
    "board.add": "+ Ongeza tiketi",
    "board.statusLabel": "Hali",
    "board.title": "Kichwa",
    "board.description": "Maelezo",
    "board.descPlaceholder": "Maelezo, viungo, hatua…",
    "board.delete": "Futa",
    "board.cancel": "Ghairi",
    "board.save": "Hifadhi",
    "board.meta": "Imeundwa na {by} · {date}",
    "board.edited": " · imehaririwa {date}",
    "board.confirmDelete": "Ufute tiketi #{n}?",
    "board.invalidKey": "Ufunguo si sahihi au ulibadilishwa kwa @web mpya.",
    "board.defaultName": "Tiketi",
    "err.missing_title": "Tiketi inahitaji kichwa.",
    "err.empty_title": "Tiketi inahitaji kichwa.",
    "err.title_too_long": "Kichwa ni kirefu mno.",
    "err.description_too_long": "Maelezo ni marefu mno.",
    "err.ticket_not_found": "Tiketi hiyo haipo tena.",
    "err.generic": "Kuna hitilafu. Jaribu tena.",
    "meta.terms.title": "Sheria na masharti — Kanbot",
    "terms.eyebrow": "Kisheria",
    "terms.title": "Sheria na masharti",
    "terms.lead":
      "Kanbot ni <mark>mradi binafsi</mark> wa Guido Faranna. Si kampuni wala huduma ya kibiashara. Kwa kuitumia (kuiandikia bot, kuiongeza kwenye kikundi au kufungua ubao wa wavuti) unakubali masharti haya.",
    "terms.updated": "Ilisasishwa mwisho: 28 Septemba 2026",
    "terms.note": "Hii ni tafsiri ya hisani. Kukiwa na tofauti, toleo la Kihispania ndilo linalotumika.",
    "t1.label": "01 — Kanbot ni nini",
    "t1.body":
      "<p>Kanbot ni bot ya WhatsApp ya kupanga kazi kwa amri (<code>@add</code>, <code>@list</code>, <code>@done</code>, n.k.) pamoja na ubao wa wavuti wa kuziona na kuzihariri.</p><p>Kanbot haihusiani na WhatsApp wala Meta. Haitumii API rasmi ya WhatsApp: inaunganishwa kama kifaa kilichounganishwa, sawa na WhatsApp Web.</p>",
    "t2.label": "02 — Namba",
    "t2.body":
      "<p>Namba ya WhatsApp ya Kanbot (" +
      PHONE +
      ") ni mali ya <strong>Weball</strong>, kampuni ambayo Guido Faranna ni mwanzilishi mwenza.</p>",
    "t3.label": "03 — Data yako",
    "t3.body":
      "<p>Kanbot huhifadhi kile tu inachohitaji ili kufanya kazi:</p><ul><li>Kitambulisho cha kila mazungumzo inapotumika (kwenye mazungumzo ya faragha ni namba yako ya simu; kwenye vikundi, kitambulisho cha kikundi).</li><li>Kazi: namba, maandishi, maelezo, hali, jina la WhatsApp la aliyeiunda na tarehe.</li><li>Ufunguo wa ubao wa wavuti wa kila mazungumzo na jina la kikundi au mwasiliani.</li><li>Lugha ya kila mazungumzo, ikiwa iliwekwa kwa <code>@lang</code>.</li></ul><p>Ili kuchagua lugha, bot inaangalia msimbo wa nchi wa namba ya anayeandika. Hilo halihifadhiwi.</p><p>Kwenye vikundi, bot hupokea jumbe kama mshiriki mwingine yeyote, lakini huhifadhi tu kazi zinazoundwa kwa amri. Mazungumzo mengine hayahifadhiwi.</p><p>Kila kitu kinahifadhiwa kwenye faili za <code>.json</code> ndani ya seva (droplet) ya DigitalOcean. Data haiuzwi wala haishirikiwi na watu wengine.</p><p>Yeyote mwenye kiungo cha ubao wa wavuti wa mazungumzo anaweza kuona na kuhariri kazi zake. Kukibatilisha kiungo, andika <code>@web mpya</code> kwenye mazungumzo hayo.</p>",
    "t4.label": "04 — Mpango wa bure",
    "t4.body":
      '<p>Mpango wa bure unategemea yafuatayo:</p><ol class="legal-list"><li><span><strong>Ni uamuzi wa Guido Faranna kwa asilimia 100.</strong> Huduma inaweza kubadilika, kusitishwa au kufungwa wakati wowote.</span></li><li><span><strong>Ukitaka kurejesha taarifa zako</strong>, tuma barua pepe kwa <a href="mailto:guido@weball.me">guido@weball.me</a>. Kazi zako unaweza kuzifuta mwenyewe kwa <code>@remove</code>.</span></li><li><span><strong>Kunaweza kuwa na vikomo</strong> ikiwa Kanbot itaanza kutumiwa na watu wengi.</span></li></ol>',
    "t5.label": "05 — Bila dhamana",
    "t5.body":
      "<p>Kanbot inatolewa kama ilivyo, bila dhamana ya upatikanaji wala kwamba data haitapotea. Usiitumie kwa taarifa nyeti au muhimu sana.</p>",
    "t6.label": "06 — Mabadiliko",
    "t6.body":
      "<p>Masharti haya yanaweza kubadilika. Toleo linalotumika ni lile lililo kwenye ukurasa huu, pamoja na tarehe yake ya kusasishwa.</p>",
    "t7.label": "07 — Mawasiliano",
    "t7.body": '<p>Kwa swali lolote: <a href="mailto:guido@weball.me">guido@weball.me</a>.</p>',
  };

  // ---------- Detección ----------

  function storageGet() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storageSet(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
  }

  function supported(value) {
    return typeof value === "string" && LANGS.indexOf(value) !== -1;
  }

  /** Zonas horarias → idioma. Es "dónde está" la persona, sin mandar su IP a ningún lado. */
  var TZ = [
    [/^Europe\/(Berlin|Vienna|Zurich|Busingen|Vaduz)$/, "de"],
    [/^Europe\/(Rome|San_Marino|Vatican)$/, "it"],
    [/^Africa\/(Nairobi|Dar_es_Salaam|Kampala)$/, "sw"],
    [
      /^(America\/(Argentina\/.*|Buenos_Aires|Cordoba|Mendoza|Montevideo|Asuncion|Santiago|Punta_Arenas|La_Paz|Lima|Bogota|Caracas|Guayaquil|Mexico_City|Monterrey|Merida|Cancun|Chihuahua|Ciudad_Juarez|Hermosillo|Mazatlan|Tijuana|Matamoros|Ojinaga|Bahia_Banderas|Guatemala|Tegucigalpa|El_Salvador|Managua|Costa_Rica|Panama|Havana|Santo_Domingo|Puerto_Rico)|Europe\/Madrid|Africa\/Ceuta|Africa\/Malabo|Atlantic\/Canary|Pacific\/(Galapagos|Easter))$/,
      "es",
    ],
  ];

  function detect() {
    var saved = storageGet();
    if (supported(saved)) return { lang: saved, saved: true };

    var query = new URLSearchParams(location.search).get("lang");
    if (supported(query)) return { lang: query, saved: false };

    // Inglés no cuenta como señal: muchos navegadores lo traen por defecto. Para eso está la zona horaria.
    var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      var base = String(langs[i]).slice(0, 2).toLowerCase();
      if (base !== "en" && supported(base)) return { lang: base, saved: false };
    }

    var tz = "";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (e) {}
    for (var j = 0; j < TZ.length; j++) {
      if (TZ[j][0].test(tz)) return { lang: TZ[j][1], saved: false };
    }

    return { lang: "en", saved: false };
  }

  var detected = detect();
  var lang = detected.lang;
  var root = document.documentElement;
  root.lang = lang;
  if (lang !== "es") root.classList.add("i18n-pending");

  function t(key, vars) {
    var value = D[lang][key];
    if (value === undefined) value = D.es[key];
    if (value === undefined) value = key;
    if (vars) {
      value = value.replace(/\{(\w+)\}/g, function (_, name) {
        return vars[name] !== undefined ? String(vars[name]) : "";
      });
    }
    return value;
  }

  function apply(scope) {
    scope = scope || document;
    var nodes, k;
    nodes = scope.querySelectorAll("[data-i18n]");
    for (k = 0; k < nodes.length; k++) nodes[k].textContent = t(nodes[k].getAttribute("data-i18n"));
    nodes = scope.querySelectorAll("[data-i18n-html]");
    for (k = 0; k < nodes.length; k++) nodes[k].innerHTML = t(nodes[k].getAttribute("data-i18n-html"));
    ["placeholder", "title", "aria-label", "content"].forEach(function (attr) {
      var withAttr = scope.querySelectorAll("[data-i18n-" + attr + "]");
      for (var m = 0; m < withAttr.length; m++) {
        withAttr[m].setAttribute(attr, t(withAttr[m].getAttribute("data-i18n-" + attr)));
      }
    });
  }

  function setLang(next) {
    if (!supported(next)) return;
    storageSet(next);
    // Recargar es lo más simple: los chats animados y el tablero se arman de nuevo en el idioma nuevo.
    var url = new URL(location.href);
    url.searchParams.delete("lang");
    location.replace(url.pathname + url.search + url.hash);
  }

  window.i18n = {
    lang: lang,
    langs: LANGS.slice(),
    /** true si la persona eligió el idioma a mano (el tablero entonces no lo pisa con el del chat). */
    chosen: detected.saved,
    t: t,
    apply: apply,
    setLang: setLang,
    /** Para el test que verifica que todos los idiomas tengan las mismas claves. */
    dictionaries: D,
  };

  document.addEventListener("DOMContentLoaded", function () {
    apply(document);
    var selects = document.querySelectorAll("[data-lang-select]");
    for (var s = 0; s < selects.length; s++) {
      selects[s].value = lang;
      selects[s].addEventListener("change", function (e) {
        setLang(e.target.value);
      });
    }
    root.classList.remove("i18n-pending");
  });
})();
