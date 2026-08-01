import { BeforeAfterSlider } from "@/components/shared/before-after-slider";
import { SectionHeading } from "@/components/shared/section-heading";

export function BeforeAfterDemo() {
  return (
    <section id="demo" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Live demo"
          title="One photo. One garment. One instant glow-up."
          description="Drag the handle to compare the original photo with the AI-generated try-on."
        />

        <div className="mt-14">
          <BeforeAfterSlider
            beforeUrl="/demo/before.svg"
            afterUrl="/demo/result.svg"
            beforeAlt="Original customer photo before virtual try-on"
            afterAlt="AI-generated try-on result wearing a gold outfit"
            className="border-border bg-card relative mx-auto aspect-[3/4] w-full max-w-md rounded-[2rem] border shadow-2xl shadow-black/10 sm:aspect-[4/3] sm:max-w-4xl dark:shadow-black/40"
          />
        </div>
      </div>
    </section>
  );
}
