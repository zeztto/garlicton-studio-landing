import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createClient } from '@libsql/client'

function parseEnvFile(envFilePath) {
  const source = fs.readFileSync(envFilePath, 'utf8')
  const entries = {}

  for (const line of source.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex < 0) continue

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    entries[key] = value
  }

  return entries
}

function quoteIdentifier(value) {
  return `"${value.replace(/"/g, '""')}"`
}

function normalizeValue(value) {
  if (value === undefined || value === null) return null
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'bigint') return Number(value)
  if (value instanceof Uint8Array) return Buffer.from(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

const envFilePath = path.resolve(process.cwd(), process.argv[2] ?? '.env.local')
const targetPath = path.resolve(process.cwd(), process.argv[3] ?? 'data/db.sqlite')

if (!fs.existsSync(envFilePath)) {
  throw new Error(`Env file not found: ${envFilePath}`)
}

const env = parseEnvFile(envFilePath)
const databaseUrl = env.DATABASE_URI
const authToken = env.DATABASE_AUTH_TOKEN

if (!databaseUrl) {
  throw new Error(`DATABASE_URI is missing in ${envFilePath}`)
}

if (!authToken) {
  throw new Error(`DATABASE_AUTH_TOKEN is missing in ${envFilePath}`)
}

fs.mkdirSync(path.dirname(targetPath), { recursive: true })

if (fs.existsSync(targetPath)) {
  const backupPath = `${targetPath}.bak.${new Date().toISOString().replace(/[:.]/g, '-')}`
  fs.renameSync(targetPath, backupPath)
  console.log(`[copy-libsql-to-sqlite] Existing target backed up to ${backupPath}`)
}

const remote = createClient({
  url: databaseUrl,
  authToken,
})

const sqlite = new DatabaseSync(targetPath)

try {
  sqlite.exec('PRAGMA foreign_keys = OFF;')
  sqlite.exec('BEGIN;')

  const schemaResult = await remote.execute(`
    SELECT type, name, tbl_name, sql
    FROM sqlite_master
    WHERE sql IS NOT NULL
      AND name NOT LIKE 'sqlite_%'
    ORDER BY CASE type
      WHEN 'table' THEN 0
      WHEN 'index' THEN 1
      WHEN 'trigger' THEN 2
      WHEN 'view' THEN 3
      ELSE 4
    END, name;
  `)

  const schemaRows = schemaResult.rows.map((row) => ({
    type: String(row.type),
    name: String(row.name),
    tableName: String(row.tbl_name),
    sql: String(row.sql),
  }))

  for (const row of schemaRows) {
    sqlite.exec(`${row.sql};`)
  }

  const tableRows = schemaRows.filter((row) => row.type === 'table')
  const rowCountSummary = []

  for (const table of tableRows) {
    const tableName = table.name
    const result = await remote.execute(`SELECT * FROM ${quoteIdentifier(tableName)};`)
    const rows = result.rows

    if (rows.length === 0) {
      rowCountSummary.push(`${tableName}=0`)
      continue
    }

    const columns = Object.keys(rows[0])
    const columnSql = columns.map(quoteIdentifier).join(', ')
    const placeholders = columns.map(() => '?').join(', ')
    const statement = sqlite.prepare(
      `INSERT INTO ${quoteIdentifier(tableName)} (${columnSql}) VALUES (${placeholders})`,
    )

    for (const row of rows) {
      const values = columns.map((column) => normalizeValue(row[column]))
      statement.run(...values)
    }

    rowCountSummary.push(`${tableName}=${rows.length}`)
  }

  sqlite.exec('COMMIT;')
  console.log(`[copy-libsql-to-sqlite] Copied ${tableRows.length} tables to ${targetPath}`)
  console.log(`[copy-libsql-to-sqlite] Row counts: ${rowCountSummary.join(', ')}`)
} catch (error) {
  sqlite.exec('ROLLBACK;')
  throw error
} finally {
  sqlite.close()
  remote.close()
}
