#!/usr/bin/env bash
# Prepara un droplet Ubuntu recién creado. Correr una sola vez, como root:
#   ssh root@IP 'bash -s' < deploy/setup.sh
set -euo pipefail

apt-get update
apt-get install -y ca-certificates curl rsync ufw

# Node 22
if ! command -v node >/dev/null || ! node -v | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# Swap de 1 GB (el droplet de 512 MB lo necesita; en el de 1 GB no molesta)
if ! swapon --show | grep -q .; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Firewall: solo SSH. Baileys no necesita puertos abiertos (la conexión sale del droplet).
ufw allow OpenSSH
ufw --force enable

# Usuario sin login para correr el bot
id ticketsapp >/dev/null 2>&1 || useradd --system --home /opt/ticketsapp --shell /usr/sbin/nologin ticketsapp
mkdir -p /opt/ticketsapp

echo "Listo. Ahora desde tu máquina: npm run deploy -- root@IP"
