#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_PATH="${1:-$ROOT_DIR/backups/turso-$(date +%Y%m%d-%H%M%S).sql}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.local}"

if ! command -v turso >/dev/null 2>&1; then
  echo "[export-turso-dump] turso CLI is required. Install it first: https://docs.turso.tech/cli/introduction" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[export-turso-dump] Env file not found: $ENV_FILE" >&2
  exit 1
fi

DB_NAME="${TURSO_DB_NAME:-}"

if [[ -z "$DB_NAME" ]]; then
  DB_NAME="$(ENV_FILE="$ENV_FILE" node <<'EOF'
const fs = require('fs')

const envFile = process.env.ENV_FILE
const source = fs.readFileSync(envFile, 'utf8')
const line = source.split(/\r?\n/).find((entry) => entry.startsWith('DATABASE_URI='))

if (!line) process.exit(1)

const value = line.slice('DATABASE_URI='.length)
const normalized = value.replace(/^libsql:/, 'https:')
const url = new URL(normalized)
const [dbName] = url.hostname.split('.')

if (!dbName) process.exit(1)

process.stdout.write(dbName)
EOF
)"
fi

mkdir -p "$(dirname "$OUTPUT_PATH")"

echo "[export-turso-dump] Exporting Turso database '$DB_NAME' to $OUTPUT_PATH"
turso db shell "$DB_NAME" ".dump" > "$OUTPUT_PATH"
echo "[export-turso-dump] Done."
