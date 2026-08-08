const ITEMS = [
  "Sarees",
  "Lehengas",
  "Kurtas",
  "Anarkalis",
  "Blouses",
  "Sherwanis",
  "Kurti Sets",
  "Dupattas",
  "Suits",
  "Palazzos",
  "Shararas",
  "Waistcoats",
];

export function GarmentMarquee() {
  const row = [...ITEMS, ...ITEMS];

  return (
    <section aria-hidden="true" className="border-border/60 border-y bg-card/40 py-0">
      <div className="relative overflow-hidden">
        <div className="from-background absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r" />
        <div className="from-background absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l" />
        <div className="animate-marquee flex w-max items-center gap-10 py-5">
          {row.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-10 whitespace-nowrap"
            >
              <span className="font-heading text-muted-foreground/70 text-lg font-semibold tracking-wide">
                {item}
              </span>
              <span className="bg-accent/50 size-2 rotate-45" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}