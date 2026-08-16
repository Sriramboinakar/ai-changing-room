import { NextResponse } from "next/server";

// SSE passthrough proxy for browsers whose CORS rules block connecting
// directly to the HF Space's /queue/data stream. Each invocation streams the
// upstream as-is and reconnects from the client if the function cap cuts it.
export const maxDuration = 55;

function hfAuthHeaders(): Record<string, string> {
  const token = (process.env.HUGGINGFACE_TOKEN ?? process.env.HF_TOKEN)?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionHash = searchParams.get("sessionHash");
  const spaceUrl = searchParams.get("spaceUrl");

  if (!sessionHash || !spaceUrl) {
    return NextResponse.json({ success: false, message: "Missing session params" }, { status: 400 });
  }

  let host: string;
  try {
    host = new URL(spaceUrl).host;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid space URL" }, { status: 400 });
  }
  if (!host.endsWith("hf.space")) {
    return NextResponse.json({ success: false, message: "Unsafe space URL" }, { status: 400 });
  }

  const upstream = await fetch(`${spaceUrl}/queue/data?session_hash=${encodeURIComponent(sessionHash)}`, {
    headers: hfAuthHeaders(),
    signal: AbortSignal.timeout(50_000),
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { success: false, message: `Upstream poll failed (status ${upstream.status})` },
      { status: 502 }
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}