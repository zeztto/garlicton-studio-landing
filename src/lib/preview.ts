import { timingSafeEqual } from 'node:crypto'
import { normalizePageSlug } from './pages-workflow.ts'
import { getPreviewSecret, getSiteUrl } from './runtime-config.ts'

const DEFAULT_PAGE_PREVIEW_LOCALE = 'ko'
const PAGE_PREVIEW_ROUTE = '/api/preview'

export type PagePreviewLocale = 'ko' | 'en'

export const normalizePreviewLocale = (locale?: null | string): PagePreviewLocale => {
  return locale === 'en' ? 'en' : DEFAULT_PAGE_PREVIEW_LOCALE
}

export const isValidPreviewSecret = (candidate?: null | string): boolean => {
  const secret = getPreviewSecret()

  if (!secret || !candidate) {
    return false
  }

  const candidateBuffer = Buffer.from(candidate, 'utf8')
  const secretBuffer = Buffer.from(secret, 'utf8')

  if (candidateBuffer.length !== secretBuffer.length) {
    return false
  }

  return timingSafeEqual(candidateBuffer, secretBuffer)
}

export const getPreviewAccessError = (
  candidate?: null | string,
): null | { error: string; status: number } => {
  if (!getPreviewSecret()) {
    return {
      error: 'Preview secret is not configured.',
      status: 503,
    }
  }

  if (!isValidPreviewSecret(candidate)) {
    return {
      error: 'Invalid preview secret.',
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
  const secret = getPreviewSecret()

  if (!secret) {
    return null
  }

  const previewURL = new URL(PAGE_PREVIEW_ROUTE, getSiteUrl())

  previewURL.searchParams.set('collection', 'pages')
  previewURL.searchParams.set('locale', normalizePreviewLocale(locale))
  previewURL.searchParams.set('path', buildPagePath({ locale, slug }))
  previewURL.searchParams.set('secret', secret)
  previewURL.searchParams.set('slug', slug)

  return previewURL.toString()
}
