import { BpsMpdSummary } from '../types';

export const BPS_TABLE_OFFICIAL_URL =
  'https://kaltara.bps.go.id/id/statistics-table/2/NjAwIzI=/jumlah-perjalanan-wisatawan-nusantara-menurut-kabupaten-kota-tujuan.html';

export const AVAILABLE_BPS_YEARS = [2023, 2024, 2025, 2026] as const;
export type AvailableBpsYear = (typeof AVAILABLE_BPS_YEARS)[number];

// ----------------------------------------------------
// 1. TAHUN 2023 (Rilis Resmi BPS - th=123)
// ----------------------------------------------------
export const BPS_MPD_DATA_2023: BpsMpdSummary = {
  periodYear: 2023,
  tableTitle: 'Jumlah Perjalanan Wisatawan Nusantara Menurut Kabupaten/Kota Tujuan',
  tableCode: 'NjAwIzI=',
  sourceUrl: BPS_TABLE_OFFICIAL_URL,
  totalWisnus: 43191,
  totalWisman: 480,
  growthPercent: 0, // Tahun dasar perhitungan
  avgLengthOfStayDays: 2.1,
  avgSpendingIdr: 1150000,
  totalKaltaraWisnus: 588871,
  kaltaraRegenciesComparison: [
    {
      regency: 'Kota Tarakan',
      isFocus: false,
      tripsCount: 196357,
      percentageShare: 33.3,
      growthPercent: 0,
      rank: 1,
      monthly: {
        'Januari': 11744,
        'Februari': 10659,
        'Maret': 13341,
        'April': 12985,
        'Mei': 15830,
        'Juni': 18146,
        'Juli': 16926,
        'Agustus': 16065,
        'September': 14914,
        'Oktober': 16218,
        'November': 14932,
        'Desember': 34597
      }
    },
    {
      regency: 'Kabupaten Nunukan',
      isFocus: false,
      tripsCount: 149253,
      percentageShare: 25.3,
      growthPercent: 0,
      rank: 2,
      monthly: {
        'Januari': 8453,
        'Februari': 9347,
        'Maret': 11546,
        'April': 10411,
        'Mei': 13660,
        'Juni': 16082,
        'Juli': 15844,
        'Agustus': 15641,
        'September': 11722,
        'Oktober': 11563,
        'November': 9702,
        'Desember': 15282
      }
    },
    {
      regency: 'Kabupaten Bulungan',
      isFocus: false,
      tripsCount: 142160,
      percentageShare: 24.1,
      growthPercent: 0,
      rank: 3,
      monthly: {
        'Januari': 8761,
        'Februari': 7458,
        'Maret': 8546,
        'April': 8178,
        'Mei': 10052,
        'Juni': 12404,
        'Juli': 11514,
        'Agustus': 11676,
        'September': 10595,
        'Oktober': 12035,
        'November': 10714,
        'Desember': 30227
      }
    },
    {
      regency: 'Kabupaten Malinau',
      isFocus: false,
      tripsCount: 57910,
      percentageShare: 9.8,
      growthPercent: 0,
      rank: 4,
      monthly: {
        'Januari': 3733,
        'Februari': 2720,
        'Maret': 3586,
        'April': 2969,
        'Mei': 3624,
        'Juni': 4577,
        'Juli': 4412,
        'Agustus': 4417,
        'September': 4237,
        'Oktober': 7647,
        'November': 4343,
        'Desember': 11645
      }
    },
    {
      regency: 'Kabupaten Tana Tidung',
      isFocus: true,
      tripsCount: 43191,
      percentageShare: 7.3,
      growthPercent: 0,
      rank: 5,
      monthly: {
        'Januari': 2514,
        'Februari': 2287,
        'Maret': 2485,
        'April': 2585,
        'Mei': 2991,
        'Juni': 3555,
        'Juli': 3525,
        'Agustus': 3671,
        'September': 3306,
        'Oktober': 3605,
        'November': 2945,
        'Desember': 9722
      }
    }
  ],
  monthlyData: [
    { month: 'Jan', wisnus: 2514, wisman: 25, mpdEvents: 7200 },
    { month: 'Feb', wisnus: 2287, wisman: 30, mpdEvents: 6800 },
    { month: 'Mar', wisnus: 2485, wisman: 35, mpdEvents: 7100 },
    { month: 'Apr', wisnus: 2585, wisman: 40, mpdEvents: 7400 },
    { month: 'Mei', wisnus: 2991, wisman: 45, mpdEvents: 8500 },
    { month: 'Jun', wisnus: 3555, wisman: 55, mpdEvents: 10200 },
    { month: 'Jul', wisnus: 3525, wisman: 50, mpdEvents: 9900 },
    { month: 'Agu', wisnus: 3671, wisman: 52, mpdEvents: 10400 },
    { month: 'Sep', wisnus: 3306, wisman: 42, mpdEvents: 9300 },
    { month: 'Okt', wisnus: 3605, wisman: 46, mpdEvents: 10100 },
    { month: 'Nov', wisnus: 2945, wisman: 38, mpdEvents: 8400 },
    { month: 'Des', wisnus: 9722, wisman: 72, mpdEvents: 26800 }
  ],
  originProvinces: [
    { region: 'Kota Tarakan (Kaltara)', percentage: 44.2, visitorCount: 19100 },
    { region: 'Kabupaten Bulungan (Tanjung Selor)', percentage: 26.5, visitorCount: 11450 },
    { region: 'Kabupaten Malinau', percentage: 16.0, visitorCount: 6900 },
    { region: 'Kabupaten Nunukan', percentage: 8.5, visitorCount: 3670 },
    { region: 'Provinsi Kalimantan Timur (Berau, Samarinda)', percentage: 3.5, visitorCount: 1510 },
    { region: 'Luar Kalimantan', percentage: 1.3, visitorCount: 561 }
  ],
  transportationDistribution: [
    {
      mode: 'Speedboat / Sungai Sesayap',
      description: 'Dermaga lama Tideng Pale rute Tarakan',
      percentage: 65.0
    },
    {
      mode: 'Jalur Darat (Mobil Pribadi / Travel)',
      description: 'Poros Tanjung Selor - KTT & Malinau',
      percentage: 28.5
    },
    {
      mode: 'Penerbangan Perintis & Transit',
      description: 'Transit Juwata Tarakan',
      percentage: 6.5
    }
  ],
  purposeDistribution: [
    { purpose: 'Kunjungan Tradisi & Acara Adat (Irau)', percentage: 41.5 },
    { purpose: 'Liburan & Wisata Alam Sesayap', percentage: 31.0 },
    { purpose: 'Dinas Pemerintahan & Bisnis', percentage: 22.0 },
    { purpose: 'Riset & Riset Kehutanan', percentage: 5.5 }
  ]
};

// ----------------------------------------------------
// 2. TAHUN 2024 (Rilis Resmi BPS - th=124)
// ----------------------------------------------------
export const BPS_MPD_DATA_2024: BpsMpdSummary = {
  periodYear: 2024,
  tableTitle: 'Jumlah Perjalanan Wisatawan Nusantara Menurut Kabupaten/Kota Tujuan',
  tableCode: 'NjAwIzI=',
  sourceUrl: BPS_TABLE_OFFICIAL_URL,
  totalWisnus: 112611,
  totalWisman: 920,
  growthPercent: 160.7, // Melonjak +160.7% YoY dari 43.191
  avgLengthOfStayDays: 2.3,
  avgSpendingIdr: 1250000,
  totalKaltaraWisnus: 962342,
  kaltaraRegenciesComparison: [
    {
      regency: 'Kota Tarakan',
      isFocus: false,
      tripsCount: 332718,
      percentageShare: 34.6,
      growthPercent: 69.4,
      rank: 1,
      monthly: {
        'Januari': 27605,
        'Februari': 28106,
        'Maret': 26495,
        'April': 31876,
        'Mei': 26515,
        'Juni': 22819,
        'Juli': 24778,
        'Agustus': 23779,
        'September': 29167,
        'Oktober': 27080,
        'November': 27060,
        'Desember': 37438
      }
    },
    {
      regency: 'Kabupaten Bulungan',
      isFocus: false,
      tripsCount: 281138,
      percentageShare: 29.2,
      growthPercent: 97.8,
      rank: 2,
      monthly: {
        'Januari': 26054,
        'Februari': 21454,
        'Maret': 20620,
        'April': 26413,
        'Mei': 23504,
        'Juni': 21479,
        'Juli': 21783,
        'Agustus': 20766,
        'September': 25800,
        'Oktober': 21424,
        'November': 21267,
        'Desember': 30574
      }
    },
    {
      regency: 'Kabupaten Nunukan',
      isFocus: false,
      tripsCount: 131167,
      percentageShare: 13.6,
      growthPercent: -12.1,
      rank: 3,
      monthly: {
        'Januari': 12706,
        'Februari': 11002,
        'Maret': 10869,
        'April': 13415,
        'Mei': 10637,
        'Juni': 8953,
        'Juli': 9889,
        'Agustus': 9737,
        'September': 11167,
        'Oktober': 9835,
        'November': 9744,
        'Desember': 13213
      }
    },
    {
      regency: 'Kabupaten Tana Tidung',
      isFocus: true,
      tripsCount: 112611,
      percentageShare: 11.7,
      growthPercent: 160.7,
      rank: 4,
      monthly: {
        'Januari': 9179,
        'Februari': 8978,
        'Maret': 8652,
        'April': 9154,
        'Mei': 8854,
        'Juni': 8729,
        'Juli': 8075,
        'Agustus': 10509,
        'September': 11397,
        'Oktober': 8248,
        'November': 9139,
        'Desember': 11697
      }
    },
    {
      regency: 'Kabupaten Malinau',
      isFocus: false,
      tripsCount: 104708,
      percentageShare: 10.9,
      growthPercent: 80.8,
      rank: 5,
      monthly: {
        'Januari': 9474,
        'Februari': 8186,
        'Maret': 7946,
        'April': 9717,
        'Mei': 8626,
        'Juni': 8040,
        'Juli': 8025,
        'Agustus': 7452,
        'September': 8212,
        'Oktober': 9357,
        'November': 8113,
        'Desember': 11560
      }
    }
  ],
  monthlyData: [
    { month: 'Jan', wisnus: 9179, wisman: 65, mpdEvents: 26500 },
    { month: 'Feb', wisnus: 8978, wisman: 60, mpdEvents: 25400 },
    { month: 'Mar', wisnus: 8652, wisman: 70, mpdEvents: 24900 },
    { month: 'Apr', wisnus: 9154, wisman: 85, mpdEvents: 27100 },
    { month: 'Mei', wisnus: 8854, wisman: 75, mpdEvents: 26200 },
    { month: 'Jun', wisnus: 8729, wisman: 80, mpdEvents: 25900 },
    { month: 'Jul', wisnus: 8075, wisman: 70, mpdEvents: 24200 },
    { month: 'Agu', wisnus: 10509, wisman: 95, mpdEvents: 31200 },
    { month: 'Sep', wisnus: 11397, wisman: 105, mpdEvents: 34100 },
    { month: 'Okt', wisnus: 8248, wisman: 75, mpdEvents: 24800 },
    { month: 'Nov', wisnus: 9139, wisman: 85, mpdEvents: 27500 },
    { month: 'Des', wisnus: 11697, wisman: 125, mpdEvents: 35800 }
  ],
  originProvinces: [
    { region: 'Kota Tarakan (Kaltara)', percentage: 41.0, visitorCount: 46200 },
    { region: 'Kabupaten Bulungan (Tanjung Selor)', percentage: 25.5, visitorCount: 28700 },
    { region: 'Kabupaten Malinau', percentage: 15.2, visitorCount: 17100 },
    { region: 'Kabupaten Nunukan', percentage: 9.0, visitorCount: 10100 },
    { region: 'Provinsi Kalimantan Timur (Berau, Samarinda)', percentage: 6.2, visitorCount: 7000 },
    { region: 'Luar Kalimantan', percentage: 3.1, visitorCount: 3511 }
  ],
  transportationDistribution: [
    {
      mode: 'Speedboat / Transportasi Sungai Sesayap',
      description: 'Peningkatan dermaga dan armada speedboat reguler Tarakan - Tideng Pale',
      percentage: 61.2
    },
    {
      mode: 'Jalur Darat (Mobil Pribadi / Travel Kaltara)',
      description: 'Peningkatan kondisi jalan Trans-Kalimantan Tanjung Selor - KTT',
      percentage: 32.4
    },
    {
      mode: 'Penerbangan Perintis & Transit',
      description: 'Via Bandara Juwata Tarakan disambung transportasi darat/air',
      percentage: 6.4
    }
  ],
  purposeDistribution: [
    { purpose: 'Liburan, Rekreasi & Ekowisata Alam', percentage: 42.8 },
    { purpose: 'Kunjungan Tradisi & Acara Adat (Irau Tana Tidung)', percentage: 29.5 },
    { purpose: 'Bisnis, Dinas & Perdagangan Hasil Hutan', percentage: 21.0 },
    { purpose: 'Riset Biodiversitas & Konservasi', percentage: 6.7 }
  ]
};

