import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentHubUser, hasPermission } from "@/lib/permissions";
import {
  addMeasurement,
  sendOwnerMessage,
} from "./actions";
import InvitationPanel from "./InvitationPanel";
import BlueprintAssessmentTab from "./BlueprintAssessmentTab";
import DocumentUploadForm from "./DocumentUploadForm";

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

  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "overview";
  const [latestScan, previousScan] = client.measurements;

  return (
    <div className="cat-body portal-page">
      <div className="portal-page-head">
        <p className="portal-eyebrow">Clients</p>
        <h1>
          {client.firstName} {client.lastName}
        </h1>
        <p style={{ fontSize: 13, opacity: 0.65 }}>Portal: {(client.user.portalStatus ?? "—").replace(/_/g, " ")}</p>
      </div>

      <div style={{ marginBottom: 28 }}>
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

      <nav style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 28, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
        {TABS.map((t) => (
          <a
            key={t}
            href={`/hub/clients/${id}?tab=${t}`}
            style={{
              padding: "8px 14px",
              fontSize: 12.5,
              textTransform: "capitalize",
              borderBottom: tab === t ? "2px solid currentColor" : "2px solid transparent",
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t}
          </a>
        ))}
      </nav>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 720 }}>
          <div>
            <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Email</strong>
            {client.email}
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Phone</strong>
            {client.phone ?? "—"}
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>City</strong>
            {client.city ?? "—"}
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Membership Tier</strong>
            {client.membershipTier}
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>Client Since</strong>
            {client.createdAt.toLocaleDateString()}
          </div>
        </div>
      )}

      {tab === "blueprint" && (
        <BlueprintAssessmentTab client={client} canManage={hasPermission(user, "blueprints.manage")} />
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
          {hasPermission(user, "documents.manage") && <DocumentUploadForm clientId={client.id} />}
          {client.documents.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No documents uploaded yet.</p>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 }}>
              {client.documents.map((doc) => (
                <li key={doc.id}>
                  {doc.title} — {doc.uploadedAt.toLocaleDateString()} ({doc.fileType ?? "file"})
                </li>
              ))}
            </ul>
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

      {tab === "appointments" && <p style={{ opacity: 0.6 }}>No appointments scheduled yet.</p>}

      {tab === "rewards" && (
        <div style={{ fontSize: 13.5 }}>
          <p>Points balance: {client.rewardsAccount?.pointsBalance ?? 0}</p>
          <p>Tier: {client.rewardsAccount?.tier ?? "Standard"}</p>
        </div>
      )}

      {tab === "payments" && (
        <div style={{ fontSize: 13.5 }}>
          <p>Payment status (from originating lead): {client.lead.paymentStatus.replace(/_/g, " ")}</p>
        </div>
      )}

      {tab === "notes" && (
        <div style={{ fontSize: 13.5, maxWidth: 560 }}>
          <p>{client.lead.internalNotes || "No internal notes yet."}</p>
        </div>
      )}

      {tab === "journey" && (
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
      )}
    </div>
  );
}
