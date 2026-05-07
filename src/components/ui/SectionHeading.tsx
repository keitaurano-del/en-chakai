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
    <div className="mb-12 sm:mb-16 md:mb-20">
      {label && (
        <span
          className={`mb-4 block text-[11px] tracking-[0.3em] sm:mb-5 sm:text-xs ${
            light ? "text-charcoal/55" : "text-cream/45"
          }`}
        >
          {label}
        </span>
      )}
      <h2
        className={`font-[family-name:var(--font-heading)] text-3xl font-light leading-[1.15] sm:text-4xl md:text-[2.75rem] ${
          light ? "text-charcoal" : "text-cream"
        }`}
      >
        {heading}
      </h2>
      {description && (
        <p
          className={`mt-5 max-w-xl text-[15px] leading-[1.8] sm:mt-6 sm:text-base ${
            light ? "text-charcoal/65" : "text-cream/65"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
