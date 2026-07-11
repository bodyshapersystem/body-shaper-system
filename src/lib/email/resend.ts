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

export const EMAIL_FROM = "Body Shaper System <hello@bodyshapersystem.com>";
