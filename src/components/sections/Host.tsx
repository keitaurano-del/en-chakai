import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

export function Host() {
  const t = useTranslations("host");

  return (
    <section className="bg-cream py-28 sm:py-40">
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <p className="mb-5 text-xs tracking-[0.3em] text-charcoal/45">
              {t("kicker")}
            </p>

            <blockquote>
              <p className="font-[family-name:var(--font-heading)] text-3xl font-light italic leading-[1.3] text-charcoal sm:text-4xl md:text-[2.5rem]">
                &ldquo;{t("pull")}&rdquo;
              </p>
            </blockquote>

            <div className="mt-12 flex items-baseline gap-4 sm:mt-16">
              <span className="h-px w-10 shrink-0 translate-y-2 bg-charcoal/30" />
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-light text-charcoal sm:text-2xl">
                  {t("name")}
                </h3>
                <p className="mt-1 text-[13px] tracking-wide text-charcoal/55">
                  {t("credential")}
                </p>
              </div>
            </div>

            <p className="mt-10 max-w-xl text-[15px] leading-[1.85] text-charcoal/70 sm:mt-12 sm:text-base">
              {t("bio")}
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
