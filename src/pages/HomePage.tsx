import { ArrowRight, Briefcase, Building2, MapPin, Store } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BusinessCard } from '../components/BusinessCard';
import { DemoNotice } from '../components/DemoNotice';
import { ErrorState } from '../components/ErrorState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { OptimizedImage } from '../components/OptimizedImage';
import { ProductCard } from '../components/ProductCard';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { useDemoApp } from '../context/DemoAppContext';
import { HERO_BANNER_IMAGE } from '../data/demoData';
import { ApprovalStatus } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const {
    businesses,
    products,
    professionals,
    categories,
    kecamatanList,
    loading,
    error,
    reloadDirectory,
  } = useDemoApp();

  const [quickQuery, setQuickQuery] = useState('');
  const [quickKecamatan, setQuickKecamatan] = useState('all');

  const approvedBusinesses = businesses.filter((b) => b.status === ApprovalStatus.APPROVED);
  const approvedProfessionals = professionals.filter((p) => p.status === ApprovalStatus.APPROVED);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickQuery.trim()) params.set('q', quickQuery.trim());
    if (quickKecamatan !== 'all') params.set('kecamatan', quickKecamatan);
    navigate(`/direktori${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-medium text-emerald-800">
                  Kabupaten Garut · Direktori Usaha, Katalog &amp; Profil Profesional
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15] text-balance">
                  Temukan Usaha Lokal, Produk Pilihan, dan Tenaga Ahli Garut
                </h1>
                <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
                  Etalase digital ringan untuk UMKM, penyedia jasa, profil perusahaan, hingga CV profesional masyarakat Garut dari wilayah utara hingga pesisir selatan.
                </p>
              </div>

              {/* Pencarian cepat langsung dari beranda */}
              <form
                onSubmit={handleQuickSearch}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:gap-2"
              >
                <label htmlFor="home-search" className="sr-only">
                  Cari usaha atau produk
                </label>
                <input
                  id="home-search"
                  type="search"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Cari kopi, jaket kulit, jasa bangunan..."
                  className="w-full sm:flex-1 min-h-[44px] px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-emerald-600 focus:outline-none"
                />

                <label htmlFor="home-kecamatan" className="sr-only">
                  Pilih Kecamatan
                </label>
                <select
                  id="home-kecamatan"
                  value={quickKecamatan}
                  onChange={(e) => setQuickKecamatan(e.target.value)}
                  className="w-full sm:w-48 min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="all">Semua Kecamatan</option>
                  {kecamatanList.map((k) => (
                    <option key={k.slug} value={k.slug}>
                      Kec. {k.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Cari Sekarang
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors min-h-[44px] whitespace-nowrap"
                >
                  <span>Daftarkan Usaha Gratis</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/direktori"
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-emerald-800 hover:text-orange-600 min-h-[44px] whitespace-nowrap"
                >
                  Lihat Semua Direktori
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-60 sm:h-72 lg:h-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <OptimizedImage
                  src={HERO_BANNER_IMAGE}
                  alt="Pemandangan perkebunan teh dan pegunungan Garut Jawa Barat"
                  fallbackLabel="Lanskap Kabupaten Garut"
                  eager
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Ringkasan metrik DEMO 4 kolom di bawah hero */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs text-slate-500">Usaha Disetujui (DEMO)</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-emerald-900 mt-1">
                {approvedBusinesses.length}
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs text-slate-500">Item Katalog (DEMO)</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-emerald-900 mt-1">
                {products.length}
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs text-slate-500">Profil &amp; CV Ahli (DEMO)</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-emerald-900 mt-1">
                {approvedProfessionals.length}
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs text-slate-500">Kecamatan Tercakup</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-emerald-900 mt-1">
                {kecamatanList.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
        <DemoNotice />

        {/* Kategori Usaha */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                Kategori Usaha Lokal
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Telusuri sektor perdagangan, kerajinan, hingga layanan jasa di Garut.
              </p>
            </div>
            <Link
              to="/kategori"
              className="text-sm font-medium text-emerald-800 hover:text-orange-600 whitespace-nowrap"
            >
              Semua Kategori
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = approvedBusinesses.filter((b) => b.categorySlug === cat.slug).length;
              return (
                <Link
                  key={cat.slug}
                  to={`/kategori/${cat.slug}`}
                  className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-emerald-400 transition-colors flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base font-semibold text-slate-900">
                        {cat.name}
                      </h3>
                      <span className="font-mono tabular-nums text-xs text-emerald-800 font-medium">
                        {count} usaha
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{cat.description}</p>
                  </div>
                  <span className="text-xs font-medium text-orange-600 inline-flex items-center gap-1">
                    Buka Kategori <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Direktori Usaha Pilihan (DEMO) */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                Direktori Usaha Contoh (DEMO)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Profil usaha beserta company profile dan kontak WhatsApp langsung.
              </p>
            </div>
            <Link
              to="/direktori"
              className="text-sm font-medium text-emerald-800 hover:text-orange-600 whitespace-nowrap"
            >
              Lihat Direktori
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void reloadDirectory(false)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedBusinesses.slice(0, 3).map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
          )}
        </section>

        {/* Katalog Produk & Jasa (DEMO) */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                Katalog Produk &amp; Jasa (DEMO)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Foto katalog terkompresi agar cepat dibuka lewat jaringan seluler Android.
              </p>
            </div>
            <Link
              to="/katalog"
              className="text-sm font-medium text-emerald-800 hover:text-orange-600 whitespace-nowrap"
            >
              Semua Katalog
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 3).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Profil Profesional & Wilayah Kecamatan */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Tenaga Profesional &amp; CV (DEMO)
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Profil keahlian warga Garut lengkap dengan dokumen CV PDF.
                </p>
              </div>
              <Link
                to="/profesional"
                className="text-sm font-medium text-emerald-800 hover:text-orange-600 whitespace-nowrap"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {approvedProfessionals.slice(0, 2).map((pro) => (
                <ProfessionalCard key={pro.id} profile={pro} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Jelajah per Kecamatan
              </h2>
              <Link
                to="/kecamatan"
                className="text-xs font-medium text-emerald-800 hover:text-orange-600 whitespace-nowrap"
              >
                Semua Kecamatan
              </Link>
            </div>
            <p className="text-sm text-slate-600">
              Pilih wilayah kecamatan untuk melihat usaha dan talenta di sekitar lokasi Anda.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {kecamatanList.slice(0, 8).map((kec) => (
                <Link
                  key={kec.slug}
                  to={`/kecamatan/${kec.slug}`}
                  className="px-3 py-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-sm text-slate-800 font-medium transition-colors flex items-center justify-between gap-2 min-h-[44px]"
                >
                  <span className="truncate">{kec.name}</span>
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
              <Link to="/direktori" className="p-2 rounded-lg hover:bg-slate-50 flex flex-col items-center gap-1">
                <Store className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Direktori</span>
              </Link>
              <Link to="/company-profile" className="p-2 rounded-lg hover:bg-slate-50 flex flex-col items-center gap-1">
                <Building2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Company Profile</span>
              </Link>
              <Link to="/profesional" className="p-2 rounded-lg hover:bg-slate-50 flex flex-col items-center gap-1">
                <Briefcase className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>CV / Ahli</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
