/**
 * Client Proposals™ — shared types and pure helpers.
 * Pure (no Prisma / no Stripe) so the same pricing code runs on the
 * server (the only place amounts are trusted) and in the browser
 * (display only).
 */

export const TECHNOLOGIES = ["exilis", "endospheres", "ems"] as const;
export type TechnologyKey = (typeof TECHNOLOGIES)[number];

export type ProposalProgram = {
  key: string; // stable slug, e.g. "sculpt-signature-ii"
  name: string; // official system name, lowercase in the design
  description: string; // personalised description for this client
  focus: string[]; // protocol objectives shown as a list
  sessions: Record<TechnologyKey, number>;
  totalCents: number; // regular program total
  fullDiscountCents: number; // "pay in full" saving (default $100)
  allowSplit: boolean; // "pay in 2" available
};

export type PaymentMode = "full" | "split";

export const ZONES = ["legs", "abdomen", "arms", "glutes", "waist"] as const;
export type ZoneKey = (typeof ZONES)[number];

export const GOALS = ["firmness", "laxity", "texture", "contour", "muscle-tone"] as const;
export type GoalKey = (typeof GOALS)[number];

export function totalSessions(p: Pick<ProposalProgram, "sessions">): number {
  return TECHNOLOGIES.reduce((n, t) => n + (Number(p.sessions?.[t]) || 0), 0);
}

export type ProgramPricing = {
  regularCents: number;
  fullCents: number; // amount charged when paying in full
  savingCents: number;
  split: null | { firstCents: number; secondCents: number; totalCents: number };
};

/**
 * The single source of truth for what a client is charged.
 * Pay in full = regular total − saving. Pay in 2 = the regular total in
 * two installments (first at booking, second in Week 2). If the total
 * has an odd cent, the first installment carries it.
 */
export function priceProgram(p: ProposalProgram): ProgramPricing {
  const regular = Math.max(0, Math.round(Number(p.totalCents) || 0));
  const saving = Math.min(regular, Math.max(0, Math.round(Number(p.fullDiscountCents) || 0)));
  const second = Math.floor(regular / 2);
  return {
    regularCents: regular,
    fullCents: regular - saving,
    savingCents: saving,
    split: p.allowSplit && regular > 0 ? { firstCents: regular - second, secondCents: second, totalCents: regular } : null,
  };
}

export function money(cents: number, opts: { cents?: boolean } = {}): string {
  const v = cents / 100;
  return `$${v.toLocaleString("en-US", {
    minimumFractionDigits: opts.cents ? 2 : 0,
    maximumFractionDigits: opts.cents ? 2 : v % 1 === 0 ? 0 : 2,
  })}`;
}

