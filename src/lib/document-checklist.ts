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
