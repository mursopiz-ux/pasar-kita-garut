import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DemoAppProvider } from './context/DemoAppContext';
import { HomePage } from './pages/HomePage';

const DirectoryPage = lazy(() =>
  import('./pages/DirectoryPage').then((m) => ({ default: m.DirectoryPage }))
);
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const KecamatanPage = lazy(() =>
  import('./pages/KecamatanPage').then((m) => ({ default: m.KecamatanPage }))
);
const BusinessDetailPage = lazy(() =>
  import('./pages/BusinessDetailPage').then((m) => ({ default: m.BusinessDetailPage }))
);
const CompanyProfilePage = lazy(() =>
  import('./pages/CompanyProfilePage').then((m) => ({ default: m.CompanyProfilePage }))
);
const CatalogPage = lazy(() =>
  import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage }))
);
const ProfessionalsPage = lazy(() =>
  import('./pages/ProfessionalsPage').then((m) => ({ default: m.ProfessionalsPage }))
);
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((m) => ({ default: m.AuthPage }))
);
const UserDashboardPage = lazy(() =>
  import('./pages/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <LoadingSkeleton count={3} />
    </div>
  );
}

export default function App() {
  return (
    <DemoAppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/direktori" element={<DirectoryPage />} />
                <Route path="/kategori" element={<CategoriesPage />} />
                <Route path="/kategori/:slug" element={<CategoriesPage />} />
                <Route path="/kecamatan" element={<KecamatanPage />} />
                <Route path="/kecamatan/:slug" element={<KecamatanPage />} />
                <Route path="/usaha/:slug" element={<BusinessDetailPage />} />
                <Route path="/usaha/:slug/katalog" element={<CatalogPage />} />
                <Route path="/company-profile" element={<CompanyProfilePage />} />
                <Route path="/company-profile/:slug" element={<CompanyProfilePage />} />
                <Route path="/katalog" element={<CatalogPage />} />
                <Route path="/profesional" element={<ProfessionalsPage />} />
                <Route path="/profesional/:slug" element={<ProfessionalsPage />} />
                <Route path="/masuk" element={<AuthPage />} />
                <Route path="/daftar" element={<AuthPage />} />
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </BrowserRouter>
    </DemoAppProvider>
  );
}
