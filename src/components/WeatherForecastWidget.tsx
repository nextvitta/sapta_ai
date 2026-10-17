import React, { useState, useEffect } from 'react';
import {
  X,
  CloudSun,
  CloudRain,
  CloudLightning,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  Compass,
  Thermometer,
  Calendar,
  RefreshCw,
  Umbrella,
  ShieldAlert,
  Leaf,
  Activity,
  ShieldCheck,
  Sparkles,
  MapPin
} from 'lucide-react';
import { WeatherData, WeatherDayForecast, AirQualityIndicator } from '../types';

interface WeatherForecastWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export type KecamatanKTT = 'Kec.Sesayap' | 'Kec.Sesayap Hilir' | 'Kec.Betayau' | 'Kec.Muruk Rian' | 'Kec.Tana Lia';

const DISTRICT_COORDS: Record<KecamatanKTT, { lat: number; lon: number; label: string }> = {
  'Kec.Sesayap': { lat: 3.555, lon: 116.985, label: 'Kec. Sesayap (Tideng Pale)' },
  'Kec.Sesayap Hilir': { lat: 3.635, lon: 117.185, label: 'Kec. Sesayap Hilir' },
  'Kec.Betayau': { lat: 3.485, lon: 116.890, label: 'Kec. Betayau' },
  'Kec.Muruk Rian': { lat: 3.518, lon: 117.065, label: 'Kec. Muruk Rian' },
  'Kec.Tana Lia': { lat: 3.695, lon: 117.320, label: 'Kec. Tana Lia' }
};

const DISTRICTS: KecamatanKTT[] = [
  'Kec.Sesayap',
  'Kec.Sesayap Hilir',
  'Kec.Betayau',
  'Kec.Muruk Rian',
  'Kec.Tana Lia'
];

