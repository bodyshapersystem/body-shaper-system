/**
 * Black Friday EMS offer — the single source of truth for packages, prices and the deadline.
 * Prices are only ever read from here on the server (checkout + webhook); the browser sends a
 * package key, never an amount.
 */
export const BLACK_FRIDAY_FLOW = "black_friday_ems";

export const BLACK_FRIDAY_PACKS = {
  "4": { sessions: 4, amountCents: 59000, label: "4 EMS sessions", saveUpTo: 50 },
  "6": { sessions: 6, amountCents: 83000, label: "6 EMS sessions", saveUpTo: 53 },
  "12": { sessions: 12, amountCents: 150000, label: "12 EMS sessions", saveUpTo: 58 },
} as const;

/** Individual EMS session price range used for the savings line ($250–$300). "Save up to" = vs. $300, rounded down. */
export const INDIVIDUAL_SESSION_CENTS = { low: 25000, high: 30000 } as const;

export type BlackFridayPackKey = keyof typeof BLACK_FRIDAY_PACKS;

/** Last moment the offer can be purchased: December 1st, 2026, 11:59:59 PM Miami time (EST, UTC−5). */
export const BLACK_FRIDAY_ENDS_AT = new Date("2026-12-02T04:59:59.999Z");

export function isBlackFridayPack(v: unknown): v is BlackFridayPackKey {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(BLACK_FRIDAY_PACKS, v);
}

export function blackFridayOpen(now: Date = new Date()) {
  return now.getTime() <= BLACK_FRIDAY_ENDS_AT.getTime();
}

export const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;
