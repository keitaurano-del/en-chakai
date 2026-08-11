"use client";

// 設定: 定休日（サーバ保存）＋ 表示のみの店舗情報
import { useEffect, useState } from "react";
import { TIME_SLOTS } from "@/lib/booking";
import { PLANS } from "@/lib/constants";
import { Check, CircleDot, ExternalLink, Save } from "lucide-react";
import { DAYS_JA } from "./components";

export type SettingsInfo = {
  booking_url: string;
  notification_email: string;
  email_from: string;
  stripe_enabled: boolean;
  resend_enabled: boolean;
};

export function SettingsView({
  closedDays,
  onSaveClosedDays,
  saving,
  info,
}: {
  closedDays: number[];
  onSaveClosedDays: (days: number[]) => Promise<void>;
  saving: boolean;
  info: SettingsInfo | null;
}) {
  const [draft, setDraft] = useState<number[]>(closedDays);

  // サーバから取得し直したら下書きへ反映
  useEffect(() => {
    setDraft(closedDays);
  }, [closedDays]);

  const dirty =
    draft.length !== closedDays.length || draft.some((d) => !closedDays.includes(d));
  const allClosed = draft.length === 7;
  const plan = PLANS[0];

  function toggle(day: number) {
    setDraft((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl">設定</h2>
        <p className="mt-1 text-sm text-cream/50">お店の基本設定。</p>
      </div>

      {/* 定休日 */}
      <section className="rounded border border-cream/10 bg-charcoal-light p-4 sm:p-5">
        <h3 className="text-sm font-medium">定休日</h3>
        <p className="mt-1 text-xs text-cream/45">
          チェックした曜日はカレンダーで定休日扱いになり、週・月の一括公開の対象から外れます。
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {DAYS_JA.map((label, day) => {
            const checked = draft.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggle(day)}
                className={`flex flex-col items-center gap-1.5 rounded border py-3 text-sm transition-colors ${
                  checked
                    ? "border-clay/50 bg-clay/15 text-clay"
                    : "border-cream/15 text-cream/60 hover:border-cream/30"
                }`}
                aria-pressed={checked}
              >
                <span
                  className={`flex h-4.5 w-4.5 items-center justify-center rounded border ${
                    checked ? "border-clay bg-clay text-charcoal" : "border-cream/30"
                  }`}
                >
                  {checked && <Check size={12} strokeWidth={3} />}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        {allClosed && (
          <p className="mt-3 text-xs text-red-300">全曜日を定休日にすることはできません。</p>
        )}
        <div className="mt-4 flex items-center gap-3 border-t border-cream/10 pt-4">
          <button
            onClick={() => onSaveClosedDays(draft)}
            disabled={saving || !dirty || allClosed}
            className="flex items-center gap-1.5 rounded border border-deep-green bg-deep-green/40 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-deep-green/60 disabled:opacity-40"
          >
            <Save size={14} /> {saving ? "保存中…" : "保存"}
          </button>
          {dirty && !saving && <span className="text-xs text-clay">未保存の変更があります</span>}
        </div>
      </section>

      {/* 表示のみの情報 */}
      <section className="rounded border border-cream/10 bg-charcoal-light p-4 sm:p-5">
        <h3 className="text-sm font-medium">店舗情報（表示のみ）</h3>
        <dl className="mt-4 space-y-3.5 text-sm">
          <InfoRow label="予約サイト">
            {info ? (
              <a
                href={info.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 break-all text-clay hover:underline"
              >
                {info.booking_url} <ExternalLink size={12} className="shrink-0" />
              </a>
            ) : (
              "—"
            )}
          </InfoRow>
          <InfoRow label="時間枠">{TIME_SLOTS.join(" / ")}（3枠固定）</InfoRow>
          <InfoRow label="料金">
            ¥{plan.priceJpy.toLocaleString()} / ${plan.priceUsd} ・ 1名あたり（最大{plan.maxGuests}
            名）
          </InfoRow>
          <InfoRow label="通知先メール">{info?.notification_email ?? "—"}</InfoRow>
          <InfoRow label="送信元メール">{info?.email_from ?? "—"}</InfoRow>
          <InfoRow label="メール送信">
            <ServiceStatus enabled={!!info?.resend_enabled} name="Resend" />
          </InfoRow>
          <InfoRow label="Stripe 連携">
            <ServiceStatus enabled={!!info?.stripe_enabled} name="Stripe" />
          </InfoRow>
        </dl>
      </section>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <dt className="text-xs uppercase tracking-[0.08em] text-cream/40">{label}</dt>
      <dd className="min-w-0 text-cream/90">{children}</dd>
    </div>
  );
}

function ServiceStatus({ enabled, name }: { enabled: boolean; name: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        enabled ? "bg-deep-green/30 text-green-300" : "bg-cream/10 text-cream/40"
      }`}
    >
      <CircleDot size={11} />
      {enabled ? `${name} 連携中（キー設定済）` : `${name} 未設定`}
    </span>
  );
}
