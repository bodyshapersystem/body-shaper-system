/**
 * Body Shaper System™ onboarding forms — owned by BSS, no Jotform dependency.
 * Question texts, options and legal language are copied VERBATIM from the
 * Jotform originals they replace (Prepare Your Experience™ 261860243106046 and
 * Almost Ready™ waiver 230686448903161, as published on 2026-11-02). Question ids
 * keep the original Jotform ids so older records remain comparable.
 * Pure data + validation: imported by the portal UI and by the API routes.
 */

export type Q =
  | { id: string; kind: "text" | "email" | "tel" | "date" | "textarea"; label: string; required?: boolean; placeholder?: string }
  | { id: string; kind: "single" | "multi"; label: string; options: string[]; required?: boolean; hint?: string; allRequired?: boolean };

export type FormStep = { key: string; tone: "burgundy" | "sand" | "olive"; title: string; hint?: string; questions: string[] };
export type Answers = Record<string, string | string[]>;

/* ------------------------------------------------------------------ Prepare Your Experience™ */
export const PREPARE_VERSION = "bss-prepare-v2 (from Jotform 261860243106046)";
export const PREPARE_INTRO =
  "Before your first appointment, please complete this short evaluation. Your responses help us prepare your personalized treatment, review any health considerations, and ensure everything is ready before your first session. Estimated completion time: 5 minutes.";

export const PREPARE_QUESTIONS: Q[] = [
  { id: "3_first", kind: "text", label: "First Name", required: true },
  { id: "3_last", kind: "text", label: "Last Name", required: true },
  { id: "4", kind: "email", label: "Email Address", required: true },
  { id: "7", kind: "date", label: "Date of Birth", required: true },
  { id: "8", kind: "tel", label: "Phone Number", required: true },
  { id: "9_street", kind: "text", label: "Street Address", required: true, placeholder: "street and number" },
  { id: "9_unit", kind: "text", label: "Apt / Unit", placeholder: "optional" },
  { id: "9_city", kind: "text", label: "City", required: true },
  { id: "9_zip", kind: "text", label: "ZIP Code", required: true },
  { id: "10", kind: "text", label: "Emergency Contact", required: true, placeholder: "full name and relationship" },
  { id: "11", kind: "tel", label: "Emergency Contact Phone", required: true },
  { id: "20", kind: "single", label: "Activity Level", options: ["Sedentary", "Light", "Moderate", "Active"], required: true },
  { id: "21", kind: "single", label: "Exercise", options: ["Never", "1–2 times per week", "3–4 times per week", "5+ times per week"], required: true },
  { id: "22", kind: "single", label: "Water Intake", options: ["Less than 1L", "1–2L", "More than 2L"], required: true },
  { id: "23", kind: "single", label: "Sleep", options: ["Less than 6 hours", "6–8 hours", "More than 8 hours"], required: true },
  { id: "24", kind: "single", label: "Stress Level", options: ["Low", "Moderate", "High"], required: true },
  { id: "25", kind: "single", label: "Alcohol", options: ["Never", "Occasionally", "Frequently"], required: true },
  { id: "26", kind: "single", label: "Smoking", options: ["Yes", "No"], required: true },
  { id: "103", kind: "multi", label: "Are you currently:", options: ["Pregnant", "Breastfeeding", "Postpartum", "None of the above"], hint: "Select all that apply." },
  { id: "104", kind: "single", label: "How long has it been since giving birth?", options: ["Less than 6 weeks", "6 weeks – 3 months", "3–6 months", "6–12 months", "More than 12 months"] },
  { id: "94", kind: "single", label: "Have you had surgery within the last 12 months?", options: ["Yes", "No"], required: true },
  { id: "105", kind: "date", label: "Surgery Date" },
  { id: "96", kind: "text", label: "Procedure" },
  {
    id: "106",
    kind: "multi",
    label: "Please select any medical conditions that apply.",
    options: ["Pacemaker", "Metal Implants", "Diabetes", "High Blood Pressure", "Heart Condition", "Thyroid Disorder", "PCOS", "Lipedema", "Lymphedema", "Autoimmune Disease", "Active Cancer", "Hernia", "Skin Infection", "Blood Clotting Disorder", "Taking Blood Thinners", "None of the Above", "Other"],
    hint: "Select all that apply.",
  },
  { id: "106_other", kind: "text", label: "Other medical condition — please specify" },
  { id: "97", kind: "single", label: "Are you currently taking any medications?", options: ["Yes", "No"] },
  { id: "98", kind: "textarea", label: "Please list them." },
  { id: "99", kind: "single", label: "GLP-1 Assessment — Have you used a GLP-1 medication?", options: ["I am currently using one.", "I used one within the past 6 months.", "No."] },
  { id: "100", kind: "single", label: "Which medication?", options: ["Ozempic® (Semaglutide)", "Wegovy® (Semaglutide)", "Mounjaro® (Tirzepatide)", "Zepbound® (Tirzepatide)", "Saxenda® (Liraglutide)", "Retatrutide (Clinical / Research Use)", "Compounded GLP-1", "Other"] },
  { id: "101", kind: "single", label: "How long have you been using (or did you use) it?", options: ["Less than 1 month", "1–3 months", "3–6 months", "More than 6 months"] },
  { id: "102", kind: "textarea", label: "Approximately how much weight have you lost?" },
  { id: "32", kind: "multi", label: "Your Treatment History", options: ["Exilis®", "Endospheres®", "EMS", "Lymphatic Drainage", "Wood Therapy", "Radiofrequency", "Cavitation", "CoolSculpting®", "Liposuction", "Tummy Tuck", "Other", "None"], required: true },
  { id: "35", kind: "multi", label: "Preferred Days", options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], required: true },
  { id: "36", kind: "single", label: "Preferred Time", options: ["Morning", "Afternoon", "Evening"], required: true },
  { id: "37", kind: "multi", label: "Mobile Appointment Info", options: ["Parking Available", "Elevator", "Stairs", "Gate Code Required", "Concierge", "Pets", "Other"], required: true },
  { id: "91", kind: "single", label: "Which aromatherapy scent would you like during your session?", options: ["Vanilla", "Lavender", "Eucalyptus", "Coconut", "None, thank you"], required: true },
  {
    id: "107",
    kind: "multi",
    label: "Please review the following acknowledgements.",
    options: [
      "I confirm that the information provided is accurate and complete.",
      "I understand that results vary from person to person.",
      "I understand that my treatment plan may be adjusted if medically necessary.",
      "I consent to receive the recommended Body Shaper System™ treatments.",
    ],
    required: true,
    allRequired: true,
  },
];

