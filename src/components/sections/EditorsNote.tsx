import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";

export function EditorsNote() {
  const t = useTranslations("editorsNote");

  return (
    <section className="bg-charcoal py-20 sm:py-28">
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-gold sm:text-sm">
              {t("kicker")}
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-medium leading-tight text-cream sm:text-4xl md:text-5xl">
              {t("heading")}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-cream/75 sm:mt-8 sm:text-lg">
              {t("body")}
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
