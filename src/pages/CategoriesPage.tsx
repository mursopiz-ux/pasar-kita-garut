import { ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { BusinessCard } from '../components/BusinessCard';
import { DemoNotice } from '../components/DemoNotice';
import { useDemoApp } from '../context/DemoAppContext';
import { ApprovalStatus } from '../types';

export function CategoriesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { categories, businesses } = useDemoApp();

  const approvedBusinesses = businesses.filter((b) => b.status === ApprovalStatus.APPROVED);
  const activeCategory = slug ? categories.find((c) => c.slug === slug) : undefined;

  const filteredBusinesses = activeCategory
    ? approvedBusinesses.filter((b) => b.categorySlug === activeCategory.slug)
    : approvedBusinesses;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-medium text-emerald-800">
          <Link to="/kategori" className="hover:underline">
            Kategori Usaha
          </Link>
          {activeCategory ? ` · ${activeCategory.name}` : ''}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          {activeCategory ? activeCategory.name : 'Kategori Usaha di Garut'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {activeCategory
            ? activeCategory.description
            : 'Pilih kategori untuk menemukan pelaku usaha, pengrajin, dan penyedia jasa sesuai kebutuhan.'}
        </p>
      </div>

      <DemoNotice compact />

      {/* Tab filter kategori */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/kategori"
          className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors min-h-[40px] inline-flex items-center whitespace-nowrap ${
            !activeCategory
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
          }`}
        >
          Semua Kategori
        </Link>
        {categories.map((cat) => {
          const isCurrent = activeCategory?.slug === cat.slug;
          const count = approvedBusinesses.filter((b) => b.categorySlug === cat.slug).length;
          return (
            <Link
              key={cat.slug}
              to={`/kategori/${cat.slug}`}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors min-h-[40px] inline-flex items-center gap-1.5 whitespace-nowrap ${
                isCurrent
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
              }`}
            >
              <span>{cat.name}</span>
              <span className="font-mono tabular-nums text-xs opacity-80">({count})</span>
            </Link>
          );
        })}
      </div>

      {!activeCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const count = approvedBusinesses.filter((b) => b.categorySlug === cat.slug).length;
            return (
              <Link
                key={cat.slug}
                to={`/kategori/${cat.slug}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-400 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    {cat.name}
                  </h2>
                  <span className="font-mono tabular-nums text-xs font-medium text-emerald-800">
                    {count} usaha
                  </span>
                </div>
                <p className="text-sm text-slate-600">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 pt-1">
                  Lihat daftar <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {activeCategory && (
        <section className="space-y-4">
          <p className="text-xs text-slate-500 tabular-nums">
            Ditemukan {filteredBusinesses.length} usaha disetujui pada kategori ini (Data DEMO).
          </p>
          {filteredBusinesses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
              <p className="text-sm text-slate-600">
                Belum ada contoh usaha pada kategori {activeCategory.name}.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg min-h-[44px]"
              >
                Daftarkan Usaha di Kategori Ini
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
