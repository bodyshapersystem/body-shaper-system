-- Body Shaper System™ BSS Hub — Milestone 2, STEP 2 of 2
-- Run this AFTER step1_enum.sql has finished and committed.
-- Adds: Client conversion, Body Blueprint versioning, Measurements
-- (RENPHO-ready manual entry), Documents, Messages, Rewards, Portal
-- invitations. Matches prisma/schema.prisma exactly.

-- ---------- New enums ----------

CREATE TYPE "PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'CONFIRMED', 'REFUNDED');
CREATE TYPE "PortalStatus" AS ENUM ('INVITATION_PENDING', 'ACTIVE', 'SUSPENDED');
CREATE TYPE "SenderType" AS ENUM ('OWNER', 'CLIENT');

-- ---------- Clients ----------
-- The permanent client record. Created exactly once per person, from
-- an idempotent Lead -> Client conversion. Links to the same Lead
-- (never duplicated) and to the User row that owns portal login.

CREATE TABLE "clients" (
  "id" TEXT PRIMARY KEY,
  "leadId" TEXT NOT NULL UNIQUE REFERENCES "leads"("id"),
  "userId" TEXT NOT NULL UNIQUE REFERENCES "users"("id"),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "city" TEXT,
  "membershipTier" TEXT NOT NULL DEFAULT 'Standard',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT REFERENCES "users"("id"),
  "archivedAt" TIMESTAMP(3)
);

-- ---------- Body Blueprint (versioned — never overwritten) ----------

CREATE TABLE "body_blueprints" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "version" INTEGER NOT NULL,
  "goals" TEXT,
  "treatmentInterests" TEXT,
  "recommendedSystem" TEXT,
  "formAnswers" JSONB,
  "internalNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT REFERENCES "users"("id"),
  UNIQUE ("clientId", "version")
);

-- ---------- Measurements (manual entry now, RENPHO-shaped fields) ----------
-- Every scan is a new row. Nothing is ever updated in place.

CREATE TABLE "measurements" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "scanDate" TIMESTAMP(3) NOT NULL,
  "weightKg" DOUBLE PRECISION,
  "bodyFatPercent" DOUBLE PRECISION,
  "muscleMassKg" DOUBLE PRECISION,
  "bodyWaterPercent" DOUBLE PRECISION,
  "bmi" DOUBLE PRECISION,
  "visceralFat" DOUBLE PRECISION,
  "boneMassKg" DOUBLE PRECISION,
  "bmr" INTEGER,
  "bodyAge" INTEGER,
  "deviceSource" TEXT NOT NULL DEFAULT 'RENPHO Health',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT REFERENCES "users"("id")
);

-- ---------- Documents ----------
-- Files live in Supabase Storage; this table is metadata only.

CREATE TABLE "documents" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "fileType" TEXT,
  "sizeBytes" INTEGER,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "uploadedById" TEXT REFERENCES "users"("id")
);

-- ---------- Messages (one thread per client) ----------

CREATE TABLE "message_threads" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL UNIQUE REFERENCES "clients"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "messages" (
  "id" TEXT PRIMARY KEY,
  "threadId" TEXT NOT NULL REFERENCES "message_threads"("id") ON DELETE CASCADE,
  "senderType" "SenderType" NOT NULL,
  "senderUserId" TEXT REFERENCES "users"("id"),
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3)
);

-- ---------- Rewards ----------

CREATE TABLE "rewards_accounts" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL UNIQUE REFERENCES "clients"("id") ON DELETE CASCADE,
  "pointsBalance" INTEGER NOT NULL DEFAULT 0,
  "tier" TEXT NOT NULL DEFAULT 'Standard',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ---------- Portal activation invitations ----------

CREATE TABLE "portal_invitations" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL UNIQUE REFERENCES "clients"("id") ON DELETE CASCADE,
  "token" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- users: portal status (Client-role users only) ----------

ALTER TABLE "users" ADD COLUMN "portalStatus" "PortalStatus";

-- ---------- leads: split name -> firstName/lastName, add payment + conversion tracking ----------
-- Safe 3-step alter: add nullable columns, backfill from existing
-- data, then enforce NOT NULL. No existing lead data is lost — this
-- assumes "name" was "First Last"; anything without a space becomes
-- firstName only + empty lastName (reviewable/editable in the UI).

ALTER TABLE "leads" ADD COLUMN "firstName" TEXT;
ALTER TABLE "leads" ADD COLUMN "lastName" TEXT;

UPDATE "leads" SET
  "firstName" = split_part("name", ' ', 1),
  "lastName"  = CASE
    WHEN position(' ' in "name") > 0
    THEN trim(substring("name" from position(' ' in "name") + 1))
    ELSE ''
  END
WHERE "firstName" IS NULL;

ALTER TABLE "leads" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "leads" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "leads" DROP COLUMN "name";

ALTER TABLE "leads" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED';
ALTER TABLE "leads" ADD COLUMN "convertedAt" TIMESTAMP(3);
-- Note: there is no leads.convertedClientId column. The single source
-- of truth for "has this lead converted?" is clients.leadId (unique,
-- FK to leads.id) — look it up there, or via Prisma's Lead.convertedClient
-- relation. This avoids two FKs pointing at the same fact.

-- ---------- New permissions for Milestone 2 modules ----------

INSERT INTO "permissions" ("id", "key", "description") VALUES
  ('perm_clients_view', 'clients.view', 'View client records'),
  ('perm_clients_edit', 'clients.edit', 'Edit client records'),
  ('perm_clients_convert', 'clients.convert', 'Convert a lead into a client'),
  ('perm_blueprints_manage', 'blueprints.manage', 'Create/edit Body Blueprints'),
  ('perm_measurements_manage', 'measurements.manage', 'Record client measurements'),
  ('perm_documents_manage', 'documents.manage', 'Upload/manage client documents'),
  ('perm_messages_manage', 'messages.manage', 'Send/view client messages')
ON CONFLICT ("key") DO NOTHING;

-- Owner gets every permission that exists so far (same pattern as init).
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT 'role_owner', "id" FROM "permissions"
ON CONFLICT DO NOTHING;

-- Admin and Manager also get full access to the new modules.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "roles" r, "permissions" p
WHERE r."id" IN ('role_admin', 'role_manager')
  AND p."key" IN (
    'clients.view', 'clients.edit', 'clients.convert',
    'blueprints.manage', 'measurements.manage',
    'documents.manage', 'messages.manage'
  )
ON CONFLICT DO NOTHING;
