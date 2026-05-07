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
    <div className="bg-charcoal pt-24 sm:pt-32">
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
              <p className="mt-7 text-[16px] leading-[1.8] text-cream/65 sm:text-lg">
                {t("lede")}
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-charcoal-light py-20 sm:py-28">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-12 text-[11px] tracking-[0.3em] text-cream/45 sm:mb-16">
                {t("steps.heading")}
              </h2>
              <ol className="divide-y divide-cream/10 border-y border-cream/10">
                {steps.map((s) => (
                  <li key={s.n} className="flex gap-7 py-8 sm:gap-10 sm:py-10">
                    <span className="font-[family-name:var(--font-heading)] text-3xl font-light tabular-nums text-cream/40 sm:text-4xl">
                      {s.n}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-[family-name:var(--font-heading)] text-xl font-light text-cream sm:text-2xl">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.8] text-cream/70 sm:text-base">
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

      <section className="py-20 sm:py-28">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-10 text-[11px] tracking-[0.3em] text-cream/45">
                {t("preview.heading")}
              </h2>
              <ul className="grid gap-y-3 sm:grid-cols-2 sm:gap-x-10">
                {fields.map((f) => (
                  <li
                    key={f}
                    className="flex items-baseline gap-3 text-[15px] text-cream/75 sm:text-base"
                  >
                    <span className="h-px w-3 shrink-0 translate-y-2 bg-cream/30" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="border-y border-cream/10 py-20 sm:py-24">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-2xl">
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-baseline gap-4 font-[family-name:var(--font-heading)] text-3xl font-light text-gold transition-colors hover:text-gold-light sm:text-4xl"
              >
                <span>{t("cta")}</span>
                <span className="inline-block h-px w-12 translate-y-[-0.4em] bg-gold/60 transition-all group-hover:w-16 group-hover:bg-gold-light" />
              </a>
              <p className="mt-5 text-[14px] text-cream/55 sm:text-[15px]">
                {t("ctaNote")}
              </p>
              <p className="mt-3 text-[14px] text-cream/55 sm:text-[15px]">
                {t("fallback", { email: CONTACT.email })
                  .split(CONTACT.email)
                  .flatMap((part, i) =>
                    i === 0
                      ? [part]
                      : [
                          <a
                            key="email"
                            href={`mailto:${CONTACT.email}`}
                            className="underline underline-offset-4 transition-colors hover:text-cream"
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

      <section className="py-20 sm:py-28">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-12 text-[11px] tracking-[0.3em] text-cream/45 sm:mb-16">
                {t("practical.heading")}
              </h2>
              <ul className="grid gap-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12">
                {practical.map((item) => (
                  <li key={item.title}>
                    <h3 className="text-[11px] tracking-[0.25em] text-cream/45">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-[1.75] text-cream/75 sm:text-base">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-20 sm:mt-24">
                <Link
                  href="/faq"
                  className="group inline-flex items-center gap-3 text-sm tracking-[0.18em] text-cream/65 transition-colors hover:text-cream"
                >
                  <span>{t("trust")}</span>
                  <span className="h-px w-10 bg-cream/30 transition-all group-hover:w-14 group-hover:bg-cream" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
