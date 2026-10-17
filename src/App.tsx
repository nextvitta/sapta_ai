import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { AdminModal } from './components/AdminModal';
import { BpsMpdModal } from './components/BpsMpdModal';
import { SocialTrendsPanel } from './components/SocialTrendsPanel';
import { SensorsCrowdControlModal } from './components/SensorsCrowdControlModal';
import { WeatherForecastWidget } from './components/WeatherForecastWidget';
import { DestinationDetailDrawer } from './components/DestinationDetailDrawer';
import { AiSituationModal } from './components/AiSituationModal';
import { RealtimeVisitorTicker } from './components/RealtimeVisitorTicker';
import { DestinationHistoryModal } from './components/DestinationHistoryModal';
import { INITIAL_DESTINATIONS } from './data/initialDestinations';
import { Destination, DestinationStatus, SensorEmergencyAlert } from './types';
import { addVisitorLog } from './utils/visitorHistoryStore';
import {
  subscribeToDestinations,
  saveDestinationToFirestore,
  saveAllDestinationsToFirestore,
  deleteDestinationFromFirestore,
  seedInitialDestinations,
  exportDestinationsToSpreadsheetCsv,
  importDestinationsFromSpreadsheetCsv
} from './services/destinationFirestoreService';
import {
  MapPin,
  TrendingUp,
  BarChart3,
  Radio,
  CloudSun,
  ShieldAlert,
  Sparkles,
  Users,
  Compass,
  AlertTriangle,
  Info,
  CheckCircle2,
  Layers,
  History,
  Database
} from 'lucide-react';

