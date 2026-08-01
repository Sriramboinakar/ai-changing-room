const SESSION_KEY = "ai-changing-room:session:v1";

export interface TryOnSessionState {
  customerImage: string | null;
  customerRawImage: string | null;
  garmentId: string | null;
  garmentName: string | null;
  garmentImage: string | null;
  resultImage: string | null;
  resultProvider: string | null;
  resultDurationMs: number | null;
}

export const EMPTY_SESSION: TryOnSessionState = {
  customerImage: null,
  customerRawImage: null,
  garmentId: null,
  garmentName: null,
  garmentImage: null,
  resultImage: null,
  resultProvider: null,
  resultDurationMs: null,
};

export function loadSession(): TryOnSessionState {
  if (typeof window === "undefined") return { ...EMPTY_SESSION };
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return { ...EMPTY_SESSION };
    const parsed = JSON.parse(raw) as Partial<TryOnSessionState>;
    return { ...EMPTY_SESSION, ...parsed };
  } catch {
    return { ...EMPTY_SESSION };
  }
}

export function saveSession(session: TryOnSessionState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage may be full or unavailable — the demo keeps working in-memory.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
}
