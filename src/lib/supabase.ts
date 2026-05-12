import { createClient } from "@supabase/supabase-js";

export type Slot = {
  id: string;
  date: string;       // "YYYY-MM-DD"
  time_slot: "10:00" | "14:00" | "16:00";
  is_open: boolean;
};

export type Booking = {
  id: string;
  slot_id: string;
  plan: "conversation";
  guests: number;
  name: string;
  email: string;
  dietary: string | null;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  available_slots?: Slot;
};

export type BookingInsert = Omit<Booking, "id" | "created_at" | "status" | "available_slots">;

// Public client — used in browser (read slots, insert booking)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Service client — used in API routes only (full access)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
