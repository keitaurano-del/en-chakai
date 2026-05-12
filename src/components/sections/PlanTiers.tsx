import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { PLANS } from "@/lib/constants";

export function PlanTiers() {
  const t = useTranslations("plans");
  const plan = PLANS[0];

  return (
    <FadeIn>
      <div className="mx-auto max-w-md border border-gold/40 bg-deep-green/15 p-7 sm:p-8">
        <h3 className="font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
          {t(`${plan.id}.name`)}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-cream/65 sm:text-base">
          {t(`${plan.id}.tagline`)}
        </p>

        <div className="my-6 border-y border-cream/10 py-5">
          <p className="font-[family-name:var(--font-heading)] text-4xl font-medium text-cream sm:text-5xl">
            ${plan.priceUsd}
            <span className="ml-2 text-base font-normal text-cream/55 sm:text-lg">
              USD
            </span>
          </p>
          <p className="mt-1 text-xs text-cream/55">
            ≈ ¥{plan.priceJpy.toLocaleString()} JPY · {t("perParty")}
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
            <span>{t("shared", { n: plan.maxGuests })}</span>
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
          className="block bg-gold py-3.5 text-center text-sm font-medium uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-gold-light"
        >
          {t("reserve")}
        </Link>
      </div>
    </FadeIn>
  );
}
