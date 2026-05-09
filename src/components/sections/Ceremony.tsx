import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PLANS } from "@/lib/constants";
import { FadeIn } from "@/components/ui/FadeIn";

type TimelineItem = { time: string; label: string };

export function Ceremony() {
  const t = useTranslations("ceremony");
  const tp = useTranslations("plans");
  const timeline = t.raw("timeline") as TimelineItem[];

  const PLAN_KEYS: Record<string, string> = {
    encounter: "encounter",
    conversation: "conversation",
    "quiet-hour": "quietHour",
  };

  return (
    <section className="border-t border-border bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[640px] px-8">
        <FadeIn>
          <div className="mb-8 h-px w-8 bg-clay" />
          <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-clay">
            {t("kicker")}
          </p>
          <h2 className="font-[family-name:var(--font-heading)] mb-10 text-[32px] font-normal leading-[1.15] text-ink sm:text-4xl">
            {t("heading")}
          </h2>
        </FadeIn>

        {/* タイムライン */}
        <FadeIn delay={0.05}>
          <ul className="mb-14">
            {timeline.map((step, i) => (
              <li
                key={step.time}
                className={`grid grid-cols-[64px_1fr] gap-6 py-5 ${
                  i < timeline.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="pt-1 text-[12px] tracking-[0.1em] text-clay">
                  {step.time}
                </span>
                <div>
                  <p className="font-[family-name:var(--font-heading)] mb-1 text-[21px] font-normal text-ink">
                    {step.label}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </FadeIn>

        {/* プランカード */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-4">
            {PLANS.map((plan) => {
              const key = PLAN_KEYS[plan.id];
              const isRecommended = "recommended" in plan && plan.recommended;
              const isPrivate = plan.privacy === "private";

              return (
                <div
                  key={plan.id}
                  className={`relative border p-7 transition-colors hover:border-clay ${
                    isRecommended ? "border-clay" : "border-border"
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-[9px] left-6 bg-paper px-2.5 text-[10px] uppercase tracking-[0.25em] text-clay">
                      {tp("recommended")}
                    </span>
                  )}
                  <p className="font-[family-name:var(--font-heading)] mb-1 text-[23px] font-normal text-ink">
                    {tp(`${key}.name`)}
                  </p>
                  <p className="mb-5 text-[12px] tracking-[0.05em] text-ink-muted">
                    {plan.durationMin} min ·{" "}
                    {isPrivate
                      ? `up to ${plan.maxGuests} guests · private`
                      : `up to ${plan.maxGuests} guests · shared`}
                  </p>
                  <div className="mb-4 flex items-baseline gap-3">
                    <span className="font-[family-name:var(--font-heading)] text-[28px] text-ink">
                      ¥{plan.priceJpy.toLocaleString()}
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      ≈ ${plan.priceUsdDisplay} USD · {tp("perParty")}
                    </span>
                  </div>
                  <p className="text-[13px] leading-[1.65] text-ink-muted">
                    {tp(`${key}.tagline`)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <Link
              href="/experience"
              className="text-[12px] uppercase tracking-[0.2em] text-ink underline decoration-clay underline-offset-4 transition-colors hover:text-clay"
            >
              {t("readMore")} →
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
