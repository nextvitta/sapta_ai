import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Destination } from '../types';
import { INITIAL_DESTINATIONS } from '../data/initialDestinations';

const COLLECTION_NAME = 'destinations';

/**
 * Mendengarkan data destinasi secara realtime dari Firestore.
 * Jika Firestore masih kosong saat pertama kali dijalankan, otomatis
 * men-seed data dari INITIAL_DESTINATIONS ke Firestore.
 */
export function subscribeToDestinations(
  onSuccess: (destinations: Destination[]) => void,
  onError?: (err: Error) => void
): () => void {
  const destCol = collection(db, COLLECTION_NAME);

  return onSnapshot(
    destCol,
    async (snapshot) => {
      if (snapshot.empty) {
        console.info('[Firestore] Koleksi destinasi kosong di cloud. Melakukan inisialisasi / seeding data awal...');
        try {
          await seedInitialDestinations();
          // onSnapshot akan dipicu kembali setelah data tersimpan
        } catch (seedErr) {
          console.error('[Firestore] Gagal men-seed destinasi awal:', seedErr);
          onSuccess(INITIAL_DESTINATIONS);
        }
        return;
      }

      const list: Destination[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || '',
          kecamatan: data.kecamatan || 'Sesayap',
          category: data.category || 'Alam',
          lat: typeof data.lat === 'number' ? data.lat : parseFloat(data.lat) || 3.5,
          lng: typeof data.lng === 'number' ? data.lng : parseFloat(data.lng) || 117.0,
          description: data.description || '',
          openingHours: data.openingHours || '08:00 - 17:00 WITA',
          ticketPrice: Number(data.ticketPrice) || 0,
          maxCapacity: Number(data.maxCapacity) || 100,
          currentVisitors: Number(data.currentVisitors) || 0,
          status: data.status || 'NORMAL',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
          facilities: Array.isArray(data.facilities) ? data.facilities : [],
          contactPerson: data.contactPerson || '',
          isPopular: !!data.isPopular,
          sensors: data.sensors || {
            crowdSensor: {
              active: true,
              currentDensityPercent: 50,
              thresholdPercent: 85,
              status: 'NORMAL',
              liveDetectionCount: Number(data.currentVisitors) || 0
            }
          },
          googlePlaceId: data.googlePlaceId,
          googlePlacesData: data.googlePlacesData
        });
      });

      // Sort konsisten berdasarkan nama
      list.sort((a, b) => a.name.localeCompare(b.name));
      onSuccess(list);
    },
    (error) => {
      console.error('[Firestore] Kesalahan langganan realtime:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Membersihkan objek secara rekursif dari nilai `undefined`
 * agar Firestore tidak menolak dokumen saat pembaruan / penyimpanan.
 */
export function sanitizeForFirestore<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof obj === 'object') {
    // Pertahankan FieldValue khusus Firestore (serverTimestamp, deleteField, dll.)
    if (
      obj &&
      (typeof obj._methodName === 'string' ||
        obj.constructor?.name === 'FieldValueImpl' ||
        obj.constructor?.name === 'ServerTimestampTransform' ||
        obj.constructor?.name === 'DeleteTransform')
    ) {
      return obj;
    }
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    }
    return clean as any;
  }
  return obj;
}

/**
 * Format dokumen destinasi agar selalu sesuai dengan skema dan aturan keamanan firestore.rules
 */
export function formatDestinationForFirestore(dest: Destination): Record<string, any> {
  const sanitized = sanitizeForFirestore(dest);

  const cleanDoc: Record<string, any> = {
    ...sanitized,
    id: dest.id,
    name: String(dest.name || '').trim() || 'Destinasi Wisata',
    kecamatan: dest.kecamatan || 'Sesayap',
    category: dest.category || 'Alam',
    lat: typeof dest.lat === 'number' && !isNaN(dest.lat) ? dest.lat : (parseFloat(String(dest.lat)) || 3.555),
    lng: typeof dest.lng === 'number' && !isNaN(dest.lng) ? dest.lng : (parseFloat(String(dest.lng)) || 116.985),
    maxCapacity: Number(dest.maxCapacity) || 100,
    currentVisitors: Number(dest.currentVisitors) || 0,
    ticketPrice: Number(dest.ticketPrice) || 0,
    status: dest.status || 'NORMAL',
    facilities: Array.isArray(dest.facilities) ? dest.facilities : [],
    updatedAt: new Date().toISOString(),
    _cloudTimestamp: serverTimestamp()
  };

  return sanitizeForFirestore(cleanDoc);
}

/**
 * Menyimpan atau memperbarui 1 destinasi ke Firestore secara permanen.
 */
export async function saveDestinationToFirestore(dest: Destination): Promise<void> {
  try {
    const destRef = doc(db, COLLECTION_NAME, dest.id);
    const cleanData = formatDestinationForFirestore(dest);
    await setDoc(destRef, cleanData, { merge: true });
    console.info(`[Firestore] Berhasil menyimpan destinasi ${dest.id} (${dest.name}) ke cloud.`);
  } catch (error) {
    console.error(`[Firestore] Gagal menyimpan destinasi ${dest.id}:`, error);
    throw error;
  }
}

