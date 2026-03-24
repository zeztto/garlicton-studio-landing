import type { Payload } from 'payload'

const servicesData = [
  {
    title_ko: '레코딩',
    title_en: 'Recording',
    description_ko:
      '최고의 테이크가 최고의 결과물을 만든다.\n\n모든 사운드는 철저한 녹음 과정에서 시작합니다. 녹음은 단순히 소리를 담는 과정이 아니라, 아티스트의 개성과 곡의 방향성을 명확하게 구현하는 단계입니다. 사운드의 목표를 설정하고, 곡이 전달하고자 하는 감성과 개성을 아티스트와 함께 고민하며 방향을 정합니다.\n\n이를 바탕으로 아티스트가 최상의 퍼포먼스를 발휘할 수 있도록 지원하고, 최고의 테이크를 확보하는 것이 핵심입니다. 녹음된 테이크는 정밀한 편집을 거쳐 최상의 퀄리티로 다듬습니다.',
    description_en:
      "The best take makes the best result.\n\nEvery great sound begins with a thorough recording process. Recording is not simply capturing sound—it is the stage where an artist's identity and the direction of the song are clearly realized. We set the sonic goals and work with the artist to define the emotion and character the song should convey.\n\nBased on this foundation, we support artists in delivering their best performance and securing the finest takes. Recorded takes are then refined through precise editing to achieve the highest quality.",
    icon: 'mic',
    sortOrder: 1,
  },
  {
    title_ko: '믹싱',
    title_en: 'Mixing',
    description_ko:
      '사운드에 생명을 불어넣다.\n\n믹싱 과정에서는 사운드가 더욱 정교하게 조각됩니다. 디지털과 아날로그의 장점을 결합한 하이브리드 믹싱을 통해 사운드의 질감을 살리고, 각 요소를 명확하게 부각시켜 곡의 스토리를 극대화합니다.\n\n스튜디오의 다양한 아웃보드 장비와 정밀한 디지털 프로세싱을 활용하여 강렬한 임팩트와 균형 잡힌 사운드를 완성합니다. 트랙 간의 밸런스를 최적화하고, 공간감을 조정하며, 곡이 의도하는 감정을 극대화할 수 있도록 믹스를 진행합니다.\n\n아티스트와 지속적인 피드백을 주고받으며 최상의 결과물을 만들어가는 과정을 중요하게 생각합니다.',
    description_en:
      "Breathing life into sound.\n\nDuring the mixing process, sound is sculpted with greater precision. Through hybrid mixing that combines the best of digital and analog, we bring out the texture of each sound and highlight every element to maximize the song's narrative.\n\nLeveraging diverse outboard gear and precise digital processing, we craft a powerful impact with a well-balanced sound. We optimize the balance between tracks, adjust spatial depth, and drive the mix to amplify the intended emotion of the song.\n\nWe value the process of continuous feedback with artists to achieve the best possible result.",
    icon: 'sliders-horizontal',
    sortOrder: 2,
  },
  {
    title_ko: '마스터링',
    title_en: 'Mastering',
    description_ko:
      '갈릭톤 사운드의 완성.\n\n마스터링은 작품을 최종적으로 정리하고, 다양한 환경에서도 최고의 사운드를 보장하는 단계입니다. 아날로그 아웃보드와 고급 모니터링 환경을 기반으로, 음악의 다이내믹을 유지하면서도 최대한의 사운드 임팩트를 구현하는 마스터링을 제공합니다.\n\n풀 레인지의 강력한 사운드부터 섬세한 다이내믹 컨트롤까지, 다양한 스타일에 맞춘 마스터링을 진행합니다. 다양한 환경에서도 균형 잡힌 사운드를 유지할 수 있도록 세심하게 작업합니다.\n\n최종 마스터는 DDP 파일, WAV 마스터 등 다양한 포맷으로 제공됩니다.',
    description_en:
      "The completion of the Garlicton sound.\n\nMastering is the final stage of refining the work and ensuring the best sound across all listening environments. Based on analog outboard equipment and a premium monitoring setup, we deliver mastering that maximizes sonic impact while preserving the music's dynamics.\n\nFrom powerful full-range sound to delicate dynamic control, we tailor mastering to suit various styles and ensure balanced sound across different playback environments.\n\nFinal masters are delivered in various formats including DDP files and WAV masters.",
    icon: 'disc-3',
    sortOrder: 3,
  },
  {
    title_ko: '프로듀싱',
    title_en: 'Producing',
    description_ko: '곡의 방향성부터 편곡, 사운드 디자인까지 종합적인 프로듀싱을 제공합니다.',
    description_en: 'Comprehensive producing from song direction to arrangement and sound design.',
    icon: 'music',
    sortOrder: 4,
  },
]

