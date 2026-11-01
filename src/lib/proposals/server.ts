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

/** Published before/after cases already on /transformations (authorised for publication). */
export const RESULT_CASES = [
  { id: "case1", before: "/images/transformations/case1-before.jpg", after: "/images/transformations/case1-after.jpg", system: "sculpt start™", technologies: "exilis®", sessions: 4 },
  { id: "case2", before: "/images/transformations/case2-before.jpg", after: "/images/transformations/case2-after.jpg", system: "sculpt signature™", technologies: "exilis® + endospheres®", sessions: 6 },
  { id: "case3", before: "/images/transformations/case3-before.jpg", after: "/images/transformations/case3-after.jpg", system: "total body optimization™", technologies: "exilis® + ems®", sessions: 6 },
  { id: "case4", before: "/images/transformations/case4-before.jpg", after: "/images/transformations/case4-after.jpg", system: "glp-1 reshape™", technologies: "exilis® + lymphatic protocols™", sessions: 4 },
  { id: "case5", before: "/images/transformations/case5-before.jpg", after: "/images/transformations/case5-after.jpg", system: "sculpt start™", technologies: "exilis®", sessions: 1 },
] as const;
export const DEFAULT_RESULT_IDS = ["case2", "case3"];

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
  results: (typeof RESULT_CASES)[number][];
  payment: { status: string | null; programKey: string | null; mode: string | null; balanceDueCents: number };
};

export const WELCOME_VIDEO_SRC: string | null = null; // set when Emmy's original hands video is added to /proposal-assets/founder/welcome-video

export async function getProposalSettings() {
  try {
    return (await prisma.proposalSettings.findUnique({ where: { id: "default" } })) ?? null;
  } catch {
    return null;
  }
}

export async function buildProposalView(p: ClientProposal, opts: { sample?: boolean } = {}): Promise<ProposalView> {
  const settings = await getProposalSettings();
  const lang: Lang = p.language === "es" ? "es" : "en";
  const programs = normalizePrograms(p.programs).map((pr) => ({ ...pr, total: totalSessions(pr), pricing: priceProgram(pr) }));
  const campaignKey = (settings ? settings.activeCampaign : "holiday_333") as CampaignKey | null;
  const promo = p.promoEnabled && campaignKey && CAMPAIGNS[campaignKey] ? CAMPAIGNS[campaignKey] : null;
  const resultIds = p.resultCaseIds.length ? p.resultCaseIds : DEFAULT_RESULT_IDS;
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
    clientName: lang === "es" ? "tu nombre" : "your name",
    locationLabel: null,
    language: lang,
    zones: ["legs"],
    goals: ["laxity", "muscle-tone", "firmness"],
    personalMessage: null,
    internalNotes: null,
    programs: (lang === "es" ? KEY_BISCAYNE_TEMPLATE_ES : KEY_BISCAYNE_TEMPLATE) as unknown as ClientProposal["programs"],
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
