"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/FadeIn";
import { Check } from "lucide-react";

// EC-14: inquiry form for dates within the 2-week public booking window.
// Anchored at #inquiry on the booking page.

type InquiryForm = {
  name: string;
  email: string;
  desired_date: string;
  party_size: string;
  message: string;
};

const EMPTY: InquiryForm = {
  name: "",
  email: "",
  desired_date: "",
  party_size: "",
  message: "",
};

export function InquirySection() {
  const t = useTranslations("booking.inquiry");
  const [form, setForm] = useState<InquiryForm>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          desired_date: form.desired_date,
          party_size: form.party_size ? Number(form.party_size) : undefined,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError(t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FadeIn>
      <div id="inquiry" className="mt-16 max-w-2xl scroll-mt-24 border-t border-border pt-12">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-clay sm:text-sm">
          {t("kicker")}
        </p>
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-medium text-ink sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="mt-4 text-base text-ink-muted">{t("lede")}</p>

        {done ? (
          <div className="mt-8 border border-clay/40 bg-clay/10 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-clay">
              <Check size={24} className="text-ink" />
            </div>
            <p className="font-[family-name:var(--font-heading)] text-2xl text-ink">
              {t("successHeading")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {t("successBody")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-7">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                {t("nameLabel")}
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                placeholder={t("namePlaceholder")}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                {t("emailLabel")}
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                placeholder={t("emailPlaceholder")}
              />
            </div>

            <div className="grid gap-7 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                  {t("dateLabel")}
                  <span className="ml-2 normal-case tracking-normal text-ink-muted">
                    {t("optional")}
                  </span>
                </label>
                <input
                  value={form.desired_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, desired_date: e.target.value }))
                  }
                  className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                  placeholder={t("datePlaceholder")}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                  {t("partyLabel")}
                  <span className="ml-2 normal-case tracking-normal text-ink-muted">
                    {t("optional")}
                  </span>
                </label>
                <select
                  value={form.party_size}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, party_size: e.target.value }))
                  }
                  className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink focus:border-clay focus:outline-none"
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                {t("messageLabel")}
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                placeholder={t("messagePlaceholder")}
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !form.name || !form.email || !form.message}
              className="w-full bg-ink py-4 text-sm font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto sm:px-10"
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </form>
        )}
      </div>
    </FadeIn>
  );
}
