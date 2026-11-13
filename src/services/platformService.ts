import { getSupabaseClient, isSupabaseConfigured, SUPABASE_STAGE2_SCHEMA } from '../config/supabase';
import {
  DEMO_BUSINESSES,
  DEMO_PRODUCTS,
  DEMO_PROFESSIONALS,
  GARUT_CATEGORIES,
  GARUT_KECAMATAN,
} from '../data/demoData';
import type { Business, Category, Kecamatan, ProductItem, ProfessionalProfile } from '../types';

/**
 * Lapisan layanan API.
 * Tahap 1: Mengembalikan data DEMO dan status kesiapan integrasi Supabase.
 * Tahap 2: Saat Supabase sudah dikonfigurasi di .env, query akan diarahkan ke tabel Supabase.
 */
export interface PlatformStatus {
  stage: 'TAHAP_1_DEMO' | 'TAHAP_2_SUPABASE';
  supabaseConfigured: boolean;
  message: string;
}

export function getPlatformStatus(): PlatformStatus {
  if (isSupabaseConfigured) {
    return {
      stage: 'TAHAP_2_SUPABASE',
      supabaseConfigured: true,
      message: 'Kredensial Supabase terdeteksi. Siap melakukan sinkronisasi tabel.',
    };
  }
  return {
    stage: 'TAHAP_1_DEMO',
    supabaseConfigured: false,
    message:
      'Tahap 1 aktif: menggunakan data DEMO sementara di memori browser. Supabase belum dihubungkan.',
  };
}

export async function fetchInitialDirectoryData(): Promise<{
  businesses: Business[];
  products: ProductItem[];
  professionals: ProfessionalProfile[];
  categories: Category[];
  kecamatanList: Kecamatan[];
}> {
  // Simulasi latensi ringan agar loading state dapat diuji secara nyata
  await new Promise((resolve) => setTimeout(resolve, 180));

  const client = getSupabaseClient();
  if (client) {
    // Disiapkan untuk Tahap 2: apabila tabel belum dibuat di Supabase, tetap aman fallback ke demo
    try {
      const { data } = await client
        .from(SUPABASE_STAGE2_SCHEMA.tables.businesses)
        .select('*')
        .limit(1);
      if (data && data.length > 0) {
        // Mapping penuh akan diaktifkan pada Tahap 2 setelah skema SQL Supabase diterapkan
      }
    } catch {
      // Tetap gunakan data DEMO jika skema Tahap 2 belum dimigrasi
    }
  }

  return {
    businesses: DEMO_BUSINESSES,
    products: DEMO_PRODUCTS,
    professionals: DEMO_PROFESSIONALS,
    categories: GARUT_CATEGORIES,
    kecamatanList: GARUT_KECAMATAN.map((k) => k),
  };
}
