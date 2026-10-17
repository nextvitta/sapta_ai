import { Destination } from '../types';
import { GOOGLE_PLACES_DATABASE } from './googlePlacesDatabase';

const RAW_DESTINATIONS: Destination[] = [
  {
    id: 'dest-rian-waterfall',
    name: 'Air Terjun Rian (Gunung Rian)',
    kecamatan: 'Muruk Rian',
    category: 'Alam',
    lat: 3.5184,
    lng: 117.0652,
    description: 'Ikon pariwisata alam Kabupaten Tana Tidung berupa air terjun alami bertingkat tujuh dengan air jernih pegunungan di kawasan hutan lindung Gunung Rian. Dilengkapi jembatan pandang dan jalur treking rimba.',
    openingHours: '07:30 - 17:30 WITA',
    ticketPrice: 10000,
    maxCapacity: 450,
    currentVisitors: 312,
    status: 'NORMAL',
    imageUrl: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
    facilities: ['Area Parkir', 'Gazebo Istirahat', 'Toilet & Musholla', 'Pos P3K', 'Warung Kuliner Lokal', 'Jembatan Pandang'],
    contactPerson: 'Pokdarwis Gunung Rian (0812-5432-8891)',
    isPopular: true,
    sensors: {
      crowdSensor: {
        active: true,
        currentDensityPercent: 69,
        thresholdPercent: 85,
        status: 'NORMAL',
        liveDetectionCount: 312
      },
      waterLevelSensor: {
        active: true,
        currentLevelMeter: 1.85,
        normalLevelMeter: 1.60,
        warningLevelMeter: 2.80,
        dangerLevelMeter: 3.80,
        status: 'AMAN',
        locationName: 'Hulu Sungai Rian'
      },
      landslideSensor: {
        active: true,
        tiltAngleDegree: 1.2,
        vibrationMm: 0.18,
        status: 'NORMAL',
        locationName: 'Lereng Bukit Tingkat 4'
      },
      airQualitySensor: {
        active: true,
        aqi: 22,
        pm25: 5.4,
        status: 'BAIK'
      },
      wasteSensor: {
        active: true,
        stationName: 'TPS 1 Gerbang & Pujasera Rimba',
        capacityKg: 400,
        currentLoadKg: 328,
        fillLevelPercent: 82,
        status: 'HAMPIR_PENUH',
        lastEmptiedTime: 'Hari ini, 06:30 WITA',
        collectionSchedule: 'Rutin Pagi (08:00) & Sore (16:30 WITA)',
        methanePpm: 12.4,
        temperatureCelsius: 29.8,
        isDispatched: false
      }
    }
  },
  {
    id: 'dest-batu-dowok',
    name: 'Situs Upau Bumi Batu Dowok',
    kecamatan: 'Sesayap',
    category: 'Budaya & Adat',
    lat: 3.5652,
    lng: 116.9405,
    description: 'Situs cagar budaya dan formasi batuan purba sakral yang memiliki nilai historis spiritual tinggi bagi masyarakat adat Tidung dan Dayak Belusu. Menawarkan pemandangan lembah hijau dan relief batuan alami.',
    openingHours: '08:00 - 18:00 WITA',
    ticketPrice: 7500,
    maxCapacity: 300,
    currentVisitors: 145,
    status: 'NORMAL',
    imageUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80',
    facilities: ['Pusat Informasi Budaya', 'Panggung Adat', 'Jalur Pejalan Kaki', 'Spot Foto Tebing'],
    contactPerson: 'Lembaga Adat Tana Tidung (0821-4478-1920)',
    isPopular: true,
    sensors: {
      crowdSensor: {
        active: true,
        currentDensityPercent: 48,
        thresholdPercent: 80,
        status: 'NORMAL',
        liveDetectionCount: 145
      },
      landslideSensor: {
        active: true,
        tiltAngleDegree: 0.8,
        vibrationMm: 0.08,
        status: 'NORMAL',
        locationName: 'Tebing Curam Batu Sakral'
      },
      airQualitySensor: {
        active: true,
        aqi: 25,
        pm25: 6.2,
        status: 'BAIK'
      },
      wasteSensor: {
        active: true,
        stationName: 'TPS Zona Balai Pertemuan Adat',
        capacityKg: 200,
        currentLoadKg: 52,
        fillLevelPercent: 26,
        status: 'NORMAL',
        lastEmptiedTime: 'Kemarin, 17:00 WITA',
        collectionSchedule: '2 Hari Sekali (09:00 WITA)',
        methanePpm: 4.2,
        temperatureCelsius: 28.1,
        isDispatched: false
      }
    }
  },
  {
    id: 'dest-susur-sungai',
    name: 'Wisata Susur Sungai & Dermaga Tideng Pale',
    kecamatan: 'Sesayap',
    category: 'Bahari & Sungai',
    lat: 3.5548,
    lng: 116.9845,
    description: 'Pusat wisata waterfront dan susur Sungai Sesayap menggunakan perahu ketinting dan perahu wisata. Menikmati panorama matahari terbenam di bantaran sungai terbesar di Tana Tidung dan sentra kuliner ikan patin bakar.',
    openingHours: '06:00 - 22:00 WITA',
    ticketPrice: 5000,
    maxCapacity: 600,
    currentVisitors: 485,
    status: 'WASPADA',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    facilities: ['Dermaga Wisata Apung', 'Pusat Kuliner Tepi Sungai', 'Penyewaan Life Jacket', 'Lampu Penerangan Solar Cell', 'Wifi Publik'],
    contactPerson: 'Dinas Pariwisata KTT & Koperasi Speedboat (0852-1100-3344)',
    isPopular: true,
    sensors: {
      crowdSensor: {
        active: true,
        currentDensityPercent: 81,
        thresholdPercent: 85,
        status: 'WARNING',
        liveDetectionCount: 485
      },
      waterLevelSensor: {
        active: true,
        currentLevelMeter: 4.35,
        normalLevelMeter: 3.20,
        warningLevelMeter: 4.80,
        dangerLevelMeter: 6.00,
        status: 'WASPADA',
        locationName: 'Stasiun Hidrometri DAS Sesayap'
      },
      airQualitySensor: {
        active: true,
        aqi: 34,
        pm25: 8.9,
        status: 'BAIK'
      },
      wasteSensor: {
        active: true,
        stationName: 'TPS Terpadu Waterfront & Sentra Kuliner Patin',
        capacityKg: 600,
        currentLoadKg: 552,
        fillLevelPercent: 92,
        status: 'PENUH',
        lastEmptiedTime: 'Pagi ini, 07:10 WITA',
        collectionSchedule: 'Setiap 4 Jam saat Padat Pengunjung',
        methanePpm: 24.5,
        temperatureCelsius: 32.2,
        isDispatched: false
      }
    }
  },
  {
    id: 'dest-mangrove-sengkuang',
    name: 'Ekowisata Mangrove Belayan Sengkuang',
    kecamatan: 'Sesayap Hilir',
    category: 'Ekowisata',
    lat: 3.6350,
    lng: 117.1850,
    description: 'Hutan mangrove pesisir seluas puluhan hektar dengan boardwalk kayu ulin sepanjang 800 meter. Habitat alami primata endemik bekantan (Nasalis larvatus) dan beragam burung air khas estuari Kalimantan.',
    openingHours: '08:00 - 17:00 WITA',
    ticketPrice: 10000,
    maxCapacity: 350,
    currentVisitors: 198,
    status: 'NORMAL',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
    facilities: ['Boardwalk Kayu Ulin', 'Menara Pandang Burung', 'Pusat Edukasi Mangrove', 'Kano Sewa'],
    contactPerson: 'Kelompok Pengelola Hutan Lindung Belayan (0813-8822-7711)',
    isPopular: true,
    sensors: {
      crowdSensor: {
        active: true,
        currentDensityPercent: 56,
        thresholdPercent: 80,
        status: 'NORMAL',
        liveDetectionCount: 198
      },
      waterLevelSensor: {
        active: true,
        currentLevelMeter: 1.10,
        normalLevelMeter: 0.90,
        warningLevelMeter: 2.10,
        dangerLevelMeter: 2.90,
        status: 'AMAN',
        locationName: 'Kanal Muara Sengkuang'
      },
      airQualitySensor: {
        active: true,
        aqi: 18,
        pm25: 4.1,
        status: 'BAIK'
      },
      wasteSensor: {
        active: true,
        stationName: 'TPS 3R Dermaga Boardwalk Sengkuang',
        capacityKg: 300,
        currentLoadKg: 120,
        fillLevelPercent: 40,
        status: 'NORMAL',
        lastEmptiedTime: 'Hari ini, 08:30 WITA',
        collectionSchedule: 'Harian Sore (16:00 WITA)',
        methanePpm: 6.2,
        temperatureCelsius: 27.9,
        isDispatched: false
      }
    }
  },
  {
    id: 'dest-gunung-beliyun',
    name: 'Puncak Wisata Alam Gunung Beliyun',
    kecamatan: 'Betayau',
    category: 'Alam',
    lat: 3.4852,
    lng: 116.8904,
    description: 'Kawasan perbukitan dengan titik tertinggi yang menyuguhkan pemandangan lautan awan pagi hari dan kanopi hijau hutan tropis Kabupaten Tana Tidung. Favorit bagi penggemar fotografi landscape dan camping ground.',
    openingHours: 'Buka 24 Jam (Camping)',
    ticketPrice: 15000,
    maxCapacity: 250,
    currentVisitors: 87,
    status: 'NORMAL',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    facilities: ['Area Camping Ground', 'Penyewaan Tenda', 'Pos Petugas Jagawana', 'Sumber Air Bersih Alami'],
    contactPerson: 'Komunitas Pecinta Alam Beliyun (0857-3311-9900)',
    sensors: {
      crowdSensor: {
        active: true,
        currentDensityPercent: 35,
        thresholdPercent: 75,
        status: 'NORMAL',
        liveDetectionCount: 87
      },
      landslideSensor: {
        active: true,
        tiltAngleDegree: 1.4,
        vibrationMm: 0.22,
        status: 'NORMAL',
        locationName: 'Tebing Puncak Sunrise'
      },
      airQualitySensor: {
        active: true,
        aqi: 15,
        pm25: 3.5,
        status: 'BAIK'
      },
      wasteSensor: {
        active: true,
        stationName: 'TPS Shelter Basecamp Beliyun',
        capacityKg: 200,
        currentLoadKg: 148,
        fillLevelPercent: 74,
        status: 'HAMPIR_PENUH',
        lastEmptiedTime: 'Kemarin, 15:45 WITA',
        collectionSchedule: 'Rutin Setiap Hari Libur & Akhir Pekan',
        methanePpm: 8.8,
        temperatureCelsius: 26.5,
        isDispatched: false
      }
    }
  },
  {
    id: 'dest-pantai-tanah-merah',
    name: 'Pantai Pasir Putih & Ekowisata Tana Lia',
    kecamatan: 'Tana Lia',
    category: 'Bahari & Sungai',
    lat: 3.6952,
    lng: 117.3204,
    description: 'Destinasi bahari pesisir di Kecamatan Tana Lia yang menghadap langsung ke Selat Makassar. Menawarkan hamparan pantai berpasir bersih, pohon kelapa rindang, dan pusat penangkaran penyu lokal.',
    openingHours: '07:00 - 18:30 WITA',
    ticketPrice: 10000,
    maxCapacity: 500,
    currentVisitors: 210,
    status: 'NORMAL',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    facilities: ['Pondok Wisata Pantai', 'Kantin Ikan Segar', 'Dermaga Speedboat Antar Pulau', 'Toilet Bilas'],
    contactPerson: 'Pengelola Wisata Bahari Tana Lia (0822-9901-4455)',
    sensors: {
      crowdSensor: {
        active: true,
        currentDensityPercent: 42,
        thresholdPercent: 80,
        status: 'NORMAL',
        liveDetectionCount: 210
      },
      waterLevelSensor: {
        active: true,
        currentLevelMeter: 1.40,
        normalLevelMeter: 1.20,
        warningLevelMeter: 2.70,
        dangerLevelMeter: 3.50,
        status: 'AMAN',
        locationName: 'Pesisir Pantai Tana Lia'
      },
      airQualitySensor: {
        active: true,
        aqi: 20,
        pm25: 4.8,
        status: 'BAIK'
      },
      wasteSensor: {
        active: true,
        stationName: 'TPS Pesisir Gazebo & Spot Kuliner Tana Lia',
        capacityKg: 500,
        currentLoadKg: 385,
        fillLevelPercent: 77,
        status: 'HAMPIR_PENUH',
        lastEmptiedTime: 'Hari ini, 07:45 WITA',
        collectionSchedule: 'Harian Pagi (08:30 WITA)',
        methanePpm: 11.2,
        temperatureCelsius: 30.1,
        isDispatched: false
      }
    }
  },
  {
    id: 'dest-desa-adat-kujau',
    name: 'Desa Wisata Adat Belusu Kujau & Baloy Mayo',
    kecamatan: 'Betayau',
    category: 'Budaya & Adat',
    lat: 3.4450,
    lng: 116.8200,
    description: 'Desa wisata budaya yang melestarikan arsitektur rumah adat Baloy Mayo suku Dayak Belusu. Pengunjung dapat menyaksikan upacara adat Ilau, belajar menganyam kerajinan manik rotan, serta mencicipi kuliner kulou tradisional.',
    openingHours: '08:30 - 17:00 WITA',
    ticketPrice: 10000,
    maxCapacity: 350,
    currentVisitors: 164,
    status: 'NORMAL',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    facilities: ['Rumah Adat Baloy Mayo', 'Sanggar Tari Tradisional', 'Galeri Cinderamata Kerajinan', 'Homestay Warga'],
    contactPerson: 'Ketua Adat Kujau (0852-7711-2299)',
    sensors: {
      crowdSensor: {
        active: true,
        currentDensityPercent: 47,
        thresholdPercent: 80,
        status: 'NORMAL',
        liveDetectionCount: 164
      },
      airQualitySensor: {
        active: true,
        aqi: 24,
        pm25: 5.7,
        status: 'BAIK'
      },
      wasteSensor: {
        active: true,
        stationName: 'TPS Kompos Organik Baloy Mayo',
        capacityKg: 250,
        currentLoadKg: 85,
        fillLevelPercent: 34,
        status: 'NORMAL',
        lastEmptiedTime: 'Kemarin, 16:00 WITA',
        collectionSchedule: '3 Hari Sekali untuk Pemilahan Pupuk Kompos',
        methanePpm: 5.1,
        temperatureCelsius: 28.6,
        isDispatched: false
      }
    }
  },
  {
    id: 'dest-makam-selimatu',
    name: 'Situs Religi & Makam Bersejarah Selimatu',
    kecamatan: 'Sesayap Hilir',
    category: 'Religi',
    lat: 3.6105,
    lng: 117.1205,
    description: 'Kompleks pemakaman leluhur Kesultanan Tidung yang berlokasi di Selimatu, menjadi destinasi ziarah sejarah keislaman dan peradaban maritim Tana Tidung masa lampau.',
    openingHours: '07:00 - 18:00 WITA',
    ticketPrice: 5000,
    maxCapacity: 200,
    currentVisitors: 62,
    status: 'NORMAL',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    facilities: ['Musholla Peziarah', 'Pendopo Taklim', 'Gazebo Teduh', 'Buku Panduan Silsilah'],
    contactPerson: 'Yayasan Ziarah Selimatu (0813-9000-2211)',
    sensors: {
      crowdSensor: {
        active: true,
        currentDensityPercent: 31,
        thresholdPercent: 75,
        status: 'NORMAL',
        liveDetectionCount: 62
      },
      airQualitySensor: {
        active: true,
        aqi: 21,
        pm25: 5.0,
        status: 'BAIK'
      },
      wasteSensor: {
        active: true,
        stationName: 'TPS Peziarah Makam Selimatu',
        capacityKg: 200,
        currentLoadKg: 42,
        fillLevelPercent: 21,
        status: 'NORMAL',
        lastEmptiedTime: 'Hari ini, 07:00 WITA',
        collectionSchedule: 'Harian Pagi (07:30 WITA)',
        methanePpm: 3.8,
        temperatureCelsius: 27.5,
        isDispatched: false
      }
    }
  }
];

export const INITIAL_DESTINATIONS: Destination[] = RAW_DESTINATIONS.map(dest => {
  const googleData = GOOGLE_PLACES_DATABASE[dest.id];
  return {
    ...dest,
    googlePlaceId: googleData?.placeId,
    googlePlacesData: googleData
  };
});
