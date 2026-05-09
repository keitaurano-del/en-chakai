import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT, TRIPADVISOR_URL } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="border-t border-border bg-paper">
      <div className="mx-auto max-w-[640px] px-8 py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <p className="font-[family-name:var(--font-heading)] text-[17px] tracking-[0.2em] text-ink">
              EN CHAKAI 円茶会
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-clay">
              {t("links")}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/experience" className="text-[13px] text-ink-muted transition-colors hover:text-clay">
                  {nav("experience")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[13px] text-ink-muted transition-colors hover:text-clay">
                  {nav("faq")}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-[13px] text-ink-muted transition-colors hover:text-clay">
                  {nav("booking")}
                </Link>
              </li>
              <li>
                <Link href="/neighborhoods" className="text-[13px] text-ink-muted transition-colors hover:text-clay">
                  {nav("neighborhoods")}
                </Link>
              </li>
              <li>
                <Link href="/itineraries" className="text-[13px] text-ink-muted transition-colors hover:text-clay">
                  {nav("itineraries")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] uppercase tracking-[0.2em] text-clay">
              {t("contact")}
            </h3>
            <ul className="space-y-2.5 text-[13px] text-ink-muted">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-clay">
                  {CONTACT.email}
                </a>
              </li>
              <li>{CONTACT.address}</li>
              <li>
                <a href={TRIPADVISOR_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-clay">
                  {t("tripadvisor")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-[12px] text-ink-muted">
          © {new Date().getFullYear()} 円茶会 En Chakai. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
