import type { CollectionConfig } from 'payload'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: '문의', plural: '문의' },
  admin: {
    group: '📬 문의',
    description: '사이트를 통해 접수된 문의 목록입니다. 운영자는 기본적으로 읽음 상태만 변경하고 원본 문의 내용은 수정하지 않는 흐름을 권장합니다.',
    useAsTitle: 'name',
    defaultColumns: ['createdAt', 'name', 'email', 'services', 'isRead'],
    hideAPIURL: true,
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'name', type: 'text', required: true, label: '이름', admin: { readOnly: true } },
    { name: 'email', type: 'email', required: true, label: '이메일', admin: { readOnly: true } },
    { name: 'phone', type: 'text', label: '전화번호', admin: { readOnly: true } },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      label: '관심 서비스',
      admin: {
        readOnly: true,
      },
      options: [
        { label: '레코딩', value: 'recording' },
        { label: '믹싱', value: 'mixing' },
        { label: '마스터링', value: 'mastering' },
        { label: '프로듀싱', value: 'producing' },
      ],
    },
    { name: 'genre', type: 'text', label: '장르', admin: { readOnly: true } },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: '메시지',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      label: '읽음',
      admin: {
        description: '원본 문의는 수정하지 않고 확인 여부만 기록하세요.',
      },
    },
  ],
}
