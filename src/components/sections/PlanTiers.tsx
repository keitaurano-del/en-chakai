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
    <div className="grid divide-y divide-cream/10 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
      {PLANS.map((plan, i) => {
        const tk = TRANSLATION_KEY[plan.id];
        const isRecommended = "recommended" in plan && plan.recommended;
        const isPrivate = plan.privacy === "private";

        return (
          <FadeIn key={plan.id} delay={i * 0.08}>
            <div className="relative flex h-full flex-col px-1 py-10 sm:px-8 sm:py-12">
              {isRecommended && (
                <span className="mb-5 text-[10px] tracking-[0.3em] text-gold">
                  {t("recommended")}
                </span>
              )}

              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-light text-cream sm:text-[28px]">
                {t(`${tk}.name`)}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.7] text-cream/55">
                {t(`${tk}.tagline`)}
              </p>

              <div className="my-9 sm:my-10">
                <p className="font-[family-name:var(--font-heading)] text-[2.5rem] font-light leading-none text-cream sm:text-[2.75rem]">
                  ¥{plan.priceJpy.toLocaleString()}
                </p>
                <p className="mt-2 text-xs text-cream/40">
                  ~${plan.priceUsdDisplay} USD · {t("perParty")}
                </p>
              </div>

              <dl className="mb-7 grid grid-cols-2 gap-4 text-[13px] text-cream/70">
                <div>
                  <dt className="text-[11px] tracking-[0.2em] text-cream/35">
                    {t("minutesShort").toUpperCase()}
                  </dt>
                  <dd className="mt-1.5">{plan.durationMin}</dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-[0.2em] text-cream/35">
                    {isPrivate ? "Private" : "Guests"}
                  </dt>
                  <dd className="mt-1.5">
                    {isPrivate
                      ? t("private", { n: plan.maxGuests })
                      : t("shared", { n: plan.maxGuests })}
                  </dd>
                </div>
              </dl>

              <ul className="mb-10 flex-1 space-y-2.5 text-[14px] leading-[1.65] text-cream/65">
                {plan.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <Link
                href="/booking"
                className={`group inline-flex items-center gap-3 self-start text-sm tracking-[0.18em] transition-colors ${
                  isRecommended
                    ? "text-gold hover:text-gold-light"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                <span>{t("reserve")}</span>
                <span
                  className={`h-px w-8 transition-all group-hover:w-12 ${
                    isRecommended ? "bg-gold" : "bg-cream/40 group-hover:bg-cream"
                  }`}
                />
              </Link>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
