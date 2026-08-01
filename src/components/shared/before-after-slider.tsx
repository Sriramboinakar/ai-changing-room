"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeAlt = "Before",
  afterAlt = "After",
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: BeforeAfterSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(percent, 0, 100));
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) updateFromClientX(event.clientX);
  };

  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((current) => clamp(current - 5, 0, 100));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((current) => clamp(current + 5, 0, 100));
    }
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Before and after comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${Math.round(position)}% revealed`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "focus-visible:ring-ring relative touch-none overflow-hidden select-none focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
    >
      <Image
        src={afterUrl}
        alt={afterAlt}
        fill
        sizes="(max-width: 640px) 100vw, 56rem"
        className="object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeUrl}
          alt={beforeAlt}
          fill
          sizes="(max-width: 640px) 100vw, 56rem"
          className="object-cover"
          draggable={false}
        />
      </div>

      <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
        {beforeLabel}
      </span>
      <span className="bg-accent text-accent-foreground absolute top-4 right-4 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg">
        {afterLabel}
      </span>

      <div className="absolute inset-y-0" style={{ left: `${position}%` }} aria-hidden="true">
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.4)]" />
        <div
          className={cn(
            "text-primary absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-black/5 transition-transform",
            draggingRef.current ? "scale-110" : "hover:scale-105"
          )}
        >
          <ChevronsLeftRight className="size-5" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center pb-5">
        <span className="rounded-full bg-black/40 px-3 py-1.5 text-xs text-white/90 backdrop-blur-md">
          Drag, or use arrow keys
        </span>
      </div>
    </div>
  );
}
