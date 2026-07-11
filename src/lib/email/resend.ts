import { Resend } from "resend";

/**
 * Resend client singleton. Server-only — never import this into a
 * "use client" file. RESEND_API_KEY must never be exposed to the
 * browser (it isn't NEXT_PUBLIC_-prefixed, so Next.js already keeps
 * it server-side, but this file is an extra guard: nothing here
 * touches the client bundle).
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = "Body Shaper System <hello@bodyshapersystem.com>";
