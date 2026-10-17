import React, { useState, useEffect } from 'react';
import {
  MapPin,
  TrendingUp,
  Radio,
  CloudSun,
  ShieldAlert,
  PlusCircle,
  BarChart3,
  Sparkles,
  Activity,
  Compass,
  Layers,
  History,
  Database
} from 'lucide-react';
import { Destination } from '../types';

interface NavbarProps {
  destinations: Destination[];
  totalVisitors: number;
  activeAlertsCount: number;
  onOpenAdmin: () => void;
  onOpenBpsMpd: () => void;
  onOpenSocialTrends: () => void;
  onOpenSensors: () => void;
  onOpenWeather: () => void;
  onOpenAiAdvisory: () => void;
  onOpenHistory?: () => void;
  isFirestoreConnected?: boolean;
  activeTab: 'map' | 'bps' | 'social' | 'sensors' | 'weather';
  setActiveTab: (tab: 'map' | 'bps' | 'social' | 'sensors' | 'weather') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  destinations,
  totalVisitors,
  activeAlertsCount,
  onOpenAdmin,
  onOpenBpsMpd,
  onOpenSocialTrends,
  onOpenSensors,
  onOpenWeather,
  onOpenAiAdvisory,
  onOpenHistory,
  isFirestoreConnected = true,
  activeTab,
  setActiveTab
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format in WITA (UTC+8)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('id-ID', options);
      setTimeStr(formatter.format(now) + ' WITA');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalCapacity = destinations.reduce((sum, d) => sum + d.maxCapacity, 0);
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalVisitors / totalCapacity) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Banner Ticker */}
      <div className="hidden lg:flex items-center justify-between px-4 py-1 text-xs border-b border-slate-800/80 bg-slate-900/60 text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SAPTA-AI Geospasial KTT Terkoneksi
          </span>
          <span className="text-slate-600">|</span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            isFirestoreConnected
              ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
              : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
          }`}>
            <Database className="w-3 h-3 text-cyan-400" />
            <span>{isFirestoreConnected ? 'Database Cloud Aktif (Firebase)' : 'Database Lokal'}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>Kabupaten Tana Tidung - Kalimantan Utara</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-slate-300">{timeStr || '17:45 WITA'}</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Pengunjung Aktif:</span>
            <span className="font-semibold text-emerald-400">{totalVisitors.toLocaleString()} Jiwa</span>
            <span className="text-slate-500">({occupancyPercent}% Kapasitas Total)</span>
          </div>

          <button
            onClick={onOpenAiAdvisory}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 transition-colors text-xs font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>AI Situasi & Rekomendasi</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-100 text-lg sm:text-xl tracking-tight font-['Outfit'] flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">SAPTA-AI</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-300 hidden xs:inline">
                    (Spatial Analytics & Predictive Tourism Assistance AI)
                  </span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 rounded-full">
                  LIVE GIS
                </span>
              </div>
              <div className="hidden sm:block leading-tight mt-0.5">
                <p className="text-[11px] font-medium text-emerald-400/90">
                  Pariwisata Geospasial
                </p>
                <p className="text-[10px] text-slate-400">
                  Kabupaten Tana Tidung • Kalimantan Utara
                </p>
              </div>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Peta Wisata</span>
            </button>

            <button
              onClick={onOpenBpsMpd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span>BPS Kaltara MPD</span>
            </button>

            <button
              onClick={onOpenSocialTrends}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
              <span>Trend Medsos</span>
            </button>

            <button
              onClick={onOpenSensors}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all relative cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Sensor & EWS</span>
              {activeAlertsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenWeather}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cuaca & Udara</span>
            </button>

            {onOpenHistory && (
              <button
                id="btn-nav-history"
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
                title="Buka Histori & Grafik Aliran Pengunjung Seluruh Destinasi"
              >
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span>Histori Turnstile</span>
              </button>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Destinasi</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Submenu Bar */}
      <div className="flex md:hidden overflow-x-auto py-2 px-3 gap-2 border-t border-slate-800/80 bg-slate-900/70 text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'map' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <MapPin className="w-3 h-3" /> Peta
        </button>
        <button
          onClick={onOpenBpsMpd}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 whitespace-nowrap"
        >
          <BarChart3 className="w-3 h-3 text-blue-400" /> BPS MPD
        </button>
        <button
          onClick={onOpenSocialTrends}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 whitespace-nowrap"
        >
          <TrendingUp className="w-3 h-3 text-pink-400" /> Trend Medsos
        </button>
        <button
          onClick={onOpenSensors}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 whitespace-nowrap"
        >
          <Radio className="w-3 h-3 text-amber-400" /> Sensor & EWS ({activeAlertsCount})
        </button>
        <button
          onClick={onOpenWeather}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 whitespace-nowrap"
        >
          <CloudSun className="w-3 h-3 text-cyan-400" /> Cuaca & Udara
        </button>
      </div>
    </header>
  );
};
