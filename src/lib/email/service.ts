import "server-only";
import { prisma } from "@/lib/prisma";
import { getResendClient, EMAIL_FROM } from "./resend";
import {
  buildWelcomeActivationEmail,
  buildBodyBlueprintCompletedEmail,
  buildPaymentConfirmationEmail,
} from "./templates";

/**
 * Centralized Email Service. Every outbound email in the app should
 * go through one of the functions here — never call `resend.emails.send`
 * directly from a Server Action. This guarantees:
 *   1. Every send attempt is logged to email_events (success or
 *      failure), so the Hub's "View Email Log" is always accurate.
 *   2. Adding a new email type later just means adding one function
 *      here + one template, not re-deriving the logging/error-handling
 *      pattern each time.
 *
 * Server-only (the `server-only` import throws a build error if this
 * ever gets imported into a Client Component by mistake).
 */

async function logAndSend(params: {
  clientId: string;
  template: "WELCOME_ACTIVATION" | "BODY_BLUEPRINT_COMPLETED" | "PAYMENT_CONFIRMATION";
  recipient: string;
  subject: string;
  html: string;
}) {
  const { clientId, template, recipient, subject, html } = params;

  const event = await prisma.emailEvent.create({
    data: { clientId, template, recipient, status: "QUEUED" },
  });

  try {
    const { data, error } = await getResendClient().emails.send({
      from: EMAIL_FROM,
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
 * Sends the Welcome + Portal Activation email. Called automatically
 * right after Lead -> Client conversion, and also by "Resend
 * Invitation" in the Hub. Updates the invitation's lastSentAt/
 * attemptCount and the User's portalStatus regardless of email
 * outcome — the Auth account and activation token are valid either
 * way; only the *notification* may have failed, which is why the
 * Owner gets a clear failure state and a Resend option rather than a
 * silent failure.
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

export async function sendBodyBlueprintCompletedEmail(params: {
  clientId: string;
  firstName: string;
  email: string;
  portalUrl: string;
}) {
  const { clientId, firstName, email, portalUrl } = params;
  const { subject, html } = buildBodyBlueprintCompletedEmail({ firstName, portalUrl });
  return logAndSend({ clientId, template: "BODY_BLUEPRINT_COMPLETED", recipient: email, subject, html });
}

export async function sendPaymentConfirmationEmail(params: {
  clientId: string;
  firstName: string;
  email: string;
  amountLabel: string;
  portalUrl: string;
}) {
  const { clientId, firstName, email, amountLabel, portalUrl } = params;
  const { subject, html } = buildPaymentConfirmationEmail({ firstName, amountLabel, portalUrl });
  return logAndSend({ clientId, template: "PAYMENT_CONFIRMATION", recipient: email, subject, html });
}
