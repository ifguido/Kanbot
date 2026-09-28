#!/usr/bin/env bash
# Publica el tablero web con HTTPS (Caddy saca el certificado solo). En el droplet, como root:
#   bash deploy/setup-web.sh kanbot.live
# Sin dominio propio, sslip.io apunta cualquier "IP.sslip.io" a esa IP:
#   bash deploy/setup-web.sh "$(curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address).sslip.io"
set -euo pipefail

DOMAIN="${1:?Uso: bash deploy/setup-web.sh <dominio>}"

apt-get update
apt-get install -y caddy

cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
	encode gzip
	reverse_proxy 127.0.0.1:3000
}
EOF

# Con dominio propio, www.dominio redirige al dominio (necesita el CNAME/A de www en el DNS).
if [[ "$DOMAIN" != *.sslip.io ]]; then
  cat >> /etc/caddy/Caddyfile <<EOF

www.$DOMAIN {
	redir https://$DOMAIN{uri} permanent
}
EOF
fi
systemctl enable caddy >/dev/null
systemctl restart caddy

ufw allow 80/tcp
ufw allow 443/tcp

echo "PUBLIC_URL=https://$DOMAIN" > /etc/ticketsapp.env
systemctl restart ticketsapp

echo "Listo: https://$DOMAIN — escribí @web en un chat para recibir el link."
