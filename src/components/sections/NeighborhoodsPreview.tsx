import { useTranslations } from "next-intl";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { NEIGHBORHOODS } from "@/lib/constants";

export function NeighborhoodsPreview() {
  const t = useTranslations("neighborhoodsPreview");

  return (
    <section className="bg-charcoal py-28 sm:py-40">
      <Container>
        <FadeIn>
          <div className="mb-16 max-w-2xl sm:mb-20">
            <p className="mb-5 text-xs tracking-[0.3em] text-cream/45">
              {t("kicker")}
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light leading-[1.15] text-cream sm:text-4xl md:text-[2.75rem]">
              {t("heading")}
            </h2>
            <p className="mt-6 text-[15px] leading-[1.8] text-cream/65 sm:text-base">
              {t("body")}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {NEIGHBORHOODS.map((n, i) => (
            <FadeIn key={n.slug} delay={i * 0.05}>
              <Link href={`/neighborhoods/${n.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={n.photo}
                    alt={n.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover grayscale-[15%] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-3">
                  <h3 className="font-[family-name:var(--font-heading)] text-2xl font-light text-cream">
                    {n.name}
                    <span className="ml-2 text-sm text-cream/35">{n.nameJa}</span>
                  </h3>
                  <span className="shrink-0 text-[11px] tracking-[0.18em] text-cream/40">
                    {n.walkMin === 0
                      ? t("rooted")
                      : t("walkMin", { n: n.walkMin })}
                  </span>
                </div>
                <p className="mt-3 text-[14px] leading-[1.75] text-cream/55">
                  {n.blurb}
                </p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
