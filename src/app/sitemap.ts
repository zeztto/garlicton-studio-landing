import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://garlicton.com'
  return [
    {
      url: `${baseUrl}/ko`,
      lastModified: new Date(),
      alternates: { languages: { ko: `${baseUrl}/ko`, en: `${baseUrl}/en` } },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      alternates: { languages: { ko: `${baseUrl}/ko`, en: `${baseUrl}/en` } },
    },
  ]
}
