export function getSafeHref(
  href?: null | string,
  fallback = '#',
): string {
  if (typeof href !== 'string') {
    return fallback
  }

  const trimmed = href.trim()

  if (!trimmed) {
    return fallback
  }

  if (trimmed.startsWith('#')) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return trimmed.startsWith('//') ? fallback : trimmed
  }

  try {
    const url = new URL(trimmed)

    if (
      url.protocol === 'http:'
      || url.protocol === 'https:'
      || url.protocol === 'mailto:'
      || url.protocol === 'tel:'
    ) {
      return trimmed
    }
  } catch {
    return fallback
  }

  return fallback
}
