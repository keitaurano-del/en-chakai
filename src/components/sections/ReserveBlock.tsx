import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/constants";
import { MapPin } from "lucide-react";

export function ReserveBlock() {
  const t = useTranslations("reserve");

  return (
    <section className="bg-charcoal py-28 sm:py-40">
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <p className="mb-5 text-xs tracking-[0.3em] text-cream/45">
              {t("kicker")}
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light leading-[1.15] text-cream sm:text-4xl md:text-[2.75rem]">
              {t("heading")}
            </h2>
            <p className="mt-6 text-[15px] leading-[1.8] text-cream/65 sm:text-base">
              {t("body")}
            </p>

            <div className="mt-10 sm:mt-12">
              <Link
                href="/booking"
                className="group inline-flex items-center gap-3 text-sm tracking-[0.18em] text-gold transition-colors hover:text-gold-light"
              >
                <span>{t("cta")}</span>
                <span className="h-px w-10 bg-gold/60 transition-all group-hover:w-14 group-hover:bg-gold-light" />
              </Link>
            </div>

            <div className="mt-20 grid gap-x-10 gap-y-8 sm:mt-24 md:grid-cols-3">
              {(["review1", "review2", "review3"] as const).map((k) => (
                <figure key={k}>
                  <p className="font-[family-name:var(--font-heading)] text-lg font-light italic leading-[1.5] text-cream/75">
                    &ldquo;{t(k)}&rdquo;
                  </p>
                </figure>
              ))}
            </div>

            <div className="mt-20 flex items-start gap-3 text-sm text-cream/55 sm:mt-24">
              <MapPin size={14} className="mt-0.5 shrink-0 text-cream/35" />
              <div>
                <p className="text-cream/85">{CONTACT.address}</p>
                <p className="mt-0.5 text-cream/45">{CONTACT.station}</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