/** Validates/normalises programs coming from the Hub form or the DB JSON. */
export function normalizePrograms(raw: unknown): ProposalProgram[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: ProposalProgram[] = [];
  for (const r of raw as Record<string, unknown>[]) {
    if (!r || typeof r !== "object") continue;
    const name = String(r.name ?? "").trim().slice(0, 80);
    if (!name) continue;
    let key = String(r.key ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    if (!key) key = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    while (seen.has(key)) key += "-x";
    seen.add(key);
    const s = (r.sessions ?? {}) as Record<string, unknown>;
    const int = (v: unknown, max: number) => Math.min(max, Math.max(0, Math.round(Number(v) || 0)));
    out.push({
      key,
      name,
      description: String(r.description ?? "").trim().slice(0, 600),
      focus: (Array.isArray(r.focus) ? r.focus : String(r.focus ?? "").split("\n"))
        .map((x) => String(x).trim())
        .filter(Boolean)
        .slice(0, 8),
      sessions: { exilis: int(s.exilis, 60), endospheres: int(s.endospheres, 60), ems: int(s.ems, 60) },
      totalCents: int(r.totalCents, 10_000_000),
      fullDiscountCents: int(r.fullDiscountCents ?? 10000, 10_000_000),
      allowSplit: r.allowSplit === undefined ? true : Boolean(r.allowSplit),
    });
  }
  return out.slice(0, 6);
}

/** Official programs with the Key Biscayne figures as the starting template. */
export const KEY_BISCAYNE_TEMPLATE: ProposalProgram[] = [
  {
    key: "sculpt-signature-i",
    name: "sculpt signature i",
    description: "a focused program to improve the look of firmness, texture and muscle tone in your legs.",
    focus: ["firmer-looking skin on the legs", "improved muscle tone", "smoother texture"],
    sessions: { exilis: 5, endospheres: 3, ems: 4 },
    totalCents: 213000,
    fullDiscountCents: 10000,
    allowSplit: true,
  },
  {
    key: "sculpt-signature-ii",
    name: "sculpt signature ii",
    description: "a more complete approach for firmness, texture, tone and leg contour.",
    focus: ["firmer-looking skin", "muscle tone and definition", "leg contour", "texture"],
    sessions: { exilis: 6, endospheres: 4, ems: 5 },
    totalCents: 252000,
    fullDiscountCents: 10000,
    allowSplit: true,
  },
  {
    key: "total-body-optimization",
    name: "total body optimization",
    description: "our most complete experience to optimize the look of skin firmness, texture and muscle tone.",
    focus: ["skin firmness and texture", "muscle tone", "overall contour"],
    sessions: { exilis: 6, endospheres: 6, ems: 6 },
    totalCents: 270000,
    fullDiscountCents: 10000,
    allowSplit: true,
  },
];

/** Same programs and prices, Spanish copy (for proposals in Spanish). */
export const KEY_BISCAYNE_TEMPLATE_ES: ProposalProgram[] = KEY_BISCAYNE_TEMPLATE.map((p, i) => ({
  ...p,
  description: [
    "un programa enfocado en mejorar la apariencia de firmeza, textura y tono muscular de tus piernas.",
    "un enfoque más completo para la firmeza, la textura, el tono y el contorno de tus piernas.",
    "nuestra experiencia más completa para optimizar la apariencia de firmeza, textura y tono muscular.",
  ][i],
  focus: [
    ["piel de aspecto más firme en las piernas", "mejor tono muscular", "textura más uniforme"],
    ["piel de aspecto más firme", "tono y definición muscular", "contorno de piernas", "textura"],
    ["firmeza y textura de la piel", "tono muscular", "contorno general"],
  ][i],
}));

/** The current seasonal campaign. Prices/terms mirror /holiday-333 and its existing checkout. */
export const CAMPAIGNS = {
  holiday_333: {
    key: "holiday_333",
    eyebrow: "holiday special",
    title: "the 333 holiday sculpt ritual",
    image: "/proposal-assets/campaigns/333-holiday-ritual/gift-box-satin-ribbon.png",
    sessions: { exilis: 3, endospheres: 3, ems: 3 } as Record<TechnologyKey, number>,
    fullCents: 129000,
    installmentCents: 64500,
    regularCents: 157500,
    terms:
      "At least 3 of the 9 treatments must be completed before January 27, 2027. Remaining sessions may be completed afterward on your personalized schedule. Subject to treatment suitability and appointment availability. Results vary.",
    paymentNote:
      "Pay $1,290 in full, or two installments of $645. The first is paid at checkout; the second is due during Week 2 of your actual treatment program.",
    termsEs:
      "Al menos 3 de los 9 tratamientos deben completarse antes del 27 de enero de 2027. Las sesiones restantes pueden completarse después según tu agenda personalizada. Sujeto a idoneidad del tratamiento y disponibilidad de citas. Los resultados varían.",
    paymentNoteEs:
      "Paga $1,290 completo, o dos cuotas de $645. La primera se paga al reservar; la segunda vence durante la semana 2 de tu programa real.",
  },
} as const;
export type CampaignKey = keyof typeof CAMPAIGNS;
