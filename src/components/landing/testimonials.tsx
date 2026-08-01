import { Quote, Star } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";

const TESTIMONIALS = [
  {
    quote:
      "Customers stopped asking 'will it suit me?' — they just try it themselves. Our fitting queue vanished in a week.",
    name: "Priya Menon",
    role: "Boutique owner, Chennai",
    initials: "PM",
    gradient: "from-[#D4AF37] to-[#B8962E]",
  },
  {
    quote:
      "The try-on demo sealed three store contracts for us. Seeing an outfit on a real photo beats any catalogue.",
    name: "Rohan Kapoor",
    role: "Online fashion store, Bengaluru",
    initials: "RK",
    gradient: "from-[#111111] to-[#4A4A4A]",
  },
  {
    quote:
      "Our bridal clients keep coming back to compare designs before booking. It changed how we consult them.",
    name: "Meera Suresh",
    role: "Bridal studio, Kochi",
    initials: "MS",
    gradient: "from-[#B8860B] to-[#D4AF37]",
  },
  {
    quote:
      "Zero tech fuss. Customers scan, upload, and see the result on their own phone in seconds. Magic for a saree store.",
    name: "Arjun Varma",
    role: "Saree retailer, Hyderabad",
    initials: "AV",
    gradient: "from-[#3A3A3A] to-[#111111]",
  },
  {
    quote:
      "I use it to plan my own outfits every morning. It's faster than trying everything in the wardrobe.",
    name: "Sara Joseph",
    role: "Fashion content creator",
    initials: "SJ",
    gradient: "from-[#D4AF37] to-[#E9CE6B]",
  },
  {
    quote:
      "As a fashion founder, I finally have a way to test demand before manufacturing. The demo is shockingly smooth.",
    name: "Daniel Lobo",
    role: "E-commerce founder, Mumbai",
    initials: "DL",
    gradient: "from-[#5A5A5A] to-[#111111]",
  },
];

export function Testimonials() {
  return (
    <section id="reviews" className="bg-card/40 scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Reviews"
          title="Loved by stores, boutiques & shoppers"
          description="From bridal studios to online stores — here's what people say after trying the virtual fitting room."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={(index % 3) * 0.08}>
              <figure className="border-border/70 bg-card flex h-full flex-col gap-5 rounded-3xl border p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5">
                <div className="flex items-center justify-between">
                  <span className="flex gap-0.5" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="fill-accent-strong text-accent-strong size-4"
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <Quote className="text-accent/60 size-5" aria-hidden="true" />
                </div>
                <blockquote className="text-foreground/85 flex-1 text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="border-border/60 flex items-center gap-3 border-t pt-4">
                  <span
                    className={`flex size-10 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-xs font-bold text-white`}
                    aria-hidden="true"
                  >
                    {testimonial.initials}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">{testimonial.name}</span>
                    <span className="text-muted-foreground text-xs">{testimonial.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
