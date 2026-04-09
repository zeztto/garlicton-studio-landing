import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

function resolveSqlitePath(databaseUri) {
  if (!databaseUri?.startsWith('file:')) {
    return null
  }

  const filePath = databaseUri.slice('file:'.length)
  if (!filePath) {
    return null
  }

  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
}

async function shouldBootstrap(dbFilePath) {
  try {
    const stat = await fs.stat(dbFilePath)
    return stat.size === 0
  } catch {
    return true
  }
}

const dbFilePath = resolveSqlitePath(process.env.DATABASE_URI ?? '')

if (!dbFilePath) {
  console.log('[bootstrap-sqlite] Skipping bootstrap because DATABASE_URI is not file-based.')
  process.exit(0)
}

await fs.mkdir(path.dirname(dbFilePath), { recursive: true })

if (!(await shouldBootstrap(dbFilePath))) {
  console.log(`[bootstrap-sqlite] Existing SQLite file detected at ${dbFilePath}; skipping bootstrap.`)
  process.exit(0)
}

process.env.NODE_ENV = 'development'

const [{ getPayload }, configModule] = await Promise.all([
  import('payload'),
  import(pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href),
])

const config = configModule.default ?? configModule
const payload = await getPayload({ config })

await payload.destroy()

console.log(`[bootstrap-sqlite] Initialized SQLite schema at ${dbFilePath}.`)
