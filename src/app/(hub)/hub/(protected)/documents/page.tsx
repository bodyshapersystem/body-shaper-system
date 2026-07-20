import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import DocumentUploadSheet from "../clients/[id]/DocumentUploadSheet";
import DocumentRowActions from "./DocumentRowActions";
import { getRequiredDocsForClient } from "@/lib/document-checklist";
import DocumentOwnerActions from "./DocumentOwnerActions";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  INTAKE_FORM: "Intake Form",
  WELCOME_GUIDE: "Welcome Guide",
  POLICIES_APPOINTMENTS: "Policies & Appointments",
  CONSENT_TREATMENT: "Consent for Treatment",
  PHOTOGRAPHY_AUTHORIZATION: "Photography Authorization",
  BODY_BLUEPRINT_PDF: "Body Blueprint™ PDF",
  FINAL_REPORT: "Final Report",
  RECEIPTS_INVOICES: "Receipts & Invoices",
  PROGRESS_PHOTOS: "Progress Photos",
  RENPHO_REPORTS: "RENPHO Reports",
  ADDITIONAL_FILES: "Additional Files",
};

function money(bytes: number | null) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default async function HubDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; q?: string; filter?: string; category?: string }>;
}) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) redirect("/hub/dashboard");

  const { clientId, q, filter, category } = await searchParams;

  if (!clientId) {
    return <ClientSearchView q={q} filter={filter} />;
  }

  return <ClientRecordsView clientId={clientId} category={category} canManage={hasPermission(user, "documents.manage")} />;
}

