import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Eye,
  Maximize2,
  Users,
  AlertTriangle,
  Radio,
  Compass,
  Filter,
  Search,
  Droplets,
  Mountain,
  ShieldAlert,
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { Destination, Kecamatan, DestinationCategory } from '../types';

interface MapViewProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  selectedDestination: Destination | null;
  isPickingCoordinates?: boolean;
  onCoordinatePicked?: (lat: number, lng: number) => void;
  onCancelPicking?: () => void;
  onOpenAiAdvisory?: () => void;
  onOpenAdminEdit?: (destId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  destinations,
  onSelectDestination,
  selectedDestination,
  isPickingCoordinates = false,
  onCoordinatePicked,
  onCancelPicking,
  onOpenAiAdvisory,
  onOpenAdminEdit
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const sensorOverlayLayerRef = useRef<L.LayerGroup | null>(null);

  // Keep live refs to avoid stale closures in event listeners
  const isPickingCoordinatesRef = useRef(isPickingCoordinates);
  useEffect(() => {
    isPickingCoordinatesRef.current = isPickingCoordinates;
  }, [isPickingCoordinates]);

  const onCoordinatePickedRef = useRef(onCoordinatePicked);
  useEffect(() => {
    onCoordinatePickedRef.current = onCoordinatePicked;
  }, [onCoordinatePicked]);

  const onOpenAdminEditRef = useRef(onOpenAdminEdit);
  useEffect(() => {
    onOpenAdminEditRef.current = onOpenAdminEdit;
  }, [onOpenAdminEdit]);

  const [activeBaseLayer, setActiveBaseLayer] = useState<'satellite' | 'topography' | 'street'>('satellite');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSensorOverlays, setShowSensorOverlays] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of Kabupaten Tana Tidung
    const map = L.map(mapContainerRef.current, {
      center: [3.565, 117.060],
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default Satellite Basemap (Esri World Imagery)
    const satTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri World Imagery & GIS Tana Tidung',
      maxZoom: 19
    });

    satTile.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const sensorsGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    sensorOverlayLayerRef.current = sensorsGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Dedicated Active Effect for Coordinate Picking with Leaflet
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const container = map.getContainer();
    if (isPickingCoordinates) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isPickingCoordinates && onCoordinatePicked) {
        onCoordinatePicked(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPickingCoordinates, onCoordinatePicked]);

  // Update Base Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let newTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = '&copy; Esri World Imagery & GIS Tana Tidung';

    if (activeBaseLayer === 'topography') {
      newTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, USGS, NOAA | Peta Topografi Kabupaten Tana Tidung';
    } else if (activeBaseLayer === 'street') {
      newTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const tile = L.tileLayer(newTileUrl, {
      attribution,
      maxZoom: 19
    });
    tile.addTo(map);
  }, [activeBaseLayer]);

  // Render Markers & Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const sensorsGroup = sensorOverlayLayerRef.current;

    if (!map || !markersGroup || !sensorsGroup) return;

    markersGroup.clearLayers();
    sensorsGroup.clearLayers();

    // Filter destinations
    const filtered = destinations.filter((dest) => {
      const matchKecamatan = filterKecamatan === 'all' || dest.kecamatan === filterKecamatan;
      const matchCategory = filterCategory === 'all' || dest.category === filterCategory;
      const matchSearch =
        searchQuery === '' ||
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchKecamatan && matchCategory && matchSearch;
    });

    // Add Kecamatan region indicators
    const KECAMATAN_CENTERS: { name: Kecamatan; lat: number; lng: number }[] = [
      { name: 'Sesayap', lat: 3.555, lng: 116.985 },
      { name: 'Sesayap Hilir', lat: 3.635, lng: 117.185 },
      { name: 'Betayau', lat: 3.485, lng: 116.890 },
      { name: 'Tana Lia', lat: 3.695, lng: 117.320 },
      { name: 'Muruk Rian', lat: 3.518, lng: 117.065 }
    ];

    KECAMATAN_CENTERS.forEach((kec) => {
      const kecLabelIcon = L.divIcon({
        className: 'custom-kecamatan-label',
        html: `
          <div class="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/80 text-[10px] font-semibold text-slate-300 backdrop-blur-sm shadow-sm pointer-events-none whitespace-nowrap">
            Kec. ${kec.name}
          </div>
        `,
        iconSize: [80, 20],
        iconAnchor: [40, 10]
      });
      L.marker([kec.lat, kec.lng], { icon: kecLabelIcon, interactive: false }).addTo(sensorsGroup);
    });

    // Render Markers for Destinations
    filtered.forEach((dest) => {
      const percentCapacity = Math.round((dest.currentVisitors / dest.maxCapacity) * 100);

      // Marker color logic
      let badgeBg = 'bg-emerald-600';
      let borderGlow = 'border-emerald-400';
      let pulseColor = 'bg-emerald-400';

      if (dest.status === 'PENUH' || percentCapacity >= 90) {
        badgeBg = 'bg-rose-600';
        borderGlow = 'border-rose-400 ring-4 ring-rose-500/30';
        pulseColor = 'bg-rose-400';
      } else if (dest.status === 'WASPADA' || percentCapacity >= 75) {
        badgeBg = 'bg-amber-600';
        borderGlow = 'border-amber-400 ring-4 ring-amber-500/30';
        pulseColor = 'bg-amber-400';
      }

      // Check if flood, landslide, or waste sensor alert is triggered
      const isWaterAlert = dest.sensors.waterLevelSensor?.status === 'WASPADA' || dest.sensors.waterLevelSensor?.status === 'BAHAYA';
      const isCrowdAlert = dest.sensors.crowdSensor.status !== 'NORMAL';
      const isWasteAlert = dest.sensors.wasteSensor?.status === 'PENUH';

      const customIcon = L.divIcon({
        className: 'custom-destination-marker',
        html: `
          <div class="relative group cursor-pointer transform transition-transform hover:scale-110">
            ${
              isCrowdAlert || isWaterAlert || isWasteAlert
                ? `<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-80"></span>
                     <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${badgeBg}"></span>
                   </span>`
                : ''
            }
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeBg} text-white text-xs font-bold border-2 ${borderGlow} shadow-lg backdrop-blur-md">
              <span class="text-[11px]">${dest.category === 'Alam' ? '🌲' : dest.category === 'Bahari & Sungai' ? '🚤' : dest.category === 'Budaya & Adat' ? '🏛️' : '🌿'}</span>
              <span class="truncate max-w-[110px]">${dest.name.split('(')[0].trim()}</span>
              <span class="bg-black/30 px-1.5 py-0.2 rounded text-[10px] font-mono">${dest.currentVisitors}</span>
              ${isWasteAlert ? '<span class="text-[10px] text-rose-300" title="TPS Penuh">🗑️!</span>' : ''}
            </div>
            <div class="w-2 h-2 mx-auto bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
          </div>
        `,
        iconSize: [160, 36],
        iconAnchor: [80, 36]
      });

      const marker = L.marker([dest.lat, dest.lng], { icon: customIcon });

      // Add sensor danger zone ring if enabled
      if (showSensorOverlays && dest.sensors.waterLevelSensor?.active) {
        const radius = dest.sensors.waterLevelSensor.status === 'BAHAYA' ? 1200 : 700;
        const circleColor = dest.sensors.waterLevelSensor.status === 'BAHAYA' ? '#ef4444' : dest.sensors.waterLevelSensor.status === 'WASPADA' ? '#f59e0b' : '#06b6d4';

        L.circle([dest.lat, dest.lng], {
          radius,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(sensorsGroup);
      }

      // Marker Popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-100 font-sans';
      popupContent.innerHTML = `
        <div class="w-64">
          <div class="relative h-28 rounded-t-lg overflow-hidden -mx-3 -mt-3 mb-2">
            <img src="${dest.imageUrl}" alt="${dest.name}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/90 border border-slate-700 text-emerald-300">
              ${dest.kecamatan}
            </span>
            <span class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
              dest.status === 'PENUH' ? 'bg-rose-900 text-rose-200' : dest.status === 'WASPADA' ? 'bg-amber-900 text-amber-200' : 'bg-emerald-900 text-emerald-200'
            }">
              ${dest.status}
            </span>
          </div>

          <h4 class="font-bold text-sm text-white leading-tight mb-0.5">${dest.name}</h4>
          <div class="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mb-1.5">
            <span class="flex items-center gap-0.5">★ ${dest.googlePlacesData?.rating ? dest.googlePlacesData.rating.toFixed(1) : '4.7'}</span>
            <span class="text-slate-400 font-normal text-[10px]">(${dest.googlePlacesData?.userRatingCount || 120} ulasan Google)</span>
          </div>
          <p class="text-xs text-slate-300 line-clamp-2 mb-2">${dest.description}</p>

          <div class="bg-slate-900/90 rounded-lg p-2 border border-slate-800 mb-2.5">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400">Kepadatan Pengunjung:</span>
              <span class="font-semibold text-emerald-400">${dest.currentVisitors} / ${dest.maxCapacity} (${percentCapacity}%)</span>
            </div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="h-full ${percentCapacity > 85 ? 'bg-rose-500' : percentCapacity > 70 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${Math.min(percentCapacity, 100)}%"></div>
            </div>
          </div>

          ${
            dest.sensors.waterLevelSensor
              ? `
              <div class="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 mb-1.5">
                <span class="flex items-center gap-1">🌊 TMA Sungai:</span>
                <span class="font-mono font-bold">${dest.sensors.waterLevelSensor.currentLevelMeter}m (${dest.sensors.waterLevelSensor.status})</span>
              </div>
            `
              : ''
          }

          ${
            dest.sensors.wasteSensor
              ? `
              <div class="flex items-center justify-between text-[11px] px-2 py-1 rounded ${
                dest.sensors.wasteSensor.status === 'PENUH'
                  ? 'bg-rose-950/60 border border-rose-800/60 text-rose-300'
                  : dest.sensors.wasteSensor.status === 'HAMPIR_PENUH'
                  ? 'bg-amber-950/60 border border-amber-800/60 text-amber-300'
                  : 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
              } mb-2">
                <span class="flex items-center gap-1">🗑️ TPS (${dest.sensors.wasteSensor.fillLevelPercent}%):</span>
                <span class="font-mono font-bold">${dest.sensors.wasteSensor.currentLoadKg} kg (${dest.sensors.wasteSensor.status})</span>
              </div>
            `
              : ''
          }

          <button id="btn-inspect-${dest.id}" class="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:shadow-emerald-900/40">
            <span>⚙️ Buka Kontrol & Detail di Admin Panel</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup',
        maxWidth: 290
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${dest.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onOpenAdminEditRef.current) {
              onOpenAdminEditRef.current(dest.id);
            } else {
              onSelectDestination(dest);
            }
          };
        }
      });

      marker.on('click', (e: L.LeafletMouseEvent) => {
        if (isPickingCoordinatesRef.current && onCoordinatePickedRef.current) {
          L.DomEvent.stopPropagation(e);
          onCoordinatePickedRef.current(Number(dest.lat.toFixed(5)), Number(dest.lng.toFixed(5)));
          return;
        }
        onSelectDestination(dest);
      });

      marker.addTo(markersGroup);
    });
  }, [destinations, filterKecamatan, filterCategory, searchQuery, showSensorOverlays]);

  // Center on selected destination when changed
  useEffect(() => {
    if (selectedDestination && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedDestination.lat, selectedDestination.lng], 13, {
        duration: 1.2
      });
    }
  }, [selectedDestination]);

  const resetViewToTanaTidung = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([3.565, 117.060], 11, {
        duration: 1.0
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
      {/* Map Control Bar (Floating on top) */}
      <div className="absolute top-3 left-3 right-3 z-[30] pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Search & Filters (Interactive) */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl max-w-full">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari destinasi Tana Tidung..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>

            {/* Filter Kecamatan */}
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua Kecamatan</option>
              <option value="Sesayap">Kec. Sesayap</option>
              <option value="Muruk Rian">Kec. Muruk Rian</option>
              <option value="Betayau">Kec. Betayau</option>
              <option value="Sesayap Hilir">Kec. Sesayap Hilir</option>
              <option value="Tana Lia">Kec. Tana Lia</option>
            </select>

            {/* Filter Kategori */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="hidden sm:block px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="Alam">Wisata Alam</option>
              <option value="Budaya & Adat">Budaya & Adat</option>
              <option value="Bahari & Sungai">Bahari & Sungai</option>
              <option value="Ekowisata">Ekowisata</option>
              <option value="Religi">Religi & Sejarah</option>
            </select>

            {/* Toggle Sensor Overlay */}
            <button
              onClick={() => setShowSensorOverlays(!showSensorOverlays)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                showSensorOverlays
                  ? 'bg-amber-950/80 border border-amber-600/70 text-amber-300'
                  : 'bg-slate-900 border border-slate-700 text-slate-400'
              }`}
              title="Tampilkan Radius Pemantauan Sensor Banjir & Bencana"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Overlay EWS Sensor</span>
            </button>

            {/* AI Analysis Quick Button */}
            {onOpenAiAdvisory && (
              <button
                id="btn-map-ai-advisory"
                onClick={onOpenAiAdvisory}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border border-purple-500/60 text-purple-200 hover:text-white hover:border-purple-400 hover:shadow-lg hover:shadow-purple-900/30 transition-all cursor-pointer"
                title="Buka Analisis AI Situasional & Rekomendasi Terhadap Seluruh Data"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="hidden sm:inline">Analisis AI</span>
              </button>
            )}
          </div>

          {/* Basemap Switcher & Reset Button */}
          <div className="pointer-events-auto flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
            <button
              onClick={() => setActiveBaseLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeBaseLayer === 'satellite' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satelit
            </button>
            <button
              onClick={() => setActiveBaseLayer('topography')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeBaseLayer === 'topography' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Topografi
            </button>
            <button
              onClick={() => setActiveBaseLayer('street')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeBaseLayer === 'street' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Jalan (OSM)
            </button>
            <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
            <button
              onClick={resetViewToTanaTidung}
              title="Reset Tampilan Kabupaten Tana Tidung Kalimantan Utara"
              className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Coordinate Picker Banner when Active */}
        {isPickingCoordinates && (
          <div className="mt-2 pointer-events-auto bg-amber-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-2xl border border-amber-300">
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-900 animate-spin" />
              <span>Mode Pilih Titik Koordinat Aktif: Silakan klik lokasi mana saja pada peta Tana Tidung untuk mengambil titik koordinat baru.</span>
            </span>
            {onCancelPicking && (
              <button
                type="button"
                onClick={onCancelPicking}
                className="ml-3 px-3 py-1 bg-slate-950 text-white hover:bg-slate-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0"
              >
                Batal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Map Footer Legend */}
      <div className="bg-slate-950/95 border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300">Status Kunjungan:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal (&lt;75%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Waspada Padat (75-89%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Penuh / Overcrowd (&ge;90%)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-cyan-400">
            <Droplets className="w-3 h-3" /> EWS Hidrometri Sungai Sesayap
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <Mountain className="w-3 h-3" /> Sensor Kemiringan Tebing
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            🗑️ Sensor TPS Sampah
          </span>
          {onOpenAiAdvisory && (
            <button
              id="btn-footer-ai-advisory"
              onClick={onOpenAiAdvisory}
              className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/50 text-purple-300 hover:text-white hover:bg-purple-900/80 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Buka Panel Analisis AI Seluruh Data"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Analisis AI</span>
            </button>
          )}
          <span className="text-slate-500 font-mono hidden lg:inline">BPS & GIS Kabupaten Tana Tidung</span>
        </div>
      </div>
    </div>
  );
};
