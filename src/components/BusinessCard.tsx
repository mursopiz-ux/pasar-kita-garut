import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDemoApp } from '../context/DemoAppContext';
import type { Business } from '../types';
import { OptimizedImage } from './OptimizedImage';
import { WhatsAppButton } from './WhatsAppButton';

export function BusinessCard({ business }: { business: Business }) {
  const { categories, kecamatanList } = useDemoApp();
  const category = categories.find((c) => c.slug === business.categorySlug);
  const kecamatan = kecamatanList.find((k) => k.slug === business.kecamatanSlug);

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-emerald-300 transition-colors">
      <Link to={`/usaha/${business.slug}`} className="block aspect-[4/3] bg-slate-100 overflow-hidden">
        <OptimizedImage
          src={business.coverUrl}
          alt={business.name}
          fallbackLabel={business.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="font-medium text-emerald-800">
              {kecamatan ? `Kec. ${kecamatan.name}` : 'Kab. Garut'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{category?.name ?? 'Usaha Lokal'}</span>
            {business.isDemo && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-orange-700 font-medium">Data DEMO</span>
              </>
            )}
          </div>

          <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900 leading-snug">
            <Link to={`/usaha/${business.slug}`} className="hover:text-emerald-800 transition-colors">
              {business.name}
            </Link>
          </h3>

          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {business.tagline}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            to={`/usaha/${business.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-orange-600 min-h-[44px] whitespace-nowrap"
          >
            <span>Lihat Profil</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <WhatsAppButton
            phone={business.whatsapp}
            message={`Halo ${business.name}, saya melihat profil usaha Anda di PASAR KITA ti GARUT.`}
            label="WhatsApp"
            variant="compact"
          />
        </div>
      </div>
    </article>
  );
}
