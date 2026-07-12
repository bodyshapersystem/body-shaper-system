-- Body Shaper System™ BSS Hub — Milestone 17: Clients V2
-- Additive only. Run as one script.

ALTER TABLE "clients" ADD COLUMN "pausedAt" TIMESTAMP(3);

CREATE TABLE "client_notes" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "authorId" TEXT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
