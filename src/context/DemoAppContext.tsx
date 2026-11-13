import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  GARUT_CATEGORIES,
  GARUT_KECAMATAN,
  SERVICE_STUDIO_IMAGE,
  PROFESSIONAL_PORTRAIT_IMAGE,
} from '../data/demoData';
import { fetchInitialDirectoryData, getPlatformStatus, type PlatformStatus } from '../services/platformService';
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
  loading: boolean;
  error: string | null;
  reloadDirectory: (simulateError?: boolean) => Promise<void>;
  loginDemo: (email: string, role: 'user' | 'admin', name?: string, kecamatanSlug?: string) => void;
  logoutDemo: () => void;
  addBusinessDemo: (input: NewBusinessInput) => Business;
  updateBusinessMediaDemo: (businessId: string, logoUrl?: string, coverUrl?: string) => void;
  addProductDemo: (input: NewProductInput) => ProductItem;
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
  }) => ProfessionalProfile;
  setBusinessApprovalStatus: (businessId: string, status: ApprovalStatus) => void;
  setProfessionalApprovalStatus: (profileId: string, status: ApprovalStatus) => void;
}

const DemoAppContext = createContext<DemoAppContextValue | undefined>(undefined);

export function DemoAppProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const platformStatus = getPlatformStatus();

  const reloadDirectory = useCallback(async (simulateError = false) => {
    setLoading(true);
    setError(null);
    try {
      if (simulateError) {
        await new Promise((r) => setTimeout(r, 250));
        throw new Error('Simulasi gangguan jaringan saat memuat direktori Garut.');
      }
      const data = await fetchInitialDirectoryData();
      setBusinesses(data.businesses);
      setProducts(data.products);
      setProfessionals(data.professionals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data direktori.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadDirectory(false);
  }, [reloadDirectory]);

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

  const logoutDemo = useCallback(() => {
    setSession(null);
  }, []);

  const addBusinessDemo = useCallback(
    (input: NewBusinessInput): Business => {
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
          mission: input.missionText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
          foundedYear: input.foundedYear || 2024,
          teamSize: input.teamSize || '3 Orang (DEMO)',
          legalStatus: input.legalStatus || 'Pendaftaran Mandiri (DEMO)',
          serviceAreas: ['Kabupaten Garut'],
          milestones: [
            {
              year: String(input.foundedYear || 2026),
              title: 'Pendaftaran Direktori DEMO',
              detail: 'Menunggu persetujuan admin pada sesi Tahap 1.',
            },
          ],
        },
      };
      setBusinesses((prev) => [newBiz, ...prev]);
      return newBiz;
    },
    [session]
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
    (input: NewProductInput): ProductItem => {
      const parentBiz = businesses.find((b) => b.id === input.businessId);
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
    [businesses]
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
    (payload: {
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
    }): ProfessionalProfile => {
      const newPro: ProfessionalProfile = {
        id: `demo-pro-${Date.now()}`,
        slug: `${slugifyText(payload.fullName)}-${Math.floor(Math.random() * 900 + 100)}`,
        fullName: payload.fullName.includes('(DEMO)')
          ? payload.fullName
          : `${payload.fullName} (Contoh DEMO)`,
        headline: payload.headline,
        kecamatanSlug: payload.kecamatanSlug,
        skills: payload.skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
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
    []
  );

  const setBusinessApprovalStatus = useCallback((businessId: string, status: ApprovalStatus) => {
    setBusinesses((prev) =>
      prev.map((biz) => (biz.id === businessId ? { ...biz, status } : biz))
    );
  }, []);

  const setProfessionalApprovalStatus = useCallback((profileId: string, status: ApprovalStatus) => {
    setProfessionals((prev) =>
      prev.map((pro) => (pro.id === profileId ? { ...pro, status } : pro))
    );
  }, []);

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
        loading,
        error,
        reloadDirectory,
        loginDemo,
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
