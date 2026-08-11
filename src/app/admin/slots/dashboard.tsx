"use client";

// ダッシュボードタブ: KPI・月次推移チャート・稼働状況・直近予定・要対応アラート
import { useMemo } from "react";
import { type Slot } from "@/lib/db";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  type BookingRow,
  StatusBadge,
  DietaryIcon,
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

export function Dashboard({
  bookings,
  monthSlots,
  onOpenBooking,
}: {
  bookings: BookingRow[];
  monthSlots: Slot[]; // 今月（実カレンダー月）のスロット
  onOpenBooking: (b: BookingRow) => void;
}) {
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

    // ── KPI ──
    let pending = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;
    let monthRevenueJpy = 0;
    let monthRevenueUsd = 0;
    let monthPaidJpy = 0; // うち Stripe 支払済
    const urgent: BookingRow[] = []; // 3日以内の未確認予約
    const todayRows: BookingRow[] = [];
    const tomorrowRows: BookingRow[] = [];
    const weekRows: BookingRow[] = [];

    for (const b of bookings) {
      if (b.status === "pending") pending++;
      const date = b.available_slots?.date;
      if (!date) continue;

      if (b.status === "pending" && date >= todayStr && date <= in3daysStr) urgent.push(b);

      if (b.status !== "cancelled") {
        if (date >= toDateStr(weekStart) && date < weekEndStr) thisWeekCount++;
        if (date === todayStr) todayRows.push(b);
        else if (date === tomorrowStr) tomorrowRows.push(b);
        else if (date > tomorrowStr && date < weekEndStr) weekRows.push(b);
      }
      if (b.status === "confirmed" && date.startsWith(monthPrefix)) {
        const { jpy, usd } = planPrices(b.plan);
        thisMonthCount++;
        monthRevenueJpy += jpy * b.guests;
        monthRevenueUsd += usd * b.guests;
        if (b.payment_status === "paid") monthPaidJpy += jpy * b.guests;
      }
    }

    const byDateTime = (a: BookingRow, x: BookingRow) => {
      const da = a.available_slots!.date + a.available_slots!.time_slot;
      const dx = x.available_slots!.date + x.available_slots!.time_slot;
      return da.localeCompare(dx);
    };
    todayRows.sort(byDateTime);
    tomorrowRows.sort(byDateTime);
    weekRows.sort(byDateTime);
    urgent.sort(byDateTime);

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

    // ── 今月の稼働状況 ──
    const openSlots = monthSlots.filter((s) => s.is_open);
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
      pending,
      thisWeekCount,
      thisMonthCount,
      monthRevenueJpy,
      monthRevenueUsd,
      monthPaidJpy,
      urgent,
      todayRows,
      tomorrowRows,
      weekRows,
      months,
      openSlotCount: openSlots.length,
      bookedSlotCount,
      occupancy,
      monthLabel: `${now.getMonth() + 1}月`,
    };
  }, [bookings, monthSlots]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">ダッシュボード</h2>
        <p className="mt-1 text-sm text-cream/50">予約状況のサマリーと今後の予定。</p>
      </div>

      {/* 要対応アラート */}
      {data.urgent.length > 0 && (
        <div className="rounded border border-clay/50 bg-clay/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-clay">
            <AlertTriangle size={16} />
            要対応: 開催が近い未確認予約が {data.urgent.length} 件あります
          </div>
          <ul className="mt-3 space-y-1.5">
            {data.urgent.map((b) => (
              <li key={b.id}>
                <button
                  onClick={() => onOpenBooking(b)}
                  className="flex w-full items-center justify-between gap-3 rounded border border-clay/30 bg-charcoal/60 px-3 py-2 text-left text-sm transition-colors hover:border-clay"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{b.name}</span>
                    <span className="ml-2 text-cream/60">
                      {formatShortDateJa(b.available_slots!.date)} {b.available_slots!.time_slot} ・{" "}
                      {b.guests}名
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-clay">確認する →</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI カード */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Clock size={16} />}
          label="未確認の予約"
          value={data.pending.toString()}
          tone={data.pending > 0 ? "warn" : "muted"}
        />
        <StatCard
          icon={<Calendar size={16} />}
          label="今週の予約"
          value={data.thisWeekCount.toString()}
        />
        <StatCard
          icon={<Users size={16} />}
          label="今月の確定予約"
          value={data.thisMonthCount.toString()}
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="今月の売上（確定）"
          value={`¥${data.monthRevenueJpy.toLocaleString()}`}
          sub={`$${data.monthRevenueUsd.toLocaleString()} ・ うち支払済 ¥${data.monthPaidJpy.toLocaleString()}`}
        />
      </div>

      {/* チャート + 稼働状況 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <MonthlyChart months={data.months} />
        <OccupancyCard
          monthLabel={data.monthLabel}
          openCount={data.openSlotCount}
          bookedCount={data.bookedSlotCount}
          occupancy={data.occupancy}
        />
      </div>

      {/* 直近予定 */}
      <div>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.15em] text-clay">
          直近の予定
        </h3>
        <div className="space-y-5">
          <ScheduleSection title="今日" rows={data.todayRows} onOpen={onOpenBooking} emphasize />
          <ScheduleSection title="明日" rows={data.tomorrowRows} onOpen={onOpenBooking} />
          <ScheduleSection title="今週（それ以降）" rows={data.weekRows} onOpen={onOpenBooking} />
        </div>
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
  const accent = tone === "warn" ? "text-clay" : tone === "muted" ? "text-cream/60" : "text-cream";
  return (
    <div className="rounded border border-cream/10 bg-charcoal-light p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-cream/40">
        <span className="text-clay">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className={`mt-2.5 font-[family-name:var(--font-heading)] text-2xl sm:text-3xl ${accent}`}>
        {value}
      </p>
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
    <div className="rounded border border-cream/10 bg-charcoal-light p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-cream/40">
          <BarChart3 size={16} className="text-clay" />
          月次推移（直近6ヶ月・確定予約）
        </div>
        <div className="flex items-center gap-3 text-[10px] text-cream/45">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-clay" /> 売上(¥)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-deep-green-light" /> 予約数
          </span>
        </div>
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
                  style={{ height: Math.max((m.revenueJpy / maxRevenue) * H, m.revenueJpy > 0 ? 4 : 2) }}
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

// ── 今月の稼働状況 ────────────────────────────────────────────────────────────

function OccupancyCard({
  monthLabel,
  openCount,
  bookedCount,
  occupancy,
}: {
  monthLabel: string;
  openCount: number;
  bookedCount: number;
  occupancy: number;
}) {
  return (
    <div className="flex flex-col rounded border border-cream/10 bg-charcoal-light p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-cream/40">
        <Calendar size={16} className="text-clay" />
        {monthLabel}の稼働状況
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-heading)] text-4xl text-cream">
          {occupancy}
        </span>
        <span className="text-sm text-cream/50">% 稼働</span>
      </div>

      {/* プログレスバー */}
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full bg-gradient-to-r from-deep-green to-deep-green-light transition-all"
          style={{ width: `${Math.min(occupancy, 100)}%` }}
        />
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-cream/50">公開枠数</dt>
          <dd className="font-medium">{openCount} 枠</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-cream/50">予約済み枠数</dt>
          <dd className="font-medium text-green-300">{bookedCount} 枠</dd>
        </div>
        <div className="flex items-center justify-between border-t border-cream/10 pt-2.5">
          <dt className="text-cream/50">空き枠</dt>
          <dd className="font-medium text-cream/80">{Math.max(openCount - bookedCount, 0)} 枠</dd>
        </div>
      </dl>
    </div>
  );
}

// ── 直近予定セクション ────────────────────────────────────────────────────────

function ScheduleSection({
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
    <section>
      <h4
        className={`mb-2 flex items-baseline gap-2 text-sm ${
          emphasize ? "text-clay" : "text-cream/60"
        }`}
      >
        <span className="font-medium">{title}</span>
        <span className="text-xs text-cream/35">
          {rows.length > 0
            ? `${rows.length}件 ・ ${rows.reduce((n, b) => n + b.guests, 0)}名`
            : "予約なし"}
        </span>
      </h4>
      {rows.length > 0 && (
        <ul className="space-y-1.5">
          {rows.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => onOpen(b)}
                className="flex w-full items-center gap-3 rounded border border-cream/10 bg-charcoal-light px-3 py-2.5 text-left transition-colors hover:border-clay/40"
              >
                <span className="w-12 shrink-0 font-[family-name:var(--font-heading)] text-sm text-clay">
                  {b.available_slots!.time_slot}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate text-sm font-medium">{b.name}</span>
                    <DietaryIcon dietary={b.dietary} />
                  </span>
                  <span className="mt-0.5 block text-xs text-cream/50">
                    {formatShortDateJa(b.available_slots!.date)} ・ {b.guests}名 ・{" "}
                    {planShortLabel(b.plan)}
                  </span>
                </span>
                <StatusBadge status={b.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
