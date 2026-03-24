import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    mimeTypes: ['image/*'],
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
