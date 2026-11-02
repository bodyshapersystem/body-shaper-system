CREATE TABLE IF NOT EXISTS "instagram_connections" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "igUserId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "refreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastError" TEXT,
  CONSTRAINT "instagram_connections_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "instagram_connections" ENABLE ROW LEVEL SECURITY;
