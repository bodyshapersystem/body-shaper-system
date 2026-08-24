import crypto from "crypto";

const SECRET = process.env.CRON_SECRET || "bss-nudge-fallback-secret";
const MAX_AGE_DAYS = 4; // a token stays valid a few days in case the email is opened late

export type NudgeActionCategory = "HYDRATION" | "PROTEIN" | "COMPRESSION";

/**
 * Real signed, one-click action link — no login required. Payload is
 * clientId:category:dateIso, HMAC-signed so it can't be forged or
 * tampered with (e.g. to act on another client's data), and the
 * embedded date lets the link expire naturally after a few days
 * without needing a database-backed token store.
 */
export function signNudgeAction(clientId: string, category: NudgeActionCategory, date: Date): string {
  const dateIso = date.toISOString().slice(0, 10);
  const payload = `${clientId}:${category}:${dateIso}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 24);
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  return `${encoded}.${sig}`;
}

export function verifyNudgeAction(token: string): { clientId: string; category: NudgeActionCategory; date: Date } | null {
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expectedSig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 24);
  if (sig !== expectedSig) return null;

  const [clientId, category, dateIso] = payload.split(":");
  if (!clientId || !category || !dateIso) return null;

  const date = new Date(`${dateIso}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;

  const ageDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays > MAX_AGE_DAYS || ageDays < -1) return null; // expired, or a suspicious future date

  return { clientId, category: category as NudgeActionCategory, date };
}
