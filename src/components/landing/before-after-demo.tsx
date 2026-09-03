import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";

const CATEGORIES = ["Sarees", "Kurtas", "Lehengas", "Blouses", "Sherwanis", "Anarkalis"];

export function BeforeAfterDemo() {
  return (
    <section id="demo" className="bg-secondary/50 scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Live demo"
          title="See the look on you, before you commit"
          description="Browse the wardrobe, then try any piece on your own photo in seconds."
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-2" aria-hidden="true">
                {CATEGORIES.map((category) => (
                  <span
                    key={category}
                    className="border-border bg-card text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium shadow-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <div>
                <h3 className="font-heading text-2xl font-semibold tracking-tight">
                  A wardrobe, in your pocket.
                </h3>
                <p className="text-muted-foreground mt-3 max-w-md leading-relaxed">
                  Every garment in a store becomes a &ldquo;try on me&rdquo; button. Customers see
                  the fit before they buy — fewer returns, happier shoppers.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-accent px-6 text-base font-semibold text-accent-foreground shadow-soft transition-all duration-300 hover:shadow-[0_0_32px_rgba(212,175,55,0.45)]"
                >
                  <Link href="/try-on">
                    Try it on yourself
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mx-auto w-full max-w-sm">
              <div
                aria-hidden="true"
                className="from-accent/30 via-primary/10 to-transparent pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br blur-2xl"
              />
              <div className="border-border/70 bg-card relative aspect-[3/4] overflow-hidden rounded-[1.25rem] border shadow-soft">
                <Image
                  src="/demo/result.svg"
                  alt="AI-generated try-on preview of a customer wearing a gold outfit"
                  fill
                  sizes="(max-width: 640px) 100vw, 28rem"
                  className="object-cover"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent"
                  aria-hidden="true"
                />
                <span className="bg-accent text-accent-foreground absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  AI Try-On
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}