"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinSocietyAsClient } from "@/app/(site)/society/actions";
import { SOCIETY_AGREEMENT_SECTIONS } from "@/lib/society-agreement";

export default function JoinSociety() {
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

  if (!open) {
    return (
      <button type="button" className="ss-btn ss-btn-light" onClick={() => setOpen(true)}>
        choose money →
      </button>
    );
  }
  return (
    <div className="ss-join">
      <p className="ss-label ss-label-dark">before you join — the short version</p>
      <div className="soc-agreement">
        {SOCIETY_AGREEMENT_SECTIONS.map((s) => (
          <div key={s.title}>
            <h4>{s.title}</h4>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
      <label className="ss-check">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I accept the Shaper Society Agreement
      </label>
      {error && <p className="soc-msg ss-on-dark">{error}</p>}
      <button type="button" className="ss-btn ss-btn-light" disabled={!agree || isPending} onClick={join}>
        {isPending ? "joining…" : "join & get my link"}
      </button>
    </div>
  );
}
