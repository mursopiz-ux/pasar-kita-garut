import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Konfigurasi integrasi Supabase (Tahap 2).
 * Pada Tahap 1, kredensial tidak diisi secara hardcoded dan tidak menggunakan kredensial palsu.
 * Aplikasi akan berjalan dalam mode DATA DEMO hingga VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dikonfigurasi.
 */
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  supabaseUrl.startsWith('https://');

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
}

export const SUPABASE_STAGE2_SCHEMA = {
  tables: {
    businesses: 'businesses',
    products: 'products',
    professionals: 'professionals',
    profiles: 'profiles',
  },
  storageBuckets: {
    businessMedia: 'business-media',
    professionalCv: 'professional-cv',
  },
} as const;
