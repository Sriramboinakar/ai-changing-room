import { NextResponse } from "next/server";
import { z } from "zod";

import { startIdmVtonJob } from "@/lib/ai/providers/idm-vton";
import { getAiBudgetStatus, tryConsumeAiBudget } from "@/lib/ai/budget";

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
        message: "Streaming is only available for the idmvton provider. Falling back to the standard route.",
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

  const budget = getAiBudgetStatus();
  if (budget.exhausted) {
    return NextResponse.json(
      {
        success: false,
        fallback: true,
        budget,
        message: `Daily real-AI budget reached (${budget.limit}/day). Showing a demo result until it resets (midnight UTC).`,
      },
      { status: 200 }
    );
  }

  try {
    const job = await startIdmVtonJob(body.data);
    // Count only successfully queued real jobs — failed starts don't burn quota.
    tryConsumeAiBudget();
    return NextResponse.json({ success: true, data: job, budget: getAiBudgetStatus() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start the AI try-on.";
    console.warn("[api/tryon/start] failed:", message);
    return NextResponse.json({ success: false, fallback: true, message }, { status: 200 });
  }
}