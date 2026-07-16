"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { CollaborationType, AgreementStatus } from "@prisma/client";

export async function upsertCollaboration(clientId: string, formData: FormData) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.convert")) {
    return { error: "You don't have permission to manage collaborations." };
  }

  const collaborationType = (formData.get("collaborationType") as CollaborationType) || "AMBASSADOR";
  const treatmentValueCents = Math.round(Number(formData.get("treatmentValue") || 0) * 100);
  const clientContributionCents = Math.round(Number(formData.get("clientContribution") || 0) * 100);
  const campaignName = (formData.get("campaignName") as string) || null;
  const instagramHandle = (formData.get("instagramHandle") as string) || null;
  const deliverables = (formData.get("deliverables") as string) || null;
  const internalNotes = (formData.get("internalNotes") as string) || null;
  const managerId = (formData.get("managerId") as string) || null;
  const agreementStatus = (formData.get("agreementStatus") as AgreementStatus) || "PENDING";

  // Ensure the client is actually marked Ambassador — this is the
  // first-class path, not a side effect of just filling this form.
  await prisma.client.update({ where: { id: clientId }, data: { clientType: "AMBASSADOR" } });

  await prisma.collaboration.upsert({
    where: { clientId },
    create: {
      clientId,
      collaborationType,
      treatmentValueCents,
      clientContributionCents,
      campaignName,
      instagramHandle,
      deliverables,
      internalNotes,
      managerId,
      agreementStatus,
    },
    update: {
      collaborationType,
      treatmentValueCents,
      clientContributionCents,
      campaignName,
      instagramHandle,
      deliverables,
      internalNotes,
      managerId,
      agreementStatus,
    },
  });

  revalidatePath(`/hub/clients/${clientId}`);
  revalidatePath("/hub/analytics");
  revalidatePath("/hub/dashboard");
  return { success: true };
}
