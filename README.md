# Ticketsapp 🎫

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

## Tablero web

`@web` responde con un link tipo `https://dominio/#<clave>`. La clave es de ese chat: quien tenga el link
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

Primera vez, en el droplet como root:

```bash
git clone https://github.com/ifguido/Ticketsapp.git /opt/ticketsapp
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
bash deploy/setup-web.sh tickets.midominio.com
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
