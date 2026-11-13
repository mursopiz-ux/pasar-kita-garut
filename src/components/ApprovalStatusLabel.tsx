import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { ApprovalStatus } from '../types';

export function ApprovalStatusLabel({ status }: { status: ApprovalStatus }) {
  if (status === ApprovalStatus.APPROVED) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Disetujui</span>
      </span>
    );
  }
  if (status === ApprovalStatus.REJECTED) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
        <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Ditolak</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Menunggu Persetujuan</span>
    </span>
  );
}
