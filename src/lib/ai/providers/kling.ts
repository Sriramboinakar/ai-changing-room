import { fal } from "@fal-ai/client";

import type { TryOnProvider, TryOnRequest, TryOnResult } from "@/lib/ai/types";
import { toRasterDataUrl } from "@/lib/ai/providers/fal";

const KLING_MODEL = "fal-ai/kling/v1-5/kolors-virtual-try-on";
const GENERATION_TIMEOUT_MS = 60_000;
const RESULT_DOWNLOAD_TIMEOUT_MS = 60_000;

/**
 * fal.ai requires both images to be reachable URLs. Public URLs pass through;
 * local/public-dir paths and base64 data URIs (our client-side cropped photo
 * and demo garments) are uploaded to fal's storage first.
 */
async function toFalImageUrl(imageUrl: string): Promise<string> {
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const dataUrl = await toRasterDataUrl(imageUrl);
  const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) throw new Error("Unsupported image format for Kling try-on");
  const blob = new Blob([new Uint8Array(Buffer.from(match[2], "base64"))], { type: match[1] });
  return fal.storage.upload(blob);
}

/**
 * Real AI provider backed by Kling Kolors v1.5 (virtual try-on) on fal.ai:
 * https://fal.ai/models/fal-ai/kling/kolors/virtual-try-on/v1.5
 * Commercial license, ~$0.04–0.06 per image.
 */
export class KlingTryOnProvider implements TryOnProvider {
  readonly name = "kling";

  async generate(request: TryOnRequest): Promise<TryOnResult> {
    const startedAt = Date.now();
    const apiKey = process.env.FAL_KEY?.trim();
    if (!apiKey) throw new Error("FAL_KEY is not configured.");

    fal.config({ credentials: apiKey });

    const [humanImageUrl, garmentImageUrl] = await Promise.all([
      toFalImageUrl(request.customerImageUrl),
      toFalImageUrl(request.garmentImageUrl),
    ]);

    let result;
    try {
      result = await fal.subscribe(
        KLING_MODEL,
        {
          input: {
            human_image_url: humanImageUrl,
            garment_image_url: garmentImageUrl,
          },
          timeout: GENERATION_TIMEOUT_MS,
        }
      );
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("Kling generation timed out.");
      }
      throw error;
    }

    const resultUrl = result.data?.image?.url;
    if (!resultUrl) throw new Error("Kling returned no result image.");

    const imageResponse = await fetch(resultUrl, {
      signal: AbortSignal.timeout(RESULT_DOWNLOAD_TIMEOUT_MS),
    });
    if (!imageResponse.ok) {
      throw new Error(`Kling result download failed (status ${imageResponse.status})`);
    }
    const contentType = imageResponse.headers.get("content-type") ?? "image/png";
    const bytes = Buffer.from(await imageResponse.arrayBuffer());

    return {
      imageUrl: `data:${contentType};base64,${bytes.toString("base64")}`,
      provider: this.name,
      durationMs: Date.now() - startedAt,
    };
  }
}

export function createKlingProvider(): TryOnProvider | null {
  return process.env.FAL_KEY?.trim() ? new KlingTryOnProvider() : null;
}