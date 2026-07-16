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
