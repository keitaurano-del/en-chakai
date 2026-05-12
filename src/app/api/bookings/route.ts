import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { PLAN_LABELS, TIME_SLOT_LABELS, formatDateDisplay, type TimeSlot } from "@/lib/booking";

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL ?? "keita.urano@gmail.com";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, time_slot, plan, guests, name, email, dietary, notes } = body;

  // Validate required fields
  if (!date || !time_slot || !plan || !guests || !name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Find the slot
  const { data: slot, error: slotError } = await supabase
    .from("available_slots")
    .select("*")
    .eq("date", date)
    .eq("time_slot", time_slot)
    .eq("is_open", true)
    .single();

  if (slotError || !slot) {
    return NextResponse.json(
      { error: "This time slot is no longer available. Please choose another." },
      { status: 409 }
    );
  }

  // Insert booking — seating column kept as "floor" for legacy NOT NULL constraint
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      slot_id: slot.id,
      plan,
      guests,
      name,
      email,
      seating: "floor",
      dietary: dietary || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (bookingError) {
    console.error("Booking insert error:", bookingError);
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }

  const dateLabel = formatDateDisplay(date);
  const timeLabel = TIME_SLOT_LABELS[time_slot as TimeSlot] ?? time_slot;
  const planLabel = PLAN_LABELS[plan] ?? plan;

  // 1. Send notification email to host
  try {
    await resend.emails.send({
      from: "En Chakai Bookings <bookings@en-chakai.com>",
      to: NOTIFICATION_EMAIL,
      subject: `New reservation request — ${name} · ${dateLabel}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1e1e1a; color: #f0ebe0;">
          <h1 style="font-size: 24px; font-weight: 500; margin-bottom: 24px; color: #b5936a;">
            New Reservation Request
          </h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #b5936a; width: 160px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Date</td><td style="padding: 8px 0; font-size: 15px;">${dateLabel}</td></tr>
            <tr><td style="padding: 8px 0; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Time</td><td style="padding: 8px 0; font-size: 15px;">${timeLabel}</td></tr>
            <tr><td style="padding: 8px 0; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Plan</td><td style="padding: 8px 0; font-size: 15px;">${planLabel}</td></tr>
            <tr><td style="padding: 8px 0; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Guests</td><td style="padding: 8px 0; font-size: 15px;">${guests}</td></tr>
            <tr style="border-top: 1px solid #333;"><td style="padding: 16px 0 8px; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Name</td><td style="padding: 16px 0 8px; font-size: 15px;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td><td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${email}" style="color: #b5936a;">${email}</a></td></tr>
            ${dietary ? `<tr><td style="padding: 8px 0; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Dietary</td><td style="padding: 8px 0; font-size: 15px;">${dietary}</td></tr>` : ""}
            ${notes ? `<tr><td style="padding: 8px 0; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Notes</td><td style="padding: 8px 0; font-size: 15px;">${notes}</td></tr>` : ""}
          </table>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #333; font-size: 13px; color: #8a8275;">
            Booking ID: ${booking.id}
          </div>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Host email send error:", emailError);
  }

  // 2. Send acknowledgement email to guest
  try {
    await resend.emails.send({
      from: "En Chakai <bookings@en-chakai.com>",
      to: email,
      subject: `We've received your reservation request — En Chakai`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fafaf6; color: #2a2a25;">
          <h1 style="font-size: 28px; font-weight: 500; margin-bottom: 12px; color: #2a2a25;">
            Thank you, ${name}.
          </h1>
          <p style="font-size: 15px; line-height: 1.7; color: #555550; margin-top: 0;">
            We&rsquo;ve received your reservation request for the tea ceremony at En Chakai.
            We&rsquo;ll review it shortly and send you a confirmation email with a payment link.
            No charge is made until the confirmation is sent.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 28px; border-top: 1px solid #e0dccc; border-bottom: 1px solid #e0dccc;">
            <tr><td style="padding: 12px 0; color: #b5936a; width: 160px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">Date</td><td style="padding: 12px 0; font-size: 15px;">${dateLabel}</td></tr>
            <tr><td style="padding: 12px 0; color: #b5936a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">Time</td><td style="padding: 12px 0; font-size: 15px;">${timeLabel}</td></tr>
            <tr><td style="padding: 12px 0; color: #b5936a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">Experience</td><td style="padding: 12px 0; font-size: 15px;">${planLabel}</td></tr>
            <tr><td style="padding: 12px 0; color: #b5936a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;">Guests</td><td style="padding: 12px 0; font-size: 15px;">${guests}</td></tr>
          </table>

          <p style="font-size: 14px; line-height: 1.7; color: #777770; margin-top: 28px;">
            If your requested slot is unavailable, we&rsquo;ll reply with the nearest alternative.
            Please reply to this email if you have any questions in the meantime.
          </p>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e0dccc; font-size: 12px; color: #999990;">
            En Chakai 円茶会<br/>
            Sengoku, Bunkyō-ku, Tokyo · 5 min walk from Sengoku Station (Toei Mita Line)<br/>
            Booking ID: ${booking.id}
          </div>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Guest acknowledgement email error:", emailError);
  }

  return NextResponse.json({ success: true, bookingId: booking.id });
}
