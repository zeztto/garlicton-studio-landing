import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'
import { About } from '@/components/sections/About'
import { Portfolio } from '@/components/sections/Portfolio'
import { StudioGallery } from '@/components/sections/StudioGallery'
import { Contact } from '@/components/sections/Contact'
import { getPayloadClient } from '@/lib/payload'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })

  const title = locale === 'ko' ? settings.seo?.metaTitle_ko : settings.seo?.metaTitle_en
  const description = locale === 'ko' ? settings.seo?.metaDescription_ko : settings.seo?.metaDescription_en
  const ogImage = settings.seo?.ogImage as { url?: string } | null

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { ko: '/ko', en: '/en' },
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
  url: 'https://garlicton.com',
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

export function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}
