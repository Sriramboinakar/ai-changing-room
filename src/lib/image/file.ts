export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_IMAGE_DIMENSION = 1600;
export const COMPRESS_THRESHOLD_MB = 1.5;

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export interface CompressedImage {
  dataUrl: string;
  width: number;
  height: number;
}

export function isAcceptedImageType(type: string): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function isWithinSizeLimit(
  fileSizeBytes: number,
  maxSizeMB: number = MAX_FILE_SIZE_MB
): boolean {
  return fileSizeBytes <= maxSizeMB * 1024 * 1024;
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the image."));
    image.src = src;
  });
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

export function isLargeFile(file: File, thresholdMB: number = COMPRESS_THRESHOLD_MB): boolean {
  return file.size > thresholdMB * 1024 * 1024;
}

export function shouldCompress(width: number, height: number): boolean {
  return Math.max(width, height) > MAX_IMAGE_DIMENSION;
}

function canvasToDataUrl(canvas: HTMLCanvasElement, type: string): string {
  return canvas.toDataURL(type === "image/webp" ? "image/webp" : "image/jpeg", 0.85);
}

/**
 * Downsizes and re-encodes an image so uploads stay light.
 * Returns the original file unchanged when it is already small.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const rawDataUrl = await readFileAsDataURL(file);
  const image = await loadImageElement(rawDataUrl);

  const needsCompression =
    shouldCompress(image.naturalWidth, image.naturalHeight) || isLargeFile(file);
  if (!needsCompression) {
    return { dataUrl: rawDataUrl, width: image.naturalWidth, height: image.naturalHeight };
  }

  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported in this browser.");

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return {
    dataUrl: canvasToDataUrl(canvas, file.type),
    width: canvas.width,
    height: canvas.height,
  };
}
