# Garlicton Studio Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (ko/en) landing page for Garlicton Studio, a metal-focused music production studio, with a self-hosted CMS for easy content management.

**Architecture:** Single Next.js 15 app with Payload CMS v3 embedded. Payload Local API for build-time data fetching. Frontend deployed to Vercel as static output. CMS admin runs on local server. Contact form handled via Vercel API Route with Turnstile + Honeypot spam protection.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Payload CMS v3, SQLite (`@payloadcms/db-sqlite`), Tailwind CSS v4, next-intl, Nodemailer, Cloudflare Turnstile, Kakao Map API

**Spec:** `docs/superpowers/specs/2026-03-24-garlicton-studio-landing-design.md`

---

## File Structure

```
garlicton-studio-landing/
├── src/
│   ├── app/
│   │   ├── (frontend)/
│   │   │   └── [locale]/
│   │   │       ├── page.tsx                 # Landing page (SSG)
│   │   │       └── layout.tsx               # i18n layout wrapper
│   │   ├── (payload)/
│   │   │   └── admin/
│   │   │       └── [[...segments]]/
│   │   │           └── page.tsx             # Payload admin (local only)
│   │   ├── api/
│   │   │   ├── contact/
│   │   │   │   └── route.ts                # Contact form endpoint
│   │   │   └── [...payload]/
│   │   │       └── route.ts                # Payload REST API
│   │   ├── layout.tsx                       # Root layout
│   │   └── not-found.tsx                    # 404 page
│   ├── components/
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── StudioGallery.tsx
│   │   │   └── Contact.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/
│   │       ├── ContactForm.tsx              # Client component
│   │       ├── LanguageToggle.tsx            # Client component
│   │       ├── Lightbox.tsx                 # Client component
│   │       ├── MediaEmbed.tsx
│   │       ├── KakaoMap.tsx                 # Client component
│   │       └── MobileMenu.tsx               # Client component
│   ├── lib/
│   │   ├── payload.ts                       # getPayload helper
│   │   ├── types.ts                         # Shared TypeScript types
│   │   └── turnstile.ts                     # Turnstile server validation
│   ├── payload/
│   │   ├── collections/
│   │   │   ├── Services.ts
│   │   │   ├── Portfolio.ts
│   │   │   ├── Gallery.ts
│   │   │   ├── Inquiries.ts
│   │   │   ├── Pages.ts
│   │   │   └── Media.ts
│   │   ├── globals/
│   │   │   ├── SiteSettings.ts
│   │   │   └── About.ts
│   │   └── seed.ts                          # Seed data script
│   ├── messages/
│   │   ├── ko.json                          # Korean UI strings
│   │   └── en.json                          # English UI strings
│   └── i18n/
│       ├── config.ts                        # Locale configuration
│       ├── routing.ts                       # next-intl routing definition
│       └── request.ts                       # next-intl request config
├── public/
│   └── fonts/                               # Self-hosted fonts
├── payload.config.ts                        # Payload root config
├── .env.local                               # Environment variables
├── .env.example                             # Env template
├── next.config.ts
├── deploy.sh                                # Build & deploy script
├── package.json
└── tsconfig.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `payload.config.ts`, `tsconfig.json`, `.env.local`, `.env.example`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `src/app/api/[...payload]/route.ts`

- [ ] **Step 1: Initialize project with create-payload-app**

```bash
cd /Users/sungwoonjeon/dev
npx create-payload-app@latest garlicton-studio-landing --db sqlite --no-deps
```

Select: `blank` template, TypeScript.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/sungwoonjeon/dev/garlicton-studio-landing
npm install
npm install next-intl nodemailer @types/nodemailer lucide-react
npm install -D tailwindcss @tailwindcss/postcss postcss
```

- [ ] **Step 3: Create `.env.local`**

```env
# Payload
DATABASE_URI=file:./db.sqlite
PAYLOAD_SECRET=garlicton-studio-secret-change-in-production

# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAACvO3_aCAmeKYVsR
TURNSTILE_SECRET_KEY=0x4AAAAAACvO38YlZ98n15ZNzQPHShDw3hk

# Kakao Map
NEXT_PUBLIC_KAKAO_MAP_KEY=632675383feaf2d07187466f1dba3acc

# SMTP (configure with actual values)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_EMAIL=contact@garlictonstudio.com
```

- [ ] **Step 4: Create `.env.example`**

Same as `.env.local` but with placeholder values (no real keys).

- [ ] **Step 5: Configure `.gitignore`**

Ensure `.env.local`, `db.sqlite`, `node_modules`, `.next` are ignored.

- [ ] **Step 6: Configure Tailwind CSS v4**

Create `src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  --color-bg: #0A0A0A;
  --color-text: #F0F0F0;
  --color-accent: #8B0000;
  --color-card: #1A1A1A;
  --color-muted: #888888;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

Update `postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 7: Set up fonts**

