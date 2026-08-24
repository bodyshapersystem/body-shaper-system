import { NextRequest, NextResponse } from "next/server";
import { computeDueNudges } from "@/lib/system-nudges";
import {
  sendHydrationNudgeEmail,
  sendProteinNudgeEmail,
  sendCompressionNudgeEmail,
  sendMovementNudgeEmail,
  sendSleepNudgeEmail,
  sendPeptideUpcomingNudgeEmail,
  sendPeptideOverdueNudgeEmail,
  sendAppointmentNudgeEmail,
  sendWeeklyCheckinNudgeEmail,
} from "@/lib/email/service";

export const dynamic = "force-dynamic";

/**
 * System Nudges™ — real, event-driven, runs hourly. computeDueNudges
 * does all the real work (checks each client's own ReminderPreference,
 * quiet hours, whether today's goal is already met, and whether this
 * exact slot already sent) and also records the NudgeLog entries
 * itself — this route only has to dispatch the actual emails for
 * whatever it returns. Protected by CRON_SECRET, same as the other crons.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await computeDueNudges();
  let sent = 0;

  for (const nudge of due) {
    try {
      switch (nudge.category) {
        case "HYDRATION":
          await sendHydrationNudgeEmail({ clientId: nudge.clientId, firstName: nudge.firstName, email: nudge.email, current: nudge.current, goal: nudge.goal, confirmUrl: nudge.confirmUrl });
          break;
        case "PROTEIN":
          await sendProteinNudgeEmail({ clientId: nudge.clientId, firstName: nudge.firstName, email: nudge.email, current: nudge.current, goal: nudge.goal, confirmUrl: nudge.confirmUrl });
          break;
        case "COMPRESSION":
          await sendCompressionNudgeEmail({ clientId: nudge.clientId, firstName: nudge.firstName, email: nudge.email, currentHours: nudge.currentHours, goalHours: nudge.goalHours, confirmUrl: nudge.confirmUrl });
          break;
        case "MOVEMENT":
          await sendMovementNudgeEmail({ clientId: nudge.clientId, firstName: nudge.firstName, email: nudge.email, current: nudge.current, goal: nudge.goal });
          break;
        case "SLEEP":
          await sendSleepNudgeEmail({ clientId: nudge.clientId, firstName: nudge.firstName, email: nudge.email });
          break;
        case "PEPTIDE_UPCOMING":
          await sendPeptideUpcomingNudgeEmail({ clientId: nudge.clientId, firstName: nudge.firstName, email: nudge.email, peptideName: nudge.peptideName, scheduledAt: nudge.scheduledAt });
          break;
        case "PEPTIDE_OVERDUE":
          await sendPeptideOverdueNudgeEmail({ clientId: nudge.clientId, firstName: nudge.firstName, email: nudge.email, peptideName: nudge.peptideName });
          break;
        case "APPOINTMENT":
          await sendAppointmentNudgeEmail({ clientId: nudge.clientId, firstName: nudge.firstName, email: nudge.email, title: nudge.title, startsAt: nudge.startsAt });
          break;
        case "WEEKLY_CHECKIN":
          await sendWeeklyCheckinNudgeEmail({ clientId: nudge.clientId, firstName: nudge.firstName, email: nudge.email, outstanding: nudge.outstanding });
          break;
      }
      sent++;
    } catch (err) {
      console.error(`[system-nudges] failed to send ${nudge.category} to ${nudge.clientId}:`, err);
    }
  }

  return NextResponse.json({ success: true, computed: due.length, sent });
}
