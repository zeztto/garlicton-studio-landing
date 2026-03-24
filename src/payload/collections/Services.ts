import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'sortOrder'],
  },
  fields: [
    { name: 'title_ko', type: 'text', required: true, label: '제목 (한국어)' },
    { name: 'title_en', type: 'text', required: true, label: 'Title (English)' },
    { name: 'description_ko', type: 'textarea', required: true, label: '설명 (한국어)' },
    { name: 'description_en', type: 'textarea', required: true, label: 'Description (English)' },
    { name: 'icon', type: 'text', required: true, label: 'Icon name (Lucide icon)' },
    { name: 'sortOrder', type: 'number', required: true, defaultValue: 0, label: '정렬 순서' },
  ],
}
