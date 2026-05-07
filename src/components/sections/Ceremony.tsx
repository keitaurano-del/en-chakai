import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { PlanTiers } from "@/components/sections/PlanTiers";

type TimelineItem = { time: string; label: string };

export function Ceremony() {
  const t = useTranslations("ceremony");
  const timeline = t.raw("timeline") as TimelineItem[];

  return (
    <section className="bg-charcoal-light py-28 sm:py-40">
      <Container>
        <FadeIn>
          <div className="mb-16 max-w-2xl sm:mb-24">
            <p className="mb-5 text-xs tracking-[0.3em] text-cream/45">
              {t("kicker")}
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light leading-[1.15] text-cream sm:text-4xl md:text-[2.75rem]">
              {t("heading")}
            </h2>
            <p className="mt-6 text-[15px] leading-[1.8] text-cream/65 sm:text-base">
              {t("body")}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <ol className="mb-24 divide-y divide-cream/10 sm:mb-28 md:grid md:grid-cols-2 md:gap-x-12 md:divide-y-0">
            {timeline.map((step, idx) => (
              <li
                key={step.time}
                className={`flex items-baseline gap-6 py-5 sm:gap-10 sm:py-6 ${
                  idx >= 2 ? "md:border-t md:border-cream/10" : ""
                }`}
              >
                <span className="w-12 shrink-0 font-[family-name:var(--font-heading)] text-lg font-light tabular-nums text-cream/55 sm:text-xl">
                  {step.time}
                </span>
                <span className="text-[15px] leading-[1.7] text-cream/80 sm:text-base">
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </FadeIn>

        <PlanTiers />

        <FadeIn>
          <div className="mt-16 sm:mt-20">
            <Link
              href="/experience"
              className="group inline-flex items-center gap-3 text-sm tracking-[0.18em] text-cream/55 transition-colors hover:text-cream"
            >
              <span>{t("readMore")}</span>
              <span className="h-px w-10 bg-cream/30 transition-all group-hover:w-14 group-hover:bg-cream" />
            </Link>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
