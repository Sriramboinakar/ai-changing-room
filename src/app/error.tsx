"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <span className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-2xl">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground max-w-sm">
          We hit a snag while showing you this page. Try again — or head back and start a fresh
          fitting.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button className="h-11 rounded-xl px-6" onClick={reset}>
          <RefreshCw />
          Try again
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
