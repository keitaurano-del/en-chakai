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
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => (view === "month" ? setCalendarMonth(new Date(year, month - 1, 1)) : moveWeek(-7))}
              className="wa-btn wa-btn-ghost h-10 w-10 rounded-lg"
              aria-label={view === "month" ? "前の月" : "前の週"}
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="wa-serif wa-num min-w-0 px-1 text-lg font-medium sm:text-xl">
              {view === "month" ? `${year}年${month + 1}月` : weekLabel}
            </h2>
            <button
              onClick={() => (view === "month" ? setCalendarMonth(new Date(year, month + 1, 1)) : moveWeek(7))}
              className="wa-btn wa-btn-ghost h-10 w-10 rounded-lg"
              aria-label={view === "month" ? "次の月" : "次の週"}
            >
              <ChevronRight size={16} />
            </button>
            <button onClick={goToday} className="wa-btn wa-btn-ghost px-3 py-2 text-xs">
              今日
            </button>
          </div>

          {/* セグメントコントロール */}
          <div className="flex rounded-lg border border-line bg-shiro p-1">
            {(["month", "week"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchView(m)}
                className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                  view === m
                    ? "bg-sumi text-washi shadow-sm"
                    : "text-sumi-mid hover:text-sumi"
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
        <div className="mt-3.5 flex flex-wrap gap-4 text-xs text-sumi-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-kin" /> 公開中
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-matcha" /> 予約あり
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sumi/20" /> 非公開
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm ring-1 ring-shu" /> 今日
          </span>
          {closedLabel && <span>{closedLabel}は定休日</span>}
        </div>

        {/* 一括操作 */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={openMonth}
            disabled={saving}
            className="wa-btn wa-btn-matcha px-4 py-2.5 text-[13px]"
          >
            <CalendarCheck size={14} />
            {month + 1}月の営業日を全枠公開
          </button>
          {selectedDate && (
            <button
              onClick={openWeek}
              disabled={saving}
              className="wa-btn wa-btn-ghost px-4 py-2.5 text-[13px]"
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
          <div className="wa-card overflow-hidden">
            <div className="border-b border-line bg-washi/60 px-5 py-4">
              <p className="wa-label">選択中の日付</p>
              <p className="wa-serif wa-num mt-1 text-base font-medium">
                {formatDateDisplay(selectedDate)}
              </p>
            </div>
            <SlotEditor selectedDate={selectedDate} {...editorProps} />
          </div>
        ) : (
          <div className="flex h-52 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-sumi/20 text-sm text-sumi-soft">
            <Calendar size={24} className="text-sumi-soft/60" />
            <p>カレンダーで日付を選択</p>
          </div>
        )}
      </div>

      {/* モバイル: ボトムシート */}
      {selectedDate && (
        <div className="fixed inset-x-0 bottom-0 z-[45] lg:hidden">
          <div className="wa-shadow-lg mx-auto max-h-[70vh] max-w-lg overflow-y-auto rounded-t-2xl border-x border-t border-line bg-shiro pb-[env(safe-area-inset-bottom)]">
            <div className="sticky top-0 z-10 border-b border-line bg-shiro/95 backdrop-blur">
              <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-sumi/15" aria-hidden />
              <div className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="wa-label">選択中の日付</p>
                  <p className="wa-serif wa-num mt-0.5 text-base font-medium">
                    {formatDateDisplay(selectedDate)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sumi-soft transition-colors hover:bg-washi-deep/70 hover:text-sumi"
                  aria-label="閉じる"
                >
                  <X size={18} />
                </button>
              </div>
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
    <div className="wa-card overflow-hidden rounded-xl">
      <div className="grid grid-cols-7 border-b border-line bg-washi/60">
        {DAYS_JA.map((d, i) => (
          <div
            key={d}
            className={`py-2.5 text-center text-xs font-medium ${
              i === 0 ? "text-shu" : i === 6 ? "text-matcha-deep" : "text-sumi-soft"
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
            className="min-h-[76px] border-b border-r border-line/60 bg-washi/50"
          />
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
              className={`min-h-[76px] border-b border-r border-line/60 p-1.5 text-left transition-colors sm:p-2 ${
                isSelected
                  ? "bg-matcha-mist"
                  : isClosed
                    ? "cursor-default bg-washi/70"
                    : "hover:bg-washi-deep/40"
              } ${isToday ? "ring-1 ring-inset ring-shu" : ""}`}
            >
              <div className="flex items-baseline justify-between gap-1">
                <span
                  className={`wa-serif wa-num text-sm font-medium ${
                    isToday
                      ? "text-shu-deep"
                      : isClosed
                        ? "text-sumi/25"
                        : isSun
                          ? "text-shu"
                          : "text-sumi"
                  }`}
                >
                  {d}
                </span>
                {dayGuests > 0 && (
                  <span className="wa-num rounded bg-matcha-deep px-1 text-[10px] font-medium leading-4 text-white">
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
                            booked ? "bg-matcha" : s.is_open ? "bg-kin" : "bg-sumi/20"
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
    <div className="wa-card overflow-x-auto rounded-xl">
      <div className="min-w-[720px]">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-line bg-washi/60">
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
                className={`border-l border-line/60 px-1 py-2 text-center transition-colors ${
                  isSelected ? "bg-matcha-mist" : closed ? "cursor-default" : "hover:bg-washi-deep/40"
                }`}
              >
                <p
                  className={`text-[11px] ${
                    closed ? "text-sumi/25" : d.getDay() === 0 ? "text-shu" : "text-sumi-soft"
                  }`}
                >
                  {DAYS_JA[d.getDay()]}
                </p>
                <p
                  className={`wa-serif wa-num mt-0.5 text-sm font-medium ${
                    isToday
                      ? "inline-block rounded bg-shu px-1.5 text-white"
                      : closed
                        ? "text-sumi/25"
                        : "text-sumi"
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
          <div
            key={time}
            className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-line/60 last:border-b-0"
          >
            <div className="wa-serif wa-num flex items-start justify-center pt-2.5 text-xs font-medium text-sumi-mid">
              {time}
            </div>
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
                  className={`min-h-[64px] border-l border-line/60 p-1 text-left transition-colors ${
                    closed
                      ? "cursor-default bg-washi/70"
                      : isSelected
                        ? "bg-matcha-mist/70"
                        : "hover:bg-washi-deep/40"
                  }`}
                >
                  {closed ? (
                    <p className="mt-2 text-center text-[10px] text-sumi/20">定休</p>
                  ) : booked ? (
                    <div className="h-full rounded-md border border-matcha/35 bg-matcha-mist px-1.5 py-1">
                      <p className="wa-num text-[10px] font-medium text-matcha-deep">
                        {guests}名 / 4名{slot && !slot.is_open ? " ・非公開" : ""}
                      </p>
                      {slotBookings.map((b) => (
                        <p key={b.id} className="truncate text-[11px] text-sumi">
                          {b.name}
                          {b.status === "pending" && (
                            <span className="ml-1 font-medium text-shu">未確認</span>
                          )}
                        </p>
                      ))}
                    </div>
                  ) : slot?.is_open ? (
                    <div className="flex h-full items-center justify-center rounded-md border border-kin/30 bg-kin-mist/60">
                      <p className="flex items-center gap-1 text-[10px] font-medium text-kin">
                        <Eye size={10} /> 公開中
                      </p>
                    </div>
                  ) : slot ? (
                    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-sumi/15">
                      <p className="flex items-center gap-1 text-[10px] text-sumi-soft">
                        <EyeOff size={10} /> 非公開
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-center text-[10px] text-sumi/15">—</p>
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
    <div className="p-5">
      <p className="wa-label mb-3">時間スロット</p>
      <div className="space-y-2.5">
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
              className={`rounded-lg border px-3.5 py-3 ${
                hasBookings
                  ? "border-matcha/35 bg-matcha-mist/70"
                  : isOpen
                    ? "border-kin/35 bg-kin-mist/50"
                    : "border-line bg-white/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="wa-serif wa-num text-sm font-medium text-sumi">
                    {TIME_SLOT_LABELS[time]}
                  </p>
                  <p
                    className={`mt-0.5 text-xs ${
                      hasBookings
                        ? "text-matcha-deep"
                        : isOpen
                          ? "text-kin"
                          : exists
                            ? "text-sumi-soft"
                            : "text-sumi/30"
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
                    className={`wa-btn px-4 py-2 text-xs ${
                      isOpen ? "wa-btn-danger" : "wa-btn-matcha"
                    }`}
                  >
                    {!exists ? "追加" : isOpen ? "非公開" : "公開"}
                  </button>
                  {exists && (
                    <button
                      onClick={() => deleteSlot(selectedDate, time)}
                      disabled={saving || hasBookings}
                      title={hasBookings ? "予約が入っている枠は削除できません" : "削除"}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-sumi/30 transition-colors hover:bg-shu-mist hover:text-shu-deep disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-sumi/30"
                      aria-label="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* この枠の予約者 */}
              {hasBookings && (
                <ul className="mt-2 space-y-1 border-t border-matcha/20 pt-2">
                  {slotBookings.map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => onOpenBooking(b)}
                        className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/70"
                      >
                        <span className="min-w-0 truncate">
                          <span className="font-medium text-sumi">{b.name}</span>
                          <span className="ml-1.5 text-sumi-mid">{b.guests}名</span>
                          {b.status === "pending" && (
                            <span className="ml-1.5 font-medium text-shu">未確認</span>
                          )}
                        </span>
                        <span className="shrink-0 text-sumi-soft">詳細 →</span>
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
      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-4">
        <button
          onClick={() => openDay(selectedDate)}
          disabled={saving}
          className="wa-btn wa-btn-matcha px-3 py-2.5 text-xs"
        >
          <Eye size={14} /> この日を全枠公開
        </button>
        <button
          onClick={() => closeDay(selectedDate)}
          disabled={saving}
          className="wa-btn wa-btn-danger px-3 py-2.5 text-xs"
        >
          <EyeOff size={14} /> この日を全て非公開
        </button>
      </div>
    </div>
  );
}
