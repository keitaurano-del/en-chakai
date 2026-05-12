"use client";

import { useState, useEffect, useRef } from "react";
import { supabase, type Slot } from "@/lib/supabase";
import {
  CLOSED_DAYS,
  TIME_SLOT_LABELS,
  formatDateDisplay,
  type TimeSlot,
} from "@/lib/booking";
import { PLANS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ShieldCheck,
  Languages,
  CalendarX,
} from "lucide-react";

const DEFAULT_PLAN = PLANS[0];

const TIMELINE: { time: string; label: string }[] = [
  { time: "0:00", label: "Welcome and purification" },
  { time: "0:05", label: "A short introduction" },
  { time: "0:15", label: "The host prepares matcha" },
  { time: "0:30", label: "Wagashi and your first bowl" },
  { time: "0:40", label: "Whisk your own bowl" },
  { time: "0:55", label: "Q&A and farewell" },
];

type FormState = {
  date: string;
  time_slot: TimeSlot | "";
  plan: string;
  guests: number;
  name: string;
  email: string;
  dietary: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  date: "",
  time_slot: "",
  plan: DEFAULT_PLAN.id,
  guests: 1,
  name: "",
  email: "",
  dietary: "",
  notes: "",
};

export function BookingContent() {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const timesRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const nextMonth = new Date(year, month + 2, 0);
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${nextMonth.getDate()}`;
    supabase
      .from("available_slots")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .eq("is_open", true)
      .then(({ data }) => {
        if (data) setSlots(data as Slot[]);
      });
  }, [calendarMonth]);

  useEffect(() => {
    if (form.date && !form.time_slot && timesRef.current) {
      setTimeout(() => {
        timesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [form.date, form.time_slot]);

  useEffect(() => {
    if (form.time_slot && detailsRef.current) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [form.time_slot]);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function openSlotsForDate(dateStr: string) {
    return slots.filter((s) => s.date === dateStr);
  }
  function padDay(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  function isDayAvailable(d: number) {
    const dateStr = padDay(d);
    const date = new Date(dateStr + "T00:00:00");
    if (CLOSED_DAYS.includes(date.getDay())) return false;
    if (date < today) return false;
    return openSlotsForDate(dateStr).length > 0;
  }
  const selectedDateSlots = form.date ? openSlotsForDate(form.date) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="bg-paper pt-20 sm:pt-24">
        <section className="py-24 sm:py-32">
          <Container>
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-clay">
                  <Check size={32} className="text-ink" />
                </div>
                <h1 className="font-[family-name:var(--font-heading)] text-4xl font-medium text-ink sm:text-5xl">
                  Request received.
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-ink/75">
                  We&apos;ve sent an acknowledgement to{" "}
                  <span className="text-ink">{form.email}</span>. You&apos;ll
                  receive a confirmation email with your payment link shortly.
                </p>
                <div className="mt-10 border-t border-border pt-8 text-sm text-ink-muted">
                  <p>
                    {formatDateDisplay(form.date)} at {form.time_slot}
                  </p>
                  <p className="mt-1">
                    {DEFAULT_PLAN.name} · ${DEFAULT_PLAN.priceUsd} (¥
                    {DEFAULT_PLAN.priceJpy.toLocaleString()}) per person
                  </p>
                  <p className="mt-1">
                    {form.guests} guest{form.guests > 1 ? "s" : ""}
                  </p>
                </div>
                <Link
                  href="/"
                  className="mt-10 inline-block border border-border px-7 py-3.5 text-sm uppercase tracking-[0.15em] text-ink/70 transition-colors hover:border-clay hover:text-clay"
                >
                  Back to home
                </Link>
              </div>
            </FadeIn>
          </Container>
        </section>
      </div>
    );
  }

  const totalUsd = DEFAULT_PLAN.priceUsd * form.guests;
  const totalJpy = DEFAULT_PLAN.priceJpy * form.guests;
  const stepStatus = {
    date: form.date ? "done" : "active",
    time: form.time_slot ? "done" : form.date ? "active" : "pending",
    details: form.date && form.time_slot ? "active" : "pending",
  } as const;

  return (
    <div className="bg-paper pt-20 pb-32 sm:pt-24">
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <FadeIn>
              <div className="max-w-2xl">
                <p className="mb-3 text-xs uppercase tracking-[0.25em] text-clay sm:text-sm">
                  Reserve
                </p>
                <h1 className="font-[family-name:var(--font-heading)] text-4xl font-medium leading-[1.1] text-ink sm:text-5xl md:text-6xl">
                  Reserve your seat.
                </h1>
                <p className="mt-4 text-base text-ink-muted">
                  One party at a time. Open Tuesday through Saturday.
                </p>
              </div>
            </FadeIn>

            {/* Plan banner */}
            <FadeIn delay={0.04}>
              <div className="mt-10 border border-clay/40 bg-clay/10 px-6 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-clay">
                      {DEFAULT_PLAN.name}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {DEFAULT_PLAN.durationMin} min · up to 6 guests · hosted in English
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-[family-name:var(--font-heading)] text-3xl text-ink sm:text-4xl">
                      ${DEFAULT_PLAN.priceUsd}
                      <span className="ml-1 text-sm font-normal text-ink-muted">
                        per person
                      </span>
                    </p>
                    <p className="text-xs text-ink-muted">
                      ¥{DEFAULT_PLAN.priceJpy.toLocaleString()} JPY
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* What to expect timeline */}
            <FadeIn delay={0.08}>
              <div className="mt-10">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-clay">
                  What to expect
                </p>
                <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {TIMELINE.map((step) => (
                    <li
                      key={step.time}
                      className="flex items-baseline gap-3 border-l border-clay/30 pl-3 py-1"
                    >
                      <span className="font-[family-name:var(--font-heading)] text-sm tabular-nums text-clay">
                        {step.time}
                      </span>
                      <span className="text-sm text-ink-muted">
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </FadeIn>

            {/* 2-column form + sidebar */}
            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
              {/* LEFT: form */}
              <div className="min-w-0">
                {/* 1. Date */}
                <FadeIn delay={0.05}>
                  <div>
                    <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-clay">
                      <StepBullet status={stepStatus.date} n={1} />
                      Choose a date
                    </p>
                    <div className="border border-border bg-paper-dark p-4 sm:p-6">
                      <div className="mb-5 flex items-center justify-between">
                        <button
                          onClick={() =>
                            setCalendarMonth(new Date(year, month - 1, 1))
                          }
                          disabled={new Date(year, month, 1) <= today}
                          className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-clay disabled:opacity-30"
                          aria-label="Previous month"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="font-[family-name:var(--font-heading)] text-lg font-medium text-ink">
                          {calendarMonth.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <button
                          onClick={() =>
                            setCalendarMonth(new Date(year, month + 1, 1))
                          }
                          className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-clay"
                          aria-label="Next month"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>

                      <div className="mb-2 grid grid-cols-7 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (d) => (
                            <div
                              key={d}
                              className="py-1 text-xs tracking-wide text-ink/35"
                            >
                              {d}
                            </div>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-7">
                        {Array.from({ length: firstDay }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                          (d) => {
                            const dateStr = padDay(d);
                            const available = isDayAvailable(d);
                            const selected = form.date === dateStr;
                            const date = new Date(dateStr + "T00:00:00");
                            const closed =
                              CLOSED_DAYS.includes(date.getDay()) || date < today;

                            return (
                              <button
                                key={d}
                                disabled={!available}
                                onClick={() =>
                                  setForm((f) => ({
                                    ...f,
                                    date: dateStr,
                                    time_slot: "",
                                  }))
                                }
                                className={`
                                  aspect-square flex items-center justify-center text-sm transition-colors
                                  ${selected ? "bg-ink text-paper font-medium" : ""}
                                  ${!selected && available ? "text-ink hover:bg-clay/40 hover:text-clay cursor-pointer" : ""}
                                  ${closed || !available ? "text-ink/20 cursor-default" : ""}
                                `}
                              >
                                {d}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* 2. Time */}
                {form.date && (
                  <FadeIn>
                    <div ref={timesRef} className="mt-10 scroll-mt-24">
                      <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-clay">
                        <StepBullet status={stepStatus.time} n={2} />
                        Choose a time
                      </p>
                      <p className="mb-3 text-sm text-ink-muted">
                        {formatDateDisplay(form.date)}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {selectedDateSlots.map((slot) => (
                          <button
                            key={slot.time_slot}
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                time_slot: slot.time_slot as TimeSlot,
                              }))
                            }
                            className={`border py-4 text-center text-sm transition-colors ${
                              form.time_slot === slot.time_slot
                                ? "border-clay bg-clay/20 text-ink"
                                : "border-border text-ink/70 hover:border-clay hover:text-ink"
                            }`}
                          >
                            {TIME_SLOT_LABELS[slot.time_slot as TimeSlot]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                )}

                {/* 3. Details */}
                {form.date && form.time_slot && (
                  <FadeIn>
                    <div ref={detailsRef} className="mt-10 scroll-mt-24">
                      <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-clay">
                        <StepBullet status={stepStatus.details} n={3} />
                        Your details
                      </p>
                      <form onSubmit={handleSubmit} className="space-y-7">
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                            Number of guests *
                          </label>
                          <select
                            value={form.guests}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                guests: Number(e.target.value),
                              }))
                            }
                            className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink focus:border-clay focus:outline-none"
                          >
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>
                                {n} {n === 1 ? "guest" : "guests"}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                            Your name *
                          </label>
                          <input
                            required
                            value={form.name}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                            placeholder="Full name"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                            Email address *
                          </label>
                          <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, email: e.target.value }))
                            }
                            className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                            placeholder="you@example.com"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                            Dietary restrictions / allergies
                            <span className="ml-2 normal-case tracking-normal text-ink-muted">
                              — optional
                            </span>
                          </label>
                          <input
                            value={form.dietary}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, dietary: e.target.value }))
                            }
                            className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                            placeholder="e.g. nut allergy, vegetarian"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                            Anything else we should know
                            <span className="ml-2 normal-case tracking-normal text-ink-muted">
                              — optional
                            </span>
                          </label>
                          <textarea
                            rows={3}
                            value={form.notes}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, notes: e.target.value }))
                            }
                            className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                            placeholder="Accessibility needs, questions, etc."
                          />
                        </div>

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <button
                          type="submit"
                          disabled={submitting || !form.name || !form.email}
                          className="w-full bg-ink py-4 text-sm font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {submitting ? "Sending…" : "Send reservation request"}
                        </button>

                        <p className="text-center text-xs text-ink-muted">
                          No charge until we send a payment link.
                        </p>
                      </form>
                    </div>
                  </FadeIn>
                )}
              </div>

              {/* RIGHT: sticky summary + trust */}
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-6">
                  {/* Summary */}
                  <div className="border border-border bg-paper-dark p-5">
                    <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-clay">
                      Your reservation
                    </p>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-ink-muted">Plan</dt>
                        <dd className="text-right text-ink">
                          {DEFAULT_PLAN.name}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-muted">Date</dt>
                        <dd className="text-right text-ink">
                          {form.date ? formatDateDisplay(form.date) : "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-muted">Time</dt>
                        <dd className="text-right text-ink">
                          {form.time_slot || "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-muted">Guests</dt>
                        <dd className="text-right text-ink">{form.guests}</dd>
                      </div>
                    </dl>
                    <div className="mt-5 border-t border-border pt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs uppercase tracking-[0.15em] text-ink-muted">
                          Total
                        </span>
                        <span className="font-[family-name:var(--font-heading)] text-2xl text-ink">
                          ${totalUsd}
                        </span>
                      </div>
                      <p className="mt-1 text-right text-xs text-ink-muted">
                        ¥{totalJpy.toLocaleString()} JPY
                      </p>
                    </div>
                  </div>

                  {/* Trust */}
                  <div className="space-y-3 text-xs text-ink-muted">
                    <TrustItem icon={<ShieldCheck size={14} />}>
                      Secure card payment via Stripe
                    </TrustItem>
                    <TrustItem icon={<CalendarX size={14} />}>
                      Free cancellation up to 7 days before
                    </TrustItem>
                    <TrustItem icon={<Languages size={14} />}>
                      Hosted in English (Japanese welcome)
                    </TrustItem>
                  </div>
                </div>
              </aside>
            </div>

            {/* Mobile trust strip */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-muted lg:hidden">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-clay" /> Stripe secured
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarX size={14} className="text-clay" /> Free cancel 7d+
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages size={14} className="text-clay" /> English hosted
              </span>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function StepBullet({
  status,
  n,
}: {
  status: "pending" | "active" | "done";
  n: number;
}) {
  const colors =
    status === "done"
      ? "bg-clay text-paper"
      : status === "active"
        ? "bg-ink text-paper"
        : "bg-transparent text-ink/30 border border-ink/20";
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${colors}`}
    >
      {status === "done" ? <Check size={10} /> : n}
    </span>
  );
}

function TrustItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-clay/15 text-clay">
        {icon}
      </span>
      <span className="text-ink/70">{children}</span>
    </div>
  );
}
