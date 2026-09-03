import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";

const FAQS = [
  {
    question: "Is it really free?",
    answer:
      "Yes. This is a free MVP demo built to validate the idea — no subscription, no hidden charges, no payment details ever.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. Just open the studio, upload a photo, pick a garment, and generate. Your session stays on your device.",
  },
  {
    question: "What happens to my photos?",
    answer:
      "Nothing — they are never stored, trained on, or shared. This demo processes everything locally on your device.",
  },
  {
    question: "Which garments can I try on?",
    answer:
      "Any clothing image you can upload — blouses, kurtas, sarees, jackets. The demo also ships with a small starter wardrobe.",
  },
  {
    question: "How realistic is the result?",
    answer:
      "The demo runs on a real AI virtual-try-on model that understands how fabric drapes and fits your body. When the free AI service is busy or its daily quota is used up, the studio shows a demo preview instead — so you can always try the full flow.",
  },
  {
    question: "Can I download or share my results?",
    answer:
      "Absolutely. Every generated look can be downloaded as an image or shared in one tap, as many times as you want.",
  },
  {
    question: "What devices are supported?",
    answer:
      "Everything with a browser — phones, tablets, laptops, and desktops. The studio is mobile-first and fully responsive.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container-page max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you need to know before your first virtual fitting."
        />

        <Reveal className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="border-border/70 rounded-xl px-4 transition-all duration-300 data-[state=open]:border-l-4 data-[state=open]:border-accent data-[state=open]:bg-card/60"
              >
                <AccordionTrigger className="font-heading py-5 text-left text-base font-semibold hover:no-underline [&[data-state=open]>svg]:rotate-45">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
