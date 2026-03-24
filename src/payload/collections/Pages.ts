import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: '페이지', plural: '페이지' },
  admin: {
    group: '📄 콘텐츠',
    description: '블로그/뉴스 페이지를 관리합니다.',
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'status', 'updatedAt'],
  },
  fields: [
    { name: 'title_ko', type: 'text', required: true, label: '제목 (한국어)' },
    { name: 'title_en', type: 'text', label: 'Title (English)' },
    { name: 'slug', type: 'text', required: true, unique: true, label: '슬러그 (URL)' },
    { name: 'body_ko', type: 'richText', label: '본문 (한국어)' },
    { name: 'body_en', type: 'richText', label: 'Body (English)' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      label: '상태',
      options: [
        { label: '임시저장', value: 'draft' },
        { label: '게시됨', value: 'published' },
      ],
    },
  ],
}
