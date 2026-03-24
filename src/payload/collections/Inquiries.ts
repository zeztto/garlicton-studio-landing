import type { CollectionConfig } from 'payload'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: '문의', plural: '문의' },
  admin: {
    group: '📬 문의',
    description: '사이트를 통해 접수된 문의 목록입니다.',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'isRead', 'createdAt'],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: '이름' },
    { name: 'email', type: 'email', required: true, label: '이메일' },
    { name: 'phone', type: 'text', label: '전화번호' },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      label: '관심 서비스',
      options: [
        { label: '레코딩', value: 'recording' },
        { label: '믹싱', value: 'mixing' },
        { label: '마스터링', value: 'mastering' },
        { label: '프로듀싱', value: 'producing' },
      ],
    },
    { name: 'genre', type: 'text', label: '장르' },
    { name: 'message', type: 'textarea', required: true, label: '메시지' },
    { name: 'isRead', type: 'checkbox', defaultValue: false, label: '읽음' },
  ],
}
