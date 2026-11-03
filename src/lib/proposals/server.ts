import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { ClientProposal } from "@prisma/client";
import { CAMPAIGNS, KEY_BISCAYNE_TEMPLATE, KEY_BISCAYNE_TEMPLATE_ES, normalizePrograms, priceProgram, totalSessions, type CampaignKey, type ProposalProgram } from "./types";
import type { Lang } from "./copy";

/** 256-bit random token, URL-safe. The private link is /p/<token>. */
export function newProposalToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Shape guard so a junk path segment never reaches the database. */
export function isTokenShape(token: string): boolean {
  return /^[A-Za-z0-9_-]{40,64}$/.test(token);
}

/** Authentic, authorised before/after results chosen by Emmy. "card" = her designed results card; "pair" = two photos. */
const R = "/proposal-assets/results";
export type ResultCase =
  | { id: string; kind: "card"; image: string; label: string; alt: string }
  | { id: string; kind: "pair"; before: string; after: string; label: string; beforeCaption: string; afterCaption: string };
export const RESULT_CASES: ResultCase[] = [
  { id: "exilis-front", kind: "card", image: `${R}/exilis-front-session1-3.jpg`, label: "exilis® · session 1 → 3", alt: "before and after, front view, exilis session 1 to session 3" },
  { id: "exilis-side", kind: "card", image: `${R}/exilis-side-session1-3.jpg`, label: "exilis® · session 1 → 3", alt: "before and after, side view, exilis session 1 to session 3" },
  { id: "front-s1-s3", kind: "pair", before: `${R}/front-session1-before.jpg`, after: `${R}/front-session3-after.jpg`, label: "session 1 → session 3", beforeCaption: "session 1", afterCaption: "session 3" },
  { id: "sculpt-start", kind: "card", image: `${R}/sculpt-start-abdomen.jpg`, label: "sculpt start™", alt: "before and after, abdomen, sculpt start" },
];
export const DEFAULT_RESULT_IDS = ["exilis-front", "exilis-side", "front-s1-s3", "sculpt-start"];

/** Only what the private page needs. No ids, emails, notes or other clients' data. */
export type ProposalView = {
  token: string | null; // null in sample/preview mode → checkout disabled
  lang: Lang;
  clientName: string;
  locationLabel: string | null;
  zones: string[];
  goals: string[];
  personalMessage: string | null;
  programs: (ProposalProgram & { total: number; pricing: ReturnType<typeof priceProgram> })[];
  recommendedKey: string | null;
  promo: (typeof CAMPAIGNS)[CampaignKey] | null;
  showWelcomeVideo: boolean;
  welcomeVideoSrc: string | null;
  founder: { title: string; bio: string | null };
  results: ResultCase[];
  payment: { status: string | null; programKey: string | null; mode: string | null; balanceDueCents: number };
  assessment: null | {
    cents: number;
    date: string | null; // YYYY-MM-DD, tentative
    timeConfirmed: boolean;
    time: string | null;
    paid: boolean;
    creditAvailableCents: number; // paid and not yet used toward a program
  };
};

export const WELCOME_VIDEO_SRC: string | null = null; // set when Emmy's original hands video is added to /proposal-assets/founder/welcome-video

export async function getProposalSettings() {
  try {
    return (await prisma.proposalSettings.findUnique({ where: { id: "default" } })) ?? null;
  } catch {
    return null;
  }
}

/** A paid assessment deposit not yet credited toward a paid program checkout. */
export async function availableAssessmentCredit(proposalId: string) {
  const paid = await prisma.proposalCheckout.findFirst({ where: { proposalId, kind: "assessment", status: "PAID" }, orderBy: { paidAt: "asc" } });
  if (!paid) return null;
  const used = await prisma.proposalCheckout.findUnique({ where: { creditFromCheckoutId: paid.id } });
  return { checkout: paid, availableCents: used ? 0 : paid.amountCents };
}

