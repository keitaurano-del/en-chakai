import { useTranslations } from "next-intl";

export function EditorsNote() {
  const t = useTranslations("editorsNote");

  return (
    <section className="border-t border-border bg-paper py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[640px] px-4 sm:px-8 md:max-w-[800px] md:text-center">
        {/* セクションルール */}
        <div className="mb-6 h-px w-8 bg-clay md:mx-auto" />
        <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-clay md:mb-7">
          {t("kicker")}
        </p>
        <p className="font-[family-name:var(--font-heading)] text-[19px] italic leading-[1.65] text-ink sm:text-xl md:text-[24px] lg:text-[27px] lg:leading-[1.7]">
          "{t("body")}"
        </p>
      </div>
    </section>
  );
}
