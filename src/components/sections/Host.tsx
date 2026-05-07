import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

export function Host() {
  const t = useTranslations("host");

  return (
    <section className="bg-cream py-20 sm:py-28">
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-deep-green sm:text-sm">
              {t("kicker")}
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-medium leading-tight text-charcoal sm:text-4xl md:text-5xl">
              {t("heading")}
            </h2>

            <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-[1fr_2fr] md:gap-12">
              <div className="aspect-[3/4] bg-stone/15">
                <div className="flex h-full items-center justify-center">
                  <span className="font-[family-name:var(--font-heading)] text-6xl text-stone/30">
                    山
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-medium text-charcoal sm:text-3xl">
                  {t("name")}
                </h3>
                <p className="mt-1 text-sm tracking-wide text-deep-green">
                  {t("credential")}
                </p>

                <blockquote className="mt-7 border-l-2 border-gold pl-5">
                  <p className="font-[family-name:var(--font-heading)] text-xl italic leading-snug text-charcoal/85 sm:text-2xl">
                    “{t("pull")}”
                  </p>
                </blockquote>

                <p className="mt-7 text-base leading-relaxed text-charcoal/75 sm:text-lg">
                  {t("bio")}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
