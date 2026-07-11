-- Body Shaper System™ BSS Hub — Milestone 2, STEP 3 of 3
-- Run this AFTER step2_tables.sql.
--
-- IMPORTANT CONTEXT (read before running):
-- This app's Hub and Prisma queries connect to Supabase via
-- DATABASE_URL/DIRECT_URL, which uses a Postgres role that BYPASSES
-- Row Level Security entirely (this is normal/expected for a direct
-- Postgres connection string, not a PostgREST/anon-key connection).
-- That means these RLS policies do NOT protect data accessed through
-- the Hub's server actions today — that protection currently comes
-- from application-level checks (every portal query is written to
-- filter by the signed-in client's own id, never a client-supplied
-- id). These RLS policies are still valuable as defense-in-depth,
-- and they matter directly for anything that queries Supabase via
-- supabase-js with the anon key (e.g. future realtime messaging).
-- Enabling them now costs nothing and protects the future.

ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "body_blueprints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "measurements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_threads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rewards_accounts" ENABLE ROW LEVEL SECURITY;

-- A client may select their own client row (matched via the users
-- table's authUserId, which equals auth.uid() for the signed-in session).
CREATE POLICY "clients_select_own" ON "clients"
  FOR SELECT USING (
    "userId" IN (SELECT "id" FROM "users" WHERE "authUserId" = auth.uid())
  );

CREATE POLICY "body_blueprints_select_own" ON "body_blueprints"
  FOR SELECT USING (
    "clientId" IN (
      SELECT "id" FROM "clients" WHERE "userId" IN (
        SELECT "id" FROM "users" WHERE "authUserId" = auth.uid()
      )
    )
  );

CREATE POLICY "measurements_select_own" ON "measurements"
  FOR SELECT USING (
    "clientId" IN (
      SELECT "id" FROM "clients" WHERE "userId" IN (
        SELECT "id" FROM "users" WHERE "authUserId" = auth.uid()
      )
    )
  );

CREATE POLICY "documents_select_own" ON "documents"
  FOR SELECT USING (
    "clientId" IN (
      SELECT "id" FROM "clients" WHERE "userId" IN (
        SELECT "id" FROM "users" WHERE "authUserId" = auth.uid()
      )
    )
  );

CREATE POLICY "message_threads_select_own" ON "message_threads"
  FOR SELECT USING (
    "clientId" IN (
      SELECT "id" FROM "clients" WHERE "userId" IN (
        SELECT "id" FROM "users" WHERE "authUserId" = auth.uid()
      )
    )
  );

CREATE POLICY "messages_select_own" ON "messages"
  FOR SELECT USING (
    "threadId" IN (
      SELECT mt."id" FROM "message_threads" mt
      JOIN "clients" c ON c."id" = mt."clientId"
      WHERE c."userId" IN (SELECT "id" FROM "users" WHERE "authUserId" = auth.uid())
    )
  );

-- A client may insert a reply into their own thread only.
CREATE POLICY "messages_insert_own" ON "messages"
  FOR INSERT WITH CHECK (
    "threadId" IN (
      SELECT mt."id" FROM "message_threads" mt
      JOIN "clients" c ON c."id" = mt."clientId"
      WHERE c."userId" IN (SELECT "id" FROM "users" WHERE "authUserId" = auth.uid())
    )
  );

CREATE POLICY "rewards_accounts_select_own" ON "rewards_accounts"
  FOR SELECT USING (
    "clientId" IN (
      SELECT "id" FROM "clients" WHERE "userId" IN (
        SELECT "id" FROM "users" WHERE "authUserId" = auth.uid()
      )
    )
  );

-- Note: no policies are defined for the Hub/Owner side on purpose.
-- Hub access goes through Prisma (bypasses RLS) and is gated by the
-- application-level role/permission check in getCurrentHubUser() +
-- hasPermission(), not by these policies.
