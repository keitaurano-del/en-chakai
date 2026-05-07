import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { CONTACT, GOOGLE_FORM_URL } from "@/lib/constants";

type Step = { n: string; title: string; body: string };
type Field = string;
type Item = { title: string; body: string };

export function BookingContent() {
  const t = useTranslations("booking");
  const steps = t.raw("steps.items") as Step[];
  const fields = t.raw("preview.fields") as Field[];
  const practical = t.raw("practical.items") as Item[];

  return (
    <div className="bg-charcoal pt-20 sm:pt-24">
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
              <p className="mt-6 text-lg leading-relaxed text-cream/80 sm:text-xl">
                {t("lede")}
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-charcoal-light py-16 sm:py-20">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-10 font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
                {t("steps.heading")}
              </h2>
              <ol className="space-y-8">
                {steps.map((s) => (
                  <li key={s.n} className="flex gap-5 sm:gap-7">
                    <span className="font-[family-name:var(--font-heading)] text-3xl font-medium tabular-nums text-gold sm:text-4xl">
                      {s.n}
                    </span>
                    <div className="flex-1 border-t border-cream/15 pt-2">
                      <h3 className="text-base font-medium text-cream sm:text-lg">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-base leading-relaxed text-cream/75 sm:text-lg">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-7 font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
                {t("preview.heading")}
              </h2>
              <ul className="grid gap-3 border-l border-gold/30 pl-5 sm:grid-cols-2 sm:gap-x-8">
                {fields.map((f) => (
                  <li key={f} className="text-base text-cream/80 sm:text-lg">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-deep-green py-16 sm:py-20">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold px-9 py-4 text-base font-medium uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-gold-light sm:text-lg"
              >
                {t("cta")}
              </a>
              <p className="mt-4 text-sm text-cream/70 sm:text-base">
                {t("ctaNote")}
              </p>
              <p className="mt-3 text-sm text-cream/65">
                {t("fallback", { email: CONTACT.email })
                  .split(CONTACT.email)
                  .flatMap((part, i) =>
                    i === 0
                      ? [part]
                      : [
                          <a
                            key="email"
                            href={`mailto:${CONTACT.email}`}
                            className="underline transition-colors hover:text-gold"
                          >
                            {CONTACT.email}
                          </a>,
                          part,
                        ]
                  )}
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 font-[family-name:var(--font-heading)] text-2xl font-medium text-cream sm:text-3xl">
                {t("practical.heading")}
              </h2>
              <ul className="grid gap-7 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
                {practical.map((item) => (
                  <li key={item.title} className="border-l border-gold/30 pl-5">
                    <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gold">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-cream/75 sm:text-lg">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-12 border-t border-cream/15 pt-8 text-center sm:mt-16">
                <Link
                  href="/faq"
                  className="text-sm uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-light"
                >
                  {t("trust")} →
                </Link>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