Download Oswald (headings), Pretendard (Korean body), Inter (English body) to `public/fonts/`. Register in `src/app/layout.tsx` using `next/font/local`.

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Visit `http://localhost:3000/admin` — Payload admin should load.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js + Payload CMS + SQLite + Tailwind project"
```

---

## Task 2: Payload CMS Collections & Globals

**Files:**
- Create: `src/payload/collections/Services.ts`
- Create: `src/payload/collections/Portfolio.ts`
- Create: `src/payload/collections/Gallery.ts`
- Create: `src/payload/collections/Inquiries.ts`
- Create: `src/payload/collections/Pages.ts`
- Create: `src/payload/collections/Media.ts`
- Create: `src/payload/globals/SiteSettings.ts`
- Create: `src/payload/globals/About.ts`
- Modify: `payload.config.ts`

- [ ] **Step 1: Create Media upload collection**

`src/payload/collections/Media.ts`:

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt_ko',
      type: 'text',
      label: 'Alt Text (한국어)',
    },
    {
      name: 'alt_en',
      type: 'text',
      label: 'Alt Text (English)',
    },
  ],
}
```

- [ ] **Step 2: Create Services collection**

`src/payload/collections/Services.ts`:

```typescript
import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'sortOrder'],
  },
  fields: [
    { name: 'title_ko', type: 'text', required: true, label: '제목 (한국어)' },
    { name: 'title_en', type: 'text', required: true, label: 'Title (English)' },
    { name: 'description_ko', type: 'textarea', required: true, label: '설명 (한국어)' },
    { name: 'description_en', type: 'textarea', required: true, label: 'Description (English)' },
    { name: 'icon', type: 'text', required: true, label: 'Icon name (Lucide icon)' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0, label: '정렬 순서' },
  ],
}
```

- [ ] **Step 3: Create Portfolio collection**

`src/payload/collections/Portfolio.ts`:

```typescript
import type { CollectionConfig } from 'payload'

export const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  admin: {
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'artist', 'mediaType', 'sortOrder'],
  },
  fields: [
    { name: 'title_ko', type: 'text', required: true, label: '제목 (한국어)' },
    { name: 'title_en', type: 'text', required: true, label: 'Title (English)' },
    { name: 'artist', type: 'text', required: true, label: '아티스트' },
    { name: 'genre', type: 'text', label: '장르' },
    { name: 'description_ko', type: 'textarea', label: '설명 (한국어)' },
    { name: 'description_en', type: 'textarea', label: 'Description (English)' },
    {
      name: 'mediaType',
      type: 'select',
      required: true,
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'SoundCloud', value: 'soundcloud' },
        { label: 'Spotify', value: 'spotify' },
      ],
    },
    { name: 'embedUrl', type: 'text', required: true, label: 'Embed URL' },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: '커버 이미지' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0 },
  ],
}
```

- [ ] **Step 4: Create Gallery collection**

`src/payload/collections/Gallery.ts`:

```typescript
import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    defaultColumns: ['image', 'caption_ko', 'sortOrder'],
  },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption_ko', type: 'text', label: '캡션 (한국어)' },
    { name: 'caption_en', type: 'text', label: 'Caption (English)' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0 },
  ],
}
```

- [ ] **Step 5: Create Inquiries collection**

`src/payload/collections/Inquiries.ts`:

```typescript
import type { CollectionConfig } from 'payload'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'isRead', 'createdAt'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Recording', value: 'recording' },
        { label: 'Mixing', value: 'mixing' },
        { label: 'Mastering', value: 'mastering' },
        { label: 'Producing', value: 'producing' },
      ],
    },
    { name: 'genre', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    { name: 'isRead', type: 'checkbox', defaultValue: false, label: '읽음' },
  ],
}
```

- [ ] **Step 6: Create Pages collection (future blog/news)**

`src/payload/collections/Pages.ts`:

```typescript
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'status', 'updatedAt'],
  },
  fields: [
    { name: 'title_ko', type: 'text', required: true },
    { name: 'title_en', type: 'text' },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'body_ko', type: 'richText' },
    { name: 'body_en', type: 'richText' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}
```

- [ ] **Step 7: Create SiteSettings global**

`src/payload/globals/SiteSettings.ts`:

```typescript
import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '사이트 설정',
  fields: [
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'tagline_ko', type: 'text', label: '태그라인 (한국어)', defaultValue: '메탈 사운드의 전문가' },
    { name: 'tagline_en', type: 'text', label: 'Tagline (English)', defaultValue: 'Expert in Metal Sound' },
    { name: 'phone', type: 'text', defaultValue: '0507-1313-6843' },
    { name: 'email', type: 'email' },
    { name: 'address_ko', type: 'text', defaultValue: '인천 강화군 강화읍 북문길67번길 8-1' },
    { name: 'address_en', type: 'text', defaultValue: '8-1, Bukmun-gil 67beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon' },
    { name: 'instagramUrl', type: 'text', defaultValue: 'https://www.instagram.com/garlicton_studio' },
    { name: 'kakaoChannelUrl', type: 'text', label: '카카오 채널 URL (보류)' },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle_ko', type: 'text', defaultValue: '갈릭톤 스튜디오 | 메탈 음악 전문 레코딩 스튜디오' },
        { name: 'metaTitle_en', type: 'text', defaultValue: 'Garlicton Studio | Metal Music Recording Studio' },
        { name: 'metaDescription_ko', type: 'textarea', defaultValue: '메탈 음악 전문 레코딩, 믹싱, 마스터링, 프로듀싱 스튜디오. 15년 이상의 경력을 가진 전문 엔지니어가 함께합니다.' },
        { name: 'metaDescription_en', type: 'textarea', defaultValue: 'Professional metal music recording, mixing, mastering, and producing studio with 15+ years of industry experience.' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
```

