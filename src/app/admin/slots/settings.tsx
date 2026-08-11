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
    <div className="max-w-2xl space-y-7">
      <div className="border-b border-line pb-6">
        <p className="wa-label uppercase">Settings</p>
        <h2 className="wa-serif mt-1 text-2xl font-medium">設定</h2>
        <p className="mt-1.5 text-sm text-sumi-mid">お店の基本設定。</p>
      </div>

      {/* 定休日 */}
      <section className="wa-card p-5 sm:p-6">
        <h3 className="wa-serif text-[15px] font-medium text-sumi">定休日</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-sumi-soft">
          チェックした曜日はカレンダーで定休日扱いになり、週・月の一括公開の対象から外れます。
        </p>
        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {DAYS_JA.map((label, day) => {
            const checked = draft.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggle(day)}
                className={`flex flex-col items-center gap-2 rounded-lg border py-3 text-sm transition-colors ${
                  checked
                    ? "border-shu/40 bg-shu-mist font-medium text-shu-deep"
                    : "border-line bg-white/40 text-sumi-mid hover:border-sumi/25"
                }`}
                aria-pressed={checked}
              >
                <span
                  className={`flex h-4.5 w-4.5 items-center justify-center rounded border ${
                    checked ? "border-shu bg-shu text-white" : "border-sumi/25 bg-white"
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
          <p className="mt-3 text-xs text-shu-deep">全曜日を定休日にすることはできません。</p>
        )}
        <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
          <button
            onClick={() => onSaveClosedDays(draft)}
            disabled={saving || !dirty || allClosed}
            className="wa-btn wa-btn-primary px-5 py-2.5 text-sm"
          >
            <Save size={14} /> {saving ? "保存中…" : "保存"}
          </button>
          {dirty && !saving && (
            <span className="text-xs text-shu-deep">未保存の変更があります</span>
          )}
        </div>
      </section>

      {/* 表示のみの情報 */}
      <section className="wa-card p-5 sm:p-6">
        <h3 className="wa-serif text-[15px] font-medium text-sumi">店舗情報（表示のみ）</h3>
        <dl className="mt-5 space-y-4 text-sm">
          <InfoRow label="予約サイト">
            {info ? (
              <a
                href={info.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 break-all text-shu-deep hover:underline"
              >
                {info.booking_url} <ExternalLink size={12} className="shrink-0" />
              </a>
            ) : (
              "—"
            )}
          </InfoRow>
          <InfoRow label="時間枠">
            <span className="wa-num">{TIME_SLOTS.join(" / ")}</span>（3枠固定）
          </InfoRow>
          <InfoRow label="料金">
            <span className="wa-num">
              ¥{plan.priceJpy.toLocaleString()} / ${plan.priceUsd}
            </span>{" "}
            ・ 1名あたり（最大{plan.maxGuests}名）
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
    <div className="grid grid-cols-[110px_1fr] gap-4">
      <dt className="pt-px text-[11px] tracking-[0.08em] text-sumi-soft">{label}</dt>
      <dd className="min-w-0 text-sumi">{children}</dd>
    </div>
  );
}

function ServiceStatus({ enabled, name }: { enabled: boolean; name: string }) {
  return (
    <span
      className={`wa-chip ${
        enabled ? "bg-matcha-mist text-matcha-deep" : "bg-washi-deep text-sumi-soft"
      }`}
    >
      <CircleDot size={11} />
      {enabled ? `${name} 連携中（キー設定済）` : `${name} 未設定`}
    </span>
  );
}
