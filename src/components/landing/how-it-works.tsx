"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ImagePlus, Shirt, Wand2 } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "upload",
    title: "Upload your photo",
    description:
      "Take a selfie or pick any standing photo. It stays yours — we never use your images for anything else.",
    icon: ImagePlus,
    image: "/demo/before.svg",
    imageAlt: "A customer photo before trying on clothes",
    caption: "Your photo",
  },
  {
    id: "garment",
    title: "Pick your garment",
    description:
      "Choose from your own collection or our demo wardrobe — blouses, kurtas, sarees, and more.",
    icon: Shirt,
    image: "/demo/garment.svg",
    imageAlt: "A gold silk garment selected for virtual try-on",
    caption: "Selected garment",
  },
  {
    id: "generate",
    title: "See the result",
    description:
      "AI dresses you in seconds. Compare outfits side by side, download, and share — as many times as you like.",
    icon: Wand2,
    image: "/demo/result.svg",
    imageAlt: "AI-generated preview of the customer wearing the gold garment",
    caption: "AI try-on result",
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const step = STEPS[active];

  const onTablistKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const count = STEPS.length;
    const move = (next: number) => {
      event.preventDefault();
      setActive(next);
      document.getElementById(`howitworks-tab-${STEPS[next].id}`)?.focus();
    };

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      move((active + 1) % count);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      move((active - 1 + count) % count);
    } else if (event.key === "Home") {
      move(0);
    } else if (event.key === "End") {
      move(count - 1);
    }
  };

  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="From photo to outfit in three steps"
          description="No mirrors, no queues, no awkward curtain. Just you, a garment, and a few seconds of AI magic."
        />

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div
            className="flex flex-col gap-3"
            role="tablist"
            aria-label="Try-on steps"
            onKeyDown={onTablistKeyDown}
          >
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === active;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`howitworks-panel-${item.id}`}
                  id={`howitworks-tab-${item.id}`}
                  onClick={() => setActive(index)}
                  className={cn(
                    "group focus-visible:ring-ring flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none",
                    isActive
                      ? "border-accent/50 bg-card shadow-lg shadow-black/5"
                      : "border-border/70 hover:border-border hover:bg-card/50 bg-transparent"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
                      isActive ? "bg-primary text-accent" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-heading text-xs font-bold tracking-widest",
                          isActive ? "text-accent-strong" : "text-muted-foreground"
                        )}
                      >
                        0{index + 1}
                      </span>
                      <span className="font-heading text-lg font-semibold">{item.title}</span>
                    </span>
                    <span className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="from-accent/20 to-primary/5 pointer-events-none absolute inset-6 rounded-[2.5rem] bg-gradient-to-br via-transparent blur-2xl"
            />
            <div
              id={`howitworks-panel-${step.id}`}
              role="tabpanel"
              aria-labelledby={`howitworks-tab-${step.id}`}
              className="border-border bg-card relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border shadow-2xl shadow-black/10 dark:shadow-black/40"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              <div
                className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-5 pt-16 pb-5"
                aria-hidden="true"
              >
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
                  {step.caption}
                </span>
                <span className="flex gap-1.5">
                  {STEPS.map((item, index) => (
                    <span
                      key={item.id}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        index === active ? "bg-accent w-6" : "w-1.5 bg-white/70"
                      )}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
