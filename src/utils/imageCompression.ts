import { APP_CONFIG } from '../config/appConfig';
import type { CompressedImageResult } from '../types';

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal membaca berkas gambar.'));
    };
    img.src = objectUrl;
  });
}

function renderResizedDataUrl(
  img: HTMLImageElement,
  maxWidth: number,
  quality: number
): { dataUrl: string; width: number; height: number } {
  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Perangkat tidak mendukung pemrosesan kanvas gambar.');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  return { dataUrl, width, height };
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.round((base64.length * 3) / 4);
}

export async function compressImageWithThumbnail(file: File): Promise<CompressedImageResult> {
  const img = await loadImageElement(file);
  const full = renderResizedDataUrl(
    img,
    APP_CONFIG.compressedMaxWidth,
    APP_CONFIG.compressedQuality
  );
  const thumb = renderResizedDataUrl(
    img,
    APP_CONFIG.thumbnailMaxWidth,
    0.72
  );

  return {
    dataUrl: full.dataUrl,
    thumbnailDataUrl: thumb.dataUrl,
    originalBytes: file.size,
    compressedBytes: estimateDataUrlBytes(full.dataUrl),
    width: full.width,
    height: full.height,
  };
}