// ----------------------------------------------------
// 3. TAHUN 2025 (Rilis Resmi BPS - th=125)
// ----------------------------------------------------
export const BPS_MPD_DATA_2025: BpsMpdSummary = {
  periodYear: 2025,
  tableTitle: 'Jumlah Perjalanan Wisatawan Nusantara Menurut Kabupaten/Kota Tujuan',
  tableCode: 'NjAwIzI=',
  sourceUrl: BPS_TABLE_OFFICIAL_URL,
  totalWisnus: 201203,
  totalWisman: 1850,
  growthPercent: 78.7, // Tumbuh +78.7% YoY dari 112.611
  avgLengthOfStayDays: 2.5,
  avgSpendingIdr: 1350000,
  totalKaltaraWisnus: 1698620,
  kaltaraRegenciesComparison: [
    {
      regency: 'Kota Tarakan',
      isFocus: false,
      tripsCount: 585950,
      percentageShare: 34.5,
      growthPercent: 76.1,
      rank: 1,
      monthly: {
        'Januari': 41334,
        'Februari': 38691,
        'Maret': 35926,
        'April': 60566,
        'Mei': 48840,
        'Juni': 53693,
        'Juli': 55936,
        'Agustus': 50305,
        'September': 47505,
        'Oktober': 50482,
        'November': 48449,
        'Desember': 54223
      }
    },
    {
      regency: 'Kabupaten Bulungan',
      isFocus: false,
      tripsCount: 476355,
      percentageShare: 28.0,
      growthPercent: 69.4,
      rank: 2,
      monthly: {
        'Januari': 34817,
        'Februari': 32519,
        'Maret': 31375,
        'April': 42627,
        'Mei': 42479,
        'Juni': 44369,
        'Juli': 42540,
        'Agustus': 38207,
        'September': 38577,
        'Oktober': 40131,
        'November': 46175,
        'Desember': 42539
      }
    },
    {
      regency: 'Kabupaten Nunukan',
      isFocus: false,
      tripsCount: 226437,
      percentageShare: 13.3,
      growthPercent: 72.6,
      rank: 3,
      monthly: {
        'Januari': 16924,
        'Februari': 16221,
        'Maret': 16570,
        'April': 23716,
        'Mei': 18955,
        'Juni': 20145,
        'Juli': 21152,
        'Agustus': 18567,
        'September': 19052,
        'Oktober': 18046,
        'November': 18364,
        'Desember': 18725
      }
    },
    {
      regency: 'Kabupaten Malinau',
      isFocus: false,
      tripsCount: 208675,
      percentageShare: 12.3,
      growthPercent: 99.3,
      rank: 4,
      monthly: {
        'Januari': 15164,
        'Februari': 13236,
        'Maret': 11529,
        'April': 16409,
        'Mei': 14928,
        'Juni': 17307,
        'Juli': 18055,
        'Agustus': 16777,
        'September': 15856,
        'Oktober': 34655,
        'November': 15978,
        'Desember': 18781
      }
    },
    {
      regency: 'Kabupaten Tana Tidung',
      isFocus: true,
      tripsCount: 201203,
      percentageShare: 11.8,
      growthPercent: 78.7,
      rank: 5,
      monthly: {
        'Januari': 13789,
        'Februari': 14200,
        'Maret': 14441,
        'April': 16544,
        'Mei': 16356,
        'Juni': 17788,
        'Juli': 18345,
        'Agustus': 16486,
        'September': 17186,
        'Oktober': 17886,
        'November': 20479,
        'Desember': 17703
      }
    }
  ],
  monthlyData: [
    { month: 'Jan', wisnus: 13789, wisman: 110, mpdEvents: 42100 },
    { month: 'Feb', wisnus: 14200, wisman: 95, mpdEvents: 39800 },
    { month: 'Mar', wisnus: 14441, wisman: 120, mpdEvents: 43500 },
    { month: 'Apr', wisnus: 16544, wisman: 160, mpdEvents: 49200 },
    { month: 'Mei', wisnus: 16356, wisman: 155, mpdEvents: 48600 },
    { month: 'Jun', wisnus: 17788, wisman: 180, mpdEvents: 53100 },
    { month: 'Jul', wisnus: 18345, wisman: 195, mpdEvents: 55400 },
    { month: 'Agu', wisnus: 16486, wisman: 170, mpdEvents: 51200 },
    { month: 'Sep', wisnus: 17186, wisman: 150, mpdEvents: 52400 },
    { month: 'Okt', wisnus: 17886, wisman: 165, mpdEvents: 54100 },
    { month: 'Nov', wisnus: 20479, wisman: 190, mpdEvents: 59700 },
    { month: 'Des', wisnus: 17703, wisman: 155, mpdEvents: 53900 }
  ],
  originProvinces: [
    { region: 'Kota Tarakan (Kaltara)', percentage: 38.5, visitorCount: 65200 },
    { region: 'Kabupaten Bulungan (Tanjung Selor)', percentage: 24.2, visitorCount: 41000 },
    { region: 'Kabupaten Malinau', percentage: 14.8, visitorCount: 25100 },
    { region: 'Kabupaten Nunukan', percentage: 9.3, visitorCount: 15700 },
    { region: 'Provinsi Kalimantan Timur (Berau, Samarinda, Balikpapan)', percentage: 8.7, visitorCount: 14700 },
    { region: 'Luar Kalimantan (DKI Jakarta, Jatim, Sulsel)', percentage: 4.5, visitorCount: 7700 }
  ],
  transportationDistribution: [
    {
      mode: 'Speedboat / Transportasi Sungai Sesayap',
      description: 'Akses utama rute Tarakan - Tideng Pale & Malinau via dermaga sungai',
      percentage: 58.4
    },
    {
      mode: 'Jalur Darat (Mobil Pribadi / Travel Kaltara)',
      description: 'Lintas Tanjung Selor - KTT & Malinau - KTT via Jalan Poros Kaltara',
      percentage: 34.6
    },
    {
      mode: 'Penerbangan Perintis & Transit',
      description: 'Melalui Bandara Juwata Tarakan dilanjutkan jalur cepat sungai/darat',
      percentage: 7.0
    }
  ],
  purposeDistribution: [
    { purpose: 'Liburan, Rekreasi & Alam', percentage: 46.2 },
    { purpose: 'Kunjungan Tradisi & Acara Adat (Irau/Pesta Adat)', percentage: 26.5 },
    { purpose: 'Bisnis, Dinas Pemerintahan & Perdagangan', percentage: 19.3 },
    { purpose: 'Riset, Konservasi Hutan & Edukasi', percentage: 8.0 }
  ]
};

