import { useTranslations } from "next-intl";

export function EditorsNote() {
  const t = useTranslations("editorsNote");

  return (
    <section className="border-t border-border bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[640px] px-8">
        {/* セクションルール */}
        <div className="mb-6 h-px w-8 bg-clay" />
        <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-clay">
          {t("kicker")}
        </p>
        <p className="font-[family-name:var(--font-heading)] text-[19px] italic leading-[1.65] text-ink sm:text-xl">
          "{t("body")}"
        </p>
      </div>
    </section>
  );
}
