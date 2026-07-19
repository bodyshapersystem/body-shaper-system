import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import BodyTypeIllustration from "@/components/BodyTypeIllustration";
import { TargetMarkIcon } from "./BlueprintIcons";
import { BODY_TYPE_CONTENT } from "@/lib/body-types";
import { getPhotoSignedUrl } from "./blueprint-actions";
import { getBusinessTimezone, formatDateInTimezone } from "@/lib/format-datetime";

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

// Real-status -> editorial "Journey Phase" grouping. This is a display-only
// relabeling of the existing AssessmentStatus enum (same source data as
// STATUS_LABELS above) — never a separately computed/fabricated value.
const PHASE_BY_STATUS: Record<string, { num: string; name: string }> = {
  DRAFT: { num: "01", name: "Foundation" },
  INTAKE_SUBMITTED: { num: "01", name: "Foundation" },
  ACTIVE: { num: "01", name: "Foundation" },
  BASELINE_PENDING: { num: "01", name: "Foundation" },
  BASELINE_COMPLETED: { num: "02", name: "Activation" },
  VALIDATED: { num: "02", name: "Activation" },
  IN_PROGRESS: { num: "03", name: "Transformation" },
  COMPLETED: { num: "05", name: "Maintenance" },
  SUPERSEDED: { num: "—", name: "Superseded" },
  ARCHIVED: { num: "—", name: "Archived" },
};

const PHOTO_SLOTS = [
  { type: "FRONT", label: "Front" },
  { type: "LEFT", label: "Left Profile" },
  { type: "RIGHT", label: "Right Profile" },
  { type: "BACK", label: "Back" },
  { type: "DETAIL", label: "Detail" },
] as const;

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="bbp-empty">
      <TargetMarkIcon size={30} />
      <p className="bbp-empty-title">{title}</p>
      <p className="bbp-empty-sub">{sub}</p>
    </div>
  );
}

function SectionLabel({ num, title, right }: { num: string; title: string; right?: string }) {
  return (
    <div className="bbp-section-label">
      <div className="bbp-section-label-left">
        <span className="bbp-section-num">{num}</span>
        <span className="bbp-section-div">|</span>
        <h3 className="bbp-section-title">{title}</h3>
      </div>
      <div className="bbp-section-rule" />
      {right && <span className="bbp-section-right">{right}</span>}
    </div>
  );
}

