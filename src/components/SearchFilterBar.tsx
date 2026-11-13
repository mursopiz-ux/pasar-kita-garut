import { RotateCcw, Search } from 'lucide-react';
import { useDemoApp } from '../context/DemoAppContext';

interface SearchFilterBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  selectedKecamatan: string;
  onKecamatanChange: (slug: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (slug: string) => void;
  placeholder?: string;
  showCategoryFilter?: boolean;
}

export function SearchFilterBar({
  query,
  onQueryChange,
  selectedKecamatan,
  onKecamatanChange,
  selectedCategory = 'all',
  onCategoryChange,
  placeholder = 'Cari nama usaha, produk, atau keahlian...',
  showCategoryFilter = true,
}: SearchFilterBarProps) {
  const { kecamatanList, categories } = useDemoApp();

  const hasFilters =
    query.trim().length > 0 ||
    selectedKecamatan !== 'all' ||
    (showCategoryFilter && selectedCategory !== 'all');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className={showCategoryFilter ? 'md:col-span-5 relative' : 'md:col-span-7 relative'}>
          <label htmlFor="search-input" className="sr-only">
            Pencarian
          </label>
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[44px] pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className={showCategoryFilter ? 'md:col-span-3' : 'md:col-span-4'}>
          <label htmlFor="filter-kecamatan" className="sr-only">
            Filter Kecamatan
          </label>
          <select
            id="filter-kecamatan"
            value={selectedKecamatan}
            onChange={(e) => onKecamatanChange(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
          >
            <option value="all">Semua Kecamatan Garut</option>
            {kecamatanList.map((kec) => (
              <option key={kec.slug} value={kec.slug}>
                Kec. {kec.name}
              </option>
            ))}
          </select>
        </div>

        {showCategoryFilter && onCategoryChange && (
          <div className="md:col-span-3">
            <label htmlFor="filter-category" className="sr-only">
              Filter Kategori
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="md:col-span-1 flex items-center justify-end">
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => {
              onQueryChange('');
              onKecamatanChange('all');
              if (onCategoryChange) onCategoryChange('all');
            }}
            title="Reset filter"
            className="w-full md:w-auto min-h-[44px] px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="md:hidden">Reset Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
