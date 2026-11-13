import {
  DEMO_BUSINESSES,
  DEMO_PRODUCTS,
  DEMO_PROFESSIONALS,
  GARUT_CATEGORIES,
  GARUT_KECAMATAN,
} from '../data/demoData';
import {
  isSupabaseConfigured,
  supabaseConfigStatus,
  testSupabaseConnection,
  type SupabaseConnectionTestResult,
} from '../lib/supabase';
import type { Business, Category, Kecamatan, ProductItem, ProfessionalProfile } from '../types';
import { fetchAllFromSupabase } from './supabaseService';

export interface PlatformStatus {
  stage: 'TAHAP_1_DEMO' | 'TAHAP_2_SIAP_MIGRASI';
  supabaseConfigured: boolean;
  validationError: string | null;
  missingVars: string[];
  message: string;
}

export function getPlatformStatus(): PlatformStatus {
  if (isSupabaseConfigured) {
    return {
      stage: 'TAHAP_2_SIAP_MIGRASI',
      supabaseConfigured: true,
      validationError: null,
      missingVars: [],
      message:
        'Konfigurasi client Supabase (URL & Anon Key) tersedia. Data DEMO dipertahankan sampai seluruh tabel berhasil diuji.',
    };
  }
  return {
    stage: 'TAHAP_1_DEMO',
    supabaseConfigured: false,
    validationError: supabaseConfigStatus.validationError,
    missingVars: supabaseConfigStatus.missingVars,
    message:
      supabaseConfigStatus.validationError ??
      'Mode Data DEMO aktif. Konfigurasi Supabase belum tersedia.',
  };
}

export async function runSupabaseDiagnostic(): Promise<SupabaseConnectionTestResult> {
  return testSupabaseConnection();
}

export async function fetchInitialDirectoryData(): Promise<{
  businesses: Business[];
  products: ProductItem[];
  professionals: ProfessionalProfile[];
  categories: Category[];
  kecamatanList: Kecamatan[];
  dataSource: 'demo' | 'supabase';
  diagnosticNotice: string | null;
}> {
  if (isSupabaseConfigured) {
    try {
      const liveData = await fetchAllFromSupabase();
      return {
        businesses: liveData.businesses,
        products: liveData.products,
        professionals: liveData.professionals,
        categories: GARUT_CATEGORIES,
        kecamatanList: GARUT_KECAMATAN.map((k) => k),
        dataSource: 'supabase',
        diagnosticNotice: null,
      };
    } catch (err) {
      // Sesuai aturan: jangan menghapus data demo sebelum koneksi & tabel database berhasil diuji
      const reason = err instanceof Error ? err.message : 'Query Supabase gagal.';
      return {
        businesses: DEMO_BUSINESSES,
        products: DEMO_PRODUCTS,
        professionals: DEMO_PROFESSIONALS,
        categories: GARUT_CATEGORIES,
        kecamatanList: GARUT_KECAMATAN.map((k) => k),
        dataSource: 'demo',
        diagnosticNotice: `Fallback ke data DEMO karena database belum siap diakses: ${reason}`,
      };
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 150));

  return {
    businesses: DEMO_BUSINESSES,
    products: DEMO_PRODUCTS,
    professionals: DEMO_PROFESSIONALS,
    categories: GARUT_CATEGORIES,
    kecamatanList: GARUT_KECAMATAN.map((k) => k),
    dataSource: 'demo',
    diagnosticNotice: supabaseConfigStatus.validationError,
  };
}
