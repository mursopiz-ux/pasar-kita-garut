import { ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { DemoNotice } from '../components/DemoNotice';
import { OptimizedImage } from '../components/OptimizedImage';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { useDemoApp } from '../context/DemoAppContext';
import { ApprovalStatus } from '../types';

export function CompanyProfilePage() {
  const { slug } = useParams<{ slug?: string }>();
  const { businesses, kecamatanList, categories } = useDemoApp();

  const approvedBusinesses = businesses.filter((b) => b.status === ApprovalStatus.APPROVED);
  const business = slug ? businesses.find((b) => b.slug === slug) : undefined;

  if (!slug || !business) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Company Profile Usaha Garut (DEMO)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Pilih usaha di bawah untuk melihat halaman profil perusahaan lengkap berisi visi, misi, legalitas, dan jejak karya.
          </p>
        </div>

        <DemoNotice compact />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedBusinesses.map((biz) => {
            const kec = kecamatanList.find((k) => k.slug === biz.kecamatanSlug);
            return (
              <Link
                key={biz.id}
                to={`/company-profile/${biz.slug}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-400 transition-colors flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <OptimizedImage
                        src={biz.logoUrl}
                        alt={biz.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-base font-semibold text-slate-900 truncate">
                        {biz.name}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {kec ? `Kec. ${kec.name}` : 'Garut'} · Berdiri{' '}
                        <span className="tabular-nums">{biz.companyProfile.foundedYear}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{biz.companyProfile.vision}</p>
                </div>

                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  <span>Buka Company Profile</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const kec = kecamatanList.find((k) => k.slug === business.kecamatanSlug);
  const cat = categories.find((c) => c.slug === business.categorySlug);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link to="/company-profile" className="hover:text-emerald-800">
          Company Profile
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800 font-medium">{business.name}</span>
      </div>

      <DemoNotice compact />

      {/* Header Company Profile */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
              <OptimizedImage
                src={business.logoUrl}
                alt={`Logo ${business.name}`}
                eager
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-emerald-800 font-medium">
                Company Profile · {cat?.name} · {kec ? `Kec. ${kec.name}` : 'Kab. Garut'}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {business.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600">{business.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <WhatsAppButton
              phone={business.whatsapp}
              message={`Halo ${business.name}, saya membaca Company Profile Anda di PASAR KITA ti GARUT dan ingin berkonsultasi.`}
              label="Kontak Bisnis"
            />
            <Link
              to={`/usaha/${business.slug}/katalog`}
              className="px-4 py-2.5 text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 min-h-[44px] inline-flex items-center"
            >
              Lihat Katalog
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Tahun Berdiri</p>
            <p className="font-mono tabular-nums text-base font-semibold text-slate-900 mt-0.5">
              {business.companyProfile.foundedYear}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Skala Tim</p>
            <p className="text-base font-semibold text-slate-900 mt-0.5">
              {business.companyProfile.teamSize}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Legalitas</p>
            <p className="text-base font-semibold text-slate-900 mt-0.5">
              {business.companyProfile.legalStatus}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Lokasi Utama</p>
            <p className="text-base font-semibold text-slate-900 mt-0.5">
              {kec ? `Kec. ${kec.name}` : 'Garut'}
            </p>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 bg-emerald-900 text-white rounded-2xl p-6 sm:p-7 space-y-3">
          <p className="text-xs font-medium text-emerald-200">Visi Perusahaan (DEMO)</p>
          <p className="font-display text-lg sm:text-xl font-semibold leading-relaxed">
            “{business.companyProfile.vision}”
          </p>
        </div>

        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">Misi &amp; Komitmen</h2>
          <ul className="space-y-3">
            {business.companyProfile.mission.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Jejak Langkah & Area Layanan */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">Jejak Langkah Usaha</h2>
          <div className="space-y-4">
            {business.companyProfile.milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex gap-4 pb-4 border-b border-slate-100 last:border-none last:pb-0"
              >
                <span className="font-mono tabular-nums text-sm font-bold text-orange-600 shrink-0 w-12">
                  {m.year}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{m.title}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">Jangkauan Layanan</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {business.companyProfile.serviceAreas.map((area, i) => (
              <li key={i} className="py-1.5 border-b border-slate-100 last:border-none">
                {area}
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <p className="text-xs font-medium text-slate-500 mb-2">Galeri Foto (DEMO)</p>
            <div className="grid grid-cols-2 gap-2">
              {business.galleryUrls.map((url, idx) => (
                <div key={idx} className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                  <OptimizedImage
                    src={url}
                    alt={`${business.name} galeri ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