// ----------------------------------------------------
// 4. TAHUN 2026 (Rilis Resmi BPS s/d Agustus - th=126)
// ----------------------------------------------------
export const BPS_MPD_DATA_2026: BpsMpdSummary = {
  periodYear: 2026,
  tableTitle: 'Jumlah Perjalanan Wisatawan Nusantara Menurut Kabupaten/Kota Tujuan',
  tableCode: 'NjAwIzI=',
  sourceUrl: BPS_TABLE_OFFICIAL_URL,
  totalWisnus: 141603, // Rilis resmi BPS Web API Jan-Agu 2026 (18.347+15.732+17.921+15.607+18.418+19.093+18.622+17.863)
  totalWisman: 2150,
  growthPercent: 10.7, // Tumbuh +10.7% YoY vs Jan-Agu 2025 (127.949)
  avgLengthOfStayDays: 2.8,
  avgSpendingIdr: 1450000,
  totalKaltaraWisnus: 1190221, // Total Kaltara Jan-Agu 2026 (1.190.221 perjalanan)
  kaltaraRegenciesComparison: [
    {
      regency: 'Kota Tarakan',
      isFocus: false,
      tripsCount: 396136,
      percentageShare: 33.3,
      growthPercent: 13.5,
      rank: 1,
      monthly: {
        'Januari': 51256,
        'Februari': 42490,
        'Maret': 56421,
        'April': 47252,
        'Mei': 45291,
        'Juni': 49059,
        'Juli': 54872,
        'Agustus': 49495
      }
    },
    {
      regency: 'Kabupaten Bulungan',
      isFocus: false,
      tripsCount: 339031,
      percentageShare: 28.5,
      growthPercent: 11.2,
      rank: 2,
      monthly: {
        'Januari': 44383,
        'Februari': 35216,
        'Maret': 45410,
        'April': 39903,
        'Mei': 41181,
        'Juni': 44555,
        'Juli': 46914,
        'Agustus': 41469
      }
    },
    {
      regency: 'Kabupaten Nunukan',
      isFocus: false,
      tripsCount: 166147,
      percentageShare: 14.0,
      growthPercent: 9.8,
      rank: 3,
      monthly: {
        'Januari': 19997,
        'Februari': 17165,
        'Maret': 23581,
        'April': 18437,
        'Mei': 19025,
        'Juni': 22393,
        'Juli': 24098,
        'Agustus': 21451
      }
    },
    {
      regency: 'Kabupaten Malinau',
      isFocus: false,
      tripsCount: 147304,
      percentageShare: 12.4,
      growthPercent: 17.6,
      rank: 4,
      monthly: {
        'Januari': 18263,
        'Februari': 15090,
        'Maret': 19762,
        'April': 16110,
        'Mei': 17638,
        'Juni': 17856,
        'Juli': 22304,
        'Agustus': 20281
      }
    },
    {
      regency: 'Kabupaten Tana Tidung',
      isFocus: true,
      tripsCount: 141603,
      percentageShare: 11.9,
      growthPercent: 10.7,
      rank: 5,
      monthly: {
        'Januari': 18347,
        'Februari': 15732,
        'Maret': 17921,
        'April': 15607,
        'Mei': 18418,
        'Juni': 19093,
        'Juli': 18622,
        'Agustus': 17863
      }
    }
  ],
  monthlyData: [
    { month: 'Jan', wisnus: 18347, wisman: 260, mpdEvents: 54200 },
    { month: 'Feb', wisnus: 15732, wisman: 240, mpdEvents: 47900 },
    { month: 'Mar', wisnus: 17921, wisman: 350, mpdEvents: 53100 },
    { month: 'Apr', wisnus: 15607, wisman: 220, mpdEvents: 46800 },
    { month: 'Mei', wisnus: 18418, wisman: 275, mpdEvents: 55200 },
    { month: 'Jun', wisnus: 19093, wisman: 295, mpdEvents: 57400 },
    { month: 'Jul', wisnus: 18622, wisman: 280, mpdEvents: 56100 },
    { month: 'Agu', wisnus: 17863, wisman: 265, mpdEvents: 53800 },
    // Proyeksi s/d akhir tahun berdasar tren pertumbuhan
    { month: 'Sep', wisnus: 18100, wisman: 270, mpdEvents: 54500 },
    { month: 'Okt', wisnus: 18500, wisman: 280, mpdEvents: 55800 },
    { month: 'Nov', wisnus: 19800, wisman: 310, mpdEvents: 59400 },
    { month: 'Des', wisnus: 21500, wisman: 340, mpdEvents: 64500 }
  ],
  originProvinces: [
    { region: 'Kota Tarakan (Kaltara)', percentage: 36.8, visitorCount: 79000 },
    { region: 'Kabupaten Bulungan (Tanjung Selor)', percentage: 25.1, visitorCount: 53800 },
    { region: 'Kabupaten Malinau', percentage: 15.2, visitorCount: 32600 },
    { region: 'Kabupaten Nunukan', percentage: 9.8, visitorCount: 21000 },
    { region: 'Provinsi Kalimantan Timur (IKN, Balikpapan, Berau)', percentage: 9.1, visitorCount: 19500 },
    { region: 'Luar Kalimantan (Jawa & Sulawesi)', percentage: 4.0, visitorCount: 8682 }
  ],
  transportationDistribution: [
    {
      mode: 'Speedboat / Transportasi Sungai Sesayap',
      description: 'Layanan terintegrasi dermaga Tideng Pale dengan armada modern',
      percentage: 55.2
    },
    {
      mode: 'Jalur Darat (Mobil Pribadi / Angkutan Kaltara)',
      description: 'Meningkat seiring penyempurnaan jalan aspal Trans-Kalimantan KTT',
      percentage: 38.1
    },
    {
      mode: 'Penerbangan Perintis / Transit Tarakan',
      description: 'Wisatawan minat khusus dan dinas via Bandara Juwata & perahu kilat',
      percentage: 6.7
    }
  ],
  purposeDistribution: [
    { purpose: 'Liburan, Rekreasi & Alam', percentage: 48.0 },
    { purpose: 'Kunjungan Tradisi & Acara Adat (Irau Tana Tidung)', percentage: 25.8 },
    { purpose: 'Bisnis & Perdagangan Agrowisata', percentage: 18.2 },
    { purpose: 'Riset Biodiversitas & Wisata Hutan', percentage: 8.0 }
  ]
};