export const PREPARE_STEPS: FormStep[] = [
  { key: "details", tone: "sand", title: "your details", hint: "we've filled in what we already know — please confirm.", questions: ["3_first", "3_last", "4", "8", "7"] },
  { key: "address", tone: "sand", title: "where will we meet you?", hint: "the address of your appointments.", questions: ["9_street", "9_unit", "9_city", "9_zip"] },
  { key: "emergency", tone: "olive", title: "emergency contact", questions: ["10", "11"] },
  { key: "lifestyle1", tone: "sand", title: "your lifestyle", hint: "there are no wrong answers — this helps us personalize your plan.", questions: ["20", "21", "22", "23"] },
  { key: "lifestyle2", tone: "sand", title: "a little more about you", questions: ["24", "25", "26"] },
  { key: "status", tone: "olive", title: "your health & safety", questions: ["103", "104", "94", "105", "96"] },
  { key: "conditions", tone: "olive", title: "medical conditions & medications", questions: ["106", "106_other", "97", "98"] },
  { key: "glp1", tone: "sand", title: "glp-1 assessment", questions: ["99", "100", "101", "102"] },
  { key: "history", tone: "sand", title: "your treatment history", hint: "select all that apply.", questions: ["32"] },
  { key: "appointments", tone: "olive", title: "your appointments", questions: ["35", "36", "37"] },
  { key: "ritual", tone: "burgundy", title: "your session ritual", questions: ["91"] },
  { key: "acknowledge", tone: "sand", title: "acknowledgements", hint: "please read and confirm each statement.", questions: ["107"] },
];

