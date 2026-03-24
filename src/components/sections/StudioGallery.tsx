import { getTranslations } from 'next-intl/server'
import { getPayloadClient } from '@/lib/payload'
import { StudioGalleryClient } from './StudioGalleryClient'

interface StudioGalleryProps {
  locale: string
}

interface GalleryItem {
  id: string | number
  image: {
    url?: string | null
    width?: number | null
    height?: number | null
    alt_ko?: string | null
    alt_en?: string | null
  } | null
  caption_ko?: string | null
  caption_en?: string | null
  sortOrder: number
}

export async function StudioGallery({ locale }: StudioGalleryProps) {
  const t = await getTranslations({ locale, namespace: 'studio' })

  let items: GalleryItem[] = []

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'gallery',
      sort: 'sortOrder',
      limit: 50,
      depth: 1,
    })
    items = result.docs as GalleryItem[]
  } catch {
    // Render without gallery on failure
  }

  // Shape images for the client component
  const images = items
    .filter((item) => item.image?.url)
    .map((item) => ({
      src: item.image!.url!,
      alt: (locale === 'ko' ? item.caption_ko : item.caption_en) ?? '',
      width: item.image?.width ?? undefined,
      height: item.image?.height ?? undefined,
    }))

  return (
    <section id="studio" className="py-28 px-6 md:px-12 lg:px-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="mb-20">
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-[#AAAAAA] mb-4"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Studio
          </p>
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] font-semibold uppercase tracking-[0.08em] text-[#F0F0F0] leading-tight"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {t('title')}
          </h2>
          <p
            className="mt-6 text-[#AAAAAA] font-light leading-[1.9] text-[clamp(0.875rem,1.4vw,1rem)] italic max-w-2xl"
            style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {t('subtitle')}
          </p>
        </div>

        {/* Studio description cards */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-20">
          {/* Overview */}
          <div className="flex flex-col gap-3">
            <div className="w-6 h-px bg-[#8B0000]" />
            <p
              className="text-[#FFFFFFB3] font-light text-[clamp(0.875rem,1.3vw,0.95rem)] leading-[1.9]"
              style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {t('description')}
            </p>
          </div>

          {/* Authentic Sound */}
          <div className="flex flex-col gap-3">
            <div className="w-6 h-px bg-[#8B0000]" />
            <h3
              className="text-[13px] tracking-[0.15em] uppercase text-[#F0F0F0] font-medium"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {t('authentic')}
            </h3>
            <p
              className="text-[#AAAAAA] font-light text-[clamp(0.8rem,1.2vw,0.875rem)] leading-[1.9]"
              style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {t('authenticDesc')}
            </p>
          </div>

          {/* Comfortable Environment */}
          <div className="flex flex-col gap-3">
            <div className="w-6 h-px bg-[#8B0000]" />
            <h3
              className="text-[13px] tracking-[0.15em] uppercase text-[#F0F0F0] font-medium"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {t('comfortable')}
            </h3>
            <p
              className="text-[#AAAAAA] font-light text-[clamp(0.8rem,1.2vw,0.875rem)] leading-[1.9]"
              style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {t('comfortableDesc')}
            </p>
          </div>
        </div>

        {/* Gallery grid — client component handles lightbox */}
        {images.length > 0 ? (
          <StudioGalleryClient images={images} />
        ) : (
          <StudioGalleryClient images={[
            { src: '/images/instagram/studio-01.jpg', alt: '스튜디오 장비' },
            { src: '/images/instagram/studio-02.jpg', alt: '스튜디오 장비' },
            { src: '/images/instagram/studio-04.jpg', alt: '스튜디오' },
            { src: '/images/instagram/studio-05.jpg', alt: '스튜디오' },
            { src: '/images/instagram/studio-06.jpg', alt: '스튜디오' },
            { src: '/images/instagram/studio-08.jpg', alt: '스튜디오' },
            { src: '/images/instagram/studio-09.jpg', alt: '스튜디오' },
            { src: '/images/instagram/studio-11.jpg', alt: '스튜디오' },
            { src: '/images/instagram/gear-01.jpg', alt: '장비' },
            { src: '/images/instagram/gear-02.jpg', alt: '장비' },
            { src: '/images/instagram/session-01.jpg', alt: '세션' },
            { src: '/images/instagram/session-02.jpg', alt: '세션' },
          ]} />
        )}
      </div>
    </section>
  )
}
