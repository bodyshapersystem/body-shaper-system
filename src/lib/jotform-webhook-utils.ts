import type { NextRequest } from "next/server";

/**
 * Parses a Jotform webhook payload. Jotform sends multipart/form-data
 * with several TOP-LEVEL fields (formID, submissionID, formTitle,
 * webhookURL, etc.) alongside a `rawRequest` field that's itself a
 * JSON-encoded blob of just the answers. The original blueprint
 * webhook only looked at rawRequest and silently discarded the
 * sibling formID/submissionID fields — meaning jotformSubmissionId
 * was likely never actually captured in production. Fixed here by
 * merging both: answers from rawRequest (or the JSON body directly)
 * plus the top-level metadata fields.
 */
export async function parseJotformPayload(request: NextRequest): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await request.json();
  }

  const formData = await request.formData();
  const merged: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    if (key === "rawRequest") return; // merged in below, parsed
    merged[key] = typeof value === "string" ? value : "[file]";
  });

  const rawRequest = formData.get("rawRequest");
  if (typeof rawRequest === "string") {
    try {
      Object.assign(merged, JSON.parse(rawRequest));
    } catch {
      // if rawRequest isn't valid JSON, keep the top-level fields we already have
    }
  }

  return merged;
}

// Jotform's own webhook metadata fields — NOT form answers. Several of
// these (username, formTitle, customTitle, subject...) contain
// substrings like "name" or "email"-adjacent words and were being
// matched by the loose `key.includes(pattern)` check below, which is
// exactly how a real bug happened: the metadata field `username`
// (Jotform ACCOUNT username, e.g. "beautyboxmia") contains the
// substring "name" ("userNAME"), so it was being picked up as the
// person's name instead of their actual submitted answer. Excluding
// all known metadata keys fixes this at the source.
const JOTFORM_METADATA_KEYS = new Set([
  "action", "webhookurl", "username", "formid", "type", "customparams", "product",
  "formtitle", "customtitle", "submissionid", "event", "documentid", "teamid",
  "subject", "issilent", "custombody", "fromtable", "appid", "pretty", "unread",
  "parent", "ip", "slug", "jsexecutiontracker", "submitsource", "submitdate",
  "builddate", "uploadserverurl", "eventobserver", "event_id", "timetosubmit",
  "validatednewrequiredfieldids", "path",
]);

/** Real Jotform question fields are always prefixed like "q3_..." —
 * metadata fields never are. Preferring these first (and excluding
 * known metadata keys entirely) is what actually fixes the bug above,
 * rather than just adding more exclusions as new metadata fields
 * appear. */
function isLikelyQuestionKey(key: string): boolean {
  return /^q\d+_/i.test(key);
}

/**
 * Fetches a submission's answers directly from Jotform's API, keyed
 * by the actual question TEXT ("First Name", "Email Address", etc.)
 * rather than guessing at auto-generated field key names from the
 * raw webhook payload. This is the reliable path — the webhook
 * payload's own field keys vary per form and don't always contain
 * predictable substrings (e.g. a form with separate "First Name" and
 * "Last Name" fields doesn't guarantee either key contains "name").
 * Requires JOTFORM_API_KEY. Returns null on any failure — callers
 * should fall back to the raw-payload heuristics below.
 */
