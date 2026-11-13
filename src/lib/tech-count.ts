/**
 * Per-technology session count ("Exilis #3", "Endospheres #1").
 *
 * Each entry in Appointment.technologies can carry an optional
 * `number` — the specialist's own running count for that technology
 * inside the client's current package. It is always editable by hand
 * (a new package starts again at 1), and the scheduler only *suggests*
 * the next number from the client's most recent numbered appointment.
 */

export type TechEntry = { name: string; number?: number | null; [key: string]: unknown };

/** "Exilis Elite™" / "Exilis" / "EMS™" / "EMS" → comparable key. */
export function techKey(name: string): string {
  return name
    .replace(/[™®]/g, "")
    .replace(/elite/i, "")
    .trim()
    .toLowerCase();
}

/** "Exilis Elite™ #3" — or just the name when no count was entered. */
export function formatTech(t: { name: string; number?: number | null }): string {
  return t.number ? `${t.name} #${t.number}` : t.name;
}

export function formatTechList(list: { name: string; number?: number | null }[] | null | undefined): string {
  return (list ?? []).map(formatTech).join(" + ");
}

/**
 * Next suggested number per technology: the most recent (by date)
 * non-cancelled appointment that has a number for that technology,
 * plus one. Technologies never numbered get no suggestion.
 */
export function suggestNextTechNumbers(
  appointments: { startsAt: Date | string; technologies: unknown }[]
): Record<string, number> {
  const sorted = [...appointments].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  const next: Record<string, number> = {};
  for (const a of sorted) {
    if (!Array.isArray(a.technologies)) continue;
    for (const t of a.technologies as TechEntry[]) {
      if (!t?.name || typeof t.number !== "number") continue;
      const key = techKey(t.name);
      if (next[key] === undefined) next[key] = t.number + 1;
    }
  }
  return next;
}
