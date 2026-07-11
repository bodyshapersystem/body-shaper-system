import {
  addProfessionalMeasurement,
  addBodyComposition,
  uploadProgressPhoto,
  addObservation,
  validateAssessment,
} from "./blueprint-actions";
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
      {/* ---------- Header ---------- */}
      <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, padding: 16 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Blueprint Assessment™</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 13 }}>
          <Field label="Version">v{assessment.version}</Field>
          <Field label="Status">{STATUS_LABELS[assessment.status] ?? assessment.status}</Field>
          <Field label="Intake Submitted">{assessment.intakeSubmissionDate?.toLocaleDateString() ?? "—"}</Field>
          <Field label="Baseline Appointment">{assessment.baselineAppointmentDate?.toLocaleDateString() ?? "—"}</Field>
          <Field label="Original Recommendation">{assessment.originalRecommendedSystem ?? "—"}</Field>
          <Field label="Validated System">{assessment.status === "VALIDATED" || assessment.status === "IN_PROGRESS" || assessment.status === "COMPLETED" ? assessment.recommendedSystem ?? "—" : "Not yet validated"}</Field>
          <Field label="Initial Frequency">{assessment.initialFrequency ?? "—"}</Field>
          <Field label="Validated Frequency">{assessment.validatedFrequency ?? "—"}</Field>
          <Field label="Initial Sessions">{assessment.initialSessionCount ?? "—"}</Field>
          <Field label="Validated Sessions">{assessment.validatedSessionCount ?? "—"}</Field>
          <Field label="Validated At">{assessment.validatedAt?.toLocaleString() ?? "—"}</Field>
        </div>
        {assessment.validationNotes && (
          <p style={{ marginTop: 12, fontSize: 13 }}>
            <strong style={{ fontSize: 11, opacity: 0.6 }}>Validation Notes: </strong>
            {assessment.validationNotes}
          </p>
        )}
      </div>

      {/* ---------- Section 1: Professional Measurements ---------- */}
      <Section title="1. Professional Body Measurements">
        {canManage && (
          <form
            action={async (formData: FormData) => {
              "use server";
              await addProfessionalMeasurement(client.id, formData);
            }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}
          >
            <input name="measuredAt" type="date" required style={inputStyle} />
            <input name="waistCm" type="number" step="0.1" placeholder="Waist (cm)" style={inputStyle} />
            <input name="highWaistCm" type="number" step="0.1" placeholder="High Waist (cm)" style={inputStyle} />
            <input name="lowerAbdomenCm" type="number" step="0.1" placeholder="Lower Abdomen (cm)" style={inputStyle} />
            <input name="hipsCm" type="number" step="0.1" placeholder="Hips (cm)" style={inputStyle} />
            <input name="chestCm" type="number" step="0.1" placeholder="Chest (cm)" style={inputStyle} />
            <input name="rightArmCm" type="number" step="0.1" placeholder="Right Arm (cm)" style={inputStyle} />
            <input name="leftArmCm" type="number" step="0.1" placeholder="Left Arm (cm)" style={inputStyle} />
            <input name="rightThighCm" type="number" step="0.1" placeholder="Right Thigh (cm)" style={inputStyle} />
            <input name="leftThighCm" type="number" step="0.1" placeholder="Left Thigh (cm)" style={inputStyle} />
            <input name="notes" placeholder="Notes" style={{ ...inputStyle, gridColumn: "span 3" }} />
            <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px", gridColumn: "span 3" }}>
              Save Measurement
            </button>
          </form>
        )}
        {assessment.bodyMeasurements.length === 0 ? (
          <p style={{ opacity: 0.6, fontSize: 13 }}>No measurements recorded yet.</p>
        ) : (
          <>
            <LatestMeasurement m={assessment.bodyMeasurements[0]} />
            <HistoryList
              rows={assessment.bodyMeasurements.map((m) => ({
                id: m.id,
                date: m.measuredAt,
                summary: `Waist ${m.waistCm ?? "—"}cm · Hips ${m.hipsCm ?? "—"}cm · Chest ${m.chestCm ?? "—"}cm`,
              }))}
            />
          </>
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
        {canManage && (
          <form
            action={async (formData: FormData) => {
              "use server";
              await uploadProgressPhoto(client.id, formData);
            }}
            style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}
          >
            <select name="type" required style={inputStyle}>
              {PHOTO_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input name="takenAt" type="date" style={inputStyle} />
            <select name="visibility" defaultValue="INTERNAL_ONLY" style={inputStyle}>
              <option value="INTERNAL_ONLY">Internal Only</option>
              <option value="CLIENT_VISIBLE">Client Visible</option>
            </select>
            <input name="file" type="file" accept="image/*" required />
            <input name="notes" placeholder="Notes" style={inputStyle} />
            <button type="submit" className="auth-submit" style={{ width: "auto", padding: "10px 20px" }}>
              Upload
            </button>
          </form>
        )}
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

function LatestMeasurement({
  m,
}: {
  m: {
    measuredAt: Date;
    waistCm: number | null;
    hipsCm: number | null;
    chestCm: number | null;
  };
}) {
  return (
    <div style={{ fontSize: 13, marginBottom: 12 }}>
      <strong style={{ fontSize: 11, opacity: 0.6, display: "block" }}>Latest — {m.measuredAt.toLocaleDateString()}</strong>
      Waist: {m.waistCm ?? "—"}cm · Hips: {m.hipsCm ?? "—"}cm · Chest: {m.chestCm ?? "—"}cm
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
