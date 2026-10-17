export type Kecamatan = 'Sesayap' | 'Sesayap Hilir' | 'Betayau' | 'Tana Lia' | 'Muruk Rian';

export type DestinationCategory = 'Alam' | 'Budaya & Adat' | 'Ekowisata' | 'Bahari & Sungai' | 'Religi' | 'Kuliner & Wisata Kota';

export type DestinationStatus = 'NORMAL' | 'WASPADA' | 'PENUH' | 'BAHAYA';

export interface DestinationSensors {
  crowdSensor: {
    active: boolean;
    currentDensityPercent: number;
    thresholdPercent: number;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    liveDetectionCount: number;
  };
  waterLevelSensor?: {
    active: boolean;
    currentLevelMeter: number;
    normalLevelMeter: number;
    warningLevelMeter: number;
    dangerLevelMeter: number;
    status: 'AMAN' | 'WASPADA' | 'BAHAYA';
    locationName: string;
  };
  landslideSensor?: {
    active: boolean;
    tiltAngleDegree: number;
    vibrationMm: number;
    status: 'NORMAL' | 'WASPADA';
    locationName: string;
  };
  airQualitySensor?: {
    active: boolean;
    aqi: number;
    pm25: number;
    status: 'BAIK' | 'SEDANG' | 'TIDAK_SEHAT';
  };
  wasteSensor?: {
    active: boolean;
    stationName: string;
    capacityKg: number;
    currentLoadKg: number;
    fillLevelPercent: number;
    status: 'NORMAL' | 'HAMPIR_PENUH' | 'PENUH';
    lastEmptiedTime?: string;
    collectionSchedule?: string;
    methanePpm?: number;
    temperatureCelsius?: number;
    isDispatched?: boolean;
    dispatchedAt?: string;
  };
}

export interface GooglePlaceReview {
  id?: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  relativePublishTimeDescription: string;
  text: string;
}

export interface GooglePlaceData {
  placeId?: string;
  displayName: string;
  rating: number;
  userRatingCount: number;
  googleMapsUri: string;
  reviews: GooglePlaceReview[];
  source: 'google_places_api_live' | 'verified_database';
}

export interface Destination {
  id: string;
  name: string;
  kecamatan: Kecamatan;
  category: DestinationCategory;
  lat: number;
  lng: number;
  description: string;
  openingHours: string;
  ticketPrice: number;
  maxCapacity: number;
  currentVisitors: number;
  status: DestinationStatus;
  imageUrl: string;
  sensors: DestinationSensors;
  facilities: string[];
  contactPerson?: string;
  isPopular?: boolean;
  googlePlaceId?: string;
  googlePlacesData?: GooglePlaceData;
}

export type TimeGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type VisitorChartType = 'bar' | 'line';

export interface VisitorHistoryLog {
  id: string;
  destId: string;
  destName: string;
  timestamp: string; // ISO 8601
  timeFormatted: string; // HH:mm:ss WITA
  dateFormatted: string; // YYYY-MM-DD
  type: 'in' | 'out';
  amount: number;
  totalAfter: number;
  capacityPercent: number;
  channel: string; // e.g. 'Turnstile Otomatis', 'Pintu Masuk Utama', 'Manual Tiket', 'Sensors Gate'
  note?: string;
}

export interface VisitorAggregatedDataPoint {
  periodLabel: string;
  periodTimestamp: string;
  inCount: number;
  outCount: number;
  netCount: number;
  occupancyPercent: number;
}

export interface KaltaraRegencyWisnusData {
  regency: string;
  isFocus: boolean;
  tripsCount: number;
  percentageShare: number;
  growthPercent?: number;
  rank: number;
  monthlySampleJune2026?: number;
  monthlySampleMay2026?: number;
  monthly?: Record<string, number>;
}

