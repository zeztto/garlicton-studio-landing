import { DEFAULT_HOME_SECTION_ORDER, type HomeSectionKey } from './site-settings'

type RecordLike = Record<string, unknown>

const HOME_SECTION_SET = new Set<HomeSectionKey>(DEFAULT_HOME_SECTION_ORDER)

export function normalizeTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

export function normalizeSectionOrder(
  rows: Array<{ section?: null | string } | null> | null | undefined,
): Array<{ section: HomeSectionKey }> {
  const ordered: HomeSectionKey[] = []

  for (const row of rows ?? []) {
    const candidate = row?.section

    if (!candidate || !HOME_SECTION_SET.has(candidate as HomeSectionKey)) {
      continue
    }

    const section = candidate as HomeSectionKey

    if (!ordered.includes(section)) {
      ordered.push(section)
    }
  }

  for (const section of DEFAULT_HOME_SECTION_ORDER) {
    if (!ordered.includes(section)) {
      ordered.push(section)
    }
  }

  return ordered.map((section) => ({ section }))
}

export function normalizeOptionalHref(
  value: unknown,
  fallback: string,
): string {
  const trimmed = normalizeTrimmedString(value)

  if (!trimmed) {
    return fallback
  }

  if (trimmed.startsWith('#') || /^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export function normalizeExternalUrl(value: unknown): string | undefined {
  const trimmed = normalizeTrimmedString(value)

  if (!trimmed) {
    return undefined
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed.replace(/^\/+/, '')}`
}

export function normalizeEmailDisplay(
  displayValue: unknown,
  emailValue: unknown,
): string | undefined {
  return normalizeTrimmedString(displayValue) ?? normalizeTrimmedString(emailValue)
}

export function clampNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  return Math.min(max, Math.max(min, value))
}

export function pruneEmptyRows<T extends RecordLike>(
  rows: T[] | null | undefined,
  keys: Array<keyof T>,
): T[] {
  return (rows ?? []).filter((row) => {
    return keys.some((key) => {
      const value = row[key]

      if (typeof value === 'string') {
        return value.trim().length > 0
      }

      return value != null
    })
  })
}
