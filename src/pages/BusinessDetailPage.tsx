import { Building2, Clock, LayoutGrid, Mail, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ApprovalStatusLabel } from '../components/ApprovalStatusLabel';
import { DemoNotice } from '../components/DemoNotice';
import { OptimizedImage } from '../components/OptimizedImage';
import { ProductCard } from '../components/ProductCard';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { useDemoApp } from '../context/DemoAppContext';

export function BusinessDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { businesses, products, categories, kecamatanList } = useDemoApp();

  const business = businesses.find((b) => b.slug === slug);

  if (!business) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Profil Usaha Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-600">
          Data usaha tersebut belum tersedia atau hanya ada di sesi sebelumnya.
        </p>
        <Link
          to="/direktori"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 rounded-lg min-h-[44px]"
        >
          Kembali ke Direktori
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === business.categorySlug);
  const kecamatan = kecamatanList.find((k) => k.slug === business.kecamatanSlug);
  const bizProducts = products.filter((p) => p.businessId === business.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link to="/direktori" className="hover:text-emerald-800">
          Direktori Usaha
        </Link>
        <span aria-hidden="true">/</span>
        {kecamatan && (
          <>
            <Link to={`/kecamatan/${kecamatan.slug}`} className="hover:text-emerald-800">
              Kec. {kecamatan.name}
            </Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span className="text-slate-800 font-medium truncate">{business.name}</span>
      </div>

      <DemoNotice compact />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto bg-slate-100">
            <OptimizedImage
              src={business.coverUrl}
              alt={business.name}
              eager
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="font-medium text-emerald-800">
                  {category?.name ?? 'Usaha Lokal'}
                </span>
                <span aria-hidden="true">·</span>
                <ApprovalStatusLabel status={business.status} />
                {business.isDemo && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-orange-700 font-medium">Data Contoh DEMO</span>
                  </>
                )}
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                  <OptimizedImage
                    src={business.logoUrl}
                    alt={`Logo ${business.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                    {business.name}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 mt-1">{business.tagline}</p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed pt-2">
                {business.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-600">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{business.address}</span>
                </p>
                <p className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{business.operatingHours}</span>
                </p>
                <p className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="break-all">{business.email}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <WhatsAppButton
                phone={business.whatsapp}
                message={`Halo ${business.name}, saya menemukan profil usaha Anda di PASAR KITA ti GARUT.`}
                label="Hubungi via WhatsApp"
              />
              <Link
                to={`/company-profile/${business.slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg min-h-[44px] whitespace-nowrap"
              >
                <Building2 className="w-4 h-4" aria-hidden="true" />
                <span>Buka Company Profile</span>
              </Link>
              <Link
                to={`/usaha/${business.slug}/katalog`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg min-h-[44px] whitespace-nowrap"
              >
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                <span>Katalog ({bizProducts.length})</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Katalog Produk & Jasa Usaha Ini */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Produk &amp; Jasa dari {business.name}
          </h2>
          <Link
            to={`/usaha/${business.slug}/katalog`}
            className="text-sm font-medium text-emerald-800 hover:text-orange-600"
          >
            Lihat Semua Katalog
          </Link>
        </div>

        {bizProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
            Usaha ini belum menambahkan item katalog produk atau jasa pada sesi DEMO.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bizProducts.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
