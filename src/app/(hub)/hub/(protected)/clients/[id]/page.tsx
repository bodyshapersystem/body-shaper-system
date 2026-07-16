import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import {
  addMeasurement,
  sendOwnerMessage,
  getClientOverviewSummary,
  toggleClientPause,
  addClientNote,
} from "./actions";
import InvitationPanel from "./InvitationPanel";
import DeleteClientButton from "./DeleteClientButton";
import { getBusinessTimezone, formatDateInTimezone, formatTimeInTimezone } from "@/lib/format-datetime";
import { CATEGORY_ICONS as NOTIFICATION_ICONS } from "@/lib/notifications";
import BlueprintAssessmentTab from "./BlueprintAssessmentTab";
import BlueprintReport from "./BlueprintReport";
import DocumentUploadSheet from "./DocumentUploadSheet";
import DocumentRowActions from "../../documents/DocumentRowActions";

export const dynamic = "force-dynamic";

const TABS = [
  "overview",
  "blueprint",
  "measurements",
  "documents",
  "messages",
  "appointments",
  "rewards",
  "payments",
  "notes",
  "journey",
] as const;
type Tab = (typeof TABS)[number];

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const user = await getCurrentHubUser();
  if (!user || !hasPermission(user, "clients.view")) {
    redirect("/hub/dashboard");
  }

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      lead: true,
      user: true,
      blueprintAssessments: {
        orderBy: { version: "desc" },
        include: {
          bodyMeasurements: { orderBy: { measuredAt: "desc" } },
          renphoScans: { orderBy: { scanDate: "desc" } },
          photos: { orderBy: { uploadedAt: "desc" } },
          specialistObservations: { orderBy: { createdAt: "desc" } },
          strategyChanges: { orderBy: { changedAt: "desc" } },
        },
      },
      measurements: { orderBy: { scanDate: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
      messageThread: { include: { messages: { orderBy: { createdAt: "asc" } } } },
      rewardsAccount: true,
      portalInvite: true,
      emailEvents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  const [overview, appointments, payments, clientNotes, specialist, timezone, clientNotifications] = await Promise.all([
    getClientOverviewSummary(id),
    prisma.appointment.findMany({ where: { clientId: id }, orderBy: { startsAt: "desc" } }),
    prisma.payment.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } }),
    prisma.clientNote.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } }),
    client.blueprintAssessments?.[0]?.validatedById
      ? prisma.user.findUnique({ where: { id: client.blueprintAssessments[0].validatedById } })
      : Promise.resolve(null),
    getBusinessTimezone(),
    prisma.notification.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } }),
  ]);

  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "overview";
  const [latestScan, previousScan] = client.measurements;
  const initials = `${client.firstName[0] ?? ""}${client.lastName[0] ?? ""}`.toUpperCase();
  const TAB_LABELS: Record<Tab, string> = {
    overview: "Overview",
    blueprint: "Plan & Progress",
    measurements: "Measurements",
    documents: "Documents",
    messages: "Messages",
    appointments: "Sessions",
    rewards: "Rewards",
    payments: "Payments",
    notes: "Notes",
    journey: "Journey",
  };

  function money(cents: number) {
    return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="cat-body portal-page">
      {tab !== "blueprint" && (
        <>
          <div className="portal-page-head">
            <p className="portal-eyebrow">Clients</p>
            <h1>
              {client.firstName} {client.lastName}
            </h1>
          </div>

          <div className="cl-overview-panel">
            <div className="cl-overview-top">
              <div className="cl-avatar">{initials}</div>
              <div className="cl-overview-info">
                <div className="cl-header-name-row">
                  <strong>
                    {client.firstName} {client.lastName}
                  </strong>
                  <span className={`dash-status dash-status-${(overview?.status ?? "active").toLowerCase()}`}>{overview?.status ?? "Active"}</span>
                </div>
                <p className="cl-header-contact">
                  {client.email} {client.phone && `· ${client.phone}`}
                </p>
                <p className="cl-header-contact">
                  Client since {client.createdAt.toLocaleDateString()}
                  {specialist && ` · Specialist: ${specialist.fullName}`}
                </p>
              </div>
              {hasPermission(user, "clients.convert") && (
                <form
                  action={async () => {
                    "use server";
                    await toggleClientPause(client.id);
                  }}
                >
                  <button type="submit" className="cl-subtle-action">
                    {overview?.status === "Paused" ? "Resume" : "Pause"}
                  </button>
                </form>
              )}
              {hasPermission(user, "clients.convert") && <DeleteClientButton clientId={client.id} />}
            </div>

            <InvitationPanel
              clientId={client.id}
              portalStatus={client.user.portalStatus}
              invitedAt={client.portalInvite?.createdAt ?? null}
              lastSentAt={client.portalInvite?.lastSentAt ?? null}
              activatedAt={client.portalInvite?.acceptedAt ?? null}
              attemptCount={client.portalInvite?.attemptCount ?? 0}
              activationToken={client.portalInvite?.token ?? null}
              emailEvents={client.emailEvents.map((e) => ({
                id: e.id,
                template: e.template,
                status: e.status,
                createdAt: e.createdAt.toISOString(),
                errorMessage: e.errorMessage,
              }))}
              canResend={hasPermission(user, "clients.convert")}
            />
          </div>
        </>
      )}

      <nav className="cl-tab-nav">
        {TABS.map((t) => (
          <a key={t} href={`/hub/clients/${id}?tab=${t}`} className={tab === t ? "cl-tab active" : "cl-tab"}>
            {TAB_LABELS[t]}
          </a>
        ))}
      </nav>

      {tab === "overview" && overview && (
        <div className="cl-overview-grid">
          <div className="pd-card">
            <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Client Summary</h3>
            <div className="cl-summary-list">
              <div className="cl-summary-row">
                <span>Personalized System™</span>
                <span>{overview.system ?? "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Total Sessions</span>
                <span>{overview.totalSessions ?? "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Completed</span>
                <span>{overview.completedCount}</span>
              </div>
              <div className="cl-summary-row">
                <span>Remaining</span>
                <span>{overview.remaining ?? "—"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Plan Value</span>
                <span>{overview.planTotalCents !== null ? money(overview.planTotalCents) : "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Paid to Date</span>
                <span>{money(overview.paidCents)}</span>
              </div>
              <div className="cl-summary-row">
                <span>Balance</span>
                <span>{overview.balanceCents !== null ? money(overview.balanceCents) : "—"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Next Appointment</span>
                <span>
                  {overview.nextAppointment
                    ? `${formatDateInTimezone(overview.nextAppointment.startsAt, timezone)} · ${formatTimeInTimezone(overview.nextAppointment.startsAt, timezone)}`
                    : "No upcoming"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="pd-card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 16 }}>Progress Overview</h3>
              <div className="cl-ring-wrap">
                <div
                  className="cl-ring"
                  style={{
                    background: `conic-gradient(#5C1A1F ${overview.overallProgressPercent ?? 0}%, rgba(92,26,31,0.15) 0)`,
                  }}
                >
                  <div className="cl-ring-inner">
                    <strong>{overview.overallProgressPercent !== null ? `${overview.overallProgressPercent}%` : "—"}</strong>
                    <span>Overall</span>
                  </div>
                </div>
                <div className="cl-ring-legend">
                  <span>
                    <span className="cl-ring-legend-dot" style={{ background: "#5C1A1F" }} />
                    {overview.completedCount} Completed
                  </span>
                  <span>
                    <span className="cl-ring-legend-dot" style={{ background: "rgba(92,26,31,0.15)" }} />
                    {overview.remaining ?? "—"} Remaining
                  </span>
                  <span>
                    <span className="cl-ring-legend-dot" style={{ background: "#93650f" }} />
                    {overview.onHoldCount} On Hold
                  </span>
                </div>
              </div>
            </div>

            <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 4 }}>Quick Actions</h3>
            <div className="cl-quick-actions">
              <a href="/hub/appointments" className="cl-quick-btn">
                + New Appointment
              </a>
              <a href="/hub/payments" className="cl-quick-btn">
                $ Record Payment
              </a>
              <a href={`/hub/clients/${id}?tab=blueprint`} className="cl-quick-btn">
                ↑ Upload Progress Photos
              </a>
              <a href={`/hub/clients/${id}?tab=notes`} className="cl-quick-btn">
                ✎ Add Note
              </a>
            </div>
          </div>
        </div>
      )}

      {tab === "blueprint" && (
        <>
          <BlueprintReport client={client} clientId={id} />
          <BlueprintAssessmentTab client={client} canManage={hasPermission(user, "blueprints.manage")} />
        </>
      )}


      {tab === "measurements" && (
        <div style={{ maxWidth: 720 }}>
          {hasPermission(user, "measurements.manage") && (
            <form
              action={async (formData: FormData) => {
                "use server";
                await addMeasurement(client.id, formData);
              }}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}
            >
              <input name="scanDate" type="date" required style={{ padding: 10 }} />
              <input name="weightKg" type="number" step="0.1" placeholder="Weight (kg)" style={{ padding: 10 }} />
              <input name="bodyFatPercent" type="number" step="0.1" placeholder="Body fat %" style={{ padding: 10 }} />
              <input name="muscleMassKg" type="number" step="0.1" placeholder="Muscle mass (kg)" style={{ padding: 10 }} />
              <input name="bodyWaterPercent" type="number" step="0.1" placeholder="Body water %" style={{ padding: 10 }} />
              <input name="bmi" type="number" step="0.1" placeholder="BMI" style={{ padding: 10 }} />
              <input name="visceralFat" type="number" step="0.1" placeholder="Visceral fat" style={{ padding: 10 }} />
              <input name="boneMassKg" type="number" step="0.1" placeholder="Bone mass (kg)" style={{ padding: 10 }} />
              <input name="bmr" type="number" placeholder="BMR" style={{ padding: 10 }} />
              <input name="bodyAge" type="number" placeholder="Body age" style={{ padding: 10 }} />
              <input name="deviceSource" defaultValue="RENPHO Health" style={{ padding: 10 }} />
              <input name="notes" placeholder="Notes" style={{ padding: 10, gridColumn: "span 2" }} />
              <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
                Add Scan
              </button>
            </form>
          )}

          {client.measurements.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No measurements recorded yet.</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <strong style={{ fontSize: 11, opacity: 0.6, display: "block" }}>Latest — {latestScan.scanDate.toLocaleDateString()}</strong>
                  Weight: {latestScan.weightKg ?? "—"} kg · Body Fat: {latestScan.bodyFatPercent ?? "—"}%
                </div>
                {previousScan && (
                  <div>
                    <strong style={{ fontSize: 11, opacity: 0.6, display: "block" }}>Change from previous</strong>
                    Weight:{" "}
                    {latestScan.weightKg != null && previousScan.weightKg != null
                      ? (latestScan.weightKg - previousScan.weightKg).toFixed(1)
                      : "—"}{" "}
                    kg · Body Fat:{" "}
                    {latestScan.bodyFatPercent != null && previousScan.bodyFatPercent != null
                      ? (latestScan.bodyFatPercent - previousScan.bodyFatPercent).toFixed(1)
                      : "—"}
                    %
                  </div>
                )}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                    <th style={{ padding: "8px" }}>Date</th>
                    <th style={{ padding: "8px" }}>Weight</th>
                    <th style={{ padding: "8px" }}>Body Fat %</th>
                    <th style={{ padding: "8px" }}>Muscle Mass</th>
                    <th style={{ padding: "8px" }}>Device</th>
                  </tr>
                </thead>
                <tbody>
                  {client.measurements.map((m) => (
                    <tr key={m.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <td style={{ padding: "8px" }}>{m.scanDate.toLocaleDateString()}</td>
                      <td style={{ padding: "8px" }}>{m.weightKg ?? "—"}</td>
                      <td style={{ padding: "8px" }}>{m.bodyFatPercent ?? "—"}</td>
                      <td style={{ padding: "8px" }}>{m.muscleMassKg ?? "—"}</td>
                      <td style={{ padding: "8px" }}>{m.deviceSource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div style={{ maxWidth: 560 }}>
          {hasPermission(user, "documents.manage") && <DocumentUploadSheet clientId={client.id} />}
          {client.documents.length === 0 ? (
            <p className="dash-empty">No documents uploaded yet.</p>
          ) : (
            <div className="sess-card-grid">
              {client.documents.map((doc) => (
                <div key={doc.id} className="sess-card">
                  <p className="sess-card-date">{doc.title}</p>
                  <p className="pay-history-meta">
                    {doc.uploadedAt.toLocaleDateString()} · {doc.fileType ?? "file"}
                  </p>
                  <DocumentRowActions
                    documentId={doc.id}
                    storagePath={doc.storagePath}
                    title={doc.title}
                    category={doc.category}
                    visibility={doc.visibility}
                    canManage={hasPermission(user, "documents.manage")}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "messages" && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, maxHeight: 400, overflowY: "auto" }}>
            {(!client.messageThread || client.messageThread.messages.length === 0) && (
              <p style={{ opacity: 0.6 }}>No messages yet.</p>
            )}
            {client.messageThread?.messages.map((m) => (
              <div key={m.id} style={{ fontSize: 13.5, alignSelf: m.senderType === "OWNER" ? "flex-end" : "flex-start" }}>
                <strong>{m.senderType === "OWNER" ? "You" : `${client.firstName}`}:</strong> {m.body}
                <div style={{ fontSize: 11, opacity: 0.5 }}>{m.createdAt.toLocaleString()}</div>
              </div>
            ))}
          </div>
          {hasPermission(user, "messages.manage") && (
            <form
              action={async (formData: FormData) => {
                "use server";
                await sendOwnerMessage(client.id, formData);
              }}
              style={{ display: "flex", gap: 12 }}
            >
              <input name="body" placeholder="Write a message…" required style={{ padding: 10, flex: 1 }} />
              <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
                Send
              </button>
            </form>
          )}
        </div>
      )}

      {tab === "appointments" && (
        <div style={{ maxWidth: 640 }}>
          {appointments.length === 0 ? (
            <p className="dash-empty">No appointments scheduled yet.</p>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", paddingLeft: 0 }}>
              {appointments.map((a) => (
                <li key={a.id} className="sess-card">
                  <div className="sess-card-head">
                    <span className="sess-card-number">{formatDateInTimezone(a.startsAt, timezone)}</span>
                    <span className={`dash-status dash-status-${a.status.toLowerCase()}`}>{a.status}</span>
                  </div>
                  <p className="sess-card-date">{a.title}</p>
                  {a.estimatedMinutes && <p className="pay-history-meta">{a.estimatedMinutes} min</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "rewards" && (
        <div style={{ fontSize: 13.5 }}>
          <p>Points balance: {client.rewardsAccount?.pointsBalance ?? 0}</p>
          <p>Tier: {client.rewardsAccount?.tier ?? "Standard"}</p>
        </div>
      )}

      {tab === "payments" && (
        <div style={{ maxWidth: 640 }}>
          {overview && (
            <div className="pay-financials" style={{ marginBottom: 24 }}>
              <div>
                <span>Total Plan</span>
                <strong>{overview.planTotalCents !== null ? money(overview.planTotalCents) : "Not set"}</strong>
              </div>
              <div>
                <span>Paid</span>
                <strong>{money(overview.paidCents)}</strong>
              </div>
              <div>
                <span>Balance</span>
                <strong>{overview.balanceCents !== null ? money(overview.balanceCents) : "—"}</strong>
              </div>
            </div>
          )}
          <a href="/hub/payments" className="sched-cta" style={{ display: "inline-block", marginBottom: 24, textDecoration: "none" }}>
            Record Payment →
          </a>
          {payments.length === 0 ? (
            <p className="dash-empty">No payments recorded yet.</p>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", paddingLeft: 0 }}>
              {payments.map((p) => (
                <li key={p.id} className="sess-card">
                  <div className="sess-card-head">
                    <span className="sess-card-number">{p.createdAt.toLocaleDateString()}</span>
                    <span className={`dash-status dash-status-${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                  <p className="sess-card-date">{money(p.amountCents)}</p>
                  {p.installmentNumber && (
                    <p className="pay-history-meta">
                      Payment {p.installmentNumber} of {p.installmentTotal}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "notes" && (
        <div style={{ maxWidth: 640 }}>
          {hasPermission(user, "clients.view") && (
            <form
              action={async (formData: FormData) => {
                "use server";
                await addClientNote(client.id, formData);
              }}
              style={{ marginBottom: 24 }}
            >
              <textarea
                name="content"
                rows={3}
                className="sched-textarea"
                placeholder="Add a note about this client…"
                style={{ marginBottom: 10 }}
              />
              <button type="submit" className="sched-cta">
                Add Note
              </button>
            </form>
          )}
          {clientNotes.length === 0 ? (
            <p className="dash-empty">No notes yet.</p>
          ) : (
            clientNotes.map((n) => (
              <div key={n.id} className="cl-note-card">
                <p className="cl-note-meta">{n.createdAt.toLocaleString()}</p>
                <p className="cl-note-content">{n.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "journey" && (
        <>
          <h3 className="dash-section-title">Activity Log</h3>
          {clientNotifications.length === 0 ? (
            <p className="dash-empty">No activity recorded yet.</p>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, marginBottom: 24 }}>
              {clientNotifications.map((n) => (
                <li key={n.id}>
                  {NOTIFICATION_ICONS[n.category] ?? "🔔"} {n.description} — <span className="pay-history-meta">{n.createdAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          <h3 className="dash-section-title">Milestones</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
            <li>Lead created — {client.lead.createdAt.toLocaleString()}</li>
            {client.lead.convertedAt && <li>Converted to client — {client.lead.convertedAt.toLocaleString()}</li>}
            {client.blueprintAssessments.map((bp) => (
              <li key={bp.id}>
                Blueprint Assessment™ v{bp.version} ({bp.status}) — {bp.createdAt.toLocaleString()}
              </li>
            ))}
            {client.blueprintAssessments
              .filter((bp) => bp.validatedAt)
              .map((bp) => (
                <li key={`${bp.id}-validated`}>Blueprint Validated (v{bp.version}) — {bp.validatedAt!.toLocaleString()}</li>
              ))}
            {client.measurements.map((m) => (
              <li key={m.id}>Measurement scan recorded — {m.createdAt.toLocaleString()}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
