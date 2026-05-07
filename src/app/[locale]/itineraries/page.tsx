import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { ITINERARIES } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "itineraries" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ItinerariesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "itineraries" });

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

      <section className="pb-20 sm:pb-28">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-8 sm:gap-10">
            {ITINERARIES.map((it, i) => (
              <FadeIn key={it.id} delay={i * 0.06}>
                <article className="border border-cream/15 bg-charcoal-light p-7 sm:p-9">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="font-[family-name:var(--font-heading)] text-3xl font-medium text-cream sm:text-4xl">
                      {it.name}
                    </h2>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">
                      {it.durationLabel}
                    </p>
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-cream/80 sm:text-lg">
                    {it.summary}
                  </p>
                  <ol className="mt-6 space-y-2.5 border-t border-cream/10 pt-6">
                    {it.stops.map((stop, j) => (
                      <li key={stop} className="flex items-baseline gap-4 text-sm text-cream/75 sm:text-base">
                        <span className="font-[family-name:var(--font-heading)] text-base text-gold tabular-nums sm:text-lg">
                          {String(j + 1).padStart(2, "0")}
                        </span>
                        <span>{stop}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="mt-16 border-t border-cream/15 pt-10 text-center sm:mt-20">
              <p className="text-base text-cream/75 sm:text-lg">
                Book the tea ceremony first — the rest of the route fits around it.
              </p>
              <Link
                href="/booking"
                className="mt-5 inline-block bg-gold px-7 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-gold-light"
              >
                Reserve a seat
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
