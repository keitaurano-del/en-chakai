export const TIME_SLOTS = ["10:00", "14:00", "16:00"] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  "10:00": "Morning — 10:00",
  "14:00": "Afternoon — 14:00",
  "16:00": "Late afternoon — 16:00",
};

export const PLAN_LABELS: Record<string, string> = {
  conversation: "The Tea Ceremony — $70 (¥10,000) / 60 min / Up to 4 guests",
};

export const PLAN_MAX_GUESTS: Record<string, number> = {
  conversation: 4,
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
