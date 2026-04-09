import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'
import {
  getPageHeroImage,
  getPageSummary,
  getPageTimestamp,
  getLocalizedPageTitle,
  getPagesIndexContent,
  getPagesIndexMetadata,
  getPagesSiteSettings,
  getPublishedPages,
  type Locale,
} from './_lib'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const safeLocale: Locale = locale === 'en' ? 'en' : 'ko'
  const settings = await getPagesSiteSettings()
  const metadata = getPagesIndexMetadata(settings, safeLocale)

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: `${SITE_URL}/${safeLocale}/pages`,
      languages: {
        ko: `${SITE_URL}/ko/pages`,
        en: `${SITE_URL}/en/pages`,
        'x-default': `${SITE_URL}/ko/pages`,
      },
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'website',
      url: `${SITE_URL}/${safeLocale}/pages`,
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
    },
  }
}

export default async function PublishedPagesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const safeLocale: Locale = locale === 'en' ? 'en' : 'ko'
  const [pages, settings] = await Promise.all([
    getPublishedPages(),
    getPagesSiteSettings(),
  ])
  const copy = getPagesIndexContent(settings, safeLocale)
  const dateFormatter = new Intl.DateTimeFormat(safeLocale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'long' })

  return (
    <section className="px-6 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-4">
            <p
              className="text-[11px] uppercase tracking-[0.3em] text-[#CCCCCC]"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {copy.eyebrow}
            </p>
            <h1
              className="text-[clamp(2.3rem,5vw,4.4rem)] font-semibold tracking-tight text-[#F0F0F0]"
              style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {copy.title}
            </h1>
            <p
              className="text-[clamp(1rem,1.5vw,1.08rem)] leading-[1.9] text-[#CFCFCF]"
              style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {copy.description}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-right">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8F8F8F]">
              {safeLocale === 'ko' ? 'Published Pages' : 'Published Pages'}
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#F0F0F0]">{pages.length}</p>
          </div>
        </div>

        {pages.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] px-6 py-12 text-[#CCCCCC]">
            {copy.emptyState}
          </div>
        ) : (
          <div className="space-y-5">
            {pages.map((page) => {
              const title = getLocalizedPageTitle(page, safeLocale, copy.untitledFallback)
              const summary = getPageSummary(page, safeLocale)
              const timestamp = getPageTimestamp(page)
              const heroImage = getPageHeroImage(page)

              return (
                <article
                  key={page.id}
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20"
                >
                  <div className={heroImage ? 'grid gap-0 md:grid-cols-[minmax(0,1.2fr)_320px]' : ''}>
                    <div className="p-6 md:p-8">
                      <div className="mb-4 flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-[#9E9E9E]">
                        <span>{copy.publishedLabel}</span>
                        {timestamp ? <time dateTime={timestamp}>{dateFormatter.format(new Date(timestamp))}</time> : null}
                      </div>
                      <h2
                        className="text-[clamp(1.5rem,2.8vw,2.1rem)] font-semibold text-[#F0F0F0]"
                        style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                      >
                        <Link href={`/${safeLocale}/pages/${page.slug}`} className="transition-colors hover:text-white">
                          {title}
                        </Link>
                      </h2>
                      {summary ? (
                        <p
                          className="mt-4 max-w-3xl text-[clamp(0.98rem,1.4vw,1.06rem)] leading-[1.85] text-[#D0D0D0]"
                          style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                        >
                          {summary}
                        </p>
                      ) : null}
                      <div className="mt-8">
                        <Link
                          href={`/${safeLocale}/pages/${page.slug}`}
                          className="text-[12px] uppercase tracking-[0.24em] text-[#F0F0F0] underline underline-offset-4"
                        >
                          {copy.viewPageLabel}
                        </Link>
                      </div>
                    </div>

                    {heroImage ? (
                      <div className="relative min-h-56 border-t border-white/10 md:min-h-full md:border-l md:border-t-0">
                        <Image
                          src={heroImage.url}
                          alt={heroImage.alt || title}
                          fill
                          sizes="(max-width: 767px) 100vw, 320px"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      </div>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