async function ClientSearchView({ q, filter }: { q?: string; filter?: string }) {
  const clients = await prisma.client.findMany({
    where: {
      archivedAt: null,
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      documents: true,
      blueprintAssessments: { orderBy: { version: "desc" }, take: 1 },
    },
    orderBy: { firstName: "asc" },
  });

  const rows = clients.map((c) => {
    const required = getRequiredDocsForClient(c.requiresContentRelease);
    const doneCount = required.filter((r) => c.documents.some((d) => d.category === r.category)).length;
    const isComplete = doneCount === required.length;
    return { client: c, doneCount, total: required.length, isComplete };
  });

  const filtered = rows.filter(({ client, isComplete }) => {
    if (filter === "onboarding_pending") return !isComplete;
    if (filter === "completed") return isComplete;
    if (filter === "ambassadors") return client.clientType === "AMBASSADOR";
    if (filter === "requires_attention") return !isComplete && client.documents.length === 0;
    return true;
  });

  const filterQuery = (f: string) => `/hub/documents?${f ? `filter=${f}` : ""}${q ? `${f ? "&" : ""}q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="cat-body portal-page">
      <div className="module-hero">
        <p className="module-hero-eyebrow">owner hub</p>
        <h1 className="module-hero-title">documents.</h1>
        <p className="module-hero-sub">View, manage and track all client documents in one secure place.</p>
      </div>

      <form style={{ marginBottom: 16 }}>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name, email, or phone…"
          className="sched-select"
          style={{ width: "100%", padding: "14px 16px", fontSize: 14 }}
        />
      </form>

      <div className="apt-zone-row" style={{ marginBottom: 24 }}>
        <Link href={filterQuery("")} className={`apt-zone-pill ${!filter ? "apt-zone-pill-active" : ""}`}>All Clients</Link>
        <Link href={filterQuery("onboarding_pending")} className={`apt-zone-pill ${filter === "onboarding_pending" ? "apt-zone-pill-active" : ""}`}>Onboarding Pending</Link>
        <Link href={filterQuery("completed")} className={`apt-zone-pill ${filter === "completed" ? "apt-zone-pill-active" : ""}`}>Completed</Link>
        <Link href={filterQuery("ambassadors")} className={`apt-zone-pill ${filter === "ambassadors" ? "apt-zone-pill-active" : ""}`}>Ambassadors</Link>
        <Link href={filterQuery("requires_attention")} className={`apt-zone-pill ${filter === "requires_attention" ? "apt-zone-pill-active" : ""}`}>Requires Attention</Link>
      </div>

      {filtered.length === 0 ? (
        <div className="module-empty">No clients match this search/filter.</div>
      ) : (
        <div className="doc-card-grid">
          {filtered.map(({ client, doneCount, total, isComplete }) => (
            <Link key={client.id} href={`/hub/documents?clientId=${client.id}`} className="doc-client-card">
              <div className="cl-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
                {client.firstName[0]}{client.lastName[0]}
              </div>
              <div>
                <p className="doc-card-title">{client.firstName} {client.lastName}</p>
                <p className="pay-history-meta">
                  {client.clientType === "AMBASSADOR" && "⭐ Ambassador · "}
                  {doneCount} of {total} documents {isComplete ? "· Complete" : "· Pending"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function ClientRecordsView({
  clientId,
  category,
  canManage,
}: {
  clientId: string;
  category?: string;
  canManage: boolean;
}) {
  const [client, documents] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      include: {
        blueprintAssessments: {
          where: { status: { in: ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"] } },
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    }),
    prisma.document.findMany({ where: { clientId }, orderBy: { uploadedAt: "desc" } }),
  ]);

  if (!client) return <p className="dash-empty">Client not found.</p>;

  const uploaderIds = [...new Set(documents.map((d) => d.uploadedById).filter((id): id is string => !!id))];
  const uploaders = uploaderIds.length > 0 ? await prisma.user.findMany({ where: { id: { in: uploaderIds } } }) : [];
  const uploaderNameById = new Map(uploaders.map((u) => [u.id, u.fullName]));

  const isAmbassador = client.clientType === "AMBASSADOR";
  const requiredDefs = getRequiredDocsForClient(client.requiresContentRelease);
  const requiredDocsWithMatch = requiredDefs.map((def) => ({
    ...def,
    doc: documents.find((d) => d.category === def.category) ?? null,
  }));
  const checklistDone = requiredDocsWithMatch.filter((r) => r.doc).length;
  const progressPercent = requiredDefs.length > 0 ? Math.round((checklistDone / requiredDefs.length) * 100) : 100;

  const requiredCategories = new Set(requiredDefs.map((d) => d.category));
  const sharedFiles = documents.filter((d) => !requiredCategories.has(d.category as never) && (!category || d.category === category));

  return (
    <div className="cat-body portal-page">
      <Link href="/hub/documents" className="cap-secondary-btn" style={{ display: "inline-block", marginBottom: 20, width: "auto" }}>
        ← Back to search
      </Link>

      {/* ---------- Selected Client Card ---------- */}
      <div className="cl-header-card" style={{ marginBottom: 24 }}>
        <div className="cl-avatar">
          {client.firstName[0]}
          {client.lastName[0]}
        </div>
        <div className="cl-header-info">
          <div className="cl-header-name-row">
            <strong>{client.firstName} {client.lastName}</strong>
            {client.pausedAt ? <span className="dash-status">Paused</span> : <span className="dash-status">Active</span>}
            {isAmbassador && <span className="dash-status">⭐ Ambassador</span>}
          </div>
          <p className="cl-header-contact">Client since {client.createdAt.toLocaleDateString()}</p>
          <p className="cl-header-contact">
            {progressPercent === 100 ? "Onboarding complete" : `Onboarding ${progressPercent}% complete`}
          </p>
        </div>
        <Link href={`/hub/clients/${client.id}`} className="dash-view-btn">Open Client Profile</Link>
      </div>

      {/* ---------- Documentation Progress ---------- */}
      <div className="pd-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 4 }}>Documentation Progress</h3>
        <p className="pay-history-meta" style={{ marginBottom: 10 }}>{checklistDone} of {requiredDefs.length} completed</p>
        <div className="sched-progress-track" style={{ background: "rgba(0,0,0,0.08)", marginBottom: 8 }}>
          <div className="sched-progress-fill" style={{ background: "var(--cat,#5C1A1F)", width: `${progressPercent}%` }} />
        </div>
        <p className="pay-history-meta">
          {progressPercent === 100 ? "All required documents completed." : `${progressPercent}% complete`}
        </p>
      </div>

      {/* ---------- Required Documents ---------- */}
      <h3 className="dash-section-title">Required Documents</h3>
      <div className="doc-card-grid" style={{ marginBottom: 32 }}>
        {requiredDocsWithMatch.map((r) => (
          <div key={r.category} className="doc-card">
            <div className="doc-card-icon">{r.icon}</div>
            <div className="doc-card-body">
              <p className="doc-card-title">{r.title}</p>
              <p className={`doc-card-status ${r.doc ? "doc-status-done" : "doc-status-pending"}`}>
                {r.doc ? "Completed" : "Pending"}
              </p>
              {r.doc && <p className="pay-history-meta">{r.doc.uploadedAt.toLocaleDateString()}</p>}
            </div>
            <DocumentOwnerActions
              clientId={client.id}
              category={r.category}
              title={r.title}
              storagePath={r.doc?.storagePath ?? null}
              documentId={r.doc?.id ?? null}
              hasDoc={!!r.doc}
            />
          </div>
        ))}
      </div>

      {/* ---------- Shared Files ---------- */}
      <h3 className="dash-section-title">Shared Files</h3>
      {canManage && (
        <div style={{ margin: "16px 0" }}>
          <DocumentUploadSheet clientId={client.id} />
        </div>
      )}
      {sharedFiles.length === 0 ? (
        <div className="module-empty">No shared files yet. Upload guides, instructions, or resources above.</div>
      ) : (
        <div className="sess-card-grid">
          {sharedFiles.map((d) => (
            <div key={d.id} className="sess-card">
              <div className="sess-card-head">
                <span className="sess-card-number">{CATEGORY_LABELS[d.category] ?? d.category}</span>
              </div>
              <p className="sess-card-date">{d.title}</p>
              <p className="pay-history-meta">
                {d.uploadedById ? uploaderNameById.get(d.uploadedById) ?? "—" : "—"} · {d.uploadedAt.toLocaleDateString()} · {money(d.sizeBytes)}
                {d.visibility === "CLIENT_VISIBLE" ? " · Visible in Client Hub" : " · Internal Only"}
              </p>
              <DocumentRowActions
                documentId={d.id}
                storagePath={d.storagePath}
                title={d.title}
                category={d.category}
                visibility={d.visibility}
                canManage={canManage}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
