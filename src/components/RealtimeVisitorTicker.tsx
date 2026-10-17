import React, { useState, useEffect } from 'react';
import { Activity, Users, ArrowUpRight, ArrowDownRight, Play, Pause, Radio } from 'lucide-react';
import { Destination } from '../types';

interface RealtimeVisitorTickerProps {
  destinations: Destination[];
  totalVisitors: number;
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
  recentActivity: { id: string; destName: string; type: 'in' | 'out'; count: number; time: string }[];
  onOpenAdmin?: () => void;
}

export const RealtimeVisitorTicker: React.FC<RealtimeVisitorTickerProps> = ({
  destinations,
  totalVisitors,
  isSimulating = false,
  onToggleSimulation,
  recentActivity,
  onOpenAdmin
}) => {
  const totalCapacity = destinations.reduce((acc, d) => acc + d.maxCapacity, 0);
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalVisitors / totalCapacity) * 100) : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
      {/* Total visitors & occupancy */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-100">Live IoT Gateway:</span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-emerald-400 font-mono">
            {totalVisitors.toLocaleString()}
          </span>
          <span className="text-slate-400 text-[11px]">
            / {totalCapacity.toLocaleString()} Jiwa ({occupancyPercent}% Terisi)
          </span>
        </div>
      </div>

      {/* Live Stream Ticker of recent entries/exits */}
      <div className="hidden lg:flex items-center gap-2 overflow-hidden max-w-md">
        <span className="text-[11px] text-slate-400 shrink-0">Log Gerbang:</span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {recentActivity.slice(0, 2).map((act, idx) => (
            <div
              key={`${act.id}-${idx}`}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] flex items-center gap-1 shrink-0 animate-in fade-in"
            >
              {act.type === 'in' ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-amber-400" />
              )}
              <span className="text-slate-300 truncate max-w-[120px]">{act.destName}</span>
              <span className={act.type === 'in' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {act.type === 'in' ? `+${act.count}` : `-${act.count}`}
              </span>
              <span className="text-slate-500 text-[9px]">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tombol Akses Admin Pengunjung Manual */}
      {onOpenAdmin && (
        <button
          onClick={onOpenAdmin}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 shadow-sm"
          title="Ubah jumlah pengunjung destinasi secara manual melalui Admin Panel"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>Koreksi Manual di Admin</span>
        </button>
      )}
    </div>
  );
};
