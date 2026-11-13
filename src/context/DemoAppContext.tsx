import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  GARUT_CATEGORIES,
  GARUT_KECAMATAN,
  PROFESSIONAL_PORTRAIT_IMAGE,
  SERVICE_STUDIO_IMAGE,
} from '../data/demoData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchInitialDirectoryData,
  getPlatformStatus,
  type PlatformStatus,
} from '../services/platformService';
import {
  getCurrentSupabaseSession,
  insertBusinessWithCompanyProfile,
  insertProductToSupabase,
  insertProfessionalProfileToSupabase,
  signInWithSupabase,
  signOutFromSupabase,
  signUpWithSupabase,
  updateBusinessStatusInSupabase,
  updateProfessionalStatusInSupabase,
} from '../services/supabaseService';
import {
  ApprovalStatus,
  ListingType,
  type Business,
  type Category,
  type Kecamatan,
  type ProductItem,
  type ProfessionalProfile,
  type UserSession,
} from '../types';
import { slugifyText } from '../utils/formatters';

interface NewBusinessInput {
  name: string;
  tagline: string;
  categorySlug: string;
  kecamatanSlug: string;
  address: string;
  whatsapp: string;
  email: string;
  description: string;
  operatingHours: string;
  logoUrl?: string;
  coverUrl?: string;
  vision: string;
  missionText: string;
  foundedYear: number;
  teamSize: string;
  legalStatus: string;
}

interface NewProductInput {
  businessId: string;
  type: ListingType;
  name: string;
  price: number;
  unit: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
}

interface DemoAppContextValue {
  businesses: Business[];
  products: ProductItem[];
  professionals: ProfessionalProfile[];
  categories: Category[];
  kecamatanList: Kecamatan[];
  session: UserSession | null;
  platformStatus: PlatformStatus;
  dataSource: 'demo' | 'supabase';
  diagnosticNotice: string | null;
  loading: boolean;
  error: string | null;
  reloadDirectory: (simulateError?: boolean) => Promise<void>;
  loginDemo: (email: string, role: 'user' | 'admin', name?: string, kecamatanSlug?: string) => void;
  loginSupabase: (email: string, password: string) => Promise<UserSession>;
  registerSupabase: (params: {
    email: string;
    password: string;
    fullName: string;
    kecamatanSlug: string;
  }) => Promise<{ session: UserSession | null; needsEmailConfirmation: boolean }>;
  logoutDemo: () => Promise<void>;
  addBusinessDemo: (input: NewBusinessInput) => Promise<Business>;
  updateBusinessMediaDemo: (businessId: string, logoUrl?: string, coverUrl?: string) => void;
  addProductDemo: (input: NewProductInput) => Promise<ProductItem>;
  updateProfessionalCvDemo: (
    profileId: string,
    cvPdfName: string,
    cvPdfSizeBytes: number,
    cvPdfObjectUrl: string
  ) => void;
  upsertMyProfessionalDemo: (payload: {
    fullName: string;
    headline: string;
    kecamatanSlug: string;
    skillsText: string;
    experienceYears: number;
    education: string;
    summary: string;
    whatsapp: string;
    email: string;
    avatarUrl?: string;
    cvPdfName?: string | null;
    cvPdfSizeBytes?: number | null;
    cvPdfObjectUrl?: string | null;
  }) => Promise<ProfessionalProfile>;
  setBusinessApprovalStatus: (businessId: string, status: ApprovalStatus) => Promise<void>;
  setProfessionalApprovalStatus: (profileId: string, status: ApprovalStatus) => Promise<void>;
}

const DemoAppContext = createContext<DemoAppContextValue | undefined>(undefined);

