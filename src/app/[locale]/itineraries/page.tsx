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

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="mx-auto max-w-3xl divide-y divide-cream/10 border-t border-cream/10">
            {ITINERARIES.map((it, i) => (
              <FadeIn key={it.id} delay={i * 0.06}>
                <article className="py-14 sm:py-20">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light text-cream sm:text-[2.25rem]">
                      {it.name}
                    </h2>
                    <p className="text-[11px] tracking-[0.25em] text-cream/45">
                      {it.durationLabel}
                    </p>
                  </div>
                  <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-cream/70 sm:text-base">
                    {it.summary}
                  </p>
                  <ol className="mt-9 space-y-3.5">
                    {it.stops.map((stop, j) => (
                      <li
                        key={stop}
                        className="flex items-baseline gap-5 text-[14px] leading-[1.6] text-cream/70 sm:text-[15px]"
                      >
                        <span className="font-[family-name:var(--font-heading)] text-sm font-light tabular-nums text-cream/35 sm:text-base">
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
            <div className="mx-auto mt-20 max-w-3xl sm:mt-28">
              <p className="text-[15px] leading-[1.7] text-cream/65 sm:text-base">
                Book the tea ceremony first — the rest of the route fits around it.
              </p>
              <Link
                href="/booking"
                className="group mt-6 inline-flex items-center gap-3 text-sm tracking-[0.18em] text-gold transition-colors hover:text-gold-light"
              >
                <span>Reserve a seat</span>
                <span className="h-px w-10 bg-gold/60 transition-all group-hover:w-14 group-hover:bg-gold-light" />
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