- [ ] **Step 8: Create About global**

`src/payload/globals/About.ts`:

```typescript
import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: '엔지니어 소개',
  fields: [
    { name: 'name_ko', type: 'text', required: true, defaultValue: '이주희' },
    { name: 'name_en', type: 'text', required: true, defaultValue: 'Juhee Lee' },
    { name: 'title_ko', type: 'text', defaultValue: '메인 엔지니어' },
    { name: 'title_en', type: 'text', defaultValue: 'Main Engineer' },
    { name: 'bio_ko', type: 'richText' },
    { name: 'bio_en', type: 'richText' },
    { name: 'profileImage', type: 'upload', relationTo: 'media' },
    {
      name: 'career',
      type: 'array',
      label: '경력',
      fields: [
        { name: 'period', type: 'text', label: '기간' },
        { name: 'description_ko', type: 'text', label: '내용 (한국어)' },
        { name: 'description_en', type: 'text', label: 'Description (English)' },
      ],
    },
  ],
}
```

- [ ] **Step 9: Register all collections and globals in `payload.config.ts`**

```typescript
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Media } from '@/payload/collections/Media'
import { Services } from '@/payload/collections/Services'
import { Portfolio } from '@/payload/collections/Portfolio'
import { Gallery } from '@/payload/collections/Gallery'
import { Inquiries } from '@/payload/collections/Inquiries'
import { Pages } from '@/payload/collections/Pages'
import { SiteSettings } from '@/payload/globals/SiteSettings'
import { About } from '@/payload/globals/About'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [Media, Services, Portfolio, Gallery, Inquiries, Pages],
  globals: [SiteSettings, About],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./db.sqlite',
    },
  }),
  sharp,
})
```

Note: Keep the default `Users` collection that Payload generates for admin auth.

- [ ] **Step 10: Verify — run dev, visit `/admin`, create a test service entry**

```bash
npm run dev
```

Visit `http://localhost:3000/admin`. Create admin user. Add a test service item.

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "feat: add Payload CMS collections and globals for all content types"
```

---

## Task 3: Seed Data

**Files:**
- Create: `src/payload/seed.ts`
- Modify: `payload.config.ts` (add onInit hook)

- [ ] **Step 1: Create seed script**

`src/payload/seed.ts` — populate default services, about info, and site settings with initial Korean/English content. Include all 4 services (레코딩/Recording, 믹싱/Mixing, 마스터링/Mastering, 프로듀싱/Producing).

```typescript
import type { Payload } from 'payload'

