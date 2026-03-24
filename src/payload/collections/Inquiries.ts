import type { CollectionConfig } from 'payload'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'isRead', 'createdAt'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Recording', value: 'recording' },
        { label: 'Mixing', value: 'mixing' },
        { label: 'Mastering', value: 'mastering' },
        { label: 'Producing', value: 'producing' },
      ],
    },
    { name: 'genre', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    { name: 'isRead', type: 'checkbox', defaultValue: false, label: '읽음' },
  ],
}
