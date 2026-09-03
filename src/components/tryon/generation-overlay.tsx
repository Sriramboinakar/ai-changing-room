"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface GenerationOverlayProps {
  open: boolean;
  customerImage: string;
  garmentImage: string;
  garmentName: string;
  onCancel: () => void;
  estimatedMs?: number;
  queuePosition?: number | null;
}

const STATUS_MESSAGES = [
  { at: 0, label: "Analyzing your photo…" },
  { at: 25, label: "Draping the garment…" },
  { at: 55, label: "Rendering fabric details…" },
  { at: 85, label: "Polishing your look…" },
];

export function GenerationOverlay({
  open,
  customerImage,
  garmentImage,
  garmentName,
  onCancel,
  estimatedMs = 5000,
  queuePosition = null,
}: GenerationOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setStartedAt(null);
      return;
    }

    const start = Date.now();
    setStartedAt(start);

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const raw = (elapsed / estimatedMs) * 100;
      const eased = Math.min(100, Math.pow(raw / 100, 0.85) * 100);
      setProgress(eased);
    }, 100);

    return () => window.clearInterval(interval);
  }, [open, estimatedMs]);

  const status = useMemo(() => {
    let current = STATUS_MESSAGES[0];
    for (const message of STATUS_MESSAGES) {
      if (progress >= message.at) current = message;
    }
    return current;
  }, [progress]);

  const secondsRemaining = useMemo(() => {
    if (!startedAt) return Math.ceil(estimatedMs / 1000);
    const elapsed = Date.now() - startedAt;
    return Math.max(0, Math.ceil((estimatedMs - elapsed) / 1000));
  }, [startedAt, estimatedMs]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generating your AI try-on"
      className="bg-background/90 fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-xl"
    >
      <div className="border-border bg-card flex w-full max-w-md flex-col items-center gap-7 rounded-2xl border p-8 shadow-soft">
        <div className="relative flex items-center">
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center"
          >
            <div className="border-background relative size-20 overflow-hidden rounded-xl border-2 shadow-soft">
              <Image
                src={customerImage}
                alt=""
                fill
                sizes="5rem"
                className="object-cover object-top"
              />
            </div>
            <div className="border-background relative -ml-5 size-20 overflow-hidden rounded-xl border-2 shadow-soft">
              <Image
                src={garmentImage}
                alt=""
                fill
                sizes="5rem"
                className="object-cover object-top"
              />
            </div>
          </motion.div>
          <span className="bg-accent text-accent-foreground absolute -right-1 -bottom-1 flex size-10 items-center justify-center rounded-full shadow-lg">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="font-heading flex items-center gap-1.5 text-lg font-semibold">
            AI is styling you
            <span className="flex" aria-hidden="true">
              <span className="animate-dot">.</span>
              <span className="animate-dot">.</span>
              <span className="animate-dot">.</span>
            </span>
          </p>
          <div aria-live="polite" className="h-5">
            <AnimatePresence mode="wait">
              <motion.p
                key={status.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-muted-foreground text-sm"
              >
                {status.label}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="text-muted-foreground max-w-xs text-xs">
            Dressing you in {garmentName}
          </p>
          {typeof queuePosition === "number" && queuePosition > 0 ? (
            <p className="text-accent-strong text-xs font-medium" aria-live="polite">
              The AI studio is busy — you&apos;re position #{queuePosition} in line.
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2">
          <div
            className="bg-muted h-2 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Generation progress"
          >
            <div
              className="bg-accent h-full rounded-full transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>≈ {secondsRemaining} seconds left</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <Button variant="outline" className="w-full rounded-xl" onClick={onCancel}>
          <X />
          Cancel generation
        </Button>
      </div>
    </div>
  );
}