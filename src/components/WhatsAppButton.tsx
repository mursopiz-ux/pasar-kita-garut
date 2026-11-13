import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/formatters';

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'compact';
  className?: string;
}

export function WhatsAppButton({
  phone,
  message,
  label = 'Hubungi WhatsApp',
  variant = 'primary',
  className = '',
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(phone, message);

  const variantClasses =
    variant === 'primary'
      ? 'bg-emerald-700 text-white hover:bg-emerald-800 px-4 py-2.5 text-sm'
      : variant === 'secondary'
        ? 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 px-4 py-2.5 text-sm'
        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 px-3 py-2 text-xs';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0 ${variantClasses} ${className}`}
    >
      <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
