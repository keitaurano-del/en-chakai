import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { NEIGHBORHOODS, type NeighborhoodSlug } from "@/lib/constants";

export function generateStaticParams() {
  return NEIGHBORHOODS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = NEIGHBORHOODS.find((x) => x.slug === slug);
  if (!n) return {};
  return {
    title: `${n.name} — En Chakai`,
    description: n.blurb,
    openGraph: {
      title: `${n.name} — En Chakai`,
      description: n.blurb,
      images: [n.photo],
    },
  };
}

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const n = NEIGHBORHOODS.find((x) => x.slug === slug);
  if (!n) notFound();

  const t = await getTranslations({
    locale,
    namespace: `neighborhoodPages.${slug as NeighborhoodSlug}`,
  });
  const tn = await getTranslations({ locale, namespace: "neighborhoods" });

  const paras = t.raw("paras") as string[];
  const otherNeighborhoods = NEIGHBORHOODS.filter((x) => x.slug !== slug);

  return (
    <article className="bg-charcoal pt-16 sm:pt-20">
      <section className="relative h-[60vh] min-h-[440px] overflow-hidden">
        <Image
          src={n.photo}
          alt={n.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/20 to-charcoal/95" />
        <div className="absolute inset-0 flex items-end">
          <Container className="pb-16 sm:pb-20">
            <p className="text-xs tracking-[0.3em] text-cream/55">
              {n.walkMin === 0
                ? tn("homeIs")
                : tn("walk", { n: n.walkMin })}
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-5xl font-light leading-[1.05] text-cream sm:text-6xl md:text-7xl">
              {n.name}
            </h1>
            <p className="mt-2 font-[family-name:var(--font-heading)] text-xl font-light text-cream/55 sm:text-2xl">
              {n.nameJa}
            </p>
          </Container>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-prose">
              <p className="font-[family-name:var(--font-heading)] text-2xl font-light italic leading-[1.4] text-cream sm:text-3xl">
                {t("lede")}
              </p>
              <div className="mt-12 space-y-7 text-[16px] leading-[1.85] text-cream/70 sm:text-lg">
                {paras.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-prose">
            <p className="text-[15px] leading-[1.7] text-cream/65 sm:text-base">
              Combine this neighborhood with a tea ceremony.
            </p>
            <Link
              href="/booking"
              className="group mt-5 inline-flex items-center gap-3 text-sm tracking-[0.18em] text-gold transition-colors hover:text-gold-light"
            >
              <span>Reserve a seat</span>
              <span className="h-px w-10 bg-gold/60 transition-all group-hover:w-14 group-hover:bg-gold-light" />
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-t border-cream/10 py-20 sm:py-24">
        <Container>
          <p className="mb-10 text-[11px] tracking-[0.3em] text-cream/45">
            Other neighborhoods
          </p>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {otherNeighborhoods.map((other) => (
              <Link
                key={other.slug}
                href={`/neighborhoods/${other.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={other.photo}
                    alt={other.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover grayscale-[15%] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-light text-cream transition-colors group-hover:text-cream/70">
                  {other.name}
                </h3>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </article>
  );
}
