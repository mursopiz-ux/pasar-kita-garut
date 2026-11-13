import { Info } from 'lucide-react';
import { useDemoApp } from '../context/DemoAppContext';

interface DemoNoticeProps {
  compact?: boolean;
}

export function DemoNotice({ compact = false }: DemoNoticeProps) {
  const { platformStatus } = useDemoApp();

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs text-emerald-900">
        <Info className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
        <span>
          <strong>Data DEMO (Tahap 1):</strong> Seluruh data contoh bersifat simulasi. Integrasi Supabase disiapkan untuk Tahap 2.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-950">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-900">
            Tahap 1 · Kerangka Aplikasi dengan Data DEMO
          </p>
          <p className="text-emerald-900/85 leading-relaxed">
            {platformStatus.message} Perubahan yang Anda uji coba di halaman ini (pendaftaran usaha, unggah gambar, CV PDF, maupun persetujuan admin) berjalan sementara di memori browser.
          </p>
        </div>
      </div>
    </div>
  );
}
