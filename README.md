# Ticketsapp 🎫

Un "Trello de WhatsApp": un bot que maneja tickets con comandos.

```
@add Arreglar la canilla     → ✅ #1 Arreglar la canilla
@list                        → *Tickets (1)*  #1 Arreglar la canilla
@remove 1                    → 🗑️ #1 Arreglar la canilla
@help
```

Alias: `@ls`, `@rm`. `@remove` acepta varios ids (`@remove 1 2 #3`). Cada chat tiene su propio board.

## Stack

- **WhatsApp Cloud API** (oficial de Meta) → webhook HTTP.
- **Firebase Cloud Functions v2** (una sola function, `whatsappWebhook`, en `southamerica-east1`).
- **Firestore** para los datos.

Costo esperado para uso personal/equipo chico: **$0**. Las respuestas dentro de la ventana de 24 h
después de que el usuario escribe son gratis en WhatsApp, y el free tier de Functions/Firestore sobra.

```
WhatsApp ──webhook──▶ whatsappWebhook ──▶ Firestore
    ▲                       │
    └──── Graph API ◀───────┘
```

### Datos

```
boards/{chatId}                    { nextNumber }
boards/{chatId}/tickets/{number}   { number, title, createdBy, createdAt }
processedMessages/{messageId}      { expiresAt }   ← dedupe de reintentos de Meta
```

## Código

```
functions/src/
  index.ts           webhook (verificación GET, firma, dedupe, respuesta)
  commands.ts        parser + lógica de comandos (puro, testeado)
  firestoreStore.ts  TicketStore sobre Firestore
  whatsapp.ts        firma, parseo del payload y envío de mensajes
  types.ts
```

```bash
cd functions
npm install
npm test
npm run build
```

## Setup (una sola vez)

### 1. Firebase

1. Crear proyecto en https://console.firebase.google.com y cambiar el id en `.firebaserc`.
2. Pasar al plan **Blaze** (requerido para Functions; con este volumen no se paga nada).
   Conviene poner una alerta de presupuesto de USD 1.
3. Crear la base de Firestore (modo producción) en `southamerica-east1`.
4. `cd functions && npx firebase login`

### 2. Meta / WhatsApp

1. https://developers.facebook.com → crear app tipo **Business** → agregar el producto **WhatsApp**.
2. En *WhatsApp → API Setup* anotar el **Phone number ID** y agregar tu número como destinatario de prueba.
3. Token permanente: *Business Settings → System users* → crear uno, asignarle la app y generar un token
   con permiso `whatsapp_business_messaging`. (El token temporal de API Setup dura 24 h.)
4. *App settings → Basic* → copiar el **App Secret**.

### 3. Secrets y deploy

```bash
cd functions
npx firebase functions:secrets:set WHATSAPP_TOKEN          # token del system user
npx firebase functions:secrets:set WHATSAPP_APP_SECRET     # app secret
npx firebase functions:secrets:set WHATSAPP_VERIFY_TOKEN   # cualquier string que inventes
npm run deploy
```

Opcional: TTL para limpiar `processedMessages` sola:

```bash
gcloud firestore fields ttls update expiresAt --collection-group=processedMessages --enable-ttl
```

### 4. Conectar el webhook

En *WhatsApp → Configuration*:

- **Callback URL**: la URL de `whatsappWebhook` que imprime el deploy.
- **Verify token**: el mismo `WHATSAPP_VERIFY_TOKEN`.
- Suscribirse al campo **messages**.

Mandale `@help` al número del bot. 🎉

## Limitaciones

- **Grupos**: la Cloud API oficial trabaja con chats 1 a 1; la API de grupos de Meta tiene acceso restringido.
  Hoy cada persona que le escribe al bot tiene su propio board. Para boards compartidos se puede
  agregar un comando tipo `@join <board>` sin cambiar el stack.
- Los mensajes proactivos (fuera de la ventana de 24 h, ej. recordatorios) requieren templates aprobados y se cobran.
