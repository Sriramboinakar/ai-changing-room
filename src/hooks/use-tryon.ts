"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { TryOnResultDto } from "@/components/tryon/result-view";

export type TryOnStage = "idle" | "uploading" | "queued" | "processing" | "done" | "failed";

export interface TryOnInput {
  customerImageUrl: string;
  garmentImageUrl: string;
  garmentName?: string;
}

type Json = Record<string, unknown>;
type GradioMessage = Json & { msg?: string; success?: boolean };

interface StartResponse {
  success: boolean;
  message?: string;
  data?: { sessionHash: string; spaceUrl: string };
}

const SSE_TIMEOUT_MS = 5 * 60 * 1000;
const PROXY_RECONNECT_MS = 2000;

function asRecord(value: unknown): Json | null {
  return value !== null && typeof value === "object" ? (value as Json) : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function extractResultUrl(msg: Json): string | undefined {
  const output = asRecord(msg.output);
  const data = output?.data;
  const image = asRecord(Array.isArray(data) ? data[0] : undefined);
  return asString(image?.url) ?? asString(image?.path);
}

function extractErrorMessage(msg: Json): string {
  const output = asRecord(msg.output);
  return asString(output?.error) ?? asString(msg.error) ?? "The AI service encountered an error.";
}

function createSseParser(onMessage: (msg: GradioMessage) => void) {
  let buffer = "";
  return (chunk: string): void => {
    buffer += chunk;
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const line = block
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.startsWith("data:"))
        ?.slice(5)
        .trim();
      if (!line) continue;
      try {
        const msg = JSON.parse(line) as GradioMessage;
        if (msg && typeof msg === "object") onMessage(msg);
      } catch {
        // ignore malformed keep-alive lines
      }
    }
  };
}

/**
 * Async try-on generation that never blocks a serverless function for the
 * whole generation: /api/tryon/start does the fast upload+queue-join, then the
 * browser streams the HF Space's /queue/data directly (or via the /poll proxy
 * if CORS blocks it). Falls back to the legacy /api/tryon route (demo mock)
 * when the streaming start fails.
 */
