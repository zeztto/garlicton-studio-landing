import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { cloudinaryAdapter } from './src/lib/cloudinary-adapter'

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
    meta: {
      titleSuffix: '- 갈릭톤 스튜디오',
    },
  },
  onInit: async (payload) => {
    await seed(payload)
  },
  collections: [
    Services,    // 서비스 (섹션 2)
    Portfolio,   // 포트폴리오 (섹션 4)
    Gallery,     // 갤러리 (섹션 5)
    Inquiries,   // 문의 (섹션 6)
    Pages,       // 페이지 (블로그/뉴스)
    Media,       // 미디어 (설정)
    {
      slug: 'users',
      auth: true,
      labels: { singular: '사용자', plural: '사용자' },
      admin: { group: '⚙️ 설정' },
      fields: [],
    },
  ],
  globals: [SiteSettings, About],
  plugins: [
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter({
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dnlcuy2aj',
            apiKey: process.env.CLOUDINARY_API_KEY || '971361643582292',
            apiSecret: process.env.CLOUDINARY_API_SECRET || '',
          }),
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
        },
      },
    }),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    push: true,
    client: {
      url: process.env.DATABASE_URI || '',
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    },
  }),
  sharp,
})
