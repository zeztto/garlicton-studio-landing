import { cache, type JSX, type ReactNode } from 'react'
import { draftMode } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import {
  comparePublishedPages,
  getPageWorkflowTimestamp,
  shouldIncludePageInList,
} from '@/lib/pages-workflow'
import { getLocalizedText } from '@/lib/site-settings'
import { getSafeHref } from '@/lib/url-safety'

export type Locale = 'ko' | 'en'

type UnknownRecord = Record<string, unknown>

export type CmsPage = {
  id: number | string
  slug: string
  featured?: boolean | null
  showInList?: boolean | null
  sortOrder?: number | null
  title_ko?: string | null
  title_en?: string | null
  summary_ko?: string | null
  summary_en?: string | null
  excerpt_ko?: string | null
  excerpt_en?: string | null
  description_ko?: string | null
  description_en?: string | null
  seoTitle_ko?: string | null
  seoTitle_en?: string | null
  metaTitle_ko?: string | null
  metaTitle_en?: string | null
  seoDescription_ko?: string | null
  seoDescription_en?: string | null
  metaDescription_ko?: string | null
  metaDescription_en?: string | null
  body_ko?: unknown
  body_en?: unknown
  status?: string | null
  publishedAt?: string | null
  published_at?: string | null
  updatedAt?: string | null
  createdAt?: string | null
  updated_at?: string | null
  created_at?: string | null
  heroImage?: unknown
  featuredImage?: unknown
  coverImage?: unknown
  image?: unknown
}

export type MediaAsset = {
  url: string
  alt: string
  width?: number
  height?: number
}

export type PagesIndexContent = {
  eyebrow: string
  title: string
  description: string
  emptyState: string
  viewPageLabel: string
  backToListLabel: string
  publishedLabel: string
  untitledFallback: string
}

type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  format?: number | string | null
  url?: string
  fields?: { url?: string }
  children?: LexicalNode[]
  listType?: 'bullet' | 'number' | 'check'
}

type RichTextDocument = {
  root?: {
    children?: LexicalNode[]
  }
}

const TEXT_FORMAT = {
  bold: 1,
  italic: 1 << 1,
  strikethrough: 1 << 2,
  underline: 1 << 3,
  code: 1 << 4,
} as const

const DEFAULT_PAGES_INDEX_CONTENT: Record<Locale, PagesIndexContent> = {
  ko: {
    eyebrow: 'CMS',
    title: '페이지',
    description: '갈릭톤 스튜디오에서 발행한 CMS 페이지 목록입니다.',
    emptyState: '게시된 페이지가 아직 없습니다.',
    viewPageLabel: '페이지 보기',
    backToListLabel: '페이지 목록으로',
    publishedLabel: '게시',
    untitledFallback: '제목 없는 페이지',
  },
  en: {
    eyebrow: 'CMS',
    title: 'Pages',
    description: 'Published CMS pages from Garlicton Studio.',
    emptyState: 'No published pages yet.',
    viewPageLabel: 'View page',
    backToListLabel: 'Back to pages',
    publishedLabel: 'Published',
    untitledFallback: 'Untitled page',
  },
}

function normalizeLocale(locale: string): Locale {
  return locale === 'en' ? 'en' : 'ko'
}

function isRichTextDocument(value: unknown): value is RichTextDocument {
  return typeof value === 'object' && value !== null
}

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null ? value as UnknownRecord : null
}

function getStringValue(source: UnknownRecord | null | undefined, keys: string[]): string | null {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return null
}

function getNumberValue(source: UnknownRecord | null | undefined, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return undefined
}

function getLocalizedSetting(
  source: UnknownRecord | null | undefined,
  locale: Locale,
  keys: string[],
  fallback: string,
): string {
  for (const key of keys) {
    const value = getLocalizedText(source, key, locale, '')
    if (value.trim()) {
      return value
    }
  }

  return fallback
}

function getDocs(value: unknown): CmsPage[] {
  const result = asRecord(value)
  const docs = result?.docs

  if (!Array.isArray(docs)) {
    return []
  }

  return docs
    .map((doc) => coercePage(doc))
    .filter((page): page is CmsPage => page !== null)
}

