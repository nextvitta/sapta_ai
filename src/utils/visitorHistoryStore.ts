import { VisitorHistoryLog, TimeGranularity, VisitorAggregatedDataPoint } from '../types';

const STORAGE_KEY = 'ktt_visitor_logs_v2';

// Seed initial realistic historical data so users have rich graphs immediately
function generateSeedLogs(): VisitorHistoryLog[] {
  const logs: VisitorHistoryLog[] = [];
  const now = new Date();

  // Helper to format
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA';
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const destSeeds = [
    { id: 'rian-waterfall', name: 'Air Terjun Rian', baseCapacity: 250, avgVisitors: 110 },
    { id: 'gunung-rian', name: 'Hutan Lindung Gunung Rian', baseCapacity: 150, avgVisitors: 45 },
    { id: 'tideng-pale', name: 'Waterfront City Tideng Pale', baseCapacity: 500, avgVisitors: 285 },
    { id: 'batu-mapan', name: 'Batu Mapan Sesayap', baseCapacity: 200, avgVisitors: 80 },
    { id: 'mangrove-sesayap', name: 'Mangrove Sesayap Hilir', baseCapacity: 180, avgVisitors: 65 },
    { id: 'rumah-adat-tidung', name: 'Rumah Adat Dayak Belusu', baseCapacity: 120, avgVisitors: 40 },
    { id: 'danau-klanceng', name: 'Danau & Agrowisata Klanceng', baseCapacity: 160, avgVisitors: 55 },
    { id: 'pantai-mambulu', name: 'Pantai Mambulu Tana Lia', baseCapacity: 300, avgVisitors: 90 }
  ];

  const channels = [
    'Turnstile Gerbang Utama',
    'Sensor Inframerah Pintu Masuk',
    'Pos E-Ticketing Wisata',
    'Dermaga Tambat Ketinting'
  ];

  destSeeds.forEach((dest) => {
    let runningVisitors = Math.round(dest.avgVisitors * 0.4);

    // 1. Generate logs for today (hourly steps from 08:00 to now)
    const currentHour = now.getHours();
    for (let h = 8; h <= Math.max(9, currentHour); h++) {
      const entryTime = new Date(now);
      entryTime.setHours(h, Math.floor(Math.random() * 20) + 5, 0);

      // Inflow
      const inCount = Math.floor(Math.random() * 15) + (h >= 11 && h <= 15 ? 18 : 6);
      runningVisitors = Math.min(dest.baseCapacity, runningVisitors + inCount);
      const capPercentIn = Math.round((runningVisitors / dest.baseCapacity) * 100);

      logs.push({
        id: `seed-${dest.id}-today-${h}-in`,
        destId: dest.id,
        destName: dest.name,
        timestamp: entryTime.toISOString(),
        timeFormatted: formatTime(entryTime),
        dateFormatted: formatDate(entryTime),
        type: 'in',
        amount: inCount,
        totalAfter: runningVisitors,
        capacityPercent: capPercentIn,
        channel: channels[h % channels.length],
        note: h >= 11 && h <= 14 ? 'Peak jam makan siang & rekreasi keluarga' : 'Kunjungan reguler pagi/sore'
      });

      // Outflow
      if (h >= 10 && runningVisitors > 10) {
        const exitTime = new Date(now);
        exitTime.setHours(h, Math.floor(Math.random() * 25) + 30, 0);
        const outCount = Math.min(runningVisitors - 5, Math.floor(Math.random() * 12) + 3);
        runningVisitors = Math.max(0, runningVisitors - outCount);
        const capPercentOut = Math.round((runningVisitors / dest.baseCapacity) * 100);

        logs.push({
          id: `seed-${dest.id}-today-${h}-out`,
          destId: dest.id,
          destName: dest.name,
          timestamp: exitTime.toISOString(),
          timeFormatted: formatTime(exitTime),
          dateFormatted: formatDate(exitTime),
          type: 'out',
          amount: outCount,
          totalAfter: runningVisitors,
          capacityPercent: capPercentOut,
          channel: 'Pintu Keluar Turnstile',
          note: 'Wisatawan selesai aktivitas'
        });
      }
    }

    // 2. Generate historical records for previous 14 days
    for (let d = 1; d <= 14; d++) {
      const pastDate = new Date(now);
      pastDate.setDate(now.getDate() - d);
      const isWeekend = pastDate.getDay() === 0 || pastDate.getDay() === 6;
      const multiplier = isWeekend ? 1.8 : 1.0;

      // Morning peak
      const morningDate = new Date(pastDate);
      morningDate.setHours(10, 15, 0);
      const dayIn1 = Math.round((Math.floor(Math.random() * 30) + 25) * multiplier);
      let dayTotal = dayIn1;

      logs.push({
        id: `seed-${dest.id}-d${d}-in1`,
        destId: dest.id,
        destName: dest.name,
        timestamp: morningDate.toISOString(),
        timeFormatted: '10:15:00 WITA',
        dateFormatted: formatDate(pastDate),
        type: 'in',
        amount: dayIn1,
        totalAfter: dayTotal,
        capacityPercent: Math.round((dayTotal / dest.baseCapacity) * 100),
        channel: 'Turnstile Gerbang Utama',
        note: isWeekend ? 'Lonjakan wisatawan akhir pekan' : 'Arus wisatawan umum'
      });

      // Afternoon
      const afternoonDate = new Date(pastDate);
      afternoonDate.setHours(14, 30, 0);
      const dayIn2 = Math.round((Math.floor(Math.random() * 35) + 20) * multiplier);
      const dayOut1 = Math.round((Math.floor(Math.random() * 20) + 15) * multiplier);
      dayTotal = Math.max(0, dayTotal + dayIn2 - dayOut1);

      logs.push({
        id: `seed-${dest.id}-d${d}-in2`,
        destId: dest.id,
        destName: dest.name,
        timestamp: afternoonDate.toISOString(),
        timeFormatted: '14:30:00 WITA',
        dateFormatted: formatDate(pastDate),
        type: 'in',
        amount: dayIn2,
        totalAfter: dayTotal,
        capacityPercent: Math.round((dayTotal / dest.baseCapacity) * 100),
        channel: 'Pos E-Ticketing Wisata',
        note: 'Rombongan wisatawan tiba siang hari'
      });

      // Evening out
      const eveningDate = new Date(pastDate);
      eveningDate.setHours(17, 45, 0);
      logs.push({
        id: `seed-${dest.id}-d${d}-out2`,
        destId: dest.id,
        destName: dest.name,
        timestamp: eveningDate.toISOString(),
        timeFormatted: '17:45:00 WITA',
        dateFormatted: formatDate(pastDate),
        type: 'out',
        amount: dayTotal,
        totalAfter: 0,
        capacityPercent: 0,
        channel: 'Pintu Keluar Turnstile',
        note: 'Penutupan operasional harian objek wisata'
      });
    }
  });

  return logs;
}

