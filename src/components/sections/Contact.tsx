import { ContactForm } from '@/components/ui/ContactForm'
import { KakaoMap } from '@/components/ui/KakaoMap'
import { getLocalizedText } from '@/lib/site-settings'

interface ContactProps {
  locale: string
  content?: Record<string, unknown> | null
  contactInfo?: Record<string, unknown> | null
}

export async function Contact({ locale, content, contactInfo }: ContactProps) {
  const fontBody = locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)'

  const phone = typeof contactInfo?.phone === 'string' && contactInfo.phone.trim()
    ? contactInfo.phone
    : '0507-1313-6843'
  const addressKo = getLocalizedText(contactInfo, 'address', 'ko', '인천 강화군 강화읍 북문길67번길 8-1')
  const addressEn = getLocalizedText(contactInfo, 'address', 'en', '8-1 Bukmun-gil 67beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon')
  const instagramUrl =
    typeof contactInfo?.instagramUrl === 'string' && contactInfo.instagramUrl.trim()
      ? contactInfo.instagramUrl
      : 'https://www.instagram.com/garlicton_studio'
  const eyebrow = getLocalizedText(content, 'eyebrow', locale, 'Contact')
  const title = getLocalizedText(content, 'title', locale, 'Contact Us')
  const subtitle = getLocalizedText(content, 'subtitle', locale, locale === 'ko' ? '편하게 연락주세요.' : 'Feel free to reach out.')
  const reservation = getLocalizedText(
    content,
    'reservation',
    locale,
    locale === 'ko'
      ? '갈릭톤 스튜디오는 100% 예약제로 운영되며 방문 전 문의가 필요합니다.'
      : 'Garlicton Studio operates 100% by reservation. Please inquire before visiting.',
  )

  const phoneHref = `tel:${phone.replace(/-/g, '')}`
  const instagramHandle = instagramUrl.replace(/\/$/, '').split('/').pop() ?? 'garlicton_studio'

  return (
    <section id="contact" className="py-28 px-6 md:px-12 lg:px-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="mb-16">
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
            className="mt-4 text-[#CCCCCC] font-light leading-[1.9] text-[clamp(0.875rem,1.4vw,1rem)] italic max-w-2xl"
            style={{ fontFamily: fontBody }}
          >
            {subtitle}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Left: Contact Form */}
          <div>
            <ContactForm locale={locale} />
          </div>

          {/* Right: Info + Map */}
          <div className="flex flex-col gap-10">
            {/* Reservation notice */}
            <div className="flex gap-4 p-5 bg-[#1A1A1A] border border-[#8B0000]/30 rounded-md">
              <div className="w-1 flex-shrink-0 bg-[#8B0000] rounded-full" />
              <p
                className="text-[#FFFFFFDD] font-light text-sm leading-[1.8]"
                style={{ fontFamily: fontBody }}
              >
                {reservation}
              </p>
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-6">
              {/* Phone */}
              <div className="flex flex-col gap-1">
                <p
                  className="text-[11px] tracking-[0.25em] uppercase text-[#CCCCCC]"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Phone
                </p>
                <a
                  href={phoneHref}
                  className="text-[#F0F0F0] font-light text-sm hover:text-[#8B0000] transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {phone}
                </a>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1">
                <p
                  className="text-[11px] tracking-[0.25em] uppercase text-[#CCCCCC]"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Address
                </p>
                <p
                  className="text-[#F0F0F0] font-light text-sm leading-[1.8]"
                  style={{ fontFamily: fontBody }}
                >
                  {addressKo}
                </p>
                <p
                  className="text-[#CCCCCC] font-light text-xs"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  {addressEn}
                </p>
              </div>

              {/* Instagram */}
              <div className="flex flex-col gap-1">
                <p
                  className="text-[11px] tracking-[0.25em] uppercase text-[#CCCCCC]"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  Instagram
                </p>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F0F0F0] font-light text-sm hover:text-[#8B0000] transition-colors duration-200 flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                  @{instagramHandle}
                </a>
              </div>
            </div>

            {/* Kakao Map */}
            <KakaoMap />
          </div>
        </div>
      </div>
    </section>
  )
}
