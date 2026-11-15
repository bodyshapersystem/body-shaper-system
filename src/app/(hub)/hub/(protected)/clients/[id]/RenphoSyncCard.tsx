"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getRenphoProfiles, linkRenphoProfile, syncRenphoNow, unlinkRenpho } from "./renpho-sync-actions";

type Profile = { id: string; name: string; linkedTo?: string; linkedClientId?: string };

/**
 * RENPHO auto-sync status for one client: which profile in the studio's
 * RENPHO account is hers, when it last synced, and a picker to link it.
 * Once linked, new scans arrive automatically (hourly cron) — no typing.
 */
export default function RenphoSyncCard({ clientId, renphoName, syncedAt }: { clientId: string; renphoName: string | null; syncedAt: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  const openPicker = () => {
    setOpen(true); setError(""); setProfiles(null);
    start(async () => {
      const r = await getRenphoProfiles();
      if (r.error) setError(r.error); else setProfiles(r.profiles ?? []);
    });
  };
  const link = (p: Profile) => start(async () => {
    setError("");
    const r = await linkRenphoProfile(clientId, p.id, p.name);
    if (r.error) { setError(r.error); return; }
    setOpen(false); setNote(r.added ? `Linked · ${r.added} scan${r.added === 1 ? "" : "s"} imported` : "Linked · no scans found yet"); router.refresh();
  });
  const sync = () => start(async () => {
    setNote(""); setError("");
    const r = await syncRenphoNow(clientId);
    if (r.error) setError(r.error); else { setNote(r.added ? `${r.added} new scan${r.added === 1 ? "" : "s"} imported` : "Up to date"); router.refresh(); }
  });
  const unlink = () => start(async () => { await unlinkRenpho(clientId); setNote(""); router.refresh(); });

  const when = syncedAt ? new Date(syncedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : null;

  return (
    <div className="renpho-sync">
      <div className="renpho-sync-row">
        <div>
          <p className="dtj-field-label" style={{ margin: 0 }}>RENPHO auto-sync</p>
          <p className="pay-history-meta" style={{ margin: "2px 0 0" }}>
            {renphoName ? <>Linked to <b>{renphoName}</b>{when ? ` · last sync ${when}` : ""}</> : "Not linked — scans are entered by hand"}
          </p>
          {note && <p className="pay-history-meta" style={{ margin: "2px 0 0", color: "var(--mocha)" }}>{note}</p>}
        </div>
        <div className="renpho-sync-actions">
          {renphoName && <button type="button" className="bbp-edit-link" onClick={sync} disabled={pending}>{pending ? "Syncing…" : "Sync now"}</button>}
          <button type="button" className="bbp-edit-link" onClick={openPicker} disabled={pending}>{renphoName ? "Change" : "+ Link RENPHO profile"}</button>
        </div>
      </div>
      {error && !open && <p className="sched-error">{error}</p>}

      {open && (
        <div className="bp-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="bp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bp-sheet-handle" />
            <h3 className="bp-sheet-title">Link RENPHO profile</h3>
            <p className="pay-history-meta" style={{ marginBottom: 12 }}>
              Choose this client&apos;s user in your RENPHO account. Her full scan history is imported now, and every new scan arrives automatically.
            </p>
            {!profiles && !error && <p className="pay-history-meta">Loading your RENPHO users…</p>}
            {error && <p className="sched-error">{error}</p>}
            {profiles && (
              <div className="renpho-profile-list">
                {profiles.length === 0 && <p className="pay-history-meta">No users found in the RENPHO account.</p>}
                {profiles.map((p) => {
                  const mine = p.linkedClientId === clientId;
                  const other = p.linkedClientId && !mine;
                  return (
                    <button key={p.id} type="button" className={`renpho-profile${mine ? " on" : ""}`} disabled={pending || Boolean(other)} onClick={() => link(p)}>
                      <span>{p.name}</span>
                      <em>{mine ? "linked" : other ? `linked to ${p.linkedTo}` : "link"}</em>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="bp-sheet-actions">
              {renphoName && <button type="button" className="sched-secondary-btn" onClick={() => { setOpen(false); unlink(); }} disabled={pending}>Unlink</button>}
              <button type="button" className="sched-secondary-btn" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
