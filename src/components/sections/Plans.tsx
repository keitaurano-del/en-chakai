import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/ui/FadeIn";
import { PLANS, STRIPE_PAYMENT_LINKS } from "@/lib/constants";

export function Plans() {
  const t = useTranslations("plans");

  return (
    <section id="plans" className="bg-charcoal py-16 sm:py-24 md:py-32">
      <Container>
        <FadeIn>
          <SectionHeading
            label={t("label")}
            heading={t("heading")}
            description={t("description")}
          />
        </FadeIn>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {[PLANS[1], PLANS[0], PLANS[2]].map((plan, i) => {
            const isRecommended = "recommended" in plan && plan.recommended;
            const isMostPopular = plan.id === "take";
            const isTablet3rd = i === 2;
            return (
              <FadeIn key={plan.id} delay={i * 0.15} className={isTablet3rd ? "md:col-span-2 lg:col-span-1" : ""}>
                <div
                  className={`relative flex h-full flex-col border p-5 transition-all duration-300 hover:border-gold/50 active:border-gold/50 sm:p-6 md:p-7 lg:p-8 ${
                    isMostPopular
                      ? "border-gold bg-deep-green/20"
                      : isRecommended
                      ? "border-gold bg-deep-green/20"
                      : "border-cream/10 bg-charcoal-light"
                  }`}
                >
                  {isMostPopular && (
                    <span className="absolute -top-3 left-5 bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal sm:left-8 sm:px-4 sm:text-xs">
                      {t("mostPopular")}
                    </span>
                  )}
                  {isRecommended && !isMostPopular && (
                    <span className="absolute -top-3 left-5 bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal sm:left-8 sm:px-4 sm:text-xs">
                      {t("recommended")}
                    </span>
                  )}

                  {/* Header: name + price inline on mobile */}
                  <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6 sm:flex-col">
                    <div>
                      <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-cream sm:text-2xl">
                        {t(`${plan.id}.name`)}
                      </h3>
                      <p className="mt-0.5 text-xs tracking-wide text-gold sm:mt-1 sm:text-sm">
                        {t(`${plan.id}.subtitle`)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right sm:text-left">
                      <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-cream sm:text-4xl">
                        &yen;{plan.price.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-cream/50 sm:text-xs">
                        {t("perPerson")} · ~${Math.round(plan.price / 150)} USD
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 flex gap-3 text-xs text-cream/50 sm:mb-6 sm:gap-4">
                    <span>{plan.duration} {t("minutes")}</span>
                    <span>&bull;</span>
                    <span>{t("maxGuests", { count: plan.maxGuests })}</span>
                  </div>

                  <p className="mb-4 text-sm leading-relaxed text-cream/70 sm:mb-6">
                    {t(`${plan.id}.description`)}
                  </p>

                  <ul className="mb-5 flex-1 space-y-1.5 sm:mb-8 sm:space-y-2">
                    {(t.raw(`${plan.id}.includes`) as string[]).map((item: string, j: number) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-cream/80">
                        <span className="mt-0.5 text-gold">&#9656;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={STRIPE_PAYMENT_LINKS[plan.id as keyof typeof STRIPE_PAYMENT_LINKS]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center py-3.5 text-sm font-medium uppercase tracking-[0.1em] transition-all duration-300 active:opacity-80 ${
                      isMostPopular || isRecommended
                        ? "bg-gold text-charcoal hover:bg-gold-light"
                        : "border border-gold text-gold hover:bg-gold hover:text-charcoal"
                    }`}
                  >
                    {t("reserve")}
                  </a>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
