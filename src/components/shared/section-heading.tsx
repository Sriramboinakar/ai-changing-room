import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      <span className="text-accent-strong inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase">
        <span className="bg-accent h-px w-6" aria-hidden="true" />
        {eyebrow}
        {align === "center" && <span className="bg-accent h-px w-6" aria-hidden="true" />}
      </span>
      <h2 className="font-heading max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-muted-foreground max-w-xl text-base sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
