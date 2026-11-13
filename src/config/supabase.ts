export {
  getSupabaseClient,
  isSupabaseConfigured,
  REQUIRED_SUPABASE_TABLES,
  requireSupabaseClient,
  supabase,
  supabaseConfigStatus,
  testSupabaseConnection,
  type SupabaseConfigValidation,
  type SupabaseConnectionTestResult,
  type SupabaseTableName,
  type TableDiagnosticItem,
} from '../lib/supabase';

export const SUPABASE_STAGE2_SCHEMA = {
  tables: {
    profiles: 'profiles',
    businesses: 'businesses',
    companyProfiles: 'company_profiles',
    products: 'products',
    professionalProfiles: 'professional_profiles',
  },
  storageBuckets: {
    businessMedia: 'business-media',
    professionalCv: 'professional-cv',
  },
} as const;
