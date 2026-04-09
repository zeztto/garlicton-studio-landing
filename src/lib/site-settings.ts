export type HomeSectionKey = 'hero' | 'services' | 'about' | 'portfolio' | 'studio' | 'contact'
export type NavLinkKind = 'anchor' | 'route'

export interface NavLinkItem {
  href: string
  label: string
  kind: NavLinkKind
}

type LocalizedSource = Record<string, unknown> | null | undefined

export const DEFAULT_HOME_SECTION_ORDER: HomeSectionKey[] = [
  'hero',
  'services',
  'about',
  'portfolio',
  'studio',
  'contact',
]

export function getLocalizedText(
  source: LocalizedSource,
  baseKey: string,
  locale: string,
  fallback: string,
): string {
  const key = `${baseKey}_${locale === 'ko' ? 'ko' : 'en'}`
  const value = source?.[key]

  if (typeof value === 'string' && value.trim()) {
    return value
  }

  return fallback
}

export function getPlainText(
  source: LocalizedSource,
  key: string,
  fallback: string,
): string {
  const value = source?.[key]
  if (typeof value === 'string' && value.trim()) {
    return value
  }

  return fallback
}

export function isAnchorHref(href: string): boolean {
  return href.includes('#')
}

export function createNavLink(href: string, label: string): NavLinkItem {
  return {
    href,
    label,
    kind: isAnchorHref(href) ? 'anchor' : 'route',
  }
}

export function getSectionOrder(
  layout: { sectionOrder?: Array<{ section?: string | null } | null> } | null | undefined,
): HomeSectionKey[] {
  const configured = Array.isArray(layout?.sectionOrder)
    ? layout.sectionOrder
        .map((item) => item?.section)
        .filter((section): section is HomeSectionKey => DEFAULT_HOME_SECTION_ORDER.includes(section as HomeSectionKey))
    : []

  const ordered = [...new Set(configured)]

  return ordered.length > 0 ? ordered : DEFAULT_HOME_SECTION_ORDER
}

export function isSectionVisible(
  section: { visible?: boolean | null } | null | undefined,
  fallback = true,
): boolean {
  if (typeof section?.visible === 'boolean') {
    return section.visible
  }

  return fallback
}

function normalizePath(path: string): string {
  if (!path.startsWith('/')) {
    return `/${path}`
  }

  return path
}

function normalizePagesHref(href: string, locale: string): string {
  const trimmed = href.trim()

  if (!trimmed) {
    return `/${locale}/pages`
  }

  if (trimmed.startsWith('#') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  if (trimmed === 'pages') {
    return `/${locale}/pages`
  }

  const normalized = normalizePath(trimmed)

  if (normalized === '/pages' || normalized.startsWith('/pages/')) {
    return `/${locale}${normalized}`
  }

  return normalized
}

export function getPagesIndexNavLink(
  settings: LocalizedSource,
  locale: string,
): NavLinkItem | null {
  const navigation = settings?.navigation
  const candidate = (
    navigation && typeof navigation === 'object' && 'pagesIndex' in navigation
      ? (navigation as Record<string, unknown>).pagesIndex
      : settings?.pagesIndex
  )

  if (candidate == null || candidate === false) {
    return null
  }

  const fallbackLabel = locale === 'ko' ? '페이지' : 'Pages'

  if (candidate === true) {
    return createNavLink(`/${locale}/pages`, fallbackLabel)
  }

  if (typeof candidate === 'string') {
    return createNavLink(normalizePagesHref(candidate, locale), fallbackLabel)
  }

  if (typeof candidate !== 'object') {
    return null
  }

  const config = candidate as Record<string, unknown>

  if (config.visible === false || config.enabled === false) {
    return null
  }

  const href = normalizePagesHref(
    getPlainText(config, 'href', getPlainText(config, 'path', `/${locale}/pages`)),
    locale,
  )
  const label = getLocalizedText(config, 'label', locale, fallbackLabel)

  return createNavLink(href, label)
}
