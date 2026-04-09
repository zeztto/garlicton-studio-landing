export type HomeSectionKey = 'hero' | 'services' | 'about' | 'portfolio' | 'studio' | 'contact'

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
