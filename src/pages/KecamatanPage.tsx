import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BusinessCard } from '../components/BusinessCard';
import { DemoNotice } from '../components/DemoNotice';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { useDemoApp } from '../context/DemoAppContext';
import { ApprovalStatus } from '../types';

const ZONES = ['Semua', 'Tengah', 'Utara', 'Selatan', 'Timur', 'Barat'] as const;

export function KecamatanPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { kecamatanList, businesses, professionals } = useDemoApp();
  const [selectedZone, setSelectedZone] = useState<(typeof ZONES)[number]>('Semua');

  const activeKecamatan = slug ? kecamatanList.find((k) => k.slug === slug) : undefined;
  const approvedBusinesses = businesses.filter((b) => b.status === ApprovalStatus.APPROVED);
  const approvedPros = professionals.filter((p) => p.status === ApprovalStatus.APPROVED);

  const visibleKecamatan =
    selectedZone === 'Semua'
      ? kecamatanList
      : kecamatanList.filter((k) => k.zone === selectedZone);

  if (activeKecamatan) {
    const localBusinesses = approvedBusinesses.filter(
      (b) => b.kecamatanSlug === activeKecamatan.slug
    );
    const localPros = approvedPros.filter((p) => p.kecamatanSlug === activeKecamatan.slug);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-emerald-800">
            <Link to="/kecamatan" className="hover:underline">
              Kecamatan Garut
            </Link>
            <span> · Wilayah {activeKecamatan.zone}</span>
            <span> · Kode Pos {activeKecamatan.postalPrefix}</span>
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Kecamatan {activeKecamatan.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            {activeKecamatan.highlight}
          </p>
        </div>

        <DemoNotice compact />

        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Usaha Lokal di Kec. {activeKecamatan.name} ({localBusinesses.length})
          </h2>
          {localBusinesses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>Belum ada data usaha DEMO yang terdaftar di Kecamatan {activeKecamatan.name}.</span>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg whitespace-nowrap self-start sm:self-auto"
              >
                Daftarkan Usaha di Sini
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localBusinesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Profesional &amp; CV di Kec. {activeKecamatan.name} ({localPros.length})
          </h2>
          {localPros.length === 0 ? (
            <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-5">
              Belum ada profil profesional contoh di kecamatan ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {localPros.map((pro) => (
                <ProfessionalCard key={pro.id} profile={pro} />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Halaman Kecamatan Kabupaten Garut
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Jelajahi direktori usaha dan tenaga profesional berdasarkan wilayah kecamatan di Garut.
        </p>
      </div>

      <DemoNotice compact />

      <div className="flex flex-wrap items-center gap-2">
        {ZONES.map((zone) => (
          <button
            key={zone}
            type="button"
            onClick={() => setSelectedZone(zone)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border min-h-[40px] whitespace-nowrap transition-colors ${
              selectedZone === zone
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
            }`}
          >
            {zone === 'Semua' ? 'Semua Wilayah' : `Garut ${zone}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleKecamatan.map((kec) => {
          const bizCount = approvedBusinesses.filter((b) => b.kecamatanSlug === kec.slug).length;
          return (
            <Link
              key={kec.slug}
              to={`/kecamatan/${kec.slug}`}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-400 transition-colors flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Wilayah {kec.zone}</span>
                  <span className="font-mono tabular-nums">Kode Pos {kec.postalPrefix}</span>
                </div>
                <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span>Kec. {kec.name}</span>
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">{kec.highlight}</p>
              </div>
              <p className="text-xs font-medium text-emerald-800 pt-2 border-t border-slate-100 tabular-nums">
                {bizCount} usaha disetujui (DEMO)
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