function coercePage(value: unknown): CmsPage | null {
  const record = asRecord(value)
  const slug = getStringValue(record, ['slug'])
  const id = record?.id

  if (!slug || (typeof id !== 'string' && typeof id !== 'number')) {
    return null
  }

  return {
    id,
    slug,
    featured: typeof record?.featured === 'boolean' ? record.featured : null,
    showInList: typeof record?.showInList === 'boolean' ? record.showInList : null,
    sortOrder: typeof record?.sortOrder === 'number' ? record.sortOrder : null,
    title_ko: getStringValue(record, ['title_ko']),
    title_en: getStringValue(record, ['title_en']),
    summary_ko: getStringValue(record, ['summary_ko']),
    summary_en: getStringValue(record, ['summary_en']),
    excerpt_ko: getStringValue(record, ['excerpt_ko']),
    excerpt_en: getStringValue(record, ['excerpt_en']),
    description_ko: getStringValue(record, ['description_ko']),
    description_en: getStringValue(record, ['description_en']),
    seoTitle_ko: getStringValue(record, ['seoTitle_ko', 'metaTitle_ko']),
    seoTitle_en: getStringValue(record, ['seoTitle_en', 'metaTitle_en']),
    metaTitle_ko: getStringValue(record, ['metaTitle_ko']),
    metaTitle_en: getStringValue(record, ['metaTitle_en']),
    seoDescription_ko: getStringValue(record, ['seoDescription_ko', 'metaDescription_ko']),
    seoDescription_en: getStringValue(record, ['seoDescription_en', 'metaDescription_en']),
    metaDescription_ko: getStringValue(record, ['metaDescription_ko']),
    metaDescription_en: getStringValue(record, ['metaDescription_en']),
    body_ko: record?.body_ko,
    body_en: record?.body_en,
    status: getStringValue(record, ['status']),
    publishedAt: getStringValue(record, ['publishedAt', 'published_at']),
    published_at: getStringValue(record, ['published_at']),
    updatedAt: getStringValue(record, ['updatedAt', 'updated_at']),
    createdAt: getStringValue(record, ['createdAt', 'created_at']),
    updated_at: getStringValue(record, ['updated_at']),
    created_at: getStringValue(record, ['created_at']),
    heroImage: record?.heroImage,
    featuredImage: record?.featuredImage,
    coverImage: record?.coverImage,
    image: record?.image,
  }
}

const getPagesCached = cache(async (includeHidden: boolean, includeDrafts: boolean): Promise<CmsPage[]> => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    limit: 1000,
    sort: '-updatedAt',
    ...(includeDrafts
      ? {}
      : {
          where: {
            status: {
              equals: 'published',
            },
          },
        }),
  })

  const docs = getDocs(result)
    .filter((page) => includeDrafts || page.status === 'published')
    .filter((page) => shouldIncludePageInList(page, includeHidden))
    .sort(comparePublishedPages)

  return docs
})

const getPageBySlugCached = cache(async (slug: string, includeDrafts: boolean): Promise<CmsPage | null> => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    limit: 1,
    where: {
      ...(includeDrafts
        ? {
            slug: {
              equals: slug,
            },
          }
        : {
            and: [
              {
                slug: {
                  equals: slug,
                },
              },
              {
                status: {
                  equals: 'published',
                },
              },
            ],
          }
      ),
    },
  })

  const page = getDocs(result)[0] ?? null

  if (!page) {
    return null
  }

  if (!includeDrafts && page.status !== 'published') {
    return null
  }

  return page
})

const getSiteSettingsCached = cache(async (): Promise<UnknownRecord | null> => {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
    return asRecord(settings)
  } catch {
    return null
  }
})

export async function getPublishedPages(
  options?: { includeHidden?: boolean },
): Promise<CmsPage[]> {
  const { isEnabled } = await draftMode()
  return getPagesCached(options?.includeHidden === true, isEnabled)
}

export async function getPublishedPageBySlug(slug: string): Promise<CmsPage | null> {
  const { isEnabled } = await draftMode()
  return getPageBySlugCached(slug, isEnabled)
}

export async function getPagesSiteSettings(): Promise<UnknownRecord | null> {
  return getSiteSettingsCached()
}

export function getLocalizedPageTitle(page: CmsPage, locale: Locale, fallback?: string): string {
  const defaultFallback = fallback ?? DEFAULT_PAGES_INDEX_CONTENT[locale].untitledFallback

  if (locale === 'en') {
    return page.title_en?.trim() || page.title_ko?.trim() || defaultFallback
  }

  return page.title_ko?.trim() || page.title_en?.trim() || defaultFallback
}

export function getLocalizedPageBody(page: CmsPage, locale: Locale): unknown {
  if (locale === 'en') {
    return page.body_en ?? page.body_ko ?? null
  }

  return page.body_ko ?? page.body_en ?? null
}

export function getLocalizedPageSummary(page: CmsPage, locale: Locale): string {
  if (locale === 'en') {
    return (
      page.summary_en?.trim()
      || page.excerpt_en?.trim()
      || page.description_en?.trim()
      || page.summary_ko?.trim()
      || page.excerpt_ko?.trim()
      || page.description_ko?.trim()
      || ''
    )
  }

  return (
    page.summary_ko?.trim()
    || page.excerpt_ko?.trim()
    || page.description_ko?.trim()
    || page.summary_en?.trim()
    || page.excerpt_en?.trim()
    || page.description_en?.trim()
    || ''
  )
}

