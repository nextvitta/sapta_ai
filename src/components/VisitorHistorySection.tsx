import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Clock,
  Calendar,
  Download,
  FileSpreadsheet,
  FileCode,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  BarChart2,
  LineChart as LineChartIcon,
  Filter,
  History,
  DoorOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Users
} from 'lucide-react';
import { Destination, TimeGranularity, VisitorChartType, VisitorHistoryLog } from '../types';
import {
  getLogsForDestination,
  getAggregatedChartData,
  exportLogsToCsv,
  exportLogsToJson
} from '../utils/visitorHistoryStore';

interface VisitorHistorySectionProps {
  destination: Destination;
}

export const VisitorHistorySection: React.FC<VisitorHistorySectionProps> = ({ destination }) => {
  const [granularity, setGranularity] = useState<TimeGranularity>('hourly');
  const [chartType, setChartType] = useState<VisitorChartType>('bar');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [showLogTable, setShowLogTable] = useState<boolean>(false);
  const [logsSearch, setLogsSearch] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Fetch real-time logs for this destination
  const logs = useMemo(() => {
    return getLogsForDestination(destination.id);
  }, [destination.id, destination.currentVisitors, refreshKey]);

  // Aggregated data for the chart
  const chartData = useMemo(() => {
    return getAggregatedChartData(
      destination.id,
      granularity,
      destination.maxCapacity,
      customStartDate,
      customEndDate
    );
  }, [destination.id, destination.maxCapacity, granularity, customStartDate, customEndDate, logs]);

  // Totals for the current view
  const totalIn = useMemo(() => chartData.reduce((acc, curr) => acc + curr.inCount, 0), [chartData]);
  const totalOut = useMemo(() => chartData.reduce((acc, curr) => acc + curr.outCount, 0), [chartData]);
  const peakNet = useMemo(() => Math.max(0, ...chartData.map((d) => d.netCount)), [chartData]);

  // Filtered raw logs
  const filteredLogs = useMemo(() => {
    if (!logsSearch.trim()) return logs;
    const q = logsSearch.toLowerCase();
    return logs.filter(
      (l) =>
        l.timeFormatted.toLowerCase().includes(q) ||
        l.dateFormatted.toLowerCase().includes(q) ||
        l.channel.toLowerCase().includes(q) ||
        (l.note && l.note.toLowerCase().includes(q))
    );
  }, [logs, logsSearch]);

  const handleExportCsv = () => {
    exportLogsToCsv(logs, destination.name);
  };

  const handleExportJson = () => {
    exportLogsToJson(logs, destination.name);
  };

  return (
    <div
      id={`visitor-history-${destination.id}`}
      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Histori Dinamika Pengunjung
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 border border-emerald-600/40 text-emerald-400">
                Live Turnstile
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Arus masuk, keluar, & beban okupansi realtime {destination.name}
            </p>
          </div>
        </div>

        {/* Action buttons (Chart Switcher & Export) */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              id={`btn-chart-bar-${destination.id}`}
              onClick={() => setChartType('bar')}
              className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all ${
                chartType === 'bar'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grafik Batang (Masuk vs Keluar)"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Batang</span>
            </button>
            <button
              id={`btn-chart-line-${destination.id}`}
              onClick={() => setChartType('line')}
              className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all ${
                chartType === 'line'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grafik Garis (Tren Kunjungan)"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Garis</span>
            </button>
          </div>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1">
            <button
              id={`btn-export-csv-${destination.id}`}
              onClick={handleExportCsv}
              className="px-2 py-1 text-xs rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 hover:text-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Unduh data dalam format CSV untuk Excel/BPS"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              id={`btn-export-json-${destination.id}`}
              onClick={handleExportJson}
              className="px-2 py-1 text-xs rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Unduh raw data mentah JSON"
            >
              <FileCode className="w-3 h-3 text-cyan-400" />
              <span>Data Mentah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Time Granularity Dropdown & Range Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium">Rentang Waktu:</span>
          <select
            id={`select-granularity-${destination.id}`}
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as TimeGranularity)}
            className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="hourly">⏱️ Per Jam (Hari Ini)</option>
            <option value="daily">📅 Per Hari (7 Hari Terakhir)</option>
            <option value="weekly">📆 Per Minggu (4 Minggu Terakhir)</option>
            <option value="monthly">🗓️ Per Bulan (12 Bulan)</option>
            <option value="yearly">📈 Per Tahun (Multi-Tahun)</option>
            <option value="custom">⚙️ Rentang Tanggal Kustom...</option>
          </select>
        </div>

        {/* Custom Date Picker (when 'custom' selected) */}
        {granularity === 'custom' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-300 flex-wrap">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs"
            />
            <span>s/d</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs"
            />
          </div>
        )}

        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-auto"
          title="Segarkan data grafik"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex flex-col">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-emerald-400" />
            Total Masuk
          </span>
          <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono mt-0.5">
            +{totalIn.toLocaleString('id-ID')}{' '}
            <span className="text-[10px] font-normal text-slate-400">jiwa</span>
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex flex-col">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-rose-400" />
            Total Keluar
          </span>
          <span className="text-sm sm:text-base font-bold text-rose-400 font-mono mt-0.5">
            -{totalOut.toLocaleString('id-ID')}{' '}
            <span className="text-[10px] font-normal text-slate-400">jiwa</span>
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex flex-col">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            Puncak Okupansi
          </span>
          <span className="text-sm sm:text-base font-bold text-cyan-400 font-mono mt-0.5">
            {peakNet.toLocaleString('id-ID')}{' '}
            <span className="text-[10px] font-normal text-slate-400">
              ({Math.round((peakNet / Math.max(1, destination.maxCapacity)) * 100)}%)
            </span>
          </span>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span>Visualisasi Arus Pengunjung:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
              Masuk
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
              Keluar
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"></span>
              Total di Lokasi
            </span>
          </div>
        </div>

        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="periodLabel"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomChartTooltip maxCapacity={destination.maxCapacity} />} />
                <Bar dataKey="inCount" name="Masuk" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="outCount" name="Keluar" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="periodLabel"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomChartTooltip maxCapacity={destination.maxCapacity} />} />
                <Line
                  type="monotone"
                  dataKey="inCount"
                  name="Masuk"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="outCount"
                  name="Keluar"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="netCount"
                  name="Total di Lokasi"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accordion Toggle for Raw History Log Table */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          id={`btn-toggle-log-table-${destination.id}`}
          onClick={() => setShowLogTable(!showLogTable)}
          className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-emerald-400" />
            <span>Tabel Log Riwayat Turnstile & Perubahan Realtime ({logs.length} catatan)</span>
          </div>
          {showLogTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showLogTable && (
          <div className="mt-3 space-y-2 animate-in fade-in duration-200">
            {/* Search filter in logs */}
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                placeholder="Cari waktu, gerbang, catatan..."
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-400 shrink-0">
                {filteredLogs.length} baris
              </span>
            </div>

            {/* Scrollable table */}
            <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-[11px] text-slate-400 font-semibold">
                  <tr>
                    <th className="p-2">Waktu</th>
                    <th className="p-2">Aksi</th>
                    <th className="p-2">Jumlah</th>
                    <th className="p-2">Total</th>
                    <th className="p-2 hidden sm:table-cell">Kanal / Gerbang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredLogs.slice(0, 50).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="p-2 text-slate-300 font-sans">
                        <div className="font-semibold text-slate-200">{item.timeFormatted}</div>
                        <div className="text-[10px] text-slate-500">{item.dateFormatted}</div>
                      </td>
                      <td className="p-2 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.type === 'in'
                              ? 'bg-emerald-950/80 border border-emerald-600/40 text-emerald-400'
                              : 'bg-rose-950/80 border border-rose-600/40 text-rose-400'
                          }`}
                        >
                          {item.type === 'in' ? (
                            <>
                              <ArrowDownRight className="w-3 h-3" /> Masuk
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3" /> Keluar
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`font-bold ${
                            item.type === 'in' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.type === 'in' ? `+${item.amount}` : `-${item.amount}`}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="text-slate-200 font-semibold">{item.totalAfter}</span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {item.capacityPercent}%
                        </span>
                      </td>
                      <td className="p-2 text-slate-400 font-sans hidden sm:table-cell">
                        <div className="truncate max-w-[120px]" title={item.channel}>
                          {item.channel}
                        </div>
                        {item.note && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px]" title={item.note}>
                            {item.note}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 font-sans">
                        Tidak ada log histori yang sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Chart Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  maxCapacity: number;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, maxCapacity }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2.5 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl text-xs space-y-1 font-sans">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>Periode: {label}</span>
        </p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-bold font-mono" style={{ color: entry.color }}>
              {entry.value} jiwa
            </span>
          </div>
        ))}
        {maxCapacity && (
          <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
            Kapasitas Maksimal: {maxCapacity} jiwa
          </p>
        )}
      </div>
    );
  }
  return null;
};
