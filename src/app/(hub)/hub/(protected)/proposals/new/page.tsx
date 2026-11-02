import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { KEY_BISCAYNE_TEMPLATE, type GoalKey, type ZoneKey } from "@/lib/proposals/types";
import type { ProposalInput } from "../actions";
import { RESULT_CASES, WELCOME_VIDEO_SRC } from "@/lib/proposals/server";
import ProposalBuilder from "../ProposalBuilder";
import "../hub-proposals.css";

export const dynamic = "force-dynamic";

export default async function NewProposalPage({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");
  if (!hasPermission(user, "payments.manage")) redirect("/hub/dashboard");
  const { leadId } = await searchParams;
  const lead = leadId ? await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, firstName: true, lastName: true, city: true, goals: true, convertedClient: { select: { id: true } }, blueprintAssessment: { select: { jotformRawData: true } } } }) : null;
  const prefill = lead ? leadPrefill(lead) : null;
  const clients = await prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true, city: true } });
  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow"><Link href="/hub/proposals">client proposals</Link></p>
        <h1>new proposal.</h1>
      </div>
      <ProposalBuilder
        initial={prefill}
        clients={clients.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, firstName: c.firstName, city: c.city }))}
        resultCases={RESULT_CASES.map((c) => ({ id: c.id, label: c.label + (c.kind === "card" && c.id.includes("side") ? " (side)" : "") }))}
        videoAvailable={!!WELCOME_VIDEO_SRC}
        leadLabel={lead ? `${lead.firstName} ${lead.lastName}` : null}
      />
    </div>
  );
}

const AREA_TO_ZONE: Record<string, ZoneKey> = { Abdomen: "abdomen", Waist: "waist", Flanks: "waist", Hips: "waist", Arms: "arms", "Inner Thighs": "legs", "Outer Thighs": "legs", Knees: "legs", Glutes: "glutes" };
const GOAL_TO_KEY: Record<string, GoalKey> = { "Body Contouring": "contour", "Localized Fat Reduction": "fat-reduction", "Skin Tightening": "firmness", "Cellulite Improvement": "texture", "Muscle Toning": "muscle-tone" };

/** Pre-fills the builder from the lead and her Body Blueprint™ answers (name, areas, goals, history). */
function leadPrefill(lead: { id: string; firstName: string; lastName: string; city: string | null; goals: string | null; convertedClient: { id: string } | null; blueprintAssessment: { jotformRawData: unknown } | null }): ProposalInput {
  const raw = lead.blueprintAssessment?.jotformRawData as { answers?: Record<string, unknown> } | null;
  const a = raw && typeof raw === "object" && raw.answers && typeof raw.answers === "object" ? raw.answers : {};
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : typeof v === "string" ? v.split(/,\s*/) : []);
  const zones = [...new Set(list(a.areas).map((x) => AREA_TO_ZONE[x]).filter(Boolean))];
  const goals = [...new Set([...list(a.goals), ...list(lead.goals)].map((x) => GOAL_TO_KEY[x]).filter(Boolean))];
  const history = list(a.previousTreatments).filter((x) => x !== "None");
  const notes = [
    `Prepared for lead ${lead.firstName} ${lead.lastName} before conversion.`,
    history.length ? `Previous treatments: ${history.join(", ")}.` : "",
    list(a.areas).length ? `Blueprint areas: ${list(a.areas).join(", ")}.` : "",
  ].filter(Boolean).join(" ");
  return {
    clientId: lead.convertedClient?.id ?? null,
    leadId: lead.id,
    clientName: lead.firstName.toLowerCase(),
    locationLabel: (lead.city ?? "").toLowerCase(),
    language: "en",
    zones,
    goals,
    personalMessage: "",
    internalNotes: notes,
    programs: KEY_BISCAYNE_TEMPLATE,
    recommendedKey: null,
    promoEnabled: false,
    showWelcomeVideo: false,
    resultCaseIds: [],
    expiresAt: null,
    programStartDate: null,
    assessmentEnabled: true,
    assessmentDate: null,
    assessmentTimeConfirmed: false,
    assessmentTime: null,
  };
}
