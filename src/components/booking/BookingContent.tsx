"use client";

import { useState, useEffect } from "react";
import { supabase, type Slot } from "@/lib/supabase";
import {
  CLOSED_DAYS,
  TIME_SLOT_LABELS,
  PLAN_LABELS,
  PLAN_MAX_GUESTS,
  formatDateDisplay,
  type TimeSlot,
} from "@/lib/booking";
import { PLANS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

type Step = "date" | "details" | "done";

type FormState = {
  date: string;
  time_slot: TimeSlot | "";
  plan: string;
  guests: number;
  name: string;
  email: string;
  seating: "floor" | "chair" | "";
  dietary: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  date: "",
  time_slot: "",
  plan: "",
  guests: 1,
  name: "",
  email: "",
  seating: "",
  dietary: "",
  notes: "",
};

export function BookingContent() {
  const [step, setStep] = useState<Step>("date");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load open slots for the visible month range
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

  // Calendar helpers
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

  // Filtered guest options by plan
  const maxGuests = form.plan ? PLAN_MAX_GUESTS[form.plan] ?? 6 : 6;

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

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (step === "done") {
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
                  We'll confirm your reservation at{" "}
                  <span className="text-ink">{form.email}</span> within 24
                  hours. If your date is unavailable, we'll suggest the nearest
                  alternative.
                </p>
                <div className="mt-10 border-t border-border pt-8 text-sm text-ink-muted">
                  <p>{formatDateDisplay(form.date)} at {form.time_slot}</p>
                  <p className="mt-1">{PLAN_LABELS[form.plan]}</p>
                  <p className="mt-1">{form.guests} guest{form.guests > 1 ? "s" : ""} · {form.seating === "floor" ? "Floor (tatami)" : "Chair"}</p>
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

  // ── STEP 1: Date + Time ──────────────────────────────────────────────────────
  const stepDate = (
    <div className="bg-paper pt-20 sm:pt-24">
      <section className="py-16 sm:py-24">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-3xl">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-clay sm:text-sm">
                Reserve
              </p>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-medium leading-[1.1] text-ink sm:text-5xl md:text-6xl">
                Choose a date.
              </h1>
              <p className="mt-4 text-base text-ink-muted">
                We're open Tuesday through Saturday. Select any highlighted day.
              </p>

              {/* Calendar */}
              <div className="mt-10 border border-border bg-paper-dark p-5 sm:p-7">
                {/* Month nav */}
                <div className="mb-5 flex items-center justify-between">
                  <button
                    onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                    disabled={new Date(year, month, 1) <= today}
                    className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-clay disabled:opacity-30"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-[family-name:var(--font-heading)] text-lg font-medium text-ink">
                    {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                    className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-clay"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="mb-2 grid grid-cols-7 text-center">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="py-1 text-xs tracking-wide text-ink/35">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                    const dateStr = padDay(d);
                    const available = isDayAvailable(d);
                    const selected = form.date === dateStr;
                    const date = new Date(dateStr + "T00:00:00");
                    const closed = CLOSED_DAYS.includes(date.getDay()) || date < today;

                    return (
                      <button
                        key={d}
                        disabled={!available}
                        onClick={() => setForm((f) => ({ ...f, date: dateStr, time_slot: "" }))}
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
                  })}
                </div>
              </div>

              {/* Time slots */}
              {form.date && (
                <FadeIn>
                  <div className="mt-8">
                    <p className="mb-4 text-sm uppercase tracking-[0.15em] text-clay">
                      {formatDateDisplay(form.date)}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {selectedDateSlots.map((slot) => (
                        <button
                          key={slot.time_slot}
                          onClick={() => setForm((f) => ({ ...f, time_slot: slot.time_slot as TimeSlot }))}
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

              {/* Next */}
              <div className="mt-10">
                <button
                  disabled={!form.date || !form.time_slot}
                  onClick={() => setStep("details")}
                  className="bg-ink px-9 py-4 text-sm font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );

  // ── STEP 2: Details form ─────────────────────────────────────────────────────
  const stepDetails = (
    <div className="bg-paper pt-20 sm:pt-24">
      <section className="py-16 sm:py-24">
        <Container>
          <FadeIn>
            <div className="mx-auto max-w-2xl">
              <button
                onClick={() => setStep("date")}
                className="mb-8 flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-clay"
              >
                <ChevronLeft size={14} /> Change date
              </button>

              <div className="mb-8 border border-clay/30 bg-clay/10 px-5 py-4">
                <p className="text-sm text-ink/70">
                  {formatDateDisplay(form.date)} at{" "}
                  <span className="text-ink">{form.time_slot}</span>
                </p>
              </div>

              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-medium text-ink sm:text-5xl">
                Your details.
              </h1>

              <form onSubmit={handleSubmit} className="mt-10 space-y-7">
                {/* Plan */}
                <div>
                  <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-clay">
                    Experience plan *
                  </label>
                  <div className="grid gap-3">
                    {PLANS.map((plan) => {
                      const key = plan.id;
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              plan: key,
                              guests: Math.min(f.guests, PLAN_MAX_GUESTS[key]),
                            }))
                          }
                          className={`flex items-start justify-between border p-4 text-left transition-colors ${
                            form.plan === key
                              ? "border-clay bg-clay/15"
                              : "border-border hover:border-cream/30"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-ink">
                              {PLAN_LABELS[key].split(" — ")[0]}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-muted">
                              {PLAN_LABELS[key].split(" — ")[1]}
                            </p>
                          </div>
                          {form.plan === key && (
                            <Check size={16} className="mt-0.5 shrink-0 text-clay" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-clay">
                    Number of guests *
                  </label>
                  <div className="flex gap-2">
                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setForm((f) => ({ ...f, guests: n }))}
                        className={`h-10 w-10 border text-sm transition-colors ${
                          form.guests === n
                            ? "border-clay bg-ink text-paper"
                            : "border-border text-ink/70 hover:border-clay hover:text-ink"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                    Your name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                    placeholder="Full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                    Email address *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Seating */}
                <div>
                  <label className="mb-3 block text-xs uppercase tracking-[0.15em] text-clay">
                    Seating preference *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["floor", "chair"] as const).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setForm((f) => ({ ...f, seating: s }))}
                        className={`border py-3.5 text-center text-sm transition-colors ${
                          form.seating === s
                            ? "border-clay bg-clay/15 text-ink"
                            : "border-border text-ink-muted hover:border-cream/30"
                        }`}
                      >
                        {s === "floor" ? "Floor (tatami)" : "Chair"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary */}
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-clay">
                    Dietary restrictions / allergies
                    <span className="ml-2 normal-case tracking-normal text-ink-muted">
                      — optional
                    </span>
                  </label>
                  <input
                    value={form.dietary}
                    onChange={(e) => setForm((f) => ({ ...f, dietary: e.target.value }))}
                    className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                    placeholder="e.g. nut allergy, vegetarian"
                  />
                </div>

                {/* Notes */}
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
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full border border-border bg-paper-dark px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-clay focus:outline-none"
                    placeholder="Accessibility needs, questions, etc."
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !form.plan ||
                    !form.name ||
                    !form.email ||
                    !form.seating
                  }
                  className="w-full bg-ink py-4 text-sm font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-clay disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending…" : "Send reservation request"}
                </button>

                <p className="text-center text-xs text-ink-muted">
                  We confirm by hand within 24 hours. No charge until we send a payment link.
                </p>
              </form>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );

  return step === "date" ? stepDate : stepDetails;
}
