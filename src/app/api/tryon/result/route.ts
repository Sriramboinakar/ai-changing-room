import { NextResponse } from "next/server";
import { z } from "zod";

import { downloadIdmVtonResult } from "@/lib/ai/providers/idm-vton";

// Downloads the completed try-on image from the HF Space on the server and
// returns it as a data URI — avoids browser CORS on the Space's /file= URLs.
export const maxDuration = 60;

const resultSchema = z.object({
  resultUrl: z.string().url("Result URL must be a valid URL"),
});

export async function POST(request: Request) {
  const body = resultSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { success: false, message: "Invalid request", error: body.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const imageUrl = await downloadIdmVtonResult(body.data.resultUrl);
    return NextResponse.json({ success: true, data: { imageUrl, provider: "idmvton" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not download the result image.";
    console.warn("[api/tryon/result] failed:", message);
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}