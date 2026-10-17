import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bot,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Cpu,
  Compass
} from 'lucide-react';
import { Destination } from '../types';

interface AiSituationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  totalVisitors: number;
}

export const AiSituationModal: React.FC<AiSituationModalProps> = ({
  isOpen,
  onClose,
  destinations,
  totalVisitors
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    provider: string;
    advisory: string;
    recommendations: string[];
    crowdRiskLevel: string;
    weatherWarning?: string;
  } | null>(null);

  const fetchAiAnalysis = async () => {
    setLoading(true);
    try {
      const payload = {
        totalVisitors,
        destinations: destinations.map((d) => ({
          name: d.name,
          kecamatan: d.kecamatan,
          category: d.category,
          currentVisitors: d.currentVisitors,
          capacity: d.maxCapacity,
          occupancyPercent: Math.round((d.currentVisitors / d.maxCapacity) * 100),
          status: d.status,
          tmaSungai: d.sensors.waterLevelSensor
            ? `${d.sensors.waterLevelSensor.currentLevelMeter}m (${d.sensors.waterLevelSensor.status})`
            : undefined,
          tebingLongsor: d.sensors.landslideSensor
            ? `Kemiringan ${d.sensors.landslideSensor.tiltAngleDegree}° (${d.sensors.landslideSensor.status})`
            : undefined,
          sensorSampahTPS: d.sensors.wasteSensor
            ? `${d.sensors.wasteSensor.fillLevelPercent}% keterisian, ${d.sensors.wasteSensor.currentLoadKg}/${d.sensors.wasteSensor.capacityKg}kg (${d.sensors.wasteSensor.status})`
            : undefined
        }))
      };

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('AI insight fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAiAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-['Outfit']">
                  AI Situasi & Rekomendasi Taktis Pariwisata
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-950 border border-indigo-600/50 text-indigo-300 rounded-full flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  {data?.provider ? data.provider.toUpperCase().replace('-', ' ') : 'GEMINI AI'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sintesis Otomatis Data Geospasial, Sensor EWS, dan Arus Wisatawan Tana Tidung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAiAnalysis}
              disabled={loading}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Perbarui Analisis AI"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400">Menganalisis data sensor dan telemetri Tana Tidung...</p>
            </div>
          ) : data ? (
            <>
              {/* Risk Level Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Status Risiko Kepadatan & Bencana:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    data.crowdRiskLevel === 'TINGGI'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : data.crowdRiskLevel === 'SEDANG'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  RISIKO {data.crowdRiskLevel || 'SEDANG'}
                </span>
              </div>

              {/* Advisory Paragraph */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                  <Bot className="w-4 h-4" />
                  <span>Ringkasan Eksekutif Situasi:</span>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed">{data.advisory}</p>
              </div>

              {/* Tactical Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Rekomendasi Tindakan Lapangan:</span>
                </div>

                <div className="space-y-2">
                  {data.recommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather Note */}
              {data.weatherWarning && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{data.weatherWarning}</span>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
