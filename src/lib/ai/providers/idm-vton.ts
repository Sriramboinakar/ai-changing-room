import { randomUUID } from "node:crypto";

import type { TryOnProvider, TryOnRequest, TryOnResult } from "@/lib/ai/types";
import { toRasterDataUrl } from "@/lib/ai/providers/fal";

const DEFAULT_SPACE_URL = "https://yisol-idm-vton.hf.space";
const POLL_TIMEOUT_MS = 120_000;
const MAX_POLL_ITERATIONS = 30;
const POLL_INTERVAL_MS = 2000;
const POLL_FETCH_TIMEOUT_MS = 15_000;
const DENOISE_STEPS = 30;
const SEED = 42;
const TRYON_FN_INDEX = 2;

interface GradioFile {
  path: string;
  url: string;
}

interface GradioConfig {
  version?: string;
  dependencies?: { api_name?: string | null }[];
}

let fnIndexPromise: Promise<number> | null = null;

export function spaceBaseUrl(): string {
  const custom = process.env.HF_CUSTOM_SPACE_URL?.trim();
  if (custom) return custom.replace(/\/+$/, "");
  return (process.env.IDMVTON_SPACE_URL ?? DEFAULT_SPACE_URL).trim().replace(/\/+$/, "");
}

/**
 * Optional Hugging Face token (free) — anonymous ZeroGPU usage is capped at a
 * few GPU-seconds per day, while authenticated users get a large daily quota.
 * Accepts HUGGINGFACE_TOKEN or HF_TOKEN; no token = still works, just slower.
 */
function hfAuthHeaders(): Record<string, string> {
  const token = (process.env.HUGGINGFACE_TOKEN ?? process.env.HF_TOKEN)?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseDataUrl(dataUrl: string): { mime: string; base64: string } {
  const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) throw new Error("Unsupported image format from try-on input");
  return { mime: match[1], base64: match[2] };
}

function toFileData(bytes: Buffer, mime: string): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: mime });
}

function describeGarment(name?: string): string {
  const cleaned = name?.trim();
  return cleaned && cleaned.length > 0 && cleaned.length <= 100 ? cleaned : "Upper body garment";
}

/** Resolves the fn_index of the "tryon" function from the Space config (cached). */
function tryOnFnIndex(): Promise<number> {
  if (!fnIndexPromise) {
    fnIndexPromise = (async () => {
      try {
        const response = await fetch(`${spaceBaseUrl()}/config`, {
          signal: AbortSignal.timeout(30_000),
        });
        if (!response.ok) return TRYON_FN_INDEX;
        const config: GradioConfig = await response.json();
        const index = (config.dependencies ?? []).findIndex((d) => d.api_name === "tryon");
        return index >= 0 ? index : TRYON_FN_INDEX;
      } catch {
        return TRYON_FN_INDEX;
      }
    })();
  }
  return fnIndexPromise;
}

