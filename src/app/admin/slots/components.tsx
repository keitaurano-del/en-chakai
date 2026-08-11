"use client";

// 管理画面の共有パーツ: バッジ・詳細行・予約一覧・予約詳細モーダル・CSV出力
import { useMemo, useState } from "react";
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
    pending: { label: "未確認", cls: "bg-clay/15 text-clay" },
    confirmed: { label: "確定", cls: "bg-deep-green/30 text-green-300" },
    cancelled: { label: "キャンセル", cls: "bg-red-900/20 text-red-300" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
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
      ? "bg-deep-green/30 text-green-300"
      : label === "未払"
        ? "bg-clay/15 text-clay"
        : "bg-cream/10 text-cream/40";
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function DietaryIcon({ dietary }: { dietary: string | null }) {
  if (!dietary) return null;
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-300"
      title={`食事制限: ${dietary}`}
    >
      <Utensils size={10} /> 食事制限
    </span>
  );
}

export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-3">
      <dt className="text-xs uppercase tracking-[0.1em] text-cream/40">{label}</dt>
      <dd className="text-cream/90">{children}</dd>
    </div>
  );
}

export function TabButton({
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
          <h2 className="font-[family-name:var(--font-heading)] text-2xl">予約一覧</h2>
          {counts.pending > 0 && (
            <p className="mt-1 text-sm text-clay">未確認 {counts.pending} 件</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-2 text-xs transition-colors ${
                filter === f ? "bg-clay/15 text-clay" : "text-cream/40 hover:text-cream"
              }`}
            >
              {filterLabels[f]}
              <span className={filter === f ? "text-clay/70" : "text-cream/25"}>
                {" "}
                ({counts[f]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 検索 + CSV */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream/30"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前・メールで検索"
            className="w-full rounded border border-cream/15 bg-charcoal-light py-2.5 pl-9 pr-3 text-sm text-cream placeholder:text-cream/30 focus:border-clay focus:outline-none"
          />
        </div>
        {onSyncPayments && (
          <button
            onClick={onSyncPayments}
            disabled={paymentsSyncing}
            className="flex shrink-0 items-center gap-1.5 rounded border border-cream/15 px-3 py-2.5 text-xs text-cream/60 transition-colors hover:border-clay hover:text-clay disabled:opacity-40"
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
          className="flex shrink-0 items-center gap-1.5 rounded border border-cream/15 px-3 py-2.5 text-xs text-cream/60 transition-colors hover:border-clay hover:text-clay disabled:opacity-40"
          title="表示中の予約をCSVでダウンロード"
        >
          <Download size={14} /> CSV
        </button>
      </div>

      {nothing ? (
        <div className="rounded border border-cream/10 p-12 text-center text-cream/30">
          該当する予約はありません
        </div>
      ) : (
        <div className="space-y-6">
          {upcomingGroups.map((g) => (
            <section key={g.date}>
              <h3 className="mb-2 flex items-baseline gap-2 border-b border-cream/10 pb-1.5">
                <span className="font-[family-name:var(--font-heading)] text-base text-cream/90">
                  {formatShortDateJa(g.date)}
                </span>
                {g.date === todayStr && (
                  <span className="rounded bg-clay/20 px-1.5 py-0.5 text-[10px] font-medium text-clay">
                    今日
                  </span>
                )}
                <span className="text-xs text-cream/35">
                  {g.rows.filter(isActiveBooking).reduce((n, b) => n + b.guests, 0)}名 /{" "}
                  {g.rows.length}件
                </span>
              </h3>
              <ul className="space-y-2">
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
                className="mb-2 flex w-full items-center justify-between border-b border-cream/10 pb-1.5 text-left"
              >
                <span className="text-sm text-cream/50">過去の予約（{pastRows.length}件）</span>
                <ChevronDown
                  size={16}
                  className={`text-cream/40 transition-transform ${showPast ? "rotate-180" : ""}`}
                />
              </button>
              {showPast && (
                <ul className="space-y-2">
                  {pastRows.map((b) => (
                    <li key={b.id} className="opacity-70">
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
      className="flex w-full items-start justify-between gap-4 rounded border border-cream/10 bg-charcoal-light p-4 text-left transition-colors hover:border-clay/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{b.name}</span>
          <StatusBadge status={b.status} />
          <PaymentBadge booking={b} />
          <DietaryIcon dietary={b.dietary} />
        </div>
        <p className="mt-1 truncate text-sm text-cream/50">{b.email}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-cream/60">
          {b.available_slots && (
            <span>
              {formatShortDateJa(b.available_slots.date)} {b.available_slots.time_slot}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users size={11} /> {b.guests}名
          </span>
          <span>{planShortLabel(b.plan)}</span>
          <span className="text-cream/35">
            ¥{(planPrices(b.plan).jpy * b.guests).toLocaleString()}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── 予約詳細モーダル ──────────────────────────────────────────────────────────

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

export function BookingDetailModal({
  booking,
  onClose,
  onStatusChange,
}: {
  booking: BookingRow;
  onClose: () => void;
  onStatusChange: (status: BookingStatus) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { usd, jpy } = planPrices(booking.plan);
  const totalUsd = usd * booking.guests;
  const totalJpy = jpy * booking.guests;

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
            <PaymentBadge booking={booking} />
            <span className="text-cream/40">ID: {booking.id.slice(0, 8)}…</span>
          </div>

          <DetailRow label="日時">
            {booking.available_slots
              ? `${formatDateDisplay(booking.available_slots.date)} ・ ${booking.available_slots.time_slot}`
              : "—"}
          </DetailRow>
          <DetailRow label="プラン">{planShortLabel(booking.plan)}</DetailRow>
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
          {booking.payment_url && (
            <DetailRow label="決済リンク">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyPaymentLink}
                  className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs transition-colors ${
                    linkCopied
                      ? "border-deep-green text-green-300"
                      : "border-cream/15 text-cream/70 hover:border-clay hover:text-clay"
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
                    className="flex items-center gap-1.5 rounded border border-cream/15 px-3 py-1.5 text-xs text-cream/70 transition-colors hover:border-clay hover:text-clay"
                  >
                    <ExternalLink size={12} /> Stripe で確認
                  </a>
                )}
              </div>
            </DetailRow>
          )}
          {booking.paid_at && (
            <DetailRow label="支払日時">
              {new Date(booking.paid_at).toLocaleString("ja-JP", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </DetailRow>
          )}
          {booking.dietary && <DetailRow label="食事制限">{booking.dietary}</DetailRow>}
          {booking.notes && <DetailRow label="備考">{booking.notes}</DetailRow>}
          <DetailRow label="申込日時">
            {new Date(booking.created_at).toLocaleString("ja-JP", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </DetailRow>
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
          {booking.status !== "pending" && (
            <button
              onClick={() => onStatusChange("pending")}
              className="flex items-center gap-1.5 rounded border border-cream/20 px-4 py-2 text-sm text-cream/60 transition-colors hover:bg-cream/5"
            >
              未確認に戻す
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={copyTemplate}
              className={`flex items-center gap-1.5 rounded border px-4 py-2 text-sm transition-colors ${
                copied
                  ? "border-deep-green text-green-300"
                  : "border-cream/15 text-cream/70 hover:border-clay hover:text-clay"
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
              className="flex items-center gap-1.5 rounded border border-cream/15 px-4 py-2 text-sm text-cream/70 transition-colors hover:border-clay hover:text-clay"
            >
              <Mail size={14} /> Gmailで返信
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
