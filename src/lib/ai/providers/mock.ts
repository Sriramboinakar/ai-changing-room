import type { TryOnProvider, TryOnRequest, TryOnResult } from "@/lib/ai/types";

export const MOCK_RESULT_IMAGE_URL = "/demo/result.svg";

function randomDelay(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min));
}

/**
 * Mock provider — used by default so the MVP demo works for free.
 * Simulates a realistic generation latency (3-5s) and returns a
 * bundled demo image. Replace by switching `AI_PROVIDER` env var.
 */
export class MockTryOnProvider implements TryOnProvider {
  readonly name = "mock";

  async generate(request: TryOnRequest): Promise<TryOnResult> {
    if (!request.customerImageUrl || !request.garmentImageUrl) {
      throw new Error("Missing customer or garment image");
    }

    const minDelay = Number(process.env.AI_PROVIDER_MOCK_MIN_DELAY_MS ?? 3000);
    const maxDelay = Number(process.env.AI_PROVIDER_MOCK_MAX_DELAY_MS ?? 5000);
    const startedAt = Date.now();

    await new Promise((resolve) => setTimeout(resolve, randomDelay(minDelay, maxDelay)));

    return {
      imageUrl: MOCK_RESULT_IMAGE_URL,
      provider: this.name,
      durationMs: Date.now() - startedAt,
    };
  }
}

export const mockTryOnProvider: TryOnProvider = new MockTryOnProvider();
