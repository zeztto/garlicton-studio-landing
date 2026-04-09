# Vultr Migration Runbook

## Current state

- Git remote `origin/main` is aligned with local `HEAD` at commit `4611ed0`.
- The application already uses Payload's SQLite adapter.
- The active local environment points `DATABASE_URI` to a remote `libsql` database, so data cutover requires an explicit export/import step.
- The remote libSQL host resolves to Turso (`*.turso.io`), so Turso CLI can be used for export.

## Target topology

- One Vultr VM
- One Dockerized Next.js + Payload app container
- One SQLite file persisted on the VM at `./data/db.sqlite`
- One Caddy reverse proxy container for HTTPS termination

## Files added for migration

- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.local.yml`
- `docker-compose.vultr.yml`
- `infra/Caddyfile`
- `.env.production.example`
- `scripts/bootstrap-sqlite.mjs`
- `scripts/export-turso-dump.sh`
- `scripts/import-sqlite-dump.sh`
- `scripts/copy-libsql-to-sqlite.mjs`
- `scripts/deploy-vultr.sh`
- `scripts/install-docker-ubuntu.sh`

## Phase 1. Local Docker validation

1. Copy `.env.production.example` to `.env.production`.
2. Fill in production secrets and integrations.
3. Start the stack locally:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

4. Open `http://localhost:3000`.
5. Confirm the landing page, Payload admin, contact form, and media URLs work.

If there is no imported DB yet, the startup bootstrap will create `data/db.sqlite`, push the SQLite schema, and seed initial content on first boot.

## Phase 2. Source DB backup and SQLite conversion

The current environment indicates a remote `libsql` database. Before cutover, create a SQL dump from the source database and restore it into the local SQLite file.

For the current Turso/libSQL setup, the fastest direct path is:

```bash
node scripts/copy-libsql-to-sqlite.mjs .env.local data/db.sqlite
```

This connects to the remote libSQL endpoint using `DATABASE_URI` and `DATABASE_AUTH_TOKEN`, creates a local SQLite file, and copies schema + rows directly.

For Turso/libSQL, the official Turso CLI supports dumping with:

```bash
./scripts/export-turso-dump.sh
```

Then restore it into the Docker target SQLite file:

```bash
./scripts/import-sqlite-dump.sh backups/<dump-file>.sql
```

After import, verify key tables and row counts before starting the app.

## Phase 3. Vultr server bootstrap

Recommended base image: Ubuntu 24.04 LTS.

1. Install Docker Engine and the Docker Compose plugin.
   You can use:

```bash
sudo ./scripts/install-docker-ubuntu.sh
```

2. Clone this repository onto the server.
3. Copy `.env.production.example` to `.env.production` and fill real values.
4. Create the persistent data directory:

```bash
mkdir -p data
```

5. If migrating existing production data, place the imported SQLite file at `data/db.sqlite`.

## Phase 4. Vultr deployment

Run the production stack with Caddy:

```bash
./scripts/deploy-vultr.sh
```

This publishes:

- `80/tcp` for HTTP
- `443/tcp` for HTTPS

## Phase 5. Cutover checklist

- Lower DNS TTL before cutover.
- Freeze content changes in the old admin shortly before the final dump.
- Re-run the final dump/import for the latest data.
- Start the Vultr stack.
- Update DNS `A` record to the Vultr server IP.
- Verify HTTPS issuance, admin login, contact submission, and Cloudinary media delivery.
- Keep the old deployment available until production smoke tests pass.

## Operational notes

- SQLite persistence depends on the `./data` bind mount. Do not delete it during redeploys.
- Back up `data/db.sqlite` before app upgrades.
- `PAYLOAD_SECRET` must stay stable across redeploys.
- Caddy automatically provisions HTTPS for `APP_DOMAIN` after DNS points to the server.
- `scripts/bootstrap-sqlite.mjs` only bootstraps when the SQLite file is missing or empty, so normal restarts do not re-seed the database.
- `scripts/export-turso-dump.sh` infers the Turso DB name from `.env.local` unless `TURSO_DB_NAME` is set.
- `scripts/import-sqlite-dump.sh` backs up an existing target DB before replacing it.
- `scripts/copy-libsql-to-sqlite.mjs` backs up an existing target DB before replacing it.

## Known risks

- Source DB export is still pending. Without a final dump, Vultr will boot with a fresh seeded SQLite file.
- The app currently has a Vercel-oriented `deploy.sh`; it is not part of the new Docker/Vultr path.
- Cloudinary, SMTP, Turnstile, and Kakao integrations all require valid production env values before cutover.
- Formal Payload production migrations are not wired yet; current bootstrap is optimized for first-time SQLite initialization.
