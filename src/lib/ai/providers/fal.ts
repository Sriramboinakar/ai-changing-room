import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

import type { TryOnProvider, TryOnRequest, TryOnResult } from "@/lib/ai/types";

const FAL_QUEUE_URL = "https://queue.fal.run/fal-ai/cat-vton";
const FAL_POLL_INTERVAL_MS = 2500;
const FAL_POLL_TIMEOUT_MS = 55_000;
const FAL_OUTPUT_WIDTH = 1024;

type FalClothType = "upper" | "lower" | "overall" | "inner" | "outer";

interface FalQueueSubmitResponse {
  request_id: string;
  status_url?: string;
  response_url?: string;
}

interface FalQueueStatusResponse {
  status: "IN_PROGRESS" | "COMPLETED" | "ERROR";
  error?: string;
}

interface FalQueueResultResponse {
  data?: {
    image?: { url?: string; content_type?: string };
  };
  error?: string;
}

function mapClothType(garmentName?: string): FalClothType {
  const name = garmentName?.toLowerCase() ?? "";
  if (/saree|gown|anarkali|dress|lehenga|overall/i.test(name)) return "overall";
  if (/blazer|jacket|coat|hoodie|cardigan/i.test(name)) return "outer";
  if (/skirt|pants|trousers|jeans|shorts|leggings|salwar|pajama|pyjama|churidar/i.test(name)) {
    return "lower";
  }
  return "upper";
}

function isDataUrl(value: string): boolean {
  return value.startsWith("data:");
}

function toBuffer(value: ArrayBuffer): Buffer {
  return Buffer.from(value);
}

/**
 * Resolves an image reference into a raster base64 data URI.
 * - data: URIs are returned as-is (customer photos / custom garment uploads)
 * - "/..." paths are read from the local `public/` folder (demo garments);
 *   SVGs are rasterized to PNG because the model consumes raster images only
 * - absolute http(s) URLs are fetched and re-encoded
 */
async function toRasterDataUrl(imageUrl: string): Promise<string> {
  if (isDataUrl(imageUrl)) return imageUrl;

  if (imageUrl.startsWith("/")) {
    const filePath = path.join(process.cwd(), "public", imageUrl);
    const buffer = await readFile(filePath);

    if (imageUrl.toLowerCase().endsWith(".svg")) {
      const resvg = new Resvg(buffer, {
        fitTo: { mode: "width", value: FAL_OUTPUT_WIDTH },
        background: "#ffffff",
      });
      const png = resvg.render().asPng();
      return `data:image/png;base64,${png.toString("base64")}`;
    }

    const mime = imageUrl.toLowerCase().match(/\.(png|jpe?g|webp)$/)?.[0] ?? ".png";
    const type = mime === ".jpg" ? "image/jpeg" : `image/${mime.replace(".", "")}`;
    return `data:${type};base64,${buffer.toString("base64")}`;
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch garment image (status ${response.status})`);
  }
  const type = response.headers.get("content-type") ?? "image/png";
  const bytes = toBuffer(await response.arrayBuffer());
  return `data:${type};base64,${bytes.toString("base64")}`;
}

/**
 * Real AI provider backed by the hosted CatVTON virtual try-on model on fal.ai
 * (https://fal.ai/models/fal-ai/cat-vton).
 * Queue pattern: submit, poll until COMPLETED, download the result and
 * return it as a self-contained data URI so the existing UI works unchanged.
 */
export class FalTryOnProvider implements TryOnProvider {
  readonly name = "fal";

  constructor(private readonly apiKey: string) {}

  async generate(request: TryOnRequest): Promise<TryOnResult> {
    const startedAt = Date.now();

    const [humanImage, garmentImage] = await Promise.all([
      toRasterDataUrl(request.customerImageUrl),
      toRasterDataUrl(request.garmentImageUrl),
    ]);

    const headers = {
      Authorization: `Key ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    const submitResponse = await fetch(FAL_QUEUE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        input: {
          human_image_url: humanImage,
          garment_image_url: garmentImage,
          cloth_type: mapClothType(request.garmentName),
          image_size: "portrait_4_3",
        },
      }),
    });

    if (!submitResponse.ok) {
      const detail = await submitResponse.text().catch(() => "");
      throw new Error(`FAL submit failed (status ${submitResponse.status})${detail ? `: ${detail}` : ""}`);
    }

    const submit: FalQueueSubmitResponse = await submitResponse.json();
    if (!submit.request_id) {
      throw new Error("FAL submit returned no request id");
    }

    const statusUrl = submit.status_url ?? `${FAL_QUEUE_URL}/requests/${submit.request_id}/status`;
    const responseUrl = submit.response_url ?? `${FAL_QUEUE_URL}/requests/${submit.request_id}`;

    const deadline = Date.now() + FAL_POLL_TIMEOUT_MS;
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, FAL_POLL_INTERVAL_MS));

      const statusResponse = await fetch(statusUrl, { headers });
      if (!statusResponse.ok) {
        throw new Error(`FAL status check failed (status ${statusResponse.status})`);
      }
      const status: FalQueueStatusResponse = await statusResponse.json();

      if (status.status === "COMPLETED") break;
      if (status.status === "ERROR") {
        throw new Error(status.error ?? "FAL generation failed on the model side");
      }
      if (Date.now() > deadline) {
        throw new Error("FAL generation timed out");
      }
    }

    const resultResponse = await fetch(responseUrl, { headers });
    if (!resultResponse.ok) {
      throw new Error(`FAL result fetch failed (status ${resultResponse.status})`);
    }
    const result: FalQueueResultResponse = await resultResponse.json();
    const imageUrl = result.data?.image?.url;
    if (!imageUrl) {
      throw new Error(result.error ?? "FAL returned no result image");
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`FAL image download failed (status ${imageResponse.status})`);
    }
    const contentType = imageResponse.headers.get("content-type") ?? "image/png";
    const bytes = toBuffer(await imageResponse.arrayBuffer());

    return {
      imageUrl: `data:${contentType};base64,${bytes.toString("base64")}`,
      provider: this.name,
      durationMs: Date.now() - startedAt,
    };
  }
}

export function createFalProvider(): TryOnProvider | null {
  const apiKey = process.env.FAL_KEY?.trim();
  return apiKey ? new FalTryOnProvider(apiKey) : null;
}
