-- Body Shaper System™ BSS Hub — Milestone 1 initial schema
-- Run this once, in full, in Supabase's dashboard: SQL Editor -> New query -> paste -> Run.
-- This matches prisma/schema.prisma exactly.

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INVITED');

CREATE TYPE "LeadStatus" AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'CONSULTATION_SCHEDULED',
  'PAYMENT_PENDING',
  'PAYMENT_CONFIRMED',
  'LOST',
  'ARCHIVED'
);

CREATE TABLE "roles" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "permissions" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "role_permissions" (
  "roleId" TEXT NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
  "permissionId" TEXT NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
  PRIMARY KEY ("roleId", "permissionId")
);

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "authUserId" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "fullName" TEXT NOT NULL,
  "roleId" TEXT NOT NULL REFERENCES "roles"("id"),
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT,
  "lastLoginAt" TIMESTAMP(3)
);

CREATE TABLE "leads" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "city" TEXT,
  "goals" TEXT,
  "source" TEXT,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "timeline" TEXT,
  "internalNotes" TEXT,
  "bodyBlueprint" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT REFERENCES "users"("id"),
  "archivedAt" TIMESTAMP(3)
);

CREATE TABLE "lead_status_history" (
  "id" TEXT PRIMARY KEY,
  "leadId" TEXT NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
  "fromStatus" "LeadStatus",
  "toStatus" "LeadStatus" NOT NULL,
  "note" TEXT,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "changedById" TEXT REFERENCES "users"("id")
);

CREATE TABLE "lead_email_log" (
  "id" TEXT PRIMARY KEY,
  "leadId" TEXT NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
  "subject" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sequenceKey" TEXT
);

-- Seed the initial role set (names only — permissions are assigned
-- separately below). New roles can be added later with a simple
-- INSERT, never a code change.
INSERT INTO "roles" ("id", "name", "description", "updatedAt") VALUES
  ('role_owner', 'Owner', 'Full access to everything.', CURRENT_TIMESTAMP),
  ('role_admin', 'Admin', 'Administrative access.', CURRENT_TIMESTAMP),
  ('role_manager', 'Manager', 'Manages day-to-day operations.', CURRENT_TIMESTAMP),
  ('role_specialist', 'Specialist', 'Delivers treatments, views assigned clients.', CURRENT_TIMESTAMP),
  ('role_assistant', 'Assistant', 'Supports scheduling and admin tasks.', CURRENT_TIMESTAMP),
  ('role_marketing', 'Marketing', 'Manages leads and campaigns.', CURRENT_TIMESTAMP),
  ('role_client', 'Client', 'Portal access only.', CURRENT_TIMESTAMP);

-- Seed the initial permission set for the Leads module (Milestone 1
-- scope). More permissions get added as later milestones ship
-- modules — this list is not meant to be exhaustive yet.
INSERT INTO "permissions" ("id", "key", "description") VALUES
  ('perm_leads_view', 'leads.view', 'View leads'),
  ('perm_leads_create', 'leads.create', 'Create leads'),
  ('perm_leads_edit', 'leads.edit', 'Edit lead details and status'),
  ('perm_leads_archive', 'leads.archive', 'Archive leads'),
  ('perm_hub_access', 'hub.access', 'Access the BSS Hub at all');

-- Owner gets every permission that exists so far.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT 'role_owner', "id" FROM "permissions";

-- Admin and Manager also get full Leads + Hub access for now.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "roles" r, "permissions" p
WHERE r."id" IN ('role_admin', 'role_manager');

-- Marketing gets Leads access + Hub access, but not archive (example
-- of role-differentiated permissions — adjust anytime via SQL/UI,
-- never by shipping code).
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT 'role_marketing', "id" FROM "permissions"
WHERE "key" IN ('leads.view', 'leads.create', 'leads.edit', 'hub.access');
