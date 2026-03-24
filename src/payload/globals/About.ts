import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: '엔지니어 소개',
  admin: {
    group: '📄 콘텐츠',
  },
  fields: [
    { name: 'name_ko', type: 'text', required: true, label: '이름 (한국어)', defaultValue: '이주희' },
    { name: 'name_en', type: 'text', required: true, label: 'Name (English)', defaultValue: 'Lee Ju Hee' },
    { name: 'title_ko', type: 'text', label: '직함 (한국어)', defaultValue: 'Founder / Producer / Mixer / Mastering Engineer' },
    { name: 'title_en', type: 'text', label: 'Title (English)', defaultValue: 'Founder / Producer / Mixer / Mastering Engineer' },
    { name: 'bio_ko', type: 'richText', label: '소개글 (한국어)' },
    { name: 'bio_en', type: 'richText', label: 'Bio (English)' },
    { name: 'profileImage', type: 'upload', relationTo: 'media', label: '프로필 사진' },
    {
      name: 'career',
      type: 'array',
      label: '경력',
      fields: [
        { name: 'period', type: 'text', label: '기간' },
        { name: 'description_ko', type: 'text', label: '내용 (한국어)' },
        { name: 'description_en', type: 'text', label: 'Description (English)' },
      ],
    },
  ],
}
