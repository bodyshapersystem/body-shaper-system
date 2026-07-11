import { Resend } from "resend";

/**
 * Resend client — created lazily on first use, not at module load.
 * Constructing `new Resend(...)` eagerly at import time throws if
 * RESEND_API_KEY is unset, which crashes Next.js's build-time page
 * data collection for every route that imports this file (even ones
 * that never actually send an email). Lazy init means the app still
 * builds and runs fine before the key exists; sends will fail
 * gracefully (and get logged) until it's set.
 */
let client: Resend | null = null;

export function getResendClient(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY || "re_missing_key");
  }
  return client;
}

/**
 * The three transactional sender identities for Body Shaper System™.
 * Each is a distinct mailbox with its own purpose — clients should be
 * able to tell at a glance what kind of communication they're
 * getting just from who it's "from". All three send from the same
 * verified domain (bodyshapersystem.com), so only one domain
 * verification in Resend covers all of them.
 *
 *   owner      — hello@      — Owner/Hub/admin/support/system alerts.
 *                              Never used for routine client comms.
 *   blueprint  — blueprint@  — Body Blueprint™ intake/confirmation
 *                              only. Never sends portal invitations.
 *   concierge  — concierge@  — The client's day-to-day communication
 *                              channel throughout their journey
 *                              (welcome, portal, appointments, etc).
 */
export const SENDERS = {
  owner: "Body Shaper System™ <hello@bodyshapersystem.com>",
  blueprint: "Body Blueprint™ <blueprint@bodyshapersystem.com>",
  concierge: "The Body Shaper Concierge <concierge@bodyshapersystem.com>",
} as const;
