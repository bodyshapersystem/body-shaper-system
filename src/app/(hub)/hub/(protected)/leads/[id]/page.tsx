import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import LeadStatusForm from "./LeadStatusForm";
import LeadConversionPanel from "./LeadConversionPanel";
import { updateLead, archiveLead, addLeadNote } from "../actions";

export const dynamic = "force-dynamic";

const TABS = ["overview", "activity", "notes"] as const;
type Tab = (typeof TABS)[number];

function parseNotes(raw: string | null): { author: string | null; at: Date | null; content: string }[] {
  if (!raw) return [];
  return raw
    .split("\n---\n")
    .reverse()
    .map((entry) => {
      const match = entry.match(/^\[([^|]+)\|([^\]]+)\]\s*([\s\S]*)$/);
      if (match) {
        const at = new Date(match[1]);
        return { author: match[2], at: isNaN(at.getTime()) ? null : at, content: match[3] };
      }
      return { author: null, at: null, content: entry };
    })
    .filter((n) => n.content.trim().length > 0);
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "leads.view")) {
    redirect("/hub/dashboard");
  }

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      statusHistory: { orderBy: { changedAt: "desc" }, include: { changedBy: true } },
      convertedClient: true,
    },
  });

  if (!lead) notFound();

  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "overview";
  const initials = `${lead.firstName[0] ?? ""}${lead.lastName[0] ?? ""}`.toUpperCase();
  const notes = parseNotes(lead.internalNotes);

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Leads</p>
        <h1>
          {lead.firstName} {lead.lastName}
        </h1>
      </div>

      <div className="cl-header-card">
        <div className="cl-avatar">{initials}</div>
        <div className="cl-header-info">
          <div className="cl-header-name-row">
            <strong>
              {lead.firstName} {lead.lastName}
            </strong>
            <span className="dash-status">{lead.status.replace(/_/g, " ")}</span>
          </div>
          <p className="cl-header-contact">
            {lead.phone && `${lead.phone} · `}
            {lead.email}
          </p>
          <p className="cl-header-contact">
            {lead.source && `Source: ${lead.source} · `}Added {lead.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>

      <nav className="cl-tab-nav">
        {TABS.map((t) => (
          <a key={t} href={`/hub/leads/${id}?tab=${t}`} className={tab === t ? "cl-tab active" : "cl-tab"}>
            {t === "overview" ? "Overview" : t === "activity" ? "Activity" : "Notes"}
          </a>
        ))}
      </nav>

      {tab === "overview" && (
        <>
          {/* ---------- Quick Actions ---------- */}
          <div className="cl-quick-actions" style={{ marginBottom: 28, maxWidth: 320 }}>
            {lead.phone && (
              <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="cl-quick-btn">
                WhatsApp
              </a>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="cl-quick-btn">
                Call
              </a>
            )}
            <a href={`mailto:${lead.email}`} className="cl-quick-btn">
              Email
            </a>
          </div>

          {!lead.convertedClient && hasPermission(user, "leads.edit") ? (
            <form
              action={async (formData: FormData) => {
                "use server";
                await updateLead(lead.id, formData);
              }}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 720, marginBottom: 24 }}
            >
              <label style={{ fontSize: 13 }}>
                <span style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>First Name</span>
                <input name="firstName" defaultValue={lead.firstName} required style={{ padding: 10, width: "100%" }} />
              </label>
              <label style={{ fontSize: 13 }}>
                <span style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Last Name</span>
                <input name="lastName" defaultValue={lead.lastName} required style={{ padding: 10, width: "100%" }} />
              </label>
              <label style={{ fontSize: 13 }}>
                <span style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Email</span>
                <input name="email" type="email" defaultValue={lead.email} required style={{ padding: 10, width: "100%" }} />
              </label>
              <label style={{ fontSize: 13 }}>
                <span style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Phone</span>
                <input name="phone" defaultValue={lead.phone ?? ""} style={{ padding: 10, width: "100%" }} />
              </label>
              <label style={{ fontSize: 13 }}>
                <span style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>City</span>
                <input name="city" defaultValue={lead.city ?? ""} style={{ padding: 10, width: "100%" }} />
              </label>
              <label style={{ fontSize: 13 }}>
                <span style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Source</span>
                <input name="source" defaultValue={lead.source ?? ""} style={{ padding: 10, width: "100%" }} />
              </label>
              <label style={{ fontSize: 13, gridColumn: "1 / -1" }}>
                <span style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Goals / Interest</span>
                <textarea name="goals" defaultValue={lead.goals ?? ""} rows={2} style={{ padding: 10, width: "100%" }} />
              </label>
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12 }}>
                <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
                  Save Changes
                </button>
                <form
                  action={async () => {
                    "use server";
                    await archiveLead(lead.id);
                  }}
                >
                  <button
                    type="submit"
                    style={{ padding: "10px 20px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 4, background: "none" }}
                  >
                    Archive / Lost
                  </button>
                </form>
              </div>
            </form>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 720, marginBottom: 32 }}>
              <div>
                <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Email</strong>
                {lead.email}
              </div>
              <div>
                <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Phone</strong>
                {lead.phone ?? "—"}
              </div>
              <div>
                <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>City</strong>
                {lead.city ?? "—"}
              </div>
              <div>
                <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Source</strong>
                {lead.source ?? "—"}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Goals / Interest</strong>
                {lead.goals ?? "—"}
              </div>
            </div>
          )}

          {hasPermission(user, "leads.edit") && <LeadStatusForm leadId={lead.id} currentStatus={lead.status} />}

          <div style={{ marginTop: 32 }}>
            <LeadConversionPanel
              leadId={lead.id}
              currentPaymentStatus={lead.paymentStatus}
              canEdit={hasPermission(user, "leads.edit")}
              canConvert={hasPermission(user, "clients.convert")}
              alreadyConvertedClientId={lead.convertedClient?.id ?? null}
            />
          </div>
        </>
      )}

      {tab === "activity" && (
        <div style={{ maxWidth: 640 }}>
          {lead.statusHistory.length === 0 ? (
            <p className="dash-empty">No activity yet.</p>
          ) : (
            <ul className="dash-timeline">
              {lead.statusHistory.map((entry) => (
                <li key={entry.id}>
                  <span className="dash-timeline-dot" />
                  <span className="dash-timeline-text">
                    {entry.toStatus.replace(/_/g, " ")}
                    {entry.fromStatus && ` (from ${entry.fromStatus.replace(/_/g, " ")})`}
                    {entry.changedBy && ` — by ${entry.changedBy.fullName}`}
                    {entry.note && <div style={{ opacity: 0.65, marginTop: 2 }}>{entry.note}</div>}
                  </span>
                  <span className="dash-timeline-time">{entry.changedAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "notes" && (
        <div style={{ maxWidth: 640 }}>
          {hasPermission(user, "leads.edit") && (
            <form
              action={async (formData: FormData) => {
                "use server";
                await addLeadNote(lead.id, formData);
              }}
              style={{ marginBottom: 24 }}
            >
              <textarea name="content" rows={3} className="sched-textarea" placeholder="Add a note about this lead…" style={{ marginBottom: 10 }} />
              <button type="submit" className="sched-cta">
                Add Note
              </button>
            </form>
          )}
          {notes.length === 0 ? (
            <p className="dash-empty">No notes yet.</p>
          ) : (
            notes.map((n, i) => (
              <div key={i} className="cl-note-card">
                <p className="cl-note-meta">
                  {n.at ? n.at.toLocaleString() : ""} {n.author && `· ${n.author}`}
                </p>
                <p className="cl-note-content">{n.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
