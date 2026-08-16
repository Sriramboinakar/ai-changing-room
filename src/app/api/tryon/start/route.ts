import { NextResponse } from "next/server";
import { z } from "zod";

import { startIdmVtonJob } from "@/lib/ai/providers/idm-vton";

// Only does the FAST steps: rasterize + upload + queue join (<10s).
// The client then streams /queue/data directly from the browser, so real
// generations (cold starts can take minutes) never hit a function timeout.
export const maxDuration = 60;

const imageRefSchema = z.union([
  z.string().url("Image must be a valid URL"),
  z.string().startsWith("/", "Image path must start with /").max(4096),
]);

const startSchema = z.object({
  customerImageUrl: imageRefSchema,
  garmentImageUrl: imageRefSchema,
  garmentName: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  const requestedProvider = process.env.AI_PROVIDER ?? "mock";
  if (requestedProvider !== "idmvton") {
    return NextResponse.json(
      {
        success: false,
        fallback: true,
        message: "Streaming try-on requires the idmvton provider.",
      },
      { status: 200 }
    );
  }

  const body = startSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { success: false, message: "Invalid request", error: body.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const job = await startIdmVtonJob(body.data);
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start the AI try-on.";
    console.warn("[api/tryon/start] failed:", message);
    return NextResponse.json({ success: false, fallback: true, message }, { status: 200 });
  }
}