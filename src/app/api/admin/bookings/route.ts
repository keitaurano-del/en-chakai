import { NextRequest, NextResponse } from "next/server";
import { listBookings, updateBookingStatus } from "@/lib/db";
import { Resend } from "resend";
import { PLAN_LABELS, TIME_SLOT_LABELS, formatDateDisplay, type TimeSlot } from "@/lib/booking";
import { PLANS } from "@/lib/constants";

// Resend is optional — without RESEND_API_KEY, emails are skipped gracefully.
function getResend(): Resend | null {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

// Sender must be a Resend-verified domain; falls back to Resend's shared onboarding sender.
const EMAIL_FROM = process.env.EMAIL_FROM ?? "En Chakai <onboarding@resend.dev>";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && auth === expected;
}

// GET — list recent bookings
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(listBookings(100));
}

// PATCH — update booking status (and send confirmation email when confirming)
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();

  const booking = updateBookingStatus(id, status);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 500 });

  // Send confirmation email when status flips to confirmed
  if (status === "confirmed" && booking?.available_slots) {
    try {
      await sendConfirmationEmail({ ...booking, available_slots: booking.available_slots });
    } catch (emailError) {
      console.error("Confirmation email error:", emailError);
    }
  }

  return NextResponse.json(booking);
}

type BookingWithSlot = {
  id: string;
  name: string;
  email: string;
  plan: string;
  guests: number;
  dietary: string | null;
  notes: string | null;
  available_slots: {
    date: string;
    time_slot: string;
  };
};

async function sendConfirmationEmail(booking: BookingWithSlot) {
  const { name, email, plan, guests, available_slots } = booking;
  const dateLabel = formatDateDisplay(available_slots.date);
  const timeLabel = TIME_SLOT_LABELS[available_slots.time_slot as TimeSlot] ?? available_slots.time_slot;
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const planMeta = PLANS.find((p) => p.id === plan) ?? PLANS[0];
  const totalUsd = planMeta.priceUsd * guests;
  const totalJpy = planMeta.priceJpy * guests;

  await getResend()?.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: `Reservation confirmed — ${dateLabel} · En Chakai`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fafaf6; color: #2a2a25;">
        <h1 style="font-size: 28px; font-weight: 500; margin: 0 0 12px; color: #2a2a25;">
          Your seat is confirmed.
        </h1>
        <p style="font-size: 15px; line-height: 1.7; color: #555550; margin-top: 0;">
          Thank you, ${name}. We&rsquo;ve confirmed your reservation. Below are the details and a short guide so you arrive ready.
        </p>

        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; color: #b5936a; margin: 32px 0 12px;">Reservation</h2>
        <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #e0dccc; border-bottom: 1px solid #e0dccc;">
          <tr><td style="padding: 12px 0; width: 160px; font-size: 13px; color: #888880;">Date</td><td style="padding: 12px 0; font-size: 15px;">${dateLabel}</td></tr>
          <tr><td style="padding: 12px 0; font-size: 13px; color: #888880;">Time</td><td style="padding: 12px 0; font-size: 15px;">${timeLabel}</td></tr>
          <tr><td style="padding: 12px 0; font-size: 13px; color: #888880;">Experience</td><td style="padding: 12px 0; font-size: 15px;">${planLabel}</td></tr>
          <tr><td style="padding: 12px 0; font-size: 13px; color: #888880;">Guests</td><td style="padding: 12px 0; font-size: 15px;">${guests}</td></tr>
          <tr><td style="padding: 12px 0; font-size: 13px; color: #888880;">Total</td><td style="padding: 12px 0; font-size: 15px;"><strong>$${totalUsd}</strong> <span style="color:#888880;">(¥${totalJpy.toLocaleString()})</span></td></tr>
        </table>

        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; color: #b5936a; margin: 32px 0 12px;">Location</h2>
        <p style="font-size: 15px; line-height: 1.7; margin: 0;">
          Sengoku, Bunkyō-ku, Tokyo<br/>
          5 min walk from Sengoku Station (Toei Mita Line)
        </p>
        <p style="font-size: 13px; color: #888880; line-height: 1.7; margin: 8px 0 0;">
          The exact street address will be sent two days before your visit.
        </p>

        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; color: #b5936a; margin: 32px 0 12px;">How to prepare</h2>
        <ul style="padding-left: 20px; margin: 0; font-size: 15px; line-height: 1.8; color: #2a2a25;">
          <li><strong>White socks</strong> — please wear plain white (or very light) socks. You&rsquo;ll step onto the tatami in stocking feet.</li>
          <li><strong>No watches or rings</strong> — please remove watches, bracelets, and rings before the ceremony. The chawan (tea bowls) and utensils are antique and easily scratched.</li>
          <li><strong>Travel light</strong> — bring as little as possible. The tea room is small; large bags don&rsquo;t fit comfortably.</li>
          <li><strong>No sunglasses indoors</strong> — please remove sunglasses inside the room.</li>
          <li><strong>Dress</strong> — there&rsquo;s no dress code, but please wear something quiet and unflashy. Comfortable, neutral, lightly formal.</li>
        </ul>

        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; color: #b5936a; margin: 32px 0 12px;">Cancellation</h2>
        <p style="font-size: 14px; line-height: 1.7; color: #555550; margin: 0;">
          7+ days before: full refund · 3–6 days: 50% refund · 2 days or less: 80% cancellation fee.
        </p>

        <p style="margin-top: 32px; font-size: 14px; line-height: 1.7; color: #555550;">
          If anything changes or you have questions, just reply to this email.
        </p>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e0dccc; font-size: 12px; color: #999990;">
          En Chakai 円茶会<br/>
          bookings@en-chakai.com<br/>
          Booking ID: ${booking.id}
        </div>
      </div>
    `,
  });
}
