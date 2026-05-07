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
    <section className="bg-charcoal py-20 sm:py-28">
      <Container>
        <FadeIn>
          <div className="mb-12 max-w-2xl sm:mb-16">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gold sm:text-sm">
              {t("kicker")}
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-medium leading-tight text-cream sm:text-4xl md:text-5xl">
              {t("heading")}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream/70 sm:text-lg">
              {t("body")}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <ol className="mb-16 grid gap-3 sm:mb-20 sm:gap-4 md:grid-cols-2">
            {timeline.map((step) => (
              <li
                key={step.time}
                className="flex items-baseline gap-4 border-l border-gold/30 px-5 py-4 sm:gap-6"
              >
                <span className="font-[family-name:var(--font-heading)] text-lg font-medium tabular-nums text-gold sm:text-xl">
                  {step.time}
                </span>
                <span className="text-sm leading-relaxed text-cream/85 sm:text-base">
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </FadeIn>

        <PlanTiers />

        <FadeIn>
          <div className="mt-12 text-center">
            <Link
              href="/experience"
              className="inline-block text-sm uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-light"
            >
              {t("readMore")} →
            </Link>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
