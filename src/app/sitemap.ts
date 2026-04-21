import type { MetadataRoute } from 'next'
import { getPageTimestamp, getPublishedPages } from '@/app/(frontend)/[locale]/pages/_lib'
import { SITE_URL } from '@/lib/site'

function getLatestTimestamp(timestamps: Array<string | undefined>): undefined | string {
  let latest: undefined | string
  let latestTime = Number.NEGATIVE_INFINITY

  for (const timestamp of timestamps) {
    if (!timestamp) {
      continue
    }

    const time = new Date(timestamp).getTime()

    if (Number.isNaN(time) || time <= latestTime) {
      continue
    }

    latest = timestamp
    latestTime = time
  }

  return latest
}

function createLocalizedEntry(pathname: string, lastModified: Date): MetadataRoute.Sitemap[number][] {
  return [
    {
      url: `${SITE_URL}/ko${pathname}`,
      lastModified,
      alternates: {
        languages: {
          ko: `${SITE_URL}/ko${pathname}`,
          en: `${SITE_URL}/en${pathname}`,
        },
      },
    },
    {
      url: `${SITE_URL}/en${pathname}`,
      lastModified,
      alternates: {
        languages: {
          ko: `${SITE_URL}/ko${pathname}`,
          en: `${SITE_URL}/en${pathname}`,
        },
      },
    },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    ...createLocalizedEntry('', now),
    ...createLocalizedEntry('/pages', now),
  ]

  try {
    const pages = await getPublishedPages()
    const latestTimestamp = getLatestTimestamp(
      pages.map((page) => getPageTimestamp(page)),
    )

    if (latestTimestamp) {
      const lastModified = new Date(latestTimestamp)
      entries[2].lastModified = lastModified
      entries[3].lastModified = lastModified
    }

    for (const page of pages) {
      const lastModified = new Date(getPageTimestamp(page) ?? now.toISOString())
      entries.push(...createLocalizedEntry(`/pages/${page.slug}`, lastModified))
    }
  } catch {
    return entries
  }

  return entries
}
