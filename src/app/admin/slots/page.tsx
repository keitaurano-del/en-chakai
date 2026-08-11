"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { type Slot, type Booking } from "@/lib/db";
import { TIME_SLOTS, TIME_SLOT_LABELS, PLAN_LABELS, formatDateDisplay } from "@/lib/booking";
import { PLANS } from "@/lib/constants";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  Users,
  LayoutDashboard,
  Plus,
  Trash2,
  Check,
  X,
  TrendingUp,
  Clock,
  Mail,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";

type Tab = "dashboard" | "slots" | "bookings";
type BookingRow = Booking & { available_slots: Slot };

const CLOSED_DAYS = [0, 1];
const DAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

function authHeader() {
  const pw = typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") ?? "" : "";
  return { "x-admin-password": pw, "Content-Type": "application/json" };
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function AdminSlotsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") !== "1") {
      router.replace("/admin");
    }
  }, [router]);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateStr(new Date());

  function padDay(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const handleUnauthorized = useCallback(() => {
    // パスワード変更後などの古いセッション → ログイン画面へ戻す
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_pw");
    router.replace("/admin");
  }, [router]);

  const loadSlots = useCallback(async () => {
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    const res = await fetch(`/api/admin/slots?from=${from}&to=${to}`, { headers: authHeader() });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    if (res.ok) setSlots(await res.json());
    setSlotsLoaded(true);
  }, [year, month, daysInMonth, handleUnauthorized]);

  const loadBookings = useCallback(async () => {
    const res = await fetch("/api/admin/bookings", { headers: authHeader() });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    if (res.ok) setBookings(await res.json());
    setBookingsLoaded(true);
  }, [handleUnauthorized]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const loading = !slotsLoaded || !bookingsLoaded;

  function getSlot(dateStr: string, time: string) {
    return slots.find((s) => s.date === dateStr && s.time_slot === time);
  }
  function slotsForDate(dateStr: string) {
    return slots.filter((s) => s.date === dateStr);
  }

  async function toggleSlot(dateStr: string, time: string) {
    setSaving(true);
    const existing = getSlot(dateStr, time);
    if (existing) {
      await fetch("/api/admin/slots", {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ id: existing.id, is_open: !existing.is_open }),
      });
      showToast(existing.is_open ? "スロットを非公開にしました" : "スロットを公開しました");
    } else {
      await fetch("/api/admin/slots", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ date: dateStr, time_slot: time, is_open: true }),
      });
      showToast("スロットを追加しました");
    }
    await loadSlots();
    setSaving(false);
  }

  async function deleteSlot(dateStr: string, time: string) {
    if (!confirm("このスロットを削除しますか？")) return;
    setSaving(true);
    const slot = getSlot(dateStr, time);
    if (slot) {
      await fetch("/api/admin/slots", {
        method: "DELETE",
        headers: authHeader(),
        body: JSON.stringify({ id: slot.id }),
      });
      showToast("削除しました");
      await loadSlots();
    }
    setSaving(false);
  }

  // その日の全枠を公開（未設定は追加、非公開は公開に）
  async function openDay(dateStr: string) {
    setSaving(true);
    const tasks: Promise<Response>[] = [];
    for (const t of TIME_SLOTS) {
      const existing = getSlot(dateStr, t);
      if (existing) {
        if (!existing.is_open) {
          tasks.push(
            fetch("/api/admin/slots", {
              method: "PATCH",
              headers: authHeader(),
              body: JSON.stringify({ id: existing.id, is_open: true }),
            })
          );
        }
      } else {
        tasks.push(
          fetch("/api/admin/slots", {
            method: "POST",
            headers: authHeader(),
            body: JSON.stringify({ date: dateStr, time_slot: t, is_open: true }),
          })
        );
      }
    }
    await Promise.all(tasks);
    await loadSlots();
    showToast("この日の全枠を公開しました");
    setSaving(false);
  }

  // その日の公開中の枠をすべて非公開に
  async function closeDay(dateStr: string) {
    setSaving(true);
    const targets = slotsForDate(dateStr).filter((s) => s.is_open);
    if (targets.length === 0) {
      showToast("公開中の枠はありません");
      setSaving(false);
      return;
    }
    await Promise.all(
      targets.map((s) =>
        fetch("/api/admin/slots", {
          method: "PATCH",
          headers: authHeader(),
          body: JSON.stringify({ id: s.id, is_open: false }),
        })
      )
    );
    await loadSlots();
    showToast("この日の全枠を非公開にしました");
    setSaving(false);
  }

  async function openWeek() {
    if (!selectedDate) return;
    setSaving(true);
    const base = new Date(selectedDate + "T00:00:00");
    const tasks: Promise<Response>[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      if (CLOSED_DAYS.includes(d.getDay())) continue;
      const dateStr = toDateStr(d);
      for (const t of TIME_SLOTS) {
        if (!getSlot(dateStr, t)) {
          tasks.push(
            fetch("/api/admin/slots", {
              method: "POST",
              headers: authHeader(),
              body: JSON.stringify({ date: dateStr, time_slot: t, is_open: true }),
            })
          );
        }
      }
    }
    await Promise.all(tasks);
    await loadSlots();
    showToast("週のスロットを一括追加しました");
    setSaving(false);
  }

  async function updateBookingStatus(id: string, status: "pending" | "confirmed" | "cancelled") {
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify({ id, status }),
    });
    showToast(
      status === "confirmed"
        ? "予約を確定し、確定メールを送信しました"
        : status === "cancelled"
          ? "予約をキャンセルしました"
          : "予約を未確認に戻しました"
    );
    await loadBookings();
    if (selectedBooking?.id === id) {
      const refreshed = bookings.find((b) => b.id === id);
      if (refreshed) setSelectedBooking({ ...refreshed, status });
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin");
  }

  // ── DERIVED METRICS ────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const planJpy = PLANS[0]?.priceJpy ?? 10000;
    const planUsd = PLANS[0]?.priceUsd ?? 70;

    let pending = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;
    let monthRevenueJpy = 0;
    let monthRevenueUsd = 0;

    for (const b of bookings) {
      if (b.status === "pending") pending++;
      if (!b.available_slots) continue;
      const d = new Date(b.available_slots.date + "T00:00:00");

      if (d >= weekStart && b.status !== "cancelled") thisWeekCount++;

      if (d >= monthStart && d < new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)) {
        if (b.status === "confirmed") {
          thisMonthCount++;
          monthRevenueJpy += planJpy * b.guests;
          monthRevenueUsd += planUsd * b.guests;
        }
      }
    }

    const upcoming = bookings
      .filter((b) => b.available_slots && b.status !== "cancelled")
      .filter((b) => new Date(b.available_slots.date + "T00:00:00") >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => a.available_slots.date.localeCompare(b.available_slots.date))
      .slice(0, 5);

    return { pending, thisWeekCount, thisMonthCount, monthRevenueJpy, monthRevenueUsd, upcoming };
  }, [bookings]);

  const pendingCount = metrics.pending;

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-charcoal text-cream font-[family-name:Inter,sans-serif]">
      {/* Toast */}
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded bg-deep-green px-5 py-3 text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-cream/10 bg-charcoal-light">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <span className="hidden shrink-0 font-[family-name:var(--font-heading)] text-lg sm:inline">
              円茶会 管理
            </span>
            <span className="shrink-0 font-[family-name:var(--font-heading)] text-base sm:hidden">
              円茶会
            </span>
            <nav className="flex gap-1 overflow-x-auto">
              <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")}>
                <LayoutDashboard size={14} className="shrink-0" />
                <span className="hidden sm:inline">ダッシュボード</span>
                <span className="sm:hidden">概要</span>
              </TabButton>
              <TabButton active={tab === "slots"} onClick={() => setTab("slots")}>
                <Calendar size={14} className="shrink-0" />
                <span className="hidden sm:inline">スロット管理</span>
                <span className="sm:hidden">枠</span>
              </TabButton>
              <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")}>
                <Users size={14} className="shrink-0" />
                <span className="hidden sm:inline">予約一覧</span>
                <span className="sm:hidden">予約</span>
                {pendingCount > 0 && (
                  <span className="ml-1 rounded-full bg-clay px-1.5 py-0.5 text-[10px] font-bold text-charcoal">
                    {pendingCount}
                  </span>
                )}
              </TabButton>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-1.5 p-2 text-sm text-cream/40 transition-colors hover:text-cream"
            aria-label="ログアウト"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">ログアウト</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-cream/40">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-cream/15 border-t-clay" />
            <p className="text-sm">読み込み中…</p>
          </div>
        ) : (
          <>
            {tab === "dashboard" && <Dashboard metrics={metrics} onOpenBooking={setSelectedBooking} />}

            {tab === "slots" && (
              <SlotsManager
                year={year}
                month={month}
                firstDay={firstDay}
                daysInMonth={daysInMonth}
                todayStr={todayStr}
                setCalendarMonth={setCalendarMonth}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                padDay={padDay}
                slotsForDate={slotsForDate}
                getSlot={getSlot}
                toggleSlot={toggleSlot}
                deleteSlot={deleteSlot}
                openDay={openDay}
                closeDay={closeDay}
                openWeek={openWeek}
                saving={saving}
              />
            )}

            {tab === "bookings" && (
              <BookingsList
                bookings={bookings}
                pendingCount={pendingCount}
                onSelect={setSelectedBooking}
              />
            )}
          </>
        )}
      </main>

      {/* Booking detail modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={(status) => updateBookingStatus(selectedBooking.id, status)}
        />
      )}
    </div>
  );
}

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-3 py-2 text-sm transition-colors ${
        active ? "bg-clay/15 text-clay" : "text-cream/50 hover:text-cream"
      }`}
    >
      {children}
    </button>
  );
}

type Metrics = {
  pending: number;
  thisWeekCount: number;
  thisMonthCount: number;
  monthRevenueJpy: number;
  monthRevenueUsd: number;
  upcoming: BookingRow[];
};

function Dashboard({
  metrics,
  onOpenBooking,
}: {
  metrics: Metrics;
  onOpenBooking: (b: BookingRow) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">ダッシュボード</h2>
        <p className="mt-1 text-sm text-cream/50">予約状況のサマリーと今後の予約。</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Clock size={16} />}
          label="未確認の予約"
          value={metrics.pending.toString()}
          tone={metrics.pending > 0 ? "warn" : "muted"}
        />
        <StatCard icon={<Calendar size={16} />} label="今週の予約" value={metrics.thisWeekCount.toString()} />
        <StatCard icon={<Users size={16} />} label="今月の確定予約" value={metrics.thisMonthCount.toString()} />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="今月の売上（確定済み）"
          value={`¥${metrics.monthRevenueJpy.toLocaleString()}`}
          sub={`$${metrics.monthRevenueUsd}`}
        />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-clay">
          今後の予約（直近5件）
        </h3>
        {metrics.upcoming.length === 0 ? (
          <p className="rounded border border-cream/10 bg-charcoal-light p-6 text-sm text-cream/40">
            今後の予約はまだありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {metrics.upcoming.map((b) => (
              <li key={b.id}>
                <button
                  onClick={() => onOpenBooking(b)}
                  className="flex w-full items-center justify-between rounded border border-cream/10 bg-charcoal-light px-4 py-3 text-left transition-colors hover:border-clay/40"
                >
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="mt-0.5 text-xs text-cream/50">
                      {formatDateDisplay(b.available_slots.date)} ・{" "}
                      {b.available_slots.time_slot} ・ {b.guests}名
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warn" | "muted";
}) {
  const accent =
    tone === "warn" ? "text-clay" : tone === "muted" ? "text-cream/60" : "text-cream";
  return (
    <div className="rounded border border-cream/10 bg-charcoal-light p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-cream/40">
        <span className="text-clay">{icon}</span>
        {label}
      </div>
      <p className={`mt-3 font-[family-name:var(--font-heading)] text-3xl ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-cream/40">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "confirmed" | "cancelled" }) {
  const map = {
    pending: { label: "未確認", cls: "bg-clay/15 text-clay" },
    confirmed: { label: "確定", cls: "bg-deep-green/30 text-green-300" },
    cancelled: { label: "キャンセル", cls: "bg-red-900/20 text-red-300" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>
  );
}

// 選択日の時間枠エディタ（右パネル / モバイルボトムシート共通）
function SlotEditor({
  selectedDate,
  getSlot,
  toggleSlot,
  deleteSlot,
  openDay,
  closeDay,
  saving,
}: {
  selectedDate: string;
  getSlot: (s: string, t: string) => Slot | undefined;
  toggleSlot: (s: string, t: string) => Promise<void>;
  deleteSlot: (s: string, t: string) => Promise<void>;
  openDay: (s: string) => Promise<void>;
  closeDay: (s: string) => Promise<void>;
  saving: boolean;
}) {
  return (
    <div className="p-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-cream/40">時間スロット</p>
      <div className="space-y-2">
        {TIME_SLOTS.map((time) => {
          const slot = getSlot(selectedDate, time);
          const exists = !!slot;
          const isOpen = slot?.is_open ?? false;
          return (
            <div
              key={time}
              className={`flex items-center justify-between rounded border px-3 py-3 ${
                isOpen ? "border-clay/30 bg-clay/5" : "border-cream/10"
              }`}
            >
              <div>
                <p className="text-sm font-medium">{TIME_SLOT_LABELS[time]}</p>
                <p
                  className={`mt-0.5 text-xs ${
                    isOpen ? "text-clay" : exists ? "text-cream/30" : "text-cream/20"
                  }`}
                >
                  {!exists ? "未設定" : isOpen ? "● 公開中" : "○ 非公開"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleSlot(selectedDate, time)}
                  disabled={saving}
                  className={`rounded border px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                    isOpen
                      ? "border-red-400/40 text-red-300 hover:bg-red-400/10"
                      : "border-deep-green bg-deep-green/30 text-cream hover:bg-deep-green/50"
                  }`}
                >
                  {!exists ? "追加" : isOpen ? "非公開" : "公開"}
                </button>
                {exists && (
                  <button
                    onClick={() => deleteSlot(selectedDate, time)}
                    disabled={saving}
                    className="flex h-9 w-9 items-center justify-center rounded text-cream/20 transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
                    aria-label="削除"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1日一括操作 */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-cream/10 pt-4">
        <button
          onClick={() => openDay(selectedDate)}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded border border-deep-green bg-deep-green/20 px-3 py-2.5 text-xs font-medium text-green-300 transition-colors hover:bg-deep-green/40 disabled:opacity-50"
        >
          <Eye size={14} /> この日を全枠公開
        </button>
        <button
          onClick={() => closeDay(selectedDate)}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded border border-cream/15 px-3 py-2.5 text-xs font-medium text-cream/60 transition-colors hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
        >
          <EyeOff size={14} /> この日を全て非公開
        </button>
      </div>
    </div>
  );
}

function SlotsManager(props: {
  year: number;
  month: number;
  firstDay: number;
  daysInMonth: number;
  todayStr: string;
  setCalendarMonth: (d: Date) => void;
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
  padDay: (d: number) => string;
  slotsForDate: (s: string) => Slot[];
  getSlot: (s: string, t: string) => Slot | undefined;
  toggleSlot: (s: string, t: string) => Promise<void>;
  deleteSlot: (s: string, t: string) => Promise<void>;
  openDay: (s: string) => Promise<void>;
  closeDay: (s: string) => Promise<void>;
  openWeek: () => Promise<void>;
  saving: boolean;
}) {
  const {
    year,
    month,
    firstDay,
    daysInMonth,
    todayStr,
    setCalendarMonth,
    selectedDate,
    setSelectedDate,
    padDay,
    slotsForDate,
    getSlot,
    toggleSlot,
    deleteSlot,
    openDay,
    closeDay,
    openWeek,
    saving,
  } = props;

  const editorProps = { getSlot, toggleSlot, deleteSlot, openDay, closeDay, saving };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Calendar */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
            className="flex h-10 w-10 items-center justify-center rounded border border-cream/10 text-cream transition-colors hover:border-clay"
            aria-label="前の月"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="font-[family-name:var(--font-heading)] text-xl">
              {year}年{month + 1}月
            </h2>
            <button
              onClick={() => setCalendarMonth(startOfMonth(new Date()))}
              className="rounded border border-cream/15 px-3 py-1.5 text-xs text-cream/60 transition-colors hover:border-clay hover:text-clay"
            >
              今日
            </button>
          </div>
          <button
            onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
            className="flex h-10 w-10 items-center justify-center rounded border border-cream/10 text-cream transition-colors hover:border-clay"
            aria-label="次の月"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-hidden rounded border border-cream/10">
          <div className="grid grid-cols-7 border-b border-cream/10 bg-charcoal-light">
            {DAYS_JA.map((d, i) => (
              <div
                key={d}
                className={`py-2.5 text-center text-xs font-medium ${
                  i === 0 ? "text-red-400" : i === 1 ? "text-cream/25" : "text-cream/40"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] border-b border-r border-cream/5 bg-black/10" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const dateStr = padDay(d);
              const dateObj = new Date(dateStr + "T00:00:00");
              const isClosed = CLOSED_DAYS.includes(dateObj.getDay());
              const isSun = dateObj.getDay() === 0;
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;
              const daySlots = slotsForDate(dateStr);
              const openSlots = daySlots.filter((s) => s.is_open);

              return (
                <button
                  key={d}
                  onClick={() => !isClosed && setSelectedDate(isSelected ? null : dateStr)}
                  disabled={isClosed}
                  className={`min-h-[72px] border-b border-r border-cream/5 p-2 text-left transition-colors ${
                    isSelected
                      ? "bg-deep-green/25"
                      : isClosed
                        ? "bg-black/15 cursor-default"
                        : "hover:bg-deep-green/10"
                  } ${isToday ? "ring-1 ring-inset ring-clay" : ""}`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? "text-clay"
                        : isClosed
                          ? "text-cream/20"
                          : isSun
                            ? "text-red-400"
                            : "text-cream/80"
                    }`}
                  >
                    {d}
                  </span>
                  {openSlots.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {openSlots.map((_, i) => (
                        <span key={i} className="h-1.5 w-1.5 rounded-full bg-clay" />
                      ))}
                    </div>
                  )}
                  {daySlots.length > openSlots.length && (
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {daySlots
                        .filter((s) => !s.is_open)
                        .map((_, i) => (
                          <span key={i} className="h-1.5 w-1.5 rounded-full bg-cream/20" />
                        ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-cream/40">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-clay" /> 公開中
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cream/20" /> 非公開
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm ring-1 ring-clay" /> 今日
          </span>
          <span>日・月は定休日</span>
        </div>

        {selectedDate && (
          <button
            onClick={openWeek}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded border border-deep-green px-4 py-2.5 text-sm text-green-300 transition-colors hover:bg-deep-green/20 disabled:opacity-50"
          >
            <Plus size={14} />
            {selectedDate} から1週間（火〜土）を一括公開
          </button>
        )}

        {/* ボトムシートに隠れないための余白（モバイルのみ） */}
        {selectedDate && <div className="h-16 lg:hidden" />}
      </div>

      {/* Right panel (lg以上のみ表示) */}
      <div className="hidden lg:block">
        {selectedDate ? (
          <div className="overflow-hidden rounded border border-cream/10 bg-charcoal-light">
            <div className="border-b border-cream/10 bg-black/20 px-4 py-3">
              <p className="text-xs text-cream/50">選択中の日付</p>
              <p className="mt-0.5 font-[family-name:var(--font-heading)] text-base">
                {formatDateDisplay(selectedDate)}
              </p>
            </div>
            <SlotEditor selectedDate={selectedDate} {...editorProps} />
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded border border-cream/10 text-sm text-cream/25">
            <Calendar size={24} />
            <p>左のカレンダーで日付を選択</p>
          </div>
        )}
      </div>

      {/* モバイル: ボトムシート */}
      {selectedDate && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="mx-auto max-h-[70vh] max-w-lg overflow-y-auto rounded-t-xl border-x border-t border-cream/15 bg-charcoal-light shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-cream/10 bg-charcoal-light px-4 py-3">
              <div>
                <p className="text-xs text-cream/50">選択中の日付</p>
                <p className="mt-0.5 font-[family-name:var(--font-heading)] text-base">
                  {formatDateDisplay(selectedDate)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="flex h-10 w-10 items-center justify-center rounded text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
            </div>
            <SlotEditor selectedDate={selectedDate} {...editorProps} />
          </div>
        </div>
      )}
    </div>
  );
}

function BookingsList({
  bookings,
  pendingCount,
  onSelect,
}: {
  bookings: BookingRow[];
  pendingCount: number;
  onSelect: (b: BookingRow) => void;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => filter === "all" || b.status === filter)
      .filter(
        (b) =>
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q)
      )
      .sort((a, b) =>
        (a.available_slots?.date ?? "9999-12-31").localeCompare(
          b.available_slots?.date ?? "9999-12-31"
        )
      );
  }, [bookings, filter, query]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl">予約一覧</h2>
          {pendingCount > 0 && (
            <p className="mt-1 text-sm text-clay">未確認 {pendingCount} 件</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-2 text-xs transition-colors ${
                filter === f ? "bg-clay/15 text-clay" : "text-cream/40 hover:text-cream"
              }`}
            >
              {f === "all" ? "全て" : f === "pending" ? "未確認" : f === "confirmed" ? "確定" : "キャンセル"}
            </button>
          ))}
        </div>
      </div>

      {/* 検索 */}
      <div className="relative mb-4">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="名前・メールで検索"
          className="w-full rounded border border-cream/15 bg-charcoal-light py-2.5 pl-9 pr-3 text-sm text-cream placeholder:text-cream/30 focus:border-clay focus:outline-none sm:max-w-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded border border-cream/10 p-12 text-center text-cream/30">
          該当する予約はありません
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => onSelect(b)}
                className="flex w-full items-start justify-between gap-4 rounded border border-cream/10 bg-charcoal-light p-4 text-left transition-colors hover:border-clay/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{b.name}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-cream/50">{b.email}</p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-cream/60">
                    {b.available_slots && (
                      <span>
                        📅 {formatDateDisplay(b.available_slots.date)} {b.available_slots.time_slot}
                      </span>
                    )}
                    <span>👥 {b.guests}名</span>
                    <span>🎋 {PLAN_LABELS[b.plan]?.split(" — ")[0]}</span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BookingDetailModal({
  booking,
  onClose,
  onStatusChange,
}: {
  booking: BookingRow;
  onClose: () => void;
  onStatusChange: (status: "pending" | "confirmed" | "cancelled") => Promise<void>;
}) {
  const planMeta = PLANS.find((p) => p.id === booking.plan) ?? PLANS[0];
  const totalUsd = planMeta.priceUsd * booking.guests;
  const totalJpy = planMeta.priceJpy * booking.guests;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-cream/15 bg-charcoal-light shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-cream/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-cream/40">予約詳細</p>
            <h3 className="mt-1 font-[family-name:var(--font-heading)] text-xl">{booking.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-2 text-cream/40 transition-colors hover:bg-cream/10 hover:text-cream"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5 text-sm">
          <div className="flex items-center gap-3">
            <StatusBadge status={booking.status} />
            <span className="text-cream/40">ID: {booking.id.slice(0, 8)}…</span>
          </div>

          <DetailRow label="日時">
            {booking.available_slots
              ? `${formatDateDisplay(booking.available_slots.date)} ・ ${booking.available_slots.time_slot}`
              : "—"}
          </DetailRow>
          <DetailRow label="プラン">{PLAN_LABELS[booking.plan]?.split(" — ")[0] ?? booking.plan}</DetailRow>
          <DetailRow label="人数">{booking.guests} 名</DetailRow>
          <DetailRow label="合計">
            <span className="text-base">
              ${totalUsd} <span className="text-cream/50">(¥{totalJpy.toLocaleString()})</span>
            </span>
          </DetailRow>
          <DetailRow label="メール">
            <a href={`mailto:${booking.email}`} className="text-clay hover:underline">
              {booking.email}
            </a>
          </DetailRow>
          {booking.dietary && <DetailRow label="食事制限">{booking.dietary}</DetailRow>}
          {booking.notes && <DetailRow label="備考">{booking.notes}</DetailRow>}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-cream/10 bg-black/20 px-6 py-4">
          {booking.status === "pending" && (
            <>
              <button
                onClick={() => onStatusChange("confirmed")}
                className="flex items-center gap-1.5 rounded border border-deep-green bg-deep-green/40 px-4 py-2 text-sm font-medium transition-colors hover:bg-deep-green/60"
              >
                <Check size={14} /> 確定 + メール送信
              </button>
              <button
                onClick={() => onStatusChange("cancelled")}
                className="flex items-center gap-1.5 rounded border border-red-400/40 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-400/10"
              >
                <X size={14} /> キャンセル
              </button>
            </>
          )}
          {booking.status === "confirmed" && (
            <button
              onClick={() => onStatusChange("pending")}
              className="flex items-center gap-1.5 rounded border border-cream/20 px-4 py-2 text-sm text-cream/60 transition-colors hover:bg-cream/5"
            >
              未確認に戻す
            </button>
          )}
          {booking.status === "cancelled" && (
            <button
              onClick={() => onStatusChange("pending")}
              className="flex items-center gap-1.5 rounded border border-cream/20 px-4 py-2 text-sm text-cream/60 transition-colors hover:bg-cream/5"
            >
              未確認に戻す
            </button>
          )}
          <a
            href={`mailto:${booking.email}`}
            className="ml-auto flex items-center gap-1.5 rounded border border-cream/15 px-4 py-2 text-sm text-cream/70 transition-colors hover:border-clay hover:text-clay"
          >
            <Mail size={14} /> メールで返信
          </a>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-3">
      <dt className="text-xs uppercase tracking-[0.1em] text-cream/40">{label}</dt>
      <dd className="text-cream/90">{children}</dd>
    </div>
  );
}
