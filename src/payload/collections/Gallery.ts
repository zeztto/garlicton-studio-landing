import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    defaultColumns: ['image', 'caption_ko', 'sortOrder'],
  },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption_ko', type: 'text', label: '캡션 (한국어)' },
    { name: 'caption_en', type: 'text', label: 'Caption (English)' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0 },
  ],
}
