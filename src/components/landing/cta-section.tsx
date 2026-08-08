import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function CtaSection() {
  return (
    <section className="pb-24 sm:pb-32">
      <div className="container-page">
        <Reveal>
          <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center shadow-2xl sm:px-16">
            <div aria-hidden="true" className="bg-jali absolute inset-0 opacity-40" />
            <div
              aria-hidden="true"
              className="bg-accent/25 pointer-events-none absolute -top-24 -left-20 size-72 rounded-full blur-[90px]"
            />
            <div
              aria-hidden="true"
              className="bg-accent/15 pointer-events-none absolute -right-16 -bottom-24 size-72 rounded-full blur-[90px]"
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">
                Ready to see it{" "}
                <span className="bg-gradient-to-r from-[#E9CE6B] via-[#D4AF37] to-[#F3E3A5] bg-clip-text text-transparent">
                  on you?
                </span>
              </h2>
              <p className="text-primary-foreground/70 max-w-lg text-base sm:text-lg">
                Upload a photo and your first AI try-on takes less than five seconds. Free forever
                in this demo.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 relative h-12 overflow-hidden rounded-2xl px-8 text-base font-semibold shadow-lg shadow-black/25"
              >
                <Link href="/try-on">
                  <span
                    aria-hidden="true"
                    className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/30 blur-md"
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