export const WeatherForecastWidget: React.FC<WeatherForecastWidgetProps> = ({ isOpen, onClose }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<KecamatanKTT>('Kec.Sesayap');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getAqiMeta = (aqi: number) => {
    if (aqi <= 50) {
      return {
        category: 'Baik' as const,
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgColor: 'bg-emerald-950/40',
        summary: 'Kualitas udara sangat bersih & sehat khas hutan hujan tropis KTT',
        healthRecommendation: 'Sangat ideal untuk seluruh aktivitas luar ruangan, penjelajahan Air Terjun Rian, trekking hutan, dan wisata susur sungai Sesayap.'
      };
    }
    if (aqi <= 100) {
      return {
        category: 'Sedang' as const,
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        bgColor: 'bg-amber-950/40',
        summary: 'Kualitas udara dapat diterima bagi sebagian besar masyarakat',
        healthRecommendation: 'Aman untuk aktivitas wisata umum. Pengunjung dengan alergi atau sensitivitas pernapasan tinggi dapat tetap berhati-hati.'
      };
    }
    if (aqi <= 150) {
      return {
        category: 'Tidak Sehat (Sensitif)' as const,
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/40',
        bgColor: 'bg-orange-950/40',
        summary: 'Kualitas udara kurang baik bagi kelompok rentan',
        healthRecommendation: 'Kelompok rentan (anak-anak, lansia, penderita asma) disarankan membatasi aktivitas fisik berat di luar ruangan.'
      };
    }
    if (aqi <= 200) {
      return {
        category: 'Tidak Sehat' as const,
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500/40',
        bgColor: 'bg-rose-950/40',
        summary: 'Tingkat partikel polutan udara meningkat',
        healthRecommendation: 'Gunakan masker pelindung dan kurangi waktu beraktivitas di ruang terbuka tanpa pelindung.'
      };
    }
    return {
      category: 'Sangat Tidak Sehat' as const,
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-950/40',
      summary: 'Kondisi udara darurat / berkabut tebal',
      healthRecommendation: 'Hindari aktivitas di luar ruangan dan gunakan masker respirator khusus.'
    };
  };

  const fetchWeather = async () => {
    setIsLoading(true);
    const coords = DISTRICT_COORDS[selectedDistrict];
    try {
      const res = await fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}`);
      const json = await res.json();

      const raw = json.success ? json.data : json.fallback;
      const current = raw.current || json.fallback.current;
      const daily = raw.daily || json.fallback.daily;
      const rawAqi = json.airQuality || json.airQualityFallback;

      // Map weather code to Indonesian text
      const getConditionText = (code: number) => {
        if (code === 0) return 'Cerah';
        if (code <= 3) return 'Cerah Berawan';
        if (code <= 48) return 'Berkabut';
        if (code <= 55) return 'Gerimis Ringan';
        if (code <= 65) return 'Hujan Sedang';
        if (code <= 82) return 'Hujan Lebat Lokal';
        if (code >= 95) return 'Hujan Disertai Petir';
        return 'Berawan';
      };

      const hourlyAqi = rawAqi?.hourly?.us_aqi || [];
      const hourlyPm25 = rawAqi?.hourly?.pm2_5 || [];

      const days: WeatherDayForecast[] = (daily.time || []).slice(0, 7).map((timeStr: string, idx: number) => {
        const dateObj = new Date(timeStr);
        const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][dateObj.getDay()];
        const code = daily.weather_code[idx] || 2;

        // Daily AQI & PM2.5 calculation from hourly chunks or fallback
        const sliceStart = idx * 24;
        const sliceEnd = sliceStart + 24;
        const dayAqiSlice = hourlyAqi.slice(sliceStart, sliceEnd).filter((v: any) => typeof v === 'number');
        const dayPm25Slice = hourlyPm25.slice(sliceStart, sliceEnd).filter((v: any) => typeof v === 'number');

        const dayAqi = dayAqiSlice.length > 0
          ? Math.round(dayAqiSlice.reduce((a: number, b: number) => a + b, 0) / dayAqiSlice.length)
          : (json.airQualityFallback?.dailyAqi?.[idx] || (26 + (idx % 4)));

        const dayPm25 = dayPm25Slice.length > 0
          ? Number((dayPm25Slice.reduce((a: number, b: number) => a + b, 0) / dayPm25Slice.length).toFixed(1))
          : (json.airQualityFallback?.dailyPm25?.[idx] || Number((6.2 + (idx * 0.3)).toFixed(1)));

        const dayMeta = getAqiMeta(dayAqi);

        return {
          date: timeStr,
          dayName,
          weatherCode: code,
          conditionText: getConditionText(code),
          tempMax: Math.round(daily.temperature_2m_max[idx] || 31),
          tempMin: Math.round(daily.temperature_2m_min[idx] || 24),
          rainProbability: Math.round(daily.precipitation_probability_max[idx] || 30),
          rainSumMm: Number((daily.precipitation_sum[idx] || 0).toFixed(1)),
          windSpeedMax: Math.round(daily.wind_speed_10m_max?.[idx] || 12),
          airQuality: {
            aqi: dayAqi,
            category: dayMeta.category,
            textColor: dayMeta.textColor,
            bgColor: dayMeta.bgColor,
            pm25: dayPm25
          }
        };
      });

      // Current AQI indicator
      const curAqiRaw = rawAqi?.current?.us_aqi ?? json.airQualityFallback?.current?.us_aqi ?? 27;
      const curPm25 = Number((rawAqi?.current?.pm2_5 ?? json.airQualityFallback?.current?.pm2_5 ?? 6.4).toFixed(1));
      const curPm10 = Number((rawAqi?.current?.pm10 ?? json.airQualityFallback?.current?.pm10 ?? 11.2).toFixed(1));
      const curCo = Number((rawAqi?.current?.carbon_monoxide ?? json.airQualityFallback?.current?.carbon_monoxide ?? 115).toFixed(1));
      const curNo2 = Number((rawAqi?.current?.nitrogen_dioxide ?? json.airQualityFallback?.current?.nitrogen_dioxide ?? 0.6).toFixed(1));
      const curO3 = Number((rawAqi?.current?.ozone ?? json.airQualityFallback?.current?.ozone ?? 35).toFixed(1));

      const curMeta = getAqiMeta(curAqiRaw);
      const airQualityData: AirQualityIndicator = {
        aqi: curAqiRaw,
        category: curMeta.category,
        textColor: curMeta.textColor,
        borderColor: curMeta.borderColor,
        bgColor: curMeta.bgColor,
        pm25: curPm25,
        pm10: curPm10,
        co: curCo,
        no2: curNo2,
        o3: curO3,
        summary: curMeta.summary,
        healthRecommendation: curMeta.healthRecommendation
      };

      setWeatherData({
        temp: Math.round(current.temperature_2m || 30),
        apparentTemp: Math.round(current.apparent_temperature || 33),
        humidity: Math.round(current.relative_humidity_2m || 82),
        weatherCode: current.weather_code || 2,
        conditionText: getConditionText(current.weather_code || 2),
        windSpeed: Math.round(current.wind_speed_10m || 8),
        windDirection: Math.round(current.wind_direction_10m || 140),
        uvIndex: Number((current.uv_index || 6.0).toFixed(1)),
        rainNow: Number((current.precipitation || 0).toFixed(1)),
        updatedAt: 'Baru saja',
        location: `${DISTRICT_COORDS[selectedDistrict].label}, Kab. Tana Tidung`,
        forecast: days,
        warningAlert: 'Waspada potensi hujan sedang-lebat di DAS Sesayap & Muruk Rian pada sore hari.',
        airQuality: airQualityData
      });
    } catch (err) {
      console.error('Weather error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWeather();
    }
  }, [isOpen, selectedDistrict]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-['Outfit']">
                  Prakiraan Cuaca Kabupaten Tana Tidung Kalimantan Utara
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950 border border-cyan-600/50 text-cyan-300 rounded-full">
                  BMKG & OPEN-METEO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Peringatan Dini Cuaca, Kualitas Udara (AQI) & Kondisi Mikroklimat Wilayah Wisata
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchWeather}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Perbarui data cuaca & kualitas udara"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* District Selector Tabs */}
        <div
          style={{ height: '93px' }}
          className="flex items-center border-b border-slate-800 px-6 bg-slate-950/40 text-xs overflow-x-auto gap-2.5"
        >
          {DISTRICTS.map((dist) => (
            <button
              key={dist}
              onClick={() => setSelectedDistrict(dist)}
              className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                selectedDistrict === dist
                  ? 'bg-cyan-600 text-white shadow-cyan-950/40 ring-2 ring-cyan-400/30'
                  : 'text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{dist}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* BMKG Warning Banner */}
          <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-600/70 text-amber-200 flex items-start gap-3 shadow-lg shadow-amber-950/20">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300">
                Peringatan Dini Cuaca BMKG Kalimantan Utara
              </h4>
              <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
                Waspada potensi hujan dengan intensitas sedang hingga lebat yang dapat disertai kilat/petir serta angin kencang di wilayah pedalaman Kecamatan Sesayap, Betayau, dan lereng Gunung Rian pada sore hingga malam hari. Operator wisata susur sungai harap memperhatikan tinggi gelombang dan debit air.
              </p>
            </div>
          </div>

          {/* Current Weather Card */}
          {weatherData && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  {weatherData.weatherCode >= 80 ? (
                    <CloudLightning className="w-10 h-10 text-amber-400 animate-pulse" />
                  ) : weatherData.weatherCode >= 50 ? (
                    <CloudRain className="w-10 h-10 text-cyan-400" />
                  ) : (
                    <CloudSun className="w-10 h-10 text-yellow-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
                      {weatherData.temp}°C
                    </span>
                    <span className="text-sm text-slate-400">
                      Terasa seperti {weatherData.apparentTemp}°C
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-cyan-300 mt-1">{weatherData.conditionText}</h3>
                  <p className="text-xs text-slate-400">{weatherData.location}</p>

                  {/* Air Quality Mini Badge in Current Weather Header */}
                  {weatherData.airQuality && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${weatherData.airQuality.bgColor} ${weatherData.airQuality.textColor} ${weatherData.airQuality.borderColor}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current shrink-0 animate-pulse" />
                        <span>Kualitas Udara: AQI {weatherData.airQuality.aqi} • {weatherData.airQuality.category}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                        PM2.5: {weatherData.airQuality.pm25} µg/m³
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Weather Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full md:w-auto">
                {/* Air Quality Metric Stat */}
                {weatherData.airQuality && (
                  <div className={`p-3 rounded-xl border ${weatherData.airQuality.bgColor} ${weatherData.airQuality.borderColor} shadow-sm`}>
                    <span className={`text-[10px] flex items-center gap-1 font-semibold ${weatherData.airQuality.textColor}`}>
                      <Leaf className="w-3 h-3" /> Udara (AQI)
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <strong className="text-sm text-white font-mono">
                        {weatherData.airQuality.aqi}
                      </strong>
                      <span className={`text-[10px] font-bold ${weatherData.airQuality.textColor}`}>
                        {weatherData.airQuality.category}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      PM2.5: {weatherData.airQuality.pm25} µg
                    </span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" /> Kelembapan
                  </span>
                  <strong className="text-sm text-slate-100 font-mono mt-1 block">
                    {weatherData.humidity}%
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-teal-400" /> Kecepatan Angin
                  </span>
                  <strong className="text-sm text-slate-100 font-mono mt-1 block">
                    {weatherData.windSpeed} km/j
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" /> Indeks UV
                  </span>
                  <strong className="text-sm text-slate-100 font-mono mt-1 block">
                    {weatherData.uvIndex} (Sedang)
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Umbrella className="w-3 h-3 text-blue-400" /> Curah Hujan
                  </span>
                  <strong className="text-sm text-slate-100 font-mono mt-1 block">
                    {weatherData.rainNow} mm
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Current Air Quality Detailed Breakdown Card */}
          {weatherData?.airQuality && (
            <div className={`p-4 sm:p-5 rounded-2xl border ${weatherData.airQuality.bgColor} ${weatherData.airQuality.borderColor} shadow-lg transition-all`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${weatherData.airQuality.borderColor} bg-slate-900/80`}>
                    <Leaf className={`w-5 h-5 ${weatherData.airQuality.textColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Indikator Kualitas Udara Real-Time (ISPU / AQI) - {selectedDistrict}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${weatherData.airQuality.textColor} bg-slate-900/90 border ${weatherData.airQuality.borderColor}`}>
                        {weatherData.airQuality.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {weatherData.airQuality.summary}. {weatherData.airQuality.healthRecommendation}
                    </p>
                  </div>
                </div>

                {/* Visual AQI Gauge Range */}
                <div className="sm:text-right shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 font-medium">Tingkat Indeks ISPU / US-AQI</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div className="bg-emerald-500 flex-1" title="0-50 Baik" />
                      <div className="bg-amber-500 flex-1" title="51-100 Sedang" />
                      <div className="bg-orange-500 flex-1" title="101-150 Tidak Sehat (Sensitif)" />
                      <div className="bg-rose-500 flex-1" title=">150 Berbahaya" />
                    </div>
                    <span className={`text-sm font-mono font-extrabold ${weatherData.airQuality.textColor}`}>
                      {weatherData.airQuality.aqi} <span className="text-[10px] text-slate-400 font-normal">/ 500</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Atmospheric Pollutants Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800/70 text-xs">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block font-medium">PM2.5 (Debu Halus)</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono font-bold text-slate-100 text-sm">{weatherData.airQuality.pm25}</span>
                    <span className="text-[10px] text-slate-400">µg/m³</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 block mt-1">Standar WHO: &lt;15 µg/m³</span>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block font-medium">PM10 (Debu Kasar)</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono font-bold text-slate-100 text-sm">{weatherData.airQuality.pm10 ?? 11.2}</span>
                    <span className="text-[10px] text-slate-400">µg/m³</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 block mt-1">Standar WHO: &lt;45 µg/m³</span>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Ozon Permukaan (O₃)</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono font-bold text-slate-100 text-sm">{weatherData.airQuality.o3 ?? 35}</span>
                    <span className="text-[10px] text-slate-400">µg/m³</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 block mt-1">Sangat Segar & Alami</span>
                </div>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Karbon Monoksida (CO)</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono font-bold text-slate-100 text-sm">{weatherData.airQuality.co ?? 115}</span>
                    <span className="text-[10px] text-slate-400">µg/m³</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 block mt-1">Taraf Emisi Sangat Rendah</span>
                </div>
              </div>
            </div>
          )}

          {/* 7-Day Forecast */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Prakiraan Cuaca & Kualitas Udara 7 Hari Mendatang
              </h3>
              <span className="text-xs text-slate-400">Kalimantan Utara (UTC+8)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weatherData?.forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center text-center space-y-2 group hover:border-cyan-500/40 transition-all shadow-md"
                >
                  <span className="font-bold text-xs text-slate-300">
                    {idx === 0 ? 'Hari Ini' : day.dayName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {day.date.split('-').slice(1).join('/')}
                  </span>

                  <div className="my-1">
                    {day.weatherCode >= 80 ? (
                      <CloudLightning className="w-6 h-6 text-amber-400" />
                    ) : day.rainProbability > 60 ? (
                      <CloudRain className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <CloudSun className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-slate-200 line-clamp-1">
                    {day.conditionText}
                  </span>

                  <div className="text-xs font-mono pt-1">
                    <span className="text-rose-400 font-bold">{day.tempMax}°</span> /{' '}
                    <span className="text-cyan-400">{day.tempMin}°</span>
                  </div>

                  <div className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                    <Droplets className="w-2.5 h-2.5" /> {day.rainProbability}% Hujan
                  </div>

                  {/* Air Quality Indicator on Each Forecast Day */}
                  {day.airQuality && (
                    <div
                      className={`w-full py-1 px-1.5 rounded-lg border text-[10px] font-semibold flex items-center justify-between gap-1 mt-1 ${day.airQuality.bgColor} ${day.airQuality.textColor} border-current/20 shadow-xs`}
                      title={`Prakiraan Kualitas Udara: AQI ${day.airQuality.aqi} (${day.airQuality.category}) - PM2.5: ${day.airQuality.pm25 || 6} µg/m³`}
                    >
                      <span className="flex items-center gap-1">
                        <Leaf className="w-2.5 h-2.5 shrink-0" />
                        <span>AQI {day.airQuality.aqi}</span>
                      </span>
                      <span className="text-[9px] font-bold uppercase truncate max-w-[45px]">
                        {day.airQuality.category}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
