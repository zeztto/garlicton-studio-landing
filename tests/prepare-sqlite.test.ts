import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { Payload } from 'payload'
import { prepareSqlite } from '../scripts/prepare-sqlite.mjs'
import { seed } from '../src/payload/seed'

const ORIGINAL_DATABASE_URI = process.env.DATABASE_URI

async function withTempSqlite(run: (databaseUri: string, tempDir: string) => Promise<void>) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'garlicton-prepare-test-'))
  const databaseUri = `file:${path.join(tempDir, 'db.sqlite')}`

  try {
    await run(databaseUri, tempDir)
  } finally {
    if (typeof ORIGINAL_DATABASE_URI === 'string') {
      process.env.DATABASE_URI = ORIGINAL_DATABASE_URI
    } else {
      delete process.env.DATABASE_URI
    }

    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

function createMockPayload({
  about,
  galleryDocs = 0,
  portfolioDocs = 0,
  servicesDocs = 0,
  siteSettings,
  throwAbout = false,
  throwSiteSettings = false,
}: {
  about?: Record<string, any>
  galleryDocs?: number
  portfolioDocs?: number
  servicesDocs?: number
  siteSettings?: Record<string, any>
  throwAbout?: boolean
  throwSiteSettings?: boolean
}) {
  const creates: Array<{ collection: string; data: Record<string, any> }> = []
  const globalUpdates: Array<{ slug: string; data: Record<string, any> }> = []
  const logs = {
    info: [] as string[],
    warn: [] as string[],
  }

  const payload = {
    create: async ({ collection, data }: { collection: string; data: Record<string, any> }) => {
      creates.push({ collection, data })
      return { id: `${collection}-${creates.length}` }
    },
    find: async ({ collection }: { collection: string }) => {
      if (collection === 'services') {
        return { totalDocs: servicesDocs, docs: [] }
      }

      if (collection === 'portfolio') {
        return { totalDocs: portfolioDocs, docs: [] }
      }

      if (collection === 'gallery') {
        return { totalDocs: galleryDocs, docs: [] }
      }

      throw new Error(`Unexpected collection lookup: ${collection}`)
    },
    findGlobal: async ({ slug }: { slug: string }) => {
      if (slug === 'about') {
        if (throwAbout) {
          throw new Error('about read failed')
        }

        return about ?? {}
      }

      if (slug === 'site-settings') {
        if (throwSiteSettings) {
          throw new Error('site-settings read failed')
        }

        return siteSettings ?? {}
      }

      throw new Error(`Unexpected global lookup: ${slug}`)
    },
    logger: {
      info: (message: string) => logs.info.push(message),
      warn: (message: string) => logs.warn.push(message),
    },
    updateGlobal: async ({ slug, data }: { slug: string; data: Record<string, any> }) => {
      globalUpdates.push({ slug, data })
      return data
    },
  } as unknown as Payload

  return {
    creates,
    globalUpdates,
    logs,
    payload,
  }
}

test('prepareSqlite skips when DATABASE_URI is not file-based', async () => {
  const logs: string[] = []
  const result = await prepareSqlite({
    databaseUri: 'libsql://garlicton-preview',
    log: (message) => logs.push(message),
  })

  assert.equal(result.skipped, true)
  assert.equal(result.dbFilePath, null)
  assert.match(logs.join('\n'), /Skipping prepare because DATABASE_URI is not file-based/)
})

test('prepareSqlite bootstraps a fresh SQLite database with fresh mode', async () => {
  await withTempSqlite(async (databaseUri) => {
    const logs: string[] = []
    const dbFilePath = databaseUri.slice('file:'.length)
    let seedMode: boolean | null = null

    const result = await prepareSqlite({
      databaseUri,
      log: (message) => logs.push(message),
      loadRuntime: async () => ({
        config: {},
        getPayload: async () => ({
          destroy: async () => {},
        }),
        seed: async (_payload: unknown, options?: { isFreshDatabase?: boolean }) => {
          seedMode = options?.isFreshDatabase === true
          await fs.writeFile(dbFilePath, 'seeded')
        },
      }),
    })

    assert.equal(result.skipped, false)
    assert.equal(result.beforeState.exists, false)
    assert.ok((result.afterState?.size ?? 0) > 0)
    assert.equal(seedMode, true)
    assert.match(logs.join('\n'), /initial schema sync and seed/)
  })
})

test('prepareSqlite treats existing SQLite files as repair/idempotent path', async () => {
  await withTempSqlite(async (databaseUri) => {
    const dbFilePath = databaseUri.slice('file:'.length)
    await fs.mkdir(path.dirname(dbFilePath), { recursive: true })
    await fs.writeFile(dbFilePath, 'existing-db')
    let seedMode: boolean | null = null

    const logs: string[] = []
    const result = await prepareSqlite({
      databaseUri,
      log: (message) => logs.push(message),
      loadRuntime: async () => ({
        config: {},
        getPayload: async () => ({
          destroy: async () => {},
        }),
        seed: async (_payload: unknown, options?: { isFreshDatabase?: boolean }) => {
          seedMode = options?.isFreshDatabase === true
        },
      }),
    })

    assert.equal(result.skipped, false)
    assert.equal(result.beforeState.exists, true)
    assert.equal(seedMode, false)
    assert.match(logs.join('\n'), /conditional seed\/backfill/)
  })
})

test('seed repairs missing portfolio/about/site-settings without duplicating existing services', async () => {
  const { creates, globalUpdates, payload } = createMockPayload({
    about: {
      name_ko: '커스텀 엔지니어',
      name_en: 'Custom Engineer',
      title_ko: '',
      title_en: 'Custom Title',
      career: [],
    },
    galleryDocs: 0,
    portfolioDocs: 0,
    servicesDocs: 4,
    siteSettings: {
      header: {
        siteName: 'CUSTOM SITE',
      },
      homepageLayout: {
        sectionOrder: [],
      },
      contactForm: {},
      contact: {},
      footer: {},
      contactSection: {},
      pagesIndex: {
        navLabel_ko: '',
      },
    },
  })

  await seed(payload, { isFreshDatabase: false })

  assert.equal(creates.filter((entry) => entry.collection === 'services').length, 0)
  assert.equal(creates.filter((entry) => entry.collection === 'portfolio').length, 15)

  const aboutUpdate = globalUpdates.find((entry) => entry.slug === 'about')
  assert.ok(aboutUpdate)
  assert.equal(aboutUpdate.data.name_ko, '커스텀 엔지니어')
  assert.equal(aboutUpdate.data.title_ko, 'Founder / Producer / Mixer / Mastering Engineer')

  const siteSettingsUpdate = globalUpdates.find((entry) => entry.slug === 'site-settings')
  assert.ok(siteSettingsUpdate)
  assert.equal(siteSettingsUpdate.data.header.siteName, 'CUSTOM SITE')
  assert.equal(siteSettingsUpdate.data.pagesIndex.navLabel_ko, '페이지')
})

test('seed skips unsafe site-settings reseed when global read fails on repair path', async () => {
  const { globalUpdates, logs, payload } = createMockPayload({
    about: {
      name_ko: '이주희',
      name_en: 'Lee Ju Hee',
      title_ko: 'Founder / Producer / Mixer / Mastering Engineer',
      title_en: 'Founder / Producer / Mixer / Mastering Engineer',
      career: [{ period: '2024', description_ko: 'ok', description_en: 'ok' }],
    },
    galleryDocs: 1,
    portfolioDocs: 15,
    servicesDocs: 4,
    throwSiteSettings: true,
  })

  await seed(payload, { isFreshDatabase: false })

  assert.equal(globalUpdates.some((entry) => entry.slug === 'site-settings'), false)
  assert.equal(
    logs.warn.some((message) =>
      message.includes('Skipping site-settings repair because the global could not be read safely'),
    ),
    true,
  )
})
