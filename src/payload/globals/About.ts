import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: '엔지니어 소개',
  admin: {
    group: '📄 콘텐츠',
    description: '엔지니어 소개 섹션의 프로필, 소개글, 경력을 관리합니다.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name_ko',
          type: 'text',
          required: true,
          label: '이름 (한국어)',
          defaultValue: '이주희',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'name_en',
          type: 'text',
          required: true,
          label: 'Name (English)',
          defaultValue: 'Lee Ju Hee',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'title_ko',
          type: 'text',
          label: '직함 (한국어)',
          defaultValue: 'Founder / Producer / Mixer / Mastering Engineer',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'title_en',
          type: 'text',
          label: 'Title (English)',
          defaultValue: 'Founder / Producer / Mixer / Mastering Engineer',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      label: '프로필 사진',
      admin: {
        description: '소개 섹션 좌측 상단 원형 이미지로 사용됩니다.',
      },
    },
    {
      name: 'bio_ko',
      type: 'richText',
      label: '소개글 (한국어)',
      admin: {
        description: '경력 타임라인 위에 노출되는 소개글입니다. 비워두면 경력만 표시됩니다.',
      },
    },
    {
      name: 'bio_en',
      type: 'richText',
      label: 'Bio (English)',
      admin: {
        description: '영문 소개글입니다. 비워두면 한국어 소개가 fallback 되지 않고 타임라인만 표시됩니다.',
      },
    },
    {
      name: 'career',
      type: 'array',
      label: '경력',
      admin: {
        description: '연도순 주요 작업 이력입니다. 한국대중음악상 수상/노미네이트 문구가 있으면 강조됩니다.',
      },
      fields: [
        { name: 'period', type: 'text', label: '기간' },
        { name: 'description_ko', type: 'text', label: '내용 (한국어)' },
        { name: 'description_en', type: 'text', label: 'Description (English)' },
      ],
    },
  ],
}
