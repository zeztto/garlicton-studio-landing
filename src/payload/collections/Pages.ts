import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title_ko',
    defaultColumns: ['title_ko', 'status', 'updatedAt'],
  },
  fields: [
    { name: 'title_ko', type: 'text', required: true },
    { name: 'title_en', type: 'text' },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'body_ko', type: 'richText' },
    { name: 'body_en', type: 'richText' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}
