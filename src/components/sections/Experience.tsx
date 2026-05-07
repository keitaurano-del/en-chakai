"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/ui/FadeIn";

export function Experience() {
  const t = useTranslations("experience");

  const features = [
    { key: "authentic" as const, icon: "◯" },
    { key: "intimate" as const, icon: "◇" },
    { key: "seasonal" as const, icon: "❋" },
  ];

  return (
    <section id="experience" className="bg-cream py-16 sm:py-24 md:py-32">
      <Container>
        <FadeIn>
          <SectionHeading
            label={t("label")}
            heading={t("heading")}
            light
          />
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          {/* Text */}
          <FadeIn>
            <div className="space-y-5 text-base leading-relaxed text-charcoal/80 sm:space-y-6">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
            </div>
          </FadeIn>

          {/* Image placeholder */}
          <FadeIn delay={0.2}>
            <div className="relative aspect-[16/10] overflow-hidden bg-deep-green/10 sm:aspect-[3/2] md:aspect-[4/5]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-deep-green/30">
                  <p className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl">茶</p>
                  <p className="mt-2 text-xs tracking-widest sm:text-sm">Tea Room Photo</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Features */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0 md:mt-20 md:gap-8">
          {features.map(({ key, icon }, i) => (
            <FadeIn key={key} delay={i * 0.1}>
              <div className="flex items-center gap-4 sm:flex-col sm:text-center sm:gap-0">
                <span className="text-2xl text-gold shrink-0 sm:mb-4">{icon}</span>
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-charcoal sm:text-xl">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-charcoal/60">
                    {t(`features.${key}.description`)}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
