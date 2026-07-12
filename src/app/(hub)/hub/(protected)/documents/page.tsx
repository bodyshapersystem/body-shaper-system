import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import DocumentUploadSheet from "../clients/[id]/DocumentUploadSheet";
import DocumentRowActions from "./DocumentRowActions";

export const dynamic = "force-dynamic";

const CHECKLIST: { category: string; label: string }[] = [
  { category: "WELCOME_GUIDE", label: "Welcome Guide" },
  { category: "POLICIES_APPOINTMENTS", label: "Policies & Appointments" },
  { category: "CONSENT_TREATMENT", label: "Consent for Treatment" },
  { category: "PHOTOGRAPHY_AUTHORIZATION", label: "Photography Authorization" },
  { category: "BODY_BLUEPRINT_PDF", label: "Body Blueprint™ PDF" },
];

const CATEGORY_LABELS: Record<string, string> = {
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
  searchParams: Promise<{ clientId?: string; q?: string; category?: string }>;
}) {
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "documents.manage")) redirect("/hub/dashboard");

  const { clientId, q, category } = await searchParams;

  const clients = await prisma.client.findMany({ where: { archivedAt: null }, orderBy: { firstName: "asc" } });
  const selectedClient = clientId ? clients.find((c) => c.id === clientId) : null;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">client records™</p>
        <h1>client records.</h1>
        <p className="dash-subtitle">Every signed document, report and client record securely organized in one place.</p>
      </div>

      <form style={{ marginBottom: 24, maxWidth: 400, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <label className="sched-label" style={{ flex: 1 }}>
          Select Client
          <select name="clientId" defaultValue={clientId ?? ""} className="sched-select">
            <option value="">Choose a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="dash-view-btn">
          Go
        </button>
      </form>

      {!selectedClient ? (
        <p className="dash-empty">Select a client above to view their Client Records™.</p>
      ) : (
        <ClientRecordsView clientId={selectedClient.id} q={q} category={category} canManage={hasPermission(user, "documents.manage")} />
      )}
    </div>
  );
}

async function ClientRecordsView({
  clientId,
  q,
  category,
  canManage,
}: {
  clientId: string;
  q?: string;
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

  const assessment = client.blueprintAssessments[0];

  const categoryCounts = new Map<string, number>();
  for (const d of documents) categoryCounts.set(d.category, (categoryCounts.get(d.category) ?? 0) + 1);

  const checklistDone = CHECKLIST.filter((item) => (categoryCounts.get(item.category) ?? 0) > 0).length;
  const progressPercent = Math.round((checklistDone / CHECKLIST.length) * 100);
  const finalReportExists = (categoryCounts.get("FINAL_REPORT") ?? 0) > 0;
  const finalReportReady = checklistDone === CHECKLIST.length;

  const filtered = documents.filter((d) => {
    if (category && d.category !== category) return false;
    if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const missingItems = CHECKLIST.filter((item) => (categoryCounts.get(item.category) ?? 0) === 0);

  return (
    <>
      {/* ---------- Client Summary ---------- */}
      <div className="cl-header-card" style={{ marginBottom: 24 }}>
        <div className="cl-avatar">
          {client.firstName[0]}
          {client.lastName[0]}
        </div>
        <div className="cl-header-info">
          <div className="cl-header-name-row">
            <strong>
              {client.firstName} {client.lastName}
            </strong>
            {assessment?.recommendedSystem && <span className="dash-status">{assessment.recommendedSystem}</span>}
          </div>
          <p className="cl-header-contact">Client since {client.createdAt.toLocaleDateString()}</p>
          <p className="cl-header-contact">
            {documents.length} Records · Last upload {documents[0] ? documents[0].uploadedAt.toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      {/* ---------- Documentation Status™ (hero) ---------- */}
      <div className="pd-card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 4 }}>Documentation Progress</h3>
        <p className="pay-history-meta" style={{ marginBottom: 10 }}>
          {checklistDone} of {CHECKLIST.length} completed
        </p>
        <div className="sched-progress-track" style={{ background: "rgba(0,0,0,0.08)", marginBottom: 16 }}>
          <div className="sched-progress-fill" style={{ background: "var(--cat,#5C1A1F)", width: `${progressPercent}%` }} />
        </div>
        <ul className="doc-checklist">
          {CHECKLIST.map((item) => {
            const done = (categoryCounts.get(item.category) ?? 0) > 0;
            return (
              <li key={item.category}>
                <span className={done ? "doc-check-dot done" : "doc-check-dot"}>{done ? "✓" : "○"}</span>
                {item.label}
                <span className="pay-history-meta" style={{ marginLeft: "auto" }}>
                  {done ? "Complete" : "Not available yet"}
                </span>
              </li>
            );
          })}
          <li>
            <span className={finalReportExists ? "doc-check-dot done" : "doc-check-dot"}>{finalReportExists ? "✓" : "○"}</span>
            Final Report
            <span className="pay-history-meta" style={{ marginLeft: "auto" }}>
              {finalReportExists ? "Generated" : finalReportReady ? "Ready to generate" : "Available after completion"}
            </span>
          </li>
        </ul>
      </div>

      {/* ---------- Alerts ---------- */}
      {missingItems.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 className="dash-section-title">Alerts</h3>
          {missingItems.map((item) => (
            <div key={item.category} className="doc-alert-card">
              <span>
                {client.firstName} {client.lastName} — {item.label} pending.
              </span>
              <DocumentUploadSheet clientId={client.id} defaultCategory={item.category} />
            </div>
          ))}
        </div>
      )}

      {/* ---------- Categories ---------- */}
      <h3 className="dash-section-title">Record Categories</h3>
      <div className="doc-category-grid">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/hub/documents?clientId=${clientId}&category=${key}`}
            className={category === key ? "doc-category-card active" : "doc-category-card"}
          >
            <span>{label}</span>
            <strong>{categoryCounts.get(key) ?? 0}</strong>
          </Link>
        ))}
      </div>

      {/* ---------- Upload ---------- */}
      {canManage && (
        <div style={{ margin: "24px 0" }}>
          <DocumentUploadSheet clientId={client.id} />
        </div>
      )}

      {/* ---------- Records List ---------- */}
      <h3 className="dash-section-title">
        Documents ({filtered.length}
        {category ? ` · ${CATEGORY_LABELS[category] ?? category}` : ""})
      </h3>
      <form style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        <input type="hidden" name="clientId" value={clientId} />
        {category && <input type="hidden" name="category" value={category} />}
        <input name="q" defaultValue={q ?? ""} placeholder="Search documents…" className="sched-select" style={{ flex: 1 }} />
        <button type="submit" className="dash-view-btn">
          Search
        </button>
        {category && (
          <Link href={`/hub/documents?clientId=${clientId}`} className="dash-view-btn">
            Clear filter
          </Link>
        )}
      </form>

      {filtered.length === 0 ? (
        <div className="bp-empty-state">
          <p>No documents uploaded yet.</p>
          <p className="pay-history-meta">Start building this client's secure record.</p>
        </div>
      ) : (
        <div className="sess-card-grid">
          {filtered.map((d) => (
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
    </>
  );
}
