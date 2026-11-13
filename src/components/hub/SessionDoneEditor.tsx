"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSessionRecap } from "@/app/(hub)/hub/(protected)/appointments/actions";
import { TECHNOLOGIES } from "@/lib/technologies";
import { techKey } from "@/lib/tech-count";
import { zonesFor } from "@/lib/tech-zones";

type Tech = { name: string; minutes?: number; number?: number | null; zone?: string | null };

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
  const [techs, setTechs] = useState<Tech[]>(() =>
    initial.map((t) => ({ ...t, name: TECHNOLOGIES.find((x) => techKey(x.name) === techKey(t.name))?.name ?? t.name }))
  );
  const [msg, setMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const has = (name: string) => techs.find((t) => t.name === name);
  function toggle(name: string, minutes: number) {
    setTechs((prev) => (prev.some((t) => t.name === name) ? prev.filter((t) => t.name !== name) : [...prev, { name, minutes }]));
  }
  function patch(name: string, p: Partial<Tech>) {
    setTechs((prev) => prev.map((t) => (t.name === name ? { ...t, ...p } : t)));
  }
  function save(nextStatus?: "COMPLETED" | "NO_SHOW") {
    setMsg("");
    startTransition(async () => {
      const r = await saveSessionRecap(appointmentId, { technologies: techs, status: nextStatus });
      if (r && "error" in r && r.error) return setMsg(r.error);
      setMsg(nextStatus === "COMPLETED" ? "Confirmed ✓" : nextStatus === "NO_SHOW" ? "Marked as no-show." : "Saved.");
      router.refresh();
      onDone?.();
    });
  }

  return (
    <div className={compact ? "sde sde-compact" : "sde"}>
      <div className="sde-techs">
        {TECHNOLOGIES.filter((tech) => has(tech.name)).map((tech) => {
          const sel = has(tech.name);
          const zones = zonesFor(tech.name);
          return (
            <div key={tech.name} className={sel ? "sde-tech on" : "sde-tech"}>
              <button type="button" className="sde-tech-toggle" onClick={() => toggle(tech.name, tech.minutes)} aria-pressed={!!sel}>
                <span className="sde-box">{sel ? "✓" : ""}</span>
                {tech.name.replace(/[™®]/g, "").replace(/ Elite/, "")}
              </button>
              {sel && (
                <>
                  <label className="sde-num">
                    #
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={sel.number ?? ""}
                      onChange={(e) => patch(tech.name, { number: e.target.value === "" ? null : Number(e.target.value) })}
                      aria-label={`${tech.name} number`}
                    />
                  </label>
                  {zones.length > 0 && (
                    <div className="zone-chips sde-zones">
                      {zones.map((z) => (
                        <button key={z.key} type="button" className={sel.zone === z.key ? "zone-chip on" : "zone-chip"} onClick={() => patch(tech.name, { zone: sel.zone === z.key ? null : z.key })}>
                          {z.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      {TECHNOLOGIES.some((t) => !has(t.name)) && (
        <div className="sde-add">
          {TECHNOLOGIES.filter((t) => !has(t.name)).map((t) => (
            <button key={t.name} type="button" className="zone-chip" onClick={() => toggle(t.name, t.minutes)}>
              + {t.name.replace(/[™®]/g, "").replace(/ Elite/, "")}
            </button>
          ))}
        </div>
      )}
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
