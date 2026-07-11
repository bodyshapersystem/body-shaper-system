import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function HubDocumentsPage() {
  const user = await getCurrentHubUser();
  if (!user) redirect("/hub/login");

  const documents = await prisma.document.findMany({
    include: { client: true },
    orderBy: { uploadedAt: "desc" },
    take: 100,
  });

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Operations</p>
        <h1>documents.</h1>
      </div>
      <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 24 }}>
        Upload and manage documents from within each client's record. This is the log across all clients.
      </p>

      {documents.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No documents uploaded yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <th style={{ padding: "10px 8px" }}>Client</th>
              <th style={{ padding: "10px 8px" }}>Title</th>
              <th style={{ padding: "10px 8px" }}>Type</th>
              <th style={{ padding: "10px 8px" }}>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/hub/clients/${d.clientId}?tab=documents`}>
                    {d.client.firstName} {d.client.lastName}
                  </Link>
                </td>
                <td style={{ padding: "10px 8px" }}>{d.title}</td>
                <td style={{ padding: "10px 8px" }}>{d.fileType ?? "—"}</td>
                <td style={{ padding: "10px 8px" }}>{d.uploadedAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
