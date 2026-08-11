"use client";

// 管理画面の共有パーツ: バッジ・詳細行・予約一覧・予約詳細ドロワー・CSV出力
import { useEffect, useMemo, useState } from "react";
import { type Slot, type Booking } from "@/lib/db";
import { formatDateDisplay, PLAN_LABELS, TIME_SLOT_LABELS, type TimeSlot } from "@/lib/booking";
import { PLANS } from "@/lib/constants";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Mail,
  RefreshCw,
  Search,
  Users,
  Utensils,
  X,
} from "lucide-react";

export type BookingRow = Booking & { available_slots: Slot | null };
export type BookingStatus = Booking["status"];

export const DAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// "2026-08-15" → "8月15日(土)"
export function formatShortDateJa(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}月${d.getDate()}日(${DAYS_JA[d.getDay()]})`;
}

export function planPrices(planId: string) {
  const meta = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  return { jpy: meta.priceJpy, usd: meta.priceUsd };
}

export function planShortLabel(planId: string) {
  return PLAN_LABELS[planId]?.split(" — ")[0] ?? planId;
}

// 有効な予約（キャンセル以外）
export function isActiveBooking(b: BookingRow) {
  return b.status !== "cancelled";
}

// ── 小物 ─────────────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: BookingStatus }) {
  const map = {
    pending: { label: "未確認", cls: "bg-shu-mist text-shu-deep" },
    confirmed: { label: "確定", cls: "bg-matcha-mist text-matcha-deep" },
    cancelled: { label: "キャンセル", cls: "bg-washi-deep text-sumi-soft" },
  };
  const { label, cls } = map[status];
  return <span className={`wa-chip ${cls}`}>{label}</span>;
}

// 支払状況バッジ — confirmed の予約にのみ表示（pending / cancelled は非表示）
export function paymentStatusLabel(b: BookingRow): "支払済" | "未払" | "リンク無し" | null {
  if (b.status !== "confirmed") return null;
  if (b.payment_status === "paid") return "支払済";
  if (b.payment_link_id) return "未払";
  return "リンク無し";
}

export function PaymentBadge({ booking }: { booking: BookingRow }) {
  const label = paymentStatusLabel(booking);
  if (!label) return null;
  const cls =
    label === "支払済"
      ? "bg-matcha-deep text-white"
      : label === "未払"
        ? "bg-kin-mist text-kin"
        : "bg-washi-deep text-sumi-soft";
  return <span className={`wa-chip ${cls}`}>{label}</span>;
}

export function DietaryIcon({ dietary }: { dietary: string | null }) {
  if (!dietary) return null;
  return (
    <span
      className="wa-chip bg-kin-mist text-[10px] text-kin"
      title={`食事制限: ${dietary}`}
    >
      <Utensils size={10} /> 食事制限
    </span>
  );
}

export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-4">
      <dt className="pt-px text-[11px] tracking-[0.1em] text-sumi-soft">{label}</dt>
      <dd className="min-w-0 text-sumi">{children}</dd>
    </div>
  );
}

// ── CSV エクスポート ──────────────────────────────────────────────────────────

function csvEscape(v: string) {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function exportBookingsCsv(rows: BookingRow[]) {
  const header = [
    "開催日",
    "時間",
    "名前",
    "メール",
    "人数",
    "プラン",
    "状態",
    "支払状況",
    "食事制限",
    "備考",
    "申込日時",
  ];
  const statusJa: Record<BookingStatus, string> = {
    pending: "未確認",
    confirmed: "確定",
    cancelled: "キャンセル",
  };
  const lines = [header.join(",")];
  for (const b of rows) {
    lines.push(
      [
        b.available_slots?.date ?? "",
        b.available_slots?.time_slot ?? "",
        b.name,
        b.email,
        String(b.guests),
        planShortLabel(b.plan),
        statusJa[b.status],
        paymentStatusLabel(b) ?? "",
        b.dietary ?? "",
        b.notes ?? "",
        new Date(b.created_at).toLocaleString("ja-JP"),
      ]
        .map(csvEscape)
        .join(",")
    );
  }
  // Excel で文字化けしないよう BOM 付き UTF-8
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `enchakai_bookings_${toDateStr(new Date()).replace(/-/g, "")}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── 予約一覧 ─────────────────────────────────────────────────────────────────

type Filter = "all" | BookingStatus;

export function BookingsList({
  bookings,
  onSelect,
  onSyncPayments,
  paymentsSyncing = false,
}: {
  bookings: BookingRow[];
  onSelect: (b: BookingRow) => void;
  onSyncPayments?: () => void;
  paymentsSyncing?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [showPast, setShowPast] = useState(false);

  const counts = useMemo(() => {
    const c = { all: bookings.length, pending: 0, confirmed: 0, cancelled: 0 };
    for (const b of bookings) c[b.status]++;
    return c;
  }, [bookings]);

  const todayStr = toDateStr(new Date());

  const { upcomingGroups, pastRows } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = bookings
      .filter((b) => filter === "all" || b.status === filter)
      .filter(
        (b) => !q || b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)
      );

    const upcoming = filtered
      .filter((b) => (b.available_slots?.date ?? "") >= todayStr)
      .sort((a, b) => {
        const da = a.available_slots!.date;
        const db = b.available_slots!.date;
        return da === db
          ? a.available_slots!.time_slot.localeCompare(b.available_slots!.time_slot)
          : da.localeCompare(db);
      });
    const past = filtered
      .filter((b) => !b.available_slots || b.available_slots.date < todayStr)
      .sort((a, b) =>
        (b.available_slots?.date ?? "0000").localeCompare(a.available_slots?.date ?? "0000")
      );

    // 開催日ごとにグルーピング
    const groups: { date: string; rows: BookingRow[] }[] = [];
    for (const b of upcoming) {
      const date = b.available_slots!.date;
      const last = groups[groups.length - 1];
      if (last && last.date === date) last.rows.push(b);
      else groups.push({ date, rows: [b] });
    }
    return { upcomingGroups: groups, pastRows: past };
  }, [bookings, filter, query, todayStr]);

  const filterLabels: Record<Filter, string> = {
    all: "全て",
    pending: "未確認",
    confirmed: "確定",
    cancelled: "キャンセル",
  };

  const nothing = upcomingGroups.length === 0 && pastRows.length === 0;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="wa-label uppercase">Reservations</p>
          <h2 className="wa-serif mt-1 text-2xl font-medium">予約一覧</h2>
          {counts.pending > 0 && (
            <p className="mt-1.5 text-sm text-shu-deep">未確認 {counts.pending} 件</p>
          )}
        </div>
        {/* ステータスフィルタ（セグメント） */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-line bg-shiro p-1">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`wa-num rounded-md px-3 py-2 text-xs transition-colors ${
                filter === f
                  ? "bg-sumi font-medium text-washi shadow-sm"
                  : "text-sumi-mid hover:bg-washi-deep/60 hover:text-sumi"
              }`}
            >
              {filterLabels[f]}
              <span className={filter === f ? "text-washi/60" : "text-sumi-soft/70"}>
                {" "}
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 検索 + CSV */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sumi-soft"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前・メールで検索"
            className="w-full rounded-lg border border-line bg-shiro py-2.5 pl-10 pr-3 text-sm text-sumi placeholder:text-sumi-soft focus:border-sumi/40 focus:outline-none focus:ring-2 focus:ring-sumi/10"
          />
        </div>
        {onSyncPayments && (
          <button
            onClick={onSyncPayments}
            disabled={paymentsSyncing}
            className="wa-btn wa-btn-ghost shrink-0 px-3.5 py-2.5 text-xs"
            title="Stripe の支払状況を照会して反映"
          >
            <RefreshCw size={14} className={paymentsSyncing ? "animate-spin" : ""} />
            {paymentsSyncing ? "確認中…" : "支払状況を更新"}
          </button>
        )}
        <button
          onClick={() =>
            exportBookingsCsv([...upcomingGroups.flatMap((g) => g.rows), ...pastRows])
          }
          disabled={nothing}
          className="wa-btn wa-btn-ghost shrink-0 px-3.5 py-2.5 text-xs"
          title="表示中の予約をCSVでダウンロード"
        >
          <Download size={14} /> CSV
        </button>
      </div>

      {nothing ? (
        <div className="wa-card p-14 text-center text-sm text-sumi-soft">
          該当する予約はありません
        </div>
      ) : (
        <div className="space-y-7">
          {upcomingGroups.map((g) => (
            <section key={g.date}>
              <h3 className="mb-2.5 flex items-baseline gap-2.5 border-b border-line pb-2">
                <span className="wa-serif wa-num text-[15px] font-medium text-sumi">
                  {formatShortDateJa(g.date)}
                </span>
                {g.date === todayStr && (
                  <span className="wa-chip bg-shu text-[10px] text-white">今日</span>
                )}
                <span className="wa-num text-xs text-sumi-soft">
                  {g.rows.filter(isActiveBooking).reduce((n, b) => n + b.guests, 0)}名 /{" "}
                  {g.rows.length}件
                </span>
              </h3>
              <ul className="space-y-2.5">
                {g.rows.map((b) => (
                  <li key={b.id}>
                    <BookingRowCard booking={b} onSelect={onSelect} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {pastRows.length > 0 && (
            <section>
              <button
                onClick={() => setShowPast((v) => !v)}
                className="mb-2.5 flex w-full items-center justify-between border-b border-line pb-2 text-left"
              >
                <span className="text-sm text-sumi-mid">過去の予約（{pastRows.length}件）</span>
                <ChevronDown
                  size={16}
                  className={`text-sumi-soft transition-transform ${showPast ? "rotate-180" : ""}`}
                />
              </button>
              {showPast && (
                <ul className="space-y-2.5">
                  {pastRows.map((b) => (
                    <li key={b.id} className="opacity-65">
                      <BookingRowCard booking={b} onSelect={onSelect} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function BookingRowCard({
  booking: b,
  onSelect,
}: {
  booking: BookingRow;
  onSelect: (b: BookingRow) => void;
}) {
  return (
    <button
      onClick={() => onSelect(b)}
      className="wa-card flex w-full items-start justify-between gap-4 p-4 text-left transition-[border-color,box-shadow] hover:border-sumi/25 sm:p-5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="wa-serif text-[15px] font-medium">{b.name}</span>
          <StatusBadge status={b.status} />
          <PaymentBadge booking={b} />
          <DietaryIcon dietary={b.dietary} />
        </div>
        <p className="mt-1 truncate text-[13px] text-sumi-soft">{b.email}</p>
        <div className="wa-num mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sumi-mid">
          {b.available_slots && (
            <span>
              {formatShortDateJa(b.available_slots.date)} {b.available_slots.time_slot}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users size={11} className="text-sumi-soft" /> {b.guests}名
          </span>
          <span>{planShortLabel(b.plan)}</span>
          <span className="font-medium text-sumi">
            ¥{(planPrices(b.plan).jpy * b.guests).toLocaleString()}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── 予約詳細ドロワー ──────────────────────────────────────────────────────────

// 訪日外国人客向けの英語定型返信文
function buildReplyTemplate(b: BookingRow) {
  const dateLabel = b.available_slots ? formatDateDisplay(b.available_slots.date) : "(date TBD)";
  const timeLabel = b.available_slots
    ? TIME_SLOT_LABELS[b.available_slots.time_slot as TimeSlot] ?? b.available_slots.time_slot
    : "(time TBD)";
  const { usd, jpy } = planPrices(b.plan);
  return `Dear ${b.name},