const portfolioData = [
  {
    title_ko: '메써드 - Definition of Method',
    title_en: 'Method - Definition of Method',
    artist: 'Method (메써드)',
    genre: 'Metal',
    description_ko: '제17회 한국대중음악상 최우수 메탈&하드코어 음반 수상',
    description_en: '17th KMA Best Metal & Hardcore Album Winner',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/ufY9hX0pyxs',
    sortOrder: 1,
  },
  {
    title_ko: '램넌츠 오브 더 폴른',
    title_en: 'Remnants of the Fallen',
    artist: 'Remnants of the Fallen (램넌츠)',
    genre: 'Metal',
    description_ko: '제14회, 제18회 한국대중음악상 수상',
    description_en: '14th & 18th KMA Winner',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/PatgDlahzb4',
    sortOrder: 2,
  },
  {
    title_ko: '킬카이저',
    title_en: 'Killkaiser',
    artist: 'Killkaiser (킬카이저)',
    genre: 'Metal',
    description_ko: '',
    description_en: '',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/ja9sQUVVolw',
    sortOrder: 3,
  },
  {
    title_ko: '도굴 - If These Bodies Could Talk',
    title_en: 'Doguul - If These Bodies Could Talk',
    artist: 'Doguul (도굴)',
    genre: 'Metal',
    description_ko: '제21회 한국대중음악상 노미네이트',
    description_en: '21st KMA Nominee',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/Brs86Po4JF0',
    sortOrder: 4,
  },
  {
    title_ko: '진격',
    title_en: 'Jingyeok',
    artist: '진격',
    genre: 'Metal',
    description_ko: '',
    description_en: '',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/zrG1jtdu9Wc',
    sortOrder: 5,
  },
  {
    title_ko: '스핏온마이툼 - Necrosis',
    title_en: 'Spit On My Tomb - Necrosis',
    artist: 'Spit On My Tomb (스핏온마이툼)',
    genre: 'Metal',
    description_ko: '제19회 한국대중음악상 노미네이트',
    description_en: '19th KMA Nominee',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/XdTJZNLoALs',
    sortOrder: 6,
  },
  {
    title_ko: '로스 오브 인펙션 - 罰錢',
    title_en: 'Loss of Infection - 罰錢 (Beoljeon)',
    artist: 'Loss of Infection (로스오브인펙션)',
    genre: 'Metal',
    description_ko: '제23회 한국대중음악상 노미네이트',
    description_en: '23rd KMA Nominee',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/Hh8wGP9h5Ns',
    sortOrder: 7,
  },
  {
    title_ko: '크랙샷',
    title_en: 'Crackshot',
    artist: 'Crackshot (크랙샷)',
    genre: 'Metal',
    description_ko: '',
    description_en: '',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/NSEzvZjcPSU',
    sortOrder: 8,
  },
  {
    title_ko: '넉아웃',
    title_en: 'Knockout',
    artist: 'Knockout (넉아웃)',
    genre: 'Metal',
    description_ko: '',
    description_en: '',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/ML61TPRldik',
    sortOrder: 9,
  },
  {
    title_ko: '김재하 - Into Ashes',
    title_en: 'Kim Jaeha - Into Ashes',
    artist: '김재하',
    genre: 'Metal',
    description_ko: '제15회 한국대중음악상 노미네이트',
    description_en: '15th KMA Nominee',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/e_Lwpjr13BM',
    sortOrder: 10,
  },
  {
    title_ko: '스테리웨이브',
    title_en: 'Steriwave',
    artist: 'Steriwave (스테리웨이브)',
    genre: 'Metal',
    description_ko: '',
    description_en: '',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/HEXQ04eDDvw',
    sortOrder: 11,
  },
  {
    title_ko: '델리움',
    title_en: 'Delirium',
    artist: 'Delirium (델리움)',
    genre: 'Metal',
    description_ko: '',
    description_en: '',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/sADflGBsyPQ',
    sortOrder: 12,
  },
  {
    title_ko: '디스럽션',
    title_en: 'Disruption',
    artist: 'Disruption (디스럽션)',
    genre: 'Metal',
    description_ko: '',
    description_en: '',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/L00gag6Af1M',
    sortOrder: 13,
  },
  {
    title_ko: '아워글라스',
    title_en: 'Hourglass',
    artist: 'Hourglass (아워글라스)',
    genre: 'Metal',
    description_ko: '',
    description_en: '',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/e5qKZockiYQ',
    sortOrder: 14,
  },
  {
    title_ko: '블랙홀 30주년 트리뷰트',
    title_en: 'Black Hole 30th Anniversary Tribute',
    artist: 'Various Artists',
    genre: 'Metal',
    description_ko: '제17회 한국대중음악상 노미네이트',
    description_en: '17th KMA Nominee',
    mediaType: 'youtube',
    embedUrl: 'https://youtu.be/xoHw69YG5b0',
    sortOrder: 15,
  },
]

