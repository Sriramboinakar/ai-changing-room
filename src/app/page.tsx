import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { GarmentMarquee } from "@/components/landing/garment-marquee";
import { StatsBand } from "@/components/landing/stats-band";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { Skeleton } from "@/components/ui/skeleton";

const BeforeAfterDemo = dynamic(
  () => import("@/components/landing/before-after-demo").then((module) => module.BeforeAfterDemo),
  {
    loading: () => (
      <section className="py-24 sm:py-32">
        <div className="container-page flex flex-col items-center gap-8">
          <div className="flex w-full max-w-2xl flex-col items-center gap-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-10 w-full max-w-xl rounded-2xl" />
            <Skeleton className="h-5 w-full max-w-md rounded-xl" />
          </div>
          <Skeleton className="aspect-[3/4] w-full max-w-md rounded-[2rem] sm:aspect-[4/3] sm:max-w-4xl" />
        </div>
      </section>
    ),
  }
);

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <GarmentMarquee />
        <StatsBand />
        <HowItWorks />
        <Features />
        <Suspense>
          <BeforeAfterDemo />
        </Suspense>
        <Testimonials />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