export default function App() {
  // Main Destinations State
  const [destinations, setDestinations] = useState<Destination[]>(() => {
    try {
      const saved = localStorage.getItem('ktt_destinations_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load local destinations:', e);
    }
    return INITIAL_DESTINATIONS;
  });

  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  // Active View / Modals State
  const [activeTab, setActiveTab] = useState<'map' | 'bps' | 'social' | 'sensors' | 'weather'>('map');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isBpsOpen, setIsBpsOpen] = useState<boolean>(false);
  const [isSocialOpen, setIsSocialOpen] = useState<boolean>(false);
  const [isSensorsOpen, setIsSensorsOpen] = useState<boolean>(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState<boolean>(false);
  const [isAiAdvisoryOpen, setIsAiAdvisoryOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Coordinate Picking for Admin Form
  const [isPickingCoordinates, setIsPickingCoordinates] = useState<boolean>(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null);

  const handleOpenAdminEdit = (destId: string) => {
    setEditingDestinationId(destId);
    setIsAdminOpen(true);
  };

  // Real-time visitor simulation (default false agar data konsisten antara preview & published)
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [recentActivity, setRecentActivity] = useState<{
    id: string;
    destName: string;
    type: 'in' | 'out';
    count: number;
    time: string;
  }[]>([
    { id: '1', destName: 'Air Terjun Rian', type: 'in', count: 3, time: '17:42' },
    { id: '2', destName: 'Dermaga Tideng Pale', type: 'out', count: 2, time: '17:41' }
  ]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firestore sync & persistence
  useEffect(() => {
    const unsubscribe = subscribeToDestinations(
      (cloudDestinations) => {
        if (cloudDestinations && cloudDestinations.length > 0) {
          setDestinations(cloudDestinations);
          setIsFirestoreConnected(true);
        }
      },
      (err) => {
        console.warn('[Firestore] Error connecting to cloud database, running in offline mode:', err);
        setIsFirestoreConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem('ktt_destinations_v1', JSON.stringify(destinations));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [destinations]);

  // Keep ref of destinations and selectedDestination for interval calculations without side-effects in updaters
  const destinationsRef = useRef<Destination[]>(destinations);
  useEffect(() => {
    destinationsRef.current = destinations;
  }, [destinations]);

  const selectedDestinationRef = useRef<Destination | null>(selectedDestination);
  useEffect(() => {
    selectedDestinationRef.current = selectedDestination;
  }, [selectedDestination]);

  // Visitor counts are strictly manual via Admin Panel per user configuration.
  // No automatic random mutation interval runs.

  // Calculations
  const totalVisitors = destinations.reduce((sum, d) => sum + d.currentVisitors, 0);

  // Active Emergency Alerts Count
  const activeAlertsCount = destinations.filter(
    (d) =>
      d.status === 'PENUH' ||
      d.status === 'WASPADA' ||
      d.sensors.waterLevelSensor?.status === 'WASPADA' ||
      d.sensors.waterLevelSensor?.status === 'BAHAYA'
  ).length;

  // Handlers with Cloud Database Firestore Persistence
  const handleAddDestination = async (newDest: Destination) => {
    setDestinations((prev) => {
      const updatedList = [newDest, ...prev];
      try {
        localStorage.setItem('ktt_destinations_v1', JSON.stringify(updatedList));
      } catch (e) {
        console.warn('LocalStorage save warning:', e);
      }
      return updatedList;
    });
    setIsPickingCoordinates(false);
    setPickedCoordinates(null);
    showToast(`Menyimpan destinasi "${newDest.name}" ke Cloud Database...`);

    try {
      await saveDestinationToFirestore(newDest);
      showToast(`Destinasi "${newDest.name}" berhasil tersimpan permanen di Cloud Database.`);
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
      showToast(`Gagal menyimpan ke Cloud Firestore: ${err instanceof Error ? err.message : 'Error'}`);
      throw err;
    }
  };

  const handleUpdateDestination = async (updated: Destination) => {
    const prevDest = destinations.find((d) => d.id === updated.id);
    if (prevDest && prevDest.currentVisitors !== updated.currentVisitors) {
      const delta = updated.currentVisitors - prevDest.currentVisitors;
      addVisitorLog(
        updated.id,
        updated.name,
        delta > 0 ? 'in' : 'out',
        Math.abs(delta),
        updated.currentVisitors,
        updated.maxCapacity,
        'Admin Panel Manual',
        `Koreksi manual via Admin Panel (${delta > 0 ? `+${delta}` : delta})`
      );

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const uniqueId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      setRecentActivity((old) => [
        {
          id: uniqueId,
          destName: updated.name.split('(')[0].trim(),
          type: delta > 0 ? 'in' : 'out',
          count: Math.abs(delta),
          time: timeStr
        },
        ...old.filter((item) => item.id !== uniqueId).slice(0, 5)
      ]);
    }

    setDestinations((prev) => {
      const updatedList = prev.map((d) => (d.id === updated.id ? updated : d));
      try {
        localStorage.setItem('ktt_destinations_v1', JSON.stringify(updatedList));
      } catch (e) {
        console.warn('LocalStorage save warning:', e);
      }
      return updatedList;
    });

    if (selectedDestination?.id === updated.id) {
      setSelectedDestination(updated);
    }
    setIsPickingCoordinates(false);
    setPickedCoordinates(null);
    showToast(`Menyimpan perubahan "${updated.name}" ke Cloud Database...`);

    try {
      await saveDestinationToFirestore(updated);
      showToast(`Perubahan "${updated.name}" tersimpan permanen di Cloud Database.`);
    } catch (err) {
      console.error('Failed to update in Firestore:', err);
      showToast(`Gagal memperbarui di Cloud Firestore: ${err instanceof Error ? err.message : 'Error'}`);
      throw err;
    }
  };

  const handleDeleteDestination = async (id: string) => {
    setDestinations((prev) => {
      const updatedList = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem('ktt_destinations_v1', JSON.stringify(updatedList));
      } catch (e) {
        console.warn('LocalStorage save warning:', e);
      }
      return updatedList;
    });

    if (selectedDestination?.id === id) {
      setSelectedDestination(null);
    }
    setIsPickingCoordinates(false);
    setPickedCoordinates(null);
    showToast('Menghapus destinasi dari Cloud Database...');

    try {
      await deleteDestinationFromFirestore(id);
      showToast('Destinasi berhasil dihapus permanen dari Cloud Database.');
    } catch (err) {
      console.error('Failed to delete from Firestore:', err);
      showToast(`Gagal menghapus dari Cloud Firestore: ${err instanceof Error ? err.message : 'Error'}`);
      throw err;
    }
  };

  const handleCancelPickingCoordinates = () => {
    setIsPickingCoordinates(false);
    showToast('Pemilihan koordinat di peta dibatalkan.');
  };

  const handleResetDefaults = async () => {
    setDestinations(INITIAL_DESTINATIONS);
    localStorage.removeItem('ktt_destinations_v1');
    showToast('Menyinkronkan data default resmi KTT ke Cloud Database...');
    try {
      await seedInitialDestinations();
      showToast('Data default resmi Kabupaten Tana Tidung berhasil disinkronkan ke Cloud Database.');
    } catch (err) {
      console.error('Failed to reset defaults in Firestore:', err);
      showToast('Data default dimuat di sesi lokal.');
    }
  };

  const handleExportSpreadsheet = () => {
    exportDestinationsToSpreadsheetCsv(destinations, 'SAPTA_AI_Destinasi_Tana_Tidung');
    showToast('File spreadsheet (CSV) berhasil diunduh. Siap dibuka di Google Sheets atau Microsoft Excel.');
  };

  const handleImportSpreadsheet = async (csvText: string) => {
    try {
      showToast('Mengimpor spreadsheet dan menyinkronkan ke Cloud Database...');
      const imported = await importDestinationsFromSpreadsheetCsv(csvText);
      setDestinations(imported);
      showToast(`Berhasil mengimpor ${imported.length} destinasi dari spreadsheet ke Cloud Database.`);
    } catch (err) {
      console.error('Spreadsheet import error:', err);
      showToast(`Gagal mengimpor spreadsheet: ${err instanceof Error ? err.message : 'Format CSV tidak valid'}`);
    }
  };

  const handleSyncAllToFirestore = async () => {
    try {
      showToast('Menyinkronkan seluruh data destinasi ke Cloud Firestore...');
      await saveAllDestinationsToFirestore(destinations);
      showToast('Seluruh data berhasil disinkronkan ke Cloud Firestore (Preview & Published sinkron).');
    } catch (err) {
      console.error('Failed to sync all destinations to Firestore:', err);
      showToast('Gagal menyinkronkan data ke Cloud Firestore.');
    }
  };

  const handleUpdateVisitors = (id: string, delta: number) => {
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const newCount = Math.max(0, Math.min(d.maxCapacity, d.currentVisitors + delta));
        const percent = Math.round((newCount / d.maxCapacity) * 100);
        let newStatus: DestinationStatus = 'NORMAL';
        if (percent >= 90) newStatus = 'PENUH';
        else if (percent >= 75) newStatus = 'WASPADA';

        // Record manual turnstile operation to visitor history store
        addVisitorLog(
          d.id,
          d.name,
          delta > 0 ? 'in' : 'out',
          Math.abs(delta),
          newCount,
          d.maxCapacity,
          delta > 0 ? 'Turnstile Pintu Masuk' : 'Pintu Keluar Turnstile',
          delta > 0
            ? `+${delta} pengunjung masuk pos tiket manual`
            : `${Math.abs(delta)} pengunjung keluar area wisata manual`
        );

        const updated: Destination = {
          ...d,
          currentVisitors: newCount,
          status: newStatus,
          sensors: {
            ...d.sensors,
            crowdSensor: {
              ...d.sensors.crowdSensor,
              currentDensityPercent: percent,
              liveDetectionCount: newCount,
              status: percent >= 90 ? 'CRITICAL' : percent >= 75 ? 'WARNING' : 'NORMAL'
            }
          }
        };

        if (selectedDestination?.id === id) {
          setSelectedDestination(updated);
        }

        // Sinkronkan perubahan jumlah pengunjung ke Cloud Firestore
        saveDestinationToFirestore(updated).catch((err) =>
          console.warn('[Firestore] Gagal menyimpan update pengunjung ke cloud:', err)
        );

        return updated;
      })
    );
  };

  const handleCoordinatePicked = (lat: number, lng: number) => {
    setPickedCoordinates({ lat, lng });
    setIsPickingCoordinates(false);
    setIsAdminOpen(true);
    showToast(`Koordinat dipilih: ${lat}, ${lng}`);
  };

  const handleTriggerAlertAction = (destId: string, actionName: string) => {
    showToast(`Aksi Dijalankan: ${actionName}`);
  };

  const handleDispatchWasteTruck = (destId: string) => {
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA';
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id !== destId || !d.sensors.wasteSensor) return d;
        const updated: Destination = {
          ...d,
          sensors: {
            ...d.sensors,
            wasteSensor: {
              ...d.sensors.wasteSensor,
              isDispatched: true,
              dispatchedAt: nowStr
            }
          }
        };
        if (selectedDestination?.id === destId) {
          setSelectedDestination(updated);
        }

        saveDestinationToFirestore(updated).catch((err) =>
          console.warn('[Firestore] Gagal menyimpan status truk sampah ke cloud:', err)
        );

        return updated;
      })
    );
    showToast('Armada Truk DLH Tana Tidung telah diberangkatkan menuju lokasi.');
  };

  const handleEmptyWasteStation = (destId: string) => {
    const nowStr = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA';
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id !== destId || !d.sensors.wasteSensor) return d;
        const updated: Destination = {
          ...d,
          sensors: {
            ...d.sensors,
            wasteSensor: {
              ...d.sensors.wasteSensor,
              currentLoadKg: 15,
              fillLevelPercent: Math.round((15 / d.sensors.wasteSensor.capacityKg) * 100),
              status: 'NORMAL',
              isDispatched: false,
              dispatchedAt: undefined,
              lastEmptiedTime: nowStr,
              methanePpm: 2.1
            }
          }
        };
        if (selectedDestination?.id === destId) {
          setSelectedDestination(updated);
        }

        saveDestinationToFirestore(updated).catch((err) =>
          console.warn('[Firestore] Gagal menyimpan pembersihan bak sampah ke cloud:', err)
        );

        return updated;
      })
    );
    showToast('Bak penampungan TPS berhasil dikosongkan dan dibersihkan.');
  };

  const handleSimulateSurge = () => {
    setDestinations((prev) =>
      prev.map((d) => {
        const added = Math.floor(d.maxCapacity * 0.25);
        const newCount = Math.min(d.maxCapacity, d.currentVisitors + added);
        const percent = Math.round((newCount / d.maxCapacity) * 100);

        let simulatedWaste = d.sensors.wasteSensor;
        if (simulatedWaste) {
          const newLoad = Math.min(simulatedWaste.capacityKg, Math.round(simulatedWaste.currentLoadKg * 1.35));
          const newFill = Math.min(100, Math.round((newLoad / simulatedWaste.capacityKg) * 100));
          simulatedWaste = {
            ...simulatedWaste,
            currentLoadKg: newLoad,
            fillLevelPercent: newFill,
            status: newFill >= 90 ? 'PENUH' : newFill >= 70 ? 'HAMPIR_PENUH' : 'NORMAL'
          };
        }

        return {
          ...d,
          currentVisitors: newCount,
          status: percent >= 90 ? 'PENUH' : percent >= 75 ? 'WASPADA' : 'NORMAL',
          sensors: {
            ...d.sensors,
            crowdSensor: {
              ...d.sensors.crowdSensor,
              currentDensityPercent: percent,
              liveDetectionCount: newCount,
              status: percent >= 90 ? 'CRITICAL' : percent >= 75 ? 'WARNING' : 'NORMAL'
            },
            ...(d.sensors.waterLevelSensor
              ? {
                  waterLevelSensor: {
                    ...d.sensors.waterLevelSensor,
                    currentLevelMeter: Number((d.sensors.waterLevelSensor.currentLevelMeter + 0.6).toFixed(2)),
                    status: 'WASPADA'
                  }
                }
              : {}),
            wasteSensor: simulatedWaste
          }
        };
      })
    );
    showToast('Simulasi lonjakan pengunjung, kenaikan TMA sungai, dan peningkatan volume sampah diterapkan.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        destinations={destinations}
        totalVisitors={totalVisitors}
        activeAlertsCount={activeAlertsCount}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenBpsMpd={() => setIsBpsOpen(true)}
        onOpenSocialTrends={() => setIsSocialOpen(true)}
        onOpenSensors={() => setIsSensorsOpen(true)}
        onOpenWeather={() => setIsWeatherOpen(true)}
        onOpenAiAdvisory={() => setIsAiAdvisoryOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        isFirestoreConnected={isFirestoreConnected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4">
        {/* Real-time Ticker Bar */}
        <RealtimeVisitorTicker
          destinations={destinations}
          totalVisitors={totalVisitors}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
          recentActivity={recentActivity}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Dynamic View rendering based on active tab or primary interactive map */}
        <div className="flex-1 w-full grid grid-cols-1 gap-4">
          <MapView
            destinations={destinations}
            onSelectDestination={(dest) => setSelectedDestination(dest)}
            selectedDestination={selectedDestination}
            isPickingCoordinates={isPickingCoordinates}
            onCoordinatePicked={handleCoordinatePicked}
            onCancelPicking={handleCancelPickingCoordinates}
            onOpenAiAdvisory={() => setIsAiAdvisoryOpen(true)}
            onOpenAdminEdit={handleOpenAdminEdit}
          />
        </div>

        {/* Quick Access Feature Cards for Secondary Modules & AI Analysis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Real-time Visitor History Card (Turnstile In/Out & Exports) */}
          <div
            id="btn-quick-visitor-history"
            onClick={() => setIsHistoryModalOpen(true)}
            className="p-4 rounded-xl bg-gradient-to-br from-slate-900/95 via-emerald-950/20 to-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 hover:shadow-emerald-950/50 transition-all cursor-pointer group shadow-lg flex items-start gap-3.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform shadow-inner">
              <History className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                Turnstile Realtime
              </span>
              <h3 className="font-bold text-sm text-slate-100 mt-0.5 group-hover:text-emerald-300 transition-colors">
                Histori Pengunjung
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Grafik arus masuk/keluar, filter jam/hari/bulan & ekspor CSV mentah.
              </p>
            </div>
          </div>

          {/* AI Situation & Strategy Advisory Card (Prominent Access) */}
          <div
            id="btn-quick-ai-advisory"
            onClick={() => setIsAiAdvisoryOpen(true)}
            className="p-4 rounded-xl bg-gradient-to-br from-slate-900/95 via-purple-950/25 to-slate-900/90 border border-purple-500/40 hover:border-purple-400 hover:shadow-purple-950/50 transition-all cursor-pointer group shadow-lg flex items-start gap-3.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 transition-transform shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                Gemini AI Advisory
              </span>
              <h3 className="font-bold text-sm text-slate-100 mt-0.5 group-hover:text-purple-300 transition-colors">
                Analisis AI Seluruh Data
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Analisis holistik lonjakan pengunjung, risiko TMA banjir, timbulan sampah TPS, & strategi taktis.
              </p>
            </div>
          </div>

          {/* BPS MPD Card */}
          <div
            id="btn-quick-bps-mpd"
            onClick={() => setIsBpsOpen(true)}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-lg flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                BPS Kaltara MPD
              </span>
              <h3 className="font-bold text-sm text-slate-100 mt-0.5">Statistik Wisnus & Wisman</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                168.400 perjalanan tercatat via Mobile Positioning Data & analisis moda transportasi.
              </p>
            </div>
          </div>

          {/* Social Media Radar Card */}
          <div
            id="btn-quick-social-trends"
            onClick={() => setIsSocialOpen(true)}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 transition-all cursor-pointer group shadow-lg flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider">
                Trend Medsos & Viral
              </span>
              <h3 className="font-bold text-sm text-slate-100 mt-0.5">Tagar & Sentimen Viral</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                #WisataTanaTidung & Air Terjun Rian viral di TikTok. 88% sentimen positif.
              </p>
            </div>
          </div>

          {/* IoT & Crowd Control Card */}
          <div
            id="btn-quick-sensors"
            onClick={() => setIsSensorsOpen(true)}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-lg flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                IoT & EWS Bencana
              </span>
              <h3 className="font-bold text-sm text-slate-100 mt-0.5">Crowd Control & TMA Sungai</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Sensor LiDAR turnstile, hidrometri banjir DAS Sesayap & inclinometer longsor.
              </p>
            </div>
          </div>

          {/* Weather & Air Quality Widget Card */}
          <div
            id="btn-quick-weather"
            onClick={() => setIsWeatherOpen(true)}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-lg flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
              <CloudSun className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Cuaca & Kualitas Udara
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AQI 27 • Baik
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-100 mt-0.5">Prakiraan Cuaca & Udara KTT</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                30°C Cerah Berawan. Udara bersih & segar (PM2.5: 6.4 µg). Waspada potensi hujan lokal sore hari.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Slide-out Destination Detail Drawer */}
      <DestinationDetailDrawer
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
        onUpdateVisitors={handleUpdateVisitors}
        onOpenAdminEdit={handleOpenAdminEdit}
        onDispatchWasteTruck={handleDispatchWasteTruck}
        onEmptyWasteStation={handleEmptyWasteStation}
      />

      {/* Admin Destination Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setEditingDestinationId(null);
          setIsPickingCoordinates(false);
          setPickedCoordinates(null);
        }}
        destinations={destinations}
        onAddDestination={handleAddDestination}
        onUpdateDestination={handleUpdateDestination}
        onDeleteDestination={handleDeleteDestination}
        onResetDefaults={handleResetDefaults}
        onStartPickingCoordinates={() => {
          setIsPickingCoordinates(true);
          showToast('Mode Pilih Koordinat Aktif: Silakan klik sembarang titik pada peta Tana Tidung.');
        }}
        pickedCoordinates={pickedCoordinates}
        initialEditDestinationId={editingDestinationId}
        onClearInitialEdit={() => setEditingDestinationId(null)}
        isPickingCoordinates={isPickingCoordinates}
        onCancelPickingCoordinates={handleCancelPickingCoordinates}
        isFirestoreConnected={isFirestoreConnected}
        onExportSpreadsheet={handleExportSpreadsheet}
        onImportSpreadsheet={handleImportSpreadsheet}
        onSyncAllToFirestore={handleSyncAllToFirestore}
      />

      {/* BPS MPD Modal */}
      <BpsMpdModal isOpen={isBpsOpen} onClose={() => setIsBpsOpen(false)} />

      {/* Social Trends & Viral Listening Modal */}
      <SocialTrendsPanel
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        onAnalyzeAi={() => {
          setIsSocialOpen(false);
          setIsAiAdvisoryOpen(true);
        }}
      />

      {/* IoT Sensors & Crowd Control Modal */}
      <SensorsCrowdControlModal
        isOpen={isSensorsOpen}
        onClose={() => setIsSensorsOpen(false)}
        destinations={destinations}
        onTriggerAlertAction={handleTriggerAlertAction}
        onSimulateSurge={handleSimulateSurge}
        onDispatchWasteTruck={handleDispatchWasteTruck}
        onEmptyWasteStation={handleEmptyWasteStation}
      />

      {/* Weather Forecast Modal */}
      <WeatherForecastWidget isOpen={isWeatherOpen} onClose={() => setIsWeatherOpen(false)} />

      {/* AI Situation & Strategy Advisory Modal */}
      <AiSituationModal
        isOpen={isAiAdvisoryOpen}
        onClose={() => setIsAiAdvisoryOpen(false)}
        destinations={destinations}
        totalVisitors={totalVisitors}
      />

      {/* Real-time Visitor History & Dynamics Analytics Modal */}
      {isHistoryModalOpen && (
        <DestinationHistoryModal
          destinations={destinations}
          initialDestinationId={selectedDestination?.id}
          onClose={() => setIsHistoryModalOpen(false)}
          onSelectDestination={(dest) => {
            setSelectedDestination(dest);
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/60 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
