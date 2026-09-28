// Nombre viejo a propósito: cambiarlo desloguearía a quien ya entró.
const KEY_STORAGE = "ticketsapp.key";
const POLL_MS = 15_000;

const $ = (id) => document.getElementById(id);
const editor = $("editor");

let key = null;
let tickets = [];
let editingNumber = null;

class Unauthorized extends Error {}

// ---------- Clave ----------

function loadKey() {
  try {
    return localStorage.getItem(KEY_STORAGE);
  } catch {
    return null;
  }
}

function saveKey(value) {
  try {
    if (value) localStorage.setItem(KEY_STORAGE, value);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {}
}

async function login(newKey) {
  key = newKey;
  try {
    await load();
    saveKey(key);
    $("login").hidden = true;
    $("board").hidden = false;
  } catch (err) {
    // Un error de red no invalida la clave guardada: solo la clave rechazada (401) la borra.
    if (!(err instanceof Unauthorized)) showLogin(err.message);
  }
}

function logout(message = "") {
  saveKey(null);
  showLogin(message);
}

function showLogin(message) {
  key = null;
  tickets = [];
  $("board").hidden = true;
  $("login").hidden = false;
  $("login-error").textContent = message;
}

// ---------- API ----------

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: { Authorization: `Bearer ${key}`, ...(body && { "Content-Type": "application/json" }) },
    body: body && JSON.stringify(body),
  });
  if (res.status === 401) {
    logout("La clave no es válida o fue renovada con @web nueva.");
    throw new Unauthorized();
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Error ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function fail(err) {
  if (!(err instanceof Unauthorized)) toast(err.message);
}

async function load() {
  const data = await api("/api/board");
  tickets = data.tickets;
  $("board-name").textContent = data.name || "Tickets";
  document.title = `${data.name || "Tickets"} · Kanbot`;
  render();
}

async function patch(number, changes) {
  // Optimista: se ve el cambio al instante y si falla se recarga.
  tickets = tickets.map((t) => (t.number === number ? { ...t, ...changes } : t));
  render();
  try {
    const updated = await api(`/api/tickets/${number}`, { method: "PATCH", body: changes });
    tickets = tickets.map((t) => (t.number === number ? updated : t));
    render();
  } catch (err) {
    fail(err);
    await load().catch(fail);
  }
}

// ---------- Render ----------

function render() {
  for (const column of document.querySelectorAll(".column")) {
    const items = tickets.filter((t) => t.status === column.dataset.status);
    column.querySelector(".count").textContent = items.length;
    column.querySelector(".cards").replaceChildren(...items.map(card));
  }
}

function card(ticket) {
  const el = document.createElement("article");
  el.className = "card";
  el.tabIndex = 0;
  el.draggable = true;

  const title = document.createElement("div");
  title.className = "card-title";
  const num = document.createElement("span");
  num.className = "num";
  num.textContent = `#${ticket.number}`;
  title.append(num, " ", ticket.title);

  const meta = document.createElement("div");
  meta.className = "card-meta";
  meta.textContent = [ticket.description && "📝", ticket.createdBy].filter(Boolean).join(" · ");

  el.append(title, meta);
  el.addEventListener("click", () => openEditor(ticket.number));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openEditor(ticket.number);
  });
  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", String(ticket.number));
    el.classList.add("dragging");
  });
  el.addEventListener("dragend", () => el.classList.remove("dragging"));
  return el;
}

let toastTimer;
function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 4000);
}

// ---------- Drag & drop entre columnas ----------

for (const column of document.querySelectorAll(".column")) {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    column.classList.add("drop-target");
  });
  column.addEventListener("dragleave", (e) => {
    if (!column.contains(e.relatedTarget)) column.classList.remove("drop-target");
  });
  column.addEventListener("drop", (e) => {
    e.preventDefault();
    column.classList.remove("drop-target");
    const number = Number(e.dataTransfer.getData("text/plain"));
    const ticket = tickets.find((t) => t.number === number);
    if (ticket && ticket.status !== column.dataset.status) void patch(number, { status: column.dataset.status });
  });
}

// ---------- Crear ----------

document.querySelector(".add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = e.currentTarget.elements.title;
  const title = input.value.trim();
  if (!title) return;
  input.disabled = true;
  try {
    tickets.push(await api("/api/tickets", { method: "POST", body: { title } }));
    input.value = "";
    render();
  } catch (err) {
    fail(err);
  } finally {
    input.disabled = false;
    input.focus();
  }
});

// ---------- Editor ----------

const formatDate = (iso) => new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

function openEditor(number) {
  const ticket = tickets.find((t) => t.number === number);
  if (!ticket) return;
  editingNumber = number;
  $("editor-number").textContent = `#${number}`;
  $("editor-title").value = ticket.title;
  $("editor-description").value = ticket.description;
  $("editor-status").value = ticket.status;
  const edited = ticket.updatedAt !== ticket.createdAt ? ` · editado ${formatDate(ticket.updatedAt)}` : "";
  $("editor-meta").textContent = `Creado por ${ticket.createdBy} · ${formatDate(ticket.createdAt)}${edited}`;
  editor.showModal();
}

$("editor-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const changes = {
    title: $("editor-title").value.trim(),
    description: $("editor-description").value,
    status: $("editor-status").value,
  };
  editor.close();
  void patch(editingNumber, changes);
});

$("editor-cancel").addEventListener("click", () => editor.close());

// Click en el fondo oscuro cierra.
editor.addEventListener("click", (e) => {
  if (e.target === editor) editor.close();
});

$("editor-delete").addEventListener("click", async () => {
  const number = editingNumber;
  if (!confirm(`¿Borrar el ticket #${number}?`)) return;
  editor.close();
  try {
    await api(`/api/tickets/${number}`, { method: "DELETE" });
    tickets = tickets.filter((t) => t.number !== number);
    render();
  } catch (err) {
    fail(err);
    await load().catch(fail);
  }
});

// ---------- Arranque y sincronización ----------

$("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  void login($("login-key").value.trim());
});
$("logout").addEventListener("click", () => logout());
$("refresh").addEventListener("click", () => load().catch(fail));

// Los cambios hechos desde WhatsApp aparecen solos.
function refreshIfIdle() {
  if (key && !document.hidden && !editor.open && !document.querySelector(".dragging")) load().catch(fail);
}
setInterval(refreshIfIdle, POLL_MS);
document.addEventListener("visibilitychange", refreshIfIdle);

// El link del bot trae la clave en el hash (#clave): el hash nunca viaja al servidor.
const fromHash = decodeURIComponent(location.hash.slice(1));
if (fromHash) history.replaceState(null, "", location.pathname + location.search);
const initialKey = fromHash || loadKey();
if (initialKey) void login(initialKey);
else logout();
