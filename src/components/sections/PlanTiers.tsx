import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { PLANS } from "@/lib/constants";

const TRANSLATION_KEY: Record<string, string> = {
  encounter: "encounter",
  conversation: "conversation",
  "quiet-hour": "quietHour",
};

export function PlanTiers() {
  const t = useTranslations("plans");

  return (
    <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
      {PLANS.map((plan, i) => {
        const tk = TRANSLATION_KEY[plan.id];
        const isRecommended = "recommended" in plan && plan.recommended;
        const isPrivate = plan.privacy === "private";

        return (
          <FadeIn key={plan.id} delay={i * 0.08}>
            <div
              className={`relative flex h-full flex-col border p-6 transition-colors sm:p-7 ${
                isRecommended
                  ? "border-gold bg-deep-green/15"
                  : "border-cream/15 bg-charcoal-light hover:border-cream/30"
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-3 left-6 bg-gold px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-charcoal sm:left-7">
                  {t("recommended")}
                </span>
              )}

              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
                {t(`${tk}.name`)}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-cream/65 sm:text-base">
                {t(`${tk}.tagline`)}
              </p>

              <div className="my-6 border-y border-cream/10 py-5">
                <p className="font-[family-name:var(--font-heading)] text-3xl font-medium text-cream sm:text-4xl">
                  ¥{plan.priceJpy.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-cream/55">
                  ~${plan.priceUsdDisplay} USD · {t("perParty")}
                </p>
              </div>

              <ul className="mb-3 space-y-2 text-sm text-cream/80">
                <li className="flex items-baseline gap-2">
                  <span className="text-gold">·</span>
                  <span>
                    {plan.durationMin} {t("minutesShort")}
                  </span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="text-gold">·</span>
                  <span>
                    {isPrivate
                      ? t("private", { n: plan.maxGuests })
                      : t("shared", { n: plan.maxGuests })}
                  </span>
                </li>
              </ul>

              <ul className="mb-7 flex-1 space-y-2 text-sm text-cream/75">
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-baseline gap-2">
                    <span className="mt-0.5 text-gold">›</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/booking"
                className={`block py-3.5 text-center text-sm font-medium uppercase tracking-[0.15em] transition-colors ${
                  isRecommended
                    ? "bg-gold text-charcoal hover:bg-gold-light"
                    : "border border-gold text-gold hover:bg-gold hover:text-charcoal"
                }`}
              >
                {t("reserve")}
              </Link>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
