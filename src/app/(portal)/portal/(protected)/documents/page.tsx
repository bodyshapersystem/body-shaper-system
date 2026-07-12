import { getCurrentPortalClient } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const client = await getCurrentPortalClient();
  if (!client) redirect("/portal/login");

  // Re-query with documents included (getCurrentPortalClient only
  // preloads the latest blueprint/measurement for the dashboard).
  // Only documents the Owner has explicitly marked Client Visible —
  // previously this had no visibility filter at all, meaning any
  // internal-only document (e.g. an internal note or receipt) was
  // already exposed here. Now the Owner Hub and Client Hub share the
  // same vault, with visibility as the one real difference.
  const documents = await prisma.document.findMany({
    where: { clientId: client.id, visibility: "CLIENT_VISIBLE" },
    orderBy: { uploadedAt: "desc" },
  });

  const admin = createSupabaseAdminClient();
  const withUrls = await Promise.all(
    documents.map(async (doc) => {
      const { data } = await admin.storage.from("client-documents").createSignedUrl(doc.storagePath, 60 * 10);
      return { ...doc, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Your Guides &amp; Forms</p>
        <h1>documents.</h1>
        <p className="portal-page-sub">Access your guides, forms and important resources.</p>
      </div>

      <div className="simple-card">
        {withUrls.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No documents yet.</p>
        ) : (
          <ul className="simple-list">
            {withUrls.map((doc) => (
              <li key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span>{doc.title}</span>
                {doc.url ? (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    View →
                  </a>
                ) : (
                  <span style={{ opacity: 0.5 }}>Unavailable</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

