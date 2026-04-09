import Image from 'next/image'
import { Fragment } from 'react'
import { getPayloadClient } from '@/lib/payload'
import { getLocalizedText } from '@/lib/site-settings'

interface AboutProps {
  locale: string
  content?: Record<string, unknown> | null
}

interface CareerItem {
  id?: string | number
  period?: string | null
  description_ko?: string | null
  description_en?: string | null
}

type RichTextNode = {
  type?: string
  text?: string
  format?: number
  tag?: string
  listType?: string
  url?: string
  children?: RichTextNode[]
  fields?: {
    url?: string
    newTab?: boolean
  }
}

type RichTextValue = {
  root?: {
    children?: RichTextNode[]
  }
} | null

function hasRichTextContent(value: RichTextValue): boolean {
  const children = value?.root?.children

  return Array.isArray(children) && children.length > 0
}

function renderTextNode(node: RichTextNode) {
  let content: React.ReactNode = node.text ?? ''
  const format = typeof node.format === 'number' ? node.format : 0

  if (format & 1) {
    content = <strong>{content}</strong>
  }
  if (format & 2) {
    content = <em>{content}</em>
  }
  if (format & 4) {
    content = <span className="line-through">{content}</span>
  }
  if (format & 8) {
    content = <span className="underline">{content}</span>
  }

  return content
}

function renderRichTextChildren(children: RichTextNode[] | undefined, keyPrefix: string): React.ReactNode {
  if (!Array.isArray(children) || children.length === 0) {
    return null
  }

  return children.map((child, index) => (
    <Fragment key={`${keyPrefix}-${index}`}>
      {renderRichTextNode(child, `${keyPrefix}-${index}`)}
    </Fragment>
  ))
}

function renderRichTextNode(node: RichTextNode, key: string): React.ReactNode {
  switch (node.type) {
    case 'paragraph':
      return (
        <p className="text-[clamp(0.875rem,1.3vw,0.95rem)] leading-[1.9] text-[#D8D8D8]">
          {renderRichTextChildren(node.children, key)}
        </p>
      )
    case 'heading': {
      const tag = node.tag === 'h1' || node.tag === 'h2' || node.tag === 'h3' || node.tag === 'h4'
        ? node.tag
        : 'h3'
      if (tag === 'h1') {
        return <h3 className="text-xl text-[#F0F0F0] font-semibold">{renderRichTextChildren(node.children, key)}</h3>
      }
      if (tag === 'h2') {
        return <h3 className="text-lg text-[#F0F0F0] font-semibold">{renderRichTextChildren(node.children, key)}</h3>
      }
      if (tag === 'h3') {
        return <h4 className="text-base text-[#F0F0F0] font-semibold">{renderRichTextChildren(node.children, key)}</h4>
      }
      return <h5 className="text-sm text-[#F0F0F0] font-semibold">{renderRichTextChildren(node.children, key)}</h5>
    }
    case 'list':
      if (node.listType === 'number') {
        return (
          <ol className="list-decimal pl-5 space-y-2 text-[#D8D8D8]">
            {renderRichTextChildren(node.children, key)}
          </ol>
        )
      }
      return (
        <ul className="list-disc pl-5 space-y-2 text-[#D8D8D8]">
          {renderRichTextChildren(node.children, key)}
        </ul>
      )
    case 'listitem':
      return <li>{renderRichTextChildren(node.children, key)}</li>
    case 'quote':
      return (
        <blockquote className="border-l border-[#8B0000]/60 pl-4 italic text-[#E0E0E0]">
          {renderRichTextChildren(node.children, key)}
        </blockquote>
      )
    case 'link': {
      const href = node.fields?.url || node.url
      const isExternal = typeof href === 'string' && /^https?:\/\//.test(href)
      if (!href) {
        return renderRichTextChildren(node.children, key)
      }
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[#F0F0F0] underline underline-offset-4 hover:text-white"
        >
          {renderRichTextChildren(node.children, key)}
        </a>
      )
    }
    case 'linebreak':
      return <br />
    case 'text':
    default:
      return renderTextNode(node)
  }
}

export async function About({ locale, content }: AboutProps) {
  let name = locale === 'ko' ? '이주희' : 'Lee Ju Hee'
  let title = 'Founder / Producer / Mixer / Mastering Engineer'
  let career: CareerItem[] = []
  let profileImageUrl = 'https://res.cloudinary.com/dnlcuy2aj/image/upload/v1774365620/garlicton/profile.jpg'
  let bio: RichTextValue = null

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
    bio = (locale === 'ko' ? data.bio_ko : data.bio_en) as RichTextValue
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

  const eyebrow = getLocalizedText(content, 'eyebrow', locale, 'Garlicton')
  const sectionTitle = getLocalizedText(content, 'title', locale, 'The Staff')
  const sectionSubtitle = getLocalizedText(
    content,
    'subtitle',
    locale,
    locale === 'ko' ? '최고의 테이크가 최고의 결과물을 만든다.' : 'The best take creates the best result.',
  )
  const experienceLabel = getLocalizedText(
    content,
    'experienceLabel',
    locale,
    locale === 'ko' ? '15년 이상의 메탈 음악 산업 경력' : '15+ years in the metal music industry',
  )
  const accompany = getLocalizedText(
    content,
    'accompany',
    locale,
    locale === 'ko'
      ? '경험 많은 엔지니어가 세션의 시작부터 최종 마스터까지 전 과정을 함께합니다.'
      : 'An experienced engineer accompanies you from the first session to the final master.',
  )
  const winsLabel = getLocalizedText(content, 'winsLabel', locale, locale === 'ko' ? '수상' : 'Wins')
  const nominationsLabel = getLocalizedText(
    content,
    'nominationsLabel',
    locale,
    locale === 'ko' ? '노미네이트' : 'Nominations',
  )
  const hasBio = hasRichTextContent(bio)

  return (
    <section id="about" className="py-28 px-6 md:px-12 lg:px-20 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        {/* Section label */}
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
            {sectionTitle}
          </h2>
          <p
            className="mt-6 text-[#CCCCCC] font-light leading-[1.9] text-[clamp(0.875rem,1.4vw,1rem)] italic"
            style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
          >
            {sectionSubtitle}
          </p>
        </div>

        {/* Engineer intro */}
        <div className="mb-16 grid md:grid-cols-[1fr_1.5fr] gap-12 md:gap-20 items-start">
          {/* Left: name + title + profile image */}
          <div className="flex flex-col gap-4">
            {/* Profile image */}
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 border border-white/10">
              <Image
                src={profileImageUrl}
                alt={name}
                width={96}
                height={96}
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
              {experienceLabel}
            </p>
            <p
              className="text-[clamp(0.8rem,1.2vw,0.875rem)] text-[#FFFFFFDD] font-light leading-[1.8] mt-2"
              style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
            >
              {accompany}
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
                  KMA {winsLabel}
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
                  KMA {nominationsLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Right: bio + career timeline */}
          {(hasBio || career.length > 0) && (
            <div className="flex flex-col gap-0">
              {hasBio && (
                <div
                  className="mb-8 space-y-4"
                  style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
                >
                  {renderRichTextChildren(bio?.root?.children, 'about-bio')}
                </div>
              )}
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
