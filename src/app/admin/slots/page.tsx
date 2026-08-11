"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { type Slot } from "@/lib/db";
import { TIME_SLOTS, TIME_SLOT_LABELS, formatDateDisplay } from "@/lib/booking";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  Users,
  LayoutDashboard,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  CalendarCheck,
} from "lucide-react";
import {
  type BookingRow,
  type BookingStatus,
  BookingsList,
  BookingDetailModal,
  DAYS_JA,
  TabButton,
  isActiveBooking,
  toDateStr,
} from "./components";
import { Dashboard } from "./dashboard";

type Tab = "dashboard" | "slots" | "bookings";

const CLOSED_DAYS = [0, 1];

function authHeader() {
  const pw = typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") ?? "" : "";
  return { "x-admin-password": pw, "Content-Type": "application/json" };
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthRange(d: Date) {
  const y = d.getFullYear();
  const m = d.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  const mm = String(m + 1).padStart(2, "0");
  return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(last).padStart(2, "0")}` };
}

export default function AdminSlotsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [monthSlots, setMonthSlots] = useState<Slot[]>([]); // 実カレンダー今月分（ダッシュボード用）
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [paymentsSyncing, setPaymentsSyncing] = useState(false);
  const paymentsSyncedOnce = useRef(false);

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
    const { from, to } = monthRange(new Date(year, month, 1));
    const res = await fetch(`/api/admin/slots?from=${from}&to=${to}`, { headers: authHeader() });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    if (res.ok) setSlots(await res.json());
    setSlotsLoaded(true);
  }, [year, month, handleUnauthorized]);

  // ダッシュボードの稼働状況用に「実際の今月」のスロットも取得
  const loadMonthSlots = useCallback(async () => {
    const { from, to } = monthRange(new Date());
    const res = await fetch(`/api/admin/slots?from=${from}&to=${to}`, { headers: authHeader() });
    if (res.ok) setMonthSlots(await res.json());
  }, []);

  const loadBookings = useCallback(async () => {
    // limit は後方互換の追加パラメータ（省略時は従来通り100件）
    const res = await fetch("/api/admin/bookings?limit=500", { headers: authHeader() });
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
    loadMonthSlots();
  }, [loadMonthSlots]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Stripe 支払状況の同期。キー未設定・エラー時は静かに何もしない（従来動作を壊さない）。
  const syncPayments = useCallback(
    async (silent: boolean) => {
      setPaymentsSyncing(true);
      try {
        const res = await fetch("/api/admin/payments/sync", {
          method: "POST",
          headers: authHeader(),
        });
        if (res.ok) {
          const result = await res.json().catch(() => null);
          if (result && result.updated > 0) {
            await loadBookings();
            setToast(`支払状況を更新しました（${result.updated}件が支払済に）`);
            setTimeout(() => setToast(""), 2500);
          } else if (!silent) {
            setToast(result?.enabled === false ? "Stripe 連携は未設定です" : "支払状況は最新です");
            setTimeout(() => setToast(""), 2500);
          }
        }
      } catch {
        // ネットワークエラー等は無視（手動更新で再試行可能）
      } finally {
        setPaymentsSyncing(false);
      }
    },
    [loadBookings]
  );

  // 予約タブを開いたとき、自動で1回だけ支払状況を同期
  useEffect(() => {
    if (tab === "bookings" && !paymentsSyncedOnce.current) {
      paymentsSyncedOnce.current = true;
      syncPayments(true);
    }
  }, [tab, syncPayments]);

  const loading = !slotsLoaded || !bookingsLoaded;

  const refreshSlots = useCallback(async () => {
    await Promise.all([loadSlots(), loadMonthSlots()]);
  }, [loadSlots, loadMonthSlots]);

  function getSlot(dateStr: string, time: string) {
    return slots.find((s) => s.date === dateStr && s.time_slot === time);
  }
  function slotsForDate(dateStr: string) {
    return slots.filter((s) => s.date === dateStr);
  }

  // slot_id → 有効な予約（キャンセル除く）
  const bookingsBySlotId = useMemo(() => {
    const map = new Map<string, BookingRow[]>();
    for (const b of bookings) {
      if (!isActiveBooking(b)) continue;
      const list = map.get(b.slot_id);
      if (list) list.push(b);
      else map.set(b.slot_id, [b]);
    }
    return map;
  }, [bookings]);

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
    await refreshSlots();
    setSaving(false);
  }

  async function deleteSlot(dateStr: string, time: string) {
    const slot = getSlot(dateStr, time);
    if (!slot) return;
    if ((bookingsBySlotId.get(slot.id)?.length ?? 0) > 0) {
      showToast("予約が入っている枠は削除できません");
      return;
    }
    if (!confirm("このスロットを削除しますか？")) return;
    setSaving(true);
    await fetch("/api/admin/slots", {
      method: "DELETE",
      headers: authHeader(),
      body: JSON.stringify({ id: slot.id }),
    });
    showToast("削除しました");
    await refreshSlots();
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
    await refreshSlots();
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
    await refreshSlots();
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
    await refreshSlots();
    showToast("週のスロットを一括追加しました");
    setSaving(false);
  }

  // 表示中の月の営業日（火〜土）の全枠を公開
  async function openMonth() {
    const label = `${year}年${month + 1}月`;
    if (!confirm(`${label}の営業日（火〜土）の全枠を公開します。よろしいですか？`)) return;
    setSaving(true);
    const tasks: Promise<Response>[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = padDay(d);
      if (CLOSED_DAYS.includes(new Date(dateStr + "T00:00:00").getDay())) continue;
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
    }
    if (tasks.length === 0) {
      showToast("すべての枠がすでに公開されています");
      setSaving(false);
      return;
    }
    await Promise.all(tasks);
    await refreshSlots();
    showToast(`${label}の営業日を全枠公開しました（${tasks.length}件）`);
    setSaving(false);
  }

  async function updateBookingStatus(id: string, status: BookingStatus) {
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

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings]
  );

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
            {tab === "dashboard" && (
              <Dashboard
                bookings={bookings}
                monthSlots={monthSlots}
                onOpenBooking={setSelectedBooking}
              />
            )}

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
                bookingsBySlotId={bookingsBySlotId}
                onOpenBooking={setSelectedBooking}
                toggleSlot={toggleSlot}
                deleteSlot={deleteSlot}
                openDay={openDay}
                closeDay={closeDay}
                openWeek={openWeek}
                openMonth={openMonth}
                saving={saving}
              />
            )}

            {tab === "bookings" && (
              <BookingsList
                bookings={bookings}
                onSelect={setSelectedBooking}
                onSyncPayments={() => syncPayments(false)}
                paymentsSyncing={paymentsSyncing}
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

// ── スロット管理 ──────────────────────────────────────────────────────────────

// 選択日の時間枠エディタ（右パネル / モバイルボトムシート共通）
function SlotEditor({
  selectedDate,
  getSlot,
  bookingsBySlotId,
  onOpenBooking,
  toggleSlot,
  deleteSlot,
  openDay,
  closeDay,
  saving,
}: {
  selectedDate: string;
  getSlot: (s: string, t: string) => Slot | undefined;
  bookingsBySlotId: Map<string, BookingRow[]>;
  onOpenBooking: (b: BookingRow) => void;
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
          const slotBookings = slot ? bookingsBySlotId.get(slot.id) ?? [] : [];
          const hasBookings = slotBookings.length > 0;
          const guests = slotBookings.reduce((n, b) => n + b.guests, 0);
          return (
            <div
              key={time}
              className={`rounded border px-3 py-3 ${
                hasBookings
                  ? "border-deep-green-light/40 bg-deep-green/10"
                  : isOpen
                    ? "border-clay/30 bg-clay/5"
                    : "border-cream/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{TIME_SLOT_LABELS[time]}</p>
                  <p
                    className={`mt-0.5 text-xs ${
                      hasBookings
                        ? "text-green-300"
                        : isOpen
                          ? "text-clay"
                          : exists
                            ? "text-cream/30"
                            : "text-cream/20"
                    }`}
                  >
                    {!exists
                      ? "未設定"
                      : hasBookings
                        ? `● 予約あり（${guests}名 / 4名）${isOpen ? "" : "・非公開"}`
                        : isOpen
                          ? "● 公開中"
                          : "○ 非公開"}
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
                      disabled={saving || hasBookings}
                      title={hasBookings ? "予約が入っている枠は削除できません" : "削除"}
                      className="flex h-9 w-9 items-center justify-center rounded text-cream/20 transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-cream/20"
                      aria-label="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* この枠の予約者 */}
              {hasBookings && (
                <ul className="mt-2 space-y-1 border-t border-cream/10 pt-2">
                  {slotBookings.map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => onOpenBooking(b)}
                        className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-cream/5"
                      >
                        <span className="min-w-0 truncate">
                          <span className="font-medium text-cream/90">{b.name}</span>
                          <span className="ml-1.5 text-cream/45">{b.guests}名</span>
                          {b.status === "pending" && (
                            <span className="ml-1.5 text-clay">未確認</span>
                          )}
                        </span>
                        <span className="shrink-0 text-cream/30">詳細 →</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
  bookingsBySlotId: Map<string, BookingRow[]>;
  onOpenBooking: (b: BookingRow) => void;
  toggleSlot: (s: string, t: string) => Promise<void>;
  deleteSlot: (s: string, t: string) => Promise<void>;
  openDay: (s: string) => Promise<void>;
  closeDay: (s: string) => Promise<void>;
  openWeek: () => Promise<void>;
  openMonth: () => Promise<void>;
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
    bookingsBySlotId,
    onOpenBooking,
    toggleSlot,
    deleteSlot,
    openDay,
    closeDay,
    openWeek,
    openMonth,
    saving,
  } = props;

  const editorProps = {
    getSlot,
    bookingsBySlotId,
    onOpenBooking,
    toggleSlot,
    deleteSlot,
    openDay,
    closeDay,
    saving,
  };

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
              <div
                key={`empty-${i}`}
                className="min-h-[76px] border-b border-r border-cream/5 bg-black/10"
              />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const dateStr = padDay(d);
              const dateObj = new Date(dateStr + "T00:00:00");
              const isClosed = CLOSED_DAYS.includes(dateObj.getDay());
              const isSun = dateObj.getDay() === 0;
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;
              const daySlots = slotsForDate(dateStr);
              const dayGuests = daySlots.reduce(
                (n, s) =>
                  n + (bookingsBySlotId.get(s.id) ?? []).reduce((m, b) => m + b.guests, 0),
                0
              );

              return (
                <button
                  key={d}
                  onClick={() => !isClosed && setSelectedDate(isSelected ? null : dateStr)}
                  disabled={isClosed}
                  className={`min-h-[76px] border-b border-r border-cream/5 p-1.5 text-left transition-colors sm:p-2 ${
                    isSelected
                      ? "bg-deep-green/25"
                      : isClosed
                        ? "bg-black/15 cursor-default"
                        : "hover:bg-deep-green/10"
                  } ${isToday ? "ring-1 ring-inset ring-clay" : ""}`}
                >
                  <div className="flex items-baseline justify-between gap-1">
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
                    {dayGuests > 0 && (
                      <span className="rounded bg-deep-green/40 px-1 text-[10px] leading-4 text-green-300">
                        {dayGuests}名
                      </span>
                    )}
                  </div>
                  {daySlots.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {[...daySlots]
                        .sort((a, b) => a.time_slot.localeCompare(b.time_slot))
                        .map((s) => {
                          const booked = (bookingsBySlotId.get(s.id) ?? []).length > 0;
                          return (
                            <span
                              key={s.id}
                              className={`h-1.5 w-1.5 rounded-full ${
                                booked
                                  ? "bg-deep-green-light"
                                  : s.is_open
                                    ? "bg-clay"
                                    : "bg-cream/20"
                              }`}
                              title={`${s.time_slot} ${
                                booked ? "予約あり" : s.is_open ? "公開中" : "非公開"
                              }`}
                            />
                          );
                        })}
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
            <span className="h-2 w-2 rounded-full bg-deep-green-light" /> 予約あり
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cream/20" /> 非公開
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm ring-1 ring-clay" /> 今日
          </span>
          <span>日・月は定休日</span>
        </div>

        {/* 一括操作 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={openMonth}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded border border-deep-green px-4 py-2.5 text-sm text-green-300 transition-colors hover:bg-deep-green/20 disabled:opacity-50"
          >
            <CalendarCheck size={14} />
            {month + 1}月の営業日（火〜土）を全枠公開
          </button>
          {selectedDate && (
            <button
              onClick={openWeek}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded border border-deep-green px-4 py-2.5 text-sm text-green-300 transition-colors hover:bg-deep-green/20 disabled:opacity-50"
            >
              <Plus size={14} />
              {selectedDate} から1週間（火〜土）を一括公開
            </button>
          )}
        </div>

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
