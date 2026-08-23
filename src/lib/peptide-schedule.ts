const DAY_ORDER = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Real computation of the next scheduled injection — not a guess.
 * Daily: today at injectionTime if not yet passed, else tomorrow.
 * Weekly/Bi-weekly/Custom: the next occurrence of any injectionDays
 * (today included if the time hasn't passed yet) at injectionTime.
 */
export function computeNextInjection(
  frequency: string,
  injectionDays: string[],
  injectionTime: string, // "HH:MM" 24h
  now: Date = new Date()
): Date {
  const [h, m] = injectionTime.split(":").map(Number);

  if (frequency === "Daily" || injectionDays.length === 0) {
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }

  const targetIndexes = injectionDays.map((d) => DAY_ORDER.indexOf(d)).filter((i) => i >= 0);
  if (targetIndexes.length === 0) {
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }

  for (let offset = 0; offset < 14; offset++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    candidate.setHours(h, m, 0, 0);
    if (targetIndexes.includes(candidate.getDay()) && candidate > now) {
      return candidate;
    }
  }
  // Fallback (shouldn't happen with valid input): one week out.
  const fallback = new Date(now);
  fallback.setDate(fallback.getDate() + 7);
  fallback.setHours(h, m, 0, 0);
  return fallback;
}

export function daysUntilLabel(target: Date, now: Date = new Date()): string {
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "in 1 day";
  return `in ${diffDays} days`;
}
