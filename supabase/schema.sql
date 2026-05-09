-- ============================================================
-- En Chakai — Booking System Schema
-- ============================================================

-- Available time slots (managed by admin)
CREATE TABLE IF NOT EXISTS available_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE NOT NULL,
  time_slot   TEXT NOT NULL CHECK (time_slot IN ('10:00', '14:00', '16:00')),
  is_open     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (date, time_slot)
);

-- Bookings submitted by guests
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         UUID NOT NULL REFERENCES available_slots(id),
  plan            TEXT NOT NULL CHECK (plan IN ('encounter', 'conversation', 'quiet-hour')),
  guests          INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 6),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  seating         TEXT NOT NULL CHECK (seating IN ('floor', 'chair')),
  dietary         TEXT,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_slots_date ON available_slots(date);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Row Level Security
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public can read open slots
CREATE POLICY "Public can read open slots"
  ON available_slots FOR SELECT
  USING (is_open = true);

-- Public can insert bookings
CREATE POLICY "Public can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Service role can do everything (used by admin API routes)
CREATE POLICY "Service role full access to slots"
  ON available_slots FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to bookings"
  ON bookings FOR ALL
  USING (auth.role() = 'service_role');
