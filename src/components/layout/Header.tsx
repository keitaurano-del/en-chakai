"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navItems: { href: "/experience" | "/neighborhoods" | "/itineraries" | "/faq"; label: string }[] = [
    { href: "/experience", label: t("experience") },
    { href: "/neighborhoods", label: t("neighborhoods") },
    { href: "/itineraries", label: t("itineraries") },
    { href: "/faq", label: t("faq") },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-charcoal/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-xl font-light tracking-wide text-cream transition-colors hover:text-cream/70"
        >
          円茶会
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] tracking-[0.05em] text-cream/65 transition-colors hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="ml-2 text-[13px] tracking-[0.18em] text-gold transition-colors hover:text-gold-light"
          >
            {t("booking")}
          </Link>
        </nav>

        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center text-cream"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-charcoal/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col divide-y divide-cream/5 px-5 pb-5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-4 text-[15px] tracking-wide text-cream/75 transition-colors hover:text-cream"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="py-4 text-[15px] tracking-[0.15em] text-gold transition-colors hover:text-gold-light"
              >
                {t("booking")}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
