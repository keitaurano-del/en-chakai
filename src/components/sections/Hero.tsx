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
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/30 to-charcoal/95" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 sm:px-6 sm:pb-28 lg:px-8 lg:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 text-xs tracking-[0.3em] text-cream/55 sm:text-[13px]"
        >
          {t("kicker")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-[family-name:var(--font-heading)] text-4xl font-light leading-[1.08] text-cream sm:text-6xl md:text-7xl lg:text-[5.25rem] whitespace-pre-line max-w-4xl"
        >
          {t("heading")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-7 max-w-md text-base leading-relaxed text-cream/70 sm:mt-9 sm:text-[17px]"
        >
          {t("tagline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col gap-5 sm:mt-12 sm:flex-row sm:items-center sm:gap-8"
        >
          <Link
            href="/booking"
            className="group inline-flex items-center gap-3 text-sm tracking-[0.18em] text-cream transition-colors hover:text-gold"
          >
            <span>{t("primaryCta")}</span>
            <span className="h-px w-10 bg-cream/50 transition-all group-hover:w-14 group-hover:bg-gold" />
          </Link>
          <Link
            href="/neighborhoods"
            className="text-sm tracking-[0.18em] text-cream/55 transition-colors hover:text-cream"
          >
            {t("secondaryCta")}
          </Link>
          <span className="text-xs tracking-wide text-cream/40 sm:ml-auto">
            {t("meta")}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
