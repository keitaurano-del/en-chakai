import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/constants";
import { MapPin } from "lucide-react";

export function ReserveBlock() {
  const t = useTranslations("reserve");

  return (
    <section className="bg-deep-green py-20 sm:py-28">
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gold sm:text-sm">
              {t("kicker")}
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-medium leading-tight text-cream sm:text-4xl md:text-5xl">
              {t("heading")}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream/80 sm:text-lg">
              {t("body")}
            </p>

            <div className="mt-8 sm:mt-10">
              <Link
                href="/booking"
                className="inline-block bg-gold px-7 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-gold-light"
              >
                {t("cta")}
              </Link>
            </div>

            <div className="mt-12 grid gap-5 border-t border-cream/15 pt-10 sm:mt-16 sm:gap-6 md:grid-cols-3">
              {(["review1", "review2", "review3"] as const).map((k) => (
                <p
                  key={k}
                  className="text-sm leading-relaxed text-cream/75 sm:text-[15px]"
                >
                  “{t(k)}”
                </p>
              ))}
            </div>

            <div className="mt-10 flex items-start gap-3 border-t border-cream/15 pt-8 text-sm text-cream/70 sm:mt-14 sm:gap-4">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
              <div>
                <p className="text-cream">{CONTACT.address}</p>
                <p className="mt-1 text-cream/65">{CONTACT.station}</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
