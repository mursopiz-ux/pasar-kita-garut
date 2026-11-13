import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../config/appConfig';
import { useDemoApp } from '../context/DemoAppContext';

export function Footer() {
  const { platformStatus, dataSource } = useDemoApp();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2.5">
            <p className="font-display text-base font-bold text-emerald-900">
              {APP_CONFIG.appName}
            </p>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Platform direktori usaha lokal, company profile, katalog produk dan jasa, serta profil profesional untuk masyarakat {APP_CONFIG.regionName}.
            </p>
            <p className="text-xs text-slate-500">
              Status:{' '}
              {dataSource === 'supabase'
                ? 'Terhubung ke Supabase (Data Langsung)'
                : platformStatus.supabaseConfigured
                  ? 'Client Supabase siap · Mode Data DEMO aktif'
                  : 'Mode Data DEMO (Konfigurasi Supabase belum tersedia)'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Jelajahi Direktori</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>
                <Link to="/direktori" className="hover:text-emerald-800">
                  Direktori Usaha
                </Link>
              </li>
              <li>
                <Link to="/kategori" className="hover:text-emerald-800">
                  Kategori Usaha
                </Link>
              </li>
              <li>
                <Link to="/kecamatan" className="hover:text-emerald-800">
                  Direktori per Kecamatan
                </Link>
              </li>
              <li>
                <Link to="/katalog" className="hover:text-emerald-800">
                  Katalog Produk &amp; Jasa
                </Link>
              </li>
              <li>
                <Link to="/profesional" className="hover:text-emerald-800">
                  Profil Profesional &amp; CV
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Pengelolaan &amp; Pendaftaran</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>
                <Link to="/masuk" className="hover:text-emerald-800">
                  Daftar Usaha Gratis / Masuk
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-800">
                  Dashboard Pengguna
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-800">
                  Dashboard Admin (Persetujuan)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PASAR KITA ti GARUT · Kabupaten Garut</p>
          <p>Ringan · Mobile-First · Tahap 1 Data DEMO</p>
        </div>
      </div>
    </footer>
  );
}