export async function buildProposalView(p: ClientProposal, opts: { sample?: boolean } = {}): Promise<ProposalView> {
  const settings = await getProposalSettings();
  const credit = opts.sample || p.id === "sample" ? null : await availableAssessmentCredit(p.id);
  const lang: Lang = p.language === "es" ? "es" : "en";
  const programs = normalizePrograms(p.programs).map((pr) => ({ ...pr, total: totalSessions(pr), pricing: priceProgram(pr) }));
  const campaignKey = (settings ? settings.activeCampaign : "holiday_333") as CampaignKey | null;
  const promo = p.promoEnabled && campaignKey && CAMPAIGNS[campaignKey] ? CAMPAIGNS[campaignKey] : null;
  const known = p.resultCaseIds.filter((id) => RESULT_CASES.some((c) => c.id === id));
  const resultIds = known.length ? known : DEFAULT_RESULT_IDS;
  return {
    token: opts.sample ? null : p.token,
    lang,
    clientName: p.clientName,
    locationLabel: p.locationLabel,
    zones: p.zones,
    goals: p.goals,
    personalMessage: p.personalMessage,
    programs,
    recommendedKey: programs.some((x) => x.key === p.recommendedKey) ? p.recommendedKey : null,
    promo,
    showWelcomeVideo: p.showWelcomeVideo && !!WELCOME_VIDEO_SRC,
    welcomeVideoSrc: WELCOME_VIDEO_SRC,
    founder: {
      title: settings?.founderTitle ?? "the vision behind body shaper system™",
      bio: (lang === "es" ? settings?.founderBioEs : settings?.founderBio) || null,
    },
    results: RESULT_CASES.filter((c) => resultIds.includes(c.id)),
    payment: {
      status: p.checkoutStatus,
      programKey: p.selectedProgramKey,
      mode: p.selectedPaymentMode,
      balanceDueCents: p.balanceDueCents,
    },
    assessment: p.assessmentEnabled
      ? {
          cents: credit?.checkout.amountCents ?? settings?.assessmentCents ?? 35000,
          date: p.assessmentDate ? p.assessmentDate.toISOString().slice(0, 10) : null,
          timeConfirmed: p.assessmentTimeConfirmed && !!p.assessmentTime,
          time: p.assessmentTimeConfirmed ? p.assessmentTime : null,
          paid: !!credit,
          creditAvailableCents: credit?.availableCents ?? 0,
        }
      : null,
  };
}

/** Resolves a public token → active proposal, or null (same 404 for every failure). */
export async function findActiveProposal(token: string) {
  if (!isTokenShape(token)) return null;
  const p = await prisma.clientProposal.findUnique({ where: { token } });
  if (!p || p.status !== "ACTIVE") return null;
  if (p.expiresAt && p.expiresAt.getTime() < Date.now()) return null;
  return p;
}

export async function logProposalEvent(proposalId: string, type: string, data?: Record<string, unknown>) {
  await prisma.proposalEvent.create({ data: { proposalId, type, data: (data ?? undefined) as object | undefined } });
}

/** Sample used only for non-production previews (/p/sample). Placeholder name, no real client. */
export function sampleProposal(lang: Lang = "en"): ClientProposal {
  const now = new Date();
  return {
    id: "sample",
    token: "sample",
    status: "ACTIVE",
    clientId: null,
    leadId: null,
    assessmentEnabled: true,
    assessmentDate: null,
    assessmentTimeConfirmed: false,
    assessmentTime: null,
    clientName: lang === "es" ? "tu nombre" : "your name",
    locationLabel: null,
    language: lang,
    zones: ["legs"],
    goals: ["laxity", "muscle-tone", "firmness"],
    personalMessage: null,
    internalNotes: null,
    programs: (lang === "es"
      ? KEY_BISCAYNE_TEMPLATE_ES.map((p) => {
          const complimentaryArms = p.key === "total-body-optimization" ? 4 : 2;
          return {
            ...p,
            ...(p.key === "sculpt-signature-i"
              ? { sessions: { exilis: 8, endospheres: 6, ems: 0 } }
              : p.key === "total-body-optimization"
                ? { sessions: { exilis: 8, endospheres: 6, ems: 4 } }
                : p.key === "sculpt-signature-ii"
                  ? { sessions: { exilis: 6, endospheres: 4, ems: 4 } }
                  : {}),
            bonus: {
              sessions: { exilis: complimentaryArms },
              label: `${complimentaryArms} sesiones adicionales de Exilis Ultra en brazos de cortesía`,
              fullOnly: false,
            },
          };
        })
      : KEY_BISCAYNE_TEMPLATE) as unknown as ClientProposal["programs"],
    recommendedKey: "sculpt-signature-ii",
    promoEnabled: true,
    showWelcomeVideo: false,
    resultCaseIds: [],
    expiresAt: null,
    programStartDate: null,
    viewCount: 0,
    firstViewedAt: null,
    lastViewedAt: null,
    selectedProgramKey: null,
    selectedPaymentMode: null,
    checkoutStatus: null,
    amountPaidCents: 0,
    balanceDueCents: 0,
    splitConsentAt: null,
    splitConsentText: null,
    createdById: null,
    createdAt: now,
    updatedAt: now,
  };
}
