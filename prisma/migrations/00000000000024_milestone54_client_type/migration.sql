-- Milestone 54: real Client Type (Standard/Ambassador) — controls
-- whether the Content Release Agreement document appears at all.

CREATE TYPE "ClientType" AS ENUM ('STANDARD', 'AMBASSADOR');
ALTER TABLE "clients" ADD COLUMN "clientType" "ClientType" NOT NULL DEFAULT 'STANDARD';
