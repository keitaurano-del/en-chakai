import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT, TRIPADVISOR_URL } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="border-t border-cream/10 bg-charcoal">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-3">
          <div>
            <p className="font-[family-name:var(--font-heading)] text-2xl font-medium text-cream">
              円茶会
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/55">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold">
              {t("links")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/experience" className="text-sm text-cream/65 transition-colors hover:text-gold">
                  {nav("experience")}
                </Link>
              </li>
              <li>
                <Link href="/neighborhoods" className="text-sm text-cream/65 transition-colors hover:text-gold">
                  {nav("neighborhoods")}
                </Link>
              </li>
              <li>
                <Link href="/itineraries" className="text-sm text-cream/65 transition-colors hover:text-gold">
                  {nav("itineraries")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-cream/65 transition-colors hover:text-gold">
                  {nav("faq")}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-sm text-cream/65 transition-colors hover:text-gold">
                  {nav("booking")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold">
              {t("contact")}
            </h3>
            <ul className="space-y-2 text-sm text-cream/65">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-gold">
                  {CONTACT.email}
                </a>
              </li>
              <li>{CONTACT.address}</li>
              <li>
                <a
                  href={TRIPADVISOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold"
                >
                  {t("tripadvisor")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/10 pt-6 text-center text-xs text-cream/35 sm:mt-16">
          © {new Date().getFullYear()} 円茶会 En Chakai. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