export function prepareVisible(id: string, a: Answers): boolean {
  const has = (k: string, v: string) => Array.isArray(a[k]) && (a[k] as string[]).includes(v);
  switch (id) {
    case "104":
      return has("103", "Postpartum");
    case "105":
    case "96":
      return a["94"] === "Yes";
    case "106_other":
      return has("106", "Other");
    case "98":
      return a["97"] === "Yes";
    case "100":
    case "101":
    case "102":
      return !!a["99"] && a["99"] !== "No.";
    default:
      return true;
  }
}

/* ------------------------------------------------------------------ Almost Ready™ — waiver */
export const WAIVER_VERSION = "bss-waiver-v2 (verbatim from Jotform 230686448903161)";
export const WAIVER_TITLE = "Body Shaper System™ Client Agreement";
export const WAIVER_SUBTITLE = "Waiver • Release of Liability • Assumption of Risk • Informed Consent";
export const WAIVER_PREAMBLE = `Please Read Carefully Before Signing

This Agreement contains important legal rights and obligations regarding the non-invasive aesthetic and wellness services provided by Body Shaper System LLC.

By signing this Agreement, I acknowledge that:
• I have carefully read and understood this document in its entirety.
• I have had the opportunity to ask questions before signing.
• I voluntarily agree to all of its terms and conditions.
• I understand that this Agreement includes an Assumption of Risk, Release of Liability, and Informed Consent.

If I do not fully understand any part of this Agreement, I will ask for clarification before signing.`;

export type WaiverSection = { id: string; title: string; text: string; agree: { id: string; label: string }; choice?: { id: string; label: string; options: string[] }; subtitle?: string; extra?: { subtitle: string; text: string } };
export const WAIVER_SECTIONS: WaiverSection[] = [
  {
    id: "s1",
    title: "SECTION 1 — Acknowledgment of Services",
    text: "I understand that Body Shaper System™ provides non-invasive body contouring and wellness treatments including, but not limited to: Exilis®, EMS, Endospheres®, Lymphatic Drainage, Post-Operative Recovery Support, Complementary Body Contouring Treatments. I understand these services are cosmetic and wellness-oriented and are not intended to diagnose, treat, cure or prevent any disease or medical condition.",
    agree: { id: "s1_agree", label: "I have read and agree." },
  },
  {
    id: "s2",
    title: "SECTION 2 — Medical Disclosure",
    text: "I certify that all information provided in my Prepare Your Experience™ Pre-Treatment Evaluation is complete and accurate to the best of my knowledge. I understand that it is my responsibility to notify Body Shaper System™ of any changes to my health, medications, pregnancy status, surgeries or medical conditions before any treatment.",
    agree: { id: "s2_agree", label: "I have read and agree." },
  },
  {
    id: "s3",
    title: "SECTION 3 — Assumption of Risk",
    text: "Although these treatments are considered non-invasive, I understand that temporary side effects may occur, including but not limited to: Redness, Mild Swelling, Tenderness, Bruising, Temporary Skin Sensitivity, Muscle Soreness, Temporary Discomfort. I voluntarily accept these risks.",
    agree: { id: "s3_agree", label: "I have read and agree." },
  },
  {
    id: "s4",
    title: "SECTION 4 — No Guarantee of Results",
    text: "I understand that treatment outcomes vary from person to person. No guarantees or promises have been made regarding specific results. My outcome depends on multiple factors including lifestyle, consistency, hydration, nutrition, body composition and adherence to the recommended treatment plan.",
    agree: { id: "s4_agree", label: "I have read and agree." },
  },
  {
    id: "s5",
    title: "SECTION 5 — Clinical Photography & Media Authorization",
    subtitle: "Clinical Photography",
    text: "I authorize Body Shaper System™ to take photographs for confidential clinical documentation and progress tracking. These photographs will remain confidential and become part of my private client record.",
    agree: { id: "s5_agree", label: "I authorize clinical photography." },
    extra: { subtitle: "Marketing & Content Authorization", text: "I authorize Body Shaper System™ to use my treatment photos and/or videos for educational and marketing purposes." },
    choice: { id: "s5_marketing", label: "Select one option", options: ["Yes", "Yes, but please do not show my face.", "No"] },
  },
  {
    id: "s6",
    title: "SECTION 6 — Appointment Policies",
    text: "I understand and agree that: A minimum of 24 hours' notice is required to cancel or reschedule an appointment. Deposits are non-refundable unless otherwise stated in writing. Appointments located within an Extended Service Area may require an additional travel fee. Any required valet or paid parking fees are not included in my treatment price and remain the client's responsibility. My specialist may refuse, postpone or discontinue treatment if it is determined that treatment is not appropriate or safe on the day of my appointment.",
    agree: { id: "s6_agree", label: "I have read and agree." },
  },
  {
    id: "s7",
    title: "SECTION 7 — Release of Liability",
    text: "I voluntarily consent to receive the recommended Body Shaper System™ treatments. To the fullest extent permitted by applicable law, I release and hold harmless Body Shaper System LLC, its owners, managers, employees, independent contractors and representatives from any claims, damages or liabilities arising from the treatments provided, except in cases of gross negligence or willful misconduct. I acknowledge that I am voluntarily participating in these treatments and accept full responsibility for my decision to proceed.",
    agree: { id: "s7_agree", label: "I have read and agree." },
  },
];
export const WAIVER_CERTIFY = "By signing below, I certify that I have read this Agreement, fully understand its contents and voluntarily agree to all of its terms.";

