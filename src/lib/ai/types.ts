export type TryOnStatus = "idle" | "processing" | "succeeded" | "failed";

export interface TryOnRequest {
  customerImageUrl: string;
  garmentImageUrl: string;
  garmentName?: string;
}

export interface TryOnResult {
  imageUrl: string;
  provider: string;
  durationMs: number;
}

/**
 * Contract every AI virtual try-on provider must implement.
 * New providers (Replicate, FAL, HuggingFace, self-hosted IDM-VTON...)
 * plug in here without touching the UI or API layer.
 */
export interface TryOnProvider {
  readonly name: string;
  generate(request: TryOnRequest): Promise<TryOnResult>;
}

export type TryOnProviderName = "mock" | "huggingface" | "fal" | "idmvton";
