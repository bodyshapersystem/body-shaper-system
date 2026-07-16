"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { bulkImportClients, type ImportRow, type ImportResult } from "./import-actions";

const TARGET_FIELDS: { key: keyof ImportRow; label: string; required?: boolean }[] = [
  { key: "firstName", label: "First Name", required: true },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "city", label: "Service Zone" },
  { key: "state", label: "State" },
  { key: "birthday", label: "Birthday" },
  { key: "lastAppointment", label: "Last Appointment" },
  { key: "lastTreatment", label: "Last Treatment" },
  { key: "lifetimeValue", label: "Lifetime Value" },
  { key: "notes", label: "Notes" },
];

export default function ImportWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"upload" | "map" | "preview" | "done">("upload");
  const [error, setError] = useState("");
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
        if (json.length === 0) {
          setError("This file appears to be empty.");
          return;
        }
        setSourceColumns(Object.keys(json[0]));
        setRawRows(json.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)]))));
        setStep("map");
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            setError("This file appears to be empty.");
            return;
          }
          setSourceColumns(results.meta.fields ?? []);
          setRawRows(results.data);
          setStep("map");
        },
        error: (err) => setError(err.message),
      });
    }
  }

  function autoDetectMapping() {
    const detected: Record<string, string> = {};
    for (const target of TARGET_FIELDS) {
      const match = sourceColumns.find((col) => col.toLowerCase().replace(/[^a-z]/g, "").includes(target.key.toLowerCase().replace(/[^a-z]/g, "")));
      if (match) detected[target.key] = match;
    }
    setMapping(detected);
  }

  function goToPreview() {
    const required = TARGET_FIELDS.filter((f) => f.required);
    const missing = required.filter((f) => !mapping[f.key]);
    if (missing.length > 0) {
      setError(`Please map: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setError("");
    setStep("preview");
  }

  function buildMappedRows(): ImportRow[] {
    return rawRows.map((raw) => {
      const row: Partial<ImportRow> = {};
      for (const target of TARGET_FIELDS) {
        const sourceCol = mapping[target.key];
        if (sourceCol && raw[sourceCol]) (row as Record<string, string>)[target.key] = raw[sourceCol];
      }
      // Real-world messy data fix: some exports cram "First Last" into
      // just the First Name column with Last Name left blank — split
      // on the first space rather than leaving Last Name empty.
      if (row.firstName && !row.lastName && row.firstName.trim().includes(" ")) {
        const parts = row.firstName.trim().split(/\s+/);
        row.firstName = parts[0];
        row.lastName = parts.slice(1).join(" ");
      }
      return row as ImportRow;
    });
  }

  function handleImport() {
    const mappedRows = buildMappedRows();
    startTransition(async () => {
      const res = await bulkImportClients(mappedRows);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setResult(res);
      setStep("done");
    });
  }

  const mappedPreview = step === "preview" ? buildMappedRows().slice(0, 10) : [];

  return (
    <div className="pd-card">
      {error && <p className="sched-error" style={{ marginBottom: 12 }}>{error}</p>}

      {step === "upload" && (
        <>
          <p className="pay-history-meta" style={{ marginBottom: 16 }}>
            Upload a CSV or Excel (.xlsx) file exported from your previous scheduling software.
          </p>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="sched-select" />
        </>
      )}

      {step === "map" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--sans)", fontSize: 13 }}>Map Columns ({rawRows.length} rows found)</h3>
            <button type="button" className="dash-view-btn" onClick={autoDetectMapping}>Auto-Detect</button>
          </div>
          <div className="cl-summary-list" style={{ marginBottom: 16 }}>
            {TARGET_FIELDS.map((target) => (
              <div key={target.key} className="cl-summary-row">
                <span>{target.label}{target.required && " *"}</span>
                <select
                  value={mapping[target.key] ?? ""}
                  onChange={(e) => setMapping((prev) => ({ ...prev, [target.key]: e.target.value }))}
                  className="sched-select"
                  style={{ width: "auto" }}
                >
                  <option value="">— Not mapped —</option>
                  {sourceColumns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button type="button" className="sched-cta" onClick={goToPreview}>Preview Import</button>
        </>
      )}

      {step === "preview" && (
        <>
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 12 }}>
            Preview — showing first 10 of {rawRows.length} rows
          </h3>
          <p className="pay-history-meta" style={{ marginBottom: 16 }}>
            All imported clients will be created as <strong>Inactive</strong> (paused) unless you activate them manually afterward.
          </p>
          <div style={{ overflowX: "auto", marginBottom: 16 }}>
            <table className="simple-table">
              <thead>
                <tr>
                  {TARGET_FIELDS.map((f) => (
                    <th key={f.key} style={{ padding: "6px 8px", fontSize: 11 }}>{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mappedPreview.map((row, i) => (
                  <tr key={i}>
                    {TARGET_FIELDS.map((f) => (
                      <td key={f.key} style={{ padding: "6px 8px", fontSize: 11.5 }}>{row[f.key] ?? "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="sched-secondary-btn" onClick={() => setStep("map")}>Back</button>
            <button type="button" className="sched-cta" onClick={handleImport} disabled={isPending}>
              {isPending ? "Importing…" : `Import ${rawRows.length} Clients`}
            </button>
          </div>
        </>
      )}

      {step === "done" && result && (
        <>
          <h3 style={{ fontFamily: "var(--sans)", fontSize: 13, marginBottom: 12 }}>Import Complete</h3>
          <p className="pay-history-meta" style={{ marginBottom: 8 }}>✅ {result.successCount} clients imported (paused) with real Portal accounts.</p>
          {result.contactOnlyCount > 0 && (
            <p className="pay-history-meta" style={{ marginBottom: 8 }}>
              📇 {result.contactOnlyCount} contacts saved without a Portal account (no email on file) — stored for future SMS outreach.
            </p>
          )}
          {result.failures.length > 0 && (
            <>
              <p className="sched-error" style={{ marginBottom: 8 }}>⚠️ {result.failures.length} rows skipped:</p>
              <ul style={{ maxHeight: 200, overflowY: "auto", fontSize: 12 }}>
                {result.failures.map((f) => (
                  <li key={f.row}>Row {f.row} ({f.email}): {f.reason}</li>
                ))}
              </ul>
            </>
          )}
          <button type="button" className="sched-cta" style={{ marginTop: 16 }} onClick={() => router.push("/hub/clients")}>
            Go to Clients
          </button>
        </>
      )}
    </div>
  );
}
