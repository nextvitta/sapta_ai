import React, { useState } from 'react';
import {
  X,
  History,
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Users
} from 'lucide-react';
import { Destination } from '../types';
import { VisitorHistorySection } from './VisitorHistorySection';
import {
  getAllVisitorLogs,
  exportLogsToCsv,
  exportLogsToJson
} from '../utils/visitorHistoryStore';

interface DestinationHistoryModalProps {
  destinations: Destination[];
  initialDestinationId?: string;
  onClose: () => void;
  onSelectDestination?: (dest: Destination) => void;
}

export const DestinationHistoryModal: React.FC<DestinationHistoryModalProps> = ({
  destinations,
  initialDestinationId,
  onClose,
  onSelectDestination
}) => {
  const [selectedDestId, setSelectedDestId] = useState<string>(() => {
    if (initialDestinationId) return initialDestinationId;
    return destinations[0]?.id || '';
  });

  const selectedDestination =
    destinations.find((d) => d.id === selectedDestId) || destinations[0];

  const handleExportAllCsv = () => {
    const allLogs = getAllVisitorLogs();
    exportLogsToCsv(allLogs, 'Seluruh_Destinasi_Tana_Tidung');
  };

  const handleExportAllJson = () => {
    const allLogs = getAllVisitorLogs();
    exportLogsToJson(allLogs, 'Seluruh_Destinasi_Tana_Tidung');
  };

  if (!selectedDestination) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/90 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white font-['Outfit']">
                  Histori & Analitik Aliran Pengunjung
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                  Turnstile Realtime
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pencatatan pengunjung masuk, keluar, dan okupansi per jam, hari, minggu, bulan, tahun, & rentang kustom
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Export All Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2 border-r border-slate-800 pr-3">
              <button
                onClick={handleExportAllCsv}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Ekspor CSV seluruh destinasi"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Ekspor Semua (CSV)</span>
              </button>
              <button
                onClick={handleExportAllJson}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Ekspor Data Mentah JSON seluruh destinasi"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Raw JSON</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab / Destination Selector */}
        <div className="p-3 sm:px-5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 font-semibold">Pilih Tab Destinasi:</span>
            <select
              value={selectedDestId}
              onChange={(e) => setSelectedDestId(e.target.value)}
              className="flex-1 sm:w-64 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Kec. {d.kecamatan}) - {d.currentVisitors}/{d.maxCapacity} Jiwa
                </option>
              ))}
            </select>
          </div>

          {/* Quick Tab Pills for Most Popular Destinations */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {destinations.slice(0, 5).map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDestId(d.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDestId === d.id
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {d.name.split(' ')[0]} {d.name.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body with History Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Destination Brief Header */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedDestination.imageUrl}
                alt={selectedDestination.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
              />
              <div>
                <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                  {selectedDestination.name}
                </h4>
                <p className="text-xs text-slate-400">
                  Kecamatan {selectedDestination.kecamatan} • Kategori: {selectedDestination.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[10px] text-slate-400 block">Pengunjung Aktif Saat Ini</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {selectedDestination.currentVisitors}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    / {selectedDestination.maxCapacity} Jiwa
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Kapasitas Terpakai</span>
                <span className="text-base font-extrabold text-cyan-400 font-mono">
                  {Math.round((selectedDestination.currentVisitors / selectedDestination.maxCapacity) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Embedded Visitor History Section with full charts, granularity dropdown, and table */}
          <VisitorHistorySection destination={selectedDestination} />
        </div>
      </div>
    </div>
  );
};
