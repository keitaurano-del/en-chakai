import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT, TRIPADVISOR_URL } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="bg-charcoal">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 sm:gap-16 md:grid-cols-3">
          <div>
            <p className="font-[family-name:var(--font-heading)] text-2xl font-light text-cream">
              円茶会
            </p>
            <p className="mt-4 max-w-xs text-[13px] leading-[1.7] text-cream/45">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-[11px] tracking-[0.3em] text-cream/35">
              {t("links")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/experience" className="text-[13px] text-cream/65 transition-colors hover:text-cream">
                  {nav("experience")}
                </Link>
              </li>
              <li>
                <Link href="/neighborhoods" className="text-[13px] text-cream/65 transition-colors hover:text-cream">
                  {nav("neighborhoods")}
                </Link>
              </li>
              <li>
                <Link href="/itineraries" className="text-[13px] text-cream/65 transition-colors hover:text-cream">
                  {nav("itineraries")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[13px] text-cream/65 transition-colors hover:text-cream">
                  {nav("faq")}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-[13px] text-cream/65 transition-colors hover:text-cream">
                  {nav("booking")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[11px] tracking-[0.3em] text-cream/35">
              {t("contact")}
            </h3>
            <ul className="space-y-3 text-[13px] text-cream/65">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-cream">
                  {CONTACT.email}
                </a>
              </li>
              <li className="text-cream/55">{CONTACT.address}</li>
              <li>
                <a
                  href={TRIPADVISOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-cream"
                >
                  {t("tripadvisor")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 text-[11px] tracking-wide text-cream/25 sm:mt-24">
          © {new Date().getFullYear()} 円茶会 En Chakai · {t("rights")}
        </div>
      </div>
    </footer>
  );
}
