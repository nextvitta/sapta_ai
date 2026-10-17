import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PlusCircle,
  MapPin,
  Camera,
  Layers,
  Settings,
  Trash2,
  Edit3,
  Radio,
  Droplets,
  Mountain,
  Users,
  CheckCircle2,
  RefreshCw,
  Compass,
  Search,
  ArrowLeft,
  Save,
  SlidersHorizontal,
  ExternalLink,
  AlertCircle,
  Database,
  FileSpreadsheet,
  UploadCloud,
  Download,
  Info
} from 'lucide-react';
import { Destination, Kecamatan, DestinationCategory, DestinationStatus, DestinationSensors } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  onAddDestination: (newDest: Destination) => Promise<void> | void;
  onUpdateDestination: (updated: Destination) => Promise<void> | void;
  onDeleteDestination: (id: string) => void;
  onResetDefaults: () => void;
  onStartPickingCoordinates: () => void;
  pickedCoordinates: { lat: number; lng: number } | null;
  initialEditDestinationId?: string | null;
  onClearInitialEdit?: () => void;
  isPickingCoordinates?: boolean;
  onCancelPickingCoordinates?: () => void;
  isFirestoreConnected?: boolean;
  onExportSpreadsheet?: () => void;
  onImportSpreadsheet?: (csvText: string) => Promise<void>;
  onSyncAllToFirestore?: () => Promise<void>;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  destinations,
  onAddDestination,
  onUpdateDestination,
  onDeleteDestination,
  onResetDefaults,
  onStartPickingCoordinates,
  pickedCoordinates,
  initialEditDestinationId,
  onClearInitialEdit,
  isPickingCoordinates = false,
  onCancelPickingCoordinates,
  isFirestoreConnected = true,
  onExportSpreadsheet,
  onImportSpreadsheet,
  onSyncAllToFirestore
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showSpreadsheetHelp, setShowSpreadsheetHelp] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'edit' | 'list'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter in list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKecamatanFilter, setSelectedKecamatanFilter] = useState<string>('all');

  // Form State
  const [name, setName] = useState('');
  const [kecamatan, setKecamatan] = useState<Kecamatan>('Sesayap');
  const [category, setCategory] = useState<DestinationCategory>('Alam');
  const [lat, setLat] = useState<string>('3.5550');
  const [lng, setLng] = useState<string>('116.9850');
  const [description, setDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('08:00 - 17:00 WITA');
  const [ticketPrice, setTicketPrice] = useState<number>(10000);
  const [maxCapacity, setMaxCapacity] = useState<number>(300);
  const [currentVisitors, setCurrentVisitors] = useState<number>(45);
  const [statusOverride, setStatusOverride] = useState<'AUTO' | DestinationStatus>('AUTO');
  const [imageUrl, setImageUrl] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [facilityInput, setFacilityInput] = useState('Area Parkir, Gazebo, Toilet, Warung');

  // Sensors configuration
  const [enableWaterSensor, setEnableWaterSensor] = useState(false);
  const [riverName, setRiverName] = useState('Sungai Sesayap');
  const [waterWarningLevel, setWaterWarningLevel] = useState<number>(4.5);
  const [enableLandslideSensor, setEnableLandslideSensor] = useState(false);
  const [landslideLocation, setLandslideLocation] = useState('Lereng Bukit Wisata');
  const [enableWasteSensor, setEnableWasteSensor] = useState(true);
  const [wasteStationName, setWasteStationName] = useState('TPS 1 Kawasan Wisata');
  const [wasteCapacityKg, setWasteCapacityKg] = useState<number>(300);
  const [wasteCurrentLoadKg, setWasteCurrentLoadKg] = useState<number>(60);
  const [wasteCollectionSchedule, setWasteCollectionSchedule] = useState('Rutin Harian (Pagi 08:00 & Sore 16:30)');

  // Notification within modal
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Reset form to default add mode
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setKecamatan('Sesayap');
    setCategory('Alam');
    setLat('3.5550');
    setLng('116.9850');
    setDescription('');
    setOpeningHours('08:00 - 17:00 WITA');
    setTicketPrice(10000);
    setMaxCapacity(300);
    setCurrentVisitors(45);
    setStatusOverride('AUTO');
    setImageUrl('');
    setContactPerson('Pokdarwis Tana Tidung');
    setFacilityInput('Area Parkir, Gazebo, Toilet, Warung');
    setEnableWaterSensor(false);
    setRiverName('Sungai Sesayap');
    setWaterWarningLevel(4.5);
    setEnableLandslideSensor(false);
    setLandslideLocation('Lereng Tebing Wisata');
    setEnableWasteSensor(true);
    setWasteStationName('TPS 1 Kawasan Wisata');
    setWasteCapacityKg(300);
    setWasteCurrentLoadKg(60);
    setWasteCollectionSchedule('Rutin Harian (Pagi 08:00 & Sore 16:30)');
  };

  // Load a destination into the form for editing
  const loadDestinationForEdit = (dest: Destination) => {
    setEditingId(dest.id);
    setName(dest.name);
    setKecamatan(dest.kecamatan);
    setCategory(dest.category);
    setLat(dest.lat.toString());
    setLng(dest.lng.toString());
    setDescription(dest.description);
    setOpeningHours(dest.openingHours);
    setTicketPrice(dest.ticketPrice);
    setMaxCapacity(dest.maxCapacity);
    setCurrentVisitors(dest.currentVisitors);
    setStatusOverride(dest.status);
    setImageUrl(dest.imageUrl);
    setContactPerson(dest.contactPerson || '');
    setFacilityInput(dest.facilities?.join(', ') || '');

    if (dest.sensors.waterLevelSensor?.active) {
      setEnableWaterSensor(true);
      setRiverName(dest.sensors.waterLevelSensor.locationName || 'Sungai Sesayap');
      setWaterWarningLevel(dest.sensors.waterLevelSensor.warningLevelMeter || 4.5);
    } else {
      setEnableWaterSensor(false);
    }

    if (dest.sensors.landslideSensor?.active) {
      setEnableLandslideSensor(true);
      setLandslideLocation(dest.sensors.landslideSensor.locationName || 'Lereng Bukit');
    } else {
      setEnableLandslideSensor(false);
    }

    if (dest.sensors.wasteSensor?.active) {
      setEnableWasteSensor(true);
      setWasteStationName(dest.sensors.wasteSensor.stationName || 'TPS 1 Kawasan Wisata');
      setWasteCapacityKg(dest.sensors.wasteSensor.capacityKg || 300);
      setWasteCurrentLoadKg(dest.sensors.wasteSensor.currentLoadKg || 60);
      setWasteCollectionSchedule(dest.sensors.wasteSensor.collectionSchedule || 'Rutin Harian (Pagi 08:00 & Sore 16:30)');
    } else {
      setEnableWasteSensor(false);
    }

    setActiveTab('edit');
  };

  // Handle external edit trigger if provided
  useEffect(() => {
    if (isOpen && initialEditDestinationId) {
      const found = destinations.find((d) => d.id === initialEditDestinationId);
      if (found) {
        loadDestinationForEdit(found);
      }
      if (onClearInitialEdit) {
        onClearInitialEdit();
      }
    }
  }, [isOpen, initialEditDestinationId]);

  // Update lat/lng if picked from map
  useEffect(() => {
    if (pickedCoordinates) {
      setLat(pickedCoordinates.lat.toFixed(5));
      setLng(pickedCoordinates.lng.toFixed(5));
      showFeedback(`Koordinat GPS diperbarui: ${pickedCoordinates.lat.toFixed(4)}, ${pickedCoordinates.lng.toFixed(4)}`, 'info');
    }
  }, [pickedCoordinates]);

  // Preset image gallery options
  const PRESET_IMAGES = [
    { label: 'Air Terjun Rimba', url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80' },
    { label: 'Batu Purba & Tebing', url: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80' },
    { label: 'Susur Sungai & Dermaga', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Hutan Mangrove & Boardwalk', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Bukit & Pemandangan Kabut', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Pantai & Muara Pesisir', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }
  ];

  // Submit Handler: Add New
  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const latNum = parseFloat(lat) || 3.555;
    const lngNum = parseFloat(lng) || 116.985;
    const capacityNum = maxCapacity > 0 ? maxCapacity : 100;
    const visitorsNum = Math.min(currentVisitors, capacityNum);

    const occupancyRate = visitorsNum / capacityNum;
    let finalStatus: DestinationStatus = 'NORMAL';
    if (statusOverride !== 'AUTO') {
      finalStatus = statusOverride;
    } else {
      if (occupancyRate >= 0.9) finalStatus = 'PENUH';
      else if (occupancyRate >= 0.75) finalStatus = 'WASPADA';
    }

    const newDest: Destination = {
      id: `dest-${Date.now()}`,
      name: name.trim(),
      kecamatan,
      category,
      lat: latNum,
      lng: lngNum,
      description: description.trim() || 'Destinasi wisata unggulan di Kabupaten Tana Tidung.',
      openingHours,
      ticketPrice: Number(ticketPrice),
      maxCapacity: capacityNum,
      currentVisitors: visitorsNum,
      status: finalStatus,
      imageUrl: imageUrl || PRESET_IMAGES[0].url,
      facilities: facilityInput.split(',').map((s) => s.trim()).filter(Boolean),
      contactPerson: contactPerson.trim() || 'Pokdarwis Tana Tidung',
      sensors: {
        crowdSensor: {
          active: true,
          currentDensityPercent: Math.round(occupancyRate * 100),
          thresholdPercent: 80,
          status: finalStatus === 'NORMAL' ? 'NORMAL' : finalStatus === 'WASPADA' ? 'WARNING' : 'CRITICAL',
          liveDetectionCount: visitorsNum
        },
        ...(enableWaterSensor
          ? {
              waterLevelSensor: {
                active: true,
                currentLevelMeter: 1.5,
                normalLevelMeter: 1.2,
                warningLevelMeter: waterWarningLevel,
                dangerLevelMeter: waterWarningLevel + 1.2,
                status: 'AMAN',
                locationName: riverName
              }
            }
          : {}),
        ...(enableLandslideSensor
          ? {
              landslideSensor: {
                active: true,
                tiltAngleDegree: 0.9,
                vibrationMm: 0.12,
                status: 'NORMAL',
                locationName: landslideLocation
              }
            }
          : {}),
        ...(enableWasteSensor
          ? {
              wasteSensor: {
                active: true,
                stationName: wasteStationName,
                capacityKg: wasteCapacityKg > 0 ? wasteCapacityKg : 300,
                currentLoadKg: Math.min(wasteCurrentLoadKg, wasteCapacityKg > 0 ? wasteCapacityKg : 300),
                fillLevelPercent: Math.min(
                  Math.round((wasteCurrentLoadKg / (wasteCapacityKg > 0 ? wasteCapacityKg : 300)) * 100),
                  100
                ),
                status:
                  Math.round((wasteCurrentLoadKg / (wasteCapacityKg > 0 ? wasteCapacityKg : 300)) * 100) >= 90
                    ? 'PENUH'
                    : Math.round((wasteCurrentLoadKg / (wasteCapacityKg > 0 ? wasteCapacityKg : 300)) * 100) >= 70
                    ? 'HAMPIR_PENUH'
                    : 'NORMAL',
                lastEmptiedTime: 'Hari ini, 07:00 WITA',
                collectionSchedule: wasteCollectionSchedule,
                methanePpm: Number((3.5 + (Math.min(wasteCurrentLoadKg, 300) / 300) * 12).toFixed(1)),
                temperatureCelsius: 28.5,
                isDispatched: false
              }
            }
          : {}),
        airQualitySensor: {
          active: true,
          aqi: 22,
          pm25: 5.1,
          status: 'BAIK'
        }
      }
    };

    try {
      setIsSaving(true);
      await onAddDestination(newDest);
      showFeedback(`Destinasi "${newDest.name}" berhasil ditambahkan ke Cloud Database.`);
      resetForm();
      setActiveTab('list');
    } catch (err) {
      console.error('Failed to add destination:', err);
      showFeedback(`Gagal menambahkan ke database: ${err instanceof Error ? err.message : 'Kesalahan jaringan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Handler: Update Existing
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !name.trim()) return;

    const existingDest = destinations.find((d) => d.id === editingId);
    if (!existingDest) return;

    const latNum = parseFloat(lat) || existingDest.lat;
    const lngNum = parseFloat(lng) || existingDest.lng;
    const capacityNum = maxCapacity > 0 ? maxCapacity : 100;
    const visitorsNum = Math.min(currentVisitors, capacityNum);

    const occupancyRate = visitorsNum / capacityNum;
    let finalStatus: DestinationStatus = 'NORMAL';
    if (statusOverride !== 'AUTO') {
      finalStatus = statusOverride;
    } else {
      if (occupancyRate >= 0.9) finalStatus = 'PENUH';
      else if (occupancyRate >= 0.75) finalStatus = 'WASPADA';
    }

    const calculatedWasteCapacity = wasteCapacityKg > 0 ? wasteCapacityKg : 300;
    const calculatedWasteLoad = Math.min(wasteCurrentLoadKg, calculatedWasteCapacity);
    const calculatedFillPercent = Math.min(Math.round((calculatedWasteLoad / calculatedWasteCapacity) * 100), 100);
    const calculatedWasteStatus = calculatedFillPercent >= 90 ? 'PENUH' : calculatedFillPercent >= 70 ? 'HAMPIR_PENUH' : 'NORMAL';

    const updatedSensors: DestinationSensors = {
      ...existingDest.sensors,
      crowdSensor: {
        ...existingDest.sensors.crowdSensor,
        liveDetectionCount: visitorsNum,
        currentDensityPercent: Math.round(occupancyRate * 100),
        status: finalStatus === 'NORMAL' ? 'NORMAL' : finalStatus === 'WASPADA' ? 'WARNING' : 'CRITICAL'
      }
    };

    if (enableWaterSensor) {
      updatedSensors.waterLevelSensor = {
        active: true,
        currentLevelMeter: existingDest.sensors.waterLevelSensor?.currentLevelMeter ?? 1.5,
        normalLevelMeter: 1.2,
        warningLevelMeter: waterWarningLevel,
        dangerLevelMeter: waterWarningLevel + 1.2,
        status: existingDest.sensors.waterLevelSensor?.status ?? 'AMAN',
        locationName: riverName
      };
    } else {
      delete updatedSensors.waterLevelSensor;
    }

    if (enableLandslideSensor) {
      updatedSensors.landslideSensor = {
        active: true,
        tiltAngleDegree: existingDest.sensors.landslideSensor?.tiltAngleDegree ?? 0.9,
        vibrationMm: 0.12,
        status: existingDest.sensors.landslideSensor?.status ?? 'NORMAL',
        locationName: landslideLocation
      };
    } else {
      delete updatedSensors.landslideSensor;
    }

    if (enableWasteSensor) {
      updatedSensors.wasteSensor = {
        active: true,
        stationName: wasteStationName,
        capacityKg: calculatedWasteCapacity,
        currentLoadKg: calculatedWasteLoad,
        fillLevelPercent: calculatedFillPercent,
        status: calculatedWasteStatus,
        lastEmptiedTime: existingDest.sensors.wasteSensor?.lastEmptiedTime || 'Hari ini, 07:00 WITA',
        collectionSchedule: wasteCollectionSchedule,
        methanePpm: existingDest.sensors.wasteSensor?.methanePpm ?? Number((3.5 + (calculatedFillPercent / 100) * 12).toFixed(1)),
        temperatureCelsius: existingDest.sensors.wasteSensor?.temperatureCelsius ?? 28.5,
        isDispatched: existingDest.sensors.wasteSensor?.isDispatched ?? false,
        ...(existingDest.sensors.wasteSensor?.dispatchedAt ? { dispatchedAt: existingDest.sensors.wasteSensor.dispatchedAt } : {})
      };
    } else {
      delete updatedSensors.wasteSensor;
    }

    const updatedDest: Destination = {
      ...existingDest,
      name: name.trim(),
      kecamatan,
      category,
      lat: latNum,
      lng: lngNum,
      description: description.trim() || existingDest.description,
      openingHours,
      ticketPrice: Number(ticketPrice),
      maxCapacity: capacityNum,
      currentVisitors: visitorsNum,
      status: finalStatus,
      imageUrl: imageUrl || existingDest.imageUrl,
      facilities: facilityInput.split(',').map((s) => s.trim()).filter(Boolean),
      contactPerson: contactPerson.trim() || existingDest.contactPerson,
      sensors: updatedSensors
    };

    try {
      setIsSaving(true);
      await onUpdateDestination(updatedDest);
      showFeedback(`Perubahan pada destinasi "${updatedDest.name}" berhasil disimpan ke Cloud Database.`);
      resetForm();
      setActiveTab('list');
    } catch (err) {
      console.error('Failed to update destination:', err);
      showFeedback(`Gagal memperbarui database: ${err instanceof Error ? err.message : 'Kesalahan jaringan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered destinations in list view
  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.kecamatan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKecamatan =
      selectedKecamatanFilter === 'all' || dest.kecamatan === selectedKecamatanFilter;
    return matchesSearch && matchesKecamatan;
  });

  const editingDestination = destinations.find((d) => d.id === editingId);

  if (!isOpen && !isPickingCoordinates) return null;

  // Floating Minimized Bar when picking coordinates on map
  if (isPickingCoordinates) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-xl animate-in slide-in-from-bottom duration-300 pointer-events-auto">
        <div className="bg-slate-900/95 border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 backdrop-blur-xl text-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-100 truncate">
                {activeTab === 'edit' && editingDestination
                  ? `Mengubah Lokasi: ${editingDestination.name}`
                  : name ? `Lokasi: ${name}` : 'Pilih Titik Lokasi Destinasi'}
              </div>
              <div className="text-[11px] text-emerald-300 font-mono flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Titik: {lat}, {lng} (Klik sembarang titik di peta)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onCancelPickingCoordinates) onCancelPickingCoordinates();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (onCancelPickingCoordinates) onCancelPickingCoordinates();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-lg shadow-emerald-950/50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesai</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md border border-emerald-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-['Outfit']">
                  SAPTA-AI Admin — Manajemen Destinasi Wisata KTT
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 border border-emerald-600/50 text-emerald-300 rounded-full">
                  CRUD Geospasial
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full flex items-center gap-1 border ${
                  isFirestoreConnected
                    ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                    : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                }`}>
                  <Database className="w-2.5 h-2.5 text-cyan-400" />
                  {isFirestoreConnected ? 'Cloud Firestore Terhubung' : 'Penyimpanan Lokal'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pemerintah Kabupaten Tana Tidung Kalimantan Utara • Tambah & Ubah Titik Destinasi, Kapasitas & Sensor EWS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden file input for Spreadsheet CSV import */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (evt) => {
              const text = evt.target?.result as string;
              if (text && onImportSpreadsheet) {
                await onImportSpreadsheet(text);
              }
            };
            reader.readAsText(file);
            e.target.value = '';
          }}
          className="hidden"
        />

        {/* Feedback Alert if available */}
        {feedback && (
          <div className="bg-emerald-950/90 border-b border-emerald-600/50 px-6 py-2.5 text-xs text-emerald-200 flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 px-6 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Daftar & Kontrol Destinasi ({destinations.length})</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setActiveTab('add');
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'add'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Destinasi Baru</span>
          </button>

          {editingId && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'edit'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-amber-400/70 hover:text-amber-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[180px]">
                Ubah: {editingDestination?.name || 'Destinasi'}
              </span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ========================================================
              TAB 1: LIST & MANAGE (Search, Edit Button, Visitors Slider, Delete)
             ======================================================== */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Cloud Database & Spreadsheet Sync Banner */}
              <div className="p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">Database Cloud Firebase Firestore</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[11px] text-emerald-400 font-medium">Tersimpan Permanen</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Setiap perubahan destinasi tersimpan otomatis di database cloud. Anda juga dapat menghubungkan atau mengedit massal lewat spreadsheet.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                  {onSyncAllToFirestore && (
                    <button
                      onClick={onSyncAllToFirestore}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                      title="Sinkronkan seluruh data saat ini ke Cloud Database Firebase agar preview dan published persis sama"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sinkronkan ke Cloud</span>
                    </button>
                  )}

                  {onExportSpreadsheet && (
                    <button
                      onClick={onExportSpreadsheet}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                      title="Unduh seluruh data destinasi dalam format CSV untuk Google Sheets atau Excel"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ekspor Spreadsheet (CSV)</span>
                    </button>
                  )}

                  {onImportSpreadsheet && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                      title="Unggah file CSV yang telah diedit di Google Sheets atau Excel untuk dimasukkan langsung ke database"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Impor Spreadsheet (CSV)</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowSpreadsheetHelp(!showSpreadsheetHelp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Petunjuk Integrasi Google Sheets"
                  >
                    <Info className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>

              {/* Spreadsheet Help Card */}
              {showSpreadsheetHelp && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-slate-300 space-y-2 animate-in fade-in">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Panduan Koneksi Google Sheets & Spreadsheet:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Klik <strong>"Ekspor Spreadsheet (CSV)"</strong> untuk mengunduh seluruh data destinasi resmi Tana Tidung.</li>
                    <li>Buka <span className="text-emerald-400 font-mono">Google Sheets</span> (atau Microsoft Excel) &gt; Pilih <em>File &gt; Import &gt; Upload</em> file CSV tersebut.</li>
                    <li>Anda dapat mengedit koordinat lintang/bujur, jam buka, tiket, kapasitas, atau menambahkan baris baru dengan mudah.</li>
                    <li>Setelah selesai mengedit, unduh sebagai CSV dari Google Sheets (<em>File &gt; Download &gt; Comma Separated Values (.csv)</em>).</li>
                    <li>Klik <strong>"Impor Spreadsheet (CSV)"</strong> di atas dan pilih file tersebut. Data langsung tersinkronkan permanen ke Firebase Database!</li>
                  </ol>
                </div>
              )}
              {/* Header Action & Search Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2 border-b border-slate-800">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari destinasi wisata..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('add');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Baru</span>
                  </button>

                  <button
                    onClick={onResetDefaults}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Kembalikan semua data ke preset Kabupaten Tana Tidung Kalimantan Utara"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Default KTT</span>
                  </button>
                </div>
              </div>

              {/* Kecamatan Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 mr-1">Kecamatan:</span>
                {['all', 'Sesayap', 'Muruk Rian', 'Betayau', 'Sesayap Hilir', 'Tana Lia'].map((kec) => (
                  <button
                    key={kec}
                    onClick={() => setSelectedKecamatanFilter(kec)}
                    className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer text-[11px] ${
                      selectedKecamatanFilter === kec
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {kec === 'all' ? 'Semua Kecamatan' : kec}
                  </button>
                ))}
              </div>

              {/* Destination Cards List */}
              <div className="space-y-3">
                {filteredDestinations.length === 0 ? (
                  <div className="text-center py-12 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
                    Tidak ada destinasi yang cocok dengan pencarian "{searchQuery}".
                  </div>
                ) : (
                  filteredDestinations.map((dest) => {
                    const percent = Math.round((dest.currentVisitors / dest.maxCapacity) * 100);
                    return (
                      <div
                        key={dest.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          editingId === dest.id
                            ? 'bg-emerald-950/30 border-emerald-600/70 shadow-lg shadow-emerald-950/50'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Info Block */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <img
                            src={dest.imageUrl}
                            alt={dest.name}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-100">{dest.name}</h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                                {dest.kecamatan}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-emerald-300">
                                {dest.category}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  dest.status === 'PENUH'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : dest.status === 'WASPADA'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {dest.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {dest.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                              <span className="text-emerald-400 font-medium">
                                Pengunjung: {dest.currentVisitors} / {dest.maxCapacity} ({percent}%)
                              </span>
                              <span>•</span>
                              <span>HTM: Rp {dest.ticketPrice.toLocaleString('id-ID')}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-500">
                                {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                              </span>
                              {dest.sensors.waterLevelSensor?.active && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-400 font-medium">🌊 Sensor TMA</span>
                                </>
                              )}
                              {dest.sensors.landslideSensor?.active && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400 font-medium">⛰️ Sensor Tebing</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Controls */}
                        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                          {/* Live visitor slider & manual +/- */}
                          <div className="flex flex-col gap-1 items-end pr-2 border-r border-slate-800">
                            <span className="text-[10px] text-slate-400">Koreksi Pengunjung Manual</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const newCount = Math.max(0, dest.currentVisitors - 5);
                                  const newPercent = Math.round((newCount / dest.maxCapacity) * 100);
                                  let newStatus: DestinationStatus = 'NORMAL';
                                  if (newPercent >= 90) newStatus = 'PENUH';
                                  else if (newPercent >= 75) newStatus = 'WASPADA';
                                  onUpdateDestination({
                                    ...dest,
                                    currentVisitors: newCount,
                                    status: newStatus,
                                    sensors: {
                                      ...dest.sensors,
                                      crowdSensor: {
                                        ...dest.sensors.crowdSensor,
                                        liveDetectionCount: newCount,
                                        currentDensityPercent: newPercent,
                                        status: newPercent >= 90 ? 'CRITICAL' : newPercent >= 75 ? 'WARNING' : 'NORMAL'
                                      }
                                    }
                                  });
                                }}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] cursor-pointer"
                                title="Kurangi 5 pengunjung"
                              >
                                -5
                              </button>
                              <input
                                type="range"
                                min={0}
                                max={dest.maxCapacity}
                                value={dest.currentVisitors}
                                onChange={(e) => {
                                  const newCount = Number(e.target.value);
                                  const newPercent = Math.round((newCount / dest.maxCapacity) * 100);
                                  let newStatus: DestinationStatus = 'NORMAL';
                                  if (newPercent >= 90) newStatus = 'PENUH';
                                  else if (newPercent >= 75) newStatus = 'WASPADA';

                                  onUpdateDestination({
                                    ...dest,
                                    currentVisitors: newCount,
                                    status: newStatus,
                                    sensors: {
                                      ...dest.sensors,
                                      crowdSensor: {
                                        ...dest.sensors.crowdSensor,
                                        liveDetectionCount: newCount,
                                        currentDensityPercent: newPercent,
                                        status:
                                          newPercent >= 90
                                            ? 'CRITICAL'
                                            : newPercent >= 75
                                            ? 'WARNING'
                                            : 'NORMAL'
                                      }
                                    }
                                  });
                                }}
                                className="w-24 accent-emerald-500 cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newCount = Math.min(dest.maxCapacity, dest.currentVisitors + 5);
                                  const newPercent = Math.round((newCount / dest.maxCapacity) * 100);
                                  let newStatus: DestinationStatus = 'NORMAL';
                                  if (newPercent >= 90) newStatus = 'PENUH';
                                  else if (newPercent >= 75) newStatus = 'WASPADA';
                                  onUpdateDestination({
                                    ...dest,
                                    currentVisitors: newCount,
                                    status: newStatus,
                                    sensors: {
                                      ...dest.sensors,
                                      crowdSensor: {
                                        ...dest.sensors.crowdSensor,
                                        liveDetectionCount: newCount,
                                        currentDensityPercent: newPercent,
                                        status: newPercent >= 90 ? 'CRITICAL' : newPercent >= 75 ? 'WARNING' : 'NORMAL'
                                      }
                                    }
                                  });
                                }}
                                className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-[10px] cursor-pointer"
                                title="Tambah 5 pengunjung"
                              >
                                +5
                              </button>
                              <span className="text-xs font-mono font-bold text-slate-200 w-8 text-right">
                                {dest.currentVisitors}
                              </span>
                            </div>
                          </div>

                          {/* Ubah / Edit Button */}
                          <button
                            onClick={() => loadDestinationForEdit(dest)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            title="Ubah semua data destinasi ini"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Ubah</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus destinasi "${dest.name}" dari peta?`)) {
                                onDeleteDestination(dest.id);
                                showFeedback(`Destinasi "${dest.name}" telah dihapus.`);
                              }
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Hapus Destinasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2 & 3: FORM (Add or Edit Destination)
             ======================================================== */}
          {(activeTab === 'add' || activeTab === 'edit') && (
            <form
              onSubmit={activeTab === 'edit' ? handleSaveEdit : handleSubmitNew}
              className="space-y-6"
            >
              {/* Mode Banner if Editing */}
              {activeTab === 'edit' && (
                <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-600/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 text-xs text-amber-200">
                    <Edit3 className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold">Mode Pengubahan Data Destinasi:</span>{' '}
                      <span className="underline font-semibold">{editingDestination?.name || name}</span>
                      <span className="block text-[11px] text-amber-300/80">
                        Perubahan akan langsung disimpan dan memperbarui titik di peta Kabupaten Tana Tidung Kalimantan Utara.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('list');
                    }}
                    className="px-3 py-1 text-xs rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/60 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Batal Ubah
                  </button>
                </div>
              )}

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Destinasi Wisata <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Danau Buatan Muruk Rian"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Kecamatan</label>
                    <select
                      value={kecamatan}
                      onChange={(e) => setKecamatan(e.target.value as Kecamatan)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Sesayap">Sesayap</option>
                      <option value="Muruk Rian">Muruk Rian</option>
                      <option value="Betayau">Betayau</option>
                      <option value="Sesayap Hilir">Sesayap Hilir</option>
                      <option value="Tana Lia">Tana Lia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as DestinationCategory)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Alam">Wisata Alam</option>
                      <option value="Budaya & Adat">Budaya & Adat</option>
                      <option value="Bahari & Sungai">Bahari & Sungai</option>
                      <option value="Ekowisata">Ekowisata</option>
                      <option value="Religi">Religi & Sejarah</option>
                      <option value="Kuliner & Wisata Kota">Kuliner / Wisata Kota</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Titik Geografis (Koordinat GPS Peta)
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onStartPickingCoordinates();
                    }}
                    className="px-2.5 py-1 text-xs rounded-md bg-emerald-950 border border-emerald-600/60 text-emerald-300 hover:bg-emerald-900 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Klik & Ambil Titik di Peta</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Latitude (Lintang, misal: 3.5550)
                    </label>
                    <input
                      type="text"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Longitude (Bujur, misal: 116.9850)
                    </label>
                    <input
                      type="text"
                      required
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Operational */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deskripsi Lengkap Destinasi
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan keunikan, daya tarik, keasrian alam atau nilai sejarah budaya..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Operational Hours, Ticket, Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="08:00 - 17:00 WITA"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Harga Tiket Masuk (HTM Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kontak Pengelola / Pokdarwis
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Pokdarwis Tana Tidung (0812...)"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Capacity, Visitors, Status Override */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kapasitas Maksimum (Jiwa)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      {activeTab === 'edit' ? 'Pengunjung Manual Saat Ini' : 'Pengunjung Awal'}
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {maxCapacity > 0 ? Math.round((currentVisitors / maxCapacity) * 100) : 0}% Terisi
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentVisitors((prev) => Math.max(0, prev - 5))}
                      className="px-2 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 cursor-pointer"
                      title="Kurangi 5"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={maxCapacity}
                      value={currentVisitors}
                      onChange={(e) => setCurrentVisitors(Math.max(0, Math.min(maxCapacity, Number(e.target.value) || 0)))}
                      className="flex-1 px-2.5 py-2 text-center text-xs font-mono font-bold bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentVisitors((prev) => Math.min(maxCapacity, prev + 5))}
                      className="px-2 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs rounded border border-emerald-700 cursor-pointer"
                      title="Tambah 5"
                    >
                      +5
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status Destinasi
                  </label>
                  <select
                    value={statusOverride}
                    onChange={(e) => setStatusOverride(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AUTO">Otomatis (Berdasarkan % Pengunjung)</option>
                    <option value="NORMAL">NORMAL (Kondisi Aman / Buka)</option>
                    <option value="WASPADA">WASPADA (Mendekati Kapasitas / EWS)</option>
                    <option value="PENUH">PENUH (Kapasitas Penuh / Crowd Control)</option>
                  </select>
                </div>
              </div>

              {/* Facilities */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fasilitas Wisata (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  placeholder="Area Parkir, Gazebo, Toilet, Musholla, Warung Makan, Spot Foto"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Image Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  URL Foto Sampul Destinasi
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-10 h-8 rounded object-cover border border-slate-700"
                    />
                  )}
                </div>
                {/* Preset suggestions */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="text-slate-400">Pilihan cepat foto:</span>
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* IoT Sensors Configuration */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  Konfigurasi Sensor IoT & Mitigasi Kebencanaan
                </span>

                <div className="space-y-3">
                  {/* Water Level Sensor */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <input
                      type="checkbox"
                      id="check-water"
                      checked={enableWaterSensor}
                      onChange={(e) => setEnableWaterSensor(e.target.checked)}
                      className="mt-1 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label htmlFor="check-water" className="text-xs font-semibold text-slate-200 cursor-pointer">
                        Sensor Tinggi Muka Air (TMA) Sungai / Dermaga / Air Terjun (EWS Banjir)
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Aktifkan untuk destinasi susur sungai, dermaga speed, muara, atau air terjun
                      </p>
                      {enableWaterSensor && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-slate-800">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Nama Titik Aliran / Sungai</label>
                            <input
                              type="text"
                              value={riverName}
                              onChange={(e) => setRiverName(e.target.value)}
                              placeholder="Sungai Sesayap Hulu"
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Batas Level Waspada (Meter)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={waterWarningLevel}
                              onChange={(e) => setWaterWarningLevel(Number(e.target.value))}
                              placeholder="Contoh: 4.5"
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Landslide Sensor */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <input
                      type="checkbox"
                      id="check-landslide"
                      checked={enableLandslideSensor}
                      onChange={(e) => setEnableLandslideSensor(e.target.checked)}
                      className="mt-1 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label htmlFor="check-landslide" className="text-xs font-semibold text-slate-200 cursor-pointer">
                        Sensor Kemiringan Lereng & Getaran Tebing (EWS Longsor)
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Aktifkan untuk destinasi tebing batu kapur, bukit pendakian, atau jurang air terjun
                      </p>
                      {enableLandslideSensor && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Lokasi Pemasangan Inclinometer</label>
                          <input
                            type="text"
                            value={landslideLocation}
                            onChange={(e) => setLandslideLocation(e.target.value)}
                            placeholder="Lereng Tebing Wisata Rian"
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Waste Sensor & TPS */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <input
                      type="checkbox"
                      id="check-waste"
                      checked={enableWasteSensor}
                      onChange={(e) => setEnableWasteSensor(e.target.checked)}
                      className="mt-1 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label htmlFor="check-waste" className="text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                        Sensor Volume Tumpukan Sampah & TPS Sementara (DLH KTT)
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Memantau timbulan sampah di bak penampungan sementara (TPS) destinasi untuk mencegah tumpukan meluber dan bau tidak sedap
                      </p>
                      {enableWasteSensor && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">Nama Bak / Titik TPS</label>
                              <input
                                type="text"
                                value={wasteStationName}
                                onChange={(e) => setWasteStationName(e.target.value)}
                                placeholder="TPS 1 Sentra Wisata"
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">Kapasitas Maksimal (Kg)</label>
                              <input
                                type="number"
                                min={20}
                                step={10}
                                value={wasteCapacityKg}
                                onChange={(e) => setWasteCapacityKg(Number(e.target.value))}
                                placeholder="300"
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">Beban Sampah Saat Ini (Kg)</label>
                              <input
                                type="number"
                                min={0}
                                max={wasteCapacityKg}
                                step={5}
                                value={wasteCurrentLoadKg}
                                onChange={(e) => setWasteCurrentLoadKg(Number(e.target.value))}
                                placeholder="60"
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Jadwal Pengambilan Armada Truk Sampah</label>
                            <input
                              type="text"
                              value={wasteCollectionSchedule}
                              onChange={(e) => setWasteCollectionSchedule(e.target.value)}
                              placeholder="Rutin Harian (Pagi 08:00 & Sore 16:30)"
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('list');
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Daftar</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-lg transition-all flex items-center gap-1.5 ${
                      isSaving
                        ? 'bg-slate-700 opacity-70 cursor-not-allowed'
                        : activeTab === 'edit'
                        ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50 cursor-pointer'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50 cursor-pointer'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyimpan ke Cloud...</span>
                      </>
                    ) : activeTab === 'edit' ? (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan Destinasi</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Simpan & Tayangkan ke Peta</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
