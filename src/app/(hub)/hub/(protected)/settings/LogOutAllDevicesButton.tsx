"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearTotpCookie } from "../../login/actions";

export default function LogOutAllDevicesButton() {
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    if (!confirm("Sign out of all devices, including this one?")) return;
    setIsPending(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut({ scope: "global" });
    await clearTotpCookie();
    setDone(true);
    window.location.href = "/hub/login";
  }

  return (
    <button type="button" className="dash-view-btn" onClick={handleClick} disabled={isPending}>
      {done ? "Signing out…" : isPending ? "Signing out…" : "Log Out All Devices"}
    </button>
  );
}
