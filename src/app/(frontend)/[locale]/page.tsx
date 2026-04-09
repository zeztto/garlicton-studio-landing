import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'
import { About } from '@/components/sections/About'
import { Portfolio } from '@/components/sections/Portfolio'
import { StudioGallery } from '@/components/sections/StudioGallery'
import { Contact } from '@/components/sections/Contact'
import { getPayloadClient } from '@/lib/payload'
import { SITE_URL } from '@/lib/site'

const PAGE_TITLE = '갈릭톤 스튜디오 | 최고의 테이크가 최고의 결과를 만든다'
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })

  const title = PAGE_TITLE
  const description = locale === 'ko' ? settings.seo?.metaDescription_ko : settings.seo?.metaDescription_en
  const ogImage = settings.seo?.ogImage as { url?: string } | null

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        ko: `${SITE_URL}/ko`,
        en: `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/ko`,
      },
    },
    openGraph: {
      title: title || '',
      description: description || '',
      type: 'website',
      ...(ogImage?.url ? { images: [{ url: ogImage.url }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: title || '',
      description: description || '',
      ...(ogImage?.url ? { images: [ogImage.url] } : {}),
    },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RecordingStudio',
  name: 'Garlicton Studio',
  url: SITE_URL,
  description: 'Metal music recording, mixing, mastering, and producing studio',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '북문길67번길 8-1',
    addressLocality: '강화읍, 강화군',
    addressRegion: '인천',
    addressCountry: 'KR',
  },
  telephone: '0507-1313-6843',
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero locale={locale} />
      <Services locale={locale} />
      <About locale={locale} />
      <Portfolio locale={locale} />
      <StudioGallery locale={locale} />
      <Contact locale={locale} />
    </>
  )
}
