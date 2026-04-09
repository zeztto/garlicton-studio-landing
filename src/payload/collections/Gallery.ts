import type { CollectionConfig } from 'payload'
import { buildHomePreviewURL } from '../../lib/preview.ts'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: { singular: '갤러리', plural: '갤러리' },
  admin: {
    group: '📄 콘텐츠',
    description: '스튜디오 사진을 관리합니다.',
    defaultColumns: ['image', 'caption_ko', 'sortOrder'],
    hideAPIURL: true,
    preview: (_, { locale }) => buildHomePreviewURL({ anchor: 'studio', locale }),
    livePreview: {
      url: ({ locale }) => buildHomePreviewURL({ anchor: 'studio', locale: locale.code }),
    },
  },
  defaultSort: 'sortOrder',
  lockDocuments: {
    duration: 300,
  },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: '이미지' },
    { name: 'caption_ko', type: 'text', label: '캡션 (한국어)' },
    { name: 'caption_en', type: 'text', label: 'Caption (English)' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0, label: '정렬 순서' },
  ],
}
