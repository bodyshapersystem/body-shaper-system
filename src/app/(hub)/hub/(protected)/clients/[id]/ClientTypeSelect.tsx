"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setClientType } from "./actions";

export default function ClientTypeSelect({ clientId, clientType }: { clientId: string; clientType: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as "STANDARD" | "VIP" | "AMBASSADOR";
    startTransition(async () => {
      await setClientType(clientId, value);
      router.refresh();
    });
  }

  return (
    <select value={clientType} onChange={handleChange} disabled={isPending} className="sched-select" style={{ width: "auto", padding: "6px 10px", fontSize: 11.5 }}>
      <option value="STANDARD">Standard Client</option>
      <option value="VIP">⭐ VIP Client</option>
      <option value="AMBASSADOR">🤍 Collab / Ambassador</option>
    </select>
  );
}
