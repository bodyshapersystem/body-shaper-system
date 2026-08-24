"use server";

import { getCurrentHubUser, hasPermission } from "@/lib/permissions";

const RENPHO_FIELDS = [
  "weightKg", "bmi", "bodyFatPercent", "visceralFat", "muscleMassKg", "skeletalMuscleKg",
  "bodyWaterPercent", "proteinPercent", "boneMassKg", "subcutaneousFatPercent", "bmr",
  "bodyAge", "fatFreeWeightKg", "whr", "smi",
] as const;

export type ExtractedRenphoData = Partial<Record<(typeof RENPHO_FIELDS)[number], number>>;

/**
 * Real AI-assisted RENPHO extraction — the specialist uploads a photo
 * or screenshot of the RENPHO scan result (the same image she'd send
 * for a human to read), and this reads the actual numbers off it
 * instead of requiring them typed in one by one. This is a first
 * pass only: every value returned still goes into the normal
 * Record RENPHO Scan form for her to review and correct before
 * saving — nothing is saved automatically from this extraction.
 *
 * Requires ANTHROPIC_API_KEY to be set in this project's environment
 * variables. If it isn't, this returns a clear error rather than
 * failing silently.
 */
export async function extractRenphoFromImage(base64Image: string, mimeType: string): Promise<{ data?: ExtractedRenphoData; error?: string }> {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "blueprints.manage")) {
    return { error: "You don't have permission to do this." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "AI extraction isn't set up yet — add ANTHROPIC_API_KEY to this project's environment variables in Vercel, then try again." };
  }

  const prompt = `You are reading a RENPHO body composition scan report (a photo or screenshot). Extract every metric you can actually see in the image. Return ONLY a JSON object (no markdown, no explanation) with these exact keys, using null for any value not visible in the image:

{
  "weightKg": number|null,
  "bmi": number|null,
  "bodyFatPercent": number|null,
  "visceralFat": number|null,
  "muscleMassKg": number|null,
  "skeletalMuscleKg": number|null,
  "bodyWaterPercent": number|null,
  "proteinPercent": number|null,
  "boneMassKg": number|null,
  "subcutaneousFatPercent": number|null,
  "bmr": number|null,
  "bodyAge": number|null,
  "fatFreeWeightKg": number|null,
  "whr": number|null,
  "smi": number|null
}

If the report shows weight or a mass value in lbs, convert to kg (divide by 2.20462). Only include a number if you can actually read it clearly in the image — never guess or estimate a value that isn't shown.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType, data: base64Image } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[extractRenphoFromImage] Anthropic API error:", res.status, errText);
      return { error: "Couldn't read the report right now. Please try again or enter the values manually." };
    }

    const json = await res.json();
    const textBlock = json.content?.find((c: { type: string }) => c.type === "text");
    if (!textBlock?.text) return { error: "Couldn't read any data from that image." };

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const data: ExtractedRenphoData = {};
    for (const field of RENPHO_FIELDS) {
      if (typeof parsed[field] === "number") data[field] = parsed[field];
    }

    return { data };
  } catch (err) {
    console.error("[extractRenphoFromImage] failed:", err);
    return { error: "Something went wrong reading that report. Please try again or enter the values manually." };
  }
}
