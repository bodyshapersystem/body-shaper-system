"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSystemCompletionContent } from "./blueprint-actions";

type PhotoOption = { id: string; url: string; label: string };

export default function SystemCompletionEditor({
  clientId,
  assessmentId,
  initialHighlights,
  initialNextSystemName,
  initialNextSystemProposal,
  initialSelectedPhotoIds,
  photoOptions,
}: {
  clientId: string;
  assessmentId: string;
  initialHighlights: string;
  initialNextSystemName: string;
  initialNextSystemProposal: string;
  initialSelectedPhotoIds: string[];
  photoOptions: PhotoOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [highlights, setHighlights] = useState(initialHighlights);
  const [nextSystemName, setNextSystemName] = useState(initialNextSystemName);
  const [nextSystemProposal, setNextSystemProposal] = useState(initialNextSystemProposal);
  const [selected, setSelected] = useState<string[]>(initialSelectedPhotoIds);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    setMessage("");
    startTransition(async () => {
      const result = await updateSystemCompletionContent(clientId, assessmentId, {
        completionHighlights: highlights,
        nextSystemName,
        nextSystemProposal,
        completionPhotoIds: selected,
      });
      if (result?.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Saved — this is what the client will see on their System Completion page.");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button type="button" className="sched-secondary-btn" style={{ marginTop: 8 }} onClick={() => setOpen(true)}>
        Edit Completion Page Content
      </button>
    );
  }

  return (
    <div style={{ marginTop: 12, padding: 16, border: "1px solid var(--line)", borderRadius: 6 }}>
      <p className="bbp-arch-col-label" style={{ marginBottom: 6 }}>results highlights (one bullet per line)</p>
      <textarea
        value={highlights}
        onChange={(e) => setHighlights(e.target.value)}
        rows={4}
        placeholder={"Abdomen: visibly more defined, fibrosis reduced\nLegs/glutes: cellulite noticeably reduced"}
        style={{ width: "100%", fontFamily: "var(--sans)", fontSize: 13, padding: 8 }}
      />

      <p className="bbp-arch-col-label" style={{ margin: "14px 0 6px" }}>next system name</p>
      <input
        value={nextSystemName}
        onChange={(e) => setNextSystemName(e.target.value)}
        placeholder="Sculpt Signature™"
        style={{ width: "100%", fontFamily: "var(--sans)", fontSize: 13, padding: 8 }}
      />

      <p className="bbp-arch-col-label" style={{ margin: "14px 0 6px" }}>next system proposal (one bullet per line)</p>
      <textarea
        value={nextSystemProposal}
        onChange={(e) => setNextSystemProposal(e.target.value)}
        rows={4}
        placeholder={"6 Exilis® (4 legs, 2 abdomen)\n6 Endospheres® (legs)\n2 additional EMS"}
        style={{ width: "100%", fontFamily: "var(--sans)", fontSize: 13, padding: 8 }}
      />

      {photoOptions.length > 0 && (
        <>
          <p className="bbp-arch-col-label" style={{ margin: "14px 0 6px" }}>featured photos (client-visible only)</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {photoOptions.map((p) => (
              <label key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <img
                  src={p.url}
                  alt={p.label}
                  style={{
                    width: 90, height: 90, objectFit: "cover", borderRadius: 4,
                    border: selected.includes(p.id) ? "2px solid var(--mocha)" : "1px solid var(--line)",
                  }}
                />
                <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
              </label>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <button type="button" className="sched-secondary-btn" onClick={save} disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </button>
        <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>Close</button>
      </div>
      {message && <p className="pay-history-meta" style={{ marginTop: 8 }}>{message}</p>}
    </div>
  );
}