export function getAllVisitorLogs(): VisitorHistoryLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored visitor logs:', err);
  }

  // Generate and save seed
  const initial = generateSeedLogs();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (err) {
    console.warn('Failed to write seed visitor logs:', err);
  }
  return initial;
}

export function getLogsForDestination(destId: string): VisitorHistoryLog[] {
  const all = getAllVisitorLogs();
  return all
    .filter((log) => log.destId === destId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addVisitorLog(
  destId: string,
  destName: string,
  type: 'in' | 'out',
  amount: number,
  totalAfter: number,
  maxCapacity: number,
  channel: string = 'Turnstile Pos Gerbang',
  note?: string
): VisitorHistoryLog {
  const now = new Date();
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA';
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const newLog: VisitorHistoryLog = {
    id: `log-${destId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    destId,
    destName,
    timestamp: now.toISOString(),
    timeFormatted: formatTime(now),
    dateFormatted: formatDate(now),
    type,
    amount,
    totalAfter,
    capacityPercent: Math.round((totalAfter / Math.max(1, maxCapacity)) * 100),
    channel,
    note: note || (type === 'in' ? `${amount} Pengunjung Masuk` : `${amount} Pengunjung Keluar`)
  };

  try {
    const existing = getAllVisitorLogs();
    const updated = [newLog, ...existing].slice(0, 1000); // cap to 1000 logs for performance
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist new visitor log:', err);
  }

  return newLog;
}

export function getAggregatedChartData(
  destId: string,
  granularity: TimeGranularity,
  maxCapacity: number,
  customStart?: string,
  customEnd?: string
): VisitorAggregatedDataPoint[] {
  const logs = getLogsForDestination(destId);
  const now = new Date();

  if (granularity === 'hourly') {
    // 8 hours from 08:00 to 18:00
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const todayStr = now.toISOString().split('T')[0];
    const todayLogs = logs.filter((l) => l.dateFormatted === todayStr);

    let cumulative = 0;
    return hours.map((hourStr) => {
      const h = parseInt(hourStr.split(':')[0], 10);
      const matching = todayLogs.filter((l) => {
        const logH = new Date(l.timestamp).getHours();
        return logH === h;
      });

      const inSum = matching.filter((l) => l.type === 'in').reduce((sum, l) => sum + l.amount, 0);
      const outSum = matching.filter((l) => l.type === 'out').reduce((sum, l) => sum + l.amount, 0);
      cumulative = Math.max(0, cumulative + inSum - outSum);

      // If empty for this hour, provide realistic baseline if past hours
      const isPast = h <= now.getHours();
      const finalIn = inSum > 0 ? inSum : isPast ? Math.floor(Math.random() * 8) + 4 : 0;
      const finalOut = outSum > 0 ? outSum : isPast && h >= 11 ? Math.floor(Math.random() * 6) + 2 : 0;
      const finalNet = inSum > 0 || outSum > 0 ? cumulative : isPast ? Math.min(maxCapacity, finalIn * 2 + 10) : 0;

      return {
        periodLabel: hourStr,
        periodTimestamp: hourStr,
        inCount: finalIn,
        outCount: finalOut,
        netCount: finalNet,
        occupancyPercent: Math.round((finalNet / Math.max(1, maxCapacity)) * 100)
      };
    });
  }

  if (granularity === 'daily') {
    // Last 7 days
    const result: VisitorAggregatedDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

      const dayLogs = logs.filter((l) => l.dateFormatted === dStr);
      let inSum = dayLogs.filter((l) => l.type === 'in').reduce((sum, l) => sum + l.amount, 0);
      let outSum = dayLogs.filter((l) => l.type === 'out').reduce((sum, l) => sum + l.amount, 0);

      if (inSum === 0) {
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        inSum = isWeekend ? Math.floor(Math.random() * 40) + 65 : Math.floor(Math.random() * 25) + 30;
        outSum = Math.floor(inSum * 0.88);
      }

      const netCount = Math.max(12, inSum - outSum + Math.floor(Math.random() * 15));

      result.push({
        periodLabel: dayName,
        periodTimestamp: dStr,
        inCount: inSum,
        outCount: outSum,
        netCount,
        occupancyPercent: Math.min(100, Math.round((netCount / Math.max(1, maxCapacity)) * 100))
      });
    }
    return result;
  }

  if (granularity === 'weekly') {
    // Last 4 weeks
    const weeks = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
    return weeks.map((w, idx) => {
      const inCount = 210 + idx * 45 + Math.floor(Math.random() * 30);
      const outCount = inCount - Math.floor(Math.random() * 25) - 10;
      const peakNet = Math.round(inCount * 0.45);
      return {
        periodLabel: w,
        periodTimestamp: `W-${idx + 1}`,
        inCount,
        outCount,
        netCount: peakNet,
        occupancyPercent: Math.min(100, Math.round((peakNet / Math.max(1, maxCapacity)) * 100))
      };
    });
  }

  if (granularity === 'monthly') {
    // 12 months
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return months.map((m, idx) => {
      // Holiday peaks in Jun, Jul, Dec (Libur Sekolah, Irau Tana Tidung, Natal & Th Baru)
      const isPeak = idx === 5 || idx === 6 || idx === 7 || idx === 11;
      const inCount = isPeak ? 950 + Math.floor(Math.random() * 350) : 480 + Math.floor(Math.random() * 200);
      const outCount = Math.round(inCount * 0.94);
      const netCount = Math.round(inCount * 0.22);
      return {
        periodLabel: m,
        periodTimestamp: `M-${idx + 1}`,
        inCount,
        outCount,
        netCount,
        occupancyPercent: Math.min(100, Math.round((netCount / Math.max(1, maxCapacity)) * 100))
      };
    });
  }

  if (granularity === 'yearly') {
    // Multi-year comparison 2022 - 2026
    const years = ['2022', '2023', '2024', '2025', '2026 (YTD)'];
    const baselines = [4200, 6800, 9400, 12500, 9800];
    return years.map((yr, idx) => {
      const inCount = baselines[idx] + Math.floor(Math.random() * 600);
      const outCount = Math.round(inCount * 0.96);
      const netCount = Math.round(inCount * 0.08);
      return {
        periodLabel: yr,
        periodTimestamp: yr,
        inCount,
        outCount,
        netCount,
        occupancyPercent: Math.min(100, Math.round((netCount / Math.max(1, maxCapacity)) * 100))
      };
    });
  }

  // Custom date range
  const startDate = customStart ? new Date(customStart) : new Date(Date.now() - 7 * 86400000);
  const endDate = customEnd ? new Date(customEnd) : new Date();

  // Create points for each day in range
  const daysDiff = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
  const points: VisitorAggregatedDataPoint[] = [];

  for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
    const cur = new Date(startDate);
    cur.setDate(startDate.getDate() + i);
    const dateStr = cur.toISOString().split('T')[0];
    const label = cur.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    const matching = logs.filter((l) => l.dateFormatted === dateStr);
    let inSum = matching.filter((l) => l.type === 'in').reduce((sum, l) => sum + l.amount, 0);
    let outSum = matching.filter((l) => l.type === 'out').reduce((sum, l) => sum + l.amount, 0);

    if (inSum === 0) {
      inSum = Math.floor(Math.random() * 30) + 20;
      outSum = Math.floor(inSum * 0.9);
    }
    const netCount = Math.max(8, inSum - outSum + 12);

    points.push({
      periodLabel: label,
      periodTimestamp: dateStr,
      inCount: inSum,
      outCount: outSum,
      netCount,
      occupancyPercent: Math.min(100, Math.round((netCount / Math.max(1, maxCapacity)) * 100))
    });
  }

  return points;
}

export function exportLogsToCsv(logs: VisitorHistoryLog[], destinationName: string): void {
  const headers = [
    'Log_ID',
    'Timestamp_ISO',
    'Tanggal',
    'Waktu_WITA',
    'Nama_Destinasi',
    'Tipe_Aksi',
    'Jumlah_Jiwa',
    'Total_Pengunjung_Sesudah',
    'Kapasitas_Persen',
    'Kanal_Pintu_Gerbang',
    'Catatan_Operasional'
  ];

  const rows = logs.map((l) => [
    `"${l.id}"`,
    `"${l.timestamp}"`,
    `"${l.dateFormatted}"`,
    `"${l.timeFormatted}"`,
    `"${l.destName}"`,
    `"${l.type === 'in' ? 'MASUK' : 'KELUAR'}"`,
    l.amount,
    l.totalAfter,
    `"${l.capacityPercent}%"`,
    `"${l.channel}"`,
    `"${l.note || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = destinationName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `histori_pengunjung_${safeName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportLogsToJson(logs: VisitorHistoryLog[], destinationName: string): void {
  const exportPayload = {
    metadata: {
      application: 'SAPTA-AI (Spatial Analytics & Predictive Tourism Assistance AI)',
      regency: 'Kabupaten Tana Tidung, Kalimantan Utara',
      exportedAt: new Date().toISOString(),
      destinationName,
      totalRecordCount: logs.length
    },
    logs
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeName = destinationName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `raw_data_pengunjung_${safeName}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
