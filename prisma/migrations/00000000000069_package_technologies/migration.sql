-- Hub-only package tracker: per-technology session totals for the
-- client's current package, e.g. [{"name":"EMS™","total":2},{"name":"Exilis Elite™","total":6}]
ALTER TABLE "blueprint_assessments" ADD COLUMN IF NOT EXISTS "packageTechnologies" JSONB;
