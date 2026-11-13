import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfigValidation {
  isConfigured: boolean;
  missingVars: string[];
  validationError: string | null;
}

export type SupabaseTableName =
  | 'profiles'
  | 'businesses'
  | 'company_profiles'
  | 'products'
  | 'professional_profiles';

export const REQUIRED_SUPABASE_TABLES: readonly SupabaseTableName[] = [
  'profiles',
  'businesses',
  'company_profiles',
  'products',
  'professional_profiles',
] as const;

export interface TableDiagnosticItem {
  table: SupabaseTableName;
  status: 'ready' | 'missing_table' | 'rls_blocked' | 'error';
  rowCount: number | null;
  detectedColumns: string[];
  detail: string;
}

export interface SupabaseConnectionTestResult {
  ok: boolean;
  status: 'not_configured' | 'invalid_config' | 'auth_ok_schema_pending' | 'connected' | 'error';
  message: string;
  checkedAt: string;
  tables: TableDiagnosticItem[];
}

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const rawSupabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

function isServiceRoleJwt(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded)) as { role?: string };
    return decoded.role === 'service_role';
  } catch {
    return false;
  }
}

function validateSupabaseConfig(): SupabaseConfigValidation {
  const missingVars: string[] = [];
  if (!rawSupabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!rawSupabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  if (missingVars.length > 0) {
    return {
      isConfigured: false,
      missingVars,
      validationError: `Variabel konfigurasi belum tersedia: ${missingVars.join(', ')}.`,
    };
  }

  try {
    const parsedUrl = new URL(rawSupabaseUrl);
    if (parsedUrl.protocol !== 'https:') {
      return {
        isConfigured: false,
        missingVars: [],
        validationError: 'VITE_SUPABASE_URL harus menggunakan protokol HTTPS.',
      };
    }
  } catch {
    return {
      isConfigured: false,
      missingVars: [],
      validationError: 'Format VITE_SUPABASE_URL tidak valid.',
    };
  }

  if (isServiceRoleJwt(rawSupabaseAnonKey)) {
    return {
      isConfigured: false,
      missingVars: [],
      validationError:
        'Ditolak demi keamanan: Service Role Key tidak boleh digunakan di frontend. Gunakan Anon Key publik.',
    };
  }

  return {
    isConfigured: true,
    missingVars: [],
    validationError: null,
  };
}

export const supabaseConfigStatus: SupabaseConfigValidation = validateSupabaseConfig();
export const isSupabaseConfigured: boolean = supabaseConfigStatus.isConfigured;

/**
 * Instance client Supabase tunggal (hanya dibuat jika konfigurasi valid).
 * Menggunakan Anon Key publik saja; Service Role Key dilarang keras di frontend.
 */
export const supabase: SupabaseClient | null = supabaseConfigStatus.isConfigured
  ? createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

export function requireSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      supabaseConfigStatus.validationError ??
        'Client Supabase belum siap. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY tersedia.'
    );
  }
  return supabase;
}

async function inspectSingleTable(
  client: SupabaseClient,
  table: SupabaseTableName
): Promise<TableDiagnosticItem> {
  try {
    const { data, count, error } = await client
      .from(table)
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      const code = error.code ?? '';
      const msgLower = error.message.toLowerCase();

      if (
        code === '42P01' ||
        code === 'PGRST205' ||
        msgLower.includes('could not find the table') ||
        msgLower.includes('does not exist')
      ) {
        return {
          table,
          status: 'missing_table',
          rowCount: null,
          detectedColumns: [],
          detail: `Tabel "${table}" belum ditemukan di skema publik.`,
        };
      }

      if (
        code === '42501' ||
        msgLower.includes('permission denied') ||
        msgLower.includes('row-level security')
      ) {
        return {
          table,
          status: 'rls_blocked',
          rowCount: null,
          detectedColumns: [],
          detail: `Akses baca dibatasi oleh kebijakan RLS (${error.message}).`,
        };
      }

      return {
        table,
        status: 'error',
        rowCount: null,
        detectedColumns: [],
        detail: `${error.code ? `[${error.code}] ` : ''}${error.message}`,
      };
    }

    const firstRow = Array.isArray(data) && data.length > 0 ? (data[0] as Record<string, unknown>) : null;
    const detectedColumns = firstRow ? Object.keys(firstRow) : [];

    return {
      table,
      status: 'ready',
      rowCount: typeof count === 'number' ? count : Array.isArray(data) ? data.length : 0,
      detectedColumns,
      detail:
        detectedColumns.length > 0
          ? `Tabel siap (${detectedColumns.length} kolom terdeteksi dari sampel baris).`
          : 'Tabel tersedia (saat ini 0 baris).',
    };
  } catch (err) {
    return {
      table,
      status: 'error',
      rowCount: null,
      detectedColumns: [],
      detail: err instanceof Error ? err.message : 'Gagal memeriksa tabel.',
    };
  }
}

/**
 * Pengujian koneksi nyata & pemeriksaan 5 tabel utama Supabase secara read-only.
 * Tidak membuat tabel dan tidak mengubah kebijakan RLS.
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionTestResult> {
  const checkedAt = new Date().toLocaleTimeString('id-ID');

  if (supabaseConfigStatus.missingVars.length > 0) {
    return {
      ok: false,
      status: 'not_configured',
      message:
        supabaseConfigStatus.validationError ??
        'Konfigurasi VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum tersedia.',
      checkedAt,
      tables: [],
    };
  }

  if (!supabase) {
    return {
      ok: false,
      status: 'invalid_config',
      message: supabaseConfigStatus.validationError ?? 'Konfigurasi Supabase tidak valid.',
      checkedAt,
      tables: [],
    };
  }

  try {
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
      return {
        ok: false,
        status: 'error',
        message: `Endpoint Auth merespons error: ${authError.message}`,
        checkedAt,
        tables: [],
      };
    }

    const tableResults = await Promise.all(
      REQUIRED_SUPABASE_TABLES.map((tbl) => inspectSingleTable(supabase!, tbl))
    );

    const readyCount = tableResults.filter((t) => t.status === 'ready').length;
    const missingCount = tableResults.filter((t) => t.status === 'missing_table').length;

    if (readyCount === REQUIRED_SUPABASE_TABLES.length) {
      return {
        ok: true,
        status: 'connected',
        message: `Koneksi Supabase aktif. Seluruh ${readyCount} tabel utama terdeteksi dan dapat dibaca.`,
        checkedAt,
        tables: tableResults,
      };
    }

    if (missingCount > 0) {
      return {
        ok: false,
        status: 'auth_ok_schema_pending',
        message: `Endpoint Auth merespons normal, tetapi ${missingCount} dari ${REQUIRED_SUPABASE_TABLES.length} tabel belum tersedia di Supabase.`,
        checkedAt,
        tables: tableResults,
      };
    }

    return {
      ok: false,
      status: 'error',
      message: `Sebagian tabel (${readyCount}/${REQUIRED_SUPABASE_TABLES.length}) dapat diakses; periksa rincian di bawah.`,
      checkedAt,
      tables: tableResults,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'error',
      message:
        err instanceof Error
          ? `Gagal menjangkau server Supabase: ${err.message}`
          : 'Gagal menjangkau server Supabase.',
      checkedAt,
      tables: [],
    };
  }
}
