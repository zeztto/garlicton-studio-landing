import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
  ]
}
