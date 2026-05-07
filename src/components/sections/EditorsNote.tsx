import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

export function EditorsNote() {
  const t = useTranslations("editorsNote");

  return (
    <section className="bg-charcoal py-28 sm:py-40">
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <p className="mb-6 text-xs tracking-[0.3em] text-cream/45">
              {t("kicker")}
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light leading-[1.2] text-cream sm:text-4xl md:text-[2.75rem]">
              {t("heading")}
            </h2>
            <p className="mt-8 text-[15px] leading-[1.85] text-cream/65 sm:mt-10 sm:text-base">
              {t("body")}
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
