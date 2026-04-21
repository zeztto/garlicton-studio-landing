import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: '미디어', plural: '미디어' },
  access: {
    read: () => true,
  },
  admin: {
    group: '⚙️ 설정',
  },
  upload: {
    mimeTypes: ['image/*'],
    staticDir: 'public/media',
  },
  fields: [
    {
      name: 'alt_ko',
      type: 'text',
      label: 'Alt Text (한국어)',
    },
    {
      name: 'alt_en',
      type: 'text',
      label: 'Alt Text (English)',
    },
  ],
}
