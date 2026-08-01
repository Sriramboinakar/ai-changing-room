import { NextResponse } from "next/server";
import { z } from "zod";

import { getTryOnProvider } from "@/lib/ai";
import { mockTryOnProvider } from "@/lib/ai/providers/mock";
import type { TryOnProviderName, TryOnResult } from "@/lib/ai/types";

// Real AI inference (incl. free ZeroGPU cold starts) can take up to 7 minutes.
export const maxDuration = 60;

// Image references: absolute URL (uploaded photos / data URIs) or a
// root-relative path into public/ (built-in demo garments).
const imageRefSchema = z.union([
  z.string().url("Image must be a valid URL"),
  z.string().startsWith("/", "Image path must start with /").max(4096),
]);

const tryOnRequestSchema = z.object({
  customerImageUrl: imageRefSchema,
  garmentImageUrl: imageRefSchema,
  garmentName: z.string().trim().max(120).optional(),
});

function successResponse(result: TryOnResult, notice?: string) {
  return NextResponse.json(
    {
      success: true,
      data: {
        imageUrl: result.imageUrl,
        provider: result.provider,
        durationMs: result.durationMs,
      },
      ...(notice ? { notice } : {}),
    },
    { status: 200 }
  );
}

const NOTICE_FAILED =
  "The AI service is unavailable right now — showing a demo result instead. Your uploads stay on your device.";
const NOTICE_NOT_CONFIGURED =
  "Real AI isn't configured yet — missing its API key in .env.local. Showing a demo result instead.";
const NOTICE_SPACE_BUSY =
  "The AI Space is busy or paused — showing a demo result instead. Your uploads stay on your device.";

export async function POST(request: Request) {
  const requestedProvider = (process.env.AI_PROVIDER ?? "mock") as TryOnProviderName;
  const provider = getTryOnProvider();
  const realAiRequested = requestedProvider !== "mock";

  try {
    const body = tryOnRequestSchema.safeParse(await request.json());

    if (!body.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request", error: body.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Real AI was requested but its key is missing — the factory already fell back.
    if (realAiRequested && provider.name === "mock") {
      const mockResult = await mockTryOnProvider.generate(body.data);
      return successResponse(mockResult, NOTICE_NOT_CONFIGURED);
    }

    try {
      const result = await provider.generate(body.data);
      return successResponse(result);
    } catch (error) {
      // Automatic fallback: keep the demo usable when the real AI fails.
      if (realAiRequested && provider.name !== "mock") {
        const msg = error instanceof Error ? error.message : String(error);
        const isSpaceError =
          msg.includes("503") ||
          msg.includes("IndexError") ||
          msg.includes("unavailable") ||
          msg.includes("timed out") ||
          msg.includes("network") ||
          msg.includes("ECONNREFUSED") ||
          msg.includes("ENOTFOUND");
        const notice = isSpaceError ? NOTICE_SPACE_BUSY : NOTICE_FAILED;
        console.warn(`[api/tryon] provider failed, falling back to mock: ${msg}`);
        const mockResult = await mockTryOnProvider.generate(body.data);
        return successResponse(mockResult, notice);
      }
      throw error;
    }
  } catch (error) {
    console.error("[api/tryon] generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "AI generation failed. Please try again.",
        error: { provider: provider.name },
      },
      { status: 500 }
    );
  }
}
