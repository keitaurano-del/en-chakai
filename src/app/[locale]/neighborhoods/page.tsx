import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { NEIGHBORHOODS } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "neighborhoods" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function NeighborhoodsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "neighborhoods" });

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

      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-10 sm:gap-14">
            {NEIGHBORHOODS.map((n, i) => (
              <FadeIn key={n.slug} delay={i * 0.05}>
                <Link
                  href={`/neighborhoods/${n.slug}`}
                  className="group grid gap-6 md:grid-cols-2 md:gap-10"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={n.photo}
                      alt={n.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                      {n.walkMin === 0
                        ? t("homeIs")
                        : t("walk", { n: n.walkMin })}
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-medium text-cream transition-colors group-hover:text-gold sm:text-4xl">
                      {n.name}
                    </h2>
                    <p className="mt-1 text-sm text-cream/55">{n.nameJa}</p>
                    <p className="mt-5 text-base leading-relaxed text-cream/75 sm:text-lg">
                      {n.blurb}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="mt-16 border-t border-cream/15 pt-10 text-center sm:mt-24">
              <p className="text-base text-cream/70 sm:text-lg">
                {t("footer")}
              </p>
              <Link
                href="/itineraries"
                className="mt-4 inline-block text-sm uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-light"
              >
                {t("footerCta")} →
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
