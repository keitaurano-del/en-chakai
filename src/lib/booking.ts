export const TIME_SLOTS = ["10:00", "14:00", "16:00"] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  "10:00": "Morning — 10:00",
  "14:00": "Afternoon — 14:00",
  "16:00": "Late afternoon — 16:00",
};

export const PLAN_LABELS: Record<string, string> = {
  encounter: "The Encounter — ¥7,000 / 45 min / Up to 6 guests",
  conversation: "The Conversation — ¥10,000 / 60 min / Up to 4 guests",
  "quiet-hour": "The Quiet Hour — ¥12,000 / 75 min / Private, up to 2 guests",
};

export const PLAN_MAX_GUESTS: Record<string, number> = {
  encounter: 6,
  conversation: 4,
  "quiet-hour": 2,
};

// Sunday = 0, Monday = 1
export const CLOSED_DAYS = [0, 1];

export function isClosedDay(date: Date): boolean {
  return CLOSED_DAYS.includes(date.getDay());
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
