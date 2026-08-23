CREATE TABLE IF NOT EXISTS "peptide_logs" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "peptideName" TEXT NOT NULL,
    "administeredAt" TIMESTAMP(3) NOT NULL,
    "dosage" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "peptide_logs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "peptide_logs" ADD CONSTRAINT "peptide_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
