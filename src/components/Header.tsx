import { Link, NavLink } from 'react-router-dom';
import { useDemoApp } from '../context/DemoAppContext';

export function Header() {
  const { session } = useDemoApp();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
      isActive
        ? 'text-emerald-800 border-orange-600'
        : 'text-slate-600 border-transparent hover:text-emerald-800 hover:border-emerald-300'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 md:sticky md:top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-8">
        {/* Zona 1: Brand Wordmark satu baris */}
        <Link
          to="/"
          className="font-display text-base sm:text-lg font-bold tracking-tight text-emerald-900 whitespace-nowrap shrink-0"
        >
          PASAR KITA <span className="text-orange-600">ti GARUT</span>
        </Link>

        {/* Zona 2: 5 tautan navigasi ringkas */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-6"
        >
          <NavLink to="/direktori" className={navLinkClass}>
            Direktori
          </NavLink>
          <NavLink to="/kategori" className={navLinkClass}>
            Kategori
          </NavLink>
          <NavLink to="/kecamatan" className={navLinkClass}>
            Kecamatan
          </NavLink>
          <NavLink to="/katalog" className={navLinkClass}>
            Katalog
          </NavLink>
          <NavLink to="/profesional" className={navLinkClass}>
            Profesional
          </NavLink>
        </nav>

        {/* Zona 3: 1 aksi utama */}
        <div className="flex items-center shrink-0">
          {session ? (
            <Link
              to={session.role === 'admin' ? '/admin' : '/dashboard'}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              {session.role === 'admin' ? 'Panel Admin' : 'Dashboard'}
            </Link>
          ) : (
            <Link
              to="/masuk"
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              Daftar / Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
