import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  GeneratePreviewURL,
} from 'payload'
import { normalizeTrimmedString } from '../../lib/payload-admin.ts'
import { buildPagePreviewURL } from '../../lib/preview.ts'
import { normalizePageSlug } from '../../lib/pages-workflow.ts'

const PAGE_STRING_FIELDS = [
  'title_ko',
  'title_en',
  'slug',
  'summary_ko',
  'summary_en',
  'seoTitle_ko',
  'seoTitle_en',
  'seoDescription_ko',
  'seoDescription_en',
] as const

const sanitizePageDraft: CollectionBeforeValidateHook = ({ data }) => {
  const nextData = { ...data }

  for (const field of PAGE_STRING_FIELDS) {
    const normalized = normalizeTrimmedString(nextData[field])
    nextData[field] = normalized ?? null
  }

  const normalizedSlug = normalizePageSlug(nextData.slug)

  if (normalizedSlug) {
    nextData.slug = normalizedSlug
  }

  if (nextData.title_ko == null) {
    nextData.title_ko = ''
  }

  if (nextData.slug == null) {
    nextData.slug = ''
  }

  return nextData
}

const syncPublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const nextData = { ...data }
  const normalizedSlug = normalizePageSlug(nextData.slug)

  if (normalizedSlug) {
    nextData.slug = normalizedSlug
  }

  if (nextData.status === 'published' && !nextData.publishedAt) {
    nextData.publishedAt = originalDoc?.publishedAt ?? new Date().toISOString()
  }

  return nextData
}

const resolvePagePreviewURL = ({
  locale,
  slug,
}: {
  locale?: null | string
  slug?: null | string
}): null | string => {
  const normalizedSlug = normalizePageSlug(slug)

  if (!normalizedSlug) {
    return null
  }

  return buildPagePreviewURL({
    locale,
    slug: normalizedSlug,
  })
}

