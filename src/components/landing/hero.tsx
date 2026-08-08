"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

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
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
  };

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-jali absolute inset-0 opacity-70" />
        <div className="animate-floaty bg-accent/15 absolute -top-40 right-[-10%] size-[560px] rounded-full blur-[120px]" />
        <div
          className="animate-floaty bg-primary/5 absolute bottom-[-30%] left-[-10%] size-[480px] rounded-full blur-[100px]"
          style={{ animationDelay: "-4s" }}
        />
      </div>

      <div className="container-page grid items-center gap-14 pt-32 pb-20 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-44 lg:pb-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-7"
        >
          <motion.span
            variants={item}
            className="border-border bg-card/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm sm:text-sm"
          >
            <Sparkles className="text-accent size-3.5" aria-hidden="true" />
            AI-powered virtual try-on
            <span className="bg-accent/15 text-accent-strong rounded-full px-2 py-0.5">
              Free demo
            </span>
          </motion.span>

          <motion.h1
            variants={item}
            className="font-heading text-[2.4rem] leading-[1.08] font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            See it on you,
            <br />
            <span className="text-shimmer bg-gradient-to-r from-[#A07A1D] via-[#C79A2E] to-[#8F6B1E] bg-clip-text text-transparent">
              before you buy.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-muted-foreground max-w-lg text-base leading-relaxed sm:text-lg"
          >
            Upload a photo, pick the saree, lehenga, or kurta you&apos;ve been eyeing — and watch AI
            dress you in seconds. No account, no cards — just your next outfit, previewed on you.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="shadow-primary/10 h-12 rounded-2xl px-7 text-base shadow-lg"
            >
              <Link href="/try-on">
                Try it now — free
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-12 rounded-2xl px-5 text-base">
              <Link href="#how-it-works">
                <span className="bg-muted flex size-8 items-center justify-center rounded-full">
                  <Play className="size-3.5 fill-current" aria-hidden="true" />
                </span>
                See how it works
              </Link>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
          >
            <span className="inline-flex items-center gap-1.5">
              <Zap className="text-accent size-3.5" aria-hidden="true" /> 3–5 second generation
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="bg-success size-1.5 rounded-full" aria-hidden="true" /> No account
              needed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="bg-success size-1.5 rounded-full" aria-hidden="true" /> 100% free
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div
            aria-hidden="true"
            className="from-accent/30 via-primary/10 to-transparent pointer-events-none absolute -inset-3 rounded-[3rem] bg-gradient-to-br blur-2xl"
          />
          <div className="border-accent/40 bg-card relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[2rem] border shadow-2xl shadow-primary/20 dark:shadow-black/40">
            <Image
              src="/demo/result.svg"
              alt="AI-generated preview of a customer wearing a gold outfit"
              className="size-full object-cover"
              width={768}
              height={1024}
              priority
            />
            <div
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 to-transparent"
              aria-hidden="true"
            />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              <Sparkles className="text-accent size-3.5" aria-hidden="true" />
              AI Generated
            </span>
          </div>

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="border-border bg-card/85 absolute top-10 -right-2 hidden rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md sm:block lg:-right-6"
          >
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Garment
            </p>
            <p className="font-heading text-sm font-semibold">Gold Silk Blouse</p>
          </motion.div>

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="border-border bg-card/85 absolute bottom-16 -left-2 hidden rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md sm:block lg:-left-6"
          >
            <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
              <span className="bg-success size-1.5 rounded-full" aria-hidden="true" /> Ready in
            </p>
            <p className="font-heading text-sm font-semibold">3.4 seconds</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
