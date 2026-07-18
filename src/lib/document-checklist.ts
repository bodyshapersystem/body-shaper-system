import type { DocumentCategory } from "@prisma/client";

export type RequiredDocDef = {
  category: DocumentCategory;
  title: string;
  icon: string;
  ambassadorOnly?: boolean;
};

/**
 * The real required-documents checklist shown identically in both
 * the Client Portal and Owner Hub Documents pages. Content Release
 * Agreement only applies when Client.clientType === "AMBASSADOR".
 */
export const REQUIRED_DOCUMENTS: RequiredDocDef[] = [
  { category: "POLICIES_APPOINTMENTS", title: "Prepare for Your Experience", icon: "📋" },
  { category: "BODY_BLUEPRINT_PDF", title: "Body Blueprint Assessment™", icon: "🧬" },
  { category: "CONSENT_TREATMENT", title: "Almost Done", icon: "✅" },
  { category: "PHOTOGRAPHY_AUTHORIZATION", title: "Content Release Agreement", icon: "🎥", ambassadorOnly: true },
];

export function getRequiredDocsForClient(isAmbassador: boolean): RequiredDocDef[] {
  return REQUIRED_DOCUMENTS.filter((d) => !d.ambassadorOnly || isAmbassador);
}

/**
 * Real Jotform form URLs — only categories the client can actually
 * complete themselves have one. BODY_BLUEPRINT_PDF is uploaded by the
 * Owner (not a client-facing form) and PHOTOGRAPHY_AUTHORIZATION's
 * form doesn't exist yet (per direction, "do not build the form yet") -
 * both are intentionally absent here rather than pointing at a broken
 * link, and "Smart Complete Now" skips straight past them.
 */
export const CLIENT_COMPLETABLE_FORM_URLS: Partial<Record<DocumentCategory, string>> = {
  POLICIES_APPOINTMENTS: "https://form.jotform.com/261860243106046",
  CONSENT_TREATMENT: "https://form.jotform.com/beautyboxmia/waiver---release-form",
};
