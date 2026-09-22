export const ASIA_TZ = "Asia/Kolkata";

export function asiaParts(date: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: ASIA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  const hour = Number(map["hour"] ?? "0");
  return {
    hour,
    minute: map["minute"] ?? "00",
    second: map["second"] ?? "00",
    clock: `${String(hour).padStart(2, "0")}:${map["minute"]}`,
    longDate: `${map["weekday"]}, ${map["day"]} ${map["month"]} ${map["year"]}`,
    isNight: hour < 6 || hour >= 18,
  };
}

/** Y-M-D key in Asia time, used for daily state (habits, mood, quote). */
export function asiaDayKey(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ASIA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function lastNDayKeys(n: number) {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(asiaDayKey(new Date(Date.now() - i * 86400000)));
  }
  return out;
}

export function greetingFor(hour: number, name?: string | null) {
  const label = name?.trim() ?? "Abdullah";
  if (hour < 5) return `Still up, ${label}?`;
  if (hour < 12) return `Good morning, ${label}`;
  if (hour < 17) return `Good afternoon, ${label}`;
  if (hour < 21) return `Good evening, ${label}`;
  return `Good night, ${label}`;
}

/** How many days of history the tracker keeps. */
export const HISTORY_DAYS = 90;

/** Short labels for a Y-M-D day key: { weekday: "Mon", day: "18", month: "Aug" } */
export function dayLabels(dayKey: string) {
  const date = new Date(`${dayKey}T12:00:00Z`);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  return {
    weekday: (map["weekday"] ?? "").slice(0, 3),
    day: map["day"] ?? dayKey.slice(8),
    month: map["month"] ?? "",
  };
}

/** "pending since yesterday" / "pending since two days" / "pending since N days" */
export function pendingSinceText(createdAtIso: string): string | null {
  if (!createdAtIso) return null;
  const createdKey = asiaDayKey(new Date(createdAtIso));
  const todayKey = asiaDayKey();
  const diff = Math.round(
    (new Date(`${todayKey}T12:00:00Z`).getTime() -
      new Date(`${createdKey}T12:00:00Z`).getTime()) /
      86_400_000,
  );
  if (diff <= 0) return null;
  if (diff === 1) return "pending since yesterday";
  if (diff === 2) return "pending since two days";
  return `pending since ${diff} days`;
}

/** "2026-08" */
export const monthKeyOf = (dayKey: string) => dayKey.slice(0, 7);

/** "2026-Q3" */
export function quarterKeyOf(dayKey: string) {
  const month = Number(dayKey.slice(5, 7));
  return `${dayKey.slice(0, 4)}-Q${Math.floor((month - 1) / 3) + 1}`;
}

export function monthLabel(monthKey: string) {
  const date = new Date(`${monthKey}-01T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    month: "short",
    year: "2-digit",
  }).format(date);
}
