import { CULINARY_CRAFT_IMAGE, PROFESSIONAL_PORTRAIT_IMAGE, SERVICE_STUDIO_IMAGE } from '../data/demoData';
import { getSupabaseClient, requireSupabaseClient } from '../lib/supabase';
import {
  ApprovalStatus,
  ListingType,
  type Business,
  type CompanyProfileData,
  type ProductItem,
  type ProfessionalProfile,
  type UserSession,
} from '../types';
import { slugifyText } from '../utils/formatters';

type DbRow = Record<string, unknown>;

function str(val: unknown, fallback = ''): string {
  return typeof val === 'string' ? val : fallback;
}

function num(val: unknown, fallback = 0): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val))) {
    return Number(val);
  }
  return fallback;
}

function strArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.filter((v): v is string => typeof v === 'string');
  }
  if (typeof val === 'string' && val.trim().length > 0) {
    return val
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseApprovalStatus(val: unknown): ApprovalStatus {
  const upper = str(val).toUpperCase();
  if (upper === 'APPROVED') return ApprovalStatus.APPROVED;
  if (upper === 'REJECTED') return ApprovalStatus.REJECTED;
  return ApprovalStatus.PENDING;
}

function parseMilestones(val: unknown): { year: string; title: string; detail: string }[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item): item is DbRow => typeof item === 'object' && item !== null)
    .map((m) => ({
      year: str(m.year, '2026'),
      title: str(m.title, 'Tonggak Usaha'),
      detail: str(m.detail, ''),
    }));
}

function mapCompanyProfileRow(row: DbRow | undefined): CompanyProfileData {
  if (!row) {
    return {
      vision: 'Menjadi mitra usaha lokal Kabupaten Garut yang terpercaya.',
      mission: ['Menyediakan produk dan jasa berkualitas bagi masyarakat Garut.'],
      foundedYear: 2024,
      teamSize: 'Belum diisi',
      legalStatus: 'UMKM Garut',
      serviceAreas: ['Kabupaten Garut'],
      milestones: [],
    };
  }

  return {
    vision: str(row.vision, 'Menyediakan layanan dan produk unggulan di Kabupaten Garut.'),
    mission: strArray(row.mission).length
      ? strArray(row.mission)
      : ['Melayani pelanggan dengan standar mutu terjaga.'],
    foundedYear: num(row.founded_year ?? row.foundedYear, 2024),
    teamSize: str(row.team_size ?? row.teamSize, '1 - 5 Orang'),
    legalStatus: str(row.legal_status ?? row.legalStatus, 'Terdaftar'),
    serviceAreas: strArray(row.service_areas ?? row.serviceAreas).length
      ? strArray(row.service_areas ?? row.serviceAreas)
      : ['Kabupaten Garut'],
    milestones: parseMilestones(row.milestones),
  };
}

function mapBusinessRow(row: DbRow, companyProfileRow?: DbRow): Business {
  const id = str(row.id);
  const name = str(row.name, 'Usaha Garut');
  const slug = str(row.slug) || `${slugifyText(name)}-${id.slice(0, 6)}`;
  const logoUrl = str(row.logo_url ?? row.logoUrl) || SERVICE_STUDIO_IMAGE;
  const coverUrl = str(row.cover_url ?? row.coverUrl) || logoUrl;
  const gallery = strArray(row.gallery_urls ?? row.galleryUrls);

  return {
    id,
    slug,
    name,
    tagline: str(row.tagline),
    categorySlug: str(row.category_slug ?? row.categorySlug, 'kuliner-oleh-oleh'),
    kecamatanSlug: str(row.kecamatan_slug ?? row.kecamatanSlug, 'garut-kota'),
    address: str(row.address, 'Kabupaten Garut'),
    whatsapp: str(row.whatsapp),
    email: str(row.email),
    website: str(row.website) || undefined,
    logoUrl,
    coverUrl,
    galleryUrls: gallery.length > 0 ? gallery : [coverUrl],
    description: str(row.description, str(row.tagline)),
    operatingHours: str(row.operating_hours ?? row.operatingHours, 'Senin - Sabtu · 08.00 - 17.00 WIB'),
    status: parseApprovalStatus(row.status),
    isDemo: false,
    ownerId: str(row.owner_id ?? row.user_id ?? row.ownerId),
    createdAt: str(row.created_at ?? row.createdAt).slice(0, 10) || new Date().toISOString().slice(0, 10),
    companyProfile: mapCompanyProfileRow(companyProfileRow),
  };
}

