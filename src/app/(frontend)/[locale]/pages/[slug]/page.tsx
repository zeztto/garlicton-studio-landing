import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SITE_URL } from '@/lib/site'
import {
  getLocalizedPageTitle,
  getPageDescription,
  getPageTimestamp,
  getPublishedPageBySlug,
  renderRichText,
} from '../_lib'

export const dynamic = 'force-dynamic'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params
  const safeLocale = locale === 'en' ? 'en' : 'ko'
  const page = await getPublishedPageBySlug(slug)

  if (!page) {
    return {
      title: safeLocale === 'ko' ? '페이지를 찾을 수 없습니다 | Garlicton Studio' : 'Page not found | Garlicton Studio',
      alternates: {
        canonical: `${SITE_URL}/${safeLocale}/pages/${slug}`,
      },
    }
  }

  const title = `${getLocalizedPageTitle(page, safeLocale)} | Garlicton Studio`
  const description = getPageDescription(page, safeLocale)

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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function PublishedPageDetail(
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  const safeLocale = locale === 'en' ? 'en' : 'ko'
  const page = await getPublishedPageBySlug(slug)

  if (!page) {
    notFound()
  }

  const title = getLocalizedPageTitle(page, safeLocale)
  const description = getPageDescription(page, safeLocale)
  const timestamp = getPageTimestamp(page)
  const dateFormatter = new Intl.DateTimeFormat(safeLocale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'long' })

  return (
    <article className="px-6 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/${safeLocale}/pages`}
          className="inline-flex text-[12px] uppercase tracking-[0.24em] text-[#B8B8B8] underline underline-offset-4"
        >
          {safeLocale === 'ko' ? '페이지 목록으로' : 'Back to pages'}
        </Link>

        <header className="mt-8 border-b border-white/10 pb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-[#9E9E9E]">
            <span>Published</span>
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

        <div className="mt-10 space-y-6">
          {renderRichText(page.body_ko && safeLocale === 'ko' ? page.body_ko : page.body_en ?? page.body_ko, safeLocale)}
        </div>
      </div>
    </article>
  )
}
