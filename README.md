# Ticketsapp 🎫

Un "Trello de WhatsApp": un bot que maneja tickets con comandos, en grupos o en privado.

```
@add Arreglar la canilla     → ✅ #1 Arreglar la canilla
@list                        → *Tickets (1)*  #1 Arreglar la canilla
@remove 1                    → 🗑️ #1 Arreglar la canilla
@help
```

Alias: `@ls`, `@rm`. `@remove` acepta varios ids (`@remove 1 2 #3`).

- Cada chat es un board: un grupo comparte sus tickets; un chat privado con el bot tiene los suyos.
- En grupos el bot solo responde a comandos conocidos (ignora la charla y las menciones tipo `@juan`).

## Stack

- **[Baileys](https://github.com/WhiskeySockets/Baileys)**: se conecta a WhatsApp como un "dispositivo vinculado"
  (igual que WhatsApp Web). No es oficial: usá un chip aparte, no tu número personal.
- **Archivos JSON** en disco, uno por chat.
- **Un droplet** de DigitalOcean con systemd.

```
data/
  auth/                      sesión de WhatsApp (lo que genera escanear el QR)
  boards/<chatId>.json       { nextNumber, tickets: [...] }
```

Las escrituras se hacen a un `.tmp` + rename (un crash no deja archivos a medias) y se serializan por
chat (dos `@add` simultáneos nunca reciben el mismo número).

## Desarrollo

```bash
npm install
npm test
npm run dev        # compila, arranca y muestra el QR; datos en ./data
```

## Deploy en un droplet

1. Crear un droplet **Ubuntu 24.04**, 1 GB (USD 6/mes), con tu clave SSH.
2. Preparar el servidor (una sola vez):
   ```bash
   ssh root@IP 'bash -s' < deploy/setup.sh
   ```
   Instala Node 22, crea swap, activa el firewall (solo SSH) y crea el usuario `ticketsapp`.
3. Subir y arrancar:
   ```bash
   npm run deploy -- root@IP
   ```
   Corre los tests, compila, copia a `/opt/ticketsapp` y reinicia el servicio.
4. Vincular WhatsApp (solo la primera vez). Lo más confiable es con código, en el droplet:
   ```bash
   systemctl stop ticketsapp
   cd /opt/ticketsapp
   sudo -u ticketsapp DATA_DIR=/var/lib/ticketsapp PAIRING_PHONE=549XXXXXXXXXX node dist/index.js
   ```
   `PAIRING_PHONE` es el número del bot con código de país, sin `+`. Imprime un código de 8 letras:
   en el celular del bot, WhatsApp → Dispositivos vinculados → Vincular dispositivo →
   **Vincular con el número de teléfono**. Cuando diga `✅ Conectado a WhatsApp`, Ctrl+C y
   `systemctl start ticketsapp`.

   Alternativa con QR: `journalctl -u ticketsapp -f -o cat -n 0` y escanear el último que aparezca.

Para actualizar, repetir el paso 3.

### Operación

```bash
ssh root@IP journalctl -u ticketsapp -f          # logs
ssh root@IP systemctl restart ticketsapp         # reiniciar
```

- **Datos**: `/var/lib/ticketsapp/`. Para backup alcanza con copiar esa carpeta
  (o activar los backups de DigitalOcean).
- **Si cerrás la sesión desde el celular**, el bot borra `auth/` y se reinicia mostrando un QR nuevo.
