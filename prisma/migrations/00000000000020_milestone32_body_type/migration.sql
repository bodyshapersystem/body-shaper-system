-- Body Profile™ architecture: single source of truth for body-type
-- classification, set once by the Owner during assessment and read by
-- every downstream experience (Section 01 illustration, Body Profile
-- card, Blueprint PDF, Client Portal, analytics). Never recalculated
-- client-side.

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('hourglass', 'pear', 'apple', 'rectangle', 'inverted_triangle');

-- AlterTable
ALTER TABLE "blueprint_assessments" ADD COLUMN "bodyType" "BodyType";
