#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DUMP_PATH="${1:-}"
TARGET_PATH="${2:-$ROOT_DIR/data/db.sqlite}"

if [[ -z "$DUMP_PATH" ]]; then
  echo "Usage: $0 <dump.sql> [target-sqlite-path]" >&2
  exit 1
fi

if [[ ! -f "$DUMP_PATH" ]]; then
  echo "[import-sqlite-dump] Dump file not found: $DUMP_PATH" >&2
  exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "[import-sqlite-dump] sqlite3 is required." >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET_PATH")"

if [[ -f "$TARGET_PATH" ]]; then
  BACKUP_PATH="${TARGET_PATH}.bak.$(date +%Y%m%d-%H%M%S)"
  mv "$TARGET_PATH" "$BACKUP_PATH"
  echo "[import-sqlite-dump] Existing DB backed up to $BACKUP_PATH"
fi

sqlite3 "$TARGET_PATH" < "$DUMP_PATH"

TABLE_COUNT="$(sqlite3 "$TARGET_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table';")"
echo "[import-sqlite-dump] Imported into $TARGET_PATH"
echo "[import-sqlite-dump] Table count: $TABLE_COUNT"
