import PhotoGallery from "./PhotoGallery";
import { AccordionGroup, AccordionItem } from "./AccordionGroup";
import { RulerIcon, ScaleIcon, CameraIcon, NoteIcon, StrategyIcon } from "./BlueprintIcons";
import PhotoCaptureSheet from "./PhotoCaptureSheet";
import ObservationSheet from "./ObservationSheet";
import StrategySheet from "./StrategySheet";
import MeasurementSheet from "./MeasurementSheet";
import BodyCompositionSheet from "./BodyCompositionSheet";
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
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  SUPERSEDED: "Superseded",
  ARCHIVED: "Archived",
  DRAFT: "Draft",
  ACTIVE: "Active",
};

const PHOTO_TYPES = ["FRONT", "LEFT", "RIGHT", "BACK", "DETAIL"] as const;

export default function BlueprintAssessmentTab({
  client,
  canManage,
}: {
  client: ClientWithBlueprint;
  canManage: boolean;
}) {
  const assessment = client.blueprintAssessments.find((a) =>
    ["ACTIVE", "BASELINE_PENDING", "BASELINE_COMPLETED", "VALIDATED", "IN_PROGRESS", "COMPLETED"].includes(a.status)
  );

  if (!assessment) {
    return <p style={{ opacity: 0.6 }}>No Blueprint Assessment™ on file yet.</p>;
  }

  const photosByType = PHOTO_TYPES.map((t) => ({
    type: t,
    photos: assessment.photos.filter((p) => p.type === t),
  }));
  const canValidate = assessment.status === "BASELINE_COMPLETED" || assessment.status === "BASELINE_PENDING";

  return (
    <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 8 }}>
      <AccordionGroup defaultOpenId="measurements">
      {/* ---------- Blueprint Assessment Summary (premium card) ---------- */}
      <div className="bp-summary-card">
        <div className="bp-summary-head">
          <div>
            <p className="bp-hero-eyebrow">Blueprint Assessment™</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 20, margin: 0 }}>Version {assessment.version}</h2>
          </div>
          <span className={`bp-status-chip bp-status-chip-${assessment.status.toLowerCase()}`}>
            {STATUS_LABELS[assessment.status] ?? assessment.status}
          </span>
        </div>

        <div className="bp-summary-grid">
          <div className="bp-summary-item">
            <span>Intake Submitted</span>
            <strong>{assessment.intakeSubmissionDate?.toLocaleDateString() ?? "Not available yet"}</strong>
          </div>
          <div className="bp-summary-item">
            <span>Baseline Appointment</span>
            <strong>{assessment.baselineAppointmentDate?.toLocaleDateString() ?? "Not scheduled yet"}</strong>
          </div>
          <div className="bp-summary-item">
            <span>Original Recommendation</span>
            <strong>{assessment.originalRecommendedSystem ?? "Not available yet"}</strong>
          </div>
          <div className="bp-summary-item">
            <span>Validated System</span>
            <strong>
              {["VALIDATED", "IN_PROGRESS", "COMPLETED"].includes(assessment.status)
                ? assessment.recommendedSystem ?? "Not available yet"
                : "Not yet validated"}
            </strong>
          </div>
          <div className="bp-summary-item">
            <span>Initial Frequency</span>
            <strong>{assessment.initialFrequency ?? "Not set"}</strong>
          </div>
          <div className="bp-summary-item">
            <span>Validated Frequency</span>
            <strong>{assessment.validatedFrequency ?? "Not yet validated"}</strong>
          </div>
          <div className="bp-summary-item">
            <span>Initial Sessions</span>
            <strong>{assessment.initialSessionCount ?? "Not set"}</strong>
          </div>
          <div className="bp-summary-item">
            <span>Validated Sessions</span>
            <strong>{assessment.validatedSessionCount ?? "Not yet validated"}</strong>
          </div>
          <div className="bp-summary-item">
            <span>Last Updated</span>
            <strong>{assessment.updatedAt.toLocaleDateString()}</strong>
          </div>
          <div className="bp-summary-item">
            <span>Validation Status</span>
            <strong>{assessment.validatedAt ? assessment.validatedAt.toLocaleDateString() : "Awaiting validation"}</strong>
          </div>
        </div>

        {assessment.validationNotes && (
          <p className="bp-summary-notes">
            <strong>Validation Notes — </strong>
            {assessment.validationNotes}
          </p>
        )}
      </div>

      {/* ---------- Section 1: Professional Measurements ---------- */}
      <AccordionItem id="measurements" title="professional measurements." icon={<RulerIcon />}>
        {assessment.bodyMeasurements.length === 0 ? (
          <div className="bp-empty-state">
            <p>Capture the client's baseline body measurements to track visible transformation throughout their journey.</p>
            {canManage && (
              <div style={{ marginTop: 14 }}>
                <MeasurementSheet clientId={client.id} label="+ Record First Measurements" />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="bp-stat-grid" style={{ marginBottom: 20 }}>
              {(
                [
                  { label: "Waist", key: "waistCm" },
                  { label: "High Waist", key: "highWaistCm" },
                  { label: "Lower Abdomen", key: "lowerAbdomenCm" },
                  { label: "Hips", key: "hipsCm" },
                  { label: "Chest", key: "chestCm" },
                  { label: "Right Arm", key: "rightArmCm" },
                  { label: "Left Arm", key: "leftArmCm" },
                  { label: "Right Thigh", key: "rightThighCm" },
                  { label: "Left Thigh", key: "leftThighCm" },
                ] as const
              ).map((m) => {
                const latest = assessment.bodyMeasurements[0];
                const baseline = assessment.bodyMeasurements[assessment.bodyMeasurements.length - 1];
                const latestVal = latest[m.key];
                const baselineVal = baseline[m.key];
                const change = latestVal != null && baselineVal != null ? latestVal - baselineVal : null;
                return (
                  <div className="bp-stat-card" key={m.key}>
                    <span>{m.label}</span>
                    <strong>{latestVal != null ? `${latestVal} cm` : "Not available yet"}</strong>
                    {change !== null && change !== 0 && (
                      <span className="pay-history-meta">
                        {change > 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)} cm vs baseline
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="pay-history-meta" style={{ marginBottom: 16 }}>
              Last updated {assessment.bodyMeasurements[0].measuredAt.toLocaleDateString()} · {assessment.bodyMeasurements.length} scans recorded
            </p>
          </>
        )}
        {canManage && assessment.bodyMeasurements.length > 0 && <MeasurementSheet clientId={client.id} />}
        {assessment.bodyMeasurements.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <HistoryList
              rows={assessment.bodyMeasurements.map((m) => ({
                id: m.id,
                date: m.measuredAt,
                summary: `Waist ${m.waistCm ?? "—"}cm · Hips ${m.hipsCm ?? "—"}cm · Chest ${m.chestCm ?? "—"}cm`,
              }))}
            />
          </div>
        )}
      </AccordionItem>

      {/* ---------- Section 2: Body Composition (RENPHO Health) ---------- */}
      <AccordionItem id="composition" title="body composition." icon={<ScaleIcon />}>
        {assessment.renphoScans.length === 0 ? (
          <div className="bp-empty-state">
            <p>Awaiting First RENPHO Scan</p>
            <p className="pay-history-meta">
              Complete the client's first Body Composition Scan to unlock automatic health metrics and transformation tracking.
            </p>
          </div>
        ) : (
          <>
            <p className="pay-history-meta" style={{ marginBottom: 12 }}>
              Last sync {assessment.renphoScans[0].scanDate.toLocaleDateString()} · {assessment.renphoScans.length} scans on file
            </p>
            <div className="bp-stat-grid" style={{ marginBottom: 16 }}>
              {(
                [
                  { label: "Weight", key: "weightKg", unit: "kg" },
                  { label: "BMI", key: "bmi", unit: "" },
                  { label: "Body Fat", key: "bodyFatPercent", unit: "%" },
                  { label: "Muscle Mass", key: "muscleMassKg", unit: "kg" },
                  { label: "Skeletal Muscle", key: "skeletalMuscleKg", unit: "kg" },
                  { label: "Body Water", key: "bodyWaterPercent", unit: "%" },
                  { label: "Protein", key: "proteinPercent", unit: "%" },
                  { label: "Visceral Fat", key: "visceralFat", unit: "" },
                  { label: "Bone Mass", key: "boneMassKg", unit: "kg" },
                  { label: "BMR", key: "bmr", unit: "kcal" },
                  { label: "Metabolic Age", key: "bodyAge", unit: "" },
                  { label: "Subcutaneous Fat", key: "subcutaneousFatPercent", unit: "%" },
                  { label: "Fat-Free Weight", key: "fatFreeWeightKg", unit: "kg" },
                ] as const
              ).map((m) => {
                const latest = assessment.renphoScans[0];
                const baseline = assessment.renphoScans[assessment.renphoScans.length - 1];
                const latestVal = latest[m.key];
                const baselineVal = baseline[m.key];
                const change = latestVal != null && baselineVal != null ? latestVal - baselineVal : null;
                return (
                  <div className="bp-stat-card" key={m.key}>
                    <span>{m.label}</span>
                    <strong>{latestVal != null ? `${latestVal}${m.unit ? " " + m.unit : ""}` : "Not available yet"}</strong>
                    {change !== null && change !== 0 && (
                      <span className="pay-history-meta">
                        {change > 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}
                        {m.unit ? ` ${m.unit}` : ""} vs baseline
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16 }}>
              <HistoryList
                rows={assessment.renphoScans.map((m) => ({
                  id: m.id,
                  date: m.scanDate,
                  summary: `Weight ${m.weightKg ?? "—"}kg · Body Fat ${m.bodyFatPercent ?? "—"}% · Muscle ${m.muscleMassKg ?? "—"}kg`,
                }))}
              />
            </div>
          </>
        )}
        <p className="pay-history-meta" style={{ marginTop: 16 }}>
          Source: RENPHO Health — Body Composition data is automatically synchronized from RENPHO.
        </p>
        {canManage && (
          <div style={{ marginTop: 8 }}>
            <BodyCompositionSheet clientId={client.id} />
          </div>
        )}
      </AccordionItem>

      {/* ---------- Section 3: Progress Photos ---------- */}
      <AccordionItem id="photos" title="progress photos." icon={<CameraIcon />}>
        <PhotoGallery photosByType={photosByType} canManage={canManage} />
        {canManage && (
          <div style={{ marginTop: 16 }}>
            <PhotoCaptureSheet clientId={client.id} />
          </div>
        )}
      </AccordionItem>

      {/* ---------- Section 4: Specialist Observations ---------- */}
      <AccordionItem id="observations" title="specialist observations." icon={<NoteIcon />}>
        {assessment.specialistObservations.length === 0 ? (
          <div className="bp-empty-state">
            <p>No observations yet.</p>
            {canManage && (
              <div style={{ marginTop: 14 }}>
                <ObservationSheet clientId={client.id} />
              </div>
            )}
          </div>
        ) : (
          <>
            {[...assessment.specialistObservations]
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((o) => (
                <div key={o.id} className="cl-note-card">
                  <p className="cl-note-meta">
                    {o.createdAt.toLocaleDateString()} · {o.createdAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    {" · "}
                    {o.visibility === "CLIENT_VISIBLE" ? "Client Visible" : "Internal Only"}
                  </p>
                  <p className="cl-note-content">{o.body}</p>
                </div>
              ))}
            {canManage && (
              <div style={{ marginTop: 16 }}>
                <ObservationSheet clientId={client.id} />
              </div>
            )}
          </>
        )}
      </AccordionItem>

      {/* ---------- Section 5: Strategy Validation ---------- */}
      <AccordionItem id="strategy" title="strategy validation." icon={<StrategyIcon />}>
        <div className="bp-strategy-grid">
          <div className="pd-card">
            <p className="bp-hero-eyebrow">Original Recommendation</p>
            <div className="cl-summary-list">
              <div className="cl-summary-row">
                <span>System</span>
                <span>{assessment.originalRecommendedSystem ?? "Not available yet"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Frequency</span>
                <span>{assessment.initialFrequency ?? "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Sessions</span>
                <span>{assessment.initialSessionCount ?? "Not set"}</span>
              </div>
            </div>
          </div>

          <div className="pd-card">
            <p className="bp-hero-eyebrow">Validated Strategy</p>
            <div className="cl-summary-list">
              <div className="cl-summary-row">
                <span>System</span>
                <span>
                  {["VALIDATED", "IN_PROGRESS", "COMPLETED"].includes(assessment.status)
                    ? assessment.recommendedSystem ?? "Not available yet"
                    : "Not yet validated"}
                </span>
              </div>
              <div className="cl-summary-row">
                <span>Frequency</span>
                <span>{assessment.validatedFrequency ?? "Not yet validated"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Sessions</span>
                <span>{assessment.validatedSessionCount ?? "Not yet validated"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Complementary</span>
                <span>{assessment.complementarySessions ?? "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Optimization Notes</span>
                <span>{assessment.optimizationNotes ?? "Not set"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Validated By</span>
                <span>{assessment.validatedById ? "Specialist on file" : "—"}</span>
              </div>
              <div className="cl-summary-row">
                <span>Validated Date</span>
                <span>{assessment.validatedAt?.toLocaleDateString() ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {canManage && assessment.status !== "VALIDATED" && (
          <div style={{ marginTop: 20 }}>
            <StrategySheet
              clientId={client.id}
              ctaLabel={canValidate ? "Validate Blueprint Assessment™" : "Save (validation requires completed baseline)"}
            />
          </div>
        )}
        {assessment.status === "VALIDATED" && (
          <p style={{ fontSize: 13, color: "#2f6b3a", marginTop: 16 }}>✓ Validated {assessment.validatedAt?.toLocaleString()}</p>
        )}
      </AccordionItem>
      </AccordionGroup>
    </div>
  );
}

function HistoryList({ rows }: { rows: { id: string; date: Date; summary: string }[] }) {
  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, paddingLeft: 0, listStyle: "none" }}>
      {rows.map((r) => (
        <li key={r.id} style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 6 }}>
          {r.date.toLocaleDateString()} — {r.summary}
        </li>
      ))}
    </ul>
  );
}

