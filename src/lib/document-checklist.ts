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
 *
 * BODY_BLUEPRINT_PDF was removed per direction — "Body Blueprint
 * Assessment™" was an old name for the exact same document as
 * "Prepare for Your Experience" (POLICIES_APPOINTMENTS), not a
 * separate real thing. Leaving it in the checklist meant it could
 * never actually complete, since nothing creates a document under
 * that category anymore. Only 2 required docs remain for Standard/
 * VIP clients (Waiver + Prepare for Your Experience); Ambassadors
 * get the real Content Release Agreement (Ambassador Program
 * Agreement Jotform) as a 3rd — the form now exists and is wired to
 * a real webhook, see CLIENT_COMPLETABLE_FORM_URLS below.
 */
export const REQUIRED_DOCUMENTS: RequiredDocDef[] = [
  { category: "POLICIES_APPOINTMENTS", title: "Prepare for Your Experience", icon: "📋" },
  { category: "CONSENT_TREATMENT", title: "Almost Done", icon: "✅" },
  { category: "PHOTOGRAPHY_AUTHORIZATION", title: "Content Release Agreement", icon: "🎥", ambassadorOnly: true },
];

export function getRequiredDocsForClient(isAmbassador: boolean): RequiredDocDef[] {
  return REQUIRED_DOCUMENTS.filter((d) => !d.ambassadorOnly || isAmbassador);
}

/**
 * Real Jotform form URLs — only categories the client can actually
 * complete themselves have one. BODY_BLUEPRINT_PDF is uploaded by the
 * Owner (not a client-facing form) so it's intentionally absent here
 * rather than pointing at a broken link, and "Smart Complete Now"
 * skips straight past it.
 */
export const CLIENT_COMPLETABLE_FORM_URLS: Partial<Record<DocumentCategory, string>> = {
  POLICIES_APPOINTMENTS: "https://form.jotform.com/261860243106046",
  CONSENT_TREATMENT: "https://form.jotform.com/beautyboxmia/waiver---release-form",
  PHOTOGRAPHY_AUTHORIZATION: "https://form.jotform.com/262001828942051",
};