export async function seed(payload: Payload): Promise<void> {
  payload.logger.info('Checking if seed data is needed...')

  // Check if services already exist
  const existingServices = await payload.find({
    collection: 'services',
    limit: 1,
  })

  if (existingServices.totalDocs > 0) {
    payload.logger.info('Seed data already exists. Skipping.')
    return
  }

  payload.logger.info('Seeding database...')

  // Seed Services
  payload.logger.info('Seeding services...')
  for (const service of servicesData) {
    await payload.create({
      collection: 'services',
      data: service,
    })
  }
  payload.logger.info(`Created ${servicesData.length} services.`)

  // Seed Portfolio
  payload.logger.info('Seeding portfolio...')
  for (const item of portfolioData) {
    await payload.create({
      collection: 'portfolio',
      data: item,
    })
  }
  payload.logger.info(`Created ${portfolioData.length} portfolio items.`)

  // Seed About global
  payload.logger.info('Seeding about global...')
  await payload.updateGlobal({
    slug: 'about',
    data: {
      name_ko: '이주희',
      name_en: 'Lee Ju Hee',
      title_ko: 'Founder / Producer / Mixer / Mastering Engineer',
      title_en: 'Founder / Producer / Mixer / Mastering Engineer',
      career: [
        {
          period: '2016',
          description_ko:
            '램넌츠오브더폴른 1집 《Shadow Walk》 마스터링 — 제14회 한국대중음악상(2017) 최우수 메탈&하드코어 음반 수상',
          description_en:
            'Remnants of the Fallen 1st Album "Shadow Walk" Mastering — 14th Korean Music Awards (2017) Best Metal & Hardcore Album Winner',
        },
        {
          period: '2017',
          description_ko:
            '기타리스트 김재하 1집 《Into Ashes》 믹싱/마스터링 — 제15회 한국대중음악상 최우수 메탈&하드코어 음반 노미네이트',
          description_en:
            'Guitarist Kim Jaeha 1st Album "Into Ashes" Mixing/Mastering — 15th KMA Best Metal & Hardcore Album Nominee',
        },
        {
          period: '2019',
          description_ko:
            '《블랙홀 트리뷰트 - RE-ENCOUNTER THE MIRACLE》 믹싱/마스터링 — 제17회 한국대중음악상(2020) 노미네이트',
          description_en:
            '"Black Hole Tribute - RE-ENCOUNTER THE MIRACLE" Mixing/Mastering — 17th KMA (2020) Nominee',
        },
        {
          period: '2019',
          description_ko:
            '메써드 5집 《Definition of Method》 믹싱 — 제17회 한국대중음악상(2020) 최우수 메탈&하드코어 음반 수상',
          description_en:
            'Method 5th Album "Definition of Method" Mixing — 17th KMA (2020) Best Metal & Hardcore Album Winner',
        },
        {
          period: '2020',
          description_ko:
            '램넌츠 오브 더 폴른 2집 《All the Wounded and Broken》 믹싱/마스터링 — 제18회 한국대중음악상(2021) 최우수 메탈&하드코어 음반 수상',
          description_en:
            'Remnants of the Fallen 2nd Album "All the Wounded and Broken" Mixing/Mastering — 18th KMA (2021) Best Metal & Hardcore Album Winner',
        },
        {
          period: '2021',
          description_ko: '스핏온마이툼 1집 《Necrosis》 믹싱/마스터링 — 제19회 한국대중음악상 노미네이트',
          description_en: 'Spit On My Tomb 1st Album "Necrosis" Mixing/Mastering — 19th KMA Nominee',
        },
        {
          period: '2023',
          description_ko:
            '도굴 EP 《If These Bodies Could Talk》 믹싱/마스터링 — 제21회 한국대중음악상 노미네이트',
          description_en:
            'Doguul EP "If These Bodies Could Talk" Mixing/Mastering — 21st KMA Nominee',
        },
        {
          period: '2025',
          description_ko:
            '로스 오브 인펙션 EP 《罰錢 (Beoljeon)》 믹싱/마스터링 — 제23회 한국대중음악상 노미네이트',
          description_en:
            'Loss of Infection EP "罰錢 (Beoljeon)" Mixing/Mastering — 23rd KMA Nominee',
        },
      ],
    },
  })
  payload.logger.info('About global seeded.')

  // Seed SiteSettings global
  payload.logger.info('Seeding site-settings global...')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      tagline_ko: '더 멀리, 더 깊이있게',
      tagline_en: 'Further and Deeper',
      subtitle_ko:
        '음악에 쏟아부은 시간과 노력은 결코 헛되지 않으며,\n의미 있는 결과로 이어진다고 생각합니다.\n아티스트의 비전을 현실로 만들고,\n미래로 나아갈 수 있도록 함께 돕겠습니다.',
      subtitle_en:
        'The time and effort poured into music is never in vain—\nit leads to meaningful results.\nWe help turn artistic vision into reality\nand move forward into the future together.',
      phone: '0507-1313-6843',
      address_ko: '인천 강화군 강화읍 북문길67번길 8-1',
      address_en: '8-1, Bukmun-gil 67beon-gil, Ganghwa-eup, Ganghwa-gun, Incheon',
      instagramUrl: 'https://www.instagram.com/garlicton_studio',
    },
  })
  payload.logger.info('SiteSettings global seeded.')

  payload.logger.info('Seeding complete.')
}
