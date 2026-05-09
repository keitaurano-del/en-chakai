"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="bg-paper">
      {/* 写真：4/5比率、全幅 */}
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9]">
        <Image
          src="/photos/room2.jpg"
          alt="The tea room"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* テキストブロック */}
      <div className="mx-auto max-w-[640px] px-4 sm:px-8 py-14 sm:py-20">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 text-[11px] uppercase tracking-[0.3em] text-clay"
        >
          {t("kicker")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-[family-name:var(--font-heading)] text-[42px] font-normal leading-[1.05] tracking-[-0.01em] text-ink sm:text-5xl md:text-[52px] whitespace-pre-line mb-6"
        >
          {t("heading")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mb-9 max-w-[460px] text-[15px] leading-[1.65] text-ink-muted"
        >
          {t("tagline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            href="/booking"
            className="inline-block bg-ink px-9 py-4 text-[12px] font-normal uppercase tracking-[0.2em] text-paper transition-colors hover:bg-clay"
          >
            {t("primaryCta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