function mapProductRow(row: DbRow, businessById: Map<string, Business>): ProductItem {
  const businessId = str(row.business_id ?? row.businessId);
  const parentBiz = businessById.get(businessId);
  const rawType = str(row.type, 'PRODUCT').toUpperCase();
  const imageUrl = str(row.image_url ?? row.imageUrl) || CULINARY_CRAFT_IMAGE;
  const thumbnailUrl = str(row.thumbnail_url ?? row.thumbnailUrl) || imageUrl;

  return {
    id: str(row.id),
    businessId,
    businessSlug: str(row.business_slug ?? row.businessSlug) || parentBiz?.slug || '',
    businessName: str(row.business_name ?? row.businessName) || parentBiz?.name || 'Usaha Garut',
    kecamatanSlug:
      str(row.kecamatan_slug ?? row.kecamatanSlug) || parentBiz?.kecamatanSlug || 'garut-kota',
    type: rawType === 'SERVICE' ? ListingType.SERVICE : ListingType.PRODUCT,
    name: str(row.name, 'Produk Lokal'),
    price: num(row.price, 0),
    unit: str(row.unit, 'pcs'),
    description: str(row.description),
    imageUrl,
    thumbnailUrl,
    isAvailable: row.is_available === undefined ? true : Boolean(row.is_available),
    isDemo: false,
  };
}

function mapProfessionalRow(row: DbRow): ProfessionalProfile {
  const id = str(row.id);
  const fullName = str(row.full_name ?? row.fullName ?? row.name, 'Profesional Garut');
  const slug = str(row.slug) || `${slugifyText(fullName)}-${id.slice(0, 6)}`;
  const rawExp = Array.isArray(row.experiences) ? row.experiences : [];

  return {
    id,
    slug,
    fullName,
    headline: str(row.headline, 'Tenaga Profesional'),
    kecamatanSlug: str(row.kecamatan_slug ?? row.kecamatanSlug, 'garut-kota'),
    skills: strArray(row.skills),
    experienceYears: num(row.experience_years ?? row.experienceYears, 1),
    education: str(row.education, 'Pendidikan Terakhir'),
    summary: str(row.summary),
    whatsapp: str(row.whatsapp),
    email: str(row.email),
    avatarUrl: str(row.avatar_url ?? row.avatarUrl) || PROFESSIONAL_PORTRAIT_IMAGE,
    cvPdfName: str(row.cv_pdf_name ?? row.cvPdfName) || null,
    cvPdfSizeBytes:
      row.cv_pdf_size_bytes !== undefined && row.cv_pdf_size_bytes !== null
        ? num(row.cv_pdf_size_bytes)
        : null,
    cvPdfObjectUrl: str(row.cv_pdf_url ?? row.cvPdfUrl) || null,
    status: parseApprovalStatus(row.status),
    isDemo: false,
    experiences: rawExp
      .filter((e): e is DbRow => typeof e === 'object' && e !== null)
      .map((e) => ({
        role: str(e.role, 'Peran'),
        organization: str(e.organization, 'Organisasi'),
        period: str(e.period, '-'),
        description: str(e.description),
      })),
  };
}

