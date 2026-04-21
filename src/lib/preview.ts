import { createHmac, timingSafeEqual } from 'node:crypto'
import { normalizePageSlug } from './pages-workflow.ts'
import { DEFAULT_HOME_SECTION_ORDER, type HomeSectionKey } from './site-settings.ts'
import { getPreviewSecret, getSiteUrl } from './runtime-config.ts'

const DEFAULT_PAGE_PREVIEW_LOCALE = 'ko'
const PAGE_PREVIEW_ROUTE = '/api/preview'
const HOME_SECTION_SET = new Set<HomeSectionKey>(DEFAULT_HOME_SECTION_ORDER)
const PREVIEW_TOKEN_TTL_MS = 10 * 60 * 1000

export type PagePreviewLocale = 'ko' | 'en'

export const normalizePreviewLocale = (locale?: null | string): PagePreviewLocale => {
  return locale === 'en' ? 'en' : DEFAULT_PAGE_PREVIEW_LOCALE
}

function buildPreviewTokenPayload({
  anchor,
  expiresAt,
  locale,
  path,
  slug,
}: {
  anchor?: null | string
  expiresAt: string
  locale?: null | string
  path?: null | string
  slug?: null | string
}): string {
  return JSON.stringify({
    anchor: normalizeHomePreviewAnchor(anchor),
    expiresAt,
    locale: normalizePreviewLocale(locale),
    path: path && /^\/(?!\/)/.test(path) ? path : '',
    slug: typeof slug === 'string' ? normalizePageSlug(slug) ?? '' : '',
  })
}

function signPreviewPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function getPreviewToken({
  anchor,
  locale,
  path,
  slug,
}: {
  anchor?: null | string
  locale?: null | string
  path?: null | string
  slug?: null | string
}): null | { expiresAt: string; token: string } {
  const secret = getPreviewSecret()

  if (!secret) {
    return null
  }

  const expiresAt = new Date(Date.now() + PREVIEW_TOKEN_TTL_MS).toISOString()
  const payload = buildPreviewTokenPayload({
    anchor,
    expiresAt,
    locale,
    path,
    slug,
  })

  return {
    expiresAt,
    token: signPreviewPayload(payload, secret),
  }
}

export const getPreviewAccessError = (
  {
    anchor,
    expiresAt,
    locale,
    path,
    slug,
    token,
  }: {
    anchor?: null | string
    expiresAt?: null | string
    locale?: null | string
    path?: null | string
    slug?: null | string
    token?: null | string
  },
): null | { error: string; status: number } => {
  const secret = getPreviewSecret()

  if (!secret) {
    return {
      error: 'Preview secret is not configured.',
      status: 503,
    }
  }

  if (!token || !expiresAt) {
    return {
      error: 'Invalid preview token.',
      status: 401,
    }
  }

  const expiresDate = new Date(expiresAt)
  if (Number.isNaN(expiresDate.getTime()) || expiresDate.getTime() <= Date.now()) {
    return {
      error: 'Preview token has expired.',
      status: 401,
    }
  }

  const expectedToken = signPreviewPayload(
    buildPreviewTokenPayload({
      anchor,
      expiresAt,
      locale,
      path,
      slug,
    }),
    secret,
  )

  const candidateBuffer = Buffer.from(token, 'utf8')
  const expectedBuffer = Buffer.from(expectedToken, 'utf8')

  if (
    candidateBuffer.length !== expectedBuffer.length
    || !timingSafeEqual(candidateBuffer, expectedBuffer)
  ) {
    return {
      error: 'Invalid preview token.',
      status: 401,
    }
  }

  return null
}

export const buildPagePath = ({
  locale,
  slug,
}: {
  locale?: null | string
  slug: string
}): string => {
  const safeLocale = normalizePreviewLocale(locale)
  const safeSlug = normalizePageSlug(slug) || slug.replace(/^\/+|\/+$/g, '')

  return `/${safeLocale}/pages/${safeSlug}`
}

export const normalizeHomePreviewAnchor = (
  anchor?: null | string,
): HomeSectionKey | null => {
  if (!anchor) {
    return null
  }

  const normalized = anchor.replace(/^#/, '').trim()

  if (!normalized || !HOME_SECTION_SET.has(normalized as HomeSectionKey)) {
    return null
  }

  return normalized as HomeSectionKey
}

export const buildHomePath = ({
  anchor,
  locale,
}: {
  anchor?: null | string
  locale?: null | string
}): string => {
  const safeLocale = normalizePreviewLocale(locale)
  const safeAnchor = normalizeHomePreviewAnchor(anchor)

  if (!safeAnchor) {
    return `/${safeLocale}`
  }

  return `/${safeLocale}#${safeAnchor}`
}

export const resolvePreviewRedirectPath = ({
  locale,
  path,
  slug,
}: {
  locale?: null | string
  path?: null | string
  slug?: null | string
}): string => {
  if (path && /^\/(?!\/)/.test(path)) {
    return path
  }

  const normalizedSlug = typeof slug === 'string' ? normalizePageSlug(slug) : undefined

  if (normalizedSlug) {
    return buildPagePath({ locale, slug: normalizedSlug })
  }

  return `/${normalizePreviewLocale(locale)}/pages`
}

export const buildPagePreviewURL = ({
  locale,
  slug,
}: {
  locale?: null | string
  slug: string
}): null | string => {
  const path = buildPagePath({ locale, slug })
  const previewToken = getPreviewToken({
    locale,
    path,
    slug,
  })

  if (!previewToken) {
    return null
  }

  const previewURL = new URL(PAGE_PREVIEW_ROUTE, getSiteUrl())

  previewURL.searchParams.set('collection', 'pages')
  previewURL.searchParams.set('locale', normalizePreviewLocale(locale))
  previewURL.searchParams.set('path', path)
  previewURL.searchParams.set('expires', previewToken.expiresAt)
  previewURL.searchParams.set('slug', slug)
  previewURL.searchParams.set('token', previewToken.token)

  return previewURL.toString()
}

export const buildHomePreviewURL = ({
  anchor,
  locale,
}: {
  anchor?: null | string
  locale?: null | string
} = {}): null | string => {
  const path = buildHomePath({ anchor, locale })
  const previewToken = getPreviewToken({
    anchor,
    locale,
    path,
  })

  if (!previewToken) {
    return null
  }

  const previewURL = new URL(PAGE_PREVIEW_ROUTE, getSiteUrl())

  previewURL.searchParams.set('locale', normalizePreviewLocale(locale))
  previewURL.searchParams.set('expires', previewToken.expiresAt)
  previewURL.searchParams.set('path', path)
  previewURL.searchParams.set('token', previewToken.token)

  const safeAnchor = normalizeHomePreviewAnchor(anchor)

  if (safeAnchor) {
    previewURL.searchParams.set('anchor', safeAnchor)
  }

  return previewURL.toString()
}
