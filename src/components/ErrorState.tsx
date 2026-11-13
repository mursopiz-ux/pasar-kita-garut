import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="bg-white border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto space-y-3"
    >
      <div className="w-10 h-10 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
      </div>
      <h2 className="font-display text-base font-semibold text-slate-900">
        Terjadi Kendala Memuat Data
      </h2>
      <p className="text-sm text-slate-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Coba Muat Ulang</span>
        </button>
      )}
    </div>
  );
}
