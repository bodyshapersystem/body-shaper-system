-- Body Shaper System™ BSS Hub — Milestone 10: Owner Hub V1
-- Run as one script. All new tables/types — no ALTER TYPE ADD VALUE,
-- so no multi-step split needed.

CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'OTHER');
CREATE TYPE "PaymentRecordStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');

CREATE TABLE "rewards_transactions" (
  "id" TEXT PRIMARY KEY,
  "rewardsAccountId" TEXT NOT NULL REFERENCES "rewards_accounts"("id") ON DELETE CASCADE,
  "points" INTEGER NOT NULL,
  "action" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT
);

CREATE TABLE "appointments" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3),
  "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT
);

CREATE TABLE "payments" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "amountCents" INTEGER NOT NULL,
  "method" "PaymentMethod" NOT NULL DEFAULT 'CARD',
  "status" "PaymentRecordStatus" NOT NULL DEFAULT 'PENDING',
  "paidAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT
);

CREATE TABLE "business_settings" (
  "id" TEXT PRIMARY KEY DEFAULT 'default',
  "businessName" TEXT NOT NULL DEFAULT 'Body Shaper System™',
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "address" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

INSERT INTO "business_settings" ("id", "businessName", "updatedAt")
VALUES ('default', 'Body Shaper System™', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- ---------- New permissions for the new modules ----------

INSERT INTO "permissions" ("id", "key", "description") VALUES
  ('perm_appointments_manage', 'appointments.manage', 'Create/edit/cancel appointments'),
  ('perm_payments_manage', 'payments.manage', 'Record and manage payments'),
  ('perm_rewards_manage', 'rewards.manage', 'Adjust client rewards points'),
  ('perm_settings_manage', 'settings.manage', 'Edit business settings')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT 'role_owner', "id" FROM "permissions"
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "roles" r, "permissions" p
WHERE r."id" IN ('role_admin', 'role_manager')
  AND p."key" IN ('appointments.manage', 'payments.manage', 'rewards.manage', 'settings.manage')
ON CONFLICT DO NOTHING;
