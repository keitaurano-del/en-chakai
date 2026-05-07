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
    <article className="bg-charcoal pt-20 sm:pt-24">
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <Image
          src={n.photo}
          alt={n.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/30 to-charcoal" />
        <div className="absolute inset-0 flex items-end">
          <Container className="pb-12 sm:pb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-gold sm:text-sm">
              {n.walkMin === 0
                ? tn("homeIs")
                : tn("walk", { n: n.walkMin })}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-heading)] text-5xl font-medium leading-tight text-cream sm:text-6xl md:text-7xl">
              {n.name}
            </h1>
            <p className="mt-1 text-lg text-cream/65">{n.nameJa}</p>
          </Container>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-prose">
              <p className="font-[family-name:var(--font-heading)] text-2xl font-medium leading-snug text-cream sm:text-3xl">
                {t("lede")}
              </p>
              <div className="mt-10 space-y-6 text-base leading-relaxed text-cream/80 sm:text-lg">
                {paras.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-deep-green py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-prose text-center">
            <p className="text-base text-cream/85 sm:text-lg">
              Combine this neighborhood with a tea ceremony.
            </p>
            <Link
              href="/booking"
              className="mt-5 inline-block bg-gold px-7 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-gold-light"
            >
              Reserve a seat
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-t border-cream/10 py-16 sm:py-20">
        <Container>
          <p className="mb-8 text-xs uppercase tracking-[0.25em] text-gold">
            Other neighborhoods
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 font-[family-name:var(--font-heading)] text-xl font-medium text-cream transition-colors group-hover:text-gold">
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
