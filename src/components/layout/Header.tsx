"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LocaleSwitch({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em]">
      <Link
        href={pathname}
        locale="en"
        onClick={onNavigate}
        className={`transition-colors hover:text-clay ${
          locale === "en" ? "text-ink" : "text-ink-muted"
        }`}
      >
        EN
      </Link>
      <span className="text-ink-muted/50">|</span>
      <Link
        href={pathname}
        locale="ja"
        onClick={onNavigate}
        className={`transition-colors hover:text-clay ${
          locale === "ja" ? "text-ink" : "text-ink-muted"
        }`}
      >
        日本語
      </Link>
    </span>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navItems: { href: "/experience" | "/faq"; label: string }[] = [
    { href: "/experience", label: t("experience") },
    { href: "/faq", label: t("faq") },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-paper/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-paper/80 backdrop-blur-sm border-b border-border"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-4 sm:px-8 md:h-16 md:max-w-6xl lg:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-[17px] tracking-[0.2em] text-ink transition-colors hover:text-clay"
        >
          EN CHAKAI 円茶会
        </Link>

        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-clay"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="bg-ink px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-paper transition-colors hover:bg-clay"
          >
            {t("booking")}
          </Link>
          <LocaleSwitch />
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center text-ink md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-paper/98 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col px-8 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-border py-4 text-[11px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-clay"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="mt-4 bg-ink px-5 py-3.5 text-center text-[11px] uppercase tracking-[0.18em] text-paper transition-colors hover:bg-clay"
              >
                {t("booking")}
              </Link>
              <div className="flex justify-center pt-4">
                <LocaleSwitch onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