const generatePagePreviewURL: GeneratePreviewURL = (doc, { locale }) => {
  return resolvePagePreviewURL({
    locale,
    slug: typeof doc.slug === 'string' ? doc.slug : null,
  })
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: '페이지', plural: '페이지' },
  admin: {
    group: '📄 콘텐츠',
    description: '공개 페이지, 공지, 소식성 콘텐츠를 관리합니다. `published` 상태인 문서만 공개 라우트에 노출되며, 저장된 draft는 preview URL로 검수할 수 있습니다.',
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'status', 'featured', 'sortOrder', 'publishedAt', 'updatedAt'],
    enableListViewSelectAPI: true,
    hideAPIURL: true,
    preview: generatePagePreviewURL,
    livePreview: {
      url: ({ data, locale }) =>
        resolvePagePreviewURL({
          locale: locale.code,
          slug: typeof data.slug === 'string' ? data.slug : null,
        }),
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 390,
          height: 844,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 1024,
        },
      ],
    },
  },
  hooks: {
    beforeValidate: [sanitizePageDraft],
    beforeChange: [syncPublishedAt],
  },
  defaultSort: '-updatedAt',
  lockDocuments: {
    duration: 300,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '콘텐츠',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title_ko',
                  type: 'text',
                  required: true,
                  label: '제목 (한국어)',
                  admin: {
                    width: '50%',
                    description: '운영 기준 대표 제목입니다. admin 리스트의 기본 제목으로 사용됩니다.',
                  },
                },
                {
                  name: 'title_en',
                  type: 'text',
                  label: 'Title (English)',
                  admin: {
                    width: '50%',
                    description: '영문 페이지가 필요할 때만 입력하세요. 비워두면 한국어 제목이 fallback 됩니다.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: '대표 이미지',
                  admin: {
                    width: '50%',
                    description: '페이지 목록 썸네일이나 상세 상단 비주얼로 사용할 대표 이미지를 지정합니다.',
                  },
                },
                {
                  name: 'summary_ko',
                  type: 'textarea',
                  label: '요약 (한국어)',
                  admin: {
                    width: '50%',
                    description: '목록 카드, 공유 문구, 미리보기 설명에 쓸 1~3문장 요약을 권장합니다.',
                  },
                },
              ],
            },
            {
              name: 'summary_en',
              type: 'textarea',
              label: 'Summary (English)',
              admin: {
                description: '영문 페이지가 필요할 때만 입력하세요. 비워두면 한국어 요약이 fallback 됩니다.',
              },
            },
            {
              name: 'body_ko',
              type: 'richText',
              label: '본문 (한국어)',
              admin: {
                description: '공개 페이지 본문입니다. 목록 전용 설명은 위 `요약` 필드에 따로 입력하세요.',
              },
            },
            {
              name: 'body_en',
              type: 'richText',
              label: 'Body (English)',
              admin: {
                description: '영문 본문이 필요할 때만 입력하세요. 비워두면 한국어 본문이 fallback 됩니다.',
              },
            },
          ],
        },
        {
          label: '게시 설정',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'slug',
                  type: 'text',
                  required: true,
                  unique: true,
                  label: '슬러그 (URL)',
                  admin: {
                    width: '40%',
                    description: '예: `mixing-guide`. 저장 시 공백/대문자/underscore는 자동 정규화됩니다.',
                  },
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'draft',
                  label: '상태',
                  options: [
                    { label: '임시저장', value: 'draft' },
                    { label: '게시됨', value: 'published' },
                  ],
                  admin: {
                    width: '20%',
                    description: '`published`로 저장하면 공개 목록과 상세 페이지 노출 대상이 됩니다.',
                  },
                },
                {
                  name: 'publishedAt',
                  type: 'date',
                  label: '게시 일시',
                  admin: {
                    width: '20%',
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    description: '비워두고 `published`로 저장하면 현재 시각이 자동 입력됩니다.',
                  },
                },
                {
                  name: 'featured',
                  type: 'checkbox',
                  label: '상단 고정',
                  defaultValue: false,
                  admin: {
                    width: '20%',
                    description: '체크하면 공개 목록에서 우선 노출됩니다.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'showInList',
                  type: 'checkbox',
                  label: '목록/사이트맵 노출',
                  defaultValue: true,
                  admin: {
                    width: '50%',
                    description: '끄면 상세 URL은 유지하되 공개 목록과 sitemap에서는 제외됩니다.',
                  },
                },
                {
                  name: 'sortOrder',
                  type: 'number',
                  label: '수동 정렬 순서',
                  defaultValue: 0,
                  admin: {
                    width: '50%',
                    description: '낮을수록 먼저 노출됩니다. 같으면 featured/publishedAt 기준으로 정렬됩니다.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'seoTitle_ko',
                  type: 'text',
                  label: 'SEO 제목 (한국어)',
                  admin: {
                    width: '50%',
                    description: '검색/공유용 제목을 따로 쓰고 싶을 때만 입력하세요. 비워두면 페이지 제목을 사용합니다.',
                  },
                },
                {
                  name: 'seoTitle_en',
                  type: 'text',
                  label: 'SEO Title (English)',
                  admin: {
                    width: '50%',
                    description: '영문 검색/공유용 제목입니다. 비워두면 영문 제목 또는 한국어 제목이 fallback 됩니다.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'seoDescription_ko',
                  type: 'textarea',
                  label: 'SEO 설명 (한국어)',
                  admin: {
                    width: '50%',
                    description: '검색 결과 설명이나 공유용 description에 사용됩니다. 비워두면 요약 또는 본문 일부를 사용합니다.',
                  },
                },
                {
                  name: 'seoDescription_en',
                  type: 'textarea',
                  label: 'SEO Description (English)',
                  admin: {
                    width: '50%',
                    description: '영문 검색/공유용 설명입니다. 비워두면 요약 또는 본문 일부가 fallback 됩니다.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
