"use client";

// 管理画面シェル: ナビゲーション（モバイル=下部タブバー / PC=左サイドバー）と
// データ取得・更新をここに集約し、各ビュー（ホーム/カレンダー/予約/設定）へ配る。
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { type Slot } from "@/lib/db";
import { TIME_SLOTS } from "@/lib/booking";
import { Calendar, Home, LogOut, Settings, Users } from "lucide-react";
import {
  type BookingRow,
  type BookingStatus,
  BookingsList,
  BookingDrawer,
  isActiveBooking,
  toDateStr,
} from "./components";
import { HomeView } from "./home";
import { CalendarView } from "./calendar";
import { SettingsView, type SettingsInfo } from "./settings";

type Tab = "home" | "calendar" | "bookings" | "settings";

const DEFAULT_CLOSED_DAYS = [0, 1]; // settings 取得失敗時のフォールバック（日・月）

const NAV: { id: Tab; label: string; icon: React.ComponentType<{ size?: number | string; className?: string }> }[] = [
  { id: "home", label: "ホーム", icon: Home },
  { id: "calendar", label: "カレンダー", icon: Calendar },
  { id: "bookings", label: "予約", icon: Users },
  { id: "settings", label: "設定", icon: Settings },
];

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

// カレンダー用スロット取得範囲: 表示月の前後7日を含める（週表示が月をまたぐため）
function slotsRange(d: Date) {
  const from = new Date(d.getFullYear(), d.getMonth(), 1 - 7);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0 + 7);
  return { from: toDateStr(from), to: toDateStr(to) };
}

