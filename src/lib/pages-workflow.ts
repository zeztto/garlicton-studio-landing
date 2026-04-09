export type PageWorkflowRecord = {
  slug: string
  featured?: boolean | null
  showInList?: boolean | null
  sortOrder?: number | null
  publishedAt?: string | null
  published_at?: string | null
  updatedAt?: string | null
  updated_at?: string | null
  createdAt?: string | null
  created_at?: string | null
}

export function normalizePageSlug(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/[A-Z]/g, (char) => char.toLowerCase())

  return normalized || undefined
}

export function getPageWorkflowTimestamp(page: PageWorkflowRecord): string | undefined {
  return (
    page.publishedAt
    || page.published_at
    || page.updatedAt
    || page.updated_at
    || page.createdAt
    || page.created_at
    || undefined
  )
}

export function shouldIncludePageInList(page: PageWorkflowRecord, includeHidden = false): boolean {
  if (includeHidden) {
    return true
  }

  return page.showInList !== false
}

export function comparePublishedPages(a: PageWorkflowRecord, b: PageWorkflowRecord): number {
  const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  if (featuredDelta !== 0) {
    return featuredDelta
  }

  const sortOrderA = typeof a.sortOrder === 'number' ? a.sortOrder : 0
  const sortOrderB = typeof b.sortOrder === 'number' ? b.sortOrder : 0
  if (sortOrderA !== sortOrderB) {
    return sortOrderA - sortOrderB
  }

  const timestampA = new Date(getPageWorkflowTimestamp(a) ?? 0).getTime()
  const timestampB = new Date(getPageWorkflowTimestamp(b) ?? 0).getTime()
  if (timestampA !== timestampB) {
    return timestampB - timestampA
  }

  return a.slug.localeCompare(b.slug)
}
