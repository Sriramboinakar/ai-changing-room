import Link from "next/link";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group focus-visible:ring-ring inline-flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className
      )}
      aria-label="AI Changing Room — back to home"
    >
      <span className="bg-primary text-accent group-hover:bg-accent group-hover:text-accent-foreground flex size-9 items-center justify-center rounded-xl shadow-sm transition-colors duration-300">
        <Sparkles className="size-4" />
      </span>
      <span className="font-heading text-base font-semibold tracking-tight">AI Changing Room</span>
    </Link>
  );
}
