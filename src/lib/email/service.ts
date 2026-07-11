import "server-only";
import { prisma } from "@/lib/prisma";
import { getResendClient, SENDERS } from "./resend";
import {
  buildWelcomeActivationEmail,
  buildBodyBlueprintCompletedEmail,
  buildPaymentConfirmationEmail,
  buildBlueprintReceivedEmail,
} from "./templates";

/**
 * Centralized Email Service — the single email infrastructure for
 * Body Shaper System™. Every outbound email in the app goes through
 * one of the functions here; nothing ever calls `resend.emails.send`
 * directly. This guarantees:
 *   1. Every send attempt is logged to email_events (success or
 *      failure) with which sender identity it came from, so the
 *      future Email Center has a complete, accurate record.
 *   2. Adding a new email type later means: write one template
 *      function, register one send function here that calls
 *      logAndSend() — no existing code needs to change.
 *
 * Server-only (the `server-only` import throws a build error if this
 * ever gets imported into a Client Component by mistake).
 */

type EmailTemplateName = "WELCOME_ACTIVATION" | "BODY_BLUEPRINT_COMPLETED" | "PAYMENT_CONFIRMATION" | "BLUEPRINT_RECEIVED";

async function logAndSend(params: {
  clientId?: string;
  leadId?: string;
  template: EmailTemplateName;
  sender: string;
  recipient: string;
  subject: string;
  html: string;
}) {
  const { clientId, leadId, template, sender, recipient, subject, html } = params;

  const event = await prisma.emailEvent.create({
    data: { clientId, leadId, template, senderEmail: sender, recipient, status: "QUEUED" },
  });

  try {
    const { data, error } = await getResendClient().emails.send({
      from: sender,
      to: recipient,
      subject,
      html,
    });

    if (error) {
      await prisma.emailEvent.update({
        where: { id: event.id },
        data: { status: "FAILED", failedAt: new Date(), errorMessage: error.message },
      });
      return { success: false as const, error: error.message };
    }

    await prisma.emailEvent.update({
      where: { id: event.id },
      data: { status: "SENT", sentAt: new Date(), providerMessageId: data?.id },
    });
    return { success: true as const, providerMessageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email delivery error";
    await prisma.emailEvent.update({
      where: { id: event.id },
      data: { status: "FAILED", failedAt: new Date(), errorMessage: message },
    });
    return { success: false as const, error: message };
  }
}

/**
 * Sends the Welcome + Portal Activation email, from "The Body Shaper
 * Concierge" (concierge@) — this is the client's day-to-day channel,
 * never hello@ or blueprint@. Called automatically right after
 * Lead -> Client conversion, and also by "Resend Invitation" in the
 * Hub. Updates the invitation's lastSentAt/attemptCount and the
 * User's portalStatus regardless of email outcome — the Auth account
 * and activation token are valid either way; only the *notification*
 * may have failed, which is why the Owner gets a clear failure state
 * and a Resend option rather than a silent failure.
 */
export async function sendWelcomeActivationEmail(params: {
  clientId: string;
  firstName: string;
  email: string;
  activationUrl: string;
  invitationId: string;
}) {
  const { clientId, firstName, email, activationUrl, invitationId } = params;
  const { subject, html } = buildWelcomeActivationEmail({ firstName, activationUrl });

  const result = await logAndSend({
    clientId,
    template: "WELCOME_ACTIVATION",
    sender: SENDERS.concierge,
    recipient: email,
    subject,
    html,
  });

  await prisma.portalInvitation.update({
    where: { id: invitationId },
    data: {
      lastSentAt: new Date(),
      attemptCount: { increment: 1 },
    },
  });

  // Only move portalStatus forward on success, and only if the
  // client hasn't already activated (never downgrade an ACTIVE user).
  const client = await prisma.client.findUnique({ where: { id: clientId }, include: { user: true } });
  if (client && client.user.portalStatus !== "ACTIVE") {
    await prisma.user.update({
      where: { id: client.userId },
      data: { portalStatus: result.success ? "INVITATION_SENT" : "FAILED" },
    });
  }

  return result;
}

/**
 * Confirms receipt of a Body Blueprint™ submission. Sent from
 * blueprint@ (its own identity, per direction — never used for
 * portal invitations). This is a Lead-stage email: no Client or
 * Portal account exists yet, and this function never creates one —
 * it only confirms receipt and sets expectations for next steps.
 */
export async function sendBlueprintReceivedEmail(params: {
  leadId: string;
  firstName: string;
  email: string;
}) {
  const { leadId, firstName, email } = params;
  const { subject, html } = buildBlueprintReceivedEmail({ firstName });
  return logAndSend({
    leadId,
    template: "BLUEPRINT_RECEIVED",
    sender: SENDERS.blueprint,
    recipient: email,
    subject,
    html,
  });
}

/**
 * Not yet wired to an automatic trigger — see summary notes. Ready to
 * call once a "Body Blueprint completed/reviewed" event exists.
 */
export async function sendBodyBlueprintCompletedEmail(params: {
  clientId: string;
  firstName: string;
  email: string;
  portalUrl: string;
}) {
  const { clientId, firstName, email, portalUrl } = params;
  const { subject, html } = buildBodyBlueprintCompletedEmail({ firstName, portalUrl });
  return logAndSend({
    clientId,
    template: "BODY_BLUEPRINT_COMPLETED",
    sender: SENDERS.concierge,
    recipient: email,
    subject,
    html,
  });
}

/**
 * Not yet wired to an automatic trigger — payment processing isn't
 * built yet. Ready to call once it is.
 */
export async function sendPaymentConfirmationEmail(params: {
  clientId: string;
  firstName: string;
  email: string;
  amountLabel: string;
  portalUrl: string;
}) {
  const { clientId, firstName, email, amountLabel, portalUrl } = params;
  const { subject, html } = buildPaymentConfirmationEmail({ firstName, amountLabel, portalUrl });
  return logAndSend({
    clientId,
    template: "PAYMENT_CONFIRMATION",
    sender: SENDERS.concierge,
    recipient: email,
    subject,
    html,
  });
}
