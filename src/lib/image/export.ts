import { loadImageElement } from "@/lib/image/file";

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Downloads any same-origin image (including SVG) re-encoded as PNG.
 * Falls back to the raw blob when canvas encoding fails.
 */
export async function downloadImageAsPng(src: string, filename: string): Promise<void> {
  try {
    const image = await loadImageElement(src);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not supported in this browser.");
    context.drawImage(image, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG encoding failed.");
    triggerDownload(blob, filename);
  } catch {
    const response = await fetch(src);
    const blob = await response.blob();
    triggerDownload(blob, filename);
  }
}
