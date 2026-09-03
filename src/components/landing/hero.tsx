"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Play, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/shared/before-after-slider";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-jali absolute inset-0 opacity-[0.06]" />
        <div className="animate-aurora bg-accent/25 absolute -top-32 -left-24 size-[540px] rounded-full blur-[130px]" />
        <div
          className="animate-aurora bg-primary/40 absolute top-1/3 -right-32 size-[520px] rounded-full blur-[140px]"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="animate-aurora bg-accent/15 absolute -bottom-40 left-1/3 size-[480px] rounded-full blur-[130px]"
          style={{ animationDelay: "-8s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="container-page relative z-10 grid items-center gap-12 py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-7"
        >
          <motion.span
            variants={item}
            className="border-border/70 bg-card/60 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium shadow-soft backdrop-blur-sm sm:text-sm"
          >
            <Sparkles className="text-accent size-3.5" aria-hidden="true" />
            AI-powered virtual try-on
            <span className="bg-accent/20 text-accent-strong rounded-full px-2 py-0.5">Free</span>
          </motion.span>

          <motion.h1
            variants={item}
            className="font-heading text-5xl leading-[1.04] font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Try Before You Buy.
            <br />
            <span className="animate-gradient-x bg-gradient-to-r from-[#f2d060] via-[#d4af37] to-[#a84b2e] bg-clip-text text-transparent">
              Virtually.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-muted-foreground max-w-lg text-base leading-relaxed sm:text-lg"
          >
            Upload a photo, pick a saree, lehenga, or kurta — and let AI dress you in seconds. No
            account, no cards, just your next outfit previewed on you.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl bg-accent px-7 text-base font-semibold text-accent-foreground shadow-soft transition-all duration-300 hover:shadow-[0_0_32px_rgba(212,175,55,0.45)]"
            >
              <Link href="/try-on">
                Try It Free
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-xl px-5 text-base">
              <Link href="#how-it-works">
                <span className="bg-muted flex size-8 items-center justify-center rounded-full">
                  <Play className="size-3.5 fill-current" aria-hidden="true" />
                </span>
                See How It Works
              </Link>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="text-accent size-3.5" aria-hidden="true" /> Your photos stay
              private
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="bg-success size-1.5 rounded-full" aria-hidden="true" /> No account
              needed
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div
            aria-hidden="true"
            className="from-accent/25 via-primary/15 to-transparent pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br blur-2xl"
          />
          <div className="border-border/70 bg-card relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[1.25rem] border shadow-soft">
            <BeforeAfterSlider
              beforeUrl="/demo/before.svg"
              afterUrl="/demo/result.svg"
              beforeAlt="Original photo before virtual try-on"
              afterAlt="AI-generated try-on result"
              beforeLabel="Before"
              afterLabel="After"
              className="absolute inset-0 h-full w-full"
            />
            <span className="bg-accent text-accent-foreground absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg">
              <Sparkles className="size-3.5" aria-hidden="true" />
              AI Generated
            </span>
          </div>

          <motion.span
            animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="border-border/70 bg-card/85 text-muted-foreground absolute -left-4 bottom-14 hidden rounded-xl border px-4 py-2.5 text-xs font-medium shadow-soft backdrop-blur-md sm:block lg:-left-8"
          >
            Drag the handle to compare
          </motion.span>
        </motion.div>
      </div>

      <motion.a
        href="#how-it-works"
        aria-label="Scroll to how it works"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="text-muted-foreground hover:text-accent absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 transition-colors md:flex"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <motion.span
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </motion.span>
      </motion.a>
    </section>
  );
}