import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/FadeIn";

export function Host() {
  const t = useTranslations("host");

  return (
    <section className="border-t border-border bg-paper py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[640px] px-4 sm:px-8 md:max-w-6xl lg:px-10">
        <FadeIn>
          <div className="mb-6 h-px w-8 bg-clay" />
          <p className="mb-8 text-[11px] uppercase tracking-[0.3em] text-clay lg:mb-12">
            {t("kicker")}
          </p>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-20">
            {/* 写真プレースホルダー */}
            <div className="aspect-square w-full bg-mist flex items-center justify-center lg:w-[42%] lg:shrink-0">
              <span className="font-[family-name:var(--font-heading)] text-7xl text-ink-muted/30">
                山
              </span>
            </div>

            <div className="lg:flex-1">
              <blockquote className="font-[family-name:var(--font-heading)] mb-5 text-[23px] italic leading-[1.4] text-ink lg:mb-7 lg:text-[30px] lg:leading-[1.45]">
                "{t("pull")}"
              </blockquote>
              <p className="mb-6 text-[13px] text-ink-muted">
                {t("name")} · {t("credential")}
              </p>
              <p className="text-[15px] leading-[1.7] text-ink lg:text-[16px] lg:leading-[1.8]">
                {t("bio")}
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