export async function fetchAllFromSupabase(): Promise<{
  businesses: Business[];
  products: ProductItem[];
  professionals: ProfessionalProfile[];
}> {
  const client = requireSupabaseClient();

  const [bizRes, compRes, prodRes, proRes] = await Promise.all([
    client.from('businesses').select('*').order('created_at', { ascending: false }),
    client.from('company_profiles').select('*'),
    client.from('products').select('*').order('created_at', { ascending: false }),
    client.from('professional_profiles').select('*').order('created_at', { ascending: false }),
  ]);

  if (bizRes.error) throw new Error(`Gagal memuat businesses: ${bizRes.error.message}`);
  if (compRes.error) throw new Error(`Gagal memuat company_profiles: ${compRes.error.message}`);
  if (prodRes.error) throw new Error(`Gagal memuat products: ${prodRes.error.message}`);
  if (proRes.error) throw new Error(`Gagal memuat professional_profiles: ${proRes.error.message}`);

  const companyByBizId = new Map<string, DbRow>();
  for (const row of (compRes.data ?? []) as DbRow[]) {
    const bizId = str(row.business_id ?? row.businessId);
    if (bizId) companyByBizId.set(bizId, row);
  }

  const businesses = ((bizRes.data ?? []) as DbRow[]).map((row) =>
    mapBusinessRow(row, companyByBizId.get(str(row.id)))
  );

  const bizById = new Map(businesses.map((b) => [b.id, b]));
  const products = ((prodRes.data ?? []) as DbRow[]).map((row) => mapProductRow(row, bizById));
  const professionals = ((proRes.data ?? []) as DbRow[]).map((row) => mapProfessionalRow(row));

  return { businesses, products, professionals };
}

export async function getCurrentSupabaseSession(): Promise<UserSession | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.auth.getSession();
  if (error || !data.session?.user) return null;

  const authUser = data.session.user;
  const { data: profileRow } = await client
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  const row = (profileRow ?? {}) as DbRow;
  const roleVal = str(row.role).toLowerCase() === 'admin' ? 'admin' : 'user';

  return {
    id: authUser.id,
    name:
      str(row.full_name ?? row.name) ||
      str(authUser.user_metadata?.full_name) ||
      authUser.email ||
      'Pengguna Garut',
    email: authUser.email ?? str(row.email),
    role: roleVal,
    kecamatanSlug: str(row.kecamatan_slug ?? row.kecamatanSlug, 'garut-kota'),
    isDemoSession: false,
  };
}

export async function signInWithSupabase(email: string, password: string): Promise<UserSession> {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
  if (!data.user) {
    throw new Error('Autentikasi gagal: data pengguna tidak ditemukan.');
  }

  const session = await getCurrentSupabaseSession();
  if (!session) {
    return {
      id: data.user.id,
      name: str(data.user.user_metadata?.full_name) || data.user.email || 'Pengguna Garut',
      email: data.user.email ?? email,
      role: 'user',
      kecamatanSlug: 'garut-kota',
      isDemoSession: false,
    };
  }
  return session;
}

export async function signUpWithSupabase(params: {
  email: string;
  password: string;
  fullName: string;
  kecamatanSlug: string;
}): Promise<{ session: UserSession | null; needsEmailConfirmation: boolean }> {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: {
        full_name: params.fullName.trim(),
        kecamatan_slug: params.kecamatanSlug,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user && data.session) {
    // Sinkronkan ke tabel profiles jika kebijakan RLS mengizinkan pengguna menulis profilnya sendiri
    await client.from('profiles').upsert({
      id: data.user.id,
      email: params.email.trim(),
      full_name: params.fullName.trim(),
      kecamatan_slug: params.kecamatanSlug,
      role: 'user',
    });

    const session = await getCurrentSupabaseSession();
    return { session, needsEmailConfirmation: false };
  }

  return { session: null, needsEmailConfirmation: true };
}

