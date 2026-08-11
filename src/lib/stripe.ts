// Stripe 連携 — SDK 不使用。fetch で https://api.stripe.com/v1 を直接叩く。
// STRIPE_SECRET_KEY 未設定なら isStripeEnabled() が false になり、
// 呼び出し側は全ての Stripe 機能をスキップして従来動作を維持する。

const STRIPE_API = "https://api.stripe.com/v1";

export type StripeCurrency = "jpy" | "usd";

export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function stripeCurrency(): StripeCurrency {
  return process.env.STRIPE_CURRENCY === "usd" ? "usd" : "jpy";
}

// 1名あたりの請求額。jpy は zero-decimal 通貨なのでそのまま 10000、usd はセントで 7000。
export function unitAmount(currency: StripeCurrency = stripeCurrency()): number {
  return currency === "jpy" ? 10000 : 7000;
}

// 表示用の合計金額（メール等で使用）
export function formatStripeAmount(guests: number, currency: StripeCurrency = stripeCurrency()): string {
  return currency === "jpy"
    ? `¥${(10000 * guests).toLocaleString()}`
    : `$${70 * guests}`;
}

async function stripeRequest<T>(
  method: "GET" | "POST",
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");

  const encoded = params ? new URLSearchParams(params).toString() : "";
  const url = method === "GET" && encoded ? `${STRIPE_API}${path}?${encoded}` : `${STRIPE_API}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" && encoded ? encoded : undefined,
  });

  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Stripe API error (${res.status} ${path})`);
  }
  return json;
}

export type PaymentLink = { id: string; url: string; active: boolean };

// Payment Link を作成する（Checkout Session は URL が24時間で失効するため不可）。
export async function createPaymentLink(input: {
  bookingId: string;
  dateLabel: string;
  timeLabel: string;
  guests: number;
}): Promise<PaymentLink> {
  const currency = stripeCurrency();
  const productName = `En Chakai — Private Tea Ceremony (${input.dateLabel} ${input.timeLabel})`;
  return stripeRequest<PaymentLink>("POST", "/payment_links", {
    "line_items[0][price_data][currency]": currency,
    "line_items[0][price_data][unit_amount]": String(unitAmount(currency)),
    "line_items[0][price_data][product_data][name]": productName,
    "line_items[0][quantity]": String(input.guests),
    "metadata[booking_id]": input.bookingId,
    "payment_intent_data[metadata][booking_id]": input.bookingId,
    "after_completion[type]": "hosted_confirmation",
    "after_completion[hosted_confirmation][custom_message]":
      "Thank you! Your payment is complete. We look forward to welcoming you.",
  });
}

export type CheckoutSession = { id: string; payment_status: string };

// Payment Link に紐づく Checkout Session を照会（支払完了の検知に使用）
export async function listCheckoutSessions(paymentLinkId: string): Promise<CheckoutSession[]> {
  const res = await stripeRequest<{ data: CheckoutSession[] }>("GET", "/checkout/sessions", {
    payment_link: paymentLinkId,
    limit: "10",
  });
  return res.data ?? [];
}

// 支払完了後の Payment Link を無効化（二重払い防止）
export async function deactivatePaymentLink(paymentLinkId: string): Promise<void> {
  await stripeRequest<PaymentLink>("POST", `/payment_links/${paymentLinkId}`, {
    active: "false",
  });
}
