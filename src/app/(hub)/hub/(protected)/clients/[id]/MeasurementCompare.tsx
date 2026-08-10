"use client";

import { useMemo, useState } from "react";

type BodyMeasurementRow = {
  id: string;
  measuredAt: string | Date;
  waistCm: number | null;
  highWaistCm: number | null;
  lowerAbdomenCm: number | null;
  hipsCm: number | null;
  chestCm: number | null;
  neckCm: number | null;
  shoulderCm: number | null;
  rightArmCm: number | null;
  leftArmCm: number | null;
  rightThighCm: number | null;
  leftThighCm: number | null;
};

const FIELDS: { key: keyof BodyMeasurementRow; label: string }[] = [
  { key: "chestCm", label: "Chest" },
  { key: "waistCm", label: "Waist" },
  { key: "highWaistCm", label: "High Waist" },
  { key: "lowerAbdomenCm", label: "Abdomen" },
  { key: "hipsCm", label: "Hips" },
  { key: "neckCm", label: "Neck" },
  { key: "shoulderCm", label: "Shoulder" },
  { key: "rightArmCm", label: "Right Arm" },
  { key: "leftArmCm", label: "Left Arm" },
  { key: "rightThighCm", label: "Right Thigh" },
  { key: "leftThighCm", label: "Left Thigh" },
];

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function MeasurementCompare({ measurements }: { measurements: BodyMeasurementRow[] }) {
  const [open, setOpen] = useState(false);
  // measurements is already sorted newest -> oldest. Default comparison
  // is latest vs. the earliest one on file (baseline vs. now).
  const [laterId, setLaterId] = useState(measurements[0]?.id);
  const [earlierId, setEarlierId] = useState(measurements[measurements.length - 1]?.id);

  const later = measurements.find((m) => m.id === laterId) ?? measurements[0];
  const earlier = measurements.find((m) => m.id === earlierId) ?? measurements[measurements.length - 1];

  const rows = useMemo(() => {
    if (!later || !earlier || later.id === earlier.id) return [];
    return FIELDS.map(({ key, label }) => {
      const a = earlier[key] as number | null;
      const b = later[key] as number | null;
      if (a == null || b == null) return { label, a, b, delta: null };
      return { label, a, b, delta: b - a };
    }).filter((r) => r.a != null && r.b != null);
  }, [later, earlier]);

  const improvedCount = rows.filter((r) => r.delta != null && r.delta < -0.05).length;
  const totalComparable = rows.length;
  const showCongrats = totalComparable > 0 && improvedCount / totalComparable >= 0.5 && improvedCount > 0;

  if (measurements.length < 2) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <button type="button" className="bbp-edit-link" onClick={() => setOpen((v) => !v)}>
        {open ? "Hide Comparison" : `Compare Progress (${measurements.length} recorded)`}
      </button>

      {open && (
        <div style={{ marginTop: 12, padding: 16, border: "1px solid var(--line)", borderRadius: 6, background: "var(--ivory)" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <label className="sched-label" style={{ flex: 1, minWidth: 140 }}>
              From
              <select className="sched-select" value={earlierId} onChange={(e) => setEarlierId(e.target.value)}>
                {measurements.map((m) => (
                  <option key={m.id} value={m.id}>{fmtDate(m.measuredAt)}</option>
                ))}
              </select>
            </label>
            <label className="sched-label" style={{ flex: 1, minWidth: 140 }}>
              To
              <select className="sched-select" value={laterId} onChange={(e) => setLaterId(e.target.value)}>
                {measurements.map((m) => (
                  <option key={m.id} value={m.id}>{fmtDate(m.measuredAt)}</option>
                ))}
              </select>
            </label>
          </div>

          {showCongrats && (
            <div
              style={{
                background: "var(--charcoal)", color: "var(--ivory)", borderRadius: 4,
                padding: "20px 18px", textAlign: "center", marginBottom: 18,
              }}
            >
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, margin: "0 0 6px" }}>
                Congratulations! 🎉
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: 13, margin: 0, opacity: 0.85 }}>
                {improvedCount} of {totalComparable} measurements improved between {fmtDate(earlier.measuredAt)} and {fmtDate(later.measuredAt)}.
              </p>
            </div>
          )}

          {rows.length === 0 ? (
            <p className="pay-history-meta">No overlapping fields recorded on both dates.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--sans)", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
                  <th style={{ padding: "6px 8px" }}></th>
                  <th style={{ padding: "6px 8px" }}>{fmtDate(earlier.measuredAt)}</th>
                  <th style={{ padding: "6px 8px" }}>{fmtDate(later.measuredAt)}</th>
                  <th style={{ padding: "6px 8px" }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <td style={{ padding: "6px 8px", color: "#6a635a" }}>{r.label}</td>
                    <td style={{ padding: "6px 8px" }}>{r.a?.toFixed(1)} cm</td>
                    <td style={{ padding: "6px 8px" }}>{r.b?.toFixed(1)} cm</td>
                    <td
                      style={{
                        padding: "6px 8px",
                        color: r.delta == null ? "#8a7f74" : r.delta < -0.05 ? "#4a7a4a" : r.delta > 0.05 ? "#a6453f" : "#8a7f74",
                        fontWeight: 500,
                      }}
                    >
                      {r.delta == null ? "—" : `${r.delta > 0 ? "+" : ""}${r.delta.toFixed(1)} cm`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