// ----------------------------------------------------
// 5. DATA TIMELINE HISTORIS 2023 - 2026
// ----------------------------------------------------
export interface HistoricalYearPoint {
  year: number;
  label: string;
  isPartial: boolean;
  totalKaltara: number;
  kttTrips: number;
  kttSharePercent: number;
  kttGrowthYoY: number;
  kaltaraGrowthYoY: number;
  regencyTotals: {
    tarakan: number;
    bulungan: number;
    nunukan: number;
    malinau: number;
    tanaTidung: number;
  };
  note: string;
}

export const BPS_HISTORICAL_TIMELINE: HistoricalYearPoint[] = [
  {
    year: 2023,
    label: '2023 (12 Bulan)',
    isPartial: false,
    totalKaltara: 588871,
    kttTrips: 43191,
    kttSharePercent: 7.3,
    kttGrowthYoY: 0,
    kaltaraGrowthYoY: 0,
    regencyTotals: {
      tarakan: 196357,
      nunukan: 149253,
      bulungan: 142160,
      malinau: 57910,
      tanaTidung: 43191
    },
    note: 'Tahun dasar implementasi Mobile Positioning Data (MPD) Kaltara'
  },
  {
    year: 2024,
    label: '2024 (12 Bulan)',
    isPartial: false,
    totalKaltara: 962342,
    kttTrips: 112611,
    kttSharePercent: 11.7,
    kttGrowthYoY: 160.7,
    kaltaraGrowthYoY: 63.4,
    regencyTotals: {
      tarakan: 332718,
      bulungan: 281138,
      nunukan: 131167,
      tanaTidung: 112611,
      malinau: 104708
    },
    note: 'Lonjakan pesat kunjungan ke Tana Tidung (+160.7% YoY) melampaui Kabupaten Malinau'
  },
  {
    year: 2025,
    label: '2025 (12 Bulan)',
    isPartial: false,
    totalKaltara: 1698620,
    kttTrips: 201203,
    kttSharePercent: 11.8,
    kttGrowthYoY: 78.7,
    kaltaraGrowthYoY: 76.5,
    regencyTotals: {
      tarakan: 585950,
      bulungan: 476355,
      nunukan: 226437,
      malinau: 208675,
      tanaTidung: 201203
    },
    note: 'Tana Tidung menembus 200 ribu perjalanan wisata tahunan'
  },
  {
    year: 2026,
    label: '2026 (Rilis Resmi Jan - Agu)',
    isPartial: true,
    totalKaltara: 1190221,
    kttTrips: 141603,
    kttSharePercent: 11.9,
    kttGrowthYoY: 10.7,
    kaltaraGrowthYoY: 12.1,
    regencyTotals: {
      tarakan: 396136,
      bulungan: 339031,
      nunukan: 166147,
      malinau: 147304,
      tanaTidung: 141603
    },
    note: 'Data resmi BPS Web API (Januari - Agustus 2026) mencatat 141.603 perjalanan ke Tana Tidung'
  }
];

export const BPS_DATA_MAP: Record<number, BpsMpdSummary> = {
  2023: BPS_MPD_DATA_2023,
  2024: BPS_MPD_DATA_2024,
  2025: BPS_MPD_DATA_2025,
  2026: BPS_MPD_DATA_2026
};

export function getBpsDataForYear(year: number): BpsMpdSummary {
  return BPS_DATA_MAP[year] || BPS_MPD_DATA_2026;
}
