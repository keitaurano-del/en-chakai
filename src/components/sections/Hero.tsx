"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-charcoal">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(135deg, #4A7C59 0%, #2C2C2C 40%, #2C2C2C 60%, #4A7C59 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(200,164,92,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(45,74,45,0.4) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-transparent to-charcoal" />

      {/* Max guests badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute right-4 top-20 z-20 sm:right-10 sm:top-28"
      >
        <span className="inline-block border border-gold/40 bg-charcoal/70 px-2.5 py-1 text-[10px] tracking-widest text-gold backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-xs">
          {t("maxGuests")}
        </span>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4 font-[family-name:var(--font-heading)] text-base tracking-[0.3em] text-gold sm:mb-6 sm:text-lg"
        >
          {t("subtitle")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight text-cream sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl whitespace-pre-line"
        >
          {t("heading")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream/70 sm:mt-8 sm:text-lg md:text-xl"
        >
          {t("tagline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 sm:mt-12"
        >
          <Link
            href="/booking"
            className="inline-block w-full border border-gold bg-transparent px-8 py-4 text-sm font-medium uppercase tracking-[0.15em] text-gold transition-all duration-300 hover:bg-gold hover:text-charcoal active:bg-gold active:text-charcoal sm:w-auto sm:px-10"
          >
            {t("cta")}
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-8 w-[1px] bg-gradient-to-b from-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
