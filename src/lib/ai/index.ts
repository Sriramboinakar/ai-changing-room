import { mockTryOnProvider } from "@/lib/ai/providers/mock";
import { createHuggingFaceProvider } from "@/lib/ai/providers/huggingface";
import { createFalProvider } from "@/lib/ai/providers/fal";
import { createIdmVtonProvider } from "@/lib/ai/providers/idm-vton";
import type { TryOnProvider, TryOnProviderName } from "@/lib/ai/types";

const DEFAULT_PROVIDER: TryOnProviderName = "mock";

/**
 * Provider factory — the single switch point for AI backends.
 * Change the AI_PROVIDER env var to swap implementations:
 *   AI_PROVIDER=mock         (default, free demo)
 *   AI_PROVIDER=fal          (real CatVTON model on fal.ai — needs FAL_KEY)
 *   AI_PROVIDER=huggingface  (needs HUGGINGFACE_TOKEN)
 *   AI_PROVIDER=idmvton      (FREE real AI — public IDM-VTON Space on ZeroGPU, no key)
 * Future: AI_PROVIDER=replicate | openai | gemini
 */
export function getTryOnProvider(): TryOnProvider {
  const configured = (process.env.AI_PROVIDER ?? DEFAULT_PROVIDER) as TryOnProviderName;

  switch (configured) {
    case "fal": {
      const provider = createFalProvider();
      if (provider) return provider;
      break;
    }
    case "huggingface": {
      const provider = createHuggingFaceProvider();
      if (provider) return provider;
      break;
    }
    case "idmvton":
      return createIdmVtonProvider();
    case "mock":
      return mockTryOnProvider;
  }

  return mockTryOnProvider;
}
