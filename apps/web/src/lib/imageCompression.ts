/**
 * Utilitário de Compressão e Otimização de Imagens no Navegador
 * Reduz resolução e comprime em formato WebP/JPEG com canvas antes de salvar.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (padrão: 0.8)
  mimeType?: 'image/webp' | 'image/jpeg';
}

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  formattedOriginalSize: string;
  formattedCompressedSize: string;
  reductionPercentage: number;
  width: number;
  height: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Carrega e comprime um arquivo de imagem (File ou Data URL)
 */
export async function compressImage(
  input: File | string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1200,
    maxHeight = 600,
    quality = 0.8,
    mimeType = 'image/webp',
  } = options;

  let originalSizeBytes = 0;
  let src = '';

  if (typeof input === 'string') {
    src = input;
    // Estimate data URL byte size
    originalSizeBytes = Math.round((src.length * 3) / 4);
  } else {
    originalSizeBytes = input.size;
    src = await readFileAsDataUrl(input);
  }

  const img = await loadImage(src);

  // Calcular dimensões proporcionais
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Desenhar no canvas offscreen
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível inicializar o contexto 2D para compressão');
  }

  // Qualidade de interpolação alta
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, 0, 0, width, height);

  // Tentar exportar como WebP, com fallback para JPEG se não suportado
  let compressedDataUrl = '';
  try {
    compressedDataUrl = canvas.toDataURL(mimeType, quality);
  } catch {
    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  const compressedSizeBytes = Math.round((compressedDataUrl.length * 3) / 4);
  const reductionPercentage =
    originalSizeBytes > 0
      ? Math.max(0, Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100))
      : 0;

  return {
    dataUrl: compressedDataUrl,
    originalSizeBytes,
    compressedSizeBytes,
    formattedOriginalSize: formatBytes(originalSizeBytes),
    formattedCompressedSize: formatBytes(compressedSizeBytes),
    reductionPercentage,
    width,
    height,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