async function uploadFile(baseUrl: string, dataUrl: string, fileName: string): Promise<GradioFile> {
  const { mime, base64 } = parseDataUrl(dataUrl);
  const form = new FormData();
  form.append("files", toFileData(Buffer.from(base64, "base64"), mime), fileName);

  const response = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    headers: hfAuthHeaders(),
    body: form,
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Gradio file upload failed (status ${response.status})`);
  }

  const payload = await response.json();
  const uploaded = Array.isArray(payload) ? payload[0] : payload;

  if (typeof uploaded === "string") {
    return { path: uploaded, url: `${baseUrl}/file=${uploaded}` };
  }
  if (uploaded?.path) {
    return { path: uploaded.path, url: uploaded.url ?? `${baseUrl}/file=${uploaded.path}` };
  }
  throw new Error("Gradio file upload returned no file path");
}

/**
 * Reads the /queue/data SSE stream incrementally and resolves once the job
 * completes or errors. Gradio 4.x sends plain `data:` JSON lines (no `event:`
 * header) with a `msg` field; the stream stays open during generation (cold
 * starts on ZeroGPU can take minutes), so we hold the connection and
 * transparently reconnect if the server closes it mid-flight.
 */
async function waitForJobResult(queueUrl: string, deadline: number): Promise<{ msg: string; data: string }> {
  let iterations = 0;
  while (Date.now() < deadline && iterations < MAX_POLL_ITERATIONS) {
    iterations++;
    let response: Response;
    try {
      response = await fetch(queueUrl, {
        headers: hfAuthHeaders(),
        signal: AbortSignal.timeout(POLL_FETCH_TIMEOUT_MS),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        continue;
      }
      throw error;
    }

    if (!response.ok || !response.body) {
      throw new Error(`Gradio job poll failed (status ${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          const line = block
            .split("\n")
            .map((l) => l.trim())
            .find((l) => l.startsWith("data:"))
            ?.slice(5)
            .trim();
          if (!line) continue;

          let parsed: { msg?: string } = {};
          try {
            parsed = JSON.parse(line);
          } catch {
            continue;
          }
          if (parsed.msg === "process_completed" || parsed.msg === "process_error") {
            await reader.cancel();
            return { msg: parsed.msg, data: line };
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        continue;
      }
      if (error instanceof TypeError) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        continue;
      }
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error("IDM-VTON generation timed out");
}

/**
 * Free AI provider backed by the public IDM-VTON Space on Hugging Face
 * (https://huggingface.co/spaces/yisol/IDM-VTON). The Space runs on free
 * ZeroGPU hardware, so no API key is required — only patience: cold starts
 * and the shared queue can add a minute or two.
 *
 * The Space runs gradio 4.x, so this uses the classic queue API at the root:
 * upload both images, join the /tryon queue, stream /queue/data until
 * complete, then download the result as a data URI.
 * When the Space is paused, busy or rate-limited the route falls back to mock.
 */

export interface IdmVtonJob {
  spaceUrl: string;
  sessionHash: string;
}

/**
 * Fast step of the streaming flow: resolve the Space config, rasterize both
 * inputs, upload them to the Space and join the try-on queue. Returns the
 * session hash + base URL the client can stream /queue/data from directly
 * (bypassing any serverless function duration limit).
 */
export async function startIdmVtonJob(request: TryOnRequest): Promise<IdmVtonJob> {
  const baseUrl = spaceBaseUrl();
  const fnIndex = await tryOnFnIndex();

  const [humanDataUrl, garmentDataUrl] = await Promise.all([
    toRasterDataUrl(request.customerImageUrl),
    toRasterDataUrl(request.garmentImageUrl),
  ]);

  const [humanFile, garmentFile] = await Promise.all([
    uploadFile(baseUrl, humanDataUrl, "human.png"),
    uploadFile(baseUrl, garmentDataUrl, "garment.png"),
  ]);

  const sessionHash = randomUUID();
  const submitResponse = await fetch(`${baseUrl}/queue/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...hfAuthHeaders() },
    body: JSON.stringify({
      data: [
        { background: { ...humanFile, meta: { _type: "gradio.FileData" } }, layers: [], composite: null },
        { ...garmentFile, meta: { _type: "gradio.FileData" } },
        describeGarment(request.garmentName),
        true,
        false,
        DENOISE_STEPS,
        SEED,
      ],
      event_data: null,
      fn_index: fnIndex,
      session_hash: sessionHash,
      trigger_id: fnIndex,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!submitResponse.ok) {
    const detail = await submitResponse.text().catch(() => "");
    const status = submitResponse.status;
    if (status === 503) {
      console.warn("[idmvton] Space returned 503 (unavailable), falling back to mock");
      throw new Error(`IDM-VTON Space unavailable (503)`);
    }
    throw new Error(`Gradio submit failed (status ${status})${detail ? `: ${detail}` : ""}`);
  }

  return { spaceUrl: baseUrl, sessionHash };
}

/** Downloads a completed try-on result from the Space and returns it as a data URI. */
export async function downloadIdmVtonResult(resultUrl: string): Promise<string> {
  const imageResponse = await fetch(resultUrl, {
    headers: hfAuthHeaders(),
    signal: AbortSignal.timeout(60_000),
  });
  if (!imageResponse.ok) {
    throw new Error(`IDM-VTON result download failed (status ${imageResponse.status})`);
  }
  const contentType = imageResponse.headers.get("content-type") ?? "image/png";
  const bytes = Buffer.from(await imageResponse.arrayBuffer());
  return `data:${contentType};base64,${bytes.toString("base64")}`;
}

export class IdmVtonTryOnProvider implements TryOnProvider {
  readonly name = "idmvton";

  async generate(request: TryOnRequest): Promise<TryOnResult> {
    const startedAt = Date.now();

    const { spaceUrl, sessionHash } = await startIdmVtonJob(request);

    const deadline = Date.now() + POLL_TIMEOUT_MS;
    const { msg, data } = await waitForJobResult(`${spaceUrl}/queue/data?session_hash=${sessionHash}`, deadline);

    let resultUrl: string | undefined;
    let failureReason: string | undefined;

    try {
      const payload = JSON.parse(data);
      if (msg === "process_error" || payload.success === false) {
        failureReason = payload?.output?.error ?? payload?.error ?? "unknown error";
      } else {
        const output = payload?.output?.data;
        const image = Array.isArray(output) ? output[0] : undefined;
        resultUrl = image?.url ?? image?.path;
      }
    } catch {
      failureReason = "could not read the generation result";
    }

    if (failureReason) {
      const isIndexError = failureReason.includes("IndexError");
      if (isIndexError) {
        console.warn("[idmvton] Space returned IndexError (likely busy or paused), falling back to mock");
      }
      throw new Error(`IDM-VTON generation failed: ${failureReason}`);
    }
    if (!resultUrl) {
      throw new Error("IDM-VTON returned no result image");
    }

    const imageUrl = await downloadIdmVtonResult(resultUrl);

    return {
      imageUrl,
      provider: this.name,
      durationMs: Date.now() - startedAt,
    };
  }
}

export function createIdmVtonProvider(): TryOnProvider {
  return new IdmVtonTryOnProvider();
}
