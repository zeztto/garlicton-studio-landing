import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'
import { MediaEmbed } from '@/components/ui/MediaEmbed'

interface PortfolioProps {
  locale: string
}

interface PortfolioItem {
  id: string | number
  title_ko: string
  title_en: string
  artist: string
  genre?: string | null
  description_ko?: string | null
  description_en?: string | null
  mediaType: 'youtube' | 'soundcloud' | 'spotify'
  embedUrl: string
  sortOrder: number
}

export async function Portfolio({ locale }: PortfolioProps) {
  const t = await getTranslations({ locale, namespace: 'portfolio' })

  let items: PortfolioItem[] = []

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'portfolio',
      sort: 'sortOrder',
      limit: 50,
    })
    items = result.docs as PortfolioItem[]
  } catch {
    // Render empty on failure — avoids crashing the page
  }

  return (
    <section id="portfolio" className="py-28 px-6 md:px-12 lg:px-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="mb-20">
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-[#CCCCCC] mb-4"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Portfolio
          </p>
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] font-semibold uppercase tracking-[0.08em] text-[#F0F0F0] leading-tight"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {t('title')}
          </h2>
          <p
            className="mt-6 text-[#CCCCCC] font-light leading-[1.9] text-[clamp(0.875rem,1.4vw,1rem)] italic max-w-2xl"
            style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {t('subtitle')}
          </p>
        </div>

        {/* Portfolio grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {items.map((item) => {
              const title = locale === 'ko' ? item.title_ko : item.title_en
              const description = locale === 'ko' ? item.description_ko : item.description_en

              return (
                <div key={item.id} className="flex flex-col gap-4 group">
                  {/* Embed */}
                  <div className="overflow-hidden">
                    <MediaEmbed
                      mediaType={item.mediaType}
                      embedUrl={item.embedUrl}
                      title={`${item.artist} — ${title}`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1.5 px-0.5">
                    {/* Artist name */}
                    <p
                      className="text-[#F0F0F0] font-bold text-[clamp(0.9rem,1.3vw,1rem)] tracking-wide leading-snug"
                      style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                    >
                      {item.artist}
                    </p>

                    {/* Track title */}
                    <p
                      className="text-[#FFFFFFDD] font-light text-[clamp(0.8rem,1.2vw,0.9rem)] leading-snug"
                      style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                    >
                      {title}
                    </p>

                    {/* Award info (description) */}
                    {description && (
                      <p
                        className="text-[#CCCCCC] text-[11px] leading-[1.7] mt-0.5"
                        style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                      >
                        {description}
                      </p>
                    )}

                    {/* Genre tag */}
                    {item.genre && (
                      <span
                        className="inline-block self-start mt-1 px-2 py-0.5 border border-white/10 text-[10px] tracking-[0.15em] uppercase text-[#CCCCCC]"
                        style={{ fontFamily: 'var(--font-inter)' }}
                      >
                        {item.genre}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p
            className="text-[#999999] text-sm tracking-wider"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            No portfolio items yet.
          </p>
        )}
      </div>
    </section>
  )
}
