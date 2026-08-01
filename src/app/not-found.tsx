import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <span className="bg-primary text-accent flex size-14 items-center justify-center rounded-2xl shadow-lg">
        <Sparkles className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="font-heading text-7xl font-bold tracking-tight">404</p>
        <h1 className="font-heading text-2xl font-semibold">This page is out of style</h1>
        <p className="text-muted-foreground max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist — but your next outfit is one click
          away.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="h-11 rounded-xl px-6">
          <Link href="/try-on">
            <Sparkles />
            Try a virtual fitting
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-xl px-6">
          <Link href="/">
            <ArrowLeft />
            Back home
          </Link>
        </Button>
      </div>
    </main>
  );
}