export async function seed(payload: Payload) {
  // Check if already seeded
  const existingServices = await payload.find({ collection: 'services', limit: 1 })
  if (existingServices.totalDocs > 0) return

  // Services
  const servicesData = [
    { title_ko: '레코딩', title_en: 'Recording', description_ko: '최고의 장비와 환경에서 당신의 사운드를 완벽하게 담아냅니다.', description_en: 'Capture your sound perfectly with top-tier equipment and environment.', icon: 'mic', sortOrder: 1 },
    { title_ko: '믹싱', title_en: 'Mixing', description_ko: '각 트랙의 밸런스를 맞추고 사운드에 깊이와 공간감을 더합니다.', description_en: 'Balance each track and add depth and space to your sound.', icon: 'sliders-horizontal', sortOrder: 2 },
    { title_ko: '마스터링', title_en: 'Mastering', description_ko: '최종 마스터링으로 상업적 수준의 완성도를 갖춘 사운드를 만듭니다.', description_en: 'Achieve commercial-grade sound quality with final mastering.', icon: 'disc-3', sortOrder: 3 },
    { title_ko: '프로듀싱', title_en: 'Producing', description_ko: '곡의 방향성부터 편곡, 사운드 디자인까지 종합적인 프로듀싱을 제공합니다.', description_en: 'Comprehensive producing from song direction to arrangement and sound design.', icon: 'music', sortOrder: 4 },
  ]

  for (const service of servicesData) {
    await payload.create({ collection: 'services', data: service })
  }

  // About global
  await payload.updateGlobal({
    slug: 'about',
    data: {
      name_ko: '이주희',
      name_en: 'Juhee Lee',
      title_ko: '메인 엔지니어',
      title_en: 'Main Engineer',
      career: [
        { period: '2016', description_ko: '램넌츠오브더폴른 1집 《Shadow Walk》 마스터링 — 제14회 한국대중음악상(2017) 최우수 메탈&하드코어 음반 수상', description_en: 'Remnants of the Fallen 1st Album "Shadow Walk" Mastering — 14th Korean Music Awards (2017) Best Metal & Hardcore Album Winner' },
        { period: '2017', description_ko: '기타리스트 김재하 1집 《Into Ashes》 믹싱/마스터링 — 제15회 한국대중음악상 최우수 메탈&하드코어 음반 노미네이트', description_en: 'Guitarist Kim Jaeha 1st Album "Into Ashes" Mixing/Mastering — 15th KMA Best Metal & Hardcore Album Nominee' },
        { period: '2019', description_ko: '《블랙홀 트리뷰트 - RE-ENCOUNTER THE MIRACLE》 믹싱/마스터링 — 제17회 한국대중음악상(2020) 노미네이트', description_en: '"Black Hole Tribute - RE-ENCOUNTER THE MIRACLE" Mixing/Mastering — 17th KMA (2020) Nominee' },
        { period: '2019', description_ko: '메써드 5집 《Definition of Method》 믹싱 — 제17회 한국대중음악상(2020) 최우수 메탈&하드코어 음반 수상', description_en: 'Method 5th Album "Definition of Method" Mixing — 17th KMA (2020) Best Metal & Hardcore Album Winner' },
        { period: '2020', description_ko: '램넌츠 오브 더 폴른 2집 《All the Wounded and Broken》 믹싱/마스터링 — 제18회 한국대중음악상(2021) 최우수 메탈&하드코어 음반 수상', description_en: 'Remnants of the Fallen 2nd Album "All the Wounded and Broken" Mixing/Mastering — 18th KMA (2021) Best Metal & Hardcore Album Winner' },
        { period: '2021', description_ko: '스핏온마이툼 1집 《Necrosis》 믹싱/마스터링 — 제19회 한국대중음악상 노미네이트', description_en: 'Spit On My Tomb 1st Album "Necrosis" Mixing/Mastering — 19th KMA Nominee' },
        { period: '2023', description_ko: '도굴 EP 《If These Bodies Could Talk》 믹싱/마스터링 — 제21회 한국대중음악상 노미네이트', description_en: 'Dogul EP "If These Bodies Could Talk" Mixing/Mastering — 21st KMA Nominee' },
        { period: '2025', description_ko: '로스 오브 인펙션 EP 《罰錢 (Beoljeon)》 믹싱/마스터링 — 제23회 한국대중음악상 노미네이트', description_en: 'Loss of Infection EP "罰錢 (Beoljeon)" Mixing/Mastering — 23rd KMA Nominee' },
      ],
    },
  })

  // Site settings
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      tagline_ko: '메탈 사운드의 전문가',
      tagline_en: 'Expert in Metal Sound',
      phone: '0507-1313-6843',
      address_ko: '인천 강화군 강화읍 북문길67번길 8-1',
      address_en: '8-1, Bukmun-gil 67beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon',
      instagramUrl: 'https://www.instagram.com/garlicton_studio',
    },
  })

  // Portfolio
  const portfolioData = [
    { title_ko: '메써드 - Definition of Method', title_en: 'Method - Definition of Method', artist: 'Method (메써드)', genre: 'Metal', description_ko: '제17회 한국대중음악상 최우수 메탈&하드코어 음반 수상', description_en: '17th KMA Best Metal & Hardcore Album Winner', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/ufY9hX0pyxs', sortOrder: 1 },
    { title_ko: '램넌츠 오브 더 폴른', title_en: 'Remnants of the Fallen', artist: 'Remnants of the Fallen (램넌츠)', genre: 'Metal', description_ko: '제14회, 제18회 한국대중음악상 수상', description_en: '14th & 18th KMA Winner', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/PatgDlahzb4', sortOrder: 2 },
    { title_ko: '킬카이저', title_en: 'Killkaiser', artist: 'Killkaiser (킬카이저)', genre: 'Metal', description_ko: '', description_en: '', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/ja9sQUVVolw', sortOrder: 3 },
    { title_ko: '도굴 - If These Bodies Could Talk', title_en: 'Dogul - If These Bodies Could Talk', artist: 'Dogul (도굴)', genre: 'Metal', description_ko: '제21회 한국대중음악상 노미네이트', description_en: '21st KMA Nominee', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/Brs86Po4JF0', sortOrder: 4 },
    { title_ko: '진격', title_en: 'Jingyeok', artist: '진격', genre: 'Metal', description_ko: '', description_en: '', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/zrG1jtdu9Wc', sortOrder: 5 },
    { title_ko: '스핏온마이툼 - Necrosis', title_en: 'Spit On My Tomb - Necrosis', artist: 'Spit On My Tomb (스핏온마이툼)', genre: 'Metal', description_ko: '제19회 한국대중음악상 노미네이트', description_en: '19th KMA Nominee', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/XdTJZNLoALs', sortOrder: 6 },
    { title_ko: '로스 오브 인펙션 - 罰錢', title_en: 'Loss of Infection - 罰錢 (Beoljeon)', artist: 'Loss of Infection (로스오브인펙션)', genre: 'Metal', description_ko: '제23회 한국대중음악상 노미네이트', description_en: '23rd KMA Nominee', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/Hh8wGP9h5Ns', sortOrder: 7 },
    { title_ko: '크랙샷', title_en: 'Crackshot', artist: 'Crackshot (크랙샷)', genre: 'Metal', description_ko: '', description_en: '', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/NSEzvZjcPSU', sortOrder: 8 },
    { title_ko: '넉아웃', title_en: 'Knockout', artist: 'Knockout (넉아웃)', genre: 'Metal', description_ko: '', description_en: '', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/ML61TPRldik', sortOrder: 9 },
    { title_ko: '김재하 - Into Ashes', title_en: 'Kim Jaeha - Into Ashes', artist: '김재하', genre: 'Metal', description_ko: '제15회 한국대중음악상 노미네이트', description_en: '15th KMA Nominee', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/e_Lwpjr13BM', sortOrder: 10 },
    { title_ko: '스테리웨이브', title_en: 'Steriwave', artist: 'Steriwave (스테리웨이브)', genre: 'Metal', description_ko: '', description_en: '', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/HEXQ04eDDvw', sortOrder: 11 },
    { title_ko: '델리움', title_en: 'Delirium', artist: 'Delirium (델리움)', genre: 'Metal', description_ko: '', description_en: '', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/sADflGBsyPQ', sortOrder: 12 },
    { title_ko: '디스럽션', title_en: 'Disruption', artist: 'Disruption (디스럽션)', genre: 'Metal', description_ko: '', description_en: '', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/L00gag6Af1M', sortOrder: 13 },
    { title_ko: '아워글라스', title_en: 'Hourglass', artist: 'Hourglass (아워글라스)', genre: 'Metal', description_ko: '', description_en: '', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/e5qKZockiYQ', sortOrder: 14 },
    { title_ko: '블랙홀 30주년 트리뷰트', title_en: 'Black Hole 30th Anniversary Tribute', artist: 'Various Artists', genre: 'Metal', description_ko: '제17회 한국대중음악상 노미네이트', description_en: '17th KMA Nominee', mediaType: 'youtube' as const, embedUrl: 'https://youtu.be/xoHw69YG5b0', sortOrder: 15 },
  ]

  for (const item of portfolioData) {
    await payload.create({ collection: 'portfolio', data: item })
  }

  console.log('✓ Seed data created')
}
```

- [ ] **Step 2: Wire seed into Payload onInit**

Add to `payload.config.ts`:

```typescript
import { seed } from '@/payload/seed'

export default buildConfig({
  // ... existing config
  onInit: async (payload) => {
    await seed(payload)
  },
})
```

- [ ] **Step 3: Verify — restart dev server, check admin for seeded data**

```bash
npm run dev
```

Visit `/admin` → Services should show 4 items.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add seed data for services, about, and site settings"
```

---

## Task 4: i18n Setup

**Files:**
- Create: `src/i18n/config.ts`
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/messages/ko.json`
- Create: `src/messages/en.json`
- Create: `src/middleware.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create locale config**

`src/i18n/config.ts`:

```typescript
export const locales = ['ko', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ko'
```

- [ ] **Step 2: Create next-intl request config**

`src/i18n/request.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

`src/i18n/routing.ts`:

```typescript
import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale,
})
```

- [ ] **Step 3: Create Korean UI strings**

`src/messages/ko.json`:

```json
{
  "nav": {
    "services": "서비스",
    "about": "소개",
    "portfolio": "포트폴리오",
    "studio": "스튜디오",
    "contact": "연락처"
  },
  "hero": {
    "cta": "문의하기"
  },
  "services": {
    "title": "서비스"
  },
  "about": {
    "title": "엔지니어 소개",
    "experience": "15년 이상의 메탈 음악 산업 경력"
  },
  "portfolio": {
    "title": "포트폴리오"
  },
  "studio": {
    "title": "스튜디오"
  },
  "contact": {
    "title": "연락처",
    "name": "이름",
    "email": "이메일",
    "phone": "전화번호",
    "services": "관심 서비스",
    "genre": "장르",
    "message": "메시지",
    "submit": "보내기",
    "success": "문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.",
    "error": "전송에 실패했습니다. 다시 시도해주세요.",
    "recording": "레코딩",
    "mixing": "믹싱",
    "mastering": "마스터링",
    "producing": "프로듀싱"
  },
  "footer": {
    "copyright": "© {year} 갈릭톤 스튜디오. All rights reserved."
  }
}
```

- [ ] **Step 4: Create English UI strings**

`src/messages/en.json` — mirror structure of `ko.json` with English values.

- [ ] **Step 5: Create middleware for locale routing**

`src/middleware.ts`:

```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/', '/(ko|en)/:path*'],
}
```

- [ ] **Step 6: Update `next.config.ts`**

```typescript
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
  // existing config
}

export default withPayload(withNextIntl(nextConfig))
```

- [ ] **Step 7: Verify — visit `/ko` and `/en`, check redirect from `/`**

```bash
npm run dev
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: configure next-intl for Korean/English bilingual support"
```

---

## Task 5: Frontend Layout (Navbar + Footer)

**Files:**
- Create: `src/app/(frontend)/[locale]/layout.tsx`
- Create: `src/app/(frontend)/[locale]/page.tsx` (placeholder)
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/ui/LanguageToggle.tsx`
- Create: `src/components/ui/MobileMenu.tsx`
- Create: `src/lib/payload.ts`

- [ ] **Step 1: Create Payload helper**

`src/lib/payload.ts`:

```typescript
import config from '@payload-config'
import { getPayload } from 'payload'

export const getPayloadClient = () => getPayload({ config })
```

- [ ] **Step 2: Create locale layout**

`src/app/(frontend)/[locale]/layout.tsx`:

```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as any)) notFound()

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  )
}
```

- [ ] **Step 3: Create Navbar**

`src/components/layout/Navbar.tsx` — fixed top, transparent bg that becomes semi-transparent on scroll, section anchor links (서비스/소개/포트폴리오/스튜디오/연락처), language toggle, hamburger menu on mobile. Client-side scroll detection for bg change.

- [ ] **Step 4: Create LanguageToggle**

`src/components/ui/LanguageToggle.tsx` — client component, switches between `/ko` and `/en` preserving current section anchor.

- [ ] **Step 5: Create MobileMenu**

`src/components/ui/MobileMenu.tsx` — slide-in menu for mobile, same nav links, language toggle.

- [ ] **Step 6: Create Footer**

`src/components/layout/Footer.tsx` — fetch SiteSettings via Payload Local API. Display address, phone, Instagram link, copyright with current year.

- [ ] **Step 7: Create placeholder landing page**

`src/app/(frontend)/[locale]/page.tsx`:

```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Garlicton Studio</h1>
    </div>
  )
}
```

- [ ] **Step 8: Verify — nav renders, language toggle works, footer shows studio info**

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add Navbar with language toggle and Footer with studio info"
```

---

## Task 6: Hero Section

**Files:**
- Create: `src/components/sections/Hero.tsx`
- Modify: `src/app/(frontend)/[locale]/page.tsx`

- [ ] **Step 1: Create Hero component**

`src/components/sections/Hero.tsx` — full-screen section, dark overlay on background image, studio name "GARLICTON STUDIO" in large Oswald font, tagline from CMS (SiteSettings), CTA button scrolling to Contact section. Fetch SiteSettings via Payload Local API.

- [ ] **Step 2: Add Hero to landing page**

Update `src/app/(frontend)/[locale]/page.tsx` to render `<Hero />`.

- [ ] **Step 3: Verify — hero fills viewport, CTA scrolls to bottom**

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add Hero section with tagline and CTA"
```

---

## Task 7: Services Section

**Files:**
- Create: `src/components/sections/Services.tsx`
- Modify: `src/app/(frontend)/[locale]/page.tsx`

- [ ] **Step 1: Create Services component**

`src/components/sections/Services.tsx` — section with id="services". Fetch services from Payload sorted by `sortOrder`. Render 4 cards in a 2x2 grid (1 column on mobile). Each card: Lucide icon, title, description. Use locale to pick `title_ko`/`title_en` and `description_ko`/`description_en`.

- [ ] **Step 2: Add to landing page**

- [ ] **Step 3: Verify — 4 service cards render with correct locale text**

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add Services section with CMS-driven content"
```

---

## Task 8: About Section

**Files:**
- Create: `src/components/sections/About.tsx`
- Modify: `src/app/(frontend)/[locale]/page.tsx`

- [ ] **Step 1: Create About component**

`src/components/sections/About.tsx` — section with id="about". Fetch About global via Payload Local API. Layout: profile image left (or top on mobile), name + title + bio text right, career list below (if entries exist). Localized fields.

- [ ] **Step 2: Add to landing page**

- [ ] **Step 3: Verify — about section renders with engineer info**

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add About section with engineer profile"
```

---

## Task 9: Portfolio Section

**Files:**
- Create: `src/components/sections/Portfolio.tsx`
- Create: `src/components/ui/MediaEmbed.tsx`
- Modify: `src/app/(frontend)/[locale]/page.tsx`

- [ ] **Step 1: Create MediaEmbed component**

`src/components/ui/MediaEmbed.tsx` — renders appropriate embed iframe based on `mediaType`:
- `youtube`: YouTube embed iframe (extract video ID from URL)
- `soundcloud`: SoundCloud embed iframe
- `spotify`: Spotify embed iframe
Responsive aspect ratio container. Each embed type has its own URL-to-embed-URL transformation.

- [ ] **Step 2: Create Portfolio component**

`src/components/sections/Portfolio.tsx` — section with id="portfolio". Fetch portfolio items sorted by `sortOrder`. Grid layout (2 columns desktop, 1 mobile). Each item: cover image or embed player, title, artist, genre tag, description.

- [ ] **Step 3: Add to landing page**

- [ ] **Step 4: Verify — portfolio items render, embeds load correctly**

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add Portfolio section with YouTube/SoundCloud/Spotify embeds"
```

---

## Task 10: Studio Gallery Section

**Files:**
- Create: `src/components/sections/StudioGallery.tsx`
- Create: `src/components/ui/Lightbox.tsx`
- Modify: `src/app/(frontend)/[locale]/page.tsx`

- [ ] **Step 1: Create Lightbox component**

`src/components/ui/Lightbox.tsx` — client component. Full-screen overlay, displays image with caption, prev/next navigation, close button, keyboard navigation (arrow keys, Escape), swipe gesture on mobile (touch events). No external library.

- [ ] **Step 2: Create StudioGallery component**

`src/components/sections/StudioGallery.tsx` — section with id="studio". Fetch gallery items sorted by `sortOrder`. Masonry-like grid of images. Click opens Lightbox. Images use `next/image` for optimization. Localized captions.

- [ ] **Step 3: Add to landing page**

- [ ] **Step 4: Verify — gallery renders, clicking image opens lightbox, keyboard/swipe navigation works**

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add Studio Gallery section with lightbox viewer"
```

---

## Task 11: Contact Form API (TDD)

**Files:**
- Create: `src/lib/turnstile.ts`
- Create: `src/app/api/contact/route.ts`
- Create: `__tests__/api/contact.test.ts`

- [ ] **Step 1: Write failing test for Turnstile validation**

`__tests__/api/contact.test.ts`:

```typescript
import { verifyTurnstileToken } from '@/lib/turnstile'

describe('verifyTurnstileToken', () => {
  it('should return false for empty token', async () => {
    const result = await verifyTurnstileToken('')
    expect(result).toBe(false)
  })

  it('should return false for invalid token', async () => {
    // Mock fetch to return unsuccessful response
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    })
    const result = await verifyTurnstileToken('invalid-token')
    expect(result).toBe(false)
  })

  it('should return true for valid token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    })
    const result = await verifyTurnstileToken('valid-token')
    expect(result).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/api/contact.test.ts --no-cache
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement Turnstile validation**

`src/lib/turnstile.ts`:

```typescript
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!token) return false

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY || '',
      response: token,
    }),
  })

  const data = await response.json()
  return data.success === true
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest __tests__/api/contact.test.ts --no-cache
```

Expected: PASS

- [ ] **Step 5: Write failing test for contact API route validation**

Add to `__tests__/api/contact.test.ts`:

```typescript
describe('POST /api/contact', () => {
  it('should reject missing required fields', async () => {
    // Test with empty body — expect 400
  })

  it('should reject invalid email format', async () => {
    // Test with bad email — expect 400
  })

  it('should reject honeypot filled submissions', async () => {
    // Test with honeypot field filled — expect silently accepted (200) but not processed
  })
})
```

- [ ] **Step 6: Implement contact API route**

`src/app/api/contact/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { verifyTurnstileToken } from '@/lib/turnstile'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, phone, services, genre, message, turnstileToken, website } = body

  // Honeypot check — 'website' is a hidden field, bots fill it
  if (website) {
    return NextResponse.json({ success: true }) // Silent success
  }

  // Validate required fields
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  // Verify Turnstile
  const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
  if (!isTurnstileValid) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  // Send email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      subject: `[갈릭톤 스튜디오] 새 문의: ${name}`,
      html: `
        <h2>새로운 문의가 접수되었습니다</h2>
        <p><strong>이름:</strong> ${name}</p>
        <p><strong>이메일:</strong> ${email}</p>
        <p><strong>전화번호:</strong> ${phone || '미입력'}</p>
        <p><strong>관심 서비스:</strong> ${services?.join(', ') || '미선택'}</p>
        <p><strong>장르:</strong> ${genre || '미입력'}</p>
        <p><strong>메시지:</strong></p>
        <p>${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
```

- [ ] **Step 7: Run all tests**

```bash
npx jest __tests__/api/contact.test.ts --no-cache
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add contact form API with Turnstile validation and email notification"
```

---

## Task 12: Contact Section UI

**Files:**
- Create: `src/components/sections/Contact.tsx`
- Create: `src/components/ui/ContactForm.tsx`
- Create: `src/components/ui/KakaoMap.tsx`
- Modify: `src/app/(frontend)/[locale]/page.tsx`

- [ ] **Step 1: Create KakaoMap component**

`src/components/ui/KakaoMap.tsx` — client component. Load Kakao Map JavaScript SDK via script tag. Initialize map centered on studio coordinates (강화군 address). Add marker. Dark-styled map if available.

- [ ] **Step 2: Create ContactForm component**

`src/components/ui/ContactForm.tsx` — client component. Form fields: name (required), email (required), phone, services (multi-select checkboxes), genre, message (required), hidden honeypot field (`website`). Turnstile widget. Submit handler posts to `/api/contact`. Success/error toast messages. Loading state on submit button. Use `useTranslations` for labels.

- [ ] **Step 3: Create Contact section**

`src/components/sections/Contact.tsx` — section with id="contact". Two-column layout (form left, info + map right). Info: phone, address, Instagram link. KakaoMap below info. Single column on mobile.

- [ ] **Step 4: Add to landing page**

- [ ] **Step 5: Verify — form renders, validation works, honeypot field is hidden, Turnstile widget loads, map shows correct location**

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add Contact section with form, Kakao Map, and Turnstile"
```

---

## Task 13: SEO

**Files:**
- Modify: `src/app/(frontend)/[locale]/layout.tsx` (metadata)
- Modify: `src/app/(frontend)/[locale]/page.tsx` (generateMetadata)
- Create: `src/app/sitemap.ts`
- Modify: `src/app/layout.tsx` (JSON-LD)

- [ ] **Step 1: Add generateMetadata to landing page**

`src/app/(frontend)/[locale]/page.tsx` — export `generateMetadata` function that fetches SiteSettings from Payload and returns locale-specific title, description, Open Graph, Twitter Card, hreflang alternate links.

```typescript
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  const title = locale === 'ko' ? settings.seo?.metaTitle_ko : settings.seo?.metaTitle_en
  const description = locale === 'ko' ? settings.seo?.metaDescription_ko : settings.seo?.metaDescription_en

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { ko: '/ko', en: '/en' },
    },
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}
```

- [ ] **Step 2: Add JSON-LD structured data**

Add `LocalBusiness` JSON-LD schema to the landing page:

```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Garlicton Studio',
  description: settings.seo?.metaDescription_en,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '북문길67번길 8-1',
    addressLocality: '강화읍',
    addressRegion: '인천',
    addressCountry: 'KR',
  },
  telephone: settings.phone,
  url: 'https://garlicton-studio.vercel.app',
}
```

- [ ] **Step 3: Create sitemap**

`src/app/sitemap.ts`:

```typescript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://garlicton-studio.vercel.app'
  return [
    { url: `${baseUrl}/ko`, lastModified: new Date(), alternates: { languages: { ko: `${baseUrl}/ko`, en: `${baseUrl}/en` } } },
    { url: `${baseUrl}/en`, lastModified: new Date(), alternates: { languages: { ko: `${baseUrl}/ko`, en: `${baseUrl}/en` } } },
  ]
}
```

- [ ] **Step 4: Add `generateStaticParams` for SSG**

```typescript
export function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}
```

- [ ] **Step 5: Verify — check page source for meta tags, JSON-LD, visit /sitemap.xml**

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add SEO metadata, JSON-LD, sitemap, and hreflang tags"
```

---

## Task 14: 404 Page & Error Handling

**Files:**
- Create: `src/app/not-found.tsx`
- Create: `src/app/(frontend)/[locale]/not-found.tsx`

- [ ] **Step 1: Create 404 page**

Minimal dark-themed 404 page with link back to home. Bilingual support.

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add custom 404 page"
```

---

## Task 15: Deploy Script

**Files:**
- Create: `deploy.sh`

- [ ] **Step 1: Create deploy script**

`deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Building with Vercel CLI (uses local Payload API)..."
npx vercel build --prod

echo "Deploying pre-built output to Vercel..."
npx vercel deploy --prebuilt --prod

echo "Deploy complete!"
```

- [ ] **Step 2: Make executable**

```bash
chmod +x deploy.sh
```

- [ ] **Step 3: Verify — run local build successfully**

```bash
npm run build
```

Expected: Build completes without errors, static pages generated for `/ko` and `/en`.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add deploy script for local build + Vercel deployment"
```

---

## Task 16: Responsive Design & Final Polish

**Files:**
- Modify: All component files as needed

- [ ] **Step 1: Test all sections at mobile breakpoint (375px)**

Verify:
- Navbar collapses to hamburger menu
- Hero text is readable
- Service cards stack to single column
- About section stacks vertically
- Portfolio grid becomes single column
- Gallery adapts to mobile layout
- Contact form and map stack vertically
- Footer is properly laid out

