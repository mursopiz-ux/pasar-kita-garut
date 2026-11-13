import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BusinessCard } from '../components/BusinessCard';
import { DemoNotice } from '../components/DemoNotice';
import { ErrorState } from '../components/ErrorState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { useDemoApp } from '../context/DemoAppContext';
import { ApprovalStatus } from '../types';

export function DirectoryPage() {
  const [searchParams] = useSearchParams();
  const { businesses, loading, error, reloadDirectory } = useDemoApp();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [selectedKecamatan, setSelectedKecamatan] = useState(
    searchParams.get('kecamatan') ?? 'all'
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('kategori') ?? 'all'
  );

  useEffect(() => {
    const q = searchParams.get('q');
    const kec = searchParams.get('kecamatan');
    const kat = searchParams.get('kategori');
    if (q !== null) setQuery(q);
    if (kec !== null) setSelectedKecamatan(kec);
    if (kat !== null) setSelectedCategory(kat);
  }, [searchParams]);

  const approvedBusinesses = businesses.filter((b) => b.status === ApprovalStatus.APPROVED);

  const filtered = approvedBusinesses.filter((biz) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      biz.name.toLowerCase().includes(q) ||
      biz.tagline.toLowerCase().includes(q) ||
      biz.description.toLowerCase().includes(q) ||
      biz.address.toLowerCase().includes(q);

    const matchesKec =
      selectedKecamatan === 'all' || biz.kecamatanSlug === selectedKecamatan;

    const matchesCat =
      selectedCategory === 'all' || biz.categorySlug === selectedCategory;

    return matchesQuery && matchesKec && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Direktori Usaha Kabupaten Garut
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Cari usaha lokal yang telah disetujui berdasarkan nama, kategori, atau kecamatan.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg min-h-[44px] whitespace-nowrap shrink-0"
        >
          Daftarkan Usaha Gratis
        </Link>
      </div>

      <DemoNotice compact />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        selectedKecamatan={selectedKecamatan}
        onKecamatanChange={setSelectedKecamatan}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="tabular-nums">
          Menampilkan <strong>{filtered.length}</strong> usaha disetujui (Data DEMO)
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void reloadDirectory(false)}
            className="text-emerald-800 hover:underline font-medium"
          >
            Muat ulang daftar
          </button>
          <button
            type="button"
            onClick={() => void reloadDirectory(true)}
            className="text-slate-500 hover:text-slate-800 underline"
          >
            Uji Error State
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reloadDirectory(false)} />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Tidak ada usaha yang cocok
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Ubah kata kunci pencarian atau pilih kecamatan lain di Kabupaten Garut.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedKecamatan('all');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg min-h-[44px]"
          >
            Tampilkan Semua Usaha
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      )}
    </div>
  );
}
