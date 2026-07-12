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

export function extractContactField(raw: Record<string, unknown>, patterns: string[]): string | undefined {
  for (const [key, value] of Object.entries(raw)) {
    const lowerKey = key.toLowerCase();
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
  for (const [key, value] of Object.entries(raw)) {
    if (!key.toLowerCase().includes("name")) continue;

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
