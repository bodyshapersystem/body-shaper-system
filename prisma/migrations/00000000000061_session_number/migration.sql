ALTER TABLE "body_measurements" ADD COLUMN IF NOT EXISTS "sessionNumber" INTEGER;
ALTER TABLE "measurements" ADD COLUMN IF NOT EXISTS "sessionNumber" INTEGER;
