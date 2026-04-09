import type { CollectionConfig } from 'payload'
import { buildHomePreviewURL } from '../../lib/preview.ts'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: '서비스', plural: '서비스' },
  admin: {
    group: '📄 콘텐츠',
    description: '레코딩, 믹싱, 마스터링, 프로듀싱 서비스를 관리합니다.',
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'sortOrder'],
    hideAPIURL: true,
    preview: (_, { locale }) => buildHomePreviewURL({ anchor: 'services', locale }),
    livePreview: {
      url: ({ locale }) => buildHomePreviewURL({ anchor: 'services', locale: locale.code }),
    },
  },
  defaultSort: 'sortOrder',
  lockDocuments: {
    duration: 300,
  },
  fields: [
    { name: 'title_ko', type: 'text', required: true, label: '제목 (한국어)' },
    { name: 'title_en', type: 'text', required: true, label: 'Title (English)' },
    { name: 'description_ko', type: 'textarea', required: true, label: '설명 (한국어)' },
    { name: 'description_en', type: 'textarea', required: true, label: 'Description (English)' },
    { name: 'icon', type: 'text', required: true, label: '아이콘 이름 (Lucide icon)' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0, label: '정렬 순서' },
  ],
}
