-- Add photo support to Partners (Privileges), which had no image field before.
ALTER TABLE "partners" ADD COLUMN "imageStoragePath" TEXT;
