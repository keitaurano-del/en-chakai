"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[100dvh] items-end overflow-hidden">
      <Image
        src="/photos/room1.jpg"
        alt="The tea room interior"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/40 to-charcoal" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 text-xs uppercase tracking-[0.25em] text-gold sm:text-sm"
        >
          {t("kicker")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-[family-name:var(--font-heading)] text-4xl font-medium leading-[1.05] text-cream sm:text-6xl md:text-7xl lg:text-[5.5rem] whitespace-pre-line max-w-4xl"
        >
          {t("heading")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-cream/80 sm:mt-7 sm:text-lg"
        >
          {t("tagline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-5"
        >
          <Link
            href="/booking"
            className="inline-block bg-gold px-7 py-3.5 text-center text-sm font-medium uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-gold-light"
          >
            {t("primaryCta")}
          </Link>
          <Link
            href="/neighborhoods"
            className="inline-block border border-cream/30 px-7 py-3.5 text-center text-sm font-medium uppercase tracking-[0.15em] text-cream transition-colors hover:border-gold hover:text-gold"
          >
            {t("secondaryCta")}
          </Link>
          <span className="mt-2 text-xs tracking-wide text-cream/60 sm:ml-3 sm:mt-0">
            {t("meta")}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
