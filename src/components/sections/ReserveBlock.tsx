import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/constants";
import { FadeIn } from "@/components/ui/FadeIn";

export function ReserveBlock() {
  const t = useTranslations("reserve");

  return (
    <section className="bg-ink py-24 text-center sm:py-32">
      <div className="mx-auto max-w-[640px] px-8">
        <FadeIn>
          <div className="mx-auto mb-8 h-px w-8 bg-clay" />
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-clay">
            {t("kicker")}
          </p>
          <h2 className="font-[family-name:var(--font-heading)] mx-auto mb-6 text-[38px] font-normal leading-tight text-paper sm:text-5xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mb-10 max-w-[460px] text-[15px] leading-relaxed text-paper/70">
            {t("body")}
          </p>

          <Link
            href="/booking"
            className="inline-block bg-paper px-9 py-4 text-[12px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-clay hover:text-paper"
          >
            {t("cta")}
          </Link>

          {/* レビュー */}
          <div className="mt-16 grid gap-6 border-t border-paper/10 pt-12 text-left sm:grid-cols-3">
            {(["review1", "review2", "review3"] as const).map((k) => (
              <p key={k} className="text-[13px] leading-relaxed text-paper/60">
                "{t(k)}"
              </p>
            ))}
          </div>

          {/* アクセス */}
          <div className="mt-10 border-t border-paper/10 pt-8 text-[13px] text-paper/50">
            <p>{CONTACT.address}</p>
            <p className="mt-1">{CONTACT.station}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
