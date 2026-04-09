import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'
import { getPageDescription, getPageTimestamp, getLocalizedPageTitle, getPublishedPages } from './_lib'

export const dynamic = 'force-dynamic'

const LIST_TITLES = {
  ko: '페이지',
  en: 'Pages',
} as const

const LIST_DESCRIPTIONS = {
  ko: '갈릭톤 스튜디오에서 발행한 CMS 페이지 목록입니다.',
  en: 'Published CMS pages from Garlicton Studio.',
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = locale === 'en' ? 'en' : 'ko'
  const title = `${LIST_TITLES[safeLocale]} | Garlicton Studio`

  return {
    title,
    description: LIST_DESCRIPTIONS[safeLocale],
    alternates: {
      canonical: `${SITE_URL}/${safeLocale}/pages`,
      languages: {
        ko: `${SITE_URL}/ko/pages`,
        en: `${SITE_URL}/en/pages`,
        'x-default': `${SITE_URL}/ko/pages`,
      },
    },
    openGraph: {
      title,
      description: LIST_DESCRIPTIONS[safeLocale],
      type: 'website',
      url: `${SITE_URL}/${safeLocale}/pages`,
    },
  }
}

export default async function PublishedPagesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const safeLocale = locale === 'en' ? 'en' : 'ko'
  const pages = await getPublishedPages()
  const dateFormatter = new Intl.DateTimeFormat(safeLocale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'long' })

  return (
    <section className="px-6 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 space-y-4">
          <p
            className="text-[11px] uppercase tracking-[0.3em] text-[#CCCCCC]"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            CMS
          </p>
          <h1
            className="text-[clamp(2.3rem,5vw,4.4rem)] font-semibold tracking-tight text-[#F0F0F0]"
            style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {LIST_TITLES[safeLocale]}
          </h1>
          <p
            className="max-w-2xl text-[clamp(1rem,1.5vw,1.08rem)] leading-[1.9] text-[#CFCFCF]"
            style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {LIST_DESCRIPTIONS[safeLocale]}
          </p>
        </div>

        {pages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-10 text-[#CCCCCC]">
            {safeLocale === 'ko' ? '게시된 페이지가 아직 없습니다.' : 'No published pages yet.'}
          </div>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => {
              const title = getLocalizedPageTitle(page, safeLocale)
              const description = getPageDescription(page, safeLocale)
              const timestamp = getPageTimestamp(page)

              return (
                <article
                  key={page.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-white/20"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-[#9E9E9E]">
                    <span>Published</span>
                    {timestamp ? <time dateTime={timestamp}>{dateFormatter.format(new Date(timestamp))}</time> : null}
                  </div>
                  <h2
                    className="text-[clamp(1.4rem,2.8vw,2rem)] font-semibold text-[#F0F0F0]"
                    style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                  >
                    <Link href={`/${safeLocale}/pages/${page.slug}`} className="hover:text-white transition-colors">
                      {title}
                    </Link>
                  </h2>
                  {description ? (
                    <p
                      className="mt-4 text-[clamp(0.98rem,1.4vw,1.05rem)] leading-[1.85] text-[#D0D0D0]"
                      style={{ fontFamily: safeLocale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                    >
                      {description}
                    </p>
                  ) : null}
                  <div className="mt-6">
                    <Link
                      href={`/${safeLocale}/pages/${page.slug}`}
                      className="text-[12px] uppercase tracking-[0.24em] text-[#F0F0F0] underline underline-offset-4"
                    >
                      {safeLocale === 'ko' ? '페이지 보기' : 'View page'}
                    </Link>
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
