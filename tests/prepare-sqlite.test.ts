import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { Payload } from 'payload'
import { prepareSqlite } from '../scripts/prepare-sqlite.mjs'
import { seedGalleryAssets } from '../scripts/seed-gallery.mjs'
import { seed, seedGalleryUploads } from '../src/payload/seed'

const ORIGINAL_DATABASE_URI = process.env.DATABASE_URI
const ORIGINAL_CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const ORIGINAL_CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const ORIGINAL_CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
const ORIGINAL_SEED_GALLERY_UPLOADS = process.env.SEED_GALLERY_UPLOADS

function restoreSeedEnv() {
  if (typeof ORIGINAL_CLOUDINARY_CLOUD_NAME === 'string') {
    process.env.CLOUDINARY_CLOUD_NAME = ORIGINAL_CLOUDINARY_CLOUD_NAME
  } else {
    delete process.env.CLOUDINARY_CLOUD_NAME
  }

  if (typeof ORIGINAL_CLOUDINARY_API_KEY === 'string') {
    process.env.CLOUDINARY_API_KEY = ORIGINAL_CLOUDINARY_API_KEY
  } else {
    delete process.env.CLOUDINARY_API_KEY
  }

  if (typeof ORIGINAL_CLOUDINARY_API_SECRET === 'string') {
    process.env.CLOUDINARY_API_SECRET = ORIGINAL_CLOUDINARY_API_SECRET
  } else {
    delete process.env.CLOUDINARY_API_SECRET
  }

  if (typeof ORIGINAL_SEED_GALLERY_UPLOADS === 'string') {
    process.env.SEED_GALLERY_UPLOADS = ORIGINAL_SEED_GALLERY_UPLOADS
  } else {
    delete process.env.SEED_GALLERY_UPLOADS
  }
}

function setCloudinaryEnv() {
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
  process.env.CLOUDINARY_API_KEY = 'test-key'
  process.env.CLOUDINARY_API_SECRET = 'test-secret'
}

function createCompleteAbout() {
  return {
    name_ko: '이주희',
    name_en: 'Lee Ju Hee',
    title_ko: 'Founder / Producer / Mixer / Mastering Engineer',
    title_en: 'Founder / Producer / Mixer / Mastering Engineer',
    career: [{ period: '2024', description_ko: 'ok', description_en: 'ok' }],
  }
}

function createCompleteSiteSettings() {
  return {
    header: {
      siteName: 'GARLICTON RECORDING STUDIO',
    },
    homepageLayout: {
      sectionOrder: [{ section: 'hero' }],
    },
    contactForm: {
      nameLabel_ko: '이름',
    },
    contact: {
      mapLatitude: 37.75,
    },
    footer: {
      showInstagram: true,
      contactTitle_ko: 'Contact',
    },
    contactSection: {
      phoneLabel_ko: '전화번호',
    },
    pagesIndex: {
      navLabel_ko: '페이지',
    },
  }
}

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
    error: [] as string[],
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
      error: (message: string) => logs.error.push(message),
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

test('seed skips gallery upload by default during runtime prepare even when gallery is empty', { concurrency: false }, async () => {
  setCloudinaryEnv()
  delete process.env.SEED_GALLERY_UPLOADS

  try {
    const { creates, logs, payload } = createMockPayload({
      about: createCompleteAbout(),
      galleryDocs: 0,
      portfolioDocs: 15,
      servicesDocs: 4,
      siteSettings: createCompleteSiteSettings(),
    })

    await seed(payload, { isFreshDatabase: false })

    assert.equal(creates.some((entry) => entry.collection === 'media'), false)
    assert.equal(creates.some((entry) => entry.collection === 'gallery'), false)
    assert.equal(
      logs.info.some((message) => message.includes('Gallery media upload seed is explicit opt-in. Skipping')),
      true,
    )
  } finally {
    restoreSeedEnv()
  }
})

test('seedGalleryUploads creates media and gallery entries only on explicit opt-in path', { concurrency: false }, async () => {
  setCloudinaryEnv()
  delete process.env.SEED_GALLERY_UPLOADS

  try {
    const { creates, logs, payload } = createMockPayload({
      about: createCompleteAbout(),
      galleryDocs: 0,
      portfolioDocs: 15,
      servicesDocs: 4,
      siteSettings: createCompleteSiteSettings(),
    })

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'garlicton-gallery-seed-test-'))

    try {
      await fs.writeFile(path.join(tempDir, 'seed-image.jpg'), 'fake-image')

      const created = await seedGalleryUploads(payload, {
        phase: 'bootstrap',
        galleryImages: [
          {
            caption_en: 'Seed image',
            caption_ko: '시드 이미지',
            file: 'seed-image.jpg',
          },
        ],
        imageDir: tempDir,
      })

      assert.equal(created, true)
      assert.equal(creates.filter((entry) => entry.collection === 'media').length, 1)
      assert.equal(creates.filter((entry) => entry.collection === 'gallery').length, 1)
      assert.equal(
        logs.info.some((message) => message.includes('Explicit gallery upload seed created 1 gallery items')),
        true,
      )
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true })
    }
  } finally {
    restoreSeedEnv()
  }
})

test('seedGalleryAssets uses the explicit gallery upload helper instead of runtime prepare seed', { concurrency: false }, async () => {
  setCloudinaryEnv()

  try {
    let explicitUploadCalled = false
    const logs: string[] = []

    const result = await seedGalleryAssets({
      log: (message) => logs.push(message),
      loadRuntime: async () => ({
        config: {},
        getPayload: async () => ({
          destroy: async () => {},
          find: async ({ collection }: { collection: string }) => {
            if (collection !== 'gallery') {
              throw new Error(`Unexpected collection lookup: ${collection}`)
            }

            return { totalDocs: 1, docs: [] }
          },
        }),
        seedGalleryUploads: async () => {
          explicitUploadCalled = true
          return true
        },
        starterGallerySeedCount: 1,
      }),
    })

    assert.equal(explicitUploadCalled, true)
    assert.equal(result.totalDocs, 1)
    assert.equal(
      logs.some((message) => message.includes('Running explicit starter gallery upload with Cloudinary enabled.')),
      true,
    )
  } finally {
    restoreSeedEnv()
  }
})

test('seedGalleryAssets fails fast when gallery remains partially seeded', { concurrency: false }, async () => {
  setCloudinaryEnv()

  try {
    await assert.rejects(
      seedGalleryAssets({
        log: () => {},
        loadRuntime: async () => ({
          config: {},
          getPayload: async () => ({
            destroy: async () => {},
            find: async () => ({ totalDocs: 3, docs: [] }),
          }),
          seedGalleryUploads: async () => false,
          starterGallerySeedCount: 12,
        }),
      }),
      /Gallery seed is incomplete \(3\/12\)/,
    )
  } finally {
    restoreSeedEnv()
  }
})
