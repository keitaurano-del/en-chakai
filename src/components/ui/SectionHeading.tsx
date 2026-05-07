export function SectionHeading({
  label,
  heading,
  description,
  light = false,
}: {
  label?: string;
  heading: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="mb-8 text-center sm:mb-12 md:mb-14">
      {label && (
        <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.2em] text-gold sm:mb-3 sm:text-sm">
          {label}
        </span>
      )}
      <h2
        className={`font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl ${
          light ? "text-charcoal" : "text-cream"
        }`}
      >
        {heading}
      </h2>
      {description && (
        <p
          className={`mx-auto mt-3 max-w-2xl text-sm leading-relaxed sm:mt-4 sm:text-base md:text-lg ${
            light ? "text-charcoal/70" : "text-cream/70"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
