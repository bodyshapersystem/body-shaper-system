-- Body Shaper System™ BSS Hub — Milestone 30: Teams™ permission keys
-- Additive only. Adds the 3 permission keys that didn't exist yet
-- (Dashboard/Analytics/Team weren't individually gated before).
-- Grants them to Owner and Admin roles by default so nobody currently
-- using the Hub loses access; other roles start unchecked and the
-- Owner can toggle them on from the new Teams™ permissions panel.

INSERT INTO "permissions" ("id", "key", "description", "createdAt")
VALUES
  (gen_random_uuid()::text, 'dashboard.view', 'View the Owner Hub dashboard', now()),
  (gen_random_uuid()::text, 'analytics.view', 'View Analytics™', now()),
  (gen_random_uuid()::text, 'team.manage', 'View the Teams™ page', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT r.id, p.id
FROM "roles" r, "permissions" p
WHERE r.name IN ('Owner', 'Admin')
  AND p.key IN ('dashboard.view', 'analytics.view', 'team.manage')
ON CONFLICT DO NOTHING;
