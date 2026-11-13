"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinSocietyAsClient } from "@/app/(site)/society/actions";
import { SOCIETY_AGREEMENT_SECTIONS } from "@/lib/society-agreement";

export default function JoinSociety({ levelsText }: { levelsText: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function join() {
    const fd = new FormData();
    if (agree) fd.set("agree", "on");
    setError("");
    startTransition(async () => {
      const r = await joinSocietyAsClient(fd);
      if (r && "error" in r && r.error) return setError(r.error);
      router.refresh();
    });
  }

  return (
    <div className="soc-card">
      <p className="soc-eyebrow">option 2 · shaper society™</p>
      <h3 className="soc-title">Earn money instead</h3>
      <p className="soc-body">Get your own link and earn a percentage of every referral who completes payment for their system — {levelsText}.</p>
      {!open ? (
        <button type="button" className="soc-btn" onClick={() => setOpen(true)}>Join the Shaper Society</button>
      ) : (
        <>
          <div className="soc-agreement">
            {SOCIETY_AGREEMENT_SECTIONS.map((s) => (
              <div key={s.title}>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <label className="soc-check">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I accept the Shaper Society Agreement
          </label>
          {error && <p className="soc-msg">{error}</p>}
          <button type="button" className="soc-btn" disabled={!agree || isPending} onClick={join}>
            {isPending ? "Joining…" : "Join & show my link"}
          </button>
        </>
      )}
    </div>
  );
}
