"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordRenphoScan } from "./blueprint-actions";
import { createSignedDocumentUploadUrl, recordClientDocument } from "./actions";
import { extractRenphoFromImage, type ExtractedRenphoData } from "./renpho-extraction-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RecordRenphoScanSheet({ clientId, assessmentId }: { clientId: string; assessmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedRenphoData>({});
  const [extractedCount, setExtractedCount] = useState<number | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await recordRenphoScan(clientId, assessmentId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }

      // Keep the original report on file, same as any other client document.
      if (pendingFile) {
        try {
          const signed = await createSignedDocumentUploadUrl(clientId, pendingFile.name);
          if (signed?.path && signed?.token) {
            const supabase = createSupabaseBrowserClient();
            await supabase.storage.from("client-documents").uploadToSignedUrl(signed.path, signed.token, pendingFile);
            await recordClientDocument(clientId, {
              storagePath: signed.path,
              title: `RENPHO Scan — ${new Date().toLocaleDateString("en-US")}`,
              fileType: pendingFile.type || undefined,
              sizeBytes: pendingFile.size,
              category: "RENPHO_REPORTS" as never,
              visibility: "INTERNAL_ONLY" as never,
            });
          }
        } catch {
          // Non-fatal — the scan itself already saved; the original file is a nice-to-have.
        }
      }

      setOpen(false);
      setExtracted({});
      setExtractedCount(null);
      setPendingFile(null);
      router.refresh();
    });
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setExtracting(true);
    setError("");
    try {
      const base64 = await fileToBase64(file);
      const result = await extractRenphoFromImage(base64, file.type || "image/jpeg");
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setExtracted(result.data);
        setExtractedCount(Object.keys(result.data).length);
      }
    } catch {
      setError("Couldn't read that file. Please try a clearer photo or enter values manually.");
    } finally {
      setExtracting(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const formKey = JSON.stringify(extracted); // remount inputs with new defaultValues once extraction completes

  return (
    <>
      <button type="button" className="bbp-edit-link" onClick={() => setOpen(true)}>
        + Record Scan
      </button>

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Record RENPHO Scan</h3>

            <div className="renpho-upload-box">
              <p className="dtj-field-label" style={{ margin: "0 0 6px" }}>Upload RENPHO Report</p>
              <p className="pay-history-meta" style={{ marginBottom: 10 }}>
                Upload a photo or screenshot of the scan result and we'll read the numbers automatically — review and correct anything below before saving.
              </p>
              <input type="file" accept="image/*" onChange={handleFileSelect} disabled={extracting} />
              {extracting && <p className="pay-history-meta" style={{ marginTop: 8 }}>Reading report…</p>}
              {extractedCount != null && !extracting && (
                <p className="pay-history-meta" style={{ marginTop: 8, color: "var(--mocha)" }}>
                  ✓ {extractedCount} value{extractedCount === 1 ? "" : "s"} read from the report — review below.
                </p>
              )}
            </div>

            <p className="pay-history-meta" style={{ marginBottom: 12 }}>
              Only fill in what you have — every field except date is optional. Save works fine with just a few real numbers.
            </p>
            <form action={handleSubmit} className="bp-sheet-form" key={formKey}>
              <label className="sched-label">
                Scan Date *
                <input name="scanDate" type="date" defaultValue={today} required className="sched-select" />
              </label>
              <div className="bp-sheet-grid">
                <label className="sched-label">Weight (kg)<input name="weightKg" type="number" step="0.1" defaultValue={extracted.weightKg ?? ""} className="sched-select" /></label>
                <label className="sched-label">BMI<input name="bmi" type="number" step="0.1" defaultValue={extracted.bmi ?? ""} className="sched-select" /></label>
                <label className="sched-label">Body Fat %<input name="bodyFatPercent" type="number" step="0.1" defaultValue={extracted.bodyFatPercent ?? ""} className="sched-select" /></label>
                <label className="sched-label">Visceral Fat<input name="visceralFat" type="number" step="0.1" defaultValue={extracted.visceralFat ?? ""} className="sched-select" /></label>
                <label className="sched-label">Muscle Mass (kg)<input name="muscleMassKg" type="number" step="0.1" defaultValue={extracted.muscleMassKg ?? ""} className="sched-select" /></label>
                <label className="sched-label">Skeletal Muscle (kg)<input name="skeletalMuscleKg" type="number" step="0.1" defaultValue={extracted.skeletalMuscleKg ?? ""} className="sched-select" /></label>
                <label className="sched-label">Body Water %<input name="bodyWaterPercent" type="number" step="0.1" defaultValue={extracted.bodyWaterPercent ?? ""} className="sched-select" /></label>
                <label className="sched-label">Protein %<input name="proteinPercent" type="number" step="0.1" defaultValue={extracted.proteinPercent ?? ""} className="sched-select" /></label>
                <label className="sched-label">Bone Mass (kg)<input name="boneMassKg" type="number" step="0.1" defaultValue={extracted.boneMassKg ?? ""} className="sched-select" /></label>
                <label className="sched-label">Subcutaneous Fat %<input name="subcutaneousFatPercent" type="number" step="0.1" defaultValue={extracted.subcutaneousFatPercent ?? ""} className="sched-select" /></label>
                <label className="sched-label">BMR (kcal)<input name="bmr" type="number" defaultValue={extracted.bmr ?? ""} className="sched-select" /></label>
                <label className="sched-label">Metabolic Age<input name="bodyAge" type="number" defaultValue={extracted.bodyAge ?? ""} className="sched-select" /></label>
                <label className="sched-label">Fat-Free Weight (kg)<input name="fatFreeWeightKg" type="number" step="0.1" defaultValue={extracted.fatFreeWeightKg ?? ""} className="sched-select" /></label>
                <label className="sched-label">Waist-Hip Ratio (WHR)<input name="whr" type="number" step="0.01" defaultValue={extracted.whr ?? ""} className="sched-select" /></label>
                <label className="sched-label">SMI (kg/m²)<input name="smi" type="number" step="0.1" defaultValue={extracted.smi ?? ""} className="sched-select" /></label>
              </div>
              <label className="sched-label">
                Notes
                <textarea name="notes" rows={2} className="sched-textarea" />
              </label>
              {error && <p className="sched-error">{error}</p>}
              <div className="bp-sheet-actions">
                <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="sched-cta" disabled={isPending}>
                  {isPending ? "Saving…" : "Save Scan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
