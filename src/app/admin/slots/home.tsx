"use client";

// ホーム（今日ビュー）: 挨拶行・要対応キュー（インライン確定/キャンセル）・
// 今日明日のタイムライン・KPI・月次推移チャート（折りたたみ可）
import { useMemo, useState } from "react";
import { type Slot } from "@/lib/db";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Gauge,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  type BookingRow,
  type BookingStatus,
  DAYS_JA,
  DietaryIcon,
  StatusBadge,
  formatShortDateJa,
  isActiveBooking,
  planPrices,
  planShortLabel,
  toDateStr,
} from "./components";

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  x.setDate(x.getDate() - (day === 0 ? 6 : day - 1));
  return x;
}

export function HomeView({
  bookings,
  monthSlots,
  onOpenBooking,
  onQuickStatus,
  actingId,
}: {
  bookings: BookingRow[];
  monthSlots: Slot[]; // 今月（実カレンダー月）のスロット
  onOpenBooking: (b: BookingRow) => void;
  onQuickStatus: (id: string, status: BookingStatus) => Promise<void>;
  actingId: string | null;
}) {
  const [chartOpen, setChartOpen] = useState(false);

  const data = useMemo(() => {
    const now = new Date();
    const todayStr = toDateStr(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = toDateStr(tomorrow);
    const weekStart = startOfWeek(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const weekEndStr = toDateStr(weekEnd);
    const in3days = new Date(now);
    in3days.setDate(now.getDate() + 3);
    const in3daysStr = toDateStr(in3days);
    const monthPrefix = todayStr.slice(0, 7); // "YYYY-MM"

    let thisWeekCount = 0;
    let thisMonthCount = 0;
    let monthRevenueJpy = 0;
    let monthRevenueUsd = 0;
    let monthPaidJpy = 0; // うち Stripe 支払済
    const pendingQueue: BookingRow[] = []; // 全ての未確認予約
    const todayRows: BookingRow[] = [];
    const tomorrowRows: BookingRow[] = [];

    for (const b of bookings) {
      if (b.status === "pending") pendingQueue.push(b);
      const date = b.available_slots?.date;
      if (!date) continue;

      if (b.status !== "cancelled") {
        if (date >= toDateStr(weekStart) && date < weekEndStr) thisWeekCount++;
        if (date === todayStr) todayRows.push(b);
        else if (date === tomorrowStr) tomorrowRows.push(b);
      }
      if (b.status === "confirmed" && date.startsWith(monthPrefix)) {
        const { jpy, usd } = planPrices(b.plan);
        thisMonthCount++;
        monthRevenueJpy += jpy * b.guests;
        monthRevenueUsd += usd * b.guests;
        if (b.payment_status === "paid") monthPaidJpy += jpy * b.guests;
      }
    }

    // 未確認は開催日昇順（開催日不明は最後）
    pendingQueue.sort((a, b) =>
      (a.available_slots?.date ?? "9999") + (a.available_slots?.time_slot ?? "") >
      (b.available_slots?.date ?? "9999") + (b.available_slots?.time_slot ?? "")
        ? 1
        : -1
    );
    const byTime = (a: BookingRow, x: BookingRow) =>
      a.available_slots!.time_slot.localeCompare(x.available_slots!.time_slot);
    todayRows.sort(byTime);
    tomorrowRows.sort(byTime);

    // ── 月次推移（直近6ヶ月・確定予約） ──
    const months: { key: string; label: string; count: number; revenueJpy: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: `${d.getMonth() + 1}月`,
        count: 0,
        revenueJpy: 0,
      });
    }
    const monthMap = new Map(months.map((m) => [m.key, m]));
    for (const b of bookings) {
      if (b.status !== "confirmed" || !b.available_slots) continue;
      const m = monthMap.get(b.available_slots.date.slice(0, 7));
      if (!m) continue;
      m.count++;
      m.revenueJpy += planPrices(b.plan).jpy * b.guests;
    }

    // ── 今月の稼働率 ──
    const activeSlotIds = new Set(
      bookings
        .filter((b) => isActiveBooking(b) && b.available_slots?.date.startsWith(monthPrefix))
        .map((b) => b.slot_id)
    );
    const bookedSlotCount = monthSlots.filter((s) => activeSlotIds.has(s.id)).length;
    // 分母 = 公開中 or 予約済みの枠（予約後に非公開へ切り替えた枠も含める）
    const relevantCount = monthSlots.filter((s) => s.is_open || activeSlotIds.has(s.id)).length;
    const occupancy = relevantCount === 0 ? 0 : Math.round((bookedSlotCount / relevantCount) * 100);

    return {
      now,
      todayStr,
      in3daysStr,
      thisWeekCount,
      thisMonthCount,
      monthRevenueJpy,
      monthRevenueUsd,
      monthPaidJpy,
      pendingQueue,
      todayRows,
      tomorrowRows,
      months,
      occupancy,
      bookedSlotCount,
      relevantCount,
    };
  }, [bookings, monthSlots]);

  const d = data.now;
  const heading = `${d.getMonth() + 1}月${d.getDate()}日(${DAYS_JA[d.getDay()]}) 今日の茶会`;

  return (
    <div className="space-y-7">
      {/* 挨拶行 */}
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl">{heading}</h2>
        <p className="mt-1 text-sm text-cream/50">
          {data.todayRows.length > 0
            ? `本日は ${data.todayRows.length} 組・${data.todayRows.reduce((n, b) => n + b.guests, 0)} 名のお客様をお迎えします。`
            : "本日の予定はありません。ゆっくりお過ごしください。"}
        </p>
      </div>

      {/* 要対応キュー */}
      <section>
        <h3 className="mb-2.5 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-clay">
          <AlertTriangle size={15} />
          要対応
          {data.pendingQueue.length > 0 && (
            <span className="rounded-full bg-clay/20 px-2 py-0.5 text-[11px] font-bold text-clay">
              {data.pendingQueue.length}
            </span>
          )}
        </h3>
        {data.pendingQueue.length === 0 ? (
          <div className="flex items-center gap-2.5 rounded border border-deep-green/40 bg-deep-green/10 px-4 py-3.5 text-sm text-green-300">
            <CheckCircle2 size={17} />
            すべて対応済みです
          </div>
        ) : (
          <ul className="space-y-2">
            {data.pendingQueue.map((b) => {
              const date = b.available_slots?.date;
              const urgent = !!date && date <= data.in3daysStr; // 3日以内（過去含む）は警告色
              const busy = actingId === b.id;
              return (
                <li
                  key={b.id}
                  className={`rounded border p-3 ${
                    urgent ? "border-clay/50 bg-clay/10" : "border-cream/10 bg-charcoal-light"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <button
                      onClick={() => onOpenBooking(b)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="truncate text-sm font-medium">{b.name}</span>
                        <DietaryIcon dietary={b.dietary} />
                        {urgent && (
                          <span className="rounded bg-clay/25 px-1.5 py-0.5 text-[10px] font-medium text-clay">
                            開催間近
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-cream/55">
                        {b.available_slots
                          ? `${formatShortDateJa(b.available_slots.date)} ${b.available_slots.time_slot}`
                          : "開催日未定"}{" "}
                        ・ {b.guests}名 ・ {planShortLabel(b.plan)}
                      </span>
                    </button>
                    {/* ワンタップ確定/キャンセル */}
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => onQuickStatus(b.id, "confirmed")}
                        disabled={busy}
                        className="flex items-center gap-1 rounded border border-deep-green bg-deep-green/40 px-3 py-2 text-xs font-medium transition-colors hover:bg-deep-green/60 disabled:opacity-50"
                      >
                        <Check size={13} /> {busy ? "処理中…" : "確定"}
                      </button>
                      <button
                        onClick={() => onQuickStatus(b.id, "cancelled")}
                        disabled={busy}
                        className="flex items-center gap-1 rounded border border-red-400/40 px-3 py-2 text-xs text-red-300 transition-colors hover:bg-red-400/10 disabled:opacity-50"
                      >
                        <X size={13} /> キャンセル
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 今日・明日の予定（タイムライン） */}
      <section>
        <h3 className="mb-2.5 text-sm font-medium uppercase tracking-[0.15em] text-clay">
          今日・明日の予定
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <DayTimeline title="今日" rows={data.todayRows} onOpen={onOpenBooking} emphasize />
          <DayTimeline title="明日" rows={data.tomorrowRows} onOpen={onOpenBooking} />
        </div>
      </section>

      {/* KPI 行 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users size={15} />}
          label="今月の確定"
          value={`${data.thisMonthCount}件`}
        />
        <StatCard
          icon={<TrendingUp size={15} />}
          label="今月の売上"
          value={`¥${data.monthRevenueJpy.toLocaleString()}`}
          sub={`$${data.monthRevenueUsd.toLocaleString()} ・ うち支払済 ¥${data.monthPaidJpy.toLocaleString()}`}
        />
        <StatCard
          icon={<Calendar size={15} />}
          label="今週の予約"
          value={`${data.thisWeekCount}件`}
        />
        <StatCard
          icon={<Gauge size={15} />}
          label="今月の稼働率"
          value={`${data.occupancy}%`}
          sub={`予約済 ${data.bookedSlotCount} / 対象 ${data.relevantCount} 枠`}
        />
      </div>

      {/* 月次推移チャート（折りたたみ可） */}
      <section className="overflow-hidden rounded border border-cream/10 bg-charcoal-light">
        <button
          onClick={() => setChartOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3.5 text-left sm:px-5"
        >
          <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-cream/40">
            <BarChart3 size={16} className="text-clay" />
            月次推移（直近6ヶ月・確定予約）
          </span>
          <ChevronDown
            size={16}
            className={`text-cream/40 transition-transform ${chartOpen ? "rotate-180" : ""}`}
          />
        </button>
        {chartOpen && (
          <div className="border-t border-cream/10 p-4 sm:p-5">
            <MonthlyChart months={data.months} />
          </div>
        )}
      </section>
    </div>
  );
}

// ── 今日/明日タイムライン ─────────────────────────────────────────────────────

function DayTimeline({
  title,
  rows,
  onOpen,
  emphasize = false,
}: {
  title: string;
  rows: BookingRow[];
  onOpen: (b: BookingRow) => void;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded border border-cream/10 bg-charcoal-light p-4">
      <h4
        className={`mb-3 flex items-baseline gap-2 text-sm font-medium ${
          emphasize ? "text-clay" : "text-cream/60"
        }`}
      >
        {title}
        <span className="text-xs font-normal text-cream/35">
          {rows.length > 0
            ? `${rows.length}組 ・ ${rows.reduce((n, b) => n + b.guests, 0)}名`
            : ""}
        </span>
      </h4>
      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-cream/25">予定なし</p>
      ) : (
        <ol className="relative ml-1 space-y-2.5 border-l border-cream/15 pl-4">
          {rows.map((b) => (
            <li key={b.id} className="relative">
              <span className="absolute -left-[21px] top-3 h-2 w-2 rounded-full bg-clay" />
              <button
                onClick={() => onOpen(b)}
                className="flex w-full items-center gap-3 rounded border border-cream/10 bg-charcoal px-3 py-2.5 text-left transition-colors hover:border-clay/40"
              >
                <span className="w-11 shrink-0 font-[family-name:var(--font-heading)] text-sm text-clay">
                  {b.available_slots!.time_slot}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate text-sm font-medium">{b.name}</span>
                    <DietaryIcon dietary={b.dietary} />
                  </span>
                  <span className="mt-0.5 block text-xs text-cream/50">
                    {b.guests}名 ・ {planShortLabel(b.plan)}
                  </span>
                </span>
                <StatusBadge status={b.status} />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ── KPI カード ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded border border-cream/10 bg-charcoal-light p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-cream/40">
        <span className="text-clay">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 font-[family-name:var(--font-heading)] text-2xl text-cream">{value}</p>
      {sub && <p className="mt-1 text-xs text-cream/40">{sub}</p>}
    </div>
  );
}

// ── 月次推移チャート（純CSS棒グラフ・ライブラリ不使用） ────────────────────────

function MonthlyChart({
  months,
}: {
  months: { key: string; label: string; count: number; revenueJpy: number }[];
}) {
  const maxRevenue = Math.max(...months.map((m) => m.revenueJpy), 1);
  const maxCount = Math.max(...months.map((m) => m.count), 1);
  const H = 120; // バー最大高さ(px)

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-3 text-[10px] text-cream/45">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-clay" /> 売上(¥)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-deep-green-light" /> 予約数
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[420px] items-end gap-2 sm:gap-3">
          {months.map((m) => (
            <div key={m.key} className="flex flex-1 flex-col items-center gap-1.5">
              {/* 値ラベル */}
              <div className="text-center leading-tight">
                <p className="text-[10px] text-clay">
                  {m.revenueJpy > 0 ? `¥${(m.revenueJpy / 10000).toLocaleString()}万` : "—"}
                </p>
                <p className="text-[10px] text-green-300/80">{m.count > 0 ? `${m.count}件` : ""}</p>
              </div>
              {/* バー */}
              <div className="flex w-full items-end justify-center gap-1" style={{ height: H }}>
                <div
                  className="w-4 rounded-t-sm bg-clay/85 sm:w-5"
                  style={{
                    height: Math.max((m.revenueJpy / maxRevenue) * H, m.revenueJpy > 0 ? 4 : 2),
                  }}
                  title={`売上 ¥${m.revenueJpy.toLocaleString()}`}
                />
                <div
                  className="w-4 rounded-t-sm bg-deep-green-light/85 sm:w-5"
                  style={{ height: Math.max((m.count / maxCount) * H, m.count > 0 ? 4 : 2) }}
                  title={`確定予約 ${m.count}件`}
                />
              </div>
              <p className="border-t border-cream/10 pt-1 text-[11px] text-cream/50">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
