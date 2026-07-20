"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRequiresContentRelease } from "./actions";

export default function RequiresContentReleaseToggle({ clientId, value }: { clientId: string; value: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      await setRequiresContentRelease(clientId, checked);
      router.refresh();
    });
  }

  return (
    <label className="cl-subtle-action" style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
      <input type="checkbox" checked={value} disabled={isPending} onChange={(e) => handleChange(e.target.checked)} />
      Needs Content Release Agreement
    </label>
  );
}
