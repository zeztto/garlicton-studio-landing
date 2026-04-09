import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE_URL } from '@/lib/site'
import {
  getPageDescription,
  getPageHeroImage,
  getPageSeoDescription,
  getPageSeoTitle,
  getPageTimestamp,
  getPagesIndexContent,
  getPagesSiteSettings,
  getPublishedPageBySlug,
  getLocalizedPageTitle,
  renderRichText,
  type Locale,
} from '../_lib'

export const dynamic = 'force-dynamic'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params
  const safeLocale: Locale = locale === 'en' ? 'en' : 'ko'
  const page = await getPublishedPageBySlug(slug)

  if (!page) {
    return {
      title: safeLocale === 'ko' ? '페이지를 찾을 수 없습니다 | Garlicton Studio' : 'Page not found | Garlicton Studio',
      alternates: {
        canonical: `${SITE_URL}/${safeLocale}/pages/${slug}`,
      },
    }
  }

  const title = `${getPageSeoTitle(page, safeLocale)} | Garlicton Studio`
  const description = getPageSeoDescription(page, safeLocale)
  const heroImage = getPageHeroImage(page)

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${safeLocale}/pages/${page.slug}`,
      languages: {
        ko: `${SITE_URL}/ko/pages/${page.slug}`,
        en: `${SITE_URL}/en/pages/${page.slug}`,
        'x-default': `${SITE_URL}/ko/pages/${page.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/${safeLocale}/pages/${page.slug}`,
      ...(heroImage ? { images: [{ url: heroImage.url, alt: heroImage.alt || getLocalizedPageTitle(page, safeLocale) }] } : {}),
    },
    twitter: {
      card: heroImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(heroImage ? { images: [heroImage.url] } : {}),
    },
  }
}

export default async function PublishedPageDetail(
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  const safeLocale: Locale = locale === 'en' ? 'en' : 'ko'
  const [page, settings] = await Promise.all([
    getPublishedPageBySlug(slug),
    getPagesSiteSettings(),
  ])

  if (!page) {
    notFound()
  }

  const copy = getPagesIndexContent(settings, safeLocale)
  const title = getLocalizedPageTitle(page, safeLocale, copy.untitledFallback)
  const description = getPageDescription(page, safeLocale)
  const timestamp = getPageTimestamp(page)
  const heroImage = getPageHeroImage(page)
  const dateFormatter = new Intl.DateTimeFormat(safeLocale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'long' })

  return (
    <article className="px-6 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/${safeLocale}/pages`}
          className="inline-flex text-[12px] uppercase tracking-[0.24em] text-[#B8B8B8] underline underline-offset-4"
        >
          {copy.backToListLabel}
        </Link>

        <header className="mt-8 border-b border-white/10 pb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-[#9E9E9E]">
            <span>{copy.publishedLabel}</span>
            {timestamp ? <time dateTime={timestamp}>{dateFormatter.format(new Date(timestamp))}</time> : null}
          </div>
          <h1
            className="text-[clamp(2.3rem,5vw,4.6rem)] font-semibold leading-[1.05] tracking-tight text-[#F0F0F0]"
            style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {title}
          </h1>
          {description ? (
            <p
              className="mt-6 max-w-3xl text-[clamp(1rem,1.5vw,1.1rem)] leading-[1.9] text-[#CFCFCF]"
              style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {description}
            </p>
          ) : null}
        </header>

        {heroImage ? (
          <div className="relative mt-10 overflow-hidden rounded-[28px] border border-white/10">
            <Image
              src={heroImage.url}
              alt={heroImage.alt || title}
              width={heroImage.width ?? 1600}
              height={heroImage.height ?? 900}
              sizes="(max-width: 768px) 100vw, 1280px"
              className="h-[280px] w-full object-cover md:h-[420px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          </div>
        ) : null}

        <div className="mt-10 space-y-6">
          {renderRichText(page.body_ko && safeLocale === 'ko' ? page.body_ko : page.body_en ?? page.body_ko, safeLocale)}
        </div>
      </div>
    </article>
  )
}
