import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { PlanTiers } from "@/components/sections/PlanTiers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experience" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

type TimelineItem = { time: string; label: string };
type ExpectItem = { title: string; body: string };

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "experience" });
  const tc = await getTranslations({ locale, namespace: "ceremony" });
  const tp = await getTranslations({ locale, namespace: "plans" });

  const timeline = tc.raw("timeline") as TimelineItem[];
  const expectItems = t.raw("expect.items") as ExpectItem[];

  return (
    <div className="bg-charcoal pt-20 sm:pt-24">
      <section className="py-16 sm:py-24">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gold sm:text-sm">
                {t("kicker")}
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-medium leading-[1.1] text-cream sm:text-5xl md:text-6xl">
                {t("heading")}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-cream/80 sm:text-xl">
                {t("lede")}
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="border-t border-cream/10 bg-charcoal py-14 sm:py-20">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl border-l border-gold/40 pl-6 sm:pl-8">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
                {t("authenticity.heading")}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-cream/75 sm:text-lg">
                {t("authenticity.body")}
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-charcoal-light py-16 sm:py-20">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
                Sixty minutes, end to end
              </h2>
              <ol className="grid gap-3 sm:gap-4 md:grid-cols-2">
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
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <FadeIn>
            <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-14">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/photos/tokonoma.jpg"
                  alt="Tokonoma alcove with chabana"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
                  {t("expect.heading")}
                </h2>
                <ul className="mt-7 space-y-6">
                  {expectItems.map((item) => (
                    <li key={item.title} className="border-l border-gold/30 pl-5">
                      <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gold">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-base leading-relaxed text-cream/75">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-charcoal-light py-16 sm:py-24">
        <Container>
          <FadeIn>
            <h2 className="mb-12 text-center font-[family-name:var(--font-heading)] text-3xl font-medium text-cream sm:mb-16 sm:text-4xl">
              {t("plansHeading")}
            </h2>
          </FadeIn>
          <PlanTiers />
          <p className="mt-10 text-center text-xs uppercase tracking-[0.2em] text-cream/50">
            {tp("perParty")}
          </p>
        </Container>
      </section>
    </div>
  );
}
