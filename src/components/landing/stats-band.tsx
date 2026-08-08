import { Reveal } from "@/components/shared/reveal";

const STATS = [
  { value: "3–5s", label: "Average generation time" },
  { value: "₹0", label: "Cost to try the demo" },
  { value: "100%", label: "Private — photos are yours" },
  { value: "No", label: "Signup required" },
];

export function StatsBand() {
  return (
    <section aria-label="Key statistics" className="border-border/60 bg-card/50 border-y">
      <div className="container-page grid grid-cols-2 gap-px lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <Reveal
            key={stat.label}
            delay={index * 0.08}
            className="flex flex-col items-center gap-1 px-6 py-10 text-center"
          >
            <span className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-shimmer bg-gradient-to-r from-[#8A6D1A] to-[#C79A2E] bg-clip-text text-transparent">
                {stat.value}
              </span>
            </span>
            <span className="text-muted-foreground text-sm">{stat.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
