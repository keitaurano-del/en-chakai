import { NextRequest, NextResponse } from "next/server";
import { insertInquiry } from "@/lib/db";
import { Resend } from "resend";

// EC-14: inquiry form for dates within the 2-week public booking window.
// Persists to data/inquiries.json and notifies the host by email.
// No email is sent to the customer.

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL ?? "keita.urano@gmail.com";
// Sender must be a Resend-verified domain; falls back to Resend's shared onboarding sender.
const EMAIL_FROM = process.env.EMAIL_FROM ?? "En Chakai <onboarding@resend.dev>";

// Resend is optional — without RESEND_API_KEY, emails are skipped gracefully.
function getResend(): Resend | null {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const desiredDate =
    typeof body.desired_date === "string" ? body.desired_date.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const rawPartySize = Number(body.party_size);
  const partySize =
    Number.isInteger(rawPartySize) && rawPartySize >= 1 && rawPartySize <= 99
      ? rawPartySize
      : null;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (name.length > 200 || desiredDate.length > 200 || message.length > 4000) {
    return NextResponse.json({ error: "Input is too long." }, { status: 400 });
  }

  let inquiry;
  try {
    inquiry = insertInquiry({
      name,
      email,
      desired_date: desiredDate || null,
      party_size: partySize,
      message,
    });
  } catch (err) {
    console.error("Inquiry insert error:", err);
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
  }

  // Notify the host (same visual pattern as booking notification). Customer gets no email.
  try {
    await getResend()?.emails.send({
      from: EMAIL_FROM,
      to: NOTIFICATION_EMAIL,
      subject: `New inquiry — ${name}${desiredDate ? ` · ${desiredDate}` : ""}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1e1e1a; color: #f0ebe0;">
          <h1 style="font-size: 24px; font-weight: 500; margin-bottom: 24px; color: #b5936a;">
            New Inquiry (within 2 weeks / other)
          </h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #b5936a; width: 160px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Name</td><td style="padding: 8px 0; font-size: 15px;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td><td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${escapeHtml(email)}" style="color: #b5936a;">${escapeHtml(email)}</a></td></tr>
            ${desiredDate ? `<tr><td style="padding: 8px 0; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Desired date</td><td style="padding: 8px 0; font-size: 15px;">${escapeHtml(desiredDate)}</td></tr>` : ""}
            ${partySize ? `<tr><td style="padding: 8px 0; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Party size</td><td style="padding: 8px 0; font-size: 15px;">${partySize}</td></tr>` : ""}
            <tr style="border-top: 1px solid #333;"><td style="padding: 16px 0 8px; color: #b5936a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Message</td><td style="padding: 16px 0 8px; font-size: 15px; white-space: pre-wrap;">${escapeHtml(message)}</td></tr>
          </table>
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #333; font-size: 13px; color: #8a8275;">
            Inquiry ID: ${inquiry.id}
          </div>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Inquiry notification email error:", emailError);
  }

  return NextResponse.json({ success: true, inquiryId: inquiry.id });
}
