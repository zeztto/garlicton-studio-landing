#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE_HOST="${REMOTE_HOST:-p1zza-1st}"
REMOTE_DIR="${REMOTE_DIR:-/opt/garlicton-studio-landing}"
REMOTE_CADDY_DIR="${REMOTE_CADDY_DIR:-/opt/caddy}"

rsync -az --delete \
  --exclude '.git' \
  --exclude '.next' \
  --exclude 'node_modules' \
  --exclude '.env.local' \
  --exclude '.env.production' \
  --exclude '.playwright-cli' \
  --exclude '.playwright-mcp' \
  --exclude 'backups' \
  "$ROOT_DIR/" "${REMOTE_HOST}:${REMOTE_DIR}/"

ssh "$REMOTE_HOST" "mkdir -p '${REMOTE_DIR}/data' '${REMOTE_CADDY_DIR}/sites-enabled/garlicton-studio' && docker network inspect garlicton-studio_default >/dev/null 2>&1 || docker network create garlicton-studio_default"

scp "$ROOT_DIR/infra/caddy/garlicton.caddy" "${REMOTE_HOST}:${REMOTE_CADDY_DIR}/sites-enabled/garlicton-studio/garlicton.caddy"

ssh "$REMOTE_HOST" "set -euo pipefail; cd '${REMOTE_DIR}'; docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.shared-gateway.yml up -d --build; docker network connect garlicton-studio_default caddy-gateway >/dev/null 2>&1 || true; cd '${REMOTE_CADDY_DIR}'; docker compose restart caddy"
