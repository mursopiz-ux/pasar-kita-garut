import { Check, Database, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApprovalStatusLabel } from '../components/ApprovalStatusLabel';
import { DemoNotice } from '../components/DemoNotice';
import { useDemoApp } from '../context/DemoAppContext';
import { ApprovalStatus } from '../types';

export function AdminDashboardPage() {
  const {
    businesses,
    professionals,
    kecamatanList,
    platformStatus,
    setBusinessApprovalStatus,
    setProfessionalApprovalStatus,
  } = useDemoApp();

  const [statusFilter, setStatusFilter] = useState<'ALL' | ApprovalStatus>('ALL');

  const pendingBiz = businesses.filter((b) => b.status === ApprovalStatus.PENDING).length;
  const approvedBiz = businesses.filter((b) => b.status === ApprovalStatus.APPROVED).length;
  const rejectedBiz = businesses.filter((b) => b.status === ApprovalStatus.REJECTED).length;

  const filteredBusinesses =
    statusFilter === 'ALL'
      ? businesses
      : businesses.filter((b) => b.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Moderasi Kurasi Direktori · Mode Simulasi DEMO
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Dashboard Admin
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tinjau, setujui, atau tolak pendaftaran usaha lokal dan profil profesional Kabupaten Garut.
          </p>
        </div>

        <Link
          to="/direktori"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg min-h-[44px] whitespace-nowrap shrink-0"
        >
          Lihat Hasil di Direktori Publik
        </Link>
      </div>

      <DemoNotice />

      {/* Ringkasan Angka */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Menunggu Persetujuan</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-amber-700 mt-1">
            {pendingBiz}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Usaha Disetujui</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-emerald-700 mt-1">
            {approvedBiz}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Usaha Ditolak</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-red-700 mt-1">
            {rejectedBiz}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Status Supabase (Tahap 2)</p>
          <p className="text-sm font-semibold text-slate-900 mt-1.5 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <span>{platformStatus.supabaseConfigured ? 'Terkonfigurasi' : 'Belum Terhubung'}</span>
          </p>
        </div>
      </div>

      {/* Filter Status Persetujuan Usaha */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Persetujuan Pendaftaran Usaha (DEMO)
          </h2>

          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { key: 'ALL', label: 'Semua' },
                { key: ApprovalStatus.PENDING, label: 'Menunggu' },
                { key: ApprovalStatus.APPROVED, label: 'Disetujui' },
                { key: ApprovalStatus.REJECTED, label: 'Ditolak' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[36px] ${
                  statusFilter === tab.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredBusinesses.map((biz) => {
            const kec = kecamatanList.find((k) => k.slug === biz.kecamatanSlug);
            return (
              <div
                key={biz.id}
                className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                    <ApprovalStatusLabel status={biz.status} />
                    <span aria-hidden="true">·</span>
                    <span>{kec ? `Kec. ${kec.name}` : 'Garut'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{biz.createdAt}</span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    <Link to={`/usaha/${biz.slug}`} className="hover:text-emerald-800">
                      {biz.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-1">{biz.tagline}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={biz.status === ApprovalStatus.APPROVED}
                    onClick={() => setBusinessApprovalStatus(biz.id, ApprovalStatus.APPROVED)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 rounded-lg min-h-[40px]"
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Setujui</span>
                  </button>
                  <button
                    type="button"
                    disabled={biz.status === ApprovalStatus.REJECTED}
                    onClick={() => setBusinessApprovalStatus(biz.id, ApprovalStatus.REJECTED)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-40 rounded-lg min-h-[40px]"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    disabled={biz.status === ApprovalStatus.PENDING}
                    onClick={() => setBusinessApprovalStatus(biz.id, ApprovalStatus.PENDING)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg min-h-[40px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Menunggu</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Persetujuan Profil Profesional */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Persetujuan Profil Profesional &amp; CV (DEMO)
        </h2>

        <div className="divide-y divide-slate-100">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                  <ApprovalStatusLabel status={pro.status} />
                  <span aria-hidden="true">·</span>
                  <span>{pro.cvPdfName ? `CV: ${pro.cvPdfName}` : 'Belum ada CV PDF'}</span>
                </div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  <Link to={`/profesional/${pro.slug}`} className="hover:text-emerald-800">
                    {pro.fullName}
                  </Link>
                </h3>
                <p className="text-sm text-slate-600">{pro.headline}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={pro.status === ApprovalStatus.APPROVED}
                  onClick={() => setProfessionalApprovalStatus(pro.id, ApprovalStatus.APPROVED)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 rounded-lg min-h-[40px]"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Setujui</span>
                </button>
                <button
                  type="button"
                  disabled={pro.status === ApprovalStatus.REJECTED}
                  onClick={() => setProfessionalApprovalStatus(pro.id, ApprovalStatus.REJECTED)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-40 rounded-lg min-h-[40px]"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Tolak</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
