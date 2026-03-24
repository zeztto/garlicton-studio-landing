import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '사이트 설정',
  fields: [
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'tagline_ko', type: 'text', label: '태그라인 (한국어)', defaultValue: '더 멀리, 더 깊이있게' },
    { name: 'tagline_en', type: 'text', label: 'Tagline (English)', defaultValue: 'Further and Deeper' },
    { name: 'subtitle_ko', type: 'textarea', label: '서브카피 (한국어)', defaultValue: '음악에 쏟아부은 시간과 노력은 결코 헛되지 않으며,\n의미 있는 결과로 이어진다고 생각합니다.\n아티스트의 비전을 현실로 만들고,\n미래로 나아갈 수 있도록 함께 돕겠습니다.' },
    { name: 'subtitle_en', type: 'textarea', label: 'Subtitle (English)', defaultValue: 'The time and effort you pour into music is never in vain—\nit leads to meaningful results.\nWe help turn your artistic vision into reality\nand move forward into the future together.' },
    { name: 'phone', type: 'text', defaultValue: '0507-1313-6843' },
    { name: 'email', type: 'email' },
    { name: 'address_ko', type: 'text', defaultValue: '인천 강화군 강화읍 북문길67번길 8-1' },
    { name: 'address_en', type: 'text', defaultValue: '8-1, Bukmun-gil 67beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon' },
    { name: 'instagramUrl', type: 'text', defaultValue: 'https://www.instagram.com/garlicton_studio' },
    { name: 'kakaoChannelUrl', type: 'text', label: '카카오 채널 URL (보류)' },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle_ko', type: 'text', defaultValue: '갈릭톤 스튜디오 | 메탈 음악 전문 레코딩 스튜디오' },
        { name: 'metaTitle_en', type: 'text', defaultValue: 'Garlicton Studio | Metal Music Recording Studio' },
        { name: 'metaDescription_ko', type: 'textarea', defaultValue: '메탈 음악 전문 레코딩, 믹싱, 마스터링, 프로듀싱 스튜디오. 15년 이상의 경력을 가진 전문 엔지니어가 함께합니다.' },
        { name: 'metaDescription_en', type: 'textarea', defaultValue: 'Professional metal music recording, mixing, mastering, and producing studio with 15+ years of industry experience.' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
