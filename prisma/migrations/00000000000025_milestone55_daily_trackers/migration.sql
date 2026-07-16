-- Milestone 55: real Daily Trackers™ — replaces the fully-fake stub
-- page. One row per client per calendar day, all manual entry (no
-- RENPHO/smartwatch integration per direction).

CREATE TABLE "daily_trackers" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "waterGlasses" INTEGER NOT NULL DEFAULT 0,
  "steps" INTEGER,
  "stepsGoal" INTEGER NOT NULL DEFAULT 8000,
  "sleepHours" DOUBLE PRECISION,
  "sleepQuality" TEXT,
  "compressionWorn" BOOLEAN,
  "compressionHours" DOUBLE PRECISION,
  "moodCheckIn" TEXT,
  "moodNote" TEXT,
  "symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "dailyNote" TEXT,
  "weightLbs" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "daily_trackers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_trackers_clientId_date_key" ON "daily_trackers"("clientId", "date");
CREATE INDEX "daily_trackers_clientId_idx" ON "daily_trackers"("clientId");

ALTER TABLE "daily_trackers" ADD CONSTRAINT "daily_trackers_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
