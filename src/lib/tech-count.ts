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

/* ------------------------------------------------------------------ */
/* Package tracker (Hub-only)                                          */
/* ------------------------------------------------------------------ */

/** Stored on BlueprintAssessment.packageTechnologies. */
export type PackageTechnologies = {
  /** yyyy-mm-dd — appointments before this belong to an earlier package. */
  since: string;
  items: { name: string; total: number }[];
};

export type PackageTrackerRow = {
  name: string;
  total: number;
  done: number;
  scheduled: number;
  /** Still to be booked: total − done − scheduled (never below 0). */
  toBook: number;
  complete: boolean;
  /** One entry per session in the package, in order — for the wave view. */
  sessions: { n: number; state: "done" | "booked" | "open"; at: string | null }[];
};

export function parsePackageTechnologies(raw: unknown): PackageTechnologies | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { since?: unknown; items?: unknown };
  if (typeof r.since !== "string" || !Array.isArray(r.items)) return null;
  const items = r.items
    .filter((i): i is { name: string; total: number } => !!i && typeof i.name === "string" && typeof i.total === "number" && i.total > 0)
    .map((i) => ({ name: i.name, total: Math.floor(i.total) }));
  return { since: r.since, items };
}

/**
 * done      = highest # recorded on a COMPLETED appointment in this package
 * scheduled = upcoming SCHEDULED appointments in this package that include it
 */
export function computePackageTracker(
  pkg: PackageTechnologies,
  appointments: { startsAt: Date | string; status: string; technologies: unknown }[],
  now: Date = new Date()
): PackageTrackerRow[] {
  const since = new Date(pkg.since + "T00:00:00").getTime();
  const inPackage = appointments.filter((a) => new Date(a.startsAt).getTime() >= since);

  return pkg.items.map(({ name, total }) => {
    const key = techKey(name);
    let done = 0;
    let scheduled = 0;
    const doneAt = new Map<number, string>();
    const upcoming: { at: string; number: number | null }[] = [];
    for (const a of inPackage) {
      if (!Array.isArray(a.technologies)) continue;
      const t = (a.technologies as TechEntry[]).find((x) => x?.name && techKey(x.name) === key);
      if (!t) continue;
      const at = new Date(a.startsAt).toISOString();
      if (a.status === "COMPLETED" && typeof t.number === "number") {
        done = Math.max(done, t.number);
        doneAt.set(t.number, at);
      }
      if (a.status === "SCHEDULED" && new Date(a.startsAt).getTime() >= now.getTime()) {
        scheduled += 1;
        upcoming.push({ at, number: typeof t.number === "number" ? t.number : null });
      }
    }
    done = Math.min(done, total);
    const toBook = Math.max(total - done - scheduled, 0);
    upcoming.sort((x, y) => x.at.localeCompare(y.at));
    const sessions: PackageTrackerRow["sessions"] = Array.from({ length: total }, (_, i) => ({
      n: i + 1,
      state: i + 1 <= done ? "done" : "open",
      at: i + 1 <= done ? doneAt.get(i + 1) ?? null : null,
    }));
    upcoming.forEach((u, i) => {
      const n = u.number && u.number > done ? u.number : done + i + 1;
      const s = sessions[n - 1];
      if (s && s.state === "open") Object.assign(s, { state: "booked", at: u.at });
    });
    return { name, total, done, scheduled, toBook, complete: done >= total, sessions };
  });
}
