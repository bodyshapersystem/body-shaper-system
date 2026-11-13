"use client";

import { useState, useTransition } from "react";
import { updatePackageTechnologies } from "./actions";
import type { PackageTechnologies, PackageTrackerRow } from "@/lib/tech-count";

/**
 * Hub-only package tracker shown in the scheduler under the client
 * summary: one row per technology in the current package with
 * done / booked / left to book, and a check once it's complete.
 * Never rendered in the Client Portal.
 */
export default function PackageTracker({
  data,
  technologyOptions,
  onSaved,
}: {
  data: { assessmentId: string; system: string | null; pkg: PackageTechnologies | null; rows: PackageTrackerRow[] };
  technologyOptions: string[];
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(!data.pkg);
  const [since, setSince] = useState(data.pkg?.since ?? new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<{ name: string; total: string }[]>(
    data.pkg?.items.map((i) => ({ name: i.name, total: String(i.total) })) ?? [{ name: technologyOptions[0], total: "" }]
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function save() {
    setError("");
    startTransition(async () => {
      const r = await updatePackageTechnologies(data.assessmentId, {
        since,
        items: items.map((i) => ({ name: i.name, total: Number(i.total) })),
      });
      if ("error" in r && r.error) return setError(r.error);
      setEditing(false);
      onSaved();
    });
  }

  const totalLeft = data.rows.reduce((s, r) => s + (r.total - r.done), 0);

  return (
    <div className="pkt-card">
      <div className="pkt-head">
        <div>
          <p className="pkt-eyebrow">package tracker · hub only</p>
          <h4 className="pkt-title">{data.system ?? "current package"}</h4>
        </div>
        {!editing && (
          <button type="button" className="pkt-link" onClick={() => setEditing(true)}>
            edit
          </button>
        )}
      </div>

      {!editing && data.pkg && (
        <>
          <ul className="pkt-list">
            {data.rows.map((r) => (
              <li key={r.name} className={r.complete ? "pkt-row pkt-row-done" : "pkt-row"}>
                <span className={r.complete ? "pkt-check pkt-check-on" : "pkt-check"}>{r.complete ? "✓" : ""}</span>
                <span className="pkt-name">{r.name}</span>
                <span className="pkt-count">
                  {r.done} of {r.total}
                </span>
                <span className="pkt-meta">
                  {r.complete
                    ? "complete"
                    : [r.scheduled > 0 ? `${r.scheduled} booked` : null, r.toBook > 0 ? `${r.toBook} to book` : "all booked"].filter(Boolean).join(" · ")}
                </span>
                <span className="pkt-bar">
                  <span className="pkt-bar-done" style={{ width: `${(r.done / r.total) * 100}%` }} />
                  <span className="pkt-bar-booked" style={{ width: `${(Math.min(r.scheduled, r.total - r.done) / r.total) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
          <p className="pkt-foot">
            {totalLeft === 0 ? "package complete" : `${totalLeft} treatment${totalLeft === 1 ? "" : "s"} left`} · since{" "}
            {new Date(data.pkg.since + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </>
      )}

      {editing && (
        <div className="pkt-edit">
          {items.map((it, idx) => (
            <div key={idx} className="pkt-edit-row">
              <select
                className="sched-select"
                value={it.name}
                onChange={(e) => setItems((p) => p.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))}
              >
                {[...new Set([...technologyOptions, it.name])].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="#"
                className="sched-inline-input"
                style={{ width: 60, textAlign: "center" }}
                value={it.total}
                onChange={(e) => setItems((p) => p.map((x, i) => (i === idx ? { ...x, total: e.target.value } : x)))}
                aria-label="Sessions in package"
              />
              <button type="button" className="pkt-link" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))} aria-label="Remove">
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="pkt-link"
            onClick={() => setItems((p) => [...p, { name: technologyOptions.find((n) => !p.some((x) => x.name === n)) ?? technologyOptions[0], total: "" }])}
          >
            + add technology
          </button>
          <label className="pkt-since">
            package started
            <input type="date" className="sched-select" value={since} onChange={(e) => setSince(e.target.value)} />
          </label>
          <p className="pkt-hint">Progress comes from the # on each completed appointment — start the # at 1 for a new package.</p>
          {error && <p className="sched-error">{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="sched-cta" onClick={save} disabled={isPending}>
              {isPending ? "Saving…" : "Save package"}
            </button>
            {data.pkg && (
              <button type="button" className="sched-secondary-btn" onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
