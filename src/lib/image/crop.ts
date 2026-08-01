import { loadImageElement } from "@/lib/image/file";

export const CROP_ASPECT_RATIO = 3 / 4;
export const CROP_OUTPUT_WIDTH = 900;
export const CROP_OUTPUT_HEIGHT = Math.round(CROP_OUTPUT_WIDTH / CROP_ASPECT_RATIO);

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export interface CropTransform {
  zoom: number;
  rotationDeg: number;
}

export function nextRotation(currentDeg: number): number {
  return (currentDeg + 90) % 360;
}

function drawRotatedSource(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  rotationDeg: number
): void {
  const rotated = rotationDeg % 180 === 90;
  context.translate(context.canvas.width / 2, context.canvas.height / 2);
  context.rotate((rotationDeg * Math.PI) / 180);
  if (rotated) {
    context.drawImage(
      image,
      -image.naturalHeight / 2,
      -image.naturalWidth / 2,
      image.naturalHeight,
      image.naturalWidth
    );
  } else {
    context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  }
}

/**
 * Renders the source image into a portrait crop (3:4) with zoom and 90°-step
 * rotation applied. Returns a PNG data URL.
 */
export async function renderCrop(
  sourceDataUrl: string,
  transform: CropTransform,
  outputWidth: number = CROP_OUTPUT_WIDTH
): Promise<string> {
  const image = await loadImageElement(sourceDataUrl);
  const outputHeight = Math.round(outputWidth / CROP_ASPECT_RATIO);

  const rotated = transform.rotationDeg % 180 === 90;
  const baseWidth = rotated ? image.naturalHeight : image.naturalWidth;
  const baseHeight = rotated ? image.naturalWidth : image.naturalHeight;

  let cropWidth: number;
  let cropHeight: number;
  if (baseWidth / baseHeight > CROP_ASPECT_RATIO) {
    cropHeight = baseHeight;
    cropWidth = baseHeight * CROP_ASPECT_RATIO;
  } else {
    cropWidth = baseWidth;
    cropHeight = baseWidth / CROP_ASPECT_RATIO;
  }

  const sourceWidth = cropWidth / transform.zoom;
  const sourceHeight = cropHeight / transform.zoom;
  const sourceX = (baseWidth - sourceWidth) / 2;
  const sourceY = (baseHeight - sourceHeight) / 2;

  const intermediate = document.createElement("canvas");
  intermediate.width = baseWidth;
  intermediate.height = baseHeight;
  const intermediateContext = intermediate.getContext("2d");
  if (!intermediateContext) throw new Error("Canvas is not supported in this browser.");
  intermediateContext.fillStyle = "#ffffff";
  intermediateContext.fillRect(0, 0, baseWidth, baseHeight);
  drawRotatedSource(intermediateContext, image, transform.rotationDeg);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported in this browser.");

  context.imageSmoothingQuality = "high";
  context.drawImage(
    intermediate,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return canvas.toDataURL("image/png");
}
