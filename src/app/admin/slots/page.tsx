"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createServiceClient, type Slot } from "@/lib/supabase";
import { type Booking } from "@/lib/supabase";
import { TIME_SLOTS, TIME_SLOT_LABELS, PLAN_LABELS, formatDateDisplay } from "@/lib/booking";
import { Container } from "@/components/ui/Container";
import { ChevronLeft, ChevronRight, Plus, Trash2, LogOut, Calendar, Users } from "lucide-react";

type Tab = "slots" | "bookings";

const CLOSED_DAYS = [0, 1]; // Sun, Mon

export default function AdminSlotsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("slots");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<(Booking & { available_slots: Slot })[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auth guard
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") !== "1") {
      router.replace("/admin");
    }
  }, [router]);

  const supabase = createServiceClient();

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function padDay(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const loadSlots = useCallback(async () => {
    setLoading(true);
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${daysInMonth}`;
    const { data } = await supabase
      .from("available_slots")
      .select("*")
      .gte("date", from)
      .lte("date", to);
    if (data) setSlots(data as Slot[]);
    setLoading(false);
  }, [year, month, daysInMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBookings = useCallback(async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, available_slots(*)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setBookings(data as (Booking & { available_slots: Slot })[]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadSlots(); }, [loadSlots]);
  useEffect(() => { if (tab === "bookings") loadBookings(); }, [tab, loadBookings]);

  function slotsForDate(dateStr: string) {
    return slots.filter((s) => s.date === dateStr);
  }

  function hasSlot(dateStr: string, time: string) {
    return slots.some((s) => s.date === dateStr && s.time_slot === time);
  }

  function isOpen(dateStr: string, time: string) {
    const slot = slots.find((s) => s.date === dateStr && s.time_slot === time);
    return slot?.is_open ?? false;
  }

  async function toggleSlot(dateStr: string, time: string) {
    setSaving(true);
    const existing = slots.find((s) => s.date === dateStr && s.time_slot === time);

    if (existing) {
      // Toggle open/closed
      const { error } = await supabase
        .from("available_slots")
        .update({ is_open: !existing.is_open })
        .eq("id", existing.id);
      if (!error) await loadSlots();
    } else {
      // Create new open slot
      const { error } = await supabase
        .from("available_slots")
        .insert({ date: dateStr, time_slot: time, is_open: true });
      if (!error) await loadSlots();
    }
    setSaving(false);
  }

  async function deleteSlot(dateStr: string, time: string) {
    setSaving(true);
    const slot = slots.find((s) => s.date === dateStr && s.time_slot === time);
    if (slot) {
      await supabase.from("available_slots").delete().eq("id", slot.id);
      await loadSlots();
    }
    setSaving(false);
  }

  // Bulk: open all slots for a week (Tue–Sat)
  async function openWeek() {
    if (!selectedDate) return;
    setSaving(true);
    const base = new Date(selectedDate + "T00:00:00");
    const inserts = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      if (CLOSED_DAYS.includes(d.getDay())) continue;
      const dateStr = d.toISOString().slice(0, 10);
      for (const t of TIME_SLOTS) {
        inserts.push({ date: dateStr, time_slot: t, is_open: true });
      }
    }
    await supabase
      .from("available_slots")
      .upsert(inserts, { onConflict: "date,time_slot", ignoreDuplicates: true });
    await loadSlots();
    setSaving(false);
  }

  async function updateBookingStatus(id: string, status: "confirmed" | "cancelled") {
    await supabase.from("bookings").update({ status }).eq("id", id);
    await loadBookings();
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <div className="border-b border-cream/10 bg-charcoal-light">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="font-[family-name:var(--font-heading)] text-lg text-cream">
              円茶会 Admin
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setTab("slots")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                  tab === "slots" ? "bg-gold/15 text-gold" : "text-cream/50 hover:text-cream"
                }`}
              >
                <Calendar size={14} /> Slots
              </button>
              <button
                onClick={() => setTab("bookings")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                  tab === "bookings" ? "bg-gold/15 text-gold" : "text-cream/50 hover:text-cream"
                }`}
              >
                <Users size={14} /> Bookings
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-cream/40 transition-colors hover:text-cream"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <Container>
        <div className="py-10">

          {/* ── SLOTS TAB ── */}
          {tab === "slots" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              {/* Calendar */}
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <button
                    onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                    className="flex h-9 w-9 items-center justify-center text-cream/50 transition-colors hover:text-gold"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="font-[family-name:var(--font-heading)] text-xl text-cream">
                    {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h2>
                  <button
                    onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                    className="flex h-9 w-9 items-center justify-center text-cream/50 transition-colors hover:text-gold"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="border border-cream/10 bg-charcoal-light">
                  <div className="grid grid-cols-7 border-b border-cream/10">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="py-2 text-center text-xs tracking-wide text-cream/30">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`e${i}`} className="border-b border-r border-cream/5" />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const dateStr = padDay(d);
                      const date = new Date(dateStr + "T00:00:00");
                      const closed = CLOSED_DAYS.includes(date.getDay());
                      const daySlots = slotsForDate(dateStr);
                      const openCount = daySlots.filter((s) => s.is_open).length;
                      const isSelected = selectedDate === dateStr;

                      return (
                        <button
                          key={d}
                          onClick={() => !closed && setSelectedDate(isSelected ? null : dateStr)}
                          disabled={closed}
                          className={`
                            relative border-b border-r border-cream/5 p-2 text-left transition-colors
                            ${closed ? "cursor-default bg-charcoal/30" : "hover:bg-deep-green/10 cursor-pointer"}
                            ${isSelected ? "bg-deep-green/20 border-gold/30" : ""}
                          `}
                        >
                          <span className={`text-sm ${closed ? "text-cream/20" : "text-cream/70"}`}>
                            {d}
                          </span>
                          {openCount > 0 && (
                            <div className="mt-1 flex gap-0.5">
                              {Array.from({ length: openCount }).map((_, i) => (
                                <div key={i} className="h-1.5 w-1.5 rounded-full bg-gold" />
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-2 text-xs text-cream/35">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                  Each dot = one open time slot. Click a day to manage slots.
                </p>

                {/* Bulk open week */}
                {selectedDate && (
                  <button
                    onClick={openWeek}
                    disabled={saving}
                    className="mt-4 flex items-center gap-2 border border-deep-green px-4 py-2 text-sm text-deep-green transition-colors hover:bg-deep-green hover:text-cream disabled:opacity-50"
                  >
                    <Plus size={14} />
                    Open Tue–Sat from {selectedDate} (all time slots)
                  </button>
                )}
              </div>

              {/* Day detail panel */}
              <div>
                {selectedDate ? (
                  <div className="border border-cream/10 bg-charcoal-light p-5">
                    <h3 className="mb-5 font-[family-name:var(--font-heading)] text-lg text-cream">
                      {formatDateDisplay(selectedDate)}
                    </h3>
                    <div className="space-y-3">
                      {TIME_SLOTS.map((time) => {
                        const exists = hasSlot(selectedDate, time);
                        const open = isOpen(selectedDate, time);
                        return (
                          <div key={time} className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm text-cream">{TIME_SLOT_LABELS[time]}</p>
                              {exists && (
                                <p className={`text-xs ${open ? "text-deep-green" : "text-cream/30"}`}>
                                  {open ? "Open" : "Closed"}
                                </p>
                              )}
                              {!exists && <p className="text-xs text-cream/25">Not created</p>}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleSlot(selectedDate, time)}
                                disabled={saving}
                                className={`px-3 py-1.5 text-xs uppercase tracking-wide transition-colors disabled:opacity-50 ${
                                  open
                                    ? "border border-cream/20 text-cream/50 hover:border-red-400 hover:text-red-400"
                                    : "bg-deep-green/80 text-cream hover:bg-deep-green"
                                }`}
                              >
                                {exists ? (open ? "Close" : "Open") : "Add"}
                              </button>
                              {exists && (
                                <button
                                  onClick={() => deleteSlot(selectedDate, time)}
                                  disabled={saving}
                                  className="flex h-7 w-7 items-center justify-center text-cream/20 transition-colors hover:text-red-400 disabled:opacity-50"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center border border-cream/5 text-sm text-cream/25">
                    Select a day to manage slots
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BOOKINGS TAB ── */}
          {tab === "bookings" && (
            <div>
              <h2 className="mb-6 font-[family-name:var(--font-heading)] text-2xl text-cream">
                Recent Bookings
              </h2>
              {bookings.length === 0 ? (
                <p className="text-cream/40">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="border border-cream/10 bg-charcoal-light p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-cream">{b.name}</p>
                            <span className={`text-xs uppercase tracking-wide ${
                              b.status === "confirmed" ? "text-deep-green" :
                              b.status === "cancelled" ? "text-red-400" :
                              "text-gold"
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-cream/55">{b.email}</p>
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-cream/70">
                            {b.available_slots && (
                              <span>{formatDateDisplay(b.available_slots.date)} · {b.available_slots.time_slot}</span>
                            )}
                            <span>{PLAN_LABELS[b.plan]?.split(" — ")[0]}</span>
                            <span>{b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                            <span>{b.seating === "floor" ? "Floor" : "Chair"}</span>
                          </div>
                          {b.dietary && (
                            <p className="mt-2 text-xs text-cream/45">Dietary: {b.dietary}</p>
                          )}
                          {b.notes && (
                            <p className="mt-1 text-xs text-cream/45">Notes: {b.notes}</p>
                          )}
                        </div>
                        {b.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateBookingStatus(b.id, "confirmed")}
                              className="bg-deep-green px-4 py-2 text-xs uppercase tracking-wide text-cream transition-colors hover:bg-deep-green-light"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateBookingStatus(b.id, "cancelled")}
                              className="border border-cream/20 px-4 py-2 text-xs uppercase tracking-wide text-cream/50 transition-colors hover:border-red-400 hover:text-red-400"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
