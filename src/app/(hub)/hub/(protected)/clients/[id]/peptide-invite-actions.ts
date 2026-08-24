"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { sendPeptideJourneyInviteEmail } from "@/lib/email/service";
import { revalidatePath } from "next/cache";

const PORTAL_ORIGIN = "https://www.bodyshapersystem.com";
const JOURNEY_PATH = "/portal/daily-trackers/journey";

export async function sendPeptideJourneyInvite(clientId: string, personalNote?: string) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) return { error: "You don't have permission to do this." };

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return { error: "Client not found." };

  const activeProtocolCount = await prisma.peptideProtocol.count({ where: { clientId, active: true } });
  const ctaLabel = activeProtocolCount > 0 ? "OPEN MY PEPTIDE JOURNEY →" : "ADD MY PEPTIDE JOURNEY →";
  // Real "preserve destination through auth" — routes through login
  // with a next param when the client isn't already signed in;
  // already-authenticated clients skip straight to Journey.
  const ctaUrl = `${PORTAL_ORIGIN}/portal/login?next=${encodeURIComponent(JOURNEY_PATH)}`;

  try {
    await sendPeptideJourneyInviteEmail({
      clientId,
      firstName: client.firstName,
      email: client.email,
      personalNote,
      ctaLabel,
      ctaUrl,
    });
    await prisma.client.update({
      where: { id: clientId },
      data: { peptideJourneyInviteSentAt: new Date(), peptideJourneyInviteSentByName: user.fullName },
    });
  } catch (err) {
    console.error("[sendPeptideJourneyInvite] failed:", err);
    return { error: err instanceof Error ? err.message : "Something went wrong sending the invite." };
  }

  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}