/* ------------------------------------------------------------------ shared validation (server + client) */
const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim().length > 0);

/** Returns an error message or null. Only known ids, only listed options, required + conditional rules. */
export function validatePrepare(a: Answers): string | null {
  for (const q of PREPARE_QUESTIONS) {
    if (!prepareVisible(q.id, a)) continue;
    const v = a[q.id];
    if (v !== undefined && typeof v !== "string" && !(Array.isArray(v) && v.every((x) => typeof x === "string"))) return "Invalid answer.";
    if (typeof v === "string" && v.length > 3000) return "An answer is too long.";
    if (q.required && !filled(v)) return `Please complete: ${q.label}`;
    if ((q.kind === "single" || q.kind === "multi") && filled(v)) {
      const items = Array.isArray(v) ? v : [v as string];
      if (items.some((x) => !q.options.includes(x))) return "Invalid selected option.";
      if (q.kind === "multi" && q.allRequired && items.length !== q.options.length) return "Please read and acknowledge every statement.";
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(a["4"] ?? ""))) return "Please enter a valid email address.";
  if (String(a["8"] ?? "").replace(/\D/g, "").length < 10) return "Please enter a valid phone number.";
  if (String(a["11"] ?? "").replace(/\D/g, "").length < 10) return "Please enter a valid emergency contact phone number.";
  return null;
}

export function validateWaiver(a: Answers): string | null {
  for (const s of WAIVER_SECTIONS) {
    if (a[s.agree.id] !== s.agree.label) return `Please confirm ${s.title}.`;
    if (s.choice && !s.choice.options.includes(String(a[s.choice.id] ?? ""))) return "Please choose your marketing & content preference.";
  }
  return null;
}

/** Label/answer pairs for the signed PDF and the Hub, in the original order. */
export function prepareRecord(a: Answers): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  for (const q of PREPARE_QUESTIONS) {
    if (!prepareVisible(q.id, a)) continue;
    const v = a[q.id];
    out.push({ label: q.label, value: Array.isArray(v) ? v.join(", ") : String(v ?? "") });
  }
  return out;
}
export function waiverRecord(a: Answers): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [{ label: "ORIGINAL TEXT", value: WAIVER_PREAMBLE }];
  for (const s of WAIVER_SECTIONS) {
    out.push({ label: s.title, value: `${s.subtitle ? s.subtitle + ": " : ""}${s.text}` });
    out.push({ label: s.agree.label, value: a[s.agree.id] === s.agree.label ? "YES" : "NO" });
    if (s.extra && s.choice) {
      out.push({ label: s.extra.subtitle, value: s.extra.text });
      out.push({ label: s.choice.label, value: String(a[s.choice.id] ?? "") });
    }
  }
  out.push({ label: "CERTIFICATION", value: WAIVER_CERTIFY });
  return out;
}
