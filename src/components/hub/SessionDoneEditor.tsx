"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSessionRecap } from "@/app/(hub)/hub/(protected)/appointments/actions";
import { TECHNOLOGIES } from "@/lib/technologies";
import { techKey } from "@/lib/tech-count";
import { zonesFor } from "@/lib/tech-zones";

type Tech = { name: string; minutes?: number; number?: number | null; zone?: string | null };
type Row = Tech & { uid: number };
let uidSeq = 0;
const nextUid = () => ++uidSeq;

/**
 * "What was done" editor: pick treatments, their # and zone, then
 * confirm (marks the session completed) or save. Used by the 8 pm recap
 * and the Hub appointment panel.
 */
export default function SessionDoneEditor({
  appointmentId,
  initial,
  status,
  compact = false,
  onDone,
}: {
  appointmentId: string;
  initial: Tech[];
  status: string;
  compact?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [techs, setTechs] = useState<Row[]>(() =>
    initial.map((t) => ({ ...t, uid: nextUid(), name: TECHNOLOGIES.find((x) => techKey(x.name) === techKey(t.name))?.name ?? t.name }))
  );
  const [msg, setMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  // Every click on "+ tech" adds a NEW session entry — the same technology
  // can be logged more than once (e.g. Exilis front + Exilis back).
  function add(name: string, minutes: number) {
    setTechs((prev) => {
      const same = prev.filter((t) => techKey(t.name) === techKey(name));
      // Continue the running count from the previous entry of the same tech.
      const lastNum = same.map((t) => t.number).filter((n): n is number => typeof n === "number").pop();
      return [...prev, { uid: nextUid(), name, minutes, number: lastNum != null ? lastNum + 1 : undefined }];
    });
  }
  function remove(uid: number) {
    setTechs((prev) => prev.filter((t) => t.uid !== uid));
  }
  function patch(uid: number, p: Partial<Tech>) {
    setTechs((prev) => prev.map((t) => (t.uid === uid ? { ...t, ...p } : t)));
  }
  function save(nextStatus?: "COMPLETED" | "NO_SHOW") {
    setMsg("");
    startTransition(async () => {
      const r = await saveSessionRecap(appointmentId, { technologies: techs.map(({ uid: _u, ...t }) => t), status: nextStatus });
      if (r && "error" in r && r.error) return setMsg(r.error);
      setMsg(nextStatus === "COMPLETED" ? "Confirmed ✓" : nextStatus === "NO_SHOW" ? "Marked as no-show." : "Saved.");
      router.refresh();
      onDone?.();
    });
  }

  return (
    <div className={compact ? "sde sde-compact" : "sde"}>
      <div className="sde-techs">
        {techs.map((sel) => {
          const zones = zonesFor(sel.name);
          const dupes = techs.filter((t) => techKey(t.name) === techKey(sel.name)).length > 1;
          return (
            <div key={sel.uid} className="sde-tech on">
              <button type="button" className="sde-tech-toggle" onClick={() => remove(sel.uid)} aria-label={`Remove ${sel.name}`} title="Remove this session entry">
                <span className="sde-box">✓</span>
                {sel.name.replace(/[™®]/g, "").replace(/ Elite/, "")}
                {dupes && sel.zone ? ` · ${zones.find((z) => z.key === sel.zone)?.label ?? ""}` : ""}
              </button>
              <label className="sde-num">
                #
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={sel.number ?? ""}
                  onChange={(e) => patch(sel.uid, { number: e.target.value === "" ? null : Number(e.target.value) })}
                  aria-label={`${sel.name} number`}
                />
              </label>
              {zones.length > 0 && (
                <div className="zone-chips sde-zones">
                  {zones.map((z) => (
                    <button key={z.key} type="button" className={sel.zone === z.key ? "zone-chip on" : "zone-chip"} onClick={() => patch(sel.uid, { zone: sel.zone === z.key ? null : z.key })}>
                      {z.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="sde-add">
        {TECHNOLOGIES.map((t) => {
          const count = techs.filter((x) => techKey(x.name) === techKey(t.name)).length;
          return (
            <button key={t.name} type="button" className="zone-chip" onClick={() => add(t.name, t.minutes)}>
              + {count > 0 ? "another " : ""}
              {t.name.replace(/[™®]/g, "").replace(/ Elite/, "")}
            </button>
          );
        })}
      </div>
      <div className="sde-actions">
        {status !== "COMPLETED" ? (
          <button type="button" className="ss-btn" disabled={isPending || techs.length === 0} onClick={() => save("COMPLETED")}>
            {isPending ? "saving…" : "confirm — done ✓"}
          </button>
        ) : (
          <button type="button" className="ss-btn" disabled={isPending} onClick={() => save()}>
            {isPending ? "saving…" : "save changes"}
          </button>
        )}
        {status !== "COMPLETED" && status !== "NO_SHOW" && (
          <button type="button" className="ss-btn ss-btn-outline-dark" disabled={isPending} onClick={() => save("NO_SHOW")}>
            didn&apos;t happen
          </button>
        )}
        {msg && <span className="sde-msg">{msg}</span>}
      </div>
    </div>
  );
}
