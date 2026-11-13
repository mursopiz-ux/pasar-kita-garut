import { ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDemoApp } from '../context/DemoAppContext';
import type { ProfessionalProfile } from '../types';
import { OptimizedImage } from './OptimizedImage';

export function ProfessionalCard({ profile }: { profile: ProfessionalProfile }) {
  const { kecamatanList } = useDemoApp();
  const kecamatan = kecamatanList.find((k) => k.slug === profile.kecamatanSlug);

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-emerald-300 transition-colors">
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
            <OptimizedImage
              src={profile.avatarUrl}
              alt={profile.fullName}
              fallbackLabel={profile.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
              <span className="font-medium text-emerald-800">
                {kecamatan ? `Kec. ${kecamatan.name}` : 'Kab. Garut'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{profile.experienceYears} thn pengalaman</span>
              {profile.isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-orange-700 font-medium">Data DEMO</span>
                </>
              )}
            </div>

            <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900 leading-snug">
              <Link to={`/profesional/${profile.slug}`} className="hover:text-emerald-800">
                {profile.fullName}
              </Link>
            </h3>
            <p className="text-sm font-medium text-slate-700">{profile.headline}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{profile.summary}</p>

        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-medium text-slate-700">Keahlian:</span>{' '}
          {profile.skills.join(' · ')}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <FileText className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
          <span>{profile.cvPdfName ? 'CV PDF Tersedia' : 'CV Belum Diunggah'}</span>
        </span>

        <Link
          to={`/profesional/${profile.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 hover:text-orange-600 min-h-[44px] whitespace-nowrap"
        >
          <span>Lihat CV</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
