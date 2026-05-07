"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { GOOGLE_FORMS } from "@/lib/constants";

export function CancellationContent() {
  const t = useTranslations("cancellation");

  const rules = t.raw("policy.rules") as { period: string; refund: string }[];

  return (
    <section className="min-h-screen bg-charcoal pt-20 pb-16 sm:py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center sm:mb-12">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-cream sm:text-4xl md:text-5xl">
              {t("heading")}
            </h1>
          </div>

          {/* Policy */}
          <div className="mb-10 border border-cream/10 p-5 sm:mb-12 sm:p-7 md:p-8">
            <p className="mb-5 text-sm leading-relaxed text-cream/70 sm:mb-6">
              {t("policy.intro")}
            </p>
            <table className="w-full text-xs sm:text-sm">
              <tbody>
                {rules.map((rule, i) => (
                  <tr key={i} className="border-b border-cream/10 last:border-0">
                    <td className="py-2.5 pr-3 text-cream/60 sm:py-3 sm:pr-4">{rule.period}</td>
                    <td className="py-2.5 text-right font-medium text-cream sm:py-3">{rule.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-5 text-xs leading-relaxed text-cream/40 sm:mt-6">
              {t("policy.note")}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="mb-5 text-sm leading-relaxed text-cream/70 sm:mb-6">{t("form.description")}</p>
            <a
              href={GOOGLE_FORMS.cancellation}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full border border-cream/40 bg-transparent px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] text-cream/80 transition-all duration-300 hover:border-gold hover:text-gold active:border-gold active:text-gold sm:w-auto sm:px-10"
            >
              {t("form.cta")}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
