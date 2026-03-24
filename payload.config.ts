import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './src/payload/collections/Media'
import { Services } from './src/payload/collections/Services'
import { Portfolio } from './src/payload/collections/Portfolio'
import { Gallery } from './src/payload/collections/Gallery'
import { Inquiries } from './src/payload/collections/Inquiries'
import { Pages } from './src/payload/collections/Pages'
import { SiteSettings } from './src/payload/globals/SiteSettings'
import { About } from './src/payload/globals/About'
import { seed } from './src/payload/seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  onInit: async (payload) => {
    await seed(payload)
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    Media,
    Services,
    Portfolio,
    Gallery,
    Inquiries,
    Pages,
  ],
  globals: [SiteSettings, About],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || '',
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    },
  }),
  sharp,
})
