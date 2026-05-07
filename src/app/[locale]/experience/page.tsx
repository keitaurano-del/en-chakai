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
    <div className="bg-charcoal pt-24 sm:pt-32">
      <section className="py-20 sm:py-28">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-2xl">
              <p className="mb-5 text-xs tracking-[0.3em] text-cream/45">
                {t("kicker")}
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-light leading-[1.1] text-cream sm:text-5xl md:text-6xl">
                {t("heading")}
              </h1>
              <p className="mt-7 text-[16px] leading-[1.8] text-cream/65 sm:text-lg">
                {t("lede")}
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-charcoal-light py-20 sm:py-28">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-12 font-[family-name:var(--font-heading)] text-2xl font-light text-cream sm:mb-16 sm:text-3xl">
                Sixty minutes, end to end
              </h2>
              <ol className="divide-y divide-cream/10 md:grid md:grid-cols-2 md:gap-x-12 md:divide-y-0">
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
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <FadeIn>
            <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/photos/tokonoma.jpg"
                  alt="Tokonoma alcove with chabana"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover grayscale-[10%]"
                />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-light text-cream sm:text-3xl">
                  {t("expect.heading")}
                </h2>
                <ul className="mt-10 space-y-8">
                  {expectItems.map((item) => (
                    <li key={item.title}>
                      <h3 className="text-[11px] tracking-[0.25em] text-cream/45">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 text-[15px] leading-[1.75] text-cream/75 sm:text-base">
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

      <section className="bg-charcoal-light py-20 sm:py-28">
        <Container>
          <FadeIn>
            <h2 className="mb-16 font-[family-name:var(--font-heading)] text-3xl font-light text-cream sm:mb-20 sm:text-4xl">
              {t("plansHeading")}
            </h2>
          </FadeIn>
          <PlanTiers />
          <p className="mt-12 text-xs tracking-[0.25em] text-cream/40">
            {tp("perParty")}
          </p>
        </Container>
      </section>
    </div>
  );
}
