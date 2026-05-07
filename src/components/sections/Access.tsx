import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/ui/FadeIn";
import { MapPin } from "lucide-react";

export function Access() {
  const t = useTranslations("access");

  return (
    <section id="access" className="bg-charcoal py-16 sm:py-24 md:py-32">
      <Container>
        <FadeIn>
          <SectionHeading
            label={t("label")}
            heading={t("heading")}
          />
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
          {/* Info */}
          <FadeIn>
            <div>
              <div className="flex items-start gap-3 mb-5 sm:mb-6">
                <MapPin className="mt-0.5 text-gold shrink-0" size={18} />
                <div>
                  <p className="text-base font-medium text-cream sm:text-lg">{t("address")}</p>
                  <p className="mt-0.5 text-sm text-cream/60">{t("station")}</p>
                </div>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-cream/70 sm:mb-8 sm:text-base">
                {t("description")}
              </p>

              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-gold sm:mb-4 sm:text-sm">
                  {t("directions.title")}
                </h3>
                <ol className="space-y-2.5 sm:space-y-3">
                  {(["step1", "step2", "step3", "step4"] as const).map((step, i) => (
                    <li key={step} className="flex items-start gap-3 text-sm text-cream/70">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-gold/30 text-xs text-gold">
                        {i + 1}
                      </span>
                      <span>{t(`directions.${step}`)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </FadeIn>

          {/* Map */}
          <FadeIn delay={0.2}>
            <div className="aspect-[4/3] overflow-hidden bg-charcoal-light sm:aspect-[16/10] md:aspect-square lg:aspect-[4/3]">
              <iframe
                title="En Chakai location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.5!2d139.745!3d35.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188c49ef!2sSengoku%20Station!5e0!3m2!1sen!2sjp!4v1"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.3) contrast(1.1)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