export function useTryOn() {
  const [stage, setStage] = useState<TryOnStage>("idle");
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<TryOnResultDto | null>(null);

  const activeRef = useRef(false);
  const esRef = useRef<EventSource | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const receivedAnyRef = useRef(false);

  const stopSource = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    abortRef.current?.abort();
    abortRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const fail = useCallback(
    (message: string) => {
      if (!activeRef.current) return;
      stopSource();
      activeRef.current = false;
      setError(message);
      setStage("failed");
    },
    [stopSource]
  );

  const handleMessage = useCallback(
    (msg: GradioMessage) => {
      if (!activeRef.current) return;
      receivedAnyRef.current = true;

      switch (msg.msg) {
        case "estimation":
          setQueuePosition(typeof msg.queue_position === "number" ? msg.queue_position : null);
          setStage(msg.queue_position === 0 ? "processing" : "queued");
          break;
        case "process_starts":
          setQueuePosition(0);
          setStage("processing");
          break;
        case "process_completed": {
          const url = extractResultUrl(msg);
          if (!url) {
            fail("The AI service returned no result image.");
            return;
          }
          void (async () => {
            if (!activeRef.current) return;
            try {
              const response = await fetch("/api/tryon/result", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resultUrl: url }),
              });
              const json = await response.json();
              if (!response.ok || !json.success || !json.data?.imageUrl) {
                throw new Error(asString(json.message) ?? "Could not download the result image.");
              }
              if (!activeRef.current) return;
              stopSource();
              activeRef.current = false;
              setResult(json.data as TryOnResultDto);
              setStage("done");
            } catch (caught) {
              fail(
                caught instanceof Error ? caught.message : "Could not download the result image."
              );
            }
          })();
          break;
        }
        case "process_error":
          fail(extractErrorMessage(msg));
          break;
        default:
          if (msg.success === false) fail(extractErrorMessage(msg));
      }
    },
    [fail, stopSource]
  );

  const pollViaProxy = useCallback(
    async (spaceUrl: string, sessionHash: string) => {
      if (!activeRef.current) return;
      setStage("queued");
      const parseChunk = createSseParser(handleMessage);

      while (activeRef.current) {
        const controller = new AbortController();
        abortRef.current = controller;
        try {
          const response = await fetch(
            `/api/tryon/poll?sessionHash=${encodeURIComponent(sessionHash)}&spaceUrl=${encodeURIComponent(spaceUrl)}`,
            { signal: controller.signal }
          );
          if (!response.ok || !response.body) {
            await new Promise((resolve) => setTimeout(resolve, PROXY_RECONNECT_MS));
            continue;
          }
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          while (activeRef.current) {
            const { done, value } = await reader.read();
            if (done) break;
            parseChunk(decoder.decode(value, { stream: true }));
          }
        } catch {
          // stream closed/capped by the function limit -> reconnect below
        } finally {
          if (abortRef.current === controller) abortRef.current = null;
        }
        if (!activeRef.current) return;
        await new Promise((resolve) => setTimeout(resolve, PROXY_RECONNECT_MS));
      }
    },
    [handleMessage]
  );

  const openStream = useCallback(
    (spaceUrl: string, sessionHash: string) => {
      const es = new EventSource(`${spaceUrl}/queue/data?session_hash=${sessionHash}`);
      esRef.current = es;

      es.onmessage = (event) => {
        receivedAnyRef.current = true;
        try {
          const msg = JSON.parse(event.data) as GradioMessage;
          if (msg && typeof msg === "object") handleMessage(msg);
        } catch {
          // ignore
        }
      };

      es.onerror = () => {
        // Fatal connect failure (e.g. CORS) before any message -> proxy path.
        if (es.readyState === EventSource.CLOSED && !receivedAnyRef.current && activeRef.current) {
          es.close();
          esRef.current = null;
          void pollViaProxy(spaceUrl, sessionHash);
        }
      };
    },
    [handleMessage, pollViaProxy]
  );

  const start = useCallback(
    async (input: TryOnInput) => {
      if (activeRef.current) return;
      activeRef.current = true;
      receivedAnyRef.current = false;
      setError(null);
      setNotice(null);
      setResult(null);
      setQueuePosition(null);
      setStage("uploading");

      timeoutRef.current = setTimeout(() => {
        fail("Generation timed out after 5 minutes. The AI space may be busy — try again.");
      }, SSE_TIMEOUT_MS);

      try {
        const startResponse = await fetch("/api/tryon/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const startJson = (await startResponse.json()) as StartResponse;

        if (!startResponse.ok || !startJson.success || !startJson.data?.sessionHash) {
          throw new Error(asString(startJson.message) ?? "Could not start the AI try-on.");
        }

        setStage("queued");
        openStream(startJson.data.spaceUrl, startJson.data.sessionHash);
      } catch (caught) {
        // Legacy fallback (mock demo when the real provider is unavailable).
        const message = caught instanceof Error ? caught.message : "Could not start the AI try-on.";
        try {
          const response = await fetch("/api/tryon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          const json = await response.json();
          if (!response.ok || !json.success || !json.data) {
            throw new Error(asString(json.message) ?? "Generation failed.");
          }
          stopSource();
          activeRef.current = false;
          setResult(json.data as TryOnResultDto);
          if (asString(json.notice)) setNotice(asString(json.notice) ?? null);
          setStage("done");
        } catch {
          fail(message);
        }
      }
    },
    [fail, openStream, stopSource]
  );

  const cancel = useCallback(() => {
    stopSource();
    activeRef.current = false;
    setQueuePosition(null);
    setError(null);
    setNotice(null);
    setResult(null);
    setStage("idle");
  }, [stopSource]);

  const reset = useCallback(() => {
    stopSource();
    activeRef.current = false;
    setQueuePosition(null);
    setError(null);
    setNotice(null);
    setResult(null);
    setStage("idle");
  }, [stopSource]);

  useEffect(() => () => stopSource(), [stopSource]);

  return { stage, queuePosition, error, notice, result, start, cancel, reset };
}