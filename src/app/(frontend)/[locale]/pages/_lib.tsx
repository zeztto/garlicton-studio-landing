import type { JSX, ReactNode } from 'react'
import { getPayloadClient } from '@/lib/payload'

type Locale = 'ko' | 'en'

type CmsPage = {
  id: number | string
  title_ko: string
  title_en?: string | null
  slug: string
  body_ko?: unknown
  body_en?: unknown
  status?: string | null
  updatedAt?: string
  createdAt?: string
  updated_at?: string
  created_at?: string
}

type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  format?: number | string | null
  url?: string
  fields?: { url?: string }
  children?: LexicalNode[]
  listType?: 'bullet' | 'number' | 'check'
}

type RichTextDocument = {
  root?: {
    children?: LexicalNode[]
  }
}

const TEXT_FORMAT = {
  bold: 1,
  italic: 1 << 1,
  strikethrough: 1 << 2,
  underline: 1 << 3,
  code: 1 << 4,
} as const

function isRichTextDocument(value: unknown): value is RichTextDocument {
  return typeof value === 'object' && value !== null
}

export async function getPublishedPages(): Promise<CmsPage[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1000,
    sort: '-updatedAt',
    where: {
      status: {
        equals: 'published',
      },
    },
  }) as unknown as { docs?: CmsPage[] }

  return result.docs ?? []
}

export async function getPublishedPageBySlug(slug: string): Promise<CmsPage | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
  }) as unknown as { docs?: CmsPage[] }

  return result.docs?.[0] ?? null
}

export function getLocalizedPageTitle(page: CmsPage, locale: Locale): string {
  if (locale === 'en') {
    return page.title_en?.trim() || page.title_ko
  }

  return page.title_ko?.trim() || page.title_en?.trim() || ''
}

export function getLocalizedPageBody(page: CmsPage, locale: Locale): unknown {
  if (locale === 'en') {
    return page.body_en ?? page.body_ko ?? null
  }

  return page.body_ko ?? page.body_en ?? null
}

export function getPageTimestamp(page: CmsPage): string | undefined {
  return page.updatedAt ?? page.updated_at ?? page.createdAt ?? page.created_at
}

export function getPageDescription(page: CmsPage, locale: Locale): string {
  const text = extractPlainText(getLocalizedPageBody(page, locale)).replace(/\s+/g, ' ').trim()
  if (text) {
    return text.slice(0, 160)
  }

  return getLocalizedPageTitle(page, locale)
}

export function renderRichText(value: unknown, locale: Locale): ReactNode {
  if (!isRichTextDocument(value) || !Array.isArray(value.root?.children)) {
    return null
  }

  return renderNodes(value.root.children, locale, 'root')
}

function renderNodes(nodes: LexicalNode[], locale: Locale, prefix: string): ReactNode[] {
  return nodes
    .map((node, index) => renderNode(node, locale, `${prefix}-${index}`))
    .filter((node): node is ReactNode => node !== null)
}

function renderNode(node: LexicalNode, locale: Locale, key: string): ReactNode | null {
  switch (node.type) {
    case 'heading': {
      const headingTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag ?? '')
        ? node.tag
        : 'h2'
      const Tag = headingTag as keyof JSX.IntrinsicElements

      return (
        <Tag
          key={key}
          className="mt-10 text-[clamp(1.6rem,2.8vw,2.4rem)] font-semibold tracking-tight text-[#F0F0F0]"
          style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
        >
          {renderInlineChildren(node.children, locale, key)}
        </Tag>
      )
    }
    case 'paragraph':
      if (!node.children?.length) {
        return null
      }

      return (
        <p
          key={key}
          className="text-[clamp(0.98rem,1.4vw,1.08rem)] leading-[1.95] text-[#D7D7D7]"
          style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
        >
          {renderInlineChildren(node.children, locale, key)}
        </p>
      )
    case 'quote':
      return (
        <blockquote
          key={key}
          className="border-l border-[#8B0000] pl-6 italic text-[#E6E6E6]"
          style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
        >
          {renderInlineChildren(node.children, locale, key)}
        </blockquote>
      )
    case 'list': {
      const ListTag = node.listType === 'number' ? 'ol' : 'ul'

      return (
        <ListTag
          key={key}
          className={node.listType === 'number' ? 'list-decimal pl-6 space-y-3' : 'list-disc pl-6 space-y-3'}
          style={{ fontFamily: locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)' }}
        >
          {renderNodes(node.children ?? [], locale, key)}
        </ListTag>
      )
    }
    case 'listitem':
      return (
        <li key={key} className="text-[clamp(0.98rem,1.4vw,1.08rem)] leading-[1.9] text-[#D7D7D7]">
          {node.children?.some((child) => isBlockNode(child))
            ? <div className="space-y-3">{renderNodes(node.children ?? [], locale, key)}</div>
            : renderInlineChildren(node.children, locale, key)}
        </li>
      )
    case 'horizontalrule':
      return <hr key={key} className="border-white/10 my-8" />
    case 'linebreak':
      return <br key={key} />
    case 'link':
      return (
        <a
          key={key}
          href={node.fields?.url ?? node.url ?? '#'}
          className="text-[#F0F0F0] underline underline-offset-4 hover:text-white transition-colors"
          target="_blank"
          rel="noreferrer"
        >
          {renderInlineChildren(node.children, locale, key)}
        </a>
      )
    case 'text':
      return renderTextNode(node, key)
    default:
      if (node.children?.length) {
        return (
          <div key={key} className="space-y-6">
            {renderNodes(node.children, locale, key)}
          </div>
        )
      }

      return null
  }
}

function renderInlineChildren(children: LexicalNode[] | undefined, locale: Locale, key: string): ReactNode {
  if (!children?.length) {
    return null
  }

  return children
    .map((child, index) => {
      if (child.type === 'link' || child.type === 'linebreak' || child.type === 'text') {
        return renderNode(child, locale, `${key}-inline-${index}`)
      }

      if (child.children?.length) {
        return (
          <span key={`${key}-inline-${index}`}>
            {renderInlineChildren(child.children, locale, `${key}-inline-${index}`)}
          </span>
        )
      }

      return null
    })
    .filter((node): node is ReactNode => node !== null)
}

function renderTextNode(node: LexicalNode, key: string): ReactNode {
  if (!node.text) {
    return null
  }

  let content: ReactNode = node.text
  const format = typeof node.format === 'number' ? node.format : 0

  if (format & TEXT_FORMAT.code) {
    content = <code className="rounded bg-white/8 px-1.5 py-0.5 text-[0.95em] text-[#F0F0F0]">{content}</code>
  }
  if (format & TEXT_FORMAT.bold) {
    content = <strong>{content}</strong>
  }
  if (format & TEXT_FORMAT.italic) {
    content = <em>{content}</em>
  }
  if (format & TEXT_FORMAT.underline) {
    content = <u>{content}</u>
  }
  if (format & TEXT_FORMAT.strikethrough) {
    content = <s>{content}</s>
  }

  return (
    <span key={key} className="whitespace-pre-wrap">
      {content}
    </span>
  )
}

function isBlockNode(node: LexicalNode): boolean {
  return ['heading', 'paragraph', 'quote', 'list', 'listitem', 'horizontalrule'].includes(node.type ?? '')
}

function extractPlainText(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(extractPlainText).join(' ')
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>

    if (typeof record.text === 'string') {
      return record.text
    }

    if (Array.isArray(record.children)) {
      return record.children.map(extractPlainText).join(' ')
    }

    if (record.root && typeof record.root === 'object') {
      return extractPlainText(record.root)
    }
  }

  return ''
}