export function DemoAppProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [dataSource, setDataSource] = useState<'demo' | 'supabase'>('demo');
  const [diagnosticNotice, setDiagnosticNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const platformStatus = getPlatformStatus();

  const reloadDirectory = useCallback(async (simulateError = false) => {
    setLoading(true);
    setError(null);
    try {
      if (simulateError) {
        await new Promise((r) => setTimeout(r, 200));
        throw new Error('Simulasi gangguan jaringan saat memuat direktori Garut.');
      }
      const data = await fetchInitialDirectoryData();
      setBusinesses(data.businesses);
      setProducts(data.products);
      setProfessionals(data.professionals);
      setDataSource(data.dataSource);
      setDiagnosticNotice(data.diagnosticNotice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data direktori.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadDirectory(false);
  }, [reloadDirectory]);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    void getCurrentSupabaseSession().then((activeSession) => {
      if (activeSession) {
        setSession(activeSession);
      }
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, authSession) => {
      if (!authSession) {
        setSession((prev) => (prev && !prev.isDemoSession ? null : prev));
        return;
      }
      void getCurrentSupabaseSession().then((activeSession) => {
        if (activeSession) setSession(activeSession);
      });
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginDemo = useCallback(
    (email: string, role: 'user' | 'admin', name?: string, kecamatanSlug = 'garut-kota') => {
      const displayName =
        name?.trim() || (role === 'admin' ? 'Admin Kurasi (DEMO)' : 'Pelaku Usaha Garut (DEMO)');
      setSession({
        id: role === 'admin' ? 'demo-admin-1' : 'demo-user-1',
        name: displayName,
        email: email.trim(),
        role,
        kecamatanSlug,
        isDemoSession: true,
      });
    },
    []
  );

  const loginSupabase = useCallback(async (email: string, password: string) => {
    const userSession = await signInWithSupabase(email, password);
    setSession(userSession);
    return userSession;
  }, []);

  const registerSupabase = useCallback(
    async (params: {
      email: string;
      password: string;
      fullName: string;
      kecamatanSlug: string;
    }) => {
      const result = await signUpWithSupabase(params);
      if (result.session) {
        setSession(result.session);
      }
      return result;
    },
    []
  );

  const logoutDemo = useCallback(async () => {
    if (isSupabaseConfigured && session && !session.isDemoSession) {
      await signOutFromSupabase();
    }
    setSession(null);
  }, [session]);

  const addBusinessDemo = useCallback(
    async (input: NewBusinessInput): Promise<Business> => {
      const missionLines = input.missionText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (dataSource === 'supabase' && isSupabaseConfigured) {
        if (!session || session.isDemoSession) {
          throw new Error(
            'Silakan masuk terlebih dahulu melalui Supabase Auth di halaman Masuk agar pendaftaran usaha tersimpan ke akun Anda.'
          );
        }
        const createdLive = await insertBusinessWithCompanyProfile({
          name: input.name,
          tagline: input.tagline,
          categorySlug: input.categorySlug,
          kecamatanSlug: input.kecamatanSlug,
          address: input.address,
          whatsapp: input.whatsapp,
          email: input.email,
          description: input.description,
          operatingHours: input.operatingHours || 'Senin - Sabtu · 08.00 - 17.00 WIB',
          logoUrl: input.logoUrl || SERVICE_STUDIO_IMAGE,
          coverUrl: input.coverUrl || input.logoUrl || SERVICE_STUDIO_IMAGE,
          ownerId: session.id,
          vision: input.vision || 'Menyediakan produk dan jasa lokal Garut yang terpercaya.',
          mission:
            missionLines.length > 0
              ? missionLines
              : ['Menjaga kualitas produk dan pelayanan lokal Garut.'],
          foundedYear: input.foundedYear || 2024,
          teamSize: input.teamSize || '3 Orang',
          legalStatus: input.legalStatus || 'UMKM Terdaftar',
        });
        setBusinesses((prev) => [createdLive, ...prev]);
        return createdLive;
      }

      const id = `demo-biz-${Date.now()}`;
      const baseSlug = slugifyText(input.name) || 'usaha-garut';
      const newBiz: Business = {
        id,
        slug: `${baseSlug}-${Math.floor(Math.random() * 900 + 100)}`,
        name: input.name.includes('(DEMO)') ? input.name : `${input.name} (DEMO)`,
        tagline: input.tagline,
        categorySlug: input.categorySlug,
        kecamatanSlug: input.kecamatanSlug,
        address: input.address,
        whatsapp: input.whatsapp,
        email: input.email,
        logoUrl: input.logoUrl || SERVICE_STUDIO_IMAGE,
        coverUrl: input.coverUrl || input.logoUrl || SERVICE_STUDIO_IMAGE,
        galleryUrls: [input.coverUrl || SERVICE_STUDIO_IMAGE],
        description: input.description,
        operatingHours: input.operatingHours || 'Senin - Sabtu · 08.00 - 17.00 WIB',
        status: ApprovalStatus.PENDING,
        isDemo: true,
        ownerId: session?.id || 'demo-user-1',
        createdAt: new Date().toISOString().slice(0, 10),
        companyProfile: {
          vision: input.vision || 'Menyediakan produk dan jasa lokal Garut yang terpercaya.',
          mission: missionLines,
          foundedYear: input.foundedYear || 2024,
          teamSize: input.teamSize || '3 Orang (DEMO)',
          legalStatus: input.legalStatus || 'Pendaftaran Mandiri (DEMO)',
          serviceAreas: ['Kabupaten Garut'],
          milestones: [
            {
              year: String(input.foundedYear || 2026),
              title: 'Pendaftaran Direktori DEMO',
              detail: 'Menunggu persetujuan admin pada sesi mode DEMO.',
            },
          ],
        },
      };
      setBusinesses((prev) => [newBiz, ...prev]);
      return newBiz;
    },
    [dataSource, session]
  );

  const updateBusinessMediaDemo = useCallback(
    (businessId: string, logoUrl?: string, coverUrl?: string) => {
      setBusinesses((prev) =>
        prev.map((biz) => {
          if (biz.id !== businessId) return biz;
          return {
            ...biz,
            logoUrl: logoUrl ?? biz.logoUrl,
            coverUrl: coverUrl ?? biz.coverUrl,
            galleryUrls: coverUrl ? [coverUrl, ...biz.galleryUrls.slice(0, 3)] : biz.galleryUrls,
          };
        })
      );
    },
    []
  );

  const addProductDemo = useCallback(
    async (input: NewProductInput): Promise<ProductItem> => {
      const parentBiz = businesses.find((b) => b.id === input.businessId);

      if (dataSource === 'supabase' && isSupabaseConfigured) {
        const createdLive = await insertProductToSupabase({
          businessId: input.businessId,
          type: input.type,
          name: input.name,
          price: input.price,
          unit: input.unit || 'pcs',
          description: input.description,
          imageUrl: input.imageUrl,
          thumbnailUrl: input.thumbnailUrl,
          parentBusiness: parentBiz,
        });
        setProducts((prev) => [createdLive, ...prev]);
        return createdLive;
      }

      const newItem: ProductItem = {
        id: `demo-prod-${Date.now()}`,
        businessId: input.businessId,
        businessSlug: parentBiz?.slug ?? 'usaha-demo',
        businessName: parentBiz?.name ?? 'Usaha Lokal (DEMO)',
        kecamatanSlug: parentBiz?.kecamatanSlug ?? 'garut-kota',
        type: input.type,
        name: input.name.includes('(DEMO)') ? input.name : `${input.name} (DEMO)`,
        price: input.price,
        unit: input.unit || 'pcs',
        description: input.description,
        imageUrl: input.imageUrl,
        thumbnailUrl: input.thumbnailUrl,
        isAvailable: true,
        isDemo: true,
      };
      setProducts((prev) => [newItem, ...prev]);
      return newItem;
    },
    [businesses, dataSource]
  );

  const updateProfessionalCvDemo = useCallback(
    (profileId: string, cvPdfName: string, cvPdfSizeBytes: number, cvPdfObjectUrl: string) => {
      setProfessionals((prev) =>
        prev.map((pro) =>
          pro.id === profileId
            ? { ...pro, cvPdfName, cvPdfSizeBytes, cvPdfObjectUrl }
            : pro
        )
      );
    },
    []
  );

  const upsertMyProfessionalDemo = useCallback(
    async (payload: {
      fullName: string;
      headline: string;
      kecamatanSlug: string;
      skillsText: string;
      experienceYears: number;
      education: string;
      summary: string;
      whatsapp: string;
      email: string;
      avatarUrl?: string;
      cvPdfName?: string | null;
      cvPdfSizeBytes?: number | null;
      cvPdfObjectUrl?: string | null;
    }): Promise<ProfessionalProfile> => {
      const skills = payload.skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (dataSource === 'supabase' && isSupabaseConfigured) {
        const createdLive = await insertProfessionalProfileToSupabase({
          userId: session && !session.isDemoSession ? session.id : undefined,
          fullName: payload.fullName,
          headline: payload.headline,
          kecamatanSlug: payload.kecamatanSlug,
          skills,
          experienceYears: payload.experienceYears,
          education: payload.education,
          summary: payload.summary,
          whatsapp: payload.whatsapp,
          email: payload.email,
          avatarUrl: payload.avatarUrl || PROFESSIONAL_PORTRAIT_IMAGE,
          cvPdfName: payload.cvPdfName ?? null,
          cvPdfSizeBytes: payload.cvPdfSizeBytes ?? null,
          cvPdfUrl: payload.cvPdfObjectUrl ?? null,
        });
        setProfessionals((prev) => [createdLive, ...prev]);
        return createdLive;
      }

      const newPro: ProfessionalProfile = {
        id: `demo-pro-${Date.now()}`,
        slug: `${slugifyText(payload.fullName)}-${Math.floor(Math.random() * 900 + 100)}`,
        fullName: payload.fullName.includes('(DEMO)')
          ? payload.fullName
          : `${payload.fullName} (Contoh DEMO)`,
        headline: payload.headline,
        kecamatanSlug: payload.kecamatanSlug,
        skills,
        experienceYears: payload.experienceYears,
        education: payload.education,
        summary: payload.summary,
        whatsapp: payload.whatsapp,
        email: payload.email,
        avatarUrl: payload.avatarUrl || PROFESSIONAL_PORTRAIT_IMAGE,
        cvPdfName: payload.cvPdfName ?? null,
        cvPdfSizeBytes: payload.cvPdfSizeBytes ?? null,
        cvPdfObjectUrl: payload.cvPdfObjectUrl ?? null,
        status: ApprovalStatus.PENDING,
        isDemo: true,
        experiences: [
          {
            role: payload.headline,
            organization: 'Pengalaman Mandiri (DEMO)',
            period: 'Terbaru',
            description: payload.summary,
          },
        ],
      };
      setProfessionals((prev) => [newPro, ...prev]);
      return newPro;
    },
    [dataSource, session]
  );

  const setBusinessApprovalStatus = useCallback(
    async (businessId: string, status: ApprovalStatus) => {
      if (dataSource === 'supabase' && isSupabaseConfigured) {
        await updateBusinessStatusInSupabase(businessId, status);
      }
      setBusinesses((prev) =>
        prev.map((biz) => (biz.id === businessId ? { ...biz, status } : biz))
      );
    },
    [dataSource]
  );

  const setProfessionalApprovalStatus = useCallback(
    async (profileId: string, status: ApprovalStatus) => {
      if (dataSource === 'supabase' && isSupabaseConfigured) {
        await updateProfessionalStatusInSupabase(profileId, status);
      }
      setProfessionals((prev) =>
        prev.map((pro) => (pro.id === profileId ? { ...pro, status } : pro))
      );
    },
    [dataSource]
  );

  return (
    <DemoAppContext.Provider
      value={{
        businesses,
        products,
        professionals,
        categories: GARUT_CATEGORIES,
        kecamatanList: GARUT_KECAMATAN,
        session,
        platformStatus,
        dataSource,
        diagnosticNotice,
        loading,
        error,
        reloadDirectory,
        loginDemo,
        loginSupabase,
        registerSupabase,
        logoutDemo,
        addBusinessDemo,
        updateBusinessMediaDemo,
        addProductDemo,
        updateProfessionalCvDemo,
        upsertMyProfessionalDemo,
        setBusinessApprovalStatus,
        setProfessionalApprovalStatus,
      }}
    >
      {children}
    </DemoAppContext.Provider>
  );
}

export function useDemoApp() {
  const ctx = useContext(DemoAppContext);
  if (!ctx) {
    throw new Error('useDemoApp harus digunakan di dalam DemoAppProvider.');
  }
  return ctx;
}
