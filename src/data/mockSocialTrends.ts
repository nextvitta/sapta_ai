import { SocialTrendTopic, ViralFeedPost } from '../types';

export const SOCIAL_TREND_TOPICS: SocialTrendTopic[] = [
  {
    id: 'trend-1',
    hashtag: '#WisataTanaTidung',
    platform: 'TikTok',
    mentionsCount: 28450,
    growthPercent: 42.8,
    sentimentPositive: 88,
    sentimentNeutral: 9,
    sentimentNegative: 3,
    isHot: true,
    relatedDestination: 'Semua Destinasi KTT'
  },
  {
    id: 'trend-2',
    hashtag: '#AirTerjunRian',
    platform: 'Instagram',
    mentionsCount: 19820,
    growthPercent: 35.4,
    sentimentPositive: 91,
    sentimentNeutral: 7,
    sentimentNegative: 2,
    isHot: true,
    relatedDestination: 'Air Terjun Rian'
  },
  {
    id: 'trend-3',
    hashtag: '#SusurSungaiSesayap',
    platform: 'TikTok',
    mentionsCount: 14200,
    growthPercent: 61.2,
    sentimentPositive: 84,
    sentimentNeutral: 12,
    sentimentNegative: 4,
    isHot: true,
    relatedDestination: 'Dermaga Tideng Pale'
  },
  {
    id: 'trend-4',
    hashtag: '#BatuDowokKTT',
    platform: 'Instagram',
    mentionsCount: 8900,
    growthPercent: 24.1,
    sentimentPositive: 89,
    sentimentNeutral: 9,
    sentimentNegative: 2,
    isHot: false,
    relatedDestination: 'Situs Upau Bumi Batu Dowok'
  },
  {
    id: 'trend-5',
    hashtag: '#PesonaMurukRian',
    platform: 'X/Twitter',
    mentionsCount: 6540,
    growthPercent: 18.5,
    sentimentPositive: 82,
    sentimentNeutral: 14,
    sentimentNegative: 4,
    isHot: false,
    relatedDestination: 'Muruk Rian'
  },
  {
    id: 'trend-6',
    hashtag: '#KulinerIkanSesayap',
    platform: 'TikTok',
    mentionsCount: 11300,
    growthPercent: 52.0,
    sentimentPositive: 94,
    sentimentNeutral: 5,
    sentimentNegative: 1,
    isHot: true,
    relatedDestination: 'Kuliner Tideng Pale'
  },
  {
    id: 'trend-7',
    hashtag: '#ExploreKaltara2026',
    platform: 'Instagram',
    mentionsCount: 45600,
    growthPercent: 29.7,
    sentimentPositive: 86,
    sentimentNeutral: 11,
    sentimentNegative: 3,
    isHot: true,
    relatedDestination: 'Lintas Kaltara'
  }
];

export const VIRAL_FEED_POSTS: ViralFeedPost[] = [
  {
    id: 'post-1',
    author: 'Rian Adventure Kaltara',
    username: '@rian_wildtrip',
    platform: 'TikTok',
    content: 'Sensasi mandi di air dingin segar Air Terjun Rian tingkat 3! Suasananya hening banget di tengah hutan rimba Tana Tidung 🌿🌊 Wajib ke sini pas akhir pekan!',
    likes: 42100,
    shares: 8420,
    comments: 1350,
    timeAgo: '2 jam yang lalu',
    destinationTag: 'Air Terjun Rian',
    thumbnailUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
    sentiment: 'positive'
  },
  {
    id: 'post-2',
    author: 'Jelajah Borneo Official',
    username: '@jelajahborneo.id',
    platform: 'Instagram',
    content: 'Golden hour di Dermaga Wisata Tideng Pale! Sunset di atas Sungai Sesayap emang ga pernah gagal. Apalagi sambil nyicipin ikan patin bakar khas Upau Bumi 🌅✨',
    likes: 28900,
    shares: 3150,
    comments: 890,
    timeAgo: '4 jam yang lalu',
    destinationTag: 'Wisata Susur Sungai Tideng Pale',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    sentiment: 'positive'
  },
  {
    id: 'post-3',
    author: 'Kaltara Traveler',
    username: '@kaltaratravel',
    platform: 'TikTok',
    content: 'Penampakan tebing magis Upau Bumi Batu Dowok. Katanya batuan ini terbentuk jutaan tahun lalu dan menyimpan kisah legenda adat Dayak Belusu. Magis dan adem banget! 🪨🍃',
    likes: 19400,
    shares: 2430,
    comments: 520,
    timeAgo: '6 jam yang lalu',
    destinationTag: 'Situs Upau Bumi Batu Dowok',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=600&q=80',
    sentiment: 'positive'
  },
  {
    id: 'post-4',
    author: 'Info Warga Tana Tidung',
    username: '@infowarga_ktt',
    platform: 'X/Twitter',
    content: 'Update cuaca Sungai Sesayap: debit air terpantau agak deras sore ini. Pengunjung susur perahu ketinting diimbau tetap kenakan pelampung ya kawan-kawan! Utamakan keselamatan 🙏 #KTTAlert',
    likes: 3400,
    shares: 1200,
    comments: 180,
    timeAgo: '7 jam yang lalu',
    destinationTag: 'Wisata Susur Sungai Tideng Pale',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    sentiment: 'suggestion'
  },
  {
    id: 'post-5',
    author: 'Ekowisata Indonesia',
    username: '@ekowisata_id',
    platform: 'Instagram',
    content: 'Melihat bekantan bermain bebas di pucuk pohon bakau Ekowisata Mangrove Belayan Sengkuang Tana Tidung. Konservasi pesisirnya patut diacungi jempol! 🐒🌱',
    likes: 15600,
    shares: 1890,
    comments: 430,
    timeAgo: '12 jam yang lalu',
    destinationTag: 'Ekowisata Mangrove Belayan Sengkuang',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80',
    sentiment: 'positive'
  }
];
