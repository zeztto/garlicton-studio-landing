import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'

interface AboutProps {
  locale: string
}

interface CareerItem {
  id?: string | number
  period?: string | null
  description_ko?: string | null
  description_en?: string | null
}

export async function About({ locale }: AboutProps) {
  const t = await getTranslations({ locale, namespace: 'about' })

  let name = locale === 'ko' ? '이주희' : 'Lee Ju Hee'
  let title = 'Founder / Producer / Mixer / Mastering Engineer'
  let career: CareerItem[] = []
  let profileImageUrl = 'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1774365620/garlicton/profile.jpg'

  try {
    const payload = await getPayloadClient()
    const data = await payload.findGlobal({ slug: 'about', depth: 1 })
    name = locale === 'ko'
      ? (data.name_ko ?? name)
      : (data.name_en ?? name)
    title = locale === 'ko'
      ? (data.title_ko ?? title)
      : (data.title_en ?? title)
    career = (data.career ?? []) as CareerItem[]
    const profileImg = data.profileImage as { url?: string } | null
    if (profileImg?.url) {
      profileImageUrl = profileImg.url
    }
  } catch {
    // Fall through to defaults
  }

  // Identify award entries (contain "수상" in KO or "Winner" in EN)
  const isAward = (item: CareerItem) => {
    const desc = locale === 'ko' ? item.description_ko : item.description_en
    if (!desc) return false
    return desc.includes('수상') || desc.toLowerCase().includes('winner')
  }

  const winCount = career.filter((c) => isAward(c)).length
  const nomineeCount = career.filter((c) => {
    const desc = locale === 'ko' ? c.description_ko : c.description_en
    if (!desc) return false
    return desc.includes('노미네이트') || desc.toLowerCase().includes('nomin')
  }).length

  return (
    <section id="about" className="py-28 px-6 md:px-12 lg:px-20 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        {/* Section label */}
        <div className="mb-20">
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-[#CCCCCC] mb-4"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {t('studioName')}
          </p>
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] font-semibold uppercase tracking-[0.08em] text-[#F0F0F0] leading-tight"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {t('title')}
          </h2>
          <p
            className="mt-6 text-[#CCCCCC] font-light leading-[1.9] text-[clamp(0.875rem,1.4vw,1rem)] italic"
            style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {t('subtitle')}
          </p>
        </div>

        {/* Engineer intro */}
        <div className="mb-16 grid md:grid-cols-[1fr_1.5fr] gap-12 md:gap-20 items-start">
          {/* Left: name + title + profile image */}
          <div className="flex flex-col gap-4">
            {/* Profile image */}
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border border-white/10">
              <img
                src={profileImageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3
              className="text-[clamp(2rem,4vw,3rem)] font-light text-[#F0F0F0] leading-tight tracking-wide"
              style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {name}
            </h3>
            <p
              className="text-[13px] text-[#CCCCCC] tracking-wide leading-[1.8]"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {title}
            </p>
            <p
              className="text-[12px] text-[#CCCCCC] tracking-wider mt-1"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {t('experience')}
            </p>
            <p
              className="text-[clamp(0.8rem,1.2vw,0.875rem)] text-[#FFFFFFDD] font-light leading-[1.8] mt-2"
              style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {t('accompany')}
            </p>

            {/* KMA highlights */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[2rem] font-bold text-[#8B0000] leading-none"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {winCount}
                </span>
                <span
                  className="text-[12px] uppercase tracking-[0.2em] text-[#CCCCCC]"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  KMA {locale === 'ko' ? '수상' : 'Wins'}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[2rem] font-bold text-[#999999] leading-none"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {nomineeCount}
                </span>
                <span
                  className="text-[12px] uppercase tracking-[0.2em] text-[#CCCCCC]"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  KMA {locale === 'ko' ? '노미네이트' : 'Nominations'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: career timeline */}
          {career.length > 0 && (
            <div className="flex flex-col gap-0">
              {career.map((item, index) => {
                const desc = locale === 'ko' ? item.description_ko : item.description_en
                const award = isAward(item)
                return (
                  <div
                    key={item.id ?? index}
                    className="flex gap-6 py-5 border-b border-white/10 last:border-0 group"
                  >
                    {/* Year */}
                    <span
                      className="text-[12px] tracking-widest text-[#999999] group-hover:text-[#CCCCCC] transition-colors shrink-0 pt-0.5 w-10"
                      style={{ fontFamily: 'var(--font-inter)' }}
                    >
                      {item.period}
                    </span>
                    {/* Description */}
                    <p
                      className={`text-[clamp(0.8rem,1.2vw,0.875rem)] leading-[1.8] font-light transition-colors ${
                        award ? 'text-[#E0E0E0]' : 'text-[#BBBBBB]'
                      } group-hover:text-[#FFFFFFDD]`}
                      style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                    >
                      {award && (
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full bg-[#8B0000] mr-2 translate-y-[-1px]"
                        />
                      )}
                      {desc}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
