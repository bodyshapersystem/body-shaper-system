import { getCurrentPortalClient } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getRequiredDocsForClient, CLIENT_COMPLETABLE_FORM_URLS } from "@/lib/document-checklist";
import PortalDocumentsView from "./PortalDocumentsView";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  const documents = await prisma.document.findMany({
    where: { clientId: client.id, visibility: "CLIENT_VISIBLE" },
    orderBy: { uploadedAt: "desc" },
  });

  const admin = createSupabaseAdminClient();
  const withUrls = await Promise.all(
    documents.map(async (doc) => {
      const { data } = await admin.storage.from("client-documents").createSignedUrl(doc.storagePath, 60 * 10);
      return {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        uploadedAt: doc.uploadedAt.toISOString(),
        url: data?.signedUrl ?? null,
      };
    })
  );

  const requiredDefs = getRequiredDocsForClient(client.clientType === "AMBASSADOR");
  const requiredDocs = requiredDefs.map((def) => {
    const match = withUrls.find((d) => d.category === def.category);
    const baseFormUrl = CLIENT_COMPLETABLE_FORM_URLS[def.category];
    const formUrl = baseFormUrl
      ? def.category === "CONSENT_TREATMENT"
        ? `${baseFormUrl}?email=${encodeURIComponent(client.email)}`
        : baseFormUrl
      : null;
    return { ...def, completed: !!match, completedAt: match?.uploadedAt ?? null, url: match?.url ?? null, formUrl };
  });

  const requiredCategories = new Set(requiredDefs.map((d) => d.category));
  const sharedFiles = withUrls.filter((d) => !requiredCategories.has(d.category as never));

  const completedCount = requiredDocs.filter((d) => d.completed).length;
  const progressPercent = requiredDocs.length > 0 ? Math.round((completedCount / requiredDocs.length) * 100) : 100;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">your files</p>
        <h1>documents.</h1>
        <p className="portal-page-sub">Your signed forms, agreements and important files — all in one place.</p>
      </div>

      <PortalDocumentsView
        requiredDocs={requiredDocs}
        sharedFiles={sharedFiles}
        progressPercent={progressPercent}
        completedCount={completedCount}
        totalRequired={requiredDocs.length}
      />
    </div>
  );
}
