import { getPayloadClient } from '@/lib/payload'
import { getLocalizedText } from '@/lib/site-settings'

interface ServicesProps {
  locale: string
  content?: Record<string, unknown> | null
}

interface ServiceItem {
  id: string | number
  title_ko: string
  title_en: string
  description_ko: string
  description_en: string
  sortOrder: number
}

export async function Services({ locale, content }: ServicesProps) {
  let services: ServiceItem[] = []

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'services',
      sort: 'sortOrder',
      limit: 20,
    })
    services = result.docs as ServiceItem[]
  } catch {
    // If fetch fails, render empty — avoids crashing the page
  }

  const eyebrow = getLocalizedText(content, 'eyebrow', locale, 'Services')
  const title = getLocalizedText(content, 'title', locale, locale === 'ko' ? '작업 프로세스' : 'Our Process')
  const subtitle = getLocalizedText(
    content,
    'subtitle',
    locale,
    locale === 'ko'
      ? '음원은 아티스트의 열정이 담긴 창이며, 곧 미래를 설계하는 일입니다.'
      : "A recorded work is a window into the artist's passion—and an act of designing the future.",
  )

  return (
    <section id="services" className="py-28 px-6 md:px-12 lg:px-20">
      <div className="max-w-4xl mx-auto">
        {/* Section heading */}
        <div className="mb-20">
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-[#CCCCCC] mb-4"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {eyebrow}
          </p>
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] font-semibold uppercase tracking-[0.08em] text-[#F0F0F0] leading-tight"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {title}
          </h2>
          <p
            className="mt-6 text-[#CCCCCC] font-light leading-[1.9] text-[clamp(0.875rem,1.4vw,1rem)] max-w-2xl"
            style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {subtitle}
          </p>
        </div>

        {/* Services vertical stack */}
        <div className="flex flex-col">
          {services.map((service, index) => {
            const title = locale === 'ko' ? service.title_ko : service.title_en
            const description = locale === 'ko' ? service.description_ko : service.description_en
            const lines = description.split('\n').filter(Boolean)
            const tagline = lines[0] ?? ''
            const bodyLines = lines.slice(1)
            const isShort = bodyLines.length === 0

            return (
              <div key={service.id}>
                <div className="py-12 md:py-16 grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
                  {/* Left: title + number */}
                  <div className="flex flex-col gap-3">
                    <span
                      className="text-[11px] tracking-[0.25em] text-[#8B0000] font-medium"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3
                      className="text-[clamp(1.4rem,2.5vw,1.75rem)] font-light text-[#F0F0F0] tracking-wide leading-snug"
                      style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                    >
                      {title}
                    </h3>
                  </div>

                  {/* Right: description */}
                  <div className="flex flex-col gap-4">
                    {/* Bold tagline (first line) */}
                    <p
                      className="text-[#E0E0E0] font-medium text-[clamp(0.95rem,1.5vw,1.1rem)] leading-[1.7]"
                      style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                    >
                      {tagline}
                    </p>

                    {/* Body paragraphs */}
                    {!isShort && (
                      <div
                        className="flex flex-col gap-4 text-[#CCCCCC] font-light text-[clamp(0.85rem,1.3vw,0.95rem)] leading-[1.9]"
                        style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                      >
                        {bodyLines.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Separator — not after last item */}
                {index < services.length - 1 && (
                  <div className="w-full h-px bg-white/10" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
