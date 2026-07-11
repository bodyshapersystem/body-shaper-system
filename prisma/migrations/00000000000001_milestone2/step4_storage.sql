-- Body Shaper System™ BSS Hub — Milestone 2, STEP 4 of 4
-- Run this AFTER step3_rls.sql.
-- Creates the private Storage bucket the Documents module uploads
-- into. No public/anon storage policies are needed: all access goes
-- through the app's Supabase admin (service_role) client, which
-- bypasses Storage RLS the same way Prisma bypasses table RLS — the
-- app's own permission checks (documents.manage / signed-in client
-- owns the row) are what gate access, not bucket policies.

INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;