function JourneyIcon({ type }: { type: "created" | "validated" | "strategy" | "session" | "payment" | "photo" }) {
  const common = { viewBox: "0 0 24 24", fill: "none" as const, width: 16, height: 16 };
  switch (type) {
    case "validated":
      return (
        <svg {...common}>
          <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "session":
      return (
        <svg {...common}>
          <rect x="3.5" y="4.5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <line x1="3.5" y1="9" x2="20.5" y2="9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "payment":
      return (
        <svg {...common}>
          <rect x="2.5" y="6" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <line x1="2.5" y1="10" x2="21.5" y2="10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "photo":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "strategy":
      return (
        <svg {...common}>
          <path d="M7 3.5c0 5 10 5 10 10s-10 5-10 10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 8v4l2.5 2.2" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
  }
}

function QuickActionIcon({ name }: { name: "calendar" | "card" | "doc" | "mail" | "camera" | "star" | "person" }) {
  const common = { viewBox: "0 0 24 24", fill: "none" as const, width: 20, height: 20 };
  switch (name) {
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3.5" y="4.5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <line x1="3.5" y1="9" x2="20.5" y2="9" stroke="currentColor" strokeWidth="1.2" />
          <line x1="8" y1="2.5" x2="8" y2="6.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="16" y1="2.5" x2="16" y2="6.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="2.5" y="6" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <line x1="2.5" y1="10" x2="21.5" y2="10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M6 3.5h9l3 3V20.5H6z" stroke="currentColor" strokeWidth="1.1" />
          <line x1="9" y1="9.5" x2="16" y2="9.5" stroke="currentColor" strokeWidth="1.1" />
          <line x1="9" y1="13.5" x2="16" y2="13.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 6.5l9 6.5 9-6.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="12" cy="13.5" r="3.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3.5l2.5 5.5 6 0.7-4.4 4 1.2 5.9-5.3-3-5.3 3 1.2-5.9-4.4-4 6-0.7z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
  }
}


/**
 * The premium "Blueprint report" reading experience — an ADDITIVE
 * presentation layer above the existing functional Blueprint tab
 * (forms/validation/photo upload all untouched, rendered below this).
 * Every figure here is real: no fabricated "Transformation Score",
 * no invented star-rated "Clinical Analysis" categories (no schema
 * exists for those), and no fabricated "Blueprint Score™" composite —
 * the completion ring below is the real sessions-completed percentage
 * that already existed here, restyled. See inline notes for the
 * honest substitutions made in place of mockup elements without
 * backing data.
 */
export default async function BlueprintReport({
  client,
  clientId,
  mode = "owner",
}: {
  client: ClientWithBlueprint;
  clientId: string;
  mode?: "owner" | "client";
}) {
  const assessment = client.blueprintAssessments[0];
  if (!assessment) return null;

  const [completedCount, nextAppointment, paidAgg, specialist, completedAppointments, paidPayments, timezone] = await Promise.all([
    prisma.appointment.count({ where: { clientId, status: "COMPLETED" } }),
    prisma.appointment.findFirst({ where: { clientId, status: "SCHEDULED", startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } }),
    prisma.payment.aggregate({ where: { clientId, status: "PAID" }, _sum: { amountCents: true } }),
    assessment.validatedById ? prisma.user.findUnique({ where: { id: assessment.validatedById } }) : Promise.resolve(null),
    prisma.appointment.findMany({ where: { clientId, status: "COMPLETED" }, orderBy: { startsAt: "asc" } }),
    prisma.payment.findMany({ where: { clientId, status: "PAID" }, orderBy: { paidAt: "asc" } }),
    getBusinessTimezone(),
  ]);
  const nextPendingPayment = await prisma.payment.findFirst({
    where: { clientId, status: { in: ["PENDING", "PARTIAL"] } },
    orderBy: { dueDate: "asc" },
  });
  const lastPaymentMethod = paidPayments[paidPayments.length - 1]?.method ?? null;
  const specialistName = specialist?.fullName ?? null;

  // Client mode must never surface internal-only specialist notes —
  // same real visibility field already used for Photos/Documents.
  const visibleObservations =
    mode === "client" ? assessment.specialistObservations.filter((o) => o.visibility === "CLIENT_VISIBLE") : assessment.specialistObservations;

  const totalSessions = assessment.validatedSessionCount ?? null;
  const completionPercent = totalSessions !== null && totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : null;
  const paidCents = paidAgg._sum.amountCents ?? 0;
  const planTotalCents = assessment.planTotalCents;
  const balanceCents = planTotalCents !== null ? Math.max(planTotalCents - paidCents, 0) : null;

  const latestRenpho = assessment.renphoScans[0];
  const latestBodyMeasurement = assessment.bodyMeasurements[0];
  const firstBodyMeasurement = assessment.bodyMeasurements[assessment.bodyMeasurements.length - 1];
  const photos = assessment.photos;

  function delta(latest: number | null | undefined, first: number | null | undefined) {
    if (latest == null || first == null) return null;
    const d = latest - first;
    return d;
  }

  const journey = [
    { at: assessment.createdAt, label: "Blueprint Submitted", type: "created" as const },
    ...(assessment.validatedAt ? [{ at: assessment.validatedAt, label: "Blueprint Validated", type: "validated" as const }] : []),
    ...assessment.strategyChanges.map((s) => ({ at: s.changedAt, label: "Strategy Updated", type: "strategy" as const })),
    ...completedAppointments.map((a, i) => ({ at: a.startsAt, label: `Session ${i + 1} Completed`, type: "session" as const })),
    ...paidPayments.map((p) => ({ at: p.paidAt ?? p.createdAt, label: `Payment Received — ${money(p.amountCents)}`, type: "payment" as const })),
    ...(assessment.photos.length > 0
      ? [{ at: assessment.photos[assessment.photos.length - 1].uploadedAt, label: "Progress Photos Uploaded", type: "photo" as const }]
      : []),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  const phase = PHASE_BY_STATUS[assessment.status] ?? { num: "—", name: STATUS_LABELS[assessment.status] ?? assessment.status };

  // Real photo signed URLs, grouped by the actual PhotoType enum values —
  // no fabricated "45°" or "Before/After" slot types (those don't exist
  // in the schema). Before/After is a genuine same-type comparison,
  // computed from real FRONT photos rather than a separate slot.
  const photoTiles = await Promise.all(
    PHOTO_SLOTS.map(async ({ type, label }) => {
      const typePhotos = photos.filter((p) => p.type === type);
      const latest = typePhotos[0];
      const url = latest ? await getPhotoSignedUrl(latest.storagePath) : null;
      return { type, label, latest, url };
    })
  );
  const frontPhotos = photos.filter((p) => p.type === "FRONT");
  const beforeAfter =
    frontPhotos.length >= 2
      ? {
          before: frontPhotos[frontPhotos.length - 1],
          after: frontPhotos[0],
        }
      : null;
  const [beforeUrl, afterUrl] = beforeAfter
    ? await Promise.all([getPhotoSignedUrl(beforeAfter.before.storagePath), getPhotoSignedUrl(beforeAfter.after.storagePath)])
    : [null, null];

  // Real historical series (ascending) for the progress preview chart —
  // no synthetic data points.
  const weightSeries = [...assessment.renphoScans].reverse().filter((s) => s.weightKg != null);
  const bodyFatSeries = [...assessment.renphoScans].reverse().filter((s) => s.bodyFatPercent != null);

  return (
    <div className="bbp-root">
      {/* ---------- Hero Photo — now shown in both Owner Hub and Client Portal per direction ---------- */}
      <img src="/images/blueprint/hero-blueprint-experience.png" alt="" className="bbp-hero-photo-block" />

      {/* ---------- Executive Summary ---------- */}
      <div className="bbp-hero">
        <div className="bbp-hero-welcome bp-tex-linen">
          <div className="bbp-hero-welcome-body">
            <div>
              <p className="bbp-hero-eyebrow">the body blueprint™</p>
              <p className="bbp-hero-welcome-line">Welcome back,</p>
              <p className="bbp-hero-name">
                {client.firstName} {client.lastName}
              </p>
              <div className="bbp-badge-row">
                {assessment.recommendedSystem && <span className="bbp-badge">{assessment.recommendedSystem}</span>}
                <span className="bbp-badge">{STATUS_LABELS[assessment.status] ?? assessment.status}</span>
              </div>
              <p className="bbp-hero-sub">Client since {formatDateInTimezone(client.createdAt, timezone)}</p>
              <p className="bbp-hero-message">
                {assessment.status === "COMPLETED"
                  ? "Your transformation program is complete — review your full journey below."
                  : "Your personalized strategy, progress, and results — all in one place."}
              </p>
            </div>
            <div className="bbp-hero-meta">
              <div>
                <p className="bbp-hero-meta-label">Blueprint Created</p>
                <p className="bbp-hero-meta-value">{formatDateInTimezone(assessment.createdAt, timezone)}</p>
              </div>
              <div>
                <p className="bbp-hero-meta-label">Last Updated</p>
                <p className="bbp-hero-meta-value">{formatDateInTimezone(assessment.updatedAt, timezone)}</p>
              </div>
              <div>
                <p className="bbp-hero-meta-label">Specialist</p>
                <p className="bbp-hero-meta-value">{specialistName ?? "Not yet assigned"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bbp-hero-side">
          <div className="bbp-phase-card">
            <div>
              <p className="bbp-hero-meta-label">Journey Phase</p>
              <p style={{ fontFamily: "var(--serif)", fontSize: 30, lineHeight: 1, marginTop: 4 }}>{phase.num}</p>
              <p className="bbp-hero-meta-label" style={{ color: "var(--bbp-gold-dark)", marginTop: 2 }}>{phase.name}</p>
            </div>
            <TargetMarkIcon size={36} />
          </div>
          <div className="bbp-completion-card">
            <div>
              <p className="bbp-hero-meta-label" style={{ color: "rgba(241,235,225,0.6)" }}>Program Completion</p>
              <p className="bbp-completion-value">{completionPercent !== null ? `${completionPercent}%` : "—"}</p>
              <p style={{ fontFamily: "var(--sans)", fontSize: 10, color: "rgba(241,235,225,0.6)", marginTop: 2 }}>
                {totalSessions !== null ? `${completedCount} of ${totalSessions} sessions` : `${completedCount} sessions completed · plan not set yet`}
              </p>
            </div>
            <TargetMarkIcon size={32} />
          </div>
        </div>
      </div>

      {/* ---------- Section 01: Body Composition ---------- */}
      <div style={{ marginTop: 32, marginBottom: 40 }}>
        <SectionLabel num="01" title="Your Body Composition" right="baseline overview" />
        <div className="bbp-composition">
          <div className="bbp-card bbp-composition-visual">
            <div>
              <p className="bbp-composition-heading">your body<br />at a glance.</p>
              <p className="bbp-composition-copy">These numbers tell a story. We're here to rewrite it.</p>
            </div>
            <div className="bbp-composition-illustration">
              <BodyTypeIllustration bodyType={assessment.bodyType} maxHeight={230} />
            </div>
            {mode === "owner" && (
              <Link href={`/hub/clients/${clientId}?tab=blueprint`} className="bbp-composition-cta">
                view full analysis →
              </Link>
            )}
          </div>

          <div className="bbp-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {latestRenpho ? (
              <div className="bbp-stat-tiles">
                {(
                  [
                    { label: "Weight", value: latestRenpho.weightKg, unit: "kg" },
                    { label: "BMI", value: latestRenpho.bmi, unit: "" },
                    { label: "Body Fat %", value: latestRenpho.bodyFatPercent, unit: "%" },
                    { label: "Visceral Fat", value: latestRenpho.visceralFat, unit: "" },
                    { label: "Muscle Mass", value: latestRenpho.muscleMassKg, unit: "kg" },
                    { label: "Skeletal Muscle", value: latestRenpho.skeletalMuscleKg, unit: "kg" },
                    { label: "Body Water", value: latestRenpho.bodyWaterPercent, unit: "%" },
                    { label: "Protein", value: latestRenpho.proteinPercent, unit: "%" },
                    { label: "Bone Mass", value: latestRenpho.boneMassKg, unit: "kg" },
                    { label: "BMR", value: latestRenpho.bmr, unit: "kcal" },
                    { label: "Metabolic Age", value: latestRenpho.bodyAge, unit: "" },
                  ] as const
                ).map((t) => (
                  <div className="bbp-stat-tile" key={t.label}>
                    <p className="bbp-stat-tile-label">{t.label}</p>
                    <p className="bbp-stat-tile-value">
                      {t.value ?? "—"}
                      {t.value != null && t.unit ? <span className="bbp-stat-tile-unit">{t.unit}</span> : null}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <BodyTypeIllustration bodyType={assessment.bodyType} maxHeight={180} />
                <EmptyState title="no composition data yet." sub="Record a RENPHO scan to populate this section of the Blueprint." />
              </div>
            )}
            {latestRenpho && <p className="bbp-source-note">* body composition synchronized from RENPHO Health</p>}
          </div>
        </div>
      </div>

      {/* ---------- Section 02 / 03 / 04 ---------- */}
      <div className="bbp-row-3" style={{ marginBottom: 40 }}>
        {/* 02 — Measurements */}
        <div className="bbp-card bbp-panel bp-tex-cream bbp-measurements-final">
          <div className="bbp-mf-layout">
            <div className="bbp-mf-text bbp-mf-text-backing">
              <p className="bbp-mf-mark">✦</p>
              <span className="bbp-mf-rule" />
              <h3 className="bbp-mf-headline">measurements</h3>
              <span className="bbp-mf-rule-sm" />
              <p className="bbp-mf-eyebrow">YOUR BASELINE STARTS HERE.</p>
              <p className="bbp-mf-copy">
                Professional measurements will be recorded during your first Blueprint Session™ to create accurate progress tracking and visible results.
              </p>
              <div className="bbp-mf-note">
                <span className="bbp-mf-note-icon">✦</span>
                <p>All measurements are taken by your specialist using a consistent, professional method to ensure accuracy.</p>
              </div>
              {mode === "owner" && (
                <Link href={`/hub/clients/${clientId}?tab=blueprint`} className="bbp-composition-cta" style={{ marginTop: 14, display: "inline-flex" }}>
                  edit measurements →
                </Link>
              )}
            </div>
            <div className="bbp-mf-diagram">
              <BodyTypeIllustration bodyType={assessment.bodyType} maxHeight={260} />
              <div className="bbp-mf-points">
                {(
                  [
                    { label: "bust", key: "chestCm" },
                    { label: "waist", key: "waistCm" },
                    { label: "abdomen", key: "lowerAbdomenCm" },
                    { label: "hips", key: "hipsCm" },
                    { label: "right thigh", key: "rightThighCm" },
                    { label: "left thigh", key: "leftThighCm" },
                    { label: "left arm", key: "leftArmCm" },
                  ] as const
                ).map((m) => (
                  <div className="bbp-mf-point" key={m.key}>
                    <span>{m.label}</span>
                    <span className="bbp-mf-point-line" />
                    <strong>{latestBodyMeasurement?.[m.key] != null ? `${latestBodyMeasurement[m.key]!.toFixed(1)} cm` : "—"}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 03 — Body Profile (bodyType is the single source of truth) */}
        <div className="bbp-card bbp-profile-card">
          <p style={{ fontFamily: "var(--sans)", fontSize: 13 }}>
            <span className="bbp-section-num">03</span> <span className="bbp-section-div">|</span> body type
          </p>
          <div style={{ marginTop: 14 }}>
            <BodyTypeIllustration bodyType={assessment.bodyType} maxHeight={200} />
          </div>
          {assessment.bodyType ? (
            <>
              <p className="bbp-profile-label">{BODY_TYPE_CONTENT[assessment.bodyType].label}</p>
              <p className="bbp-profile-desc">{BODY_TYPE_CONTENT[assessment.bodyType].description}</p>
              <p className="bbp-focus-label">primary focus</p>
              <ul className="bbp-focus-list">
                {BODY_TYPE_CONTENT[assessment.bodyType].focus.map((f) => (
                  <li key={f}>
                    <span className="bbp-focus-dot" /> {f}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="bbp-profile-desc" style={{ marginTop: 18 }}>
              Not assessed yet. The specialist sets this once from the Blueprint Assessment tab below.
            </p>
          )}
        </div>

        {/* 04 — Personalized System (real fields: recommendedSystem, treatmentInterests, goals, frequency) */}
        <div className="bbp-card bbp-panel bp-tex-taupe">
          <p className="bbp-panel-title" style={{ marginBottom: 14 }}>
            <span className="bbp-section-num">04</span> <span className="bbp-section-div">|</span> personalized system™
          </p>
          {assessment.recommendedSystem ? (
            <div className="bbp-system-card">
              <div>
                <p className="bbp-system-name">{assessment.recommendedSystem}</p>
                {assessment.treatmentInterests && <p className="bbp-system-sub">{assessment.treatmentInterests}</p>}
              </div>
            </div>
          ) : (
            <EmptyState title="no system assigned yet." sub="Assign a Personalized System™ once the strategy is set." />
          )}
          <ul className="bbp-protocol-list">
            <li>
              <span className="bbp-focus-dot" style={{ background: "var(--bbp-gold-dark)" }} /> Frequency:{" "}
              {assessment.validatedFrequency ?? assessment.initialFrequency ?? "Not set"}
            </li>
            <li>
              <span className="bbp-focus-dot" style={{ background: "var(--bbp-gold-dark)" }} /> Sessions:{" "}
              {assessment.validatedSessionCount ?? assessment.initialSessionCount ?? "Not set"}
            </li>
            {assessment.goals && (
              <li>
                <span className="bbp-focus-dot" style={{ background: "var(--bbp-gold-dark)" }} /> Goals: {assessment.goals}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ---------- Section 05 / 06 ---------- */}
      <div className="bbp-row-2" style={{ marginBottom: 40 }}>
        {/* 05 — System Architecture (real fields: treatmentInterests, complementarySessions, homeCareGuidance) */}
        <div className="bbp-card bbp-panel bp-tex-cream">
          <p className="bbp-panel-title">
            <span className="bbp-section-num">05</span> <span className="bbp-section-div">|</span> your system architecture™
          </p>
          <div className="bbp-arch-grid">
            <div>
              <p className="bbp-arch-col-label">technologies / interests</p>
              {assessment.treatmentInterests
                ? assessment.treatmentInterests.split(",").map((t) => (
                    <p className="bbp-arch-item" key={t}>{t.trim()}</p>
                  ))
                : <p className="bbp-arch-item">Not set</p>}
            </div>
            <div>
              <p className="bbp-arch-col-label">complementary / home care</p>
              <p className="bbp-arch-item">{assessment.complementarySessions ?? "Not set"}</p>
              {assessment.homeCareGuidance && <p className="bbp-arch-item">{assessment.homeCareGuidance}</p>}
            </div>
            <div>
              <p className="bbp-arch-col-label">optimization notes</p>
              <p className="bbp-arch-item">{assessment.optimizationNotes ?? "Not set yet"}</p>
            </div>
          </div>
        </div>

        {/* 06 — Why This System Was Selected (real specialist validation notes) */}
        <div className="bbp-card bbp-panel bp-tex-glass">
          <p className="bbp-panel-title">
            <span className="bbp-section-num">06</span> <span className="bbp-section-div">|</span> why this system was selected
          </p>
          {assessment.validationNotes ? (
            <>
              <p className="bbp-quote">&ldquo;{assessment.validationNotes}&rdquo;</p>
              <p className="bbp-quote-sign">— {assessment.validatedById ? "Specialist on file" : "BSS"}</p>
            </>
          ) : (
            <EmptyState title="not documented yet." sub="Validation notes appear here once the specialist confirms the strategy." />
          )}
        </div>
      </div>

      {/* ---------- Photo Gallery (real PhotoType slots + genuine before/after) ---------- */}
      <div style={{ marginBottom: 40 }}>
        <SectionLabel num="08" title="Photo Gallery" right="consistent · clear · comparable" />
        <div className="bbp-photo-grid">
          {photoTiles.map(({ type, label, url }) => (
            <div className="bbp-photo-card" key={type}>
              <div className="bbp-photo-frame">
                {url ? (
                  <img src={url} alt={label} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 10.5, fontFamily: "var(--sans)", color: "var(--bbp-muted-light)" }}>no photo yet</span>
                  </div>
                )}
              </div>
              <div className="bbp-photo-label-row">
                <span className="bbp-photo-label">{label}</span>
              </div>
            </div>
          ))}
          <div className="bbp-photo-card">
            <div className="bbp-photo-frame" style={{ display: "flex" }}>
              {beforeAfter && beforeUrl && afterUrl ? (
                <>
                  <img src={beforeUrl} alt="Before" style={{ width: "50%" }} />
                  <img src={afterUrl} alt="After" style={{ width: "50%" }} />
                </>
              ) : (
                <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10.5, fontFamily: "var(--sans)", color: "var(--bbp-muted-light)", textAlign: "center", padding: "0 10px" }}>
                    needs 2+ front photos
                  </span>
                </div>
              )}
            </div>
            <div className="bbp-photo-label-row">
              <span className="bbp-photo-label">Before / After</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Progress Preview / Quote / Next Milestone ---------- */}
      <div className="bbp-bottom-row" style={{ marginBottom: 40 }}>
        <div className="bbp-card-dark" style={{ padding: 22 }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 10 }}>
            <span className="bbp-section-num">09</span> <span className="bbp-section-div">|</span> progress preview
          </p>
          {weightSeries.length >= 2 || bodyFatSeries.length >= 2 ? (
            <>
              <MiniLineChart seriesA={weightSeries.map((s) => s.weightKg as number)} seriesB={bodyFatSeries.map((s) => s.bodyFatPercent as number)} />
              <div className="bbp-progress-legend">
                <span className="bbp-legend-item"><span className="bbp-legend-dot" style={{ background: "var(--bbp-gold)" }} /> weight (kg)</span>
                <span className="bbp-legend-item"><span className="bbp-legend-dot" style={{ background: "rgba(241,235,225,0.6)" }} /> body fat (%)</span>
              </div>
            </>
          ) : (
            <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "rgba(241,235,225,0.6)" }}>
              At least two RENPHO scans are needed to chart progress.
            </p>
          )}
        </div>

        <div className="bbp-card-dark bbp-quote-card">
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 19, lineHeight: 1.35 }}>
            &ldquo;the blueprint is not about perfection. it&rsquo;s about progress with purpose.&rdquo;
          </p>
        </div>

        <div className="bbp-card bbp-panel bp-tex-taupe">
          <p className="bbp-panel-title" style={{ marginBottom: 14 }}>
            <span className="bbp-section-num">10</span> <span className="bbp-section-div">|</span> next milestone
          </p>
          {/* Honest substitution: no numeric fat-loss "goal %" or target date
              exists in the schema. The real next milestone is the next
              scheduled session — same data already computed above for the
              hero completion ring. */}
          <div className="bbp-milestone-ring-wrap">
            <div style={{ width: 64, height: 64, borderRadius: "100%", border: "4px solid var(--bbp-line)", position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  position: "absolute", inset: 0, borderRadius: "100%",
                  background: `conic-gradient(var(--bbp-gold-dark) ${completionPercent ?? 0}%, transparent 0)`,
                  mask: "radial-gradient(circle, transparent 58%, black 60%)",
                  WebkitMask: "radial-gradient(circle, transparent 58%, black 60%)",
                }}
              />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontSize: 15 }}>
                {completionPercent !== null ? `${completionPercent}%` : "—"}
              </div>
            </div>
            <div>
              <p className="bbp-milestone-copy">
                {nextAppointment ? "Next session" : "No session scheduled"}
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--bbp-muted)", marginTop: 2 }}>
                {nextAppointment ? formatDateInTimezone(nextAppointment.startsAt, timezone) : "Schedule the next session to set a milestone"}
              </p>
              <Link href="/hub/appointments" className="bbp-composition-cta" style={{ display: "inline-flex", marginTop: 8, color: "var(--charcoal)", borderColor: "var(--bbp-line)", fontSize: 10 }}>
                view plan →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Transformation Journey ---------- */}
      <div style={{ marginBottom: 40 }}>
        <SectionLabel num="11" title="Transformation Journey" />
        {journey.length === 0 ? (
          <EmptyState title="no journey events yet." sub="Milestones will appear here as the Blueprint progresses." />
        ) : (
          <ul className="bbp-journey">
            {journey.map((j, i) => (
              <li key={i} className="bbp-journey-item">
                <span className="bbp-journey-marker">
                  <JourneyIcon type={j.type} />
                </span>
                <div className="bbp-journey-body">
                  <p className="bbp-journey-title">{j.label}</p>
                  <p className="bbp-journey-date">{formatDateInTimezone(j.at, timezone)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- Quick Actions ---------- */}
      <div style={{ marginBottom: 40 }}>
        <SectionLabel num="12" title="Quick Actions" />
        <div className="bbp-actions-grid">
          {(mode === "owner"
            ? [
                { href: "/hub/appointments", icon: "calendar" as const, title: "Schedule Session", desc: "Book the next treatment" },
                { href: "/hub/payments", icon: "card" as const, title: "Record Payment", desc: "Log a new payment" },
                { href: `/hub/clients/${clientId}?tab=documents`, icon: "doc" as const, title: "Upload Documents", desc: "Add a signed form or receipt" },
                { href: `/hub/clients/${clientId}?tab=messages`, icon: "mail" as const, title: "Message Client", desc: "Real in-system conversation" },
              ]
            : [
                { href: "/portal/appointments", icon: "calendar" as const, title: "Appointments", desc: "View your schedule" },
                { href: "/portal/documents", icon: "doc" as const, title: "Documents", desc: "Your forms & records" },
                { href: "/portal/photos", icon: "camera" as const, title: "Progress Photos", desc: "See your transformation" },
                { href: "/portal/rewards", icon: "star" as const, title: "Rewards", desc: "Your points & perks" },
                { href: "/portal/messages", icon: "mail" as const, title: "Message Specialist", desc: "Ask a question" },
                { href: "/portal/profile", icon: "person" as const, title: "Profile", desc: "Your account details" },
              ]
          ).map((action, i) => (
            <Link
              key={action.title}
              href={action.href}
              className={`bbp-action-card ${["bp-tex-taupe", "bp-tex-cream", "bp-tex-olive"][i % 3]}`}
            >
              <span className="bbp-action-icon">
                <QuickActionIcon name={action.icon} />
              </span>
              <span className="bbp-action-title">{action.title}</span>
              <span className="bbp-action-desc">{action.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bbp-footer">
        <TargetMarkIcon size={28} />
        <p className="bbp-footer-tagline">the blueprint is only the beginning.</p>
        <p className="bbp-footer-brand">science. strategy. transformation.</p>
      </div>
    </div>
  );
}

/** Dependency-free inline SVG line chart — no charting library installed
 * in this project, so this avoids adding one for a single chart. Purely
 * presentational; both series are real RENPHO history passed in above. */
function MiniLineChart({ seriesA, seriesB }: { seriesA: number[]; seriesB: number[] }) {
  const width = 100;
  const height = 100;
  const toPoints = (series: number[]) => {
    if (series.length < 2) return "";
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    return series
      .map((v, i) => {
        const x = (i / (series.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");
  };
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: 150 }} preserveAspectRatio="none">
      {seriesA.length >= 2 && (
        <polyline points={toPoints(seriesA)} fill="none" stroke="var(--bbp-gold)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      )}
      {seriesB.length >= 2 && (
        <polyline points={toPoints(seriesB)} fill="none" stroke="rgba(241,235,225,0.6)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  );
}
