import { ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DemoNotice } from '../components/DemoNotice';
import { useDemoApp } from '../context/DemoAppContext';
import { isSupabaseConfigured } from '../lib/supabase';

export function AuthPage() {
  const navigate = useNavigate();
  const {
    kecamatanList,
    session,
    dataSource,
    loginDemo,
    loginSupabase,
    registerSupabase,
    logoutDemo,
  } = useDemoApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kecamatanSlug, setKecamatanSlug] = useState('garut-kota');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setInfoMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setFormError('Masukkan alamat email yang valid.');
      return;
    }
    if (password.length < 6) {
      setFormError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (mode === 'register' && name.trim().length < 3) {
      setFormError('Nama lengkap atau nama pemilik usaha minimal 3 karakter.');
      return;
    }

    if (isSupabaseConfigured) {
      setSubmitting(true);
      try {
        if (mode === 'login') {
          await loginSupabase(email, password);
          navigate('/dashboard');
        } else {
          const res = await registerSupabase({
            email,
            password,
            fullName: name,
            kecamatanSlug,
          });
          if (res.needsEmailConfirmation) {
            setInfoMessage(
              'Pendaftaran berhasil. Silakan periksa kotak masuk email Anda untuk konfirmasi sebelum masuk.'
            );
          } else {
            navigate('/dashboard');
          }
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Gagal memproses autentikasi Supabase.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    loginDemo(email, 'user', mode === 'register' ? name : undefined, kecamatanSlug);
    navigate('/dashboard');
  };

  if (session) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <p className="text-xs font-medium text-emerald-800">
            {session.isDemoSession ? 'Sesi Aktif (Mode DEMO)' : 'Sesi Aktif (Supabase Auth)'}
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Halo, {session.name}
          </h1>
          <p className="text-sm text-slate-600">
            Email: <span className="font-medium text-slate-800">{session.email}</span> · Peran:{' '}
            <span className="font-medium text-slate-800 uppercase">{session.role}</span>
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(session.role === 'admin' ? '/admin' : '/dashboard')}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg min-h-[44px]"
            >
              Buka {session.role === 'admin' ? 'Dashboard Admin' : 'Dashboard Pengguna'}
            </button>
            <button
              type="button"
              onClick={() => void logoutDemo()}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg min-h-[44px]"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Masuk atau Daftar Gratis
        </h1>
        <p className="text-sm text-slate-600">
          Kelola profil usaha, katalog produk, dan CV profesional Anda di PASAR KITA ti GARUT.
        </p>
      </div>

      <DemoNotice compact />

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFormError(null);
              setInfoMessage(null);
            }}
            className={`py-2 text-sm font-medium rounded-md transition-colors min-h-[40px] ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFormError(null);
              setInfoMessage(null);
            }}
            className={`py-2 text-sm font-medium rounded-md transition-colors min-h-[40px] ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Daftar Gratis
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-slate-800 mb-1">
                Nama Lengkap
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-slate-800 mb-1">
              Alamat Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@contoh.com"
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-slate-800 mb-1">
              Kata Sandi
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="auth-kec" className="block text-sm font-medium text-slate-800 mb-1">
                Kecamatan Domisili
              </label>
              <select
                id="auth-kec"
                value={kecamatanSlug}
                onChange={(e) => setKecamatanSlug(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-600 focus:outline-none"
              >
                {kecamatanList.map((k) => (
                  <option key={k.slug} value={k.slug}>
                    Kec. {k.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formError && (
            <p
              role="alert"
              className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"
            >
              {formError}
            </p>
          )}

          {infoMessage && (
            <p
              role="status"
              className="text-xs font-medium text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg p-3"
            >
              {infoMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] py-2.5 px-4 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {submitting
              ? 'Memproses...'
              : isSupabaseConfigured
                ? mode === 'login'
                  ? 'Masuk dengan Email'
                  : 'Daftar Akun Gratis'
                : mode === 'login'
                  ? 'Masuk (Simulasi DEMO)'
                  : 'Daftar Akun Gratis (Simulasi DEMO)'}
          </button>
        </form>

        {dataSource === 'demo' && (
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-xs font-medium text-slate-500 text-center">
              Akses Cepat Uji Coba Mode DEMO
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  loginDemo('pelaku.usaha@garut.demo', 'user', 'Pelaku Usaha (DEMO)', 'garut-kota');
                  navigate('/dashboard');
                }}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg min-h-[44px]"
              >
                <User className="w-4 h-4" aria-hidden="true" />
                <span>Masuk Pelaku Usaha</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  loginDemo('admin@pasarkitagarut.demo', 'admin', 'Admin Kurasi (DEMO)', 'garut-kota');
                  navigate('/admin');
                }}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Masuk Sebagai Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
