export const APP_CONFIG = {
  appName: 'PASAR KITA ti GARUT',
  regionName: 'Kabupaten Garut, Jawa Barat',
  stageLabel: 'Tahap 1 · Mode Data DEMO',
  maxImageUploadBytes: 5 * 1024 * 1024, // 5 MB sebelum kompresi
  maxPdfUploadBytes: 2 * 1024 * 1024, // 2 MB untuk CV PDF
  compressedMaxWidth: 1200,
  thumbnailMaxWidth: 420,
  compressedQuality: 0.78,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedPdfTypes: ['application/pdf'],
} as const;
