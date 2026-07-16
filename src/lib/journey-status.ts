export type JourneyStatus =
  | "Waiting for Portal Activation"
  | "Waiting for Waiver"
  | "Waiting for Blueprint Assessment"
  | "Waiting for First Appointment"
  | "Active Client"
  | "VIP Member";

const JOURNEY_ICONS: Record<JourneyStatus, string> = {
  "Waiting for Portal Activation": "🟡",
  "Waiting for Waiver": "🟡",
  "Waiting for Blueprint Assessment": "🟡",
  "Waiting for First Appointment": "🟠",
  "Active Client": "🟢",
  "VIP Member": "⭐",
};

/**
 * Real, derived journey status — computed entirely from data that
 * already exists (portal status, real signed documents, real
 * assessment status, real completed appointments, real rewards
 * tier). Nothing new stored; this is a pure function of the client's
 * actual current state.
 */
export function computeJourneyStatus(params: {
  portalActive: boolean;
  hasWaiver: boolean;
  assessmentValidated: boolean;
  hasCompletedAppointment: boolean;
  tier: string;
}): { status: JourneyStatus; icon: string } {
  let status: JourneyStatus;
  if (!params.portalActive) status = "Waiting for Portal Activation";
  else if (!params.hasWaiver) status = "Waiting for Waiver";
  else if (!params.assessmentValidated) status = "Waiting for Blueprint Assessment";
  else if (!params.hasCompletedAppointment) status = "Waiting for First Appointment";
  else if (params.tier !== "Standard") status = "VIP Member";
  else status = "Active Client";

  return { status, icon: JOURNEY_ICONS[status] };
}
