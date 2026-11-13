"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmSessionsAsPlanned } from "../appointments/actions";

export default function ConfirmAllButton({ ids }: { ids: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="ss-btn ss-btn-light"
      disabled={isPending || done}
      onClick={() =>
        startTransition(async () => {
          await confirmSessionsAsPlanned(ids);
          setDone(true);
          router.refresh();
        })
      }
    >
      {done ? "all confirmed ✓" : isPending ? "confirming…" : "all good — confirm all"}
    </button>
  );
}
