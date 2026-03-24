import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'

interface HeroProps {
  locale: string
}

export async function Hero({ locale }: HeroProps) {
  const t = await getTranslations({ locale, namespace: 'hero' })

  let tagline = ''
  let subtitle = ''

  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    tagline = locale === 'ko'
      ? (settings.tagline_ko ?? '더 멀리, 더 깊이있게')
      : (settings.tagline_en ?? 'Further and Deeper')
    subtitle = locale === 'ko'
      ? (settings.subtitle_ko ?? '')
      : (settings.subtitle_en ?? '')
  } catch {
    tagline = locale === 'ko' ? '더 멀리, 더 깊이있게' : 'Further and Deeper'
    subtitle = locale === 'ko'
      ? '음악에 쏟아부은 시간과 노력은 결코 헛되지 않으며,\n의미 있는 결과로 이어진다고 생각합니다.\n아티스트의 비전을 현실로 만들고,\n미래로 나아갈 수 있도록 함께 돕겠습니다.'
      : 'The time and effort you pour into music is never in vain—\nit leads to meaningful results.\nWe help turn your artistic vision into reality\nand move forward into the future together.'
  }

  const subtitleLines = subtitle.split('\n').filter(Boolean)

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Subtle radial gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139,0,0,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center gap-8">
        {/* Specialist badge */}
        <span
          className="inline-block text-[11px] tracking-[0.3em] uppercase text-[#888888]"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {t('specialist')}
        </span>

        {/* Studio title */}
        <h1
          className="text-[clamp(2.2rem,6vw,5.5rem)] font-bold uppercase leading-none tracking-[0.08em] text-[#F0F0F0]"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Garlicton
          <br />
          <span className="text-[0.55em] tracking-[0.18em] font-light text-[#FFFFFFCC]">
            Recording Studio
          </span>
        </h1>

        {/* Tagline from CMS */}
        <p
          className="text-[clamp(1.1rem,2.5vw,1.6rem)] font-light text-[#FFFFFFB3] tracking-[0.04em]"
          style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
        >
          {tagline}
        </p>

        {/* Thin divider */}
        <div className="w-12 h-px bg-white/15" />

        {/* Subtitle (multi-line poetic text from CMS) */}
        {subtitleLines.length > 0 && (
          <div
            className="flex flex-col gap-1 text-[clamp(0.85rem,1.5vw,1rem)] font-light text-[#888888] leading-[1.9]"
            style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {subtitleLines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>
        )}

        {/* CTA button */}
        <a
          href="#contact"
          className="mt-4 inline-block px-8 py-3 border border-white/20 text-[13px] tracking-[0.2em] uppercase text-[#F0F0F0] hover:border-white/50 hover:text-white transition-all duration-300"
          style={{ fontFamily: 'var(--font-inter)' }}
          onClick={undefined}
        >
          {t('cta')}
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <div className="w-px h-10 bg-white/40 animate-pulse" />
      </div>
    </section>
  )
}