export function getPageTimestamp(page: CmsPage): string | undefined {
  return getPageWorkflowTimestamp(page)
}

export function getPageSummary(page: CmsPage, locale: Locale, maxLength = 220): string {
  const summary = getLocalizedPageSummary(page, locale).replace(/\s+/g, ' ').trim()
  if (summary) {
    return summary.length > maxLength ? `${summary.slice(0, maxLength).trimEnd()}...` : summary
  }

  const text = extractPlainText(getLocalizedPageBody(page, locale)).replace(/\s+/g, ' ').trim()
  if (!text) {
    return getLocalizedPageTitle(page, locale)
  }

  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text
}

export function getPageDescription(page: CmsPage, locale: Locale): string {
  return getPageSummary(page, locale, 160)
}

export function getPageSeoTitle(page: CmsPage, locale: Locale): string {
  if (locale === 'en') {
    return page.seoTitle_en?.trim() || page.metaTitle_en?.trim() || getLocalizedPageTitle(page, locale)
  }

  return page.seoTitle_ko?.trim() || page.metaTitle_ko?.trim() || getLocalizedPageTitle(page, locale)
}

export function getPageSeoDescription(page: CmsPage, locale: Locale): string {
  if (locale === 'en') {
    return page.seoDescription_en?.trim() || page.metaDescription_en?.trim() || getPageDescription(page, locale)
  }

  return page.seoDescription_ko?.trim() || page.metaDescription_ko?.trim() || getPageDescription(page, locale)
}

export function getPageHeroImage(page: CmsPage): MediaAsset | null {
  return (
    coerceMediaAsset(page.heroImage)
    || coerceMediaAsset(page.featuredImage)
    || coerceMediaAsset(page.coverImage)
    || coerceMediaAsset(page.image)
    || null
  )
}

function coerceMediaAsset(value: unknown): MediaAsset | null {
  const record = asRecord(value)
  const url = getStringValue(record, ['url'])

  if (!url) {
    return null
  }

  return {
    url,
    alt: getStringValue(record, ['alt', 'altText', 'filename']) ?? '',
    width: getNumberValue(record, ['width']),
    height: getNumberValue(record, ['height']),
  }
}

export function getPagesIndexContent(settings: unknown, locale: string): PagesIndexContent {
  const safeLocale = normalizeLocale(locale)
  const defaults = DEFAULT_PAGES_INDEX_CONTENT[safeLocale]
  const source = asRecord(asRecord(settings)?.pagesIndex)

  return {
    eyebrow: getLocalizedSetting(source, safeLocale, ['eyebrow'], defaults.eyebrow),
    title: getLocalizedSetting(source, safeLocale, ['title'], defaults.title),
    description: getLocalizedSetting(source, safeLocale, ['subtitle', 'description', 'intro'], defaults.description),
    emptyState: getLocalizedSetting(source, safeLocale, ['emptyState'], defaults.emptyState),
    viewPageLabel: getLocalizedSetting(source, safeLocale, ['viewPageLabel', 'readMoreLabel', 'ctaLabel'], defaults.viewPageLabel),
    backToListLabel: getLocalizedSetting(source, safeLocale, ['backToListLabel', 'listLinkLabel'], defaults.backToListLabel),
    publishedLabel: getLocalizedSetting(source, safeLocale, ['publishedLabel', 'dateLabel'], defaults.publishedLabel),
    untitledFallback: getLocalizedSetting(source, safeLocale, ['untitledFallback'], defaults.untitledFallback),
  }
}

export function getPagesIndexMetadata(
  settings: unknown,
  locale: string,
): { title: string; description: string } {
  const safeLocale = normalizeLocale(locale)
  const content = getPagesIndexContent(settings, safeLocale)
  const source = asRecord(asRecord(settings)?.pagesIndex)

  return {
    title: getLocalizedSetting(
      source,
      safeLocale,
      ['metaTitle', 'seoTitle'],
      `${content.title} | Garlicton Studio`,
    ),
    description: getLocalizedSetting(
      source,
      safeLocale,
      ['metaDescription', 'seoDescription', 'subtitle', 'description'],
      content.description,
    ),
  }
}

export function renderRichText(value: unknown, locale: Locale): ReactNode {
  if (!isRichTextDocument(value) || !Array.isArray(value.root?.children)) {
    return null
  }

  return renderNodes(value.root.children, locale, 'root')
}

function renderNodes(nodes: LexicalNode[], locale: Locale, prefix: string): ReactNode[] {
  return nodes
    .map((node, index) => renderNode(node, locale, `${prefix}-${index}`))
    .filter((node): node is ReactNode => node !== null)
}

