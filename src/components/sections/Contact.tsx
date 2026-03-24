import { getTranslations } from 'next-intl/server'
import { ContactForm } from '@/components/ui/ContactForm'
import { KakaoMap } from '@/components/ui/KakaoMap'

interface ContactProps {
  locale: string
}

export async function Contact({ locale }: ContactProps) {
  const t = await getTranslations({ locale, namespace: 'contact' })

  const fontBody = locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)'

  return (
    <section id="contact" className="py-28 px-6 md:px-12 lg:px-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="mb-16">
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-[#CCCCCC] mb-4"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Contact
          </p>
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] font-semibold uppercase tracking-[0.08em] text-[#F0F0F0] leading-tight"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {t('title')}
          </h2>
          <p
            className="mt-4 text-[#CCCCCC] font-light leading-[1.9] text-[clamp(0.875rem,1.4vw,1rem)] italic max-w-2xl"
            style={{ fontFamily: fontBody }}
          >
            {t('subtitle')}
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
                {t('reservation')}
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
                  href="tel:050713136843"
                  className="text-[#F0F0F0] font-light text-sm hover:text-[#8B0000] transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  0507-1313-6843
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
                  인천 강화군 강화읍 북문길67번길 8-1
                </p>
                <p
                  className="text-[#CCCCCC] font-light text-xs"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  8-1 Bukmun-gil 67beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon
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
                  href="https://www.instagram.com/garlicton_studio"
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
                  @garlicton_studio
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
