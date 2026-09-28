# Kanbot 📋

https://kanbot.live

Un "Trello de WhatsApp": un bot que maneja tickets con comandos, en grupos o en privado,
más un tablero web sencillo para verlos y editarlos.

```
@add Arreglar la canilla     → ✅ #1 Arreglar la canilla
@doing 1                     → ➡️ #1 Haciendo: Arreglar la canilla
@done 1                      → ➡️ #1 Hecho: Arreglar la canilla
@list                        → pendientes agrupados por estado + cantidad de hechos
@remove 1                    → 🗑️ #1 Arreglar la canilla
@web                         → link al tablero web de este chat
@web nueva                   → link nuevo (invalida el anterior)
@help
```

Alias: `@ls`, `@rm`. Los comandos con número aceptan varios (`@done 1 2 #3`). También existe `@todo <n>`.

- Cada chat es un board: un grupo comparte sus tickets; un chat privado con el bot tiene los suyos.
- En grupos el bot solo responde a comandos conocidos (ignora la charla y las menciones tipo `@juan`).

## Hacé tu propio Kanbot en tu proyecto

Copiá este prompt en Claude Code (o tu agente de código) dentro de una carpeta vacía. Replica este proyecto:
el bot, el guardado en JSON, el tablero web y el deploy en un droplet. Antes de usarlo, leé los
[trade-offs](#trade-offs).

```text
Construí "Kanbot": un bot de WhatsApp que maneja tareas tipo Trello con comandos, más un tablero web.
Usá Node 22 + TypeScript (ESM), sin frameworks web, con tests en Vitest.

WhatsApp
- Usá Baileys (paquete `baileys`) como dispositivo vinculado: sesión con useMultiFileAuthState en
  DATA_DIR/auth y versión de WhatsApp Web con fetchLatestBaileysVersion.
- Vinculación: si existe la variable PAIRING_PHONE, pedí un código de 8 letras con requestPairingCode;
  si no, mostrá el QR en la terminal (qrcode-terminal).
- Reconexión automática. Si WhatsApp cierra la sesión (loggedOut), borrá DATA_DIR/auth y salí con error.
- Procesá solo messages.upsert de tipo "notify". Ignorá los mensajes propios, status@broadcast y newsletters.
  Leé el texto de conversation o extendedTextMessage (también dentro de ephemeralMessage).
- Respondé citando el mensaje. Si algo falla, respondé "⚠️ Hubo un error, probá de nuevo."

Comandos (cada chat, grupo o privado, es un tablero independiente)
- @add <texto>: crea un ticket numerado #1, #2… Los números nunca se reutilizan. Máximo 500 caracteres.
- @list (alias @ls): pendientes agrupados por estado (Por hacer, Haciendo) y de los hechos solo la cantidad.
  Marcá con 📝 los que tienen descripción.
- @doing <n>, @done <n>, @todo <n>: cambian el estado.
- @remove <n> (alias @rm): borra.
- Los comandos con número aceptan varios: @done 1 2 #3.
- @web: responde PUBLIC_URL/board#<clave>, el link al tablero web de ese chat. "@web nueva" genera otra
  clave e invalida la anterior.
- @help: la ayuda.
- En grupos respondé solo a comandos conocidos: ignorá la charla y las menciones tipo @juan.
  En privado, a cualquier otro texto respondé que escriba @help.
- Separá la lógica de comandos de WhatsApp: una función que recibe el store y el mensaje y devuelve la
  respuesta, testeable sin WhatsApp.

Guardado (sin base de datos)
- Un archivo JSON por chat: DATA_DIR/boards/<chatId>.json con { nextNumber, tickets }. Cada ticket tiene
  number, title, description, status (todo | doing | done), createdBy (nombre de WhatsApp), createdAt y
  updatedAt.
- Claves del tablero web en DATA_DIR/webkeys.json: { <clave>: { boardId, name, createdAt } }, con claves
  aleatorias de 128 bits en base64url.
- Escrituras atómicas (archivo .tmp + rename) y serializadas por chat con un mutex en memoria, para que dos
  @add simultáneos nunca reciban el mismo número.

Web (el mismo proceso la sirve con node:http, escuchando en WEB_HOST:PORT, por defecto 127.0.0.1:3000)
- /board: tablero kanban en HTML, CSS y JS plano. Lee la clave del #hash, la borra de la URL, la guarda en
  localStorage y la manda como "Authorization: Bearer <clave>". Tres columnas (Por hacer, Haciendo, Hecho),
  arrastrar y soltar entre columnas, crear tickets, y abrir uno en un <dialog> para editar título,
  descripción y estado o borrarlo. Recarga cada 15 segundos para mostrar lo que se hizo desde WhatsApp.
- API JSON autenticada con la clave: GET /api/board, POST /api/tickets, PATCH /api/tickets/:n y
  DELETE /api/tickets/:n. Validá todo (estados válidos, largos máximos, body de hasta 64 KB), devolvé los
  errores en JSON y que cada clave vea solo su tablero.
- Cabeceras en todas las respuestas: CSP estricta (default-src 'self'), X-Content-Type-Options: nosniff y
  Referrer-Policy: no-referrer.
- /: una landing que explica los comandos, con botones a https://wa.me/<número del bot>?text=@help.
- /terminos: términos y condiciones.

Deploy en un droplet de DigitalOcean (Ubuntu 24.04)
- deploy/setup.sh: instala Node 22, crea 1 GB de swap, activa ufw (solo SSH) y crea un usuario de sistema.
- Un servicio de systemd con StateDirectory (los datos quedan en /var/lib/<nombre>), Restart=always y
  EnvironmentFile=-/etc/<nombre>.env.
- deploy/setup-web.sh <dominio>: instala Caddy como proxy con HTTPS automático, redirige www al dominio,
  abre los puertos 80 y 443 y escribe PUBLIC_URL en el .env.

Tests (Vitest)
- Parser y comandos; el store con archivos, incluido que 30 @add en paralelo den los números 1 a 30 sin
  repetir; y la API web levantando el servidor en un puerto libre.

Al terminar, explicame paso a paso cómo crear el droplet, vincular el número y publicar la web.
```

## Trade-offs

Kanbot está pensado para un proyecto chico: decenas de grupos, no miles. Estas son las decisiones y lo que
cuestan.

| Decisión | A favor | En contra |
|---|---|---|
| **Archivos `.json` en vez de una base de datos** | Cero infraestructura y gratis. Rapidísimo. Se lee y se edita a mano. El backup es copiar una carpeta. | Vive en un solo servidor: no escala horizontalmente. Cada cambio reescribe el archivo entero del chat (bien para cientos de tickets, no para cientos de miles). No hay consultas entre tableros. El mutex vive en memoria: nunca corras dos instancias sobre la misma carpeta. |
| **Baileys (no oficial) en vez de la Cloud API de Meta** | Funciona en grupos. No hace falta una cuenta de Meta Business ni se paga por mensaje. | Va contra los términos de WhatsApp: el número puede ser baneado, así que usá uno aparte. Si WhatsApp cambia su protocolo, se rompe hasta que Baileys se actualice. |
| **Droplet en vez de serverless** | Costo fijo de USD 4–6/mes y fácil de entender. Es lo que necesita Baileys: una conexión abierta todo el tiempo. | No sirve Vercel, Lambda ni Cloud Functions. El servidor lo mantenés vos (actualizaciones, disco). Si se cae el droplet, se cae todo. |
| **Bot y web en el mismo proceso** | Comparten el guardado y el orden de las escrituras. Un solo servicio para cuidar. | Reiniciar uno reinicia el otro. |
| **Acceso a la web con un link (la clave va en el `#`)** | Sin cuentas ni contraseñas. El `#` no llega al servidor ni queda en logs. | Quien tenga el link puede editar el tablero. Se mitiga con `@web nueva`. |
| **La web recarga cada 15 s en vez de usar websockets** | Simple y sin estado en el servidor. | Lo que se hace por WhatsApp tarda hasta 15 s en verse en la web. |
| **Sin backups automáticos** | Nada que configurar. | Si se pierde el disco, se pierden los datos. Activá los backups de DigitalOcean o copiá `/var/lib/<nombre>` con un cron. |

## Web

En `/` está la landing (`web/landing.*`), en `/board` el tablero (`web/board.html`, `app.js`, `style.css`) y en
`/terminos` los términos y condiciones (`web/terminos.html`).
El número del bot que usa la landing está en `web/landing.js` (`BOT_PHONE`) y en `web/kanbot.vcf`.

`@web` responde con un link tipo `https://kanbot.live/board#<clave>` (los links viejos `/#<clave>` redirigen
solos). La clave es de ese chat: quien tenga el link
puede ver y editar sus tickets. La clave viaja en el `#`, que el navegador no manda al servidor ni queda en logs;
la web la guarda en el navegador y la manda en cada pedido a la API.

En la web: columnas Por hacer / Haciendo / Hecho, arrastrar entre columnas, crear tickets y abrir uno para
editar título, descripción y estado, o borrarlo. Los cambios hechos desde WhatsApp aparecen solos (cada 15 s).

## Stack

- **[Baileys](https://github.com/WhiskeySockets/Baileys)**: se conecta a WhatsApp como un "dispositivo vinculado"
  (igual que WhatsApp Web). No es oficial: usá un chip aparte, no tu número personal.
- **Archivos JSON** en disco.
- **Web** servida por el mismo proceso (`node:http`, sin frameworks); HTML/CSS/JS plano en `web/`.
- **Un droplet** de DigitalOcean con systemd, y Caddy adelante para el HTTPS.

```
data/
  auth/                      sesión de WhatsApp
  boards/<chatId>.json       { nextNumber, tickets: [...] }
  webkeys.json               { <clave>: { boardId, name } }
```

Las escrituras se hacen a un `.tmp` + rename (un crash no deja archivos a medias) y se serializan por
chat (dos `@add` simultáneos nunca reciben el mismo número). Como la web y el bot son el mismo proceso,
comparten ese orden.

## Desarrollo

```bash
npm install
npm test
npm run dev        # compila, arranca, vincula WhatsApp; web en http://localhost:3000; datos en ./data
```

Variables: `DATA_DIR`, `PORT` (3000), `WEB_HOST` (127.0.0.1), `PUBLIC_URL` (la que va en el link de `@web`),
`PAIRING_PHONE`, `LOG_LEVEL`.

## Deploy en un droplet (con git)

Adentro del servidor el servicio, el usuario y las carpetas siguen llamándose `ticketsapp` (el nombre original del proyecto).

Primera vez, en el droplet como root:

```bash
git clone https://github.com/ifguido/Kanbot.git /opt/ticketsapp
cd /opt/ticketsapp
bash deploy/setup.sh                       # Node 22, swap, firewall, usuario ticketsapp
npm ci && npm run build
cp deploy/ticketsapp.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now ticketsapp
```

Vincular WhatsApp (lo más confiable es con código):

```bash
systemctl stop ticketsapp
sudo -u ticketsapp DATA_DIR=/var/lib/ticketsapp PAIRING_PHONE=549XXXXXXXXXX node dist/index.js
# WhatsApp → Dispositivos vinculados → Vincular con el número de teléfono → cargar el código
# cuando diga "✅ Conectado a WhatsApp": Ctrl+C
systemctl start ticketsapp
```

Publicar la web con HTTPS (con dominio propio, o con `IP.sslip.io` si no tenés):

```bash
bash deploy/setup-web.sh kanbot.live
# o
bash deploy/setup-web.sh "$(curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address).sslip.io"
```

Instala Caddy (saca el certificado solo), abre los puertos 80/443 y guarda `PUBLIC_URL` en `/etc/ticketsapp.env`.
Con dominio propio, primero apuntá un registro A a la IP del droplet.

### Actualizar

```bash
cd /opt/ticketsapp && git pull && npm ci && npm run build \
  && cp deploy/ticketsapp.service /etc/systemd/system/ && systemctl daemon-reload \
  && systemctl restart ticketsapp
```

(Sin git: `npm run deploy -- root@IP` desde tu máquina compila, sube con rsync y reinicia.)

### Operación

```bash
journalctl -u ticketsapp -f -o cat      # logs
systemctl restart ticketsapp            # reiniciar
```

- **Datos**: `/var/lib/ticketsapp/`. Para backup alcanza con copiar esa carpeta
  (o activar los backups de DigitalOcean).
- **Si cerrás la sesión desde el celular**, el bot borra `auth/` y hay que vincular de nuevo.