function renderNode(node: LexicalNode, locale: Locale, key: string): ReactNode | null {
  switch (node.type) {
    case 'heading': {
      const headingTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag ?? '')
        ? node.tag
        : 'h2'
      const Tag = headingTag as keyof JSX.IntrinsicElements

      return (
        <Tag
          key={key}
          className="mt-10 text-[clamp(1.6rem,2.8vw,2.4rem)] font-semibold tracking-tight text-[#F0F0F0]"
          style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
        >
          {renderInlineChildren(node.children, locale, key)}
        </Tag>
      )
    }
    case 'paragraph':
      if (!node.children?.length) {
        return null
      }

      return (
        <p
          key={key}
          className="text-[clamp(0.98rem,1.4vw,1.08rem)] leading-[1.95] text-[#D7D7D7]"
          style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
        >
          {renderInlineChildren(node.children, locale, key)}
        </p>
      )
    case 'quote':
      return (
        <blockquote
          key={key}
          className="border-l border-[#8B0000] pl-6 italic text-[#E6E6E6]"
          style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
        >
          {renderInlineChildren(node.children, locale, key)}
        </blockquote>
      )
    case 'list': {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'

      return (
        <ListTag
          key={key}
          className={node.listType === 'number' ? 'list-decimal pl-6 space-y-3' : 'list-disc pl-6 space-y-3'}
          style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
        >
          {renderNodes(node.children ?? [], locale, key)}
        </ListTag>
      )
    }
    case 'listitem':
      return (
        <li key={key} className="text-[clamp(0.98rem,1.4vw,1.08rem)] leading-[1.9] text-[#D7D7D7]">
          {node.children?.some((child) => isBlockNode(child))
            ? <div className="space-y-3">{renderNodes(node.children ?? [], locale, key)}</div>
            : renderInlineChildren(node.children, locale, key)}
        </li>
      )
    case 'horizontalrule':
      return <hr key={key} className="my-8 border-white/10" />
    case 'linebreak':
      return <br key={key} />
    case 'link':
      {
        const href = getSafeHref(node.fields?.url ?? node.url)
        if (href === '#') {
          return renderInlineChildren(node.children, locale, key)
        }

      return (
        <a
          key={key}
          href={href}
          className="text-[#F0F0F0] underline underline-offset-4 transition-colors hover:text-white"
          target={/^https?:\/\//.test(href) ? '_blank' : undefined}
          rel={/^https?:\/\//.test(href) ? 'noreferrer' : undefined}
        >
          {renderInlineChildren(node.children, locale, key)}
        </a>
      )
      }
    case 'text':
      return renderTextNode(node, key)
    default:
      if (node.children?.length) {
        return (
          <div key={key} className="space-y-6">
            {renderNodes(node.children, locale, key)}
          </div>
        )
      }

      return null
  }
}

function renderInlineChildren(children: LexicalNode[] | undefined, locale: Locale, key: string): ReactNode {
  if (!children?.length) {
    return null
  }

  return children
    .map((child, index) => {
      if (child.type === 'link' || child.type === 'linebreak' || child.type === 'text') {
        return renderNode(child, locale, `${key}-inline-${index}`)
      }

      if (child.children?.length) {
        return (
          <span key={`${key}-inline-${index}`}>
            {renderInlineChildren(child.children, locale, `${key}-inline-${index}`)}
          </span>
        )
      }

      return null
    })
    .filter((node): node is ReactNode => node !== null)
}

function renderTextNode(node: LexicalNode, key: string): ReactNode {
  const text = node.text ?? ''
  if (!text) {
    return null
  }

  const format = typeof node.format === 'number'
    ? node.format
    : typeof node.format === 'string'
      ? Number(node.format)
      : 0

  let content: ReactNode = text

  if (format & TEXT_FORMAT.code) {
    content = <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.95em]">{content}</code>
  }
  if (format & TEXT_FORMAT.bold) {
    content = <strong>{content}</strong>
  }
  if (format & TEXT_FORMAT.italic) {
    content = <em>{content}</em>
  }
  if (format & TEXT_FORMAT.underline) {
    content = <span className="underline underline-offset-4">{content}</span>
  }
  if (format & TEXT_FORMAT.strikethrough) {
    content = <span className="line-through">{content}</span>
  }

  return <span key={key}>{content}</span>
}

function isBlockNode(node: LexicalNode): boolean {
  return ['heading', 'paragraph', 'quote', 'list', 'horizontalrule'].includes(node.type ?? '')
}

function extractPlainText(value: unknown): string {
  if (!isRichTextDocument(value) || !Array.isArray(value.root?.children)) {
    return ''
  }

  return collectText(value.root.children).join(' ')
}

function collectText(nodes: LexicalNode[]): string[] {
  return nodes.flatMap((node) => {
    if (node.type === 'text' && node.text) {
      return [node.text]
    }

    if (node.children?.length) {
      return collectText(node.children)
    }

    return []
  })
}