export default function AdminSlotsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [monthSlots, setMonthSlots] = useState<Slot[]>([]); // 実カレンダー今月分（KPI稼働率用）
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [paymentsSyncing, setPaymentsSyncing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null); // ホームのワンタップ操作中
  const [closedDays, setClosedDays] = useState<number[]>(DEFAULT_CLOSED_DAYS);
  const [settingsInfo, setSettingsInfo] = useState<SettingsInfo | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
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
    const { from, to } = slotsRange(new Date(year, month, 1));
    const res = await fetch(`/api/admin/slots?from=${from}&to=${to}`, { headers: authHeader() });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    if (res.ok) setSlots(await res.json());
    setSlotsLoaded(true);
  }, [year, month, handleUnauthorized]);

  // KPI 稼働率用に「実際の今月」のスロットも取得
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

  // 定休日設定の取得。失敗時は DEFAULT_CLOSED_DAYS のまま。
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", { headers: authHeader() });
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.closed_days)) setClosedDays(json.closed_days);
      if (json.info) setSettingsInfo(json.info);
    } catch {
      // フォールバック（日・月）のまま
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    loadMonthSlots();
  }, [loadMonthSlots]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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

  const getSlot = useCallback(
    (dateStr: string, time: string) => slots.find((s) => s.date === dateStr && s.time_slot === time),
    [slots]
  );
  const slotsForDate = useCallback(
    (dateStr: string) => slots.filter((s) => s.date === dateStr),
    [slots]
  );

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

  // 選択日から1週間（定休日を除く）の未設定枠を一括追加
  async function openWeek() {
    if (!selectedDate) return;
    setSaving(true);
    const base = new Date(selectedDate + "T00:00:00");
    const tasks: Promise<Response>[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      if (closedDays.includes(d.getDay())) continue;
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

  // 表示中の月の営業日（定休日を除く）の全枠を公開
  async function openMonth() {
    const label = `${year}年${month + 1}月`;
    if (!confirm(`${label}の営業日（定休日を除く）の全枠を公開します。よろしいですか？`)) return;
    setSaving(true);
    const tasks: Promise<Response>[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = padDay(d);
      if (closedDays.includes(new Date(dateStr + "T00:00:00").getDay())) continue;
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
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: authHeader(),
      body: JSON.stringify({ id, status }),
    });
    const updated: (BookingRow & { warning?: string }) | null = res.ok
      ? await res.json().catch(() => null)
      : null;
    showToast(
      status === "confirmed"
        ? "予約を確定し、確定メールを送信しました"
        : status === "cancelled"
          ? "予約をキャンセルしました"
          : "予約を未確認に戻しました"
    );
    await loadBookings();
    if (updated) {
      setSelectedBooking((prev) => (prev?.id === id ? updated : prev));
    }
  }

  // ホームの要対応キューからのワンタップ操作
  async function quickStatus(id: string, status: BookingStatus) {
    if (status === "cancelled" && !confirm("この予約をキャンセルしますか？")) return;
    setActingId(id);
    try {
      await updateBookingStatus(id, status);
    } finally {
      setActingId(null);
    }
  }

  // 設定: 定休日の保存
  async function saveClosedDays(days: number[]) {
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ closed_days: days }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.closed_days)) setClosedDays(json.closed_days);
        showToast("定休日を保存しました");
      } else {
        const json = await res.json().catch(() => null);
        showToast(json?.error ?? "保存に失敗しました");
      }
    } catch {
      showToast("保存に失敗しました");
    } finally {
      setSettingsSaving(false);
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
        <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 whitespace-nowrap rounded bg-deep-green px-5 py-3 text-sm shadow-lg sm:left-auto sm:right-5 sm:translate-x-0">
          {toast}
        </div>
      )}

      {/* モバイル: 薄いヘッダー（ロゴ + ログアウトのみ） */}
      <header className="sticky top-0 z-30 border-b border-cream/10 bg-charcoal-light lg:hidden">
        <div className="flex h-12 items-center justify-between px-4">
          <span className="font-[family-name:var(--font-heading)] text-base">円茶会</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 p-2 text-sm text-cream/40 transition-colors hover:text-cream"
            aria-label="ログアウト"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* PC: 左サイドバー */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-cream/10 bg-charcoal-light lg:flex">
        <div className="border-b border-cream/10 px-5 py-5">
          <p className="font-[family-name:var(--font-heading)] text-xl">円茶会</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-cream/35">管理画面</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors ${
                tab === id ? "bg-clay/15 text-clay" : "text-cream/55 hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <Icon size={17} />
              <span className="flex-1 text-left">{label}</span>
              {id === "bookings" && pendingCount > 0 && (
                <span className="rounded-full bg-clay px-1.5 py-0.5 text-[10px] font-bold text-charcoal">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-cream/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-cream/40 transition-colors hover:bg-cream/5 hover:text-cream"
          >
            <LogOut size={16} /> ログアウト
          </button>
        </div>
      </aside>

      {/* コンテンツ */}
      <div className="lg:pl-56">
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 lg:max-w-6xl lg:px-8 lg:pb-12 lg:pt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-cream/40">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-cream/15 border-t-clay" />
              <p className="text-sm">読み込み中…</p>
            </div>
          ) : (
            <>
              {tab === "home" && (
                <HomeView
                  bookings={bookings}
                  monthSlots={monthSlots}
                  onOpenBooking={setSelectedBooking}
                  onQuickStatus={quickStatus}
                  actingId={actingId}
                />
              )}

              {tab === "calendar" && (
                <CalendarView
                  year={year}
                  month={month}
                  firstDay={firstDay}
                  daysInMonth={daysInMonth}
                  todayStr={todayStr}
                  closedDays={closedDays}
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

              {tab === "settings" && (
                <SettingsView
                  closedDays={closedDays}
                  onSaveClosedDays={saveClosedDays}
                  saving={settingsSaving}
                  info={settingsInfo}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* モバイル: 下部固定タブバー */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cream/10 bg-charcoal-light pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid grid-cols-4">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex flex-col items-center gap-1 py-2.5 transition-colors ${
                tab === id ? "text-clay" : "text-cream/40 hover:text-cream/70"
              }`}
              aria-label={label}
            >
              <span className="relative">
                <Icon size={20} />
                {id === "bookings" && pendingCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[9px] font-bold text-charcoal">
                    {pendingCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 予約詳細ドロワー */}
      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={(status) => updateBookingStatus(selectedBooking.id, status)}
        />
      )}
    </div>
  );
}
