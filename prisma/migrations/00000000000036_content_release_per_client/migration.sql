-- Real per-client override: not every Ambassador needs the Content
-- Release Agreement (some are collab-only). Defaults to false for
-- everyone, including all existing clients — nobody is required
-- unless the Owner explicitly turns this on for that client.
ALTER TABLE "clients" ADD COLUMN "requiresContentRelease" BOOLEAN NOT NULL DEFAULT false;
