"use client";

// カレンダー: 月表示/週表示の切替・枠エディタ（PC右パネル/モバイルボトムシート）・
// 一括公開（この日/この週/この月・定休日設定を参照）
import { useState } from "react";
import { type Slot } from "@/lib/db";
import { TIME_SLOTS, TIME_SLOT_LABELS, formatDateDisplay } from "@/lib/booking";
import {
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { type BookingRow, DAYS_JA, toDateStr } from "./components";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// 日曜はじまりの週頭
function startOfWeekSun(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

type ViewMode = "month" | "week";

export function CalendarView(props: {
  year: number;
  month: number;
  firstDay: number;
  daysInMonth: number;
  todayStr: string;
  closedDays: number[];
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
    closedDays,
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

  const [view, setView] = useState<ViewMode>("month");
  const [weekStart, setWeekStart] = useState(() => startOfWeekSun(new Date()));

  const isClosedDate = (d: Date) => closedDays.includes(d.getDay());

  function moveWeek(deltaDays: number) {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + deltaDays);
    setWeekStart(next);
    // 週が別の月へ移ったらスロット取得範囲（親の月）も同期
    if (next.getFullYear() !== year || next.getMonth() !== month) {
      setCalendarMonth(startOfMonth(next));
    }
  }

  function goToday() {
    setCalendarMonth(startOfMonth(new Date()));
    setWeekStart(startOfWeekSun(new Date()));
  }

  // 週表示へ切替: 表示中の月と週がずれていたら、その月の週へ合わせる
  function switchView(mode: ViewMode) {
    if (mode === "week" && (weekStart.getFullYear() !== year || weekStart.getMonth() !== month)) {
      const today = new Date();
      const base =
        today.getFullYear() === year && today.getMonth() === month
          ? today
          : new Date(year, month, 1);
      setWeekStart(startOfWeekSun(base));
    }
    setView(mode);
  }

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const weekEnd = weekDates[6];
  const weekLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日〜${weekEnd.getDate()}日`
      : `${weekStart.getMonth() + 1}月${weekStart.getDate()}日〜${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;

  const closedLabel = closedDays.length > 0 ? closedDays.map((d) => DAYS_JA[d]).join("・") : null;

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
      <div>
        {/* ヘッダー: ナビゲーション + 月/週切替 */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => (view === "month" ? setCalendarMonth(new Date(year, month - 1, 1)) : moveWeek(-7))}
              className="flex h-10 w-10 items-center justify-center rounded border border-cream/10 text-cream transition-colors hover:border-clay"
              aria-label={view === "month" ? "前の月" : "前の週"}
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="min-w-0 font-[family-name:var(--font-heading)] text-lg sm:text-xl">
              {view === "month" ? `${year}年${month + 1}月` : weekLabel}
            </h2>
            <button
              onClick={() => (view === "month" ? setCalendarMonth(new Date(year, month + 1, 1)) : moveWeek(7))}
              className="flex h-10 w-10 items-center justify-center rounded border border-cream/10 text-cream transition-colors hover:border-clay"
              aria-label={view === "month" ? "次の月" : "次の週"}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={goToday}
              className="rounded border border-cream/15 px-3 py-1.5 text-xs text-cream/60 transition-colors hover:border-clay hover:text-clay"
            >
              今日
            </button>
          </div>

          {/* セグメントコントロール */}
          <div className="flex rounded border border-cream/15 p-0.5">
            {(["month", "week"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchView(m)}
                className={`rounded px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  view === m ? "bg-clay/20 text-clay" : "text-cream/45 hover:text-cream"
                }`}
              >
                {m === "month" ? "月" : "週"}
              </button>
            ))}
          </div>
        </div>

        {view === "month" ? (
          <MonthGrid
            year={year}
            month={month}
            firstDay={firstDay}
            daysInMonth={daysInMonth}
            todayStr={todayStr}
            padDay={padDay}
            isClosedDate={isClosedDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            slotsForDate={slotsForDate}
            bookingsBySlotId={bookingsBySlotId}
          />
        ) : (
          <WeekGrid
            weekDates={weekDates}
            todayStr={todayStr}
            isClosedDate={isClosedDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            getSlot={getSlot}
            bookingsBySlotId={bookingsBySlotId}
          />
        )}

        {/* 凡例 */}
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
          {closedLabel && <span>{closedLabel}は定休日</span>}
        </div>

        {/* 一括操作 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={openMonth}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded border border-deep-green px-4 py-2.5 text-sm text-green-300 transition-colors hover:bg-deep-green/20 disabled:opacity-50"
          >
            <CalendarCheck size={14} />
            {month + 1}月の営業日を全枠公開
          </button>
          {selectedDate && (
            <button
              onClick={openWeek}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded border border-deep-green px-4 py-2.5 text-sm text-green-300 transition-colors hover:bg-deep-green/20 disabled:opacity-50"
            >
              <Plus size={14} />
              {selectedDate} から1週間を一括公開
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
            <p>カレンダーで日付を選択</p>
          </div>
        )}
      </div>

      {/* モバイル: ボトムシート */}
      {selectedDate && (
        <div className="fixed inset-x-0 bottom-0 z-[45] lg:hidden">
          <div className="mx-auto max-h-[70vh] max-w-lg overflow-y-auto rounded-t-xl border-x border-t border-cream/15 bg-charcoal-light pb-[env(safe-area-inset-bottom)] shadow-2xl">
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

// ── 月グリッド ────────────────────────────────────────────────────────────────

function MonthGrid({
  firstDay,
  daysInMonth,
  todayStr,
  padDay,
  isClosedDate,
  selectedDate,
  setSelectedDate,
  slotsForDate,
  bookingsBySlotId,
}: {
  year: number;
  month: number;
  firstDay: number;
  daysInMonth: number;
  todayStr: string;
  padDay: (d: number) => string;
  isClosedDate: (d: Date) => boolean;
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
  slotsForDate: (s: string) => Slot[];
  bookingsBySlotId: Map<string, BookingRow[]>;
}) {
  return (
    <div className="overflow-hidden rounded border border-cream/10">
      <div className="grid grid-cols-7 border-b border-cream/10 bg-charcoal-light">
        {DAYS_JA.map((d, i) => (
          <div
            key={d}
            className={`py-2.5 text-center text-xs font-medium ${
              i === 0 ? "text-red-400" : i === 6 ? "text-sky-300/70" : "text-cream/40"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[76px] border-b border-r border-cream/5 bg-black/10" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const dateStr = padDay(d);
          const dateObj = new Date(dateStr + "T00:00:00");
          const isClosed = isClosedDate(dateObj);
          const isSun = dateObj.getDay() === 0;
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          const daySlots = slotsForDate(dateStr);
          const dayGuests = daySlots.reduce(
            (n, s) => n + (bookingsBySlotId.get(s.id) ?? []).reduce((m, b) => m + b.guests, 0),
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
  );
}

// ── 週グリッド（3枠 × 7日・タイムライン型・モバイルは横スクロール） ──────────

function WeekGrid({
  weekDates,
  todayStr,
  isClosedDate,
  selectedDate,
  setSelectedDate,
  getSlot,
  bookingsBySlotId,
}: {
  weekDates: Date[];
  todayStr: string;
  isClosedDate: (d: Date) => boolean;
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
  getSlot: (s: string, t: string) => Slot | undefined;
  bookingsBySlotId: Map<string, BookingRow[]>;
}) {
  return (
    <div className="overflow-x-auto rounded border border-cream/10">
      <div className="min-w-[720px]">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-cream/10 bg-charcoal-light">
          <div />
          {weekDates.map((d) => {
            const dateStr = toDateStr(d);
            const isToday = dateStr === todayStr;
            const closed = isClosedDate(d);
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => !closed && setSelectedDate(isSelected ? null : dateStr)}
                disabled={closed}
                className={`border-l border-cream/5 px-1 py-2 text-center transition-colors ${
                  isSelected ? "bg-deep-green/25" : closed ? "cursor-default" : "hover:bg-deep-green/10"
                }`}
              >
                <p
                  className={`text-[11px] ${
                    closed ? "text-cream/20" : d.getDay() === 0 ? "text-red-400" : "text-cream/40"
                  }`}
                >
                  {DAYS_JA[d.getDay()]}
                </p>
                <p
                  className={`mt-0.5 text-sm font-medium ${
                    isToday ? "inline-block rounded bg-clay/20 px-1.5 text-clay" : closed ? "text-cream/20" : "text-cream/80"
                  }`}
                >
                  {d.getDate()}
                </p>
              </button>
            );
          })}
        </div>

        {/* 3枠 × 7日 */}
        {TIME_SLOTS.map((time) => (
          <div key={time} className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-cream/5 last:border-b-0">
            <div className="flex items-start justify-center pt-2.5 text-xs text-clay">{time}</div>
            {weekDates.map((d) => {
              const dateStr = toDateStr(d);
              const closed = isClosedDate(d);
              const slot = getSlot(dateStr, time);
              const slotBookings = slot ? bookingsBySlotId.get(slot.id) ?? [] : [];
              const booked = slotBookings.length > 0;
              const guests = slotBookings.reduce((n, b) => n + b.guests, 0);
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => !closed && setSelectedDate(isSelected ? null : dateStr)}
                  disabled={closed}
                  title={closed ? "定休日" : `${dateStr} ${time}`}
                  className={`min-h-[64px] border-l border-cream/5 p-1 text-left transition-colors ${
                    closed
                      ? "cursor-default bg-black/15"
                      : isSelected
                        ? "bg-deep-green/20"
                        : "hover:bg-deep-green/10"
                  }`}
                >
                  {closed ? (
                    <p className="mt-2 text-center text-[10px] text-cream/15">定休</p>
                  ) : booked ? (
                    <div className="h-full rounded border border-deep-green-light/40 bg-deep-green/25 px-1.5 py-1">
                      <p className="text-[10px] font-medium text-green-300">
                        {guests}名 / 4名{slot && !slot.is_open ? " ・非公開" : ""}
                      </p>
                      {slotBookings.map((b) => (
                        <p key={b.id} className="truncate text-[11px] text-cream/85">
                          {b.name}
                          {b.status === "pending" && <span className="ml-1 text-clay">未確認</span>}
                        </p>
                      ))}
                    </div>
                  ) : slot?.is_open ? (
                    <div className="flex h-full items-center justify-center rounded border border-clay/25 bg-clay/5">
                      <p className="flex items-center gap-1 text-[10px] text-clay">
                        <Eye size={10} /> 公開中
                      </p>
                    </div>
                  ) : slot ? (
                    <div className="flex h-full items-center justify-center rounded border border-cream/10">
                      <p className="flex items-center gap-1 text-[10px] text-cream/30">
                        <EyeOff size={10} /> 非公開
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-center text-[10px] text-cream/15">—</p>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 選択日の時間枠エディタ（右パネル / モバイルボトムシート共通） ────────────

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
                          {b.status === "pending" && <span className="ml-1.5 text-clay">未確認</span>}
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
