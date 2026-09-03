import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function CtaSection() {
  return (
    <section className="pb-24 sm:pb-32">
      <div className="px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-accent/30 bg-gradient-to-br from-[#5c0f1e] via-[#7a1226] to-[#3d0b13] px-6 py-20 text-center shadow-soft sm:px-16">
            <div aria-hidden="true" className="bg-jali absolute inset-0 opacity-20" />
            <div
              aria-hidden="true"
              className="animate-aurora bg-accent/30 pointer-events-none absolute -top-24 -left-20 size-80 rounded-full blur-[110px]"
            />
            <div
              aria-hidden="true"
              className="animate-aurora bg-accent/20 pointer-events-none absolute -right-16 -bottom-24 size-80 rounded-full blur-[110px]"
              style={{ animationDelay: "-5s" }}
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
              <span className="bg-accent/20 text-accent-strong inline-flex items-center gap-1.5 rounded-full border border-accent/30 px-4 py-1.5 text-xs font-semibold">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Free to try
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
                Ready to see it{" "}
                <span className="animate-gradient-x bg-gradient-to-r from-[#f2d060] via-[#d4af37] to-[#f7e8a8] bg-clip-text text-transparent">
                  on you?
                </span>
              </h2>
              <p className="text-white/70 max-w-lg text-base sm:text-lg">
                Upload a photo and your first AI try-on is seconds away. No account, no cards.
              </p>
              <Button
                asChild
                size="lg"
                className="relative h-12 overflow-hidden rounded-xl bg-accent px-8 text-base font-semibold text-accent-foreground shadow-lg shadow-black/30 transition-all duration-300 hover:shadow-[0_0_36px_rgba(212,175,55,0.5)]"
              >
                <Link href="/try-on">
                  <span
                    aria-hidden="true"
                    className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/40 blur-md"
                  />
                  Start trying on — free
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}