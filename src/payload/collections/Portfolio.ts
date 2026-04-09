import type { CollectionConfig } from 'payload'
import { buildHomePreviewURL } from '../../lib/preview.ts'

export const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  labels: { singular: '포트폴리오', plural: '포트폴리오' },
  admin: {
    group: '📄 콘텐츠',
    description: '포트폴리오 작품과 YouTube 영상을 관리합니다.',
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'artist', 'mediaType', 'sortOrder'],
    hideAPIURL: true,
    preview: (_, { locale }) => buildHomePreviewURL({ anchor: 'portfolio', locale }),
    livePreview: {
      url: ({ locale }) => buildHomePreviewURL({ anchor: 'portfolio', locale: locale.code }),
    },
  },
  defaultSort: 'sortOrder',
  lockDocuments: {
    duration: 300,
  },
  fields: [
    { name: 'title_ko', type: 'text', required: true, label: '제목 (한국어)' },
    { name: 'title_en', type: 'text', required: true, label: 'Title (English)' },
    { name: 'artist', type: 'text', required: true, label: '아티스트' },
    { name: 'genre', type: 'text', label: '장르' },
    { name: 'description_ko', type: 'textarea', label: '설명 (한국어)' },
    { name: 'description_en', type: 'textarea', label: 'Description (English)' },
    {
      name: 'mediaType',
      type: 'select',
      required: true,
      label: '미디어 유형',
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'SoundCloud', value: 'soundcloud' },
        { label: 'Spotify', value: 'spotify' },
      ],
    },
    { name: 'embedUrl', type: 'text', required: true, label: '임베드 URL' },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: '커버 이미지' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0, label: '정렬 순서' },
  ],
}
