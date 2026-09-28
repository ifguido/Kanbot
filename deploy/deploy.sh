#!/usr/bin/env bash
# Compila local, sube al droplet y reinicia el servicio.
#   npm run deploy -- root@IP
set -euo pipefail

HOST="${1:?Uso: npm run deploy -- root@IP}"
cd "$(dirname "$0")/.."

npm test
npm run build

rsync -az --delete \
  dist web package.json package-lock.json deploy/ticketsapp.service \
  "$HOST:/opt/ticketsapp/"

ssh "$HOST" '
  set -euo pipefail
  cd /opt/ticketsapp
  npm ci --omit=dev --no-audit --no-fund
  mv ticketsapp.service /etc/systemd/system/ticketsapp.service
  systemctl daemon-reload
  systemctl enable ticketsapp >/dev/null
  systemctl restart ticketsapp
  systemctl --no-pager --lines=5 status ticketsapp
'
