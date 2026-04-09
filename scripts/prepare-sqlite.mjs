import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const LOG_PREFIX = '[prepare-sqlite]'

async function loadPrepareRuntime() {
  const [{ getPayload }, configModule, seedModule] = await Promise.all([
    import('payload'),
    import(pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href),
    import(pathToFileURL(path.resolve(process.cwd(), 'src/payload/seed.ts')).href),
  ])

  return {
    config: configModule.default ?? configModule,
    getPayload,
    seed: seedModule.seed,
  }
}

export function resolveSqlitePath(databaseUri) {
  if (!databaseUri?.startsWith('file:')) {
    return null
  }

  const filePath = databaseUri.slice('file:'.length)
  if (!filePath) {
    return null
  }

  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
}

export async function getDbFileState(dbFilePath) {
  try {
    const stat = await fs.stat(dbFilePath)
    return {
      exists: true,
      size: stat.size,
    }
  } catch {
    return {
      exists: false,
      size: 0,
    }
  }
}

export async function prepareSqlite({
  databaseUri = process.env.DATABASE_URI ?? '',
  log = console.log,
  loadRuntime = loadPrepareRuntime,
} = {}) {
  const dbFilePath = resolveSqlitePath(databaseUri)

  if (!dbFilePath) {
    log(`${LOG_PREFIX} Skipping prepare because DATABASE_URI is not file-based.`)
    return {
      dbFilePath: null,
      skipped: true,
    }
  }

  await fs.mkdir(path.dirname(dbFilePath), { recursive: true })

  const beforeState = await getDbFileState(dbFilePath)

  if (beforeState.exists) {
    log(
      `${LOG_PREFIX} Existing SQLite file detected at ${dbFilePath} (${beforeState.size} bytes). Running schema sync and conditional seed/backfill.`,
    )
  } else {
    log(
      `${LOG_PREFIX} No SQLite file found at ${dbFilePath}. Running initial schema sync and seed.`,
    )
  }

  const { config, getPayload, seed } = await loadRuntime()

  let payload

  try {
    payload = await getPayload({ config })
    await seed(payload, {
      isFreshDatabase: !beforeState.exists || beforeState.size === 0,
    })
  } finally {
    if (payload) {
      await payload.destroy()
    }
  }

  const afterState = await getDbFileState(dbFilePath)

  log(
    `${LOG_PREFIX} SQLite prepare completed for ${dbFilePath} (${afterState.size} bytes).`,
  )

  return {
    afterState,
    beforeState,
    dbFilePath,
    skipped: false,
  }
}

const isDirectExecution = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false

if (isDirectExecution) {
  void prepareSqlite().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
