import React, { useState } from 'react';
import {
  X,
  Radio,
  ShieldAlert,
  Users,
  Droplets,
  Mountain,
  Wind,
  Trash2,
  Truck,
  Scale,
  Sparkles,
  AlertTriangle,
  BellRing,
  Megaphone,
  CheckCircle2,
  Play,
  Volume2,
  RefreshCw,
  Send,
  Clock,
  Gauge
} from 'lucide-react';
import { Destination, SensorEmergencyAlert } from '../types';

interface SensorsCrowdControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  onTriggerAlertAction: (alertId: string, actionName: string) => void;
  onSimulateSurge: () => void;
  onDispatchWasteTruck?: (destId: string) => void;
  onEmptyWasteStation?: (destId: string) => void;
  onSimulateWasteSurge?: (destId: string) => void;
}

export const SensorsCrowdControlModal: React.FC<SensorsCrowdControlModalProps> = ({
  isOpen,
  onClose,
  destinations,
  onTriggerAlertAction,
  onSimulateSurge,
  onDispatchWasteTruck,
  onEmptyWasteStation,
  onSimulateWasteSurge
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'waste' | 'crowd' | 'water' | 'landslide'>('overview');
  const [wasteFilter, setWasteFilter] = useState<'ALL' | 'ATTENTION' | 'NORMAL'>('ALL');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter destinations with specific sensors
  const waterSensorDests = destinations.filter((d) => d.sensors.waterLevelSensor?.active);
  const landslideSensorDests = destinations.filter((d) => d.sensors.landslideSensor?.active);
  const wasteSensorDests = destinations.filter((d) => d.sensors.wasteSensor?.active);
  const crowdedDests = destinations.filter(
    (d) => d.currentVisitors / d.maxCapacity >= 0.75 || d.status === 'WASPADA' || d.status === 'PENUH'
  );

  // Waste metrics
  const fullWasteDests = wasteSensorDests.filter((d) => d.sensors.wasteSensor?.status === 'PENUH');
  const nearFullWasteDests = wasteSensorDests.filter((d) => d.sensors.wasteSensor?.status === 'HAMPIR_PENUH');
  const totalWasteKg = wasteSensorDests.reduce((acc, d) => acc + (d.sensors.wasteSensor?.currentLoadKg || 0), 0);
  const totalWasteCapacityKg = wasteSensorDests.reduce((acc, d) => acc + (d.sensors.wasteSensor?.capacityKg || 0), 0);
  const avgWasteFillPercent = wasteSensorDests.length > 0
    ? Math.round(wasteSensorDests.reduce((acc, d) => acc + (d.sensors.wasteSensor?.fillLevelPercent || 0), 0) / wasteSensorDests.length)
    : 0;

  const filteredWasteDests = wasteSensorDests.filter((d) => {
    if (wasteFilter === 'ATTENTION') {
      return d.sensors.wasteSensor?.status === 'PENUH' || d.sensors.wasteSensor?.status === 'HAMPIR_PENUH';
    }
    if (wasteFilter === 'NORMAL') {
      return d.sensors.wasteSensor?.status === 'NORMAL';
    }
    return true;
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastMessage('');
    }, 3000);
  };

  const handleBatchDispatchAll = () => {
    const needDispatch = wasteSensorDests.filter(
      (d) => (d.sensors.wasteSensor?.status === 'PENUH' || d.sensors.wasteSensor?.status === 'HAMPIR_PENUH') && !d.sensors.wasteSensor?.isDispatched
    );
    needDispatch.forEach((d) => {
      if (onDispatchWasteTruck) {
        onDispatchWasteTruck(d.id);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-['Outfit']">
                  Pusat Kendali Sensor IoT, Crowd Control & Mitigasi Bencana
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-950 border border-amber-600/50 text-amber-300 rounded-full flex items-center gap-1">
                  <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                  TELEMETRI AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kabupaten Tana Tidung Kalimantan Utara • Terintegrasi BPBD KTT, BMKG & Pokdarwis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSimulateSurge}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Simulasi lonjakan pengunjung akhir pekan atau kenaikan debit air"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulasi Uji Beban</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-stretch border-b border-slate-800 px-6 bg-slate-950/40 text-xs overflow-x-auto h-[40px] min-h-[40px] max-h-[40px] shrink-0">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`h-full px-4 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'overview'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Ringkasan Seluruh Sensor</span>
          </button>
          <button
            onClick={() => setActiveSubTab('waste')}
            className={`h-full px-4 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'waste'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sensor Sampah & TPS ({wasteSensorDests.length})</span>
            {fullWasteDests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-pulse">
                {fullWasteDests.length} Penuh
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('crowd')}
            className={`h-full px-4 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'crowd'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Crowd Control ({crowdedDests.length} Destinasi Padat)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('water')}
            className={`h-full px-4 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'water'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>EWS Banjir & TMA Sungai ({waterSensorDests.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('landslide')}
            className={`h-full px-4 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'landslide'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>EWS Longsor & Getaran ({landslideSensorDests.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Sensor Status Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Sensor LiDAR Crowd</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-slate-100 font-['Outfit']">
                {destinations.length} Titik
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                {crowdedDests.length > 0 ? `${crowdedDests.length} mendekati batas` : 'Kondisi normal'}
              </p>
            </div>

            <div
              onClick={() => setActiveSubTab('waste')}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-700/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 group-hover:text-emerald-300 transition-colors">Sensor Sampah TPS</span>
                <Trash2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-emerald-400 font-['Outfit']">
                {wasteSensorDests.length} TPS IoT
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                {fullWasteDests.length > 0 ? (
                  <span className="text-rose-400 font-semibold">{fullWasteDests.length} TPS Penuh ({totalWasteKg} kg)</span>
                ) : (
                  <span>{totalWasteKg.toLocaleString()} kg tumpukan terdata</span>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">EWS Muka Air (TMA)</span>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-xl font-bold text-cyan-400 font-['Outfit']">
                {waterSensorDests.length} Stasiun
              </span>
              <p className="text-[11px] text-slate-500 mt-1">DAS Sungai Sesayap</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Inclinometer Tebing</span>
                <Mountain className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xl font-bold text-amber-400 font-['Outfit']">
                {landslideSensorDests.length} Titik
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Rian & Batu Dowok</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Kualitas Udara</span>
                <Wind className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-xl font-bold text-teal-400 font-['Outfit']">
                22 AQI
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Sangat Bersih & Sejuk</p>
            </div>
          </div>

          {/* Waste Sensor & TPS Management Section */}
          {(activeSubTab === 'overview' || activeSubTab === 'waste') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-900/40">
                <div>
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-100 font-['Outfit']">
                      Sensor & Pengendalian Tumpukan Sampah TPS Sementara (IoT Smart Waste)
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 border border-emerald-600/50 text-emerald-300 rounded-full">
                      DLH Tana Tidung
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Sensor ultrasonik ketinggian volume & load cell beban terpasang di Tempat Pembuangan Sampah Sementara tiap destinasi wisata
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(fullWasteDests.length > 0 || nearFullWasteDests.length > 0) && (
                    <button
                      onClick={handleBatchDispatchAll}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-rose-950/50"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Tugaskan Armada DLH Serentak ({fullWasteDests.length + nearFullWasteDests.length})</span>
                    </button>
                  )}
                  {activeSubTab === 'waste' && (
                    <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px]">
                      <button
                        onClick={() => setWasteFilter('ALL')}
                        className={`px-2.5 py-1 rounded cursor-pointer ${wasteFilter === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'}`}
                      >
                        Semua ({wasteSensorDests.length})
                      </button>
                      <button
                        onClick={() => setWasteFilter('ATTENTION')}
                        className={`px-2.5 py-1 rounded cursor-pointer ${wasteFilter === 'ATTENTION' ? 'bg-slate-800 text-amber-300 font-semibold' : 'text-slate-400'}`}
                      >
                        Perlu Angkut ({fullWasteDests.length + nearFullWasteDests.length})
                      </button>
                      <button
                        onClick={() => setWasteFilter('NORMAL')}
                        className={`px-2.5 py-1 rounded cursor-pointer ${wasteFilter === 'NORMAL' ? 'bg-slate-800 text-emerald-300 font-semibold' : 'text-slate-400'}`}
                      >
                        Normal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* TPS Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWasteDests.map((dest) => {
                  const sensor = dest.sensors.wasteSensor!;
                  const isFull = sensor.status === 'PENUH';
                  const isNearFull = sensor.status === 'HAMPIR_PENUH';

                  return (
                    <div
                      key={`waste-${dest.id}`}
                      className={`p-4 rounded-xl border transition-all ${
                        isFull
                          ? 'bg-rose-950/20 border-rose-800/80'
                          : isNearFull
                          ? 'bg-amber-950/20 border-amber-800/70'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      {/* Top bar */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-100">{dest.name}</h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                              {dest.kecamatan}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            {sensor.stationName}
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isFull
                              ? 'bg-rose-900/90 text-rose-200 border border-rose-600 animate-pulse'
                              : isNearFull
                              ? 'bg-amber-900/90 text-amber-200 border border-amber-600'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          }`}
                        >
                          {isFull ? '🔴 PENUH (KRITIS)' : isNearFull ? '🟡 HAMPIR PENUH' : '🟢 NORMAL'}
                        </span>
                      </div>

                      {/* Fill level gauge */}
                      <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800/80 mb-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                            Ketinggian Tumpukan & Beban:
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              isFull ? 'text-rose-400' : isNearFull ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {sensor.fillLevelPercent}% ({sensor.currentLoadKg} / {sensor.capacityKg} kg)
                          </span>
                        </div>

                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isFull
                                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                : isNearFull
                                ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(sensor.fillLevelPercent, 100)}%` }}
                          />
                        </div>

                        {/* Sensor environmental telemetry */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800/60 text-[11px]">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Detektor Metana (Bau):</span>
                            <span className="font-mono font-semibold text-slate-200">
                              {sensor.methanePpm || 5.2} ppm
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Suhu Tumpukan:</span>
                            <span className="font-mono font-semibold text-slate-200">
                              {sensor.temperatureCelsius || 28.5}°C
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Pengosongan Terakhir:</span>
                            <span className="text-slate-300 font-medium">
                              {sensor.lastEmptiedTime || '07:00 WITA'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Jadwal Angkut:</span>
                            <span className="text-slate-300 font-medium truncate max-w-[120px]" title={sensor.collectionSchedule}>
                              {sensor.collectionSchedule || 'Rutin Harian'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dispatch indicator */}
                      {sensor.isDispatched && (
                        <div className="mb-3 p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-emerald-400 animate-bounce" />
                            <span className="font-medium">Armada Truk DLH sedang menuju lokasi (~20 Menit)</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {sensor.dispatchedAt || 'Baru saja'}
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                        <button
                          onClick={() => onSimulateWasteSurge && onSimulateWasteSurge(dest.id)}
                          className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Simulasi penambahan buangan sampah wisatawan (+20%)"
                        >
                          <Play className="w-3 h-3 text-slate-400" />
                          <span>+20% Sampah</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onEmptyWasteStation && onEmptyWasteStation(dest.id)}
                            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-200 text-slate-300 border border-slate-700 hover:border-emerald-600/60 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Tandai bak TPS sudah selesai dikosongkan dan dibersihkan oleh petugas"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Catat Dikosongkan</span>
                          </button>

                          <button
                            onClick={() => onDispatchWasteTruck && onDispatchWasteTruck(dest.id)}
                            disabled={sensor.isDispatched}
                            className={`px-3 py-1 text-xs rounded font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              sensor.isDispatched
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : isFull
                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            <Truck className="w-3 h-3" />
                            <span>{sensor.isDispatched ? 'Armada Bergerak' : 'Panggil Truk DLH'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Crowd Control Actions & Status */}
          {(activeSubTab === 'overview' || activeSubTab === 'crowd') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Matriks Kepadatan Wisatawan (Crowd Density Matrix)
                </h3>
                <span className="text-xs text-slate-400">Ambang Batas Waspada: &gt;75% Kapasitas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destinations.map((dest) => {
                  const percent = Math.round((dest.currentVisitors / dest.maxCapacity) * 100);
                  const isHigh = percent >= 75;
                  return (
                    <div
                      key={dest.id}
                      className={`p-4 rounded-xl border transition-all ${
                        percent >= 90
                          ? 'bg-rose-950/40 border-rose-600/70 shadow-lg shadow-rose-950/40'
                          : isHigh
                          ? 'bg-amber-950/40 border-amber-600/70'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-100">{dest.name}</h4>
                          <span className="text-xs text-slate-400">Kec. {dest.kecamatan}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            percent >= 90
                              ? 'bg-rose-600 text-white animate-pulse'
                              : isHigh
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {percent >= 90 ? 'PENUH (OVERCROWD)' : isHigh ? 'WASPADA PADAT' : 'LANCAR'}
                        </span>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Jumlah Terdeteksi Sensor:</span>
                          <span className="font-bold text-slate-200">
                            {dest.currentVisitors} / {dest.maxCapacity} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent >= 90 ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Direct Action Buttons for Crowd */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                        <button
                          onClick={() =>
                            onTriggerAlertAction(
                              dest.id,
                              `Sistem Buka-Tutup Akses diaktifkan untuk ${dest.name}`
                            )
                          }
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Buka-Tutup Gerbang</span>
                        </button>
                        <button
                          onClick={() =>
                            onTriggerAlertAction(
                              dest.id,
                              `Petugas Lapangan & Satgas dikerahkan ke ${dest.name}`
                            )
                          }
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Kirim Petugas</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Water Level / Flood EWS */}
          {(activeSubTab === 'overview' || activeSubTab === 'water') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Early Warning System (EWS) Tinggi Muka Air (TMA) Sungai Sesayap
                </h3>
                <span className="text-xs text-slate-400">
                  Sensor Ultrasonik IoT Hidrometri Terhubung BPBD KTT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {waterSensorDests.map((dest) => {
                  const sensor = dest.sensors.waterLevelSensor!;
                  return (
                    <div
                      key={dest.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm text-slate-100">{sensor.locationName}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sensor.status === 'BAHAYA'
                                ? 'bg-rose-600 text-white'
                                : sensor.status === 'WASPADA'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            STATUS: {sensor.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">Lokasi: {dest.name}</p>

                        <div className="text-xs space-y-1 text-slate-300">
                          <div>
                            Tinggi Air Saat Ini:{' '}
                            <strong className="text-base text-cyan-400 font-mono">
                              {sensor.currentLevelMeter} meter
                            </strong>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Normal: &lt;{sensor.normalLevelMeter}m • Waspada: {sensor.warningLevelMeter}m • Bahaya:{' '}
                            {sensor.dangerLevelMeter}m
                          </div>
                        </div>
                      </div>

                      {/* Water Level Gauge Illustration */}
                      <div className="w-16 h-28 bg-slate-900 border border-slate-700 rounded-lg p-1 flex flex-col justify-end items-center relative shrink-0">
                        <span className="absolute top-1 text-[9px] text-slate-400 font-mono">
                          {sensor.dangerLevelMeter}m
                        </span>
                        <div
                          className={`w-full rounded-b transition-all duration-500 ${
                            sensor.status === 'BAHAYA'
                              ? 'bg-rose-500'
                              : sensor.status === 'WASPADA'
                              ? 'bg-amber-500'
                              : 'bg-cyan-500'
                          }`}
                          style={{
                            height: `${Math.min((sensor.currentLevelMeter / sensor.dangerLevelMeter) * 100, 100)}%`
                          }}
                        ></div>
                        <span className="absolute bottom-1 text-[10px] text-white font-bold font-mono">
                          {sensor.currentLevelMeter}m
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Landslide Inclinometer Sensor */}
          {(activeSubTab === 'overview' || activeSubTab === 'landslide') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-amber-400" />
                  Sensor Kemiringan Lereng & Getaran Tebing (Inclinometer)
                </h3>
                <span className="text-xs text-slate-400">
                  Pemantauan Risiko Longsor di Kawasan Perbukitan
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {landslideSensorDests.map((dest) => {
                  const sensor = dest.sensors.landslideSensor!;
                  return (
                    <div key={dest.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-slate-100">{sensor.locationName}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-600/50 text-emerald-300">
                          {sensor.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{dest.name} ({dest.kecamatan})</p>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Sudut Kemiringan:</span>
                          <strong className="text-amber-400 font-mono text-sm">{sensor.tiltAngleDegree}°</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Frekuensi Getaran:</span>
                          <strong className="text-slate-200 font-mono text-sm">{sensor.vibrationMm} mm/s</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Emergency Broadcast Form */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-slate-100">Broadcast Pengumuman Pengeras Suara & Peringatan</h3>
            </div>
            <p className="text-xs text-slate-400">
              Kirimkan instruksi keselamatan, himbauan crowd control, atau pemberitahuan cuaca langsung ke speaker pintar di lokasi destinasi wisata.
            </p>

            <form onSubmit={handleSendBroadcast} className="flex gap-2">
              <input
                type="text"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Contoh: Perhatian pengunjung, harap membuang sampah pada bak TPS terdekat atau debit air sungai meningkat..."
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Siarkan</span>
              </button>
            </form>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="text-slate-500 self-center">Template Cepat:</span>
              <button
                type="button"
                onClick={() => setBroadcastMessage('Himbauan DLH: Mohon para wisatawan menjaga kebersihan destinasi dan membuang sampah pada bak TPS terpilah yang telah disediakan.')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-900/60 transition-colors cursor-pointer"
              >
                🗑️ Himbauan Buang Sampah di TPS
              </button>
              <button
                type="button"
                onClick={() => setBroadcastMessage('Peringatan BPBD KTT: Debit air Sungai Sesayap terpantau naik, pengunjung dermaga apung diwajibkan menggunakan life jacket.')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-900/60 transition-colors cursor-pointer"
              >
                🌊 Waspada Debit TMA Sungai
              </button>
              <button
                type="button"
                onClick={() => setBroadcastMessage('Pemberitahuan: Petugas armada DLH Kabupaten Tana Tidung sedang dalam perjalanan mengosongkan bak TPS di area wisata.')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/60 transition-colors cursor-pointer"
              >
                🚛 Armada Truk DLH Menuju Lokasi
              </button>
            </div>

            {broadcastSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pengumuman berhasil disiarkan ke seluruh pengeras suara pintar destinasi!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
