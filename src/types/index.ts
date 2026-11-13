export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ListingType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  iconName: string;
}

export interface Kecamatan {
  slug: string;
  name: string;
  zone: 'Utara' | 'Tengah' | 'Selatan' | 'Timur' | 'Barat';
  postalPrefix: string;
  highlight: string;
}

export interface CompanyProfileData {
  vision: string;
  mission: string[];
  foundedYear: number;
  teamSize: string;
  legalStatus: string;
  serviceAreas: string[];
  milestones: { year: string; title: string; detail: string }[];
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  categorySlug: string;
  kecamatanSlug: string;
  address: string;
  whatsapp: string;
  email: string;
  website?: string;
  logoUrl: string;
  coverUrl: string;
  galleryUrls: string[];
  description: string;
  operatingHours: string;
  status: ApprovalStatus;
  isDemo: boolean;
  ownerId: string;
  createdAt: string;
  companyProfile: CompanyProfileData;
}

export interface ProductItem {
  id: string;
  businessId: string;
  businessSlug: string;
  businessName: string;
  kecamatanSlug: string;
  type: ListingType;
  name: string;
  price: number;
  unit: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  isAvailable: boolean;
  isDemo: boolean;
}

export interface ProfessionalProfile {
  id: string;
  slug: string;
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
  cvPdfObjectUrl: string | null;
  status: ApprovalStatus;
  isDemo: boolean;
  experiences: {
    role: string;
    organization: string;
    period: string;
    description: string;
  }[];
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  kecamatanSlug: string;
  isDemoSession: boolean;
}

export interface CompressedImageResult {
  dataUrl: string;
  thumbnailDataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
}
