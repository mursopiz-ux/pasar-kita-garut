import { ArrowLeft, Download, FileText, GraduationCap, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApprovalStatusLabel } from '../components/ApprovalStatusLabel';
import { DemoNotice } from '../components/DemoNotice';
import { ErrorState } from '../components/ErrorState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { OptimizedImage } from '../components/OptimizedImage';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { SearchFilterBar } from '../components/SearchFilterBar';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { useDemoApp } from '../context/DemoAppContext';
import { ApprovalStatus } from '../types';
import { formatBytes } from '../utils/formatters';

export function ProfessionalsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { professionals, kecamatanList, loading, error, reloadDirectory } = useDemoApp();
  const [query, setQuery] = useState('');
  const [selectedKecamatan, setSelectedKecamatan] = useState('all');

  if (slug) {
    const profile = professionals.find((p) => p.slug === slug);
    if (!profile) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Profil Profesional Tidak Ditemukan
          </h1>
          <Link
            to="/profesional"
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-emerald-700 rounded-lg min-h-[44px]"
          >
            Kembali ke Daftar Profesional
          </Link>
        </div>
      );
    }

    const kec = kecamatanList.find((k) => k.slug === profile.kecamatanSlug);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link
          to="/profesional"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-orange-600"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Daftar Profesional Garut</span>
        </Link>

        <DemoNotice compact />

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <OptimizedImage
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  eager
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  <ApprovalStatusLabel status={profile.status} />
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{profile.experienceYears} tahun pengalaman</span>
                  {profile.isDemo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-orange-700 font-medium">Profil Contoh DEMO</span>
                    </>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  {profile.fullName}
                </h1>
                <p className="text-base font-medium text-emerald-800">{profile.headline}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    {kec ? `Kec. ${kec.name}, Garut` : 'Kabupaten Garut'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    {profile.education}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <WhatsAppButton
                phone={profile.whatsapp}
                message={`Halo ${profile.fullName}, saya melihat profil profesional Anda di PASAR KITA ti GARUT.`}
                label="Hubungi via WhatsApp"
              />
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 space-y-2">
            <h2 className="font-display text-base font-bold text-slate-900">Ringkasan Profil</h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{profile.summary}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h2 className="font-display text-base font-bold text-slate-900">Keahlian Utama</h2>
            <p className="text-sm text-slate-700">{profile.skills.join(' · ')}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900">Riwayat Pengalaman</h2>
            <div className="space-y-4">
              {profile.experiences.map((exp, idx) => (
                <div key={idx} className="space-y-1 pb-3 border-b border-slate-100 last:border-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-sm font-semibold text-slate-900">{exp.role}</h3>
                    <span className="font-mono text-xs text-slate-500">{exp.period}</span>
                  </div>
                  <p className="text-xs font-medium text-emerald-800">{exp.organization}</p>
                  <p className="text-sm text-slate-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lampiran CV PDF */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="font-display text-base font-bold text-slate-900 mb-3">
              Dokumen CV (PDF)
            </h2>
            {profile.cvPdfName ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-6 h-6 text-orange-600 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {profile.cvPdfName}
                    </p>
                    <p className="text-xs text-slate-500 font-mono tabular-nums">
                      PDF · {profile.cvPdfSizeBytes ? formatBytes(profile.cvPdfSizeBytes) : 'Ukuran DEMO'}
                    </p>
                  </div>
                </div>

                {profile.cvPdfObjectUrl ? (
                  <a
                    href={profile.cvPdfObjectUrl}
                    download={profile.cvPdfName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg min-h-[44px] whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>Buka / Unduh PDF</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-600">
                    Berkas contoh DEMO (unggah PDF asli di menu Dashboard Pengguna untuk pratinjau unduhan)
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Pemilik profil belum melampirkan berkas CV PDF.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Mail className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{profile.email}</span>
          </div>
        </div>
      </div>
    );
  }

  const approvedPros = professionals.filter((p) => p.status === ApprovalStatus.APPROVED);
  const filtered = approvedPros.filter((pro) => {
    const matchesKec = selectedKecamatan === 'all' || pro.kecamatanSlug === selectedKecamatan;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      pro.fullName.toLowerCase().includes(q) ||
      pro.headline.toLowerCase().includes(q) ||
      pro.skills.some((s) => s.toLowerCase().includes(q));
    return matchesKec && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Profil Profesional &amp; CV Warga Garut
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Temukan tenaga terampil, konsultan, teknisi, dan lulusan lokal beserta CV PDF mereka.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg min-h-[44px] whitespace-nowrap shrink-0"
        >
          Buat Profil &amp; Unggah CV
        </Link>
      </div>

      <DemoNotice compact />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        selectedKecamatan={selectedKecamatan}
        onKecamatanChange={setSelectedKecamatan}
        showCategoryFilter={false}
        placeholder="Cari keahlian, bidang kerja, atau nama profesional..."
      />

      <p className="text-xs text-slate-500 tabular-nums">
        Menampilkan <strong>{filtered.length}</strong> profil disetujui
      </p>

      {loading ? (
        <LoadingSkeleton count={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reloadDirectory(false)} />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
          Tidak ada profil profesional yang sesuai pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((pro) => (
            <ProfessionalCard key={pro.id} profile={pro} />
          ))}
        </div>
      )}
    </div>
  );
}
