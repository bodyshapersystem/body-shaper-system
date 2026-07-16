"use server";

import { getCurrentPortalClient } from "@/lib/permissions";
import { getOnboardingStatus } from "@/lib/onboarding";

/**
 * Real-time re-check used by the client-side poller — since the
 * actual signature happens on Jotform (external), we can't get an
 * instant callback the moment someone signs. Polling this every few
 * seconds while they're on the onboarding screen is what creates the
 * "automatically advances" feel without a fake in-app signature.
 */
export async function checkOnboardingStatus() {
  const client = await getCurrentPortalClient();
  if (!client) return { error: "Not signed in." };
  const status = await getOnboardingStatus(client.id);
  return { success: true, ...status };
}
