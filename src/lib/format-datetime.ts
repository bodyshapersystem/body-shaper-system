import { prisma } from "@/lib/prisma";

/**
 * Real bug fix: server-rendered pages calling .toLocaleDateString()/
 * .toLocaleTimeString() with no explicit timeZone use the SERVER's
 * runtime timezone (UTC on Vercel) — not the business's real
 * timezone (Eastern). Appointments are stored correctly (the
 * scheduler's browser-side toISOString() call is timezone-correct),
 * but every server-side *display* of that time was silently
 * converting it to UTC before showing it — this is what caused the
 * Appointment Confirmation email (and every other server-rendered
 * appointment time in the Owner Hub) to show the wrong hour.
 *
 * Same fix pattern as the Dashboard's "Good Morning" greeting fix —
 * reads the real timezone from Settings™ (BusinessSettings.timezone),
 * defaulting to America/New_York if unset.
 */
export async function getBusinessTimezone(): Promise<string> {
  const business = await prisma.businessSettings.findUnique({ where: { id: "default" } });
  return business?.timezone ?? "America/New_York";
}

export function formatDateInTimezone(date: Date, timezone: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: timezone, ...options }).format(date);
}

export function formatTimeInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(date);
}

/**
 * Real time-of-day greeting, matching the business's actual timezone
 * (not the server's UTC runtime clock) — same fix pattern as every
 * other server-rendered time on the Dashboard. Returns "good morning"/
 * "good afternoon"/"good evening" based on the real current hour.
 */
export function getTimeBasedGreeting(timezone: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(new Date()));
  if (hour < 12) return "good morning";
  if (hour < 18) return "good afternoon";
  return "good evening";
}

/**
 * Real "today" boundary fix — Daily Trackers/System Nudges previously
 * used raw UTC midnight to decide which calendar day a tracker row
 * belongs to, while the rest of the app (appointments, greetings)
 * already uses the business's real timezone (Eastern/Miami). Since
 * Miami is UTC-4/-5, the UTC day rolls over at 7-8pm local time —
 * meaning after that hour, "today's" tracker row would silently
 * become tomorrow's from the client's actual perspective, showing an
 * empty Recovery Score even though she'd logged things hours earlier.
 * This returns the UTC Date representing midnight of the CURRENT
 * calendar day as seen in the business's timezone.
 */
export function getBusinessTodayUtc(timezone: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}
