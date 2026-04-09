import type { GlobalBeforeValidateHook, GlobalConfig } from 'payload'
import {
  clampNumber,
  normalizeEmailDisplay,
  normalizeExternalUrl,
  normalizeOptionalHref,
  normalizeSectionOrder,
} from '../../lib/payload-admin.ts'
import { buildHomePreviewURL } from '../../lib/preview.ts'

const localizedTextField = (
  name: string,
  label: string,
  defaultKo: string,
  defaultEn: string,
) => ([
  {
    name: `${name}_ko`,
    type: 'text' as const,
    label: `${label} (한국어)`,
    defaultValue: defaultKo,
  },
  {
    name: `${name}_en`,
    type: 'text' as const,
    label: `${label} (English)`,
    defaultValue: defaultEn,
  },
])

const localizedTextareaField = (
  name: string,
  label: string,
  defaultKo: string,
  defaultEn: string,
) => ([
  {
    name: `${name}_ko`,
    type: 'textarea' as const,
    label: `${label} (한국어)`,
    defaultValue: defaultKo,
  },
  {
    name: `${name}_en`,
    type: 'textarea' as const,
    label: `${label} (English)`,
    defaultValue: defaultEn,
  },
])

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '사이트 설정',
  admin: {
    group: '⚙️ 설정',
    description: '홈페이지 구조, 연락처, 메타데이터를 한 곳에서 관리합니다. 저장 후 preview/live preview로 실제 노출 상태를 바로 확인할 수 있습니다.',
    hideAPIURL: true,
    preview: (_, { locale }) => buildHomePreviewURL({ locale }),
    livePreview: {
      url: ({ locale }) => buildHomePreviewURL({ locale: locale.code }),
    },
  },
  hooks: {
    beforeValidate: [
      (({ data }) => {
        const nextData = { ...data }

        if (nextData.homepageLayout && typeof nextData.homepageLayout === 'object') {
          const homepageLayout = { ...nextData.homepageLayout } as Record<string, unknown>
          homepageLayout.sectionOrder = normalizeSectionOrder(
            Array.isArray(homepageLayout.sectionOrder)
              ? (homepageLayout.sectionOrder as Array<{ section?: null | string } | null>)
              : undefined,
          )
          nextData.homepageLayout = homepageLayout
        }

        if (nextData.hero && typeof nextData.hero === 'object') {
          const hero = { ...nextData.hero } as Record<string, unknown>
          hero.ctaHref = normalizeOptionalHref(hero.ctaHref, '#contact')
          nextData.hero = hero
        }

        if (nextData.contact && typeof nextData.contact === 'object') {
          const contact = { ...nextData.contact } as Record<string, unknown>
          contact.instagramUrl = normalizeExternalUrl(contact.instagramUrl)
          contact.kakaoChannelUrl = normalizeExternalUrl(contact.kakaoChannelUrl)
          contact.emailDisplay = normalizeEmailDisplay(contact.emailDisplay, contact.email)
          contact.mapLatitude = clampNumber(contact.mapLatitude, 37.752179, -90, 90)
          contact.mapLongitude = clampNumber(contact.mapLongitude, 126.48305, -180, 180)
          nextData.contact = contact
        }

        if (nextData.pagesIndex && typeof nextData.pagesIndex === 'object') {
          const pagesIndex = { ...nextData.pagesIndex } as Record<string, unknown>
          pagesIndex.href = normalizeOptionalHref(pagesIndex.href, '/pages')
          nextData.pagesIndex = pagesIndex
        }

        return nextData
      }) as GlobalBeforeValidateHook,
    ],
  },
  lockDocuments: {
    duration: 300,
  },
  fields: [
    // 헤더
    {
      name: 'header',
      type: 'group',
      label: '헤더',
      fields: [
        { name: 'siteName', type: 'text', label: '사이트 이름', defaultValue: 'GARLICTON RECORDING STUDIO' },
        { name: 'logo', type: 'upload', relationTo: 'media', label: '로고 이미지 (선택)' },
      ],
    },
    {
      name: 'navigation',
      type: 'group',
      label: '네비게이션',
      admin: {
        description: '홈페이지 상단 메뉴 라벨을 제어합니다.',
      },
      fields: [
        ...localizedTextField('aboutLabel', '소개 섹션 네비게이션 라벨', '소개', 'About'),
        ...localizedTextField('servicesLabel', '서비스 섹션 네비게이션 라벨', '서비스', 'Services'),
        ...localizedTextField('portfolioLabel', '포트폴리오 섹션 네비게이션 라벨', '포트폴리오', 'Portfolio'),
        ...localizedTextField('studioLabel', '스튜디오 섹션 네비게이션 라벨', '스튜디오', 'Studio'),
        ...localizedTextField('contactLabel', '연락처 섹션 네비게이션 라벨', '연락처', 'Contact'),
      ],
    },
    {
      name: 'homepageLayout',
      type: 'group',
      label: '홈페이지 구성',
      admin: {
        description: '메인 페이지 섹션 순서와 노출 구성을 관리합니다.',
      },
      fields: [
        {
          name: 'sectionOrder',
          type: 'array',
          label: '섹션 순서',
          admin: {
            description: 'Hero를 포함한 홈페이지 섹션의 노출 순서를 제어합니다.',
          },
          defaultValue: [
            { section: 'hero' },
            { section: 'services' },
            { section: 'about' },
            { section: 'portfolio' },
            { section: 'studio' },
            { section: 'contact' },
          ],
          fields: [
            {
              name: 'section',
              type: 'select',
              required: true,
              label: '섹션',
              options: [
                { label: 'Hero', value: 'hero' },
                { label: 'Services', value: 'services' },
                { label: 'About', value: 'about' },
                { label: 'Portfolio', value: 'portfolio' },
                { label: 'Studio', value: 'studio' },
                { label: 'Contact', value: 'contact' },
              ],
            },
          ],
        },
      ],
    },
    // 히어로
    {
      name: 'hero',
      type: 'group',
      label: '히어로 섹션',
      fields: [
        { name: 'visible', type: 'checkbox', label: '노출', defaultValue: true },
        { name: 'background', type: 'upload', relationTo: 'media', label: '배경 이미지' },
        ...localizedTextField('titlePrimary', '메인 타이틀 1행', 'Garlicton', 'Garlicton'),
        ...localizedTextField('titleSecondary', '메인 타이틀 2행', 'Recording Studio', 'Recording Studio'),
        { name: 'tagline_ko', type: 'text', label: '태그라인 (한국어)', defaultValue: '더 멀리, 더 깊이있게' },
        { name: 'tagline_en', type: 'text', label: 'Tagline (English)', defaultValue: 'Further and Deeper' },
        ...localizedTextareaField(
          'intro',
          '인트로 문장',
          '보컬 레코딩부터 악기 녹음, 믹싱, 마스터링까지 음악 제작의 전 여정을 함께합니다.',
          'From vocal and instrument recording to mixing and mastering — we walk the entire journey of music production with you.',
        ),
        { name: 'subtitle_ko', type: 'textarea', label: '서브카피 (한국어)', defaultValue: '음악에 쏟아부은 시간과 노력은 결코 헛되지 않으며,\n의미 있는 결과로 이어진다고 생각합니다.\n아티스트의 비전을 현실로 만들고,\n미래로 나아갈 수 있도록 함께 돕겠습니다.' },
        { name: 'subtitle_en', type: 'textarea', label: 'Subtitle (English)', defaultValue: 'The time and effort poured into music is never in vain—\nit leads to meaningful results.\nWe help turn artistic vision into reality\nand move forward into the future together.' },
        ...localizedTextareaField(
          'philosophy',
          '철학 문장',
          '거창하지 않아도 괜찮습니다. 중요한 건 당신의 음악이 제대로 표현되는 것입니다.',
          "It doesn't have to be grand. What matters is that your music is expressed the way it deserves.",
        ),
        ...localizedTextField('ctaLabel', 'CTA 버튼 문구', '문의하기', 'Get in Touch'),
        { name: 'ctaHref', type: 'text', label: 'CTA 링크', defaultValue: '#contact' },
      ],
    },
    {
      name: 'servicesSection',
      type: 'group',
      label: '서비스 섹션',
      fields: [
        { name: 'visible', type: 'checkbox', label: '노출', defaultValue: true },
        ...localizedTextField('eyebrow', '섹션 상단 라벨', 'Services', 'Services'),
        ...localizedTextField('title', '섹션 제목', '작업 프로세스', 'Our Process'),
        ...localizedTextareaField(
          'subtitle',
          '섹션 설명',
          '음원은 아티스트의 열정이 담긴 창이며, 곧 미래를 설계하는 일입니다.',
          "A recorded work is a window into the artist's passion—and an act of designing the future.",
        ),
      ],
    },
    {
      name: 'aboutSection',
      type: 'group',
      label: '소개 섹션',
      fields: [
        { name: 'visible', type: 'checkbox', label: '노출', defaultValue: true },
        ...localizedTextField('eyebrow', '섹션 상단 라벨', 'Garlicton', 'Garlicton'),
        ...localizedTextField('title', '섹션 제목', 'The Staff', 'The Staff'),
        ...localizedTextareaField('subtitle', '섹션 설명', '최고의 테이크가 최고의 결과물을 만든다.', 'The best take creates the best result.'),
        ...localizedTextField('experienceLabel', '경력 라벨', '15년 이상의 메탈 음악 산업 경력', '15+ years in the metal music industry'),
        ...localizedTextareaField(
          'accompany',
          '보조 설명',
          '경험 많은 엔지니어가 세션의 시작부터 최종 마스터까지 전 과정을 함께합니다.',
          'An experienced engineer accompanies you from the first session to the final master.',
        ),
        ...localizedTextField('winsLabel', '수상 라벨', '수상', 'Wins'),
        ...localizedTextField('nominationsLabel', '노미네이트 라벨', '노미네이트', 'Nominations'),
      ],
    },
    {
      name: 'portfolioSection',
      type: 'group',
      label: '포트폴리오 섹션',
      fields: [
        { name: 'visible', type: 'checkbox', label: '노출', defaultValue: true },
        ...localizedTextField('eyebrow', '섹션 상단 라벨', 'Portfolio', 'Portfolio'),
        ...localizedTextField('title', '섹션 제목', 'Works', 'Works'),
        ...localizedTextareaField('subtitle', '섹션 설명', '함께 멋진 음악을 만들어가고 싶습니다.', 'We want to create great music together.'),
        ...localizedTextField('emptyState', '비어 있을 때 문구', '포트폴리오 항목이 아직 없습니다.', 'No portfolio items yet.'),
      ],
    },
    {
      name: 'studioSection',
      type: 'group',
      label: '스튜디오 섹션',
      fields: [
        { name: 'visible', type: 'checkbox', label: '노출', defaultValue: true },
        ...localizedTextField('eyebrow', '섹션 상단 라벨', 'Studio', 'Studio'),
        ...localizedTextField('title', '섹션 제목', 'The Studio', 'The Studio'),
        ...localizedTextareaField(
          'subtitle',
          '섹션 설명',
          '더 나은 결과를 위해 함께 고민하고 도전하는 과정을 중요하게 생각합니다.',
          'We value the process of working together and pushing for better results.',
        ),
        ...localizedTextareaField(
          'overview',
          '개요',
          '갈릭톤 스튜디오는 강화도에 자리한 메탈 음악 전문 레코딩 스튜디오입니다. 보컬 레코딩부터 악기 녹음, 믹싱, 마스터링까지 음악 제작의 전 여정을 함께합니다.',
          'Garlicton Studio is a metal music recording studio located on Ganghwa Island. From vocal and instrument recording to mixing and mastering — we walk the entire journey of music production with you.',
        ),
        ...localizedTextField('authenticTitle', '특징 1 제목', '진정성 있는 사운드', 'Authentic Sound'),
        ...localizedTextareaField(
          'authenticDesc',
          '특징 1 설명',
          '메탈 음악의 본질을 이해하는 엔지니어가 날것의 에너지와 디테일을 정확하게 구현합니다.',
          'An engineer who understands the essence of metal music precisely captures raw energy and detail.',
        ),
        ...localizedTextField('comfortableTitle', '특징 2 제목', '편안한 작업 환경', 'Comfortable Environment'),
        ...localizedTextareaField(
          'comfortableDesc',
          '특징 2 설명',
          '주택형 구조의 프라이빗 공간에서 시간 압박 없이 창작에 집중할 수 있습니다.',
          'Focus on creation without time pressure in our private, house-style space.',
        ),
        ...localizedTextField('emptyState', '비어 있을 때 문구', 'CMS에서 갤러리 사진을 추가해주세요.', 'Add gallery photos from the CMS.'),
      ],
    },
    {
      name: 'contactSection',
      type: 'group',
      label: '문의 섹션',
      fields: [
        { name: 'visible', type: 'checkbox', label: '노출', defaultValue: true },
        ...localizedTextField('eyebrow', '섹션 상단 라벨', 'Contact', 'Contact'),
        ...localizedTextField('title', '섹션 제목', 'Contact Us', 'Contact Us'),
        ...localizedTextareaField('subtitle', '섹션 설명', '편하게 연락주세요.', 'Feel free to reach out.'),
        ...localizedTextareaField(
          'reservation',
          '예약 안내 문구',
          '갈릭톤 스튜디오는 100% 예약제로 운영되며 방문 전 문의가 필요합니다.',
          'Garlicton Studio operates 100% by reservation. Please inquire before visiting.',
        ),
        ...localizedTextField('phoneLabel', '전화번호 라벨', '전화번호', 'Phone'),
        ...localizedTextField('addressLabel', '주소 라벨', '주소', 'Address'),
        ...localizedTextField('emailLabel', '이메일 라벨', '이메일', 'Email'),
        ...localizedTextField('instagramLabel', 'Instagram 라벨', '인스타그램', 'Instagram'),
        ...localizedTextField('kakaoChannelLabel', '카카오 채널 라벨', '카카오 채널', 'Kakao Channel'),
      ],
    },
    {
      name: 'contactForm',
      type: 'group',
      label: '문의 폼',
      admin: {
        description: '문의 폼 라벨, placeholder, 버튼/상태 메시지를 관리합니다.',
      },
      fields: [
        ...localizedTextField('nameLabel', '이름 필드 라벨', '이름', 'Name'),
        ...localizedTextField('namePlaceholder', '이름 placeholder', '성함을 입력해주세요', 'Your name'),
        ...localizedTextField('emailLabel', '이메일 필드 라벨', '이메일', 'Email'),
        ...localizedTextField('emailPlaceholder', '이메일 placeholder', 'email@example.com', 'email@example.com'),
        ...localizedTextField('phoneLabel', '전화번호 필드 라벨', '전화번호', 'Phone'),
        ...localizedTextField('phonePlaceholder', '전화번호 placeholder', '연락 가능한 번호를 입력해주세요', 'Best phone number to reach you'),
        ...localizedTextField('servicesLabel', '서비스 필드 라벨', '원하시는 서비스', 'Services Needed'),
        ...localizedTextField('servicesPlaceholder', '서비스 필드 안내 문구', '필요한 작업을 선택해주세요', 'Select the services you need'),
        ...localizedTextField('genreLabel', '장르 필드 라벨', '장르 / 레퍼런스', 'Genre / Reference'),
        ...localizedTextField('genrePlaceholder', '장르 필드 placeholder', '작업 방향이나 참고 아티스트를 알려주세요', 'Tell us your genre or references'),
        ...localizedTextField('messageLabel', '메시지 필드 라벨', '문의 내용', 'Message'),
        ...localizedTextField('messagePlaceholder', '메시지 필드 placeholder', '프로젝트 내용과 일정, 궁금한 점을 자유롭게 남겨주세요', 'Tell us about your project, timeline, and any questions'),
        ...localizedTextField('submitLabel', '제출 버튼 문구', '문의 보내기', 'Send Inquiry'),
        ...localizedTextareaField(
          'successMessage',
          '성공 메시지',
          '문의가 접수되었습니다. 빠르게 확인 후 연락드리겠습니다.',
          'Your inquiry has been received. We will get back to you soon.',
        ),
        ...localizedTextareaField(
          'errorMessage',
          '실패 메시지',
          '전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          'Something went wrong while sending your inquiry. Please try again later.',
        ),
        ...localizedTextField('serviceRecordingLabel', '서비스 옵션: Recording', '레코딩', 'Recording'),
        ...localizedTextField('serviceMixingLabel', '서비스 옵션: Mixing', '믹싱', 'Mixing'),
        ...localizedTextField('serviceMasteringLabel', '서비스 옵션: Mastering', '마스터링', 'Mastering'),
        ...localizedTextField('serviceProducingLabel', '서비스 옵션: Producing', '프로듀싱', 'Producing'),
      ],
    },
    // 연락처 정보
    {
      name: 'contact',
      type: 'group',
      label: '연락처 정보',
      fields: [
        { name: 'phone', type: 'text', label: '전화번호', defaultValue: '0507-1313-6843' },
        { name: 'email', type: 'email', label: '이메일' },
        { name: 'emailDisplay', type: 'text', label: '이메일 표시 문구' },
        { name: 'address_ko', type: 'text', label: '주소 (한국어)', defaultValue: '인천 강화군 강화읍 북문길67번길 8-1' },
        { name: 'address_en', type: 'text', label: 'Address (English)', defaultValue: '8-1, Bukmun-gil 67beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon' },
        ...localizedTextField('mapPlaceName', '지도 장소명', '갈릭톤 스튜디오', 'Garlicton Studio'),
        { name: 'mapLatitude', type: 'number', label: '지도 위도', defaultValue: 37.752179 },
        { name: 'mapLongitude', type: 'number', label: '지도 경도', defaultValue: 126.48305 },
        ...localizedTextField('mapFallbackLabel', '지도 fallback 링크 문구', '카카오맵에서 보기', 'View on Kakao Map'),
        { name: 'instagramUrl', type: 'text', label: '인스타그램 URL', defaultValue: 'https://www.instagram.com/garlicton_studio' },
        { name: 'kakaoChannelUrl', type: 'text', label: '카카오 채널 URL (보류)' },
      ],
    },
    // 푸터
    {
      name: 'footer',
      type: 'group',
      label: '푸터',
      admin: {
        description: '푸터 소개 문구와 연락처/소셜 노출 여부를 관리합니다.',
      },
      fields: [
        { name: 'copyright_ko', type: 'text', label: '저작권 문구 (한국어)', defaultValue: '© {year} Garlicton Recording Studio. All rights reserved.' },
        { name: 'copyright_en', type: 'text', label: 'Copyright (English)', defaultValue: '© {year} Garlicton Recording Studio. All rights reserved.' },
        { name: 'location', type: 'text', label: '위치', defaultValue: 'South Korea' },
        ...localizedTextareaField(
          'description',
          '푸터 설명',
          '갈릭톤 스튜디오는 메탈 음악의 에너지와 디테일을 끝까지 책임지는 레코딩 스튜디오입니다.',
          'Garlicton Studio is a recording studio that carries the energy and detail of metal music through to the end.',
        ),
        ...localizedTextField('contactTitle', '연락처 영역 제목', 'Contact', 'Contact'),
        ...localizedTextField('phoneLabel', '전화번호 라벨', '전화번호', 'Phone'),
        ...localizedTextField('addressLabel', '주소 라벨', '주소', 'Address'),
        ...localizedTextField('emailLabel', '이메일 라벨', '이메일', 'Email'),
        ...localizedTextField('instagramLabel', 'Instagram 라벨', '인스타그램', 'Instagram'),
        ...localizedTextField('kakaoChannelLabel', '카카오 채널 라벨', '카카오 채널', 'Kakao Channel'),
        { name: 'showEmail', type: 'checkbox', label: '이메일 노출', defaultValue: true },
        { name: 'showInstagram', type: 'checkbox', label: 'Instagram 노출', defaultValue: true },
        { name: 'showKakaoChannel', type: 'checkbox', label: '카카오 채널 노출', defaultValue: false },
      ],
    },
    {
      name: 'pagesIndex',
      type: 'group',
      label: '공개 페이지 목록',
      admin: {
        description: '공개 `/[locale]/pages` 목록의 노출 문구와 navbar 링크를 제어합니다.',
      },
      fields: [
        { name: 'visible', type: 'checkbox', label: 'navbar에 노출', defaultValue: false },
        { name: 'href', type: 'text', label: '링크 경로', defaultValue: '/pages' },
        ...localizedTextField('navLabel', '네비게이션 라벨', '페이지', 'Pages'),
        ...localizedTextField('eyebrow', '상단 라벨', 'CMS', 'CMS'),
        ...localizedTextField('title', '목록 제목', '페이지', 'Pages'),
        ...localizedTextareaField(
          'subtitle',
          '목록 설명',
          '갈릭톤 스튜디오에서 발행한 CMS 페이지 목록입니다.',
          'Published CMS pages from Garlicton Studio.',
        ),
        ...localizedTextField('emptyState', '비어 있을 때 문구', '게시된 페이지가 아직 없습니다.', 'No published pages yet.'),
        ...localizedTextField('viewPageLabel', '목록 CTA 문구', '페이지 보기', 'View page'),
        ...localizedTextField('backToListLabel', '상세 복귀 링크 문구', '페이지 목록으로', 'Back to pages'),
        ...localizedTextField('publishedLabel', '게시일 라벨', '게시', 'Published'),
        ...localizedTextField('untitledFallback', '제목 fallback', '제목 없는 페이지', 'Untitled page'),
        ...localizedTextField('metaTitle', '목록 SEO 제목', '페이지 | Garlicton Studio', 'Pages | Garlicton Studio'),
        ...localizedTextareaField(
          'metaDescription',
          '목록 SEO 설명',
          '갈릭톤 스튜디오에서 발행한 CMS 페이지 목록입니다.',
          'Published CMS pages from Garlicton Studio.',
        ),
      ],
    },
    // SEO
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle_ko', type: 'text', label: '메타 제목 (한국어)', defaultValue: '갈릭톤 스튜디오 | 최고의 테이크가 최고의 결과를 만든다' },
        { name: 'metaTitle_en', type: 'text', label: 'Meta Title (English)', defaultValue: 'Garlicton Studio | The Best Take Creates the Best Result' },
        { name: 'metaDescription_ko', type: 'textarea', label: '메타 설명 (한국어)', defaultValue: '메탈 음악 전문 레코딩, 믹싱, 마스터링, 프로듀싱 스튜디오. 15년 이상의 경력을 가진 전문 엔지니어가 함께합니다.' },
        { name: 'metaDescription_en', type: 'textarea', label: 'Meta Description (English)', defaultValue: 'Professional metal music recording, mixing, mastering, and producing studio with 15+ years of industry experience.' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'OG 이미지' },
      ],
    },
  ],
}
