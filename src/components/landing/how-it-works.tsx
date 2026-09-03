import { ImagePlus, Shirt, Wand2 } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";

const STEPS = [
  {
    title: "Upload your photo",
    description:
      "Take a selfie or pick any standing photo. It stays yours — we never use your images for anything else.",
    icon: ImagePlus,
  },
  {
    title: "Pick your garment",
    description:
      "Choose from the store catalog or your own collection — blouses, kurtas, sarees and more.",
    icon: Shirt,
  },
  {
    title: "See the result",
    description:
      "AI dresses you in seconds. Compare outfits side by side, download, and share as many times as you like.",
    icon: Wand2,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="From photo to outfit in three steps"
          description="No mirrors, no queues, no awkward curtain. Just you, a garment, and a few seconds of AI magic."
        />

        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="border-border absolute top-7 right-[16%] left-[16%] hidden h-px border-t border-dashed md:block"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={index * 0.1}>
                  <div className="group border-border/70 bg-card relative flex h-full flex-col items-center gap-5 rounded-2xl border p-8 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-xl hover:shadow-black/20">
                    <div className="relative flex items-center justify-center">
                      <span className="bg-primary text-accent absolute top-1/2 left-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold shadow-md shadow-primary/20">
                        0{index + 1}
                      </span>
                      <span className="bg-accent/15 text-accent-strong flex size-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
                        <Icon className="size-7" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <h3 className="font-heading text-xl font-semibold tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}