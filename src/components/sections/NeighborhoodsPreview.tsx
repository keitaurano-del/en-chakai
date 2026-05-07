import { useTranslations } from "next-intl";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { NEIGHBORHOODS } from "@/lib/constants";

export function NeighborhoodsPreview() {
  const t = useTranslations("neighborhoodsPreview");

  return (
    <section className="bg-charcoal-light py-20 sm:py-28">
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NEIGHBORHOODS.map((n, i) => (
            <FadeIn key={n.slug} delay={i * 0.05}>
              <Link
                href={`/neighborhoods/${n.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-charcoal">
                  <Image
                    src={n.photo}
                    alt={n.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <p className="text-[11px] uppercase tracking-widest text-gold">
                      {n.walkMin === 0
                        ? t("rooted")
                        : t("walkMin", { n: n.walkMin })}
                    </p>
                    <h3 className="mt-1.5 font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
                      {n.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-cream/60">{n.nameJa}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-cream/65">
                  {n.blurb}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold transition-colors group-hover:text-gold-light">
                  {t("readMore")} →
                </p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
