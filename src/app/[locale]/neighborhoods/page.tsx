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

      <section className="pb-20 sm:pb-28">
        <Container>
          <div className="mx-auto max-w-5xl divide-y divide-cream/10 border-y border-cream/10">
            {NEIGHBORHOODS.map((n, i) => (
              <FadeIn key={n.slug} delay={i * 0.05}>
                <Link
                  href={`/neighborhoods/${n.slug}`}
                  className="group grid gap-8 py-12 md:grid-cols-2 md:gap-14 md:py-16"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={n.photo}
                      alt={n.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover grayscale-[15%] transition-all duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[11px] tracking-[0.25em] text-cream/45">
                      {n.walkMin === 0
                        ? t("homeIs")
                        : t("walk", { n: n.walkMin })}
                    </p>
                    <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-light text-cream transition-colors group-hover:text-cream/85 sm:text-[2.5rem]">
                      {n.name}
                      <span className="ml-3 text-base text-cream/35 sm:text-lg">
                        {n.nameJa}
                      </span>
                    </h2>
                    <p className="mt-5 max-w-md text-[15px] leading-[1.8] text-cream/65 sm:text-base">
                      {n.blurb}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="mx-auto mt-20 max-w-2xl sm:mt-28">
              <p className="text-[15px] leading-[1.75] text-cream/65 sm:text-base">
                {t("footer")}
              </p>
              <Link
                href="/itineraries"
                className="group mt-5 inline-flex items-center gap-3 text-sm tracking-[0.18em] text-cream/65 transition-colors hover:text-cream"
              >
                <span>{t("footerCta")}</span>
                <span className="h-px w-10 bg-cream/30 transition-all group-hover:w-14 group-hover:bg-cream" />
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