export interface BpsMpdSummary {
  periodYear: number;
  tableTitle: string;
  tableCode: string;
  sourceUrl: string;
  totalWisnus: number;
  totalWisman: number;
  growthPercent: number;
  avgLengthOfStayDays: number;
  avgSpendingIdr: number;
  totalKaltaraWisnus: number;
  kaltaraRegenciesComparison: KaltaraRegencyWisnusData[];
  monthlyData: {
    month: string;
    wisnus: number;
    wisman: number;
    mpdEvents: number;
  }[];
  originProvinces: {
    region: string;
    percentage: number;
    visitorCount: number;
  }[];
  transportationDistribution: {
    mode: string;
    description: string;
    percentage: number;
  }[];
  purposeDistribution: {
    purpose: string;
    percentage: number;
  }[];
}

export interface SocialTrendTopic {
  id: string;
  hashtag: string;
  platform: 'TikTok' | 'Instagram' | 'X/Twitter' | 'Facebook';
  mentionsCount: number;
  growthPercent: number;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentNegative: number;
  isHot: boolean;
  relatedDestination: string;
}

export interface ViralFeedPost {
  id: string;
  author: string;
  username: string;
  platform: 'TikTok' | 'Instagram' | 'X/Twitter' | 'YouTube' | 'GoogleNews';
  content: string;
  likes: number;
  shares: number;
  comments: number;
  timeAgo: string;
  destinationTag: string;
  thumbnailUrl: string;
  sentiment: 'positive' | 'neutral' | 'suggestion';
  sourceUrl?: string;
  youtubeId?: string;
  isRealLive?: boolean;
}

export interface RealTimeSocialFeedItem {
  id: string;
  title: string;
  content: string;
  author: string;
  platform: 'GoogleNews' | 'YouTube' | 'TikTok' | 'Instagram' | 'X/Twitter';
  url: string;
  publishedAt: string;
  timeAgo: string;
  mediaUrl?: string;
  youtubeVideoId?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  sentiment: 'positive' | 'neutral' | 'suggestion';
  category: 'Wisata' | 'Event/Budaya' | 'Kuliner' | 'Aksesibilitas' | 'Inovasi';
  isRealLive: boolean;
  destinationTag?: string;
}

export interface SocialApiStatus {
  googleNews: { connected: boolean; source: string; statusText: string };
  youTube: { connected: boolean; hasKey: boolean; source: string; statusText: string };
  twitter: { connected: boolean; hasKey: boolean; statusText: string };
  metaInstagram: { connected: boolean; hasKey: boolean; statusText: string };
  tikTok: { connected: boolean; hasKey: boolean; statusText: string };
}

export interface AirQualityIndicator {
  aqi: number;
  category: 'Baik' | 'Sedang' | 'Tidak Sehat (Sensitif)' | 'Tidak Sehat' | 'Sangat Tidak Sehat' | 'Berbahaya';
  textColor: string;
  borderColor: string;
  bgColor: string;
  pm25: number;
  pm10?: number;
  co?: number;
  no2?: number;
  o3?: number;
  summary: string;
  healthRecommendation: string;
}

export interface WeatherDayForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  conditionText: string;
  tempMax: number;
  tempMin: number;
  rainProbability: number;
  rainSumMm: number;
  windSpeedMax: number;
  airQuality?: {
    aqi: number;
    category: string;
    textColor: string;
    bgColor: string;
    pm25?: number;
  };
}

export interface WeatherData {
  temp: number;
  apparentTemp: number;
  humidity: number;
  weatherCode: number;
  conditionText: string;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  rainNow: number;
  updatedAt: string;
  location: string;
  forecast: WeatherDayForecast[];
  warningAlert?: string;
  airQuality?: AirQualityIndicator;
}

export interface SensorEmergencyAlert {
  id: string;
  destinationId: string;
  destinationName: string;
  type: 'CROWD_CONTROL' | 'FLOOD_EWS' | 'LANDSLIDE_EWS' | 'WEATHER_DISASTER';
  level: 'WASPADA' | 'BAHAYA' | 'KRITIS';
  timestamp: string;
  message: string;
  recommendedAction: string;
  resolved: boolean;
}
