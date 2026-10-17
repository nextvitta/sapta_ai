import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Ticket,
  Users,
  Radio,
  Droplets,
  Mountain,
  Wind,
  Phone,
  Navigation,
  ExternalLink,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Star,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Trash2,
  Truck,
  Scale,
  Gauge
} from 'lucide-react';
import { Destination, DestinationStatus, GooglePlaceData } from '../types';
import { getGooglePlaceInfoForDestination } from '../data/googlePlacesDatabase';
import { VisitorHistorySection } from './VisitorHistorySection';

interface DestinationDetailDrawerProps {
  destination: Destination | null;
  onClose: () => void;
  onUpdateVisitors: (id: string, delta: number) => void;
  onOpenAdminEdit?: (destId: string) => void;
  onDispatchWasteTruck?: (destId: string) => void;
  onEmptyWasteStation?: (destId: string) => void;
}

export const DestinationDetailDrawer: React.FC<DestinationDetailDrawerProps> = ({
  destination,
  onClose,
  onUpdateVisitors,
  onOpenAdminEdit,
  onDispatchWasteTruck,
  onEmptyWasteStation
}) => {
  const [placeData, setPlaceData] = useState<GooglePlaceData | null>(null);
  const [isSyncingPlaces, setIsSyncingPlaces] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    if (destination) {
      // Initialize with existing data or database
      const initialData =
        destination.googlePlacesData ||
        getGooglePlaceInfoForDestination(destination.id, destination.name);
      setPlaceData(initialData);
      setSyncStatus(null);
    } else {
      setPlaceData(null);
    }
  }, [destination?.id, destination?.name]);

  const handleSyncGooglePlaces = async () => {
    if (!destination) return;
    setIsSyncingPlaces(true);
    setSyncStatus('Menghubungi Google Places API...');

    try {
      const url = `/api/places/details?name=${encodeURIComponent(destination.name)}&id=${destination.id}&lat=${destination.lat}&lng=${destination.lng}&placeId=${destination.googlePlaceId || ''}`;
      const res = await fetch(url);
      const result = await res.json();

      if (result.success && result.data) {
        setPlaceData(result.data);
        setSyncStatus('Tersinkronisasi langsung dengan Google Places API');
      } else {
        // Fallback to verified database
        const fallbackData = getGooglePlaceInfoForDestination(destination.id, destination.name);
        setPlaceData(fallbackData);
        setSyncStatus(result.message || 'Menggunakan data terverifikasi Google Maps');
      }
    } catch (err: any) {
      console.warn('Sync Google Places error:', err.message);
      const fallbackData = getGooglePlaceInfoForDestination(destination.id, destination.name);
      setPlaceData(fallbackData);
      setSyncStatus('Terhubung ke database ulasan terverifikasi');
    } finally {
      setIsSyncingPlaces(false);
    }
  };

  if (!destination) return null;

  const currentGoogleData =
    placeData ||
    destination.googlePlacesData ||
    getGooglePlaceInfoForDestination(destination.id, destination.name);

  const percentCapacity = Math.round((destination.currentVisitors / destination.maxCapacity) * 100);

  const getStatusColor = (status: DestinationStatus) => {
    switch (status) {
      case 'PENUH':
        return 'bg-rose-600 text-white';
      case 'WASPADA':
        return 'bg-amber-600 text-white';
      case 'BAHAYA':
        return 'bg-red-700 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Photo Hero Banner */}
      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-slate-950">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-black/50" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 border border-slate-700 text-emerald-300">
            Kec. {destination.kecamatan}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(destination.status)}`}>
            {destination.status}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
          <div>
            <span className="text-xs font-medium text-emerald-400 mb-0.5 block">{destination.category}</span>
            <h3 className="text-xl font-bold text-white leading-tight font-['Outfit']">{destination.name}</h3>
          </div>
          {onOpenAdminEdit && (
            <button
              onClick={() => {
                onClose();
                onOpenAdminEdit(destination.id);
              }}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              title="Buka kontrol & detail lengkap di Admin Panel"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Real-time Visitor Counter Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              Jumlah Pengunjung Real-time:
            </span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {destination.currentVisitors} <span className="text-xs font-normal text-slate-400">/ {destination.maxCapacity}</span>
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentCapacity >= 90 ? 'bg-rose-500' : percentCapacity >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(percentCapacity, 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kepadatan: <strong className="text-slate-200">{percentCapacity}%</strong></span>
            <span>Sisa Kuota: <strong className="text-slate-200">{Math.max(destination.maxCapacity - destination.currentVisitors, 0)} Jiwa</strong></span>
          </div>

          {/* Kontrol Pengunjung Terkunci Khusus Admin */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Koreksi Pengunjung: Khusus Admin Panel</span>
            </div>
            {onOpenAdminEdit && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminEdit(destination.id);
                }}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Buka panel admin untuk mengubah jumlah pengunjung destinasi ini secara manual"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Pengunjung di Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Visitor History & Dynamics Analytics (Graphs, Dropdown, Export) */}
        <VisitorHistorySection destination={destination} />

        {/* Live IoT Sensor Telemetry */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            Sensor Lingkungan & Mitigasi Aktif
          </h4>

          <div className="space-y-2 text-xs">
            {/* Water Sensor */}
            {destination.sensors.waterLevelSensor && (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-semibold text-slate-200">TMA Sungai ({destination.sensors.waterLevelSensor.locationName})</span>
                    <span className="block text-[10px] text-slate-400">
                      Batas Waspada: {destination.sensors.waterLevelSensor.warningLevelMeter}m
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-cyan-400">
                    {destination.sensors.waterLevelSensor.currentLevelMeter}m
                  </span>
                  <span className="block text-[10px] text-emerald-400">
                    {destination.sensors.waterLevelSensor.status}
                  </span>
                </div>
              </div>
            )}

            {/* Landslide Sensor */}
            {destination.sensors.landslideSensor && (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-semibold text-slate-200">Inclinometer Tebing ({destination.sensors.landslideSensor.locationName})</span>
                    <span className="block text-[10px] text-slate-400">
                      Getaran: {destination.sensors.landslideSensor.vibrationMm} mm/s
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-amber-400">
                    {destination.sensors.landslideSensor.tiltAngleDegree}°
                  </span>
                  <span className="block text-[10px] text-emerald-400">
                    {destination.sensors.landslideSensor.status}
                  </span>
                </div>
              </div>
            )}

            {/* AQI Sensor */}
            {destination.sensors.airQualitySensor && (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="font-semibold text-slate-200">Kualitas Udara Hutan</span>
                    <span className="block text-[10px] text-slate-400">
                      Partikulat PM2.5: {destination.sensors.airQualitySensor.pm25} µg/m³
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-bold text-teal-400">
                    {destination.sensors.airQualitySensor.aqi} AQI
                  </span>
                  <span className="block text-[10px] text-emerald-400">
                    {destination.sensors.airQualitySensor.status}
                  </span>
                </div>
              </div>
            )}

            {/* Waste Sensor & TPS Station */}
            {destination.sensors.wasteSensor && (
              <div className={`p-3 rounded-lg border ${
                destination.sensors.wasteSensor.status === 'PENUH'
                  ? 'bg-rose-950/30 border-rose-800/80'
                  : destination.sensors.wasteSensor.status === 'HAMPIR_PENUH'
                  ? 'bg-amber-950/30 border-amber-800/70'
                  : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-slate-200 block leading-tight">
                        Sensor Tumpukan Sampah ({destination.sensors.wasteSensor.stationName})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Jadwal: {destination.sensors.wasteSensor.collectionSchedule || 'Rutin Harian'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`text-sm font-bold ${
                      destination.sensors.wasteSensor.status === 'PENUH'
                        ? 'text-rose-400'
                        : destination.sensors.wasteSensor.status === 'HAMPIR_PENUH'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {destination.sensors.wasteSensor.fillLevelPercent}%
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-300">
                      {destination.sensors.wasteSensor.status === 'PENUH'
                        ? '🔴 PENUH'
                        : destination.sensors.wasteSensor.status === 'HAMPIR_PENUH'
                        ? '🟡 WASPADA'
                        : '🟢 NORMAL'}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${
                      destination.sensors.wasteSensor.status === 'PENUH'
                        ? 'bg-rose-500'
                        : destination.sensors.wasteSensor.status === 'HAMPIR_PENUH'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(destination.sensors.wasteSensor.fillLevelPercent, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60 mb-2">
                  <span>Beban Tumpukan: <strong className="text-slate-200">{destination.sensors.wasteSensor.currentLoadKg} / {destination.sensors.wasteSensor.capacityKg} kg</strong></span>
                  <span>Gas Bau: <strong className="text-slate-200">{destination.sensors.wasteSensor.methanePpm || 5.0} ppm</strong></span>
                </div>

                {destination.sensors.wasteSensor.isDispatched && (
                  <div className="mb-2 p-1.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-[11px] text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                      <span>Truk Sampah DLH sedang menuju lokasi</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {destination.sensors.wasteSensor.dispatchedAt || 'Baru saja'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onEmptyWasteStation && onEmptyWasteStation(destination.id)}
                    className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Catat Dikosongkan</span>
                  </button>

                  <button
                    onClick={() => onDispatchWasteTruck && onDispatchWasteTruck(destination.id)}
                    disabled={destination.sensors.wasteSensor.isDispatched}
                    className={`px-2.5 py-1 text-[11px] rounded font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      destination.sensors.wasteSensor.isDispatched
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : destination.sensors.wasteSensor.status === 'PENUH'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Truck className="w-3 h-3" />
                    <span>{destination.sensors.wasteSensor.isDispatched ? 'Armada Bergerak' : 'Panggil Truk DLH'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 mb-1">Deskripsi</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{destination.description}</p>
        </div>

        {/* Operational Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Jam Buka
            </span>
            <span className="font-semibold text-slate-200">{destination.openingHours}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1 mb-1">
              <Ticket className="w-3.5 h-3.5 text-emerald-400" /> Tiket Masuk (HTM)
            </span>
            <span className="font-semibold text-slate-200">
              {destination.ticketPrice > 0 ? `Rp ${destination.ticketPrice.toLocaleString('id-ID')}` : 'Gratis'}
            </span>
          </div>
        </div>

        {/* Facilities */}
        {destination.facilities && destination.facilities.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Fasilitas Wisata</h4>
            <div className="flex flex-wrap gap-1.5">
              {destination.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  {fac}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Google Places API: Community Rating & Real Traveler Reviews */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center p-1">
                <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Google Maps Rating & Ulasan
                </h4>
                <span className="text-[10px] text-slate-400 block">
                  {currentGoogleData.source === 'google_places_api_live'
                    ? 'Terhubung Google Places API Live'
                    : 'Data Terverifikasi Google Maps'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSyncGooglePlaces}
              disabled={isSyncingPlaces}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 text-[11px]"
              title="Sinkronkan dengan Google Places API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPlaces ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Sinkronkan</span>
            </button>
          </div>

          {syncStatus && (
            <div className="text-[10px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* Rating Score Banner */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {currentGoogleData.rating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-amber-400 mb-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= Math.round(currentGoogleData.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-300 font-medium">
                  {currentGoogleData.userRatingCount.toLocaleString('id-ID')} ulasan wisatawan
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                Sangat Populer
              </span>
            </div>
          </div>

          {/* Real Traveler Reviews Feed */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                Ulasan Asli Wisatawan:
              </span>
              <a
                href={currentGoogleData.googleMapsUri}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {currentGoogleData.reviews && currentGoogleData.reviews.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {currentGoogleData.reviews.map((rev, idx) => (
                  <div
                    key={rev.id || idx}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/90 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rev.authorPhotoUrl ? (
                          <img
                            src={rev.authorPhotoUrl}
                            alt={rev.authorName}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-700 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                            {rev.authorName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-slate-200 text-[11px] block leading-tight">
                            {rev.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {rev.relativePublishTimeDescription}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-2.5 h-2.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed italic">
                      "{rev.text}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center rounded-lg bg-slate-900 text-slate-400 text-xs">
                Belum ada ulasan yang ditampilkan.
              </div>
            )}

            {/* Write a review link */}
            <div className="pt-1 flex items-center justify-end">
              <a
                href={
                  currentGoogleData.placeId
                    ? `https://search.google.com/local/writereview?placeid=${currentGoogleData.placeId}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' Tana Tidung')}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Pernah berkunjung? Tulis Ulasan di Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact & Navigation Buttons */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          {destination.contactPerson && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pengelola: <strong className="text-slate-200">{destination.contactPerson}</strong></span>
            </div>
          )}

          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps?q=${destination.lat},${destination.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Petunjuk Arah GPS</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            {onOpenAdminEdit && (
              <button
                onClick={() => onOpenAdminEdit(destination.id)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Buka destinasi ini di Admin untuk mengubah data"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ubah di Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
