import type { TryOnProvider, TryOnRequest, TryOnResult } from "@/lib/ai/types";

const HF_INFERENCE_URL = "https://api-inference.huggingface.co/models";

function readToken(): string | undefined {
  const token = process.env.HUGGINGFACE_TOKEN ?? process.env.HF_TOKEN;
  return token?.trim() || undefined;
}

/**
 * Optional Hugging Face provider — gated by the HUGGINGFACE_TOKEN env var.
 * Points to any deployed VTO model endpoint (e.g. an IDM-VTON Space).
 * Kept minimal on purpose: implement the payload once a target model is chosen.
 */
export class HuggingFaceTryOnProvider implements TryOnProvider {
  readonly name = "huggingface";

  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  async generate(request: TryOnRequest): Promise<TryOnResult> {
    const startedAt = Date.now();
    const response = await fetch(`${HF_INFERENCE_URL}/${request.garmentName ?? "vto"}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [request.customerImageUrl, request.garmentImageUrl],
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face generation failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return {
      imageUrl: objectUrl,
      provider: this.name,
      durationMs: Date.now() - startedAt,
    };
  }
}

export function createHuggingFaceProvider(): TryOnProvider | null {
  const token = readToken();
  return token ? new HuggingFaceTryOnProvider(token) : null;
}
