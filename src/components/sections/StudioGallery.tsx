import { getPayloadClient } from '@/lib/payload'
import { StudioGalleryClient } from './StudioGalleryClient'
import { getLocalizedText } from '@/lib/site-settings'
import { getResolvedGalleryImages } from '@/lib/gallery-images'

interface StudioGalleryProps {
  locale: string
  content?: Record<string, unknown> | null
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

export async function StudioGallery({ locale, content }: StudioGalleryProps) {
  let items: GalleryItem[] = []
  let images = getResolvedGalleryImages()

  if (images.length === 0) {
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

    images = items
      .filter((item) => item.image?.url)
      .map((item) => ({
        id: item.id,
        src: item.image!.url!,
        caption_ko: item.caption_ko,
        caption_en: item.caption_en,
        width: item.image?.width ?? undefined,
        height: item.image?.height ?? undefined,
      }))
  }

  const galleryImages = images.map((item) => ({
    src: item.src,
    alt: (locale === 'ko' ? item.caption_ko : item.caption_en) ?? '',
    width: item.width ?? undefined,
    height: item.height ?? undefined,
  }))

  const eyebrow = getLocalizedText(content, 'eyebrow', locale, 'Studio')
  const title = getLocalizedText(content, 'title', locale, 'The Studio')
  const subtitle = getLocalizedText(
    content,
    'subtitle',
    locale,
    locale === 'ko'
      ? '더 나은 결과를 위해 함께 고민하고 도전하는 과정을 중요하게 생각합니다.'
      : 'We value the process of working together and pushing for better results.',
  )
  const overview = getLocalizedText(
    content,
    'overview',
    locale,
    locale === 'ko'
      ? '갈릭톤 스튜디오는 강화도에 자리한 메탈 음악 전문 레코딩 스튜디오입니다. 보컬 레코딩부터 악기 녹음, 믹싱, 마스터링까지 음악 제작의 전 여정을 함께합니다.'
      : 'Garlicton Studio is a metal music recording studio located on Ganghwa Island. From vocal and instrument recording to mixing and mastering — we walk the entire journey of music production with you.',
  )
  const authenticTitle = getLocalizedText(content, 'authenticTitle', locale, locale === 'ko' ? '진정성 있는 사운드' : 'Authentic Sound')
  const authenticDesc = getLocalizedText(
    content,
    'authenticDesc',
    locale,
    locale === 'ko'
      ? '메탈 음악의 본질을 이해하는 엔지니어가 날것의 에너지와 디테일을 정확하게 구현합니다.'
      : 'An engineer who understands the essence of metal music precisely captures raw energy and detail.',
  )
  const comfortableTitle = getLocalizedText(
    content,
    'comfortableTitle',
    locale,
    locale === 'ko' ? '편안한 작업 환경' : 'Comfortable Environment',
  )
  const comfortableDesc = getLocalizedText(
    content,
    'comfortableDesc',
    locale,
    locale === 'ko'
      ? '주택형 구조의 프라이빗 공간에서 시간 압박 없이 창작에 집중할 수 있습니다.'
      : 'Focus on creation without time pressure in our private, house-style space.',
  )
  const emptyState = getLocalizedText(
    content,
    'emptyState',
    locale,
    locale === 'ko' ? 'CMS에서 갤러리 사진을 추가해주세요.' : 'Add gallery photos from the CMS.',
  )

  return (
    <section id="studio" className="py-28 px-6 md:px-12 lg:px-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
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
            className="mt-6 text-[#CCCCCC] font-light leading-[1.9] text-[clamp(0.875rem,1.4vw,1rem)] italic max-w-2xl"
            style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {subtitle}
          </p>
        </div>

        {/* Studio description cards */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-20">
          {/* Overview */}
          <div className="flex flex-col gap-3">
            <div className="w-6 h-px bg-[#8B0000]" />
            <p
              className="text-[#FFFFFFDD] font-light text-[clamp(0.875rem,1.3vw,0.95rem)] leading-[1.9]"
              style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {overview}
            </p>
          </div>

          {/* Authentic Sound */}
          <div className="flex flex-col gap-3">
            <div className="w-6 h-px bg-[#8B0000]" />
            <h3
              className="text-[13px] tracking-[0.15em] uppercase text-[#F0F0F0] font-medium"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {authenticTitle}
            </h3>
            <p
              className="text-[#CCCCCC] font-light text-[clamp(0.8rem,1.2vw,0.875rem)] leading-[1.9]"
              style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {authenticDesc}
            </p>
          </div>

          {/* Comfortable Environment */}
          <div className="flex flex-col gap-3">
            <div className="w-6 h-px bg-[#8B0000]" />
            <h3
              className="text-[13px] tracking-[0.15em] uppercase text-[#F0F0F0] font-medium"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {comfortableTitle}
            </h3>
            <p
              className="text-[#CCCCCC] font-light text-[clamp(0.8rem,1.2vw,0.875rem)] leading-[1.9]"
              style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {comfortableDesc}
            </p>
          </div>
        </div>

        {/* Gallery grid — client component handles lightbox */}
        {galleryImages.length > 0 ? (
          <StudioGalleryClient images={galleryImages} />
        ) : (
          <div className="text-center py-16">
            <p className="text-[#999999] text-sm">
              {emptyState}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
