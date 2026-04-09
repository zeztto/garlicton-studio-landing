#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env.production" ]]; then
  echo "[deploy-vultr] Missing .env.production" >&2
  exit 1
fi

mkdir -p data

echo "[deploy-vultr] Starting Vultr production stack"
docker compose -f docker-compose.yml -f docker-compose.vultr.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.vultr.yml ps
