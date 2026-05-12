import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

type FaqItem = { q: string; a: string };
type FaqSection = { heading: string; items: FaqItem[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

const SECTION_ANCHORS = [
  "booking",
  "language",
  "payment",
  "experience",
  "cancellation",
  "access",
];

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  const sections = t.raw("sections") as FaqSection[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.flatMap((s) =>
      s.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      }))
    ),
  };

  return (
    <div className="bg-charcoal pt-20 sm:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-16 sm:py-24">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gold sm:text-sm">
                {t("kicker")}
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-medium leading-[1.1] text-cream sm:text-5xl md:text-6xl">
                {t("heading")}
              </h1>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20 sm:pb-28">
        <Container>
          <div className="mx-auto max-w-3xl">
            {sections.map((section, i) => (
              <FadeIn key={section.heading} delay={i * 0.04}>
                <section
                  id={SECTION_ANCHORS[i]}
                  className="border-t border-cream/15 py-10 first:border-t-0 first:pt-0 sm:py-14"
                >
                  <h2 className="mb-7 font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
                    {section.heading}
                  </h2>
                  <dl className="space-y-7">
                    {section.items.map((item) => (
                      <div key={item.q}>
                        <dt className="text-base font-medium text-cream sm:text-lg">
                          {item.q}
                        </dt>
                        <dd className="mt-2 text-base leading-relaxed text-cream/75 sm:text-lg">
                          {item.a}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
