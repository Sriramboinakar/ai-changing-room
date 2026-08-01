"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Gift, Repeat2, Share2, ShieldCheck, Smartphone, Timer } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Photorealistic results",
    description:
      "AI understands how fabric falls, drapes, and fits your body — so what you see is what you get, down to the fold.",
    icon: Timer,
    image: "/demo/result.svg",
    imageAlt: "Photorealistic AI try-on preview of a gold outfit",
    large: true,
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
                whileHover={reduceMotion ? undefined : { y: -6 }}
                className={cn(
                  "group border-border/70 bg-card relative flex flex-col gap-4 overflow-hidden rounded-3xl border p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5",
                  feature.large && "sm:col-span-2 lg:row-span-2"
                )}
              >
                <span
                  className="bg-accent/10 pointer-events-none absolute -top-16 -right-16 size-40 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0"
                  aria-hidden="true"
                />
                <span className="bg-primary text-accent relative flex size-11 items-center justify-center rounded-2xl shadow-sm">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading relative text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground relative text-sm leading-relaxed">
                  {feature.description}
                </p>
                {feature.image ? (
                  <div className="border-border/60 relative mt-auto aspect-[3/2] overflow-hidden rounded-2xl border">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div
                      className="from-primary/10 absolute inset-0 bg-gradient-to-t to-transparent"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
