import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: '엔지니어 소개',
  fields: [
    { name: 'name_ko', type: 'text', required: true, defaultValue: '이주희' },
    { name: 'name_en', type: 'text', required: true, defaultValue: 'Lee Ju Hee' },
    { name: 'title_ko', type: 'text', defaultValue: 'Founder / Producer / Mixer / Mastering Engineer' },
    { name: 'title_en', type: 'text', defaultValue: 'Founder / Producer / Mixer / Mastering Engineer' },
    { name: 'bio_ko', type: 'richText' },
    { name: 'bio_en', type: 'richText' },
    { name: 'profileImage', type: 'upload', relationTo: 'media' },
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
