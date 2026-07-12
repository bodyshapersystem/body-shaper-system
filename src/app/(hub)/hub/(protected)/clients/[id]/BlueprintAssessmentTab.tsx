import {
  addBodyComposition,
  addObservation,
  validateAssessment,
} from "./blueprint-actions";
import PhotoUploadForm from "./PhotoUploadForm";
import MeasurementSheet from "./MeasurementSheet";
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
    <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 36 }}>
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
      <Section title="1. Professional Body Measurements">
        {assessment.bodyMeasurements.length === 0 ? (
          <p className="dash-empty">No measurements recorded yet.</p>
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
        {canManage && <MeasurementSheet clientId={client.id} />}
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
      </Section>

      {/* ---------- Section 2: Body Composition ---------- */}
      <Section title="2. Body Composition" subtitle="Source: RENPHO Health">
        {canManage && (
          <form
            action={async (formData: FormData) => {
              "use server";
              await addBodyComposition(client.id, formData);
            }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}
          >
            <input name="measuredAt" type="date" required style={inputStyle} />
            <input name="weightKg" type="number" step="0.1" placeholder="Weight (kg)" style={inputStyle} />
            <input name="bmi" type="number" step="0.1" placeholder="BMI" style={inputStyle} />
            <input name="bodyFatPercent" type="number" step="0.1" placeholder="Body Fat %" style={inputStyle} />
            <input name="muscleMassKg" type="number" step="0.1" placeholder="Muscle Mass (kg)" style={inputStyle} />
            <input name="skeletalMuscleKg" type="number" step="0.1" placeholder="Skeletal Muscle (kg)" style={inputStyle} />
            <input name="bodyWaterPercent" type="number" step="0.1" placeholder="Body Water %" style={inputStyle} />
            <input name="proteinPercent" type="number" step="0.1" placeholder="Protein %" style={inputStyle} />
            <input name="visceralFat" type="number" step="0.1" placeholder="Visceral Fat" style={inputStyle} />
            <input name="boneMassKg" type="number" step="0.1" placeholder="Bone Mass (kg)" style={inputStyle} />
            <input name="bmr" type="number" placeholder="BMR" style={inputStyle} />
            <input name="bodyAge" type="number" placeholder="Metabolic Age" style={inputStyle} />
            <input name="subcutaneousFatPercent" type="number" step="0.1" placeholder="Subcutaneous Fat %" style={inputStyle} />
            <input name="fatFreeWeightKg" type="number" step="0.1" placeholder="Fat-Free Weight (kg)" style={inputStyle} />
            <input name="notes" placeholder="Notes" style={{ ...inputStyle, gridColumn: "span 3" }} />
            <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px", gridColumn: "span 3" }}>
              Save Scan
            </button>
          </form>
        )}
        {assessment.renphoScans.length === 0 ? (
          <p style={{ opacity: 0.6, fontSize: 13 }}>No Body Composition scans recorded yet.</p>
        ) : (
          <>
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              <strong style={{ fontSize: 11, opacity: 0.6, display: "block" }}>
                Latest — {assessment.renphoScans[0].scanDate.toLocaleDateString()}
              </strong>
              Weight: {assessment.renphoScans[0].weightKg ?? "—"}kg · Body Fat: {assessment.renphoScans[0].bodyFatPercent ?? "—"}%
              · Metabolic Age: {assessment.renphoScans[0].bodyAge ?? "—"}
            </div>
            <HistoryList
              rows={assessment.renphoScans.map((m) => ({
                id: m.id,
                date: m.scanDate,
                summary: `Weight ${m.weightKg ?? "—"}kg · Body Fat ${m.bodyFatPercent ?? "—"}% · Muscle ${m.muscleMassKg ?? "—"}kg`,
              }))}
            />
          </>
        )}
      </Section>

      {/* ---------- Section 3: Progress Photos ---------- */}
      <Section title="3. Progress Photos">
        {canManage && <PhotoUploadForm clientId={client.id} />}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, fontSize: 12.5 }}>
          {photosByType.map(({ type, photos }) => (
            <div key={type}>
              <strong style={{ display: "block", fontSize: 11, opacity: 0.6, marginBottom: 4 }}>{type}</strong>
              {photos.length === 0 ? (
                <span style={{ opacity: 0.5 }}>None</span>
              ) : (
                photos.map((p) => (
                  <div key={p.id} style={{ marginBottom: 4 }}>
                    {(p.takenAt ?? p.uploadedAt).toLocaleDateString()}
                    {p.visibility === "CLIENT_VISIBLE" && <span style={{ opacity: 0.6 }}> · visible to client</span>}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- Section 4: Specialist Observations ---------- */}
      <Section title="4. Specialist Observations">
        {canManage && (
          <form
            action={async (formData: FormData) => {
              "use server";
              await addObservation(client.id, formData);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}
          >
            <textarea name="body" placeholder="Observation" rows={2} required style={inputStyle} />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select name="visibility" defaultValue="INTERNAL_ONLY" style={inputStyle}>
                <option value="INTERNAL_ONLY">Internal Only</option>
                <option value="CLIENT_VISIBLE">Client Visible</option>
              </select>
              <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
                Add Observation
              </button>
            </div>
          </form>
        )}
        {assessment.specialistObservations.length === 0 ? (
          <p style={{ opacity: 0.6, fontSize: 13 }}>No observations yet.</p>
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, paddingLeft: 0, listStyle: "none" }}>
            {assessment.specialistObservations.map((o) => (
              <li key={o.id} style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 8 }}>
                {o.createdAt.toLocaleString()} {o.visibility === "CLIENT_VISIBLE" && "· visible to client"}
                <div>{o.body}</div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ---------- Section 5: Strategy Validation ---------- */}
      <Section title="5. Strategy Validation">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, marginBottom: 16 }}>
          <Field label="Original Recommendation">{assessment.originalRecommendedSystem ?? "—"}</Field>
          <Field label="Validated Strategy">{assessment.status === "VALIDATED" || assessment.status === "IN_PROGRESS" || assessment.status === "COMPLETED" ? assessment.recommendedSystem ?? "—" : "Not yet validated"}</Field>
        </div>
        {canManage && assessment.status !== "VALIDATED" && (
          <form
            action={async (formData: FormData) => {
              "use server";
              await validateAssessment(client.id, formData);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <input name="baselineAppointmentDate" type="date" style={inputStyle} />
            <input name="validatedSystem" placeholder="Validated system (leave blank to keep original)" style={inputStyle} />
            <input name="validatedFrequency" placeholder="Validated frequency (e.g. 2x/week)" style={inputStyle} />
            <input name="validatedSessionCount" type="number" placeholder="Validated session count" style={inputStyle} />
            <input name="complementarySessions" placeholder="Complementary sessions" style={inputStyle} />
            <textarea name="homeCareGuidance" placeholder="Home-care guidance" rows={2} style={inputStyle} />
            <textarea name="optimizationNotes" placeholder="Optimization notes" rows={2} style={inputStyle} />
            <textarea name="validationNotes" placeholder="Validation notes (also used as strategy-change reason, if changed)" rows={2} style={inputStyle} />
            <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
              {canValidate ? "Validate Blueprint Assessment™" : "Save (validation requires completed baseline)"}
            </button>
          </form>
        )}
        {assessment.status === "VALIDATED" && (
          <p style={{ fontSize: 13, color: "#2f6b3a" }}>
            ✓ Validated {assessment.validatedAt?.toLocaleString()}
          </p>
        )}
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 14, marginBottom: 4 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 12 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <strong style={{ display: "block", fontSize: 11, opacity: 0.6 }}>{label}</strong>
      {children}
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

const inputStyle: React.CSSProperties = { padding: 10 };
