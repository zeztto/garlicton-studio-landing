import type { CollectionConfig } from 'payload'

export const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  admin: {
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'artist', 'mediaType', 'sortOrder'],
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
      options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'SoundCloud', value: 'soundcloud' },
        { label: 'Spotify', value: 'spotify' },
      ],
    },
    { name: 'embedUrl', type: 'text', required: true, label: 'Embed URL' },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: '커버 이미지' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0 },
  ],
}
