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
    <div className="bg-charcoal pt-24 sm:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-20 sm:py-28">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-2xl">
              <p className="mb-5 text-xs tracking-[0.3em] text-cream/45">
                {t("kicker")}
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-light leading-[1.1] text-cream sm:text-5xl md:text-6xl">
                {t("heading")}
              </h1>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="mx-auto max-w-2xl">
            {sections.map((section, i) => (
              <FadeIn key={section.heading} delay={i * 0.04}>
                <section
                  id={SECTION_ANCHORS[i]}
                  className="border-t border-cream/10 py-14 first:border-t-0 first:pt-0 sm:py-20"
                >
                  <h2 className="mb-10 text-[11px] tracking-[0.3em] text-cream/45">
                    {section.heading}
                  </h2>
                  <dl className="space-y-10">
                    {section.items.map((item) => (
                      <div key={item.q}>
                        <dt className="font-[family-name:var(--font-heading)] text-xl font-light text-cream sm:text-2xl">
                          {item.q}
                        </dt>
                        <dd className="mt-3 text-[15px] leading-[1.8] text-cream/65 sm:text-base">
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
