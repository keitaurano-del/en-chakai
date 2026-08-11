import { NextRequest, NextResponse } from "next/server";
import { listBookings, updateBooking } from "@/lib/db";
import { deactivatePaymentLink, isStripeEnabled, listCheckoutSessions } from "@/lib/stripe";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && auth === expected;
}

// POST — Stripe の支払状況を予約台帳へ同期する。
// confirmed かつ未払で payment_link_id を持つ全予約について Checkout Session を照会し、
// 支払済セッションがあれば Booking を paid に更新して Payment Link を無効化する。
// STRIPE_SECRET_KEY 未設定なら何もせず updated: 0 を返す（従来動作を壊さない）。
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isStripeEnabled()) {
    return NextResponse.json({ enabled: false, updated: 0 });
  }

  const candidates = listBookings(1000).filter(
    (b) => b.status === "confirmed" && b.payment_status === "unpaid" && b.payment_link_id
  );

  const results = await Promise.all(
    candidates.map(async (b) => {
      try {
        const sessions = await listCheckoutSessions(b.payment_link_id!);
        const paid = sessions.some((s) => s.payment_status === "paid");
        if (!paid) return false;

        updateBooking(b.id, { payment_status: "paid", paid_at: new Date().toISOString() });

        // 二重払い防止: 支払済になったリンクは無効化（失敗しても同期自体は成功扱い）
        try {
          await deactivatePaymentLink(b.payment_link_id!);
        } catch (e) {
          console.error(`Payment link deactivation failed (${b.payment_link_id}):`, e);
        }
        return true;
      } catch (e) {
        console.error(`Payment sync failed for booking ${b.id}:`, e);
        return false;
      }
    })
  );

  return NextResponse.json({
    enabled: true,
    checked: candidates.length,
    updated: results.filter(Boolean).length,
  });
}
