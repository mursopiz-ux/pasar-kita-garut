import { Link } from 'react-router-dom';
import { useDemoApp } from '../context/DemoAppContext';
import { ListingType, type ProductItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import { OptimizedImage } from './OptimizedImage';
import { WhatsAppButton } from './WhatsAppButton';

export function ProductCard({ item }: { item: ProductItem }) {
  const { businesses, kecamatanList } = useDemoApp();
  const parentBiz = businesses.find((b) => b.id === item.businessId);
  const kecamatan = kecamatanList.find((k) => k.slug === item.kecamatanSlug);

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-emerald-300 transition-colors">
      <Link
        to={`/usaha/${item.businessSlug}/katalog`}
        className="block aspect-[4/3] bg-slate-100 overflow-hidden"
      >
        <OptimizedImage
          src={item.thumbnailUrl || item.imageUrl}
          alt={item.name}
          fallbackLabel={item.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
            <span className="font-medium text-emerald-800">
              {item.type === ListingType.PRODUCT ? 'Produk' : 'Jasa'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{kecamatan ? `Kec. ${kecamatan.name}` : 'Garut'}</span>
            {item.isDemo && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-orange-700 font-medium">DEMO</span>
              </>
            )}
          </div>

          <h3 className="font-display text-base font-semibold text-slate-900 leading-snug">
            {item.name}
          </h3>

          <p className="text-xs text-slate-500">
            Oleh{' '}
            <Link to={`/usaha/${item.businessSlug}`} className="text-emerald-800 hover:underline">
              {item.businessName}
            </Link>
          </p>

          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <p className="font-mono tabular-nums text-base font-bold text-slate-900">
              {formatRupiah(item.price)}
            </p>
            <p className="text-xs text-slate-500">per {item.unit}</p>
          </div>

          <WhatsAppButton
            phone={parentBiz?.whatsapp || '081200001001'}
            message={`Halo ${item.businessName}, saya tertarik dengan ${item.name} (${formatRupiah(item.price)}/${item.unit}).`}
            label="Pesan"
            variant="compact"
          />
        </div>
      </div>
    </article>
  );
}
