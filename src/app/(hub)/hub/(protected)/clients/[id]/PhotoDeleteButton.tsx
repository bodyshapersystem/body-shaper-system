"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePhoto } from "./blueprint-actions";

export default function PhotoDeleteButton({ photoId }: { photoId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this photo? This can't be undone.")) return;
    startTransition(async () => {
      await deletePhoto(photoId);
      router.refresh();
    });
  }

  return (
    <button type="button" className="bp-photo-delete-btn" onClick={handleDelete} disabled={isPending}>
      {isPending ? "…" : "Delete"}
    </button>
  );
}
