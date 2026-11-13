import { Briefcase, Home, LayoutGrid, Store, UserCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useDemoApp } from '../context/DemoAppContext';

export function MobileBottomNav() {
  const { session } = useDemoApp();

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center h-full min-w-[44px] transition-colors ${
      isActive ? 'text-orange-600 font-semibold' : 'text-slate-600 hover:text-emerald-800'
    }`;

  return (
    <nav
      aria-label="Navigasi bawah seluler"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center"
    >
      <NavLink to="/" end className={itemClass}>
        <Home className="w-5 h-5" aria-hidden="true" />
        <span className="text-[10px] mt-0.5 whitespace-nowrap">Beranda</span>
      </NavLink>
      <NavLink to="/direktori" className={itemClass}>
        <Store className="w-5 h-5" aria-hidden="true" />
        <span className="text-[10px] mt-0.5 whitespace-nowrap">Direktori</span>
      </NavLink>
      <NavLink to="/katalog" className={itemClass}>
        <LayoutGrid className="w-5 h-5" aria-hidden="true" />
        <span className="text-[10px] mt-0.5 whitespace-nowrap">Katalog</span>
      </NavLink>
      <NavLink to="/profesional" className={itemClass}>
        <Briefcase className="w-5 h-5" aria-hidden="true" />
        <span className="text-[10px] mt-0.5 whitespace-nowrap">CV / Ahli</span>
      </NavLink>
      <NavLink
        to={session ? (session.role === 'admin' ? '/admin' : '/dashboard') : '/masuk'}
        className={itemClass}
      >
        <UserCheck className="w-5 h-5" aria-hidden="true" />
        <span className="text-[10px] mt-0.5 whitespace-nowrap">
          {session ? 'Akun' : 'Masuk'}
        </span>
      </NavLink>
    </nav>
  );
}