- [ ] **Step 2: Test at tablet breakpoint (768px)**

- [ ] **Step 3: Fix any responsive issues found**

- [ ] **Step 4: Test language switching on all sections**

- [ ] **Step 5: Lighthouse audit — target 90+ on Performance, Accessibility, SEO**

```bash
npx lighthouse http://localhost:3000/ko --output html --output-path ./lighthouse-report.html
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "fix: responsive design polish and accessibility improvements"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | Project Scaffolding | None |
| 2 | Payload Collections & Globals | Task 1 |
| 3 | Seed Data | Task 2 |
| 4 | i18n Setup | Task 1 |
| 5 | Layout (Navbar + Footer) | Tasks 3, 4 |
| 6 | Hero Section | Task 5 |
| 7 | Services Section | Task 5 |
| 8 | About Section | Task 5 |
| 9 | Portfolio Section | Task 5 |
| 10 | Studio Gallery | Task 5 |
| 11 | Contact Form API (TDD) | Task 1 |
| 12 | Contact Section UI | Tasks 5, 11 |
| 13 | SEO | Task 12 |
| 14 | 404 Page | Task 4 |
| 15 | Deploy Script | Task 13 |
| 16 | Responsive & Polish | Task 15 |

Tasks 6–10 can be parallelized. Task 11 can run in parallel with Tasks 5–10.
