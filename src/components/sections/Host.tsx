import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/FadeIn";

export function Host() {
  const t = useTranslations("host");

  return (
    <section className="border-t border-border bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[640px] px-8">
        <FadeIn>
          <div className="mb-6 h-px w-8 bg-clay" />
          <p className="mb-8 text-[11px] uppercase tracking-[0.3em] text-clay">
            {t("kicker")}
          </p>

          <div className="flex flex-col gap-8">
            {/* 写真プレースホルダー */}
            <div className="aspect-square w-full bg-mist flex items-center justify-center">
              <span className="font-[family-name:var(--font-heading)] text-7xl text-ink-muted/30">
                山
              </span>
            </div>

            <div>
              <blockquote className="font-[family-name:var(--font-heading)] mb-5 text-[23px] italic leading-[1.4] text-ink">
                "{t("pull")}"
              </blockquote>
              <p className="mb-6 text-[13px] text-ink-muted">
                {t("name")} · {t("credential")}
              </p>
              <p className="text-[15px] leading-[1.7] text-ink">
                {t("bio")}
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
