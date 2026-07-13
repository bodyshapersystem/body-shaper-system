"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSignedLogoUploadUrl, updateBusinessLogo } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoUploadWidget() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    startTransition(async () => {
      const signed = await createSignedLogoUploadUrl(file.name);
      if (signed?.error || !signed?.path || !signed?.token) {
        setError(signed?.error ?? "Could not prepare upload.");
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage.from("client-documents").uploadToSignedUrl(signed.path, signed.token, file);
      if (uploadError) {
        setError(uploadError.message);
        return;
      }
      await updateBusinessLogo(signed.path);
      router.refresh();
    });
  }

  return (
    <label className="dash-view-btn" style={{ cursor: "pointer", display: "inline-block" }}>
      <input type="file" accept="image/*" onChange={handleChange} style={{ display: "none" }} disabled={isPending} />
      {isPending ? "Uploading…" : "Change Logo"}
      {error && <span className="sched-error" style={{ display: "block", marginTop: 4 }}>{error}</span>}
    </label>
  );
}