/**
 * Menyimpan batch seluruh destinasi ke Firestore.
 */
export async function saveAllDestinationsToFirestore(destinations: Destination[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    destinations.forEach((dest) => {
      const destRef = doc(db, COLLECTION_NAME, dest.id);
      const cleanData = formatDestinationForFirestore(dest);
      batch.set(destRef, cleanData, { merge: true });
    });
    await batch.commit();
    console.info(`[Firestore] Berhasil menyimpan batch ${destinations.length} destinasi ke cloud.`);
  } catch (error) {
    console.error('[Firestore] Gagal menyimpan batch destinasi:', error);
    throw error;
  }
}

/**
 * Menghapus destinasi dari Firestore secara permanen.
 */
export async function deleteDestinationFromFirestore(destId: string): Promise<void> {
  const destRef = doc(db, COLLECTION_NAME, destId);
  await deleteDoc(destRef);
}

/**
 * Seed data awal jika Firestore baru pertama kali dibuat.
 */
export async function seedInitialDestinations(): Promise<void> {
  await saveAllDestinationsToFirestore(INITIAL_DESTINATIONS);
}

/**
 * Ekspor data destinasi ke format CSV Spreadsheet (Google Sheets & MS Excel compatible).
 */
export function exportDestinationsToSpreadsheetCsv(destinations: Destination[], fileName = 'Destinasi_Wisata_Tana_Tidung'): void {
  const headers = [
    'ID',
    'Nama Destinasi',
    'Kecamatan',
    'Kategori',
    'Latitude',
    'Longitude',
    'Kapasitas Maksimal',
    'Pengunjung Saat Ini',
    'Status Kepadatan',
    'Jam Operasional',
    'Harga Tiket (Rp)',
    'Narahubung / Pokdarwis',
    'Destinasi Populer',
    'Fasilitas',
    'Deskripsi'
  ];

  const rows = destinations.map((d) => [
    `"${d.id}"`,
    `"${(d.name || '').replace(/"/g, '""')}"`,
    `"${d.kecamatan || ''}"`,
    `"${d.category || ''}"`,
    d.lat,
    d.lng,
    d.maxCapacity,
    d.currentVisitors,
    `"${d.status}"`,
    `"${d.openingHours || ''}"`,
    d.ticketPrice,
    `"${(d.contactPerson || '').replace(/"/g, '""')}"`,
    d.isPopular ? 'Ya' : 'Tidak',
    `"${(d.facilities || []).join('; ')}"`,
    `"${(d.description || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Impor data destinasi dari CSV Spreadsheet dan simpan langsung ke Firestore.
 */
export async function importDestinationsFromSpreadsheetCsv(csvText: string): Promise<Destination[]> {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('File CSV kosong atau tidak memiliki baris data.');
  }

  // Parse CSV baris sederhana dengan penanganan kutip ganda
  function parseCsvLine(text: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const parsedDestinations: Destination[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 5) continue;

    const id = cols[0] || `dest-csv-${Date.now()}-${i}`;
    const name = cols[1] || 'Destinasi Tanpa Nama';
    const kecamatan = (cols[2] as any) || 'Sesayap';
    const category = (cols[3] as any) || 'Alam';
    const lat = parseFloat(cols[4]) || 3.55;
    const lng = parseFloat(cols[5]) || 117.25;
    const maxCapacity = parseInt(cols[6], 10) || 200;
    const currentVisitors = parseInt(cols[7], 10) || 0;
    const status = (cols[8] as any) || (currentVisitors >= maxCapacity * 0.9 ? 'PENUH' : currentVisitors >= maxCapacity * 0.75 ? 'WASPADA' : 'NORMAL');
    const openingHours = cols[9] || '08:00 - 17:00 WITA';
    const ticketPrice = parseInt(cols[10], 10) || 0;
    const contactPerson = cols[11] || '';
    const isPopular = cols[12]?.toLowerCase() === 'ya' || cols[12]?.toLowerCase() === 'true';
    const facilities = cols[13] ? cols[13].split(';').map((f) => f.trim()).filter(Boolean) : ['Area Parkir', 'Toilet'];
    const description = cols[14] || `Destinasi wisata ${name} di Kabupaten Tana Tidung`;

    const dest: Destination = {
      id,
      name,
      kecamatan,
      category,
      lat,
      lng,
      maxCapacity,
      currentVisitors,
      status,
      openingHours,
      ticketPrice,
      contactPerson,
      isPopular,
      facilities,
      description,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      sensors: {
        crowdSensor: {
          active: true,
          currentDensityPercent: Math.round((currentVisitors / maxCapacity) * 100) || 10,
          thresholdPercent: 85,
          status: 'NORMAL',
          liveDetectionCount: currentVisitors
        }
      }
    };

    parsedDestinations.push(dest);
  }

  if (parsedDestinations.length > 0) {
    // Simpan otomatis ke Firebase Firestore
    await saveAllDestinationsToFirestore(parsedDestinations);
  }

  return parsedDestinations;
}
