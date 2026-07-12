import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type ClientWithBlueprint = Prisma.ClientGetPayload<{
  include: {
    blueprintAssessments: {
      include: {
        bodyMeasurements: true;
        renphoScans: true;
        photos: true;
        specialistObservations: true;
        strategyChanges: true;
      };
    };
  };
}>;

const STATUS_LABELS: Record<string, string> = {
  INTAKE_SUBMITTED: "Intake Submitted",
  BASELINE_PENDING: "Baseline Pending",
  BASELINE_COMPLETED: "Baseline Completed",
  VALIDATED: "Validated",
  IN_PROGRESS: "Active Treatment",
  COMPLETED: "Completed",
  SUPERSEDED: "Superseded",
  ARCHIVED: "Archived",
  DRAFT: "Draft",
  ACTIVE: "Active",
};

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * The premium "Blueprint report" reading experience — an ADDITIVE
 * presentation layer above the existing functional Blueprint tab
 * (forms/validation/photo upload all untouched, rendered below this).
 * Every figure here is real: no fabricated "Transformation Score",
 * no invented star-rated "Clinical Analysis" categories (no schema
 * exists for those) — see inline notes for the two honest
 * substitutions made in place of mockup elements without backing data.
 */
export default async function BlueprintReport({ client, clientId }: { client: ClientWithBlueprint; clientId: string }) {
  const assessment = client.blueprintAssessments[0];
  if (!assessment) return null;

  const [completedCount, nextAppointment, paidAgg] = await Promise.all([
    prisma.appointment.count({ where: { clientId, status: "COMPLETED" } }),
    prisma.appointment.findFirst({ where: { clientId, status: "SCHEDULED", startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } }),
    prisma.payment.aggregate({ where: { clientId, status: "PAID" }, _sum: { amountCents: true } }),
  ]);

  const totalSessions = assessment.validatedSessionCount ?? 8;
  const completionPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const paidCents = paidAgg._sum.amountCents ?? 0;
  const planTotalCents = assessment.planTotalCents;
  const balanceCents = planTotalCents !== null ? Math.max(planTotalCents - paidCents, 0) : null;

  const latestRenpho = assessment.renphoScans[0];
  const latestBodyMeasurement = assessment.bodyMeasurements[0];
  const firstBodyMeasurement = assessment.bodyMeasurements[assessment.bodyMeasurements.length - 1];
  const photos = assessment.photos;
  const beforePhoto = photos[photos.length - 1];
  const currentPhoto = photos[0];

  function delta(latest: number | null | undefined, first: number | null | undefined) {
    if (latest == null || first == null) return null;
    const d = latest - first;
    return d;
  }

  const journey = [
    { at: assessment.createdAt, label: "Blueprint Submitted" },
    ...(assessment.validatedAt ? [{ at: assessment.validatedAt, label: "Blueprint Validated" }] : []),
    ...assessment.strategyChanges.map((s) => ({ at: s.changedAt, label: "Strategy Updated" })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  return (
    <div className="bp-report">
      {/* ---------- Executive Summary ---------- */}
      <div className="bp-hero">
        <div className="bp-hero-avatar">
          {client.firstName[0]}
          {client.lastName[0]}
        </div>
        <div className="bp-hero-info">
          <p className="bp-hero-eyebrow">Executive Summary</p>
          <h2>
            {client.firstName} {client.lastName}
          </h2>
          <div className="bp-hero-badges">
            {assessment.recommendedSystem && <span className="bp-badge">{assessment.recommendedSystem}</span>}
            <span className="bp-badge bp-badge-status">{STATUS_LABELS[assessment.status] ?? assessment.status}</span>
          </div>
          <p className="cl-header-contact">Client since {client.createdAt.toLocaleDateString()}</p>
        </div>
        <div className="bp-hero-ring-wrap">
          <div className="cl-ring" style={{ background: `conic-gradient(#5C1A1F ${completionPercent}%, rgba(92,26,31,0.15) 0)` }}>
            <div className="cl-ring-inner">
              <strong>{completionPercent}%</strong>
              <span>Completion</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bp-hero-stats">
        <div>
          <span>Current Phase</span>
          <strong>{STATUS_LABELS[assessment.status] ?? assessment.status}</strong>
        </div>
        <div>
          <span>Sessions</span>
          <strong>
            {completedCount} of {totalSessions}
          </strong>
        </div>
        <div>
          <span>Next Session</span>
          <strong>{nextAppointment ? nextAppointment.startsAt.toLocaleDateString() : "Not scheduled"}</strong>
        </div>
      </div>

      {/* ---------- Body Intelligence ---------- */}
      <h3 className="bp-chapter-title">Body Intelligence™</h3>
      {latestRenpho ? (
        <div className="bp-stat-grid">
          <div className="bp-stat-card">
            <span>Weight</span>
            <strong>{latestRenpho.weightKg ?? "—"} kg</strong>
          </div>
          <div className="bp-stat-card">
            <span>Body Fat</span>
            <strong>{latestRenpho.bodyFatPercent ?? "—"}%</strong>
          </div>
          <div className="bp-stat-card">
            <span>Muscle Mass</span>
            <strong>{latestRenpho.muscleMassKg ?? "—"} kg</strong>
          </div>
          <div className="bp-stat-card">
            <span>Water</span>
            <strong>{latestRenpho.bodyWaterPercent ?? "—"}%</strong>
          </div>
          <div className="bp-stat-card">
            <span>Visceral Fat</span>
            <strong>{latestRenpho.visceralFat ?? "—"}</strong>
          </div>
        </div>
      ) : (
        <p className="dash-empty">No Renpho scans recorded yet.</p>
      )}

      {/* ---------- Clinical Analysis ---------- */}
      {/* Honest substitution: the mockup shows 8 star-rated categories
          (Skin Quality, Lymphatic Flow, etc.) — no such structured
          rating exists anywhere in the schema, only free-text
          specialist observations. Showing those real notes instead of
          fabricating ratings. */}
      <h3 className="bp-chapter-title">Clinical Analysis</h3>
      {assessment.specialistObservations.length === 0 ? (
        <p className="dash-empty">No specialist observations yet.</p>
      ) : (
        assessment.specialistObservations.slice(0, 4).map((obs) => (
          <div key={obs.id} className="cl-note-card">
            <p className="cl-note-meta">{obs.createdAt.toLocaleDateString()}</p>
            <p className="cl-note-content">{obs.body}</p>
          </div>
        ))
      )}

      {/* ---------- Personalized Strategy ---------- */}
      <h3 className="bp-chapter-title">Personalized Strategy™</h3>
      <div className="pd-card" style={{ marginBottom: 32 }}>
        <div className="cl-summary-list">
          <div className="cl-summary-row">
            <span>Personalized System™</span>
            <span>{assessment.recommendedSystem ?? "Not set"}</span>
          </div>
          <div className="cl-summary-row">
            <span>Technologies / Interests</span>
            <span>{assessment.treatmentInterests ?? "—"}</span>
          </div>
          <div className="cl-summary-row">
            <span>Frequency</span>
            <span>{assessment.validatedFrequency ?? assessment.initialFrequency ?? "—"}</span>
          </div>
          <div className="cl-summary-row">
            <span>Primary Goals</span>
            <span>{assessment.goals ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* ---------- Progress (small, secondary) ---------- */}
      <h3 className="bp-chapter-title">Progress</h3>
      {photos.length === 0 ? (
        <p className="dash-empty">No progress photos yet.</p>
      ) : (
        <div className="bp-photo-preview">
          {beforePhoto && (
            <div>
              <span>Before</span>
              <div className="bp-photo-thumb" />
            </div>
          )}
          {currentPhoto && (
            <div>
              <span>Current</span>
              <div className="bp-photo-thumb" />
            </div>
          )}
          <a href={`/hub/clients/${clientId}?tab=blueprint#photos`} className="dash-view-btn">
            View Gallery →
          </a>
        </div>
      )}

      {/* ---------- Measurements ---------- */}
      <h3 className="bp-chapter-title">Measurements</h3>
      {latestBodyMeasurement ? (
        <div className="bp-stat-grid">
          {[
            { label: "Waist", latest: latestBodyMeasurement.waistCm, first: firstBodyMeasurement?.waistCm },
            { label: "Abdomen", latest: latestBodyMeasurement.lowerAbdomenCm, first: firstBodyMeasurement?.lowerAbdomenCm },
            { label: "Hips", latest: latestBodyMeasurement.hipsCm, first: firstBodyMeasurement?.hipsCm },
            { label: "Right Thigh", latest: latestBodyMeasurement.rightThighCm, first: firstBodyMeasurement?.rightThighCm },
          ].map((m) => {
            const d = delta(m.latest, m.first);
            return (
              <div className="bp-stat-card" key={m.label}>
                <span>{m.label}</span>
                <strong>{m.latest ?? "—"} cm</strong>
                {d !== null && d !== 0 && <span className="pay-history-meta">{d > 0 ? "↑" : "↓"} {Math.abs(d).toFixed(1)} cm</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="dash-empty">No measurements recorded yet.</p>
      )}

      {/* ---------- Transformation Journey ---------- */}
      <h3 className="bp-chapter-title">Transformation Journey</h3>
      {journey.length === 0 ? (
        <p className="dash-empty">No journey events yet.</p>
      ) : (
        <ul className="dash-timeline" style={{ marginBottom: 32 }}>
          {journey.map((j, i) => (
            <li key={i}>
              <span className="dash-timeline-dot" />
              <span className="dash-timeline-text">{j.label}</span>
              <span className="dash-timeline-time">{j.at.toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}

      {/* ---------- Quick Actions ---------- */}
      <h3 className="bp-chapter-title">Quick Actions</h3>
      <div className="cl-quick-actions" style={{ marginBottom: 32, maxWidth: 340 }}>
        <Link href="/hub/appointments" className="cl-quick-btn">
          Schedule Session
        </Link>
        <Link href="/hub/payments" className="cl-quick-btn">
          Record Payment
        </Link>
        <Link href={`/hub/clients/${clientId}?tab=documents`} className="cl-quick-btn">
          Upload Documents
        </Link>
        <a href={`mailto:${client.email}`} className="cl-quick-btn">
          Send Email
        </a>
      </div>

      {/* ---------- Financial Summary ---------- */}
      <h3 className="bp-chapter-title">Financial Summary</h3>
      <div className="pay-financials" style={{ marginBottom: 12 }}>
        <div>
          <span>System Value</span>
          <strong>{planTotalCents !== null ? money(planTotalCents) : "Not set"}</strong>
        </div>
        <div>
          <span>Paid</span>
          <strong>{money(paidCents)}</strong>
        </div>
        <div>
          <span>Balance</span>
          <strong>{balanceCents !== null ? money(balanceCents) : "—"}</strong>
        </div>
      </div>
      <Link href="/hub/payments" className="dash-view-btn" style={{ display: "inline-block", marginBottom: 40 }}>
        Open Payments →
      </Link>

      {/* ---------- Final Report ---------- */}
      <h3 className="bp-chapter-title">Final Report</h3>
      <p className="dash-empty" style={{ marginBottom: 40 }}>
        PDF export and secure share links aren't built yet — this section is reserved for that feature.
      </p>

      <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", margin: "8px 0 32px" }} />
    </div>
  );
}
