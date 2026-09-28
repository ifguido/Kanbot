const BOT_PHONE = "5491170736993";

// Links viejos al tablero (kanbot.live/#clave) ahora viven en /board.
if (/^#[\w-]{16,}$/.test(location.hash)) location.replace(`/board${location.hash}`);

document.documentElement.classList.add("js");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- CTAs ----------

for (const link of document.querySelectorAll("[data-chat]")) {
  link.href = `https://wa.me/${BOT_PHONE}?text=${encodeURIComponent(link.dataset.chat || "@help")}`;
  link.target = "_blank";
  link.rel = "noopener";
}

const groupDialog = document.getElementById("group-dialog");
for (const button of document.querySelectorAll("[data-group]")) {
  button.addEventListener("click", () => groupDialog.showModal());
}
groupDialog.addEventListener("click", (e) => {
  if (e.target === groupDialog || e.target.closest("[data-close]")) groupDialog.close();
});

// ---------- Burbujas de chat ----------

const ME = "Sofi";
let minute = 32;

function bubble({ from, text }) {
  const el = document.createElement("div");
  el.className = `msg ${from === "Kanbot" ? "bot" : from === ME ? "me" : "them"}`;

  if (from !== ME) {
    const who = document.createElement("span");
    who.className = "who";
    who.dataset.person = from;
    who.textContent = from;
    el.append(who);
  }

  // *negrita* como en WhatsApp, y los @comandos resaltados.
  text.split("*").forEach((part, i) => {
    if (i % 2) {
      const strong = document.createElement("strong");
      strong.textContent = part;
      el.append(strong);
      return;
    }
    part.split(/(@\w+)/).forEach((piece, j) => {
      if (!piece) return;
      if (j % 2) {
        const at = document.createElement("span");
        at.className = "at";
        at.textContent = piece;
        el.append(at);
      } else {
        el.append(piece);
      }
    });
  });

  const time = document.createElement("span");
  time.className = "time";
  time.textContent = `10:${String(minute++ % 60).padStart(2, "0")}`;
  el.append(time);
  return el;
}

function typing() {
  const el = document.createElement("div");
  el.className = "msg bot typing";
  el.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
  return el;
}

// ---------- Hero: conversación en loop ----------

// Lo primero que se ve: cargar tareas y listarlas.
const HERO_SCRIPT = [
  { from: "Sofi", text: "@add Diseñar la landing" },
  { from: "Kanbot", text: "✅ #1 Diseñar la landing" },
  { from: "Martín", text: "@add Configurar el dominio" },
  { from: "Kanbot", text: "✅ #2 Configurar el dominio" },
  { from: "Caro", text: "@add Grabar el video" },
  { from: "Kanbot", text: "✅ #3 Grabar el video" },
  { from: "Martín", text: "@list" },
  { from: "Kanbot", text: "*Por hacer (3)*\n#1 Diseñar la landing\n#2 Configurar el dominio\n#3 Grabar el video" },
];

async function heroLoop(chat) {
  if (reduceMotion) {
    chat.replaceChildren(...HERO_SCRIPT.map(bubble));
    return;
  }
  for (;;) {
    chat.replaceChildren();
    await sleep(600);
    for (const message of HERO_SCRIPT) {
      if (message.from === "Kanbot") {
        const dots = typing();
        chat.append(dots);
        await sleep(650);
        dots.remove();
      }
      chat.append(bubble(message));
      await sleep(message.from === "Kanbot" ? 1300 : 700);
    }
    await sleep(4000);
  }
}

void heroLoop(document.getElementById("hero-chat"));

// ---------- Story: el chat avanza con el scroll ----------

const STEPS = [
  [
    { from: "Sofi", text: "@add Diseñar la landing" },
    { from: "Kanbot", text: "✅ #1 Diseñar la landing" },
    { from: "Martín", text: "@add Configurar el dominio" },
    { from: "Kanbot", text: "✅ #2 Configurar el dominio" },
    { from: "Caro", text: "@add Grabar el video" },
    { from: "Kanbot", text: "✅ #3 Grabar el video" },
  ],
  [
    { from: "Martín", text: "@list" },
    { from: "Kanbot", text: "*Por hacer (3)*\n#1 Diseñar la landing\n#2 Configurar el dominio\n#3 Grabar el video" },
  ],
  [
    { from: "Sofi", text: "@doing 1" },
    { from: "Kanbot", text: "➡️ #1 Haciendo: Diseñar la landing" },
    { from: "Martín", text: "@done 2" },
    { from: "Kanbot", text: "➡️ #2 Hecho: Configurar el dominio" },
  ],
  [
    { from: "Caro", text: "@web" },
    { from: "Kanbot", text: "🔗 Tablero web:\nkanbot.live/board#k3Yb9…" },
  ],
];

const stage = document.getElementById("stage");
const storyChat = document.getElementById("story-chat");
const steps = [...document.querySelectorAll(".step")];
let shownStep = -1;

function showStep(index) {
  if (index === shownStep) return;
  if (index < shownStep) {
    // Scrolleando para arriba: sin animación, directo al estado de ese paso.
    const messages = STEPS.slice(0, index + 1).flat().map(bubble);
    for (const m of messages) m.style.animation = "none";
    storyChat.replaceChildren(...messages);
  } else {
    for (let s = shownStep + 1; s <= index; s++) {
      STEPS[s].forEach((message, i) => {
        const el = bubble(message);
        el.style.animationDelay = `${i * 0.28}s`;
        storyChat.append(el);
      });
    }
  }
  shownStep = index;
  stage.classList.toggle("show-web", index === STEPS.length - 1);
  steps.forEach((step, i) => step.classList.toggle("active", i === index));
}

showStep(0);

const stepObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) if (entry.isIntersecting) showStep(Number(entry.target.dataset.step));
  },
  // Una línea en el medio de la pantalla: el paso que la cruza es el activo.
  { rootMargin: "-50% 0px -50% 0px" },
);
steps.forEach((step) => stepObserver.observe(step));

// En celular no hay escenario fijo: cada paso lleva su propio pedacito de chat.
steps.forEach((step, i) => {
  const mini = step.querySelector(".mini-chat");
  mini.append(...STEPS[i].map(bubble));
  if (i === STEPS.length - 1) {
    const board = document.getElementById("board-mock").cloneNode(true);
    board.removeAttribute("id");
    board.classList.add("mini-board");
    mini.append(board);
  }
});

// ---------- Aparición al scrollear ----------

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.15 },
);
document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
