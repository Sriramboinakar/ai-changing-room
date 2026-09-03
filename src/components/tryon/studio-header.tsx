import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export function StudioHeader() {
  return (
    <header className="border-border/60 bg-background/80 border-b backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="border-border bg-card text-muted-foreground hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex">
            <Sparkles className="text-accent size-3.5" aria-hidden="true" />
            AI Try-On Studio
          </span>
          <Button asChild variant="outline" className="h-9 rounded-xl">
            <Link href="/">
              <ArrowLeft />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}