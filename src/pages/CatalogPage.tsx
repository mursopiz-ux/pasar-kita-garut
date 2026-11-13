import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DemoNotice } from '../components/DemoNotice';
import { ErrorState } from '../components/ErrorState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ProductCard } from '../components/ProductCard';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { useDemoApp } from '../context/DemoAppContext';
import { ListingType } from '../types';

export function CatalogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { products, businesses, loading, error, reloadDirectory } = useDemoApp();

  const [query, setQuery] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ListingType>('ALL');

  const scopedBusiness = slug ? businesses.find((b) => b.slug === slug) : undefined;

  const filtered = products.filter((item) => {
    if (scopedBusiness && item.businessId !== scopedBusiness.id) {
      return false;
    }
    if (typeFilter !== 'ALL' && item.type !== typeFilter) {
      return false;
    }
    if (selectedKecamatan !== 'all' && item.kecamatanSlug !== selectedKecamatan) {
      return false;
    }
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.businessName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="space-y-1">
        {scopedBusiness && (
          <p className="text-xs text-slate-500">
            <Link to="/katalog" className="hover:text-emerald-800">
              Semua Katalog
            </Link>
            <span className="mx-1.5">/</span>
            <Link to={`/usaha/${scopedBusiness.slug}`} className="hover:text-emerald-800">
              {scopedBusiness.name}
            </Link>
          </p>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          {scopedBusiness
            ? `Katalog ${scopedBusiness.name}`
            : 'Katalog Produk & Jasa Lokal Garut'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Etalase foto produk dan jasa UMKM Garut dengan pemesanan langsung lewat WhatsApp.
        </p>
      </div>

      <DemoNotice compact />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors min-h-[40px] ${
              typeFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter(ListingType.PRODUCT)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors min-h-[40px] ${
              typeFilter === ListingType.PRODUCT
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Produk
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter(ListingType.SERVICE)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors min-h-[40px] ${
              typeFilter === ListingType.SERVICE
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jasa
          </button>
        </div>

        <span className="text-xs text-slate-500 tabular-nums">
          Menampilkan <strong>{filtered.length}</strong> item
        </span>
      </div>

      {!scopedBusiness && (
        <SearchFilterBar
          query={query}
          onQueryChange={setQuery}
          selectedKecamatan={selectedKecamatan}
          onKecamatanChange={setSelectedKecamatan}
          showCategoryFilter={false}
          placeholder="Cari produk dodol, kopi, tas kulit, atau layanan jasa..."
        />
      )}

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reloadDirectory(false)} />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-slate-600">Belum ada produk atau jasa yang sesuai filter.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedKecamatan('all');
              setTypeFilter('ALL');
            }}
            className="px-4 py-2 text-sm font-medium text-emerald-800 bg-emerald-50 rounded-lg min-h-[44px]"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
