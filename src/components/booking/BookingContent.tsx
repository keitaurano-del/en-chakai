"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { GOOGLE_FORMS } from "@/lib/constants";

export function BookingContent() {
  const t = useTranslations("booking");

  return (
    <section className="min-h-screen bg-charcoal pt-20 pb-16 sm:py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-12">
            <p className="mb-2 font-[family-name:var(--font-heading)] text-xs tracking-[0.3em] text-gold uppercase sm:mb-3 sm:text-sm">
              {t("label")}
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-cream sm:text-4xl md:text-5xl">
              {t("heading")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream/60 sm:mt-5">
              {t("description")}
            </p>
          </div>

          {/* Embedded Google Form */}
          <div className="border border-cream/10">
            <iframe
              src={GOOGLE_FORMS.booking + "?embedded=true"}
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="block w-full bg-white h-[140vh] min-h-[700px] sm:h-[900px] sm:min-h-0"
            >
              Loading…
            </iframe>
          </div>

          {/* Fallback link */}
          <p className="mt-4 text-center text-xs leading-relaxed text-cream/30">
            {t("note")}{" "}
            <a
              href={GOOGLE_FORMS.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gold transition-colors"
            >
              Open form in new tab
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
