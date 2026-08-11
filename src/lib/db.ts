// Local JSON file storage — replaces Supabase.
// Data lives in <repo>/data/*.json (gitignored). Low-traffic assumption:
// read-modify-write is done synchronously (atomic tmp+rename) to avoid corruption.
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Slot = {
  id: string;
  date: string; // "YYYY-MM-DD"
  time_slot: "10:00" | "14:00" | "16:00";
  is_open: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  slot_id: string;
  plan: string;
  guests: number;
  name: string;
  email: string;
  seating: "floor" | "chair";
  dietary: string | null;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  // Stripe 決済（optional — 既存データとの後方互換のため任意フィールド）
  payment_link_id?: string;
  payment_url?: string;
  payment_status?: "unpaid" | "paid";
  paid_at?: string;
};

export type BookingWithSlot = Booking & { available_slots: Slot | null };

const DATA_DIR = path.join(process.cwd(), "data");
const SLOTS_FILE = path.join(DATA_DIR, "slots.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

function readJson<T>(file: string): T[] {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJson<T>(file: string, rows: T[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(rows, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, file);
}

// ── Slots ────────────────────────────────────────────────────────────────────

export function listSlots(opts: { from?: string | null; to?: string | null; openOnly?: boolean } = {}): Slot[] {
  let rows = readJson<Slot>(SLOTS_FILE);
  if (opts.from) rows = rows.filter((s) => s.date >= opts.from!);
  if (opts.to) rows = rows.filter((s) => s.date <= opts.to!);
  if (opts.openOnly) rows = rows.filter((s) => s.is_open);
  return rows.sort((a, b) =>
    a.date === b.date ? a.time_slot.localeCompare(b.time_slot) : a.date.localeCompare(b.date)
  );
}

export function findOpenSlot(date: string, time_slot: string): Slot | null {
  return (
    readJson<Slot>(SLOTS_FILE).find(
      (s) => s.date === date && s.time_slot === time_slot && s.is_open
    ) ?? null
  );
}

// Upsert on (date, time_slot) — mirrors the old UNIQUE constraint.
export function upsertSlot(input: { date: string; time_slot: Slot["time_slot"]; is_open?: boolean }): Slot {
  const rows = readJson<Slot>(SLOTS_FILE);
  const existing = rows.find((s) => s.date === input.date && s.time_slot === input.time_slot);
  if (existing) {
    if (input.is_open !== undefined) existing.is_open = input.is_open;
    writeJson(SLOTS_FILE, rows);
    return existing;
  }
  const slot: Slot = {
    id: randomUUID(),
    date: input.date,
    time_slot: input.time_slot,
    is_open: input.is_open ?? true,
    created_at: new Date().toISOString(),
  };
  rows.push(slot);
  writeJson(SLOTS_FILE, rows);
  return slot;
}

export function updateSlot(id: string, patch: Partial<Pick<Slot, "is_open">>): Slot | null {
  const rows = readJson<Slot>(SLOTS_FILE);
  const slot = rows.find((s) => s.id === id);
  if (!slot) return null;
  Object.assign(slot, patch);
  writeJson(SLOTS_FILE, rows);
  return slot;
}

export function deleteSlot(id: string): boolean {
  const rows = readJson<Slot>(SLOTS_FILE);
  const next = rows.filter((s) => s.id !== id);
  if (next.length === rows.length) return false;
  writeJson(SLOTS_FILE, next);
  return true;
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export function insertBooking(
  input: Omit<Booking, "id" | "status" | "created_at">
): Booking {
  const rows = readJson<Booking>(BOOKINGS_FILE);
  const booking: Booking = {
    ...input,
    id: randomUUID(),
    status: "pending",
    created_at: new Date().toISOString(),
  };
  rows.push(booking);
  writeJson(BOOKINGS_FILE, rows);
  return booking;
}

export function listBookings(limit = 100): BookingWithSlot[] {
  const slots = readJson<Slot>(SLOTS_FILE);
  const byId = new Map(slots.map((s) => [s.id, s]));
  return readJson<Booking>(BOOKINGS_FILE)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map((b) => ({ ...b, available_slots: byId.get(b.slot_id) ?? null }));
}

// 任意フィールドの部分更新（Stripe 決済情報の保存などに使用）
export function updateBooking(
  id: string,
  patch: Partial<Omit<Booking, "id" | "created_at">>
): BookingWithSlot | null {
  const rows = readJson<Booking>(BOOKINGS_FILE);
  const booking = rows.find((b) => b.id === id);
  if (!booking) return null;
  Object.assign(booking, patch);
  writeJson(BOOKINGS_FILE, rows);
  const slot = readJson<Slot>(SLOTS_FILE).find((s) => s.id === booking.slot_id) ?? null;
  return { ...booking, available_slots: slot };
}

export function updateBookingStatus(id: string, status: Booking["status"]): BookingWithSlot | null {
  const rows = readJson<Booking>(BOOKINGS_FILE);
  const booking = rows.find((b) => b.id === id);
  if (!booking) return null;
  booking.status = status;
  writeJson(BOOKINGS_FILE, rows);
  const slot = readJson<Slot>(SLOTS_FILE).find((s) => s.id === booking.slot_id) ?? null;
  return { ...booking, available_slots: slot };
}