Thank you for your reservation at En Chakai (円茶会).

Here are your reservation details:
- Date: ${dateLabel}
- Time: ${timeLabel}
- Guests: ${b.guests}
- Experience: ${planShortLabel(b.plan)}
- Total: $${usd * b.guests} (¥${(jpy * b.guests).toLocaleString()})

Our tea room is in Sengoku, Bunkyo-ku, Tokyo — a 5 minute walk from Sengoku Station (Toei Mita Line). The exact street address will be sent two days before your visit.

A few gentle requests before you come: please wear plain white (or very light) socks, remove watches and rings before the ceremony, and travel light as the tea room is small.

If you have any questions, feel free to reply to this email.

Warm regards,
En Chakai 円茶会`;
}

// 履歴タイムライン: 申込 → 確定(あれば) → 支払(あれば)。データに無い日時は表示しない。
function formatDateTimeJa(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryTimeline({ booking }: { booking: BookingRow }) {
  const events: { label: string; at: string; tone: string }[] = [
    { label: "申込", at: booking.created_at, tone: "bg-sumi-soft" },
  ];
  if (booking.confirmed_at)
    events.push({ label: "確定", at: booking.confirmed_at, tone: "bg-matcha" });
  if (booking.paid_at) events.push({ label: "支払", at: booking.paid_at, tone: "bg-kin" });
  events.sort((a, b) => a.at.localeCompare(b.at));

  return (
    <div>
      <p className="wa-label mb-3">履歴</p>
      <ol className="relative ml-1.5 space-y-3.5 border-l border-line pl-4">
        {events.map((e) => (
          <li key={e.label} className="relative">
            <span
              className={`absolute -left-[21.5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-shiro ${e.tone}`}
            />
            <p className="text-sm font-medium text-sumi">{e.label}</p>
            <p className="wa-num text-xs text-sumi-soft">{formatDateTimeJa(e.at)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function BookingDrawer({
  booking,
  onClose,
  onStatusChange,
}: {
  booking: BookingRow;
  onClose: () => void;
  onStatusChange: (status: BookingStatus) => Promise<void>;
}) {
  const [entered, setEntered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { usd, jpy } = planPrices(booking.plan);
  const totalUsd = usd * booking.guests;
  const totalJpy = jpy * booking.guests;

  // マウント直後にスライドイン
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(buildReplyTemplate(booking));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard 不可の環境では黙ってスキップ
    }
  }

  async function copyPaymentLink() {
    if (!booking.payment_url) return;
    try {
      await navigator.clipboard.writeText(booking.payment_url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard 不可の環境では黙ってスキップ
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-sumi/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 右からのスライドドロワー: モバイルはほぼ全画面 / PC は幅480px */}
      <div
        className={`wa-shadow-lg absolute inset-y-0 right-0 flex w-full flex-col bg-shiro transition-transform duration-300 sm:w-[480px] ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 天の朱線 */}
        <span aria-hidden className="h-[3px] w-full shrink-0 bg-shu" />

        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4 sm:px-7">
          <div>
            <p className="wa-label uppercase">予約詳細</p>
            <h3 className="wa-serif mt-1 text-xl font-medium text-sumi">{booking.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-sumi-soft transition-colors hover:bg-washi-deep/70 hover:text-sumi"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6 text-sm sm:px-7">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={booking.status} />
            <PaymentBadge booking={booking} />
            <span className="wa-num text-xs text-sumi-soft">ID: {booking.id.slice(0, 8)}…</span>
          </div>

          <div className="wa-num space-y-4 rounded-xl border border-line bg-white/50 p-4 sm:p-5">
            <DetailRow label="日時">
              {booking.available_slots
                ? `${formatDateDisplay(booking.available_slots.date)} ・ ${booking.available_slots.time_slot}`
                : "—"}
            </DetailRow>
            <DetailRow label="プラン">{planShortLabel(booking.plan)}</DetailRow>
            <DetailRow label="人数">{booking.guests} 名</DetailRow>
            <DetailRow label="合計">
              <span className="wa-serif text-base font-medium">
                ${totalUsd}{" "}
                <span className="text-sm font-normal text-sumi-mid">
                  (¥{totalJpy.toLocaleString()})
                </span>
              </span>
            </DetailRow>
            <DetailRow label="メール">
              <a href={`mailto:${booking.email}`} className="break-all text-shu-deep hover:underline">
                {booking.email}
              </a>
            </DetailRow>
            {booking.payment_url && (
              <DetailRow label="決済リンク">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyPaymentLink}
                    className={`wa-btn px-3 py-2 text-xs ${
                      linkCopied
                        ? "border border-matcha bg-matcha-mist text-matcha-deep"
                        : "wa-btn-ghost"
                    }`}
                    title="ゲストへ送る決済リンクをコピー"
                  >
                    {linkCopied ? <Check size={12} /> : <Link2 size={12} />}
                    {linkCopied ? "コピー済み" : "決済リンクをコピー"}
                  </button>
                  {booking.payment_link_id && (
                    <a
                      href={`https://dashboard.stripe.com/payment-links/${booking.payment_link_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wa-btn wa-btn-ghost px-3 py-2 text-xs"
                    >
                      <ExternalLink size={12} /> Stripe で確認
                    </a>
                  )}
                </div>
              </DetailRow>
            )}
            {booking.dietary && <DetailRow label="食事制限">{booking.dietary}</DetailRow>}
            {booking.notes && <DetailRow label="備考">{booking.notes}</DetailRow>}
          </div>

          {/* 履歴タイムライン */}
          <div className="pt-1">
            <HistoryTimeline booking={booking} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-line bg-washi/70 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-7">
          {booking.status === "pending" && (
            <>
              <button
                onClick={() => onStatusChange("confirmed")}
                className="wa-btn wa-btn-matcha px-4 py-2.5 text-sm"
              >
                <Check size={14} /> 確定 + メール送信
              </button>
              <button
                onClick={() => onStatusChange("cancelled")}
                className="wa-btn wa-btn-danger px-4 py-2.5 text-sm"
              >
                <X size={14} /> キャンセル
              </button>
            </>
          )}
          {booking.status !== "pending" && (
            <button
              onClick={() => onStatusChange("pending")}
              className="wa-btn wa-btn-ghost px-4 py-2.5 text-sm"
            >
              未確認に戻す
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={copyTemplate}
              className={`wa-btn px-4 py-2.5 text-sm ${
                copied ? "border border-matcha bg-matcha-mist text-matcha-deep" : "wa-btn-ghost"
              }`}
              title="日時・人数入りの英語定型返信文をコピー"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "コピー済み" : "定型文コピー"}
            </button>
            <a
              href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(booking.email)}&su=${encodeURIComponent("Your reservation at En Chakai")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-btn wa-btn-ghost px-4 py-2.5 text-sm"
            >
              <Mail size={14} /> Gmailで返信
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