export async function signOutFromSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function insertBusinessWithCompanyProfile(input: {
  name: string;
  tagline: string;
  categorySlug: string;
  kecamatanSlug: string;
  address: string;
  whatsapp: string;
  email: string;
  description: string;
  operatingHours: string;
  logoUrl: string;
  coverUrl: string;
  ownerId: string;
  vision: string;
  mission: string[];
  foundedYear: number;
  teamSize: string;
  legalStatus: string;
}): Promise<Business> {
  const client = requireSupabaseClient();
  const slug = `${slugifyText(input.name) || 'usaha-garut'}-${Date.now().toString(36).slice(-4)}`;

  const { data: bizData, error: bizError } = await client
    .from('businesses')
    .insert({
      slug,
      name: input.name,
      tagline: input.tagline,
      category_slug: input.categorySlug,
      kecamatan_slug: input.kecamatanSlug,
      address: input.address,
      whatsapp: input.whatsapp,
      email: input.email,
      description: input.description,
      operating_hours: input.operatingHours,
      logo_url: input.logoUrl,
      cover_url: input.coverUrl,
      owner_id: input.ownerId,
      status: ApprovalStatus.PENDING,
    })
    .select('*')
    .single();

  if (bizError) {
    throw new Error(`Gagal menyimpan usaha ke tabel businesses: ${bizError.message}`);
  }

  const insertedBiz = bizData as DbRow;
  const businessId = str(insertedBiz.id);

  const { data: compData, error: compError } = await client
    .from('company_profiles')
    .insert({
      business_id: businessId,
      vision: input.vision,
      mission: input.mission,
      founded_year: input.foundedYear,
      team_size: input.teamSize,
      legal_status: input.legalStatus,
      service_areas: ['Kabupaten Garut'],
    })
    .select('*')
    .single();

  if (compError) {
    throw new Error(
      `Usaha tersimpan, tetapi gagal menyimpan company_profiles: ${compError.message}`
    );
  }

  return mapBusinessRow(insertedBiz, compData as DbRow);
}

export async function insertProductToSupabase(input: {
  businessId: string;
  type: ListingType;
  name: string;
  price: number;
  unit: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  parentBusiness?: Business;
}): Promise<ProductItem> {
  const client = requireSupabaseClient();

  const { data, error } = await client
    .from('products')
    .insert({
      business_id: input.businessId,
      type: input.type,
      name: input.name,
      price: input.price,
      unit: input.unit,
      description: input.description,
      image_url: input.imageUrl,
      thumbnail_url: input.thumbnailUrl,
      is_available: true,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan ke tabel products: ${error.message}`);
  }

  const map = new Map<string, Business>();
  if (input.parentBusiness) {
    map.set(input.parentBusiness.id, input.parentBusiness);
  }
  return mapProductRow(data as DbRow, map);
}

export async function insertProfessionalProfileToSupabase(input: {
  userId?: string;
  fullName: string;
  headline: string;
  kecamatanSlug: string;
  skills: string[];
  experienceYears: number;
  education: string;
  summary: string;
  whatsapp: string;
  email: string;
  avatarUrl: string;
  cvPdfName: string | null;
  cvPdfSizeBytes: number | null;
  cvPdfUrl: string | null;
}): Promise<ProfessionalProfile> {
  const client = requireSupabaseClient();
  const slug = `${slugifyText(input.fullName) || 'profesional-garut'}-${Date.now().toString(36).slice(-4)}`;

  const payload: DbRow = {
    slug,
    full_name: input.fullName,
    headline: input.headline,
    kecamatan_slug: input.kecamatanSlug,
    skills: input.skills,
    experience_years: input.experienceYears,
    education: input.education,
    summary: input.summary,
    whatsapp: input.whatsapp,
    email: input.email,
    avatar_url: input.avatarUrl,
    cv_pdf_name: input.cvPdfName,
    cv_pdf_size_bytes: input.cvPdfSizeBytes,
    cv_pdf_url: input.cvPdfUrl,
    status: ApprovalStatus.PENDING,
  };

  if (input.userId) {
    payload.user_id = input.userId;
  }

  const { data, error } = await client
    .from('professional_profiles')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan ke tabel professional_profiles: ${error.message}`);
  }

  return mapProfessionalRow(data as DbRow);
}

export async function updateBusinessStatusInSupabase(
  businessId: string,
  status: ApprovalStatus
): Promise<void> {
  const client = requireSupabaseClient();
  const { error } = await client
    .from('businesses')
    .update({ status })
    .eq('id', businessId);

  if (error) {
    throw new Error(`Gagal memperbarui status usaha: ${error.message}`);
  }
}

export async function updateProfessionalStatusInSupabase(
  profileId: string,
  status: ApprovalStatus
): Promise<void> {
  const client = requireSupabaseClient();
  const { error } = await client
    .from('professional_profiles')
    .update({ status })
    .eq('id', profileId);

  if (error) {
    throw new Error(`Gagal memperbarui status profil profesional: ${error.message}`);
  }
}
