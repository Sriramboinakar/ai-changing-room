"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Gift, Repeat2, Share2, ShieldCheck, Smartphone, Wand2 } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Photorealistic results",
    description:
      "AI understands how fabric falls, drapes, and fits your body — so what you see is what you get, down to the fold.",
    icon: Wand2,
  },
  {
    title: "Private by design",
    description:
      "Your photos are never trained on or shared. The demo runs without accounts or data collection.",
    icon: ShieldCheck,
  },
  {
    title: "Compare, don't commit",
    description:
      "Dress the same photo in five outfits and compare them side by side before you decide.",
    icon: Repeat2,
  },
  {
    title: "Mobile-first studio",
    description: "Built for the shop floor and the couch — upload from your phone in seconds.",
    icon: Smartphone,
  },
  {
    title: "Free demo, zero cards",
    description: "Validate the idea before spending a rupee. Everything here is free and open.",
    icon: Gift,
  },
  {
    title: "Share in one tap",
    description: "Download or share your look with family, friends, or your stylist instantly.",
    icon: Share2,
  },
];

export function Features() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="bg-card/40 scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Features"
          title="Everything a fitting room should be"
          description="A premium virtual fitting experience, engineered to feel effortless."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? undefined : { scale: 1.02, y: -4 }}
                className={cn(
                  "group border-border/70 bg-card relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-xl hover:shadow-black/20"
                )}
              >
                <span
                  className="bg-accent/10 pointer-events-none absolute -top-16 -right-16 size-40 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="bg-accent/15 text-accent-strong relative flex size-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading relative text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground relative text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}