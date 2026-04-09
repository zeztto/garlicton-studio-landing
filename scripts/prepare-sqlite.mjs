import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const LOG_PREFIX = '[prepare-sqlite]'
const CLOUDINARY_ENV_KEYS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
]

export async function loadPrepareRuntime() {
  const [{ getPayload }, configModule, seedModule] = await Promise.all([
    import('payload'),
    import(pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href),
    import(pathToFileURL(path.resolve(process.cwd(), 'src/payload/seed.ts')).href),
  ])

  return {
    config: configModule.default ?? configModule,
    getPayload,
    seed: seedModule.seed,
    seedGalleryUploads: seedModule.seedGalleryUploads,
    starterGallerySeedCount: seedModule.starterGallerySeedCount,
  }
}

function hasConfiguredValue(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export async function withSuppressedGallerySeed(fn, { log = console.log } = {}) {
  const snapshot = Object.fromEntries(
    CLOUDINARY_ENV_KEYS.map((key) => [key, process.env[key]]),
  )
  const hadCloudinaryCredentials = Object.values(snapshot).some(hasConfiguredValue)

  if (hadCloudinaryCredentials) {
    log(
      `${LOG_PREFIX} Suppressing Cloudinary-backed gallery seed during prepare. Run \`npm run seed:gallery\` for explicit starter media upload.`,
    )
  }

  for (const key of CLOUDINARY_ENV_KEYS) {
    delete process.env[key]
  }

  try {
    return await fn()
  } finally {
    for (const [key, value] of Object.entries(snapshot)) {
      if (typeof value === 'undefined') {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
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
    await withSuppressedGallerySeed(
      () =>
        seed(payload, {
          isFreshDatabase: !beforeState.exists || beforeState.size === 0,
        }),
      { log },
    )
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
