// Public booking window — single source of truth (EC-14).
// Public bookings are only allowed for slots 14+ days ahead of "today" in
// Asia/Tokyo. Admin flows are NOT restricted by this.

export const PUBLIC_BOOKING_LEAD_DAYS = 14;

/** Today's date in Asia/Tokyo as "YYYY-MM-DD" (en-CA locale formats ISO-style). */
export function todayInTokyo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
}

/** First publicly bookable date ("YYYY-MM-DD") = Tokyo today + 14 days. */
export function publicBookingCutoff(): string {
  // Date math in UTC on a plain calendar date avoids DST/local-tz off-by-one.
  const d = new Date(`${todayInTokyo()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + PUBLIC_BOOKING_LEAD_DAYS);
  return d.toISOString().slice(0, 10);
}

/** True if a slot date ("YYYY-MM-DD") is far enough ahead for public booking. */
export function isPubliclyBookable(dateStr: string): boolean {
  // Lexicographic compare is safe for zero-padded YYYY-MM-DD strings.
  return dateStr >= publicBookingCutoff();
}
