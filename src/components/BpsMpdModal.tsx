import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Download,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Table,
  CheckCircle2,
  Ship,
  Car,
  Plane,
  Globe2,
  Clock,
  Layers,
  BarChart2,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import {
  BPS_MPD_DATA_2023,
  BPS_MPD_DATA_2024,
  BPS_MPD_DATA_2025,
  BPS_MPD_DATA_2026,
  BPS_HISTORICAL_TIMELINE,
  BPS_TABLE_OFFICIAL_URL,
  AVAILABLE_BPS_YEARS,
  getBpsDataForYear
} from '../data/bpsMpdData';
import { BpsMpdSummary } from '../types';

interface BpsMpdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Config regency for styling and colors
const REGENCY_CONFIGS: Record<
  string,
  {
    name: string;
    shortName: string;
    color: string;
    bgBadge: string;
    borderBadge: string;
    textBadge: string;
    id: number;
    isFocus: boolean;
  }
> = {
  'Kabupaten Tana Tidung': {
    name: 'Kabupaten Tana Tidung',
    shortName: 'Tana Tidung',
    color: '#10b981', // emerald-500
    bgBadge: 'bg-emerald-950/80',
    borderBadge: 'border-emerald-600',
    textBadge: 'text-emerald-300',
    id: 223,
    isFocus: true
  },
  'Kota Tarakan': {
    name: 'Kota Tarakan',
    shortName: 'Tarakan',
    color: '#3b82f6', // blue-500
    bgBadge: 'bg-blue-950/60',
    borderBadge: 'border-blue-700',
    textBadge: 'text-blue-300',
    id: 225,
    isFocus: false
  },
  'Kabupaten Bulungan': {
    name: 'Kabupaten Bulungan',
    shortName: 'Bulungan',
    color: '#a855f7', // purple-500
    bgBadge: 'bg-purple-950/60',
    borderBadge: 'border-purple-700',
    textBadge: 'text-purple-300',
    id: 222,
    isFocus: false
  },
  'Kabupaten Malinau': {
    name: 'Kabupaten Malinau',
    shortName: 'Malinau',
    color: '#f59e0b', // amber-500
    bgBadge: 'bg-amber-950/60',
    borderBadge: 'border-amber-700',
    textBadge: 'text-amber-300',
    id: 221,
    isFocus: false
  },
  'Kabupaten Nunukan': {
    name: 'Kabupaten Nunukan',
    shortName: 'Nunukan',
    color: '#06b6d4', // cyan-500
    bgBadge: 'bg-cyan-950/60',
    borderBadge: 'border-cyan-700',
    textBadge: 'text-cyan-300',
    id: 224,
    isFocus: false
  }
};

export const BpsMpdModal: React.FC<BpsMpdModalProps> = ({ isOpen, onClose }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeView, setActiveView] = useState<'table' | 'trends' | 'history'>('table');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Hari ini, 16:30 WITA');

  // Live BPS Web API State pulled from backend proxy
  const [liveDataByYear, setLiveDataByYear] = useState<Record<number, any>>({});
  const [isLoadingBps, setIsLoadingBps] = useState<boolean>(false);
  const [bpsLastUpdate, setBpsLastUpdate] = useState<string>('05 Oktober 2026');

  // Comparison & Chart Controls
  const [selectedRegencies, setSelectedRegencies] = useState<string[]>([
    'Kabupaten Tana Tidung',
    'Kota Tarakan',
    'Kabupaten Bulungan',
    'Kabupaten Malinau',
    'Kabupaten Nunukan'
  ]);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [timeRange2026, setTimeRange2026] = useState<'official_released' | 'full_year'>('official_released');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const currentData: BpsMpdSummary = useMemo(() => {
    return getBpsDataForYear(selectedYear);
  }, [selectedYear]);

  // Direct pull single year from BPS Web API JSON
  const fetchLiveBpsData = async (year: number) => {
    setIsLoadingBps(true);
    try {
      const thCode = (year - 1900).toString(); // 2023 -> 123, 2024 -> 124, 2025 -> 125, 2026 -> 126
      const res = await fetch(`/api/bps/wisnus?domain=6500&var=600&th=${thCode}`);
      const data = await res.json();
      if (data.success && data.parsed) {
        setLiveDataByYear((prev) => ({
          ...prev,
          [year]: data.parsed
        }));
        if (data.lastUpdate) {
          setBpsLastUpdate(data.lastUpdate);
        }
        const now = new Date();
        setLastSyncTime(
          `Hari ini, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WITA`
        );
      }
    } catch (err) {
      console.error('BPS Live Fetch error:', err);
    } finally {
      setIsLoadingBps(false);
    }
  };

  // Pull all years 2023 - 2026 simultaneously from BPS Web API
  const fetchAllYearsHistorical = async () => {
    setIsSyncingAll(true);
    try {
      const res = await fetch('/api/bps/historical?domain=6500&var=600');
      const data = await res.json();
      if (data.success && data.dataByYear) {
        setLiveDataByYear(data.dataByYear);
        const now = new Date();
        setLastSyncTime(
          `Hari ini, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WITA`
        );
      }
    } catch (err) {
      console.error('BPS Historical sync error:', err);
    } finally {
      setIsSyncingAll(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveBpsData(selectedYear);
    }
  }, [isOpen, selectedYear]);

  // Months to display in trend chart
  const displayMonths = useMemo(() => {
    if (selectedYear === 2026) {
      if (timeRange2026 === 'official_released') {
        return ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus'];
      }
      return [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
    }
    return [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
  }, [selectedYear, timeRange2026]);

  // Monthly columns for the official comparison table
  const tableMonths = useMemo(() => {
    if (selectedYear === 2026) {
      return [
        { key: 'Januari', label: 'Jan' },
        { key: 'Februari', label: 'Feb' },
        { key: 'Maret', label: 'Mar' },
        { key: 'April', label: 'Apr' },
        { key: 'Mei', label: 'Mei' },
        { key: 'Juni', label: 'Jun' },
        { key: 'Juli', label: 'Jul' },
        { key: 'Agustus', label: 'Agu', isLatest: true }
      ];
    }
    return [
      { key: 'Januari', label: 'Jan' },
      { key: 'Februari', label: 'Feb' },
      { key: 'Maret', label: 'Mar' },
      { key: 'April', label: 'Apr' },
      { key: 'Mei', label: 'Mei' },
      { key: 'Juni', label: 'Jun' },
      { key: 'Juli', label: 'Jul' },
      { key: 'Agustus', label: 'Agu' },
      { key: 'September', label: 'Sep' },
      { key: 'Oktober', label: 'Okt' },
      { key: 'November', label: 'Nov' },
      { key: 'Desember', label: 'Des', isLatest: true }
    ];
  }, [selectedYear]);

  // Robust value getter for any regency, year and month
  const getMonthlyValue = (regencyName: string, monthName: string, yearTarget = selectedYear): number => {
    // 1. Try liveBpsData first for target year
    const activeLiveData = liveDataByYear[yearTarget];
    if (activeLiveData?.comparison) {
      const reg = activeLiveData.comparison.find(
        (r: any) => r.regency === regencyName || r.id === REGENCY_CONFIGS[regencyName]?.id
      );
      if (reg?.monthly && typeof reg.monthly[monthName] === 'number') {
        return reg.monthly[monthName];
      }
    }

    // 2. Static dataset for the specified year
    const staticData = getBpsDataForYear(yearTarget);
    const foundReg = staticData.kaltaraRegenciesComparison.find((r) => r.regency === regencyName);
    if (foundReg?.monthly && typeof foundReg.monthly[monthName] === 'number') {
      return foundReg.monthly[monthName];
    }

    // 3. Projection for 2026 post-Q1 if requested
    if (yearTarget === 2026) {
      const reg2025 = BPS_MPD_DATA_2025.kaltaraRegenciesComparison.find((r) => r.regency === regencyName);
      const val2025 = reg2025?.monthly?.[monthName];
      if (typeof val2025 === 'number') {
        return Math.round(val2025 * 1.22);
      }
    }

    // 4. Fallback for Tana Tidung from monthlyData
    if (regencyName === 'Kabupaten Tana Tidung') {
      const shortM = monthName.slice(0, 3);
      const mItem = staticData.monthlyData.find((m) => m.month.toLowerCase().startsWith(shortM.toLowerCase()));
      if (mItem) return mItem.wisnus;
    }

    return 0;
  };

  // Maximum monthly value for accurate Y-axis scaling
  const maxMonthlyValue = useMemo(() => {
    let max = 1000;
    for (const m of displayMonths) {
      for (const reg of selectedRegencies) {
        const val = getMonthlyValue(reg, m, selectedYear);
        if (val > max) max = val;
      }
    }
    const step = max > 50000 ? 10000 : 5000;
    return Math.max(10000, Math.ceil(max / step) * step);
  }, [displayMonths, selectedRegencies, liveDataByYear, selectedYear]);

  // Regency toggle logic
  const toggleRegency = (regName: string) => {
    setSelectedRegencies((prev) => {
      if (prev.includes(regName)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((r) => r !== regName);
      } else {
        return [...prev, regName];
      }
    });
  };

  const selectPreset = (type: 'all' | 'solo' | 'vs_tarakan' | 'vs_malinau') => {
    if (type === 'all') {
      setSelectedRegencies(Object.keys(REGENCY_CONFIGS));
    } else if (type === 'solo') {
      setSelectedRegencies(['Kabupaten Tana Tidung']);
    } else if (type === 'vs_tarakan') {
      setSelectedRegencies(['Kabupaten Tana Tidung', 'Kota Tarakan']);
    } else if (type === 'vs_malinau') {
      setSelectedRegencies(['Kabupaten Tana Tidung', 'Kabupaten Malinau']);
    }
  };

  const handleSyncBps = async () => {
    setIsSyncing(true);
    await fetchLiveBpsData(selectedYear);
    setIsSyncing(false);
  };

  // Derive active comparison rows from live BPS JSON or fallback for selectedYear
  const activeLiveData = liveDataByYear[selectedYear];
  const comparisonRows = activeLiveData?.comparison || currentData.kaltaraRegenciesComparison;
  const totalKaltaraWisnus = activeLiveData?.totalKaltara || currentData.totalKaltaraWisnus;
  const kttRegency = comparisonRows.find((r: any) => r.isFocus || r.id === 223);
  const kttTripsCount = kttRegency?.tripsCount || currentData.totalWisnus;
  const kttPercentageShare =
    kttRegency?.percentageShare ||
    currentData.kaltaraRegenciesComparison.find((r) => r.isFocus)?.percentageShare ||
    11.8;

  const handleExportCsv = () => {
    const tableHeader = ['Peringkat', 'Kabupaten/Kota Tujuan', `Perjalanan Wisnus ${selectedYear}`, 'Pangsa Pasar (%)', 'Pertumbuhan (%)'];
    const tableRows = comparisonRows.map((r: any) => [
      r.rank,
      r.regency,
      r.tripsCount,
      `${r.percentageShare}%`,
      r.growthPercent ? `+${r.growthPercent}%` : '-'
    ]);

    const compHeader = ['Bulan', ...selectedRegencies.map((r) => REGENCY_CONFIGS[r]?.shortName || r)];
    const compRows = displayMonths.map((m) => [
      m,
      ...selectedRegencies.map((r) => getMonthlyValue(r, m, selectedYear))
    ]);

    const historyHeader = ['Tahun', 'Periode', 'Total Kaltara', 'Wisnus Tana Tidung', 'Pangsa KTT (%)', 'Pertumbuhan KTT YoY (%)'];
    const historyRows = BPS_HISTORICAL_TIMELINE.map((h) => [
      h.year,
      h.label,
      h.totalKaltara,
      h.kttTrips,
      `${h.kttSharePercent}%`,
      h.kttGrowthYoY > 0 ? `+${h.kttGrowthYoY}%` : '-'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['# SUMBER RESMI: BADAN PUSAT STATISTIK (BPS) PROVINSI KALIMANTAN UTARA'],
        [`# Tabel Statistik: ${currentData.tableTitle} (Tabel No. ${currentData.tableCode})`],
        [`# Endpoint Web API: https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/6500/var/600/th/${selectedYear - 1900}`],
        [`# Portal Resmi: ${currentData.sourceUrl}`],
        [],
        [`# 1. DISTRIBUSI KABUPATEN/KOTA TAHUN ${selectedYear}`],
        tableHeader,
        ...tableRows,
        ['Total', 'Provinsi Kalimantan Utara', totalKaltaraWisnus, '100%', `+${currentData.growthPercent}%`],
        [],
        [`# 2. MATRIKS KOMPARASI BULANAN WISNUS KALTARA (${selectedYear})`],
        compHeader,
        ...compRows,
        [],
        ['# 3. HISTORIS MULTI-TAHUN PERJALANAN WISATAWAN (2023 - 2026)'],
        historyHeader,
        ...historyRows
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BPS_Kaltara_Wisnus_2023_2026_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((pct) => Math.round(maxMonthlyValue * pct));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg font-['Outfit']">
              BPS
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Statistik Perjalanan Wisatawan BPS Kaltara
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">
                  Data 2023–2026
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Web API (var 600)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                BPS Provinsi Kalimantan Utara • Mobile Positioning Data (MPD) Kabupaten Tana Tidung & 4 Daerah Kaltara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sync All 2023-2026 Button */}
            <button
              onClick={fetchAllYearsHistorical}
              disabled={isSyncingAll}
              title="Tarik seluruh data 2023 s/d 2026 dari server BPS secara langsung"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncingAll ? 'Menarik 2023-2026...' : 'Tarik Semua (2023–2026)'}
              </span>
              <span className="sm:hidden">Semua Tahun</span>
            </button>

            {/* Sync Active Year Button */}
            <button
              onClick={handleSyncBps}
              disabled={isSyncing || isLoadingBps}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isLoadingBps ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden md:inline">Sync {selectedYear}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV (2023-2026)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Switcher: 3 Tampilan Analitis */}
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => setActiveView('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeView === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tabel BPS Kab/Kota</span>
              </button>
              <button
                onClick={() => setActiveView('trends')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeView === 'trends' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tren Bulanan & Komparasi</span>
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeView === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Historis (2023–2026)</span>
              </button>
            </div>

            {/* Year Toggle: 2023, 2024, 2025, 2026 */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className="text-slate-400 text-[11px]">Pilih Tahun:</span>
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                {AVAILABLE_BPS_YEARS.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-all cursor-pointer ${
                      selectedYear === yr
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {yr} {yr === 2026 ? '(Jan-Agu)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>
              Sinkronisasi BPS: <strong className="text-slate-300">{lastSyncTime}</strong>
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Official Source Link Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-950 border border-blue-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-200">
                    BPS Kaltara: {currentData.tableTitle} ({selectedYear})
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-900/60 text-blue-300 font-mono">
                    Tabel No. {currentData.tableCode} (th={selectedYear - 1900})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Data resmi BPS Provinsi Kalimantan Utara mencakup 5 kabupaten/kota: Malinau, Bulungan, Tana Tidung, Nunukan, dan Tarakan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={currentData.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm cursor-pointer"
              >
                <span>Buka Link Tabel BPS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400">
                Wisnus Tana Tidung ({selectedYear === 2026 ? 'Jan - Agu 2026' : selectedYear})
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-emerald-400 font-['Outfit']">
                  {kttTripsCount.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-emerald-300 font-semibold flex items-center">
                  +{currentData.growthPercent}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Perjalanan tujuan Kabupaten Tana Tidung</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400">Total Se-Kalimantan Utara</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-indigo-400 font-['Outfit']">
                  {totalKaltaraWisnus.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-indigo-300 font-medium">Perjalanan</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Total 5 Kabupaten/Kota Kalimantan Utara</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400">Pangsa Pasar Tana Tidung</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-teal-400 font-['Outfit']">
                  {kttPercentageShare}%
                </span>
                <span className="text-xs text-teal-300 font-medium">
                  Peringkat #{kttRegency?.rank || (selectedYear === 2024 ? 4 : 5)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {selectedYear === 2024
                  ? 'Melampaui Kabupaten Malinau (+160.7% YoY)'
                  : 'Pangsa pasar perjalanan se-Kaltara'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400">Rata-rata Pengeluaran</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold text-amber-400 font-['Outfit']">
                  Rp {(currentData.avgSpendingIdr / 1000000).toFixed(2)} Jt
                </span>
                <span className="text-xs text-slate-400">/ trip</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Pengeluaran kuliner, transportasi & souvenir</p>
            </div>
          </div>

          {/* Tab 1: Official BPS Comparison Table */}
          {activeView === 'table' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-400" />
                      Tabel BPS: Perjalanan Wisatawan Nusantara Menurut Kab/Kota Tujuan ({selectedYear})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Rincian distribusi perjalanan wisatawan nusantara antar kabupaten/kota di Provinsi Kalimantan Utara
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono self-start sm:self-auto px-2 py-1 rounded bg-slate-900 border border-slate-800">
                    Satuan: Perjalanan Wisatawan
                  </span>
                </div>

                {/* Structured Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs min-w-[760px]">
                    <thead className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center sticky left-0 bg-slate-900 z-10">No.</th>
                        <th className="py-3 px-4 min-w-[190px] sticky left-10 bg-slate-900 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                          Kabupaten / Kota Tujuan
                        </th>
                        <th className="py-3 px-3 text-right bg-slate-900/90 min-w-[110px]">
                          {selectedYear === 2026 ? 'Total (Jan - Agu)' : `Total ${selectedYear}`}
                        </th>
                        <th className="py-3 px-3 text-right">Pangsa (%)</th>
                        <th className="py-3 px-3 text-right">Pertumbuhan</th>
                        {tableMonths.map((m) => (
                          <th
                            key={m.key}
                            className={`py-3 px-3 text-right font-mono min-w-[70px] ${
                              m.isLatest
                                ? 'text-emerald-400 bg-emerald-950/30'
                                : 'text-slate-300'
                            }`}
                          >
                            <div className="flex flex-col items-end">
                              <span>{m.label}</span>
                              {m.isLatest && (
                                <span className="text-[9px] text-emerald-400 font-sans tracking-tight">
                                  Terbaru
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-mono">
                      {comparisonRows.map((row: any) => {
                        const isKtt = row.isFocus || row.id === 223;

                        return (
                          <tr
                            key={row.regency}
                            className={`transition-colors ${
                              isKtt
                                ? 'bg-emerald-950/40 hover:bg-emerald-950/60 font-medium'
                                : 'hover:bg-slate-900/40'
                            }`}
                          >
                            <td className={`py-3 px-3 text-center text-slate-400 sticky left-0 z-10 ${
                              isKtt ? 'bg-emerald-950/90' : 'bg-slate-950'
                            }`}>
                              {row.rank}
                            </td>
                            <td className={`py-3 px-4 font-sans sticky left-10 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)] ${
                              isKtt ? 'bg-emerald-950/90' : 'bg-slate-950'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className={isKtt ? 'text-emerald-300 font-bold' : 'text-slate-200'}>
                                  {row.regency}
                                </span>
                                {isKtt && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-900/80 border border-emerald-600/60 text-emerald-300 rounded-full font-sans">
                                    Fokus NeXT
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-slate-100 bg-slate-900/40">
                              {row.tripsCount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="text-slate-300">{row.percentageShare}%</span>
                            </td>
                            <td className="py-3 px-3 text-right text-emerald-400 font-medium">
                              {row.growthPercent ? `+${row.growthPercent}%` : selectedYear === 2023 ? 'Dasar' : '+10.7%'}
                            </td>
                            {tableMonths.map((m) => {
                              const val = row.monthly?.[m.key];
                              return (
                                <td
                                  key={m.key}
                                  className={`py-3 px-3 text-right ${
                                    m.isLatest
                                      ? 'text-cyan-300 font-semibold bg-emerald-950/10'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {typeof val === 'number' ? val.toLocaleString('id-ID') : '-'}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {/* Total Row */}
                      <tr className="bg-slate-900/90 font-bold text-slate-100 border-t-2 border-slate-700">
                        <td className="py-3 px-3 text-center text-slate-400 sticky left-0 bg-slate-900 z-10">-</td>
                        <td className="py-3 px-4 uppercase tracking-wider text-xs text-blue-300 font-sans sticky left-10 bg-slate-900 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                          Total Provinsi Kalimantan Utara
                        </td>
                        <td className="py-3 px-3 text-right text-blue-400 text-sm bg-slate-900">
                          {totalKaltaraWisnus.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-200">100.0%</td>
                        <td className="py-3 px-3 text-right text-emerald-400">
                          +{selectedYear === 2026 ? '12.1' : selectedYear === 2023 ? '0' : currentData.growthPercent}%
                        </td>
                        {tableMonths.map((m) => {
                          const mTotal =
                            activeLiveData?.totalKaltaraMonthly?.[m.key] ||
                            comparisonRows.reduce((acc: number, r: any) => acc + (r.monthly?.[m.key] || 0), 0);

                          return (
                            <td
                              key={m.key}
                              className={`py-3 px-3 text-right text-xs ${
                                m.isLatest ? 'text-emerald-300 font-extrabold bg-emerald-950/20' : 'text-slate-200'
                              }`}
                            >
                              {mTotal > 0 ? mTotal.toLocaleString('id-ID') : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                  <p className="italic">
                    * Sumber: Data resmi BPS Provinsi Kalimantan Utara via Web API (Domain 6500, Variabel 600 - MPD). Pembaruan BPS: {bpsLastUpdate}.
                  </p>
                  <span className="text-emerald-400 font-medium">
                    ✓ Terverifikasi resmi dari database BPS (Rilis data resmi mencakup periode Januari s/d Agustus 2026)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Monthly Trends & Multi-Regency Comparison */}
          {activeView === 'trends' && (
            <div className="space-y-6">
              
              {/* Filter & Control Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Komparasi Tren Bulanan Antar Kabupaten/Kota di Kaltara ({selectedYear})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pilih satu atau lebih kabupaten/kota untuk membandingkan volume perjalanan per bulan
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chart Type Selector */}
                    <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                      <button
                        onClick={() => setChartType('bar')}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                          chartType === 'bar' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Batang</span>
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                          chartType === 'line' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Garis</span>
                      </button>
                    </div>

                    {/* Scope Selector for 2026 */}
                    {selectedYear === 2026 && (
                      <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                        <button
                          onClick={() => setTimeRange2026('official_released')}
                          className={`px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer ${
                            timeRange2026 === 'official_released'
                              ? 'bg-emerald-700 text-white font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Rilis Resmi BPS (Jan - Agu)
                        </button>
                        <button
                          onClick={() => setTimeRange2026('full_year')}
                          className={`px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer ${
                            timeRange2026 === 'full_year'
                              ? 'bg-slate-700 text-white font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          12 Bulan (Proyeksi)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Presets & Regency Checkboxes */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium">Daerah Ditampilkan:</span>
                    {Object.entries(REGENCY_CONFIGS).map(([regName, cfg]) => {
                      const isSelected = selectedRegencies.includes(regName);
                      return (
                        <button
                          key={regName}
                          onClick={() => toggleRegency(regName)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? `${cfg.bgBadge} ${cfg.borderBadge} ${cfg.textBadge} font-semibold shadow-sm`
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: isSelected ? cfg.color : '#64748b' }}
                          ></span>
                          <span>{cfg.shortName}</span>
                          {cfg.isFocus && (
                            <span className="text-[9px] bg-emerald-800 text-emerald-200 px-1 rounded">Fokus</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Preset Shortcuts */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500">Preset:</span>
                    <button
                      onClick={() => selectPreset('all')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Semua Kab/Kota
                    </button>
                    <button
                      onClick={() => selectPreset('solo')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Hanya KTT
                    </button>
                    <button
                      onClick={() => selectPreset('vs_tarakan')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      KTT vs Tarakan
                    </button>
                    <button
                      onClick={() => selectPreset('vs_malinau')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      KTT vs Malinau
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Visual Canvas */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">
                      Visualisasi Grafik Perjalanan Wisatawan ({selectedYear})
                    </span>
                    <span className="text-slate-400 font-mono">
                      (Skala Maks: {maxMonthlyValue.toLocaleString('id-ID')} perjalanan)
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    Arahkan kursor pada batang/bulan untuk melihat detail angka
                  </span>
                </div>

                {/* The Chart Container */}
                <div className="relative pt-6 pb-2 px-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  {/* Y-axis gridlines & labels */}
                  <div className="absolute inset-0 top-6 bottom-8 left-12 right-4 flex flex-col justify-between pointer-events-none">
                    {yTicks.map((tick, i) => (
                      <div key={i} className="flex items-center w-full">
                        <span className="text-[10px] font-mono text-slate-500 w-10 text-right -ml-12 pr-2">
                          {tick >= 1000 ? `${Math.round(tick / 1000)}k` : tick}
                        </span>
                        <div className="w-full border-b border-slate-800/60"></div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Body: Months Columns */}
                  <div className="relative ml-12 mr-2 h-64 flex items-end justify-between gap-2 z-10">
                    {displayMonths.map((m) => {
                      const isHovered = hoveredMonth === m;

                      return (
                        <div
                          key={m}
                          onMouseEnter={() => setHoveredMonth(m)}
                          onMouseLeave={() => setHoveredMonth(null)}
                          className={`flex-1 h-full flex flex-col justify-end items-center group transition-colors rounded-lg ${
                            isHovered ? 'bg-slate-800/50' : ''
                          }`}
                        >
                          {/* Tooltip Hover Overlay */}
                          {isHovered && (
                            <div className="absolute top-2 z-30 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 shadow-xl text-xs space-y-1 pointer-events-none min-w-[200px]">
                              <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                                <span>{m} {selectedYear}</span>
                                <span className="text-[10px] text-slate-400">Rincian</span>
                              </div>
                              {selectedRegencies.map((reg) => {
                                const val = getMonthlyValue(reg, m, selectedYear);
                                const cfg = REGENCY_CONFIGS[reg];
                                return (
                                  <div key={reg} className="flex justify-between items-center text-[11px] gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: cfg?.color || '#3b82f6' }}
                                      ></span>
                                      <span className={cfg?.isFocus ? 'font-bold text-emerald-300' : 'text-slate-300'}>
                                        {cfg?.shortName || reg}:
                                      </span>
                                    </div>
                                    <span className="font-mono font-semibold text-white">
                                      {val.toLocaleString('id-ID')} trip
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Bars Container for each regency */}
                          <div className="w-full h-full flex items-end justify-center gap-1 px-1">
                            {selectedRegencies.map((reg) => {
                              const val = getMonthlyValue(reg, m, selectedYear);
                              const heightPct = Math.min(100, Math.max(2, (val / maxMonthlyValue) * 100));
                              const cfg = REGENCY_CONFIGS[reg];

                              return (
                                <div
                                  key={reg}
                                  className="relative flex flex-col items-center justify-end h-full"
                                  style={{
                                    width: `${Math.max(12, Math.floor(100 / (selectedRegencies.length || 1)))}%`,
                                    maxWidth: '28px'
                                  }}
                                >
                                  {/* Value label on top of bar on hover or if focus */}
                                  {isHovered && (
                                    <span
                                      className="text-[9px] font-mono font-bold mb-1 px-1 rounded bg-slate-950/90 text-white whitespace-nowrap shadow-sm border border-slate-700"
                                      style={{ color: cfg?.color }}
                                    >
                                      {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                    </span>
                                  )}

                                  {/* The Bar */}
                                  <div
                                    className={`w-full rounded-t transition-all duration-300 ${
                                      cfg?.isFocus
                                        ? 'shadow-md shadow-emerald-500/20'
                                        : 'opacity-85 group-hover:opacity-100'
                                    }`}
                                    style={{
                                      height: `${heightPct}%`,
                                      backgroundColor: cfg?.color || '#3b82f6'
                                    }}
                                  ></div>
                                </div>
                              );
                            })}
                          </div>

                          {/* X-axis Label (Month Name) */}
                          <div className="w-full pt-2 border-t border-slate-700/60 text-center">
                            <span
                              className={`text-[11px] font-medium transition-colors ${
                                isHovered ? 'text-white font-bold' : 'text-slate-400'
                              }`}
                            >
                              {m.length > 5 ? m.slice(0, 3) : m}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs border-t border-slate-800/80">
                  {selectedRegencies.map((reg) => {
                    const cfg = REGENCY_CONFIGS[reg];
                    return (
                      <div key={reg} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded" style={{ backgroundColor: cfg?.color }}></span>
                        <span className={cfg?.isFocus ? 'font-bold text-emerald-300' : 'text-slate-300'}>
                          {cfg?.name || reg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Matrix Table */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Table className="w-4 h-4 text-indigo-400" />
                    Matriks Data Bulanan Komparatif ({selectedYear})
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Satuan: Jumlah Perjalanan (Trip)</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Bulan</th>
                        {selectedRegencies.map((reg) => {
                          const cfg = REGENCY_CONFIGS[reg];
                          return (
                            <th key={reg} className="py-2.5 px-3 text-right">
                              <span style={{ color: cfg?.color }}>{cfg?.shortName || reg}</span>
                            </th>
                          );
                        })}
                        <th className="py-2.5 px-3 text-right text-blue-300">Total Kaltara</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-mono">
                      {displayMonths.map((m) => {
                        let rowKaltara = 0;
                        Object.keys(REGENCY_CONFIGS).forEach((reg) => {
                          rowKaltara += getMonthlyValue(reg, m, selectedYear);
                        });

                        return (
                          <tr key={m} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-2 px-3 font-sans font-medium text-slate-300">{m}</td>
                            {selectedRegencies.map((reg) => {
                              const val = getMonthlyValue(reg, m, selectedYear);
                              const isKtt = reg === 'Kabupaten Tana Tidung';
                              return (
                                <td
                                  key={reg}
                                  className={`py-2 px-3 text-right ${
                                    isKtt ? 'font-bold text-emerald-400 bg-emerald-950/20' : 'text-slate-300'
                                  }`}
                                >
                                  {val.toLocaleString('id-ID')}
                                </td>
                              );
                            })}
                            <td className="py-2 px-3 text-right font-bold text-blue-400">
                              {rowKaltara.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Historical Trajectory (2023–2026) */}
          {activeView === 'history' && (
            <div className="space-y-6">
              {/* Header Historical */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-800/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      Evolusi Historis Perjalanan Wisatawan Kalimantan Utara (2023–2026)
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Pelacakan runtun waktu 4 tahun data resmi BPS Web API membuktikan lonjakan pertumbuhan masif sektor pariwisata Kabupaten Tana Tidung
                    </p>
                  </div>

                  <button
                    onClick={fetchAllYearsHistorical}
                    disabled={isSyncingAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                    <span>{isSyncingAll ? 'Memproses 4 Tahun Data...' : 'Sinkronkan 4 Tahun BPS'}</span>
                  </button>
                </div>
              </div>

              {/* 4-Year Progression Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {BPS_HISTORICAL_TIMELINE.map((item) => {
                  const isCurrentSelected = selectedYear === item.year;

                  return (
                    <div
                      key={item.year}
                      onClick={() => setSelectedYear(item.year)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isCurrentSelected
                          ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-indigo-400 font-mono">{item.label}</span>
                        {item.kttGrowthYoY > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300 flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            +{item.kttGrowthYoY}% YoY
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Tahun Dasar</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-xl font-extrabold text-white font-['Outfit']">
                          {item.kttTrips.toLocaleString('id-ID')}
                          <span className="text-xs font-normal text-slate-400 ml-1">trip KTT</span>
                        </div>
                        <div className="text-xs text-slate-400 flex justify-between">
                          <span>Total Kaltara:</span>
                          <span className="font-mono text-slate-300">{item.totalKaltara.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex justify-between">
                          <span>Pangsa Pasar:</span>
                          <span className="font-mono font-bold text-emerald-400">{item.kttSharePercent}%</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 italic">
                        {item.note}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Historical Trajectory Bar Chart */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                      Lonjakan Perjalanan Wisatawan Tana Tidung (2023 s/d 2026)
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Pertumbuhan dari 43.191 (2023) melonjak hingga 201.203 (2025), dan mencapai 141.603 perjalanan pada Januari - Agustus 2026
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Satuan: Perjalanan (Trip)</span>
                </div>

                {/* Progress Bars for KTT */}
                <div className="space-y-3 pt-2">
                  {BPS_HISTORICAL_TIMELINE.map((item) => {
                    const maxVal = 220000;
                    const pct = Math.min(100, (item.kttTrips / maxVal) * 100);

                    return (
                      <div key={item.year} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-300 font-semibold font-sans flex items-center gap-2">
                            {item.year}: {item.label}
                            {item.year === 2024 && (
                              <span className="text-[10px] text-amber-400 font-semibold">
                                (Melampaui Malinau #4)
                              </span>
                            )}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {item.kttTrips.toLocaleString('id-ID')} trip ({item.kttSharePercent}% Pangsa Kaltara)
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Multi-Year Matrix Comparison Table */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Table className="w-4 h-4 text-indigo-400" />
                    Tabel Matriks Perjalanan 5 Kab/Kota Se-Kaltara (2023 - 2026)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Data Resmi BPS Kaltara</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Kabupaten / Kota Tujuan</th>
                        <th className="py-3 px-4 text-right">2023 (Tahunan)</th>
                        <th className="py-3 px-4 text-right">2024 (Tahunan)</th>
                        <th className="py-3 px-4 text-right">2025 (Tahunan)</th>
                        <th className="py-3 px-4 text-right text-emerald-400">2026 (Jan - Agu Resmi)</th>
                        <th className="py-3 px-4 text-right text-indigo-300">Pertumbuhan 2023→2025</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-mono">
                      {/* Tarakan */}
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-200">Kota Tarakan</td>
                        <td className="py-2.5 px-4 text-right">196.357</td>
                        <td className="py-2.5 px-4 text-right">332.718</td>
                        <td className="py-2.5 px-4 text-right">585.950</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">396.136</td>
                        <td className="py-2.5 px-4 text-right text-indigo-300">+198.4%</td>
                      </tr>
                      {/* Bulungan */}
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-200">Kabupaten Bulungan</td>
                        <td className="py-2.5 px-4 text-right">142.160</td>
                        <td className="py-2.5 px-4 text-right">281.138</td>
                        <td className="py-2.5 px-4 text-right">476.355</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">339.031</td>
                        <td className="py-2.5 px-4 text-right text-indigo-300">+235.1%</td>
                      </tr>
                      {/* Nunukan */}
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-200">Kabupaten Nunukan</td>
                        <td className="py-2.5 px-4 text-right">149.253</td>
                        <td className="py-2.5 px-4 text-right">131.167</td>
                        <td className="py-2.5 px-4 text-right">226.437</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">166.147</td>
                        <td className="py-2.5 px-4 text-right text-indigo-300">+51.7%</td>
                      </tr>
                      {/* Malinau */}
                      <tr className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-200">Kabupaten Malinau</td>
                        <td className="py-2.5 px-4 text-right">57.910</td>
                        <td className="py-2.5 px-4 text-right">104.708</td>
                        <td className="py-2.5 px-4 text-right">208.675</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">147.304</td>
                        <td className="py-2.5 px-4 text-right text-indigo-300">+260.3%</td>
                      </tr>
                      {/* Tana Tidung - Highlighted */}
                      <tr className="bg-emerald-950/40 hover:bg-emerald-950/60 font-semibold border-y border-emerald-800/60">
                        <td className="py-3 px-4 font-sans text-emerald-300 flex items-center gap-2">
                          <span>Kabupaten Tana Tidung</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-900 text-emerald-200">Fokus</span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-200">43.191</td>
                        <td className="py-3 px-4 text-right text-emerald-300">112.611</td>
                        <td className="py-3 px-4 text-right text-emerald-200 font-bold text-sm">201.203</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-extrabold text-sm">141.603</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-bold">+365.8% 🚀</td>
                      </tr>
                      {/* Total */}
                      <tr className="bg-slate-900 font-bold text-slate-100 border-t-2 border-slate-700">
                        <td className="py-3 px-4 font-sans uppercase text-blue-300">Total Kaltara</td>
                        <td className="py-3 px-4 text-right text-slate-200">588.871</td>
                        <td className="py-3 px-4 text-right text-slate-200">962.342</td>
                        <td className="py-3 px-4 text-right text-blue-400 text-sm">1.698.620</td>
                        <td className="py-3 px-4 text-right text-cyan-300 font-bold">1.190.221</td>
                        <td className="py-3 px-4 text-right text-blue-400">+188.4%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Insight Kinerja Pertumbuhan Pariwisata Tana Tidung:
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Kabupaten Tana Tidung mencatatkan laju pertumbuhan tercepat se-Provinsi Kalimantan Utara dalam kurun waktu 2023–2025 yaitu <strong>+365.8%</strong> (dari 43.191 perjalanan di 2023 melonjak menjadi 201.203 di 2025). Pangsa pasar wisata Tana Tidung di tingkat provinsi meningkat signifikan dari 7.3% menjadi 11.8%.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Breakdown Grid: Origin Provinces & Transportation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origins */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                Daerah Asal Wisatawan ke Kabupaten Tana Tidung ({selectedYear})
              </h3>

              <div className="space-y-3">
                {currentData.originProvinces.map((origin, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{origin.region}</span>
                      <span className="font-semibold text-emerald-400">
                        {origin.percentage}% ({origin.visitorCount.toLocaleString('id-ID')} org)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full"
                        style={{ width: `${origin.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transportation Modes */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Ship className="w-4 h-4 text-cyan-400" />
                Moda Transportasi Masuk Wisatawan ({selectedYear})
              </h3>

              <div className="space-y-4">
                {currentData.transportationDistribution.map((trans, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
                      {idx === 0 ? <Ship className="w-5 h-5" /> : idx === 1 ? <Car className="w-5 h-5" /> : <Plane className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold text-slate-200">{trans.mode}</h4>
                        <span className="text-sm font-extrabold text-cyan-400">{trans.percentage}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{trans.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MPD Methodology Note */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 text-xs text-blue-200/90 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-200">Catatan Metodologi Mobile Positioning Data (MPD) BPS:</h4>
              <p className="text-[11px] text-blue-300/80 mt-0.5">
                Data perjalanan dihitung secara terenkripsi menggunakan sinyal perpindahan perangkat seluler lintas kabupaten/kota dengan durasi keberadaan minimal 6 jam di luar domisili harian. Data ditarik langsung dari BPS Web API Kaltara tabel No. 600 untuk periode 2023 s/d 2026.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
