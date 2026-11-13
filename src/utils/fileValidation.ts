import { APP_CONFIG } from '../config/appConfig';
import { formatBytes } from './formatters';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  const allowed: readonly string[] = APP_CONFIG.allowedImageTypes;
  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: 'Format gambar harus JPG, PNG, atau WebP.',
    };
  }
  if (file.size > APP_CONFIG.maxImageUploadBytes) {
    return {
      valid: false,
      error: `Ukuran file (${formatBytes(file.size)}) melebihi batas maksimal ${formatBytes(APP_CONFIG.maxImageUploadBytes)}.`,
    };
  }
  return { valid: true };
}

export function validatePdfFile(file: File): FileValidationResult {
  const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfType) {
    return {
      valid: false,
      error: 'Berkas CV wajib berformat PDF (.pdf).',
    };
  }
  if (file.size > APP_CONFIG.maxPdfUploadBytes) {
    return {
      valid: false,
      error: `Ukuran PDF (${formatBytes(file.size)}) melebihi batas maksimal ${formatBytes(APP_CONFIG.maxPdfUploadBytes)}.`,
    };
  }
  return { valid: true };
}
