import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { SITE_URL } from '@/lib/site'

type PublishedPage = {
  slug: string
  updatedAt?: string
  createdAt?: string
  updated_at?: string
  created_at?: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/ko`,
      lastModified: new Date(),
      alternates: { languages: { ko: `${SITE_URL}/ko`, en: `${SITE_URL}/en` } },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      alternates: { languages: { ko: `${SITE_URL}/ko`, en: `${SITE_URL}/en` } },
    },
    {
      url: `${SITE_URL}/ko/pages`,
      lastModified: new Date(),
      alternates: { languages: { ko: `${SITE_URL}/ko/pages`, en: `${SITE_URL}/en/pages` } },
    },
    {
      url: `${SITE_URL}/en/pages`,
      lastModified: new Date(),
      alternates: { languages: { ko: `${SITE_URL}/ko/pages`, en: `${SITE_URL}/en/pages` } },
    },
  ]

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1000,
      where: {
        status: {
          equals: 'published',
        },
      },
    }) as unknown as { docs?: PublishedPage[] }

    for (const page of result.docs ?? []) {
      const lastModified = page.updatedAt ?? page.updated_at ?? page.createdAt ?? page.created_at ?? new Date().toISOString()

      entries.push({
        url: `${SITE_URL}/ko/pages/${page.slug}`,
        lastModified: new Date(lastModified),
        alternates: {
          languages: {
            ko: `${SITE_URL}/ko/pages/${page.slug}`,
            en: `${SITE_URL}/en/pages/${page.slug}`,
          },
        },
      })

      entries.push({
        url: `${SITE_URL}/en/pages/${page.slug}`,
        lastModified: new Date(lastModified),
        alternates: {
          languages: {
            ko: `${SITE_URL}/ko/pages/${page.slug}`,
            en: `${SITE_URL}/en/pages/${page.slug}`,
          },
        },
      })
    }
  } catch {
    return entries
  }

  return entries
}
