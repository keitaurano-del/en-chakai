import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db";
import { isStripeEnabled } from "@/lib/stripe";
import { BASE_URL } from "@/lib/urls";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && auth === expected;
}

// GET — 管理設定（closed_days）＋ 表示専用の環境情報
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = getSettings();
  return NextResponse.json({
    ...settings,
    info: {
      booking_url: `${BASE_URL}/booking`,
      notification_email: process.env.NOTIFICATION_EMAIL ?? "keita.urano@gmail.com",
      email_from: process.env.EMAIL_FROM ?? "En Chakai <onboarding@resend.dev>",
      stripe_enabled: isStripeEnabled(),
      resend_enabled: !!process.env.RESEND_API_KEY,
    },
  });
}

// PATCH — { closed_days: number[] } を保存（0=日 … 6=土）
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.closed_days)) {
    return NextResponse.json({ error: "closed_days must be an array" }, { status: 400 });
  }
  const days = [
    ...new Set(
      (body.closed_days as unknown[]).filter(
        (d): d is number => typeof d === "number" && Number.isInteger(d) && d >= 0 && d <= 6
      )
    ),
  ].sort((a, b) => a - b);
  if (days.length === 7) {
    return NextResponse.json({ error: "全曜日を定休日にはできません" }, { status: 400 });
  }
  return NextResponse.json(updateSettings({ closed_days: days }));
}