export async function fetchJotformSubmissionAnswers(submissionId: string): Promise<Record<string, string> | null> {
  const apiKey = process.env.JOTFORM_API_KEY;
  if (!apiKey || !submissionId) return null;

  try {
    const res = await fetch(`https://api.jotform.com/submission/${submissionId}?apiKey=${apiKey}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    const answers = json?.content?.answers as Record<string, { text?: string; answer?: unknown }> | undefined;
    if (!answers) return null;

    const byQuestionText: Record<string, string> = {};
    for (const field of Object.values(answers)) {
      if (!field?.text) continue;
      const value = field.answer;
      if (typeof value === "string" && value.trim()) {
        byQuestionText[field.text] = value.trim();
      } else if (value && typeof value === "object") {
        const joined = Object.values(value as Record<string, unknown>)
          .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
          .join(" ");
        if (joined.trim()) byQuestionText[field.text] = joined.trim();
      }
    }
    return byQuestionText;
  } catch {
    return null;
  }
}

/** Looks up a value from the API-fetched answers by trying several
 * likely exact question-text labels (case-insensitive). */
function normalizeQuestionText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[*:.?]/g, "") // strip required-field markers and punctuation Jotform commonly appends
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fuzzy match on question text — real Jotform forms commonly render
 * required-field labels as "First Name*" or "First Name:" rather than
 * the bare label, and exact string equality silently failed to match
 * any of these, falling all the way through to the email-local-part
 * fallback (this was the concrete cause of leads arriving with the
 * email address as their name). Matches if either string contains the
 * other after normalizing whitespace/punctuation.
 */
function findByQuestionLabel(answers: Record<string, string>, labels: string[]): string | undefined {
  const entries = Object.entries(answers).map(([k, v]) => [normalizeQuestionText(k), v] as const);
  for (const label of labels) {
    const target = normalizeQuestionText(label);
    for (const [key, value] of entries) {
      if (key === target || key.includes(target)) return value;
    }
  }
  return undefined;
}

export function extractNameFromAnswers(answers: Record<string, string>): { firstName: string; lastName: string } {
  const firstName = findByQuestionLabel(answers, ["First Name", "first name", "fname"]);
  const lastName = findByQuestionLabel(answers, ["Last Name", "last name", "lname"]);
  if (firstName || lastName) return { firstName: firstName ?? "", lastName: lastName ?? "" };

  // Some forms use a single combined "Full Name" question instead.
  const full = findByQuestionLabel(answers, ["Full Name", "Name", "Your Name"]);
  if (full) {
    const parts = full.split(/\s+/);
    return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
  }
  return { firstName: "", lastName: "" };
}

export function extractContactFromAnswers(answers: Record<string, string>, labels: string[]): string | undefined {
  return findByQuestionLabel(answers, labels);
}

export function extractContactField(raw: Record<string, unknown>, patterns: string[]): string | undefined {
  const entries = Object.entries(raw).sort(([a], [b]) => Number(isLikelyQuestionKey(b)) - Number(isLikelyQuestionKey(a)));
  for (const [key, value] of entries) {
    const lowerKey = key.toLowerCase();
    if (JOTFORM_METADATA_KEYS.has(lowerKey)) continue;
    if (!patterns.some((p) => lowerKey.includes(p))) continue;

    if (typeof value === "string" && value.trim()) return value.trim();

    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      const joined = Object.values(obj)
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        .join(" ");
      if (joined.trim()) return joined.trim();
    }
  }
  return undefined;
}

export function extractName(raw: Record<string, unknown>): { firstName: string; lastName: string } {
  const entries = Object.entries(raw).sort(([a], [b]) => Number(isLikelyQuestionKey(b)) - Number(isLikelyQuestionKey(a)));
  for (const [key, value] of entries) {
    const lowerKey = key.toLowerCase();
    if (JOTFORM_METADATA_KEYS.has(lowerKey)) continue;
    if (!lowerKey.includes("name")) continue;

    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      const first = (obj.first ?? obj.firstName ?? obj.fname) as string | undefined;
      const last = (obj.last ?? obj.lastName ?? obj.lname) as string | undefined;
      if (first || last) {
        return { firstName: (first ?? "").trim(), lastName: (last ?? "").trim() };
      }
    }

    if (typeof value === "string" && value.trim()) {
      const parts = value.trim().split(/\s+/);
      return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
    }
  }
  return { firstName: "", lastName: "" };
}

/**
 * The formID/submissionID Jotform always includes as top-level
 * webhook fields (separate from the answers themselves).
 */
export function extractSubmissionMeta(raw: Record<string, unknown>): { formId?: string; submissionId?: string } {
  const formId = typeof raw.formID === "string" ? raw.formID : undefined;
  const submissionId = typeof raw.submissionID === "string" ? raw.submissionID : undefined;
  return { formId, submissionId };
}
