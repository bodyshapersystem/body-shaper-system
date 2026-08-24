"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function saveReminderGoals(
  clientId: string,
  fields: {
    hydrationGoalGlasses: number;
    proteinGoalGrams: number | null;
    movementGoalSteps: number;
    compressionDays: string[];
    compressionHoursRequired: number | null;
    compressionProtocolStartDate: string | null;
    compressionProtocolEndDate: string | null;
  }
) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) return { error: "You don't have permission to do this." };

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        hydrationGoalGlasses: fields.hydrationGoalGlasses,
        proteinGoalGrams: fields.proteinGoalGrams,
        movementGoalSteps: fields.movementGoalSteps,
        compressionDays: fields.compressionDays,
        compressionHoursRequired: fields.compressionHoursRequired,
        compressionProtocolStartDate: fields.compressionProtocolStartDate ? new Date(fields.compressionProtocolStartDate) : null,
        compressionProtocolEndDate: fields.compressionProtocolEndDate ? new Date(fields.compressionProtocolEndDate) : null,
      },
    });
  } catch (err) {
    console.error("[saveReminderGoals] failed:", err);
    return { error: err instanceof Error ? err.message : "Something went wrong." };
  }
  revalidatePath(`/hub/clients/${clientId}`);
  return { success: true };
}
