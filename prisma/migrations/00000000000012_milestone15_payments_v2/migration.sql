-- Body Shaper System™ BSS Hub — Milestone 15: Payments V2
-- Additive only. Run as one script.

CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'INSTALLMENT', 'FULL_PAYMENT', 'CUSTOM_AMOUNT', 'REFUND', 'ADJUSTMENT');
CREATE TYPE "PaymentOrigin" AS ENUM ('CLIENT_PAYMENT', 'AMBASSADOR', 'INFLUENCER_COLLABORATION', 'PARTNER', 'INTERNAL_ADJUSTMENT');

ALTER TABLE "payments" ADD COLUMN "paymentType" "PaymentType";
ALTER TABLE "payments" ADD COLUMN "origin" "PaymentOrigin" NOT NULL DEFAULT 'CLIENT_PAYMENT';
ALTER TABLE "payments" ADD COLUMN "reference" TEXT;

ALTER TABLE "blueprint_assessments" ADD COLUMN "planTotalCents" INTEGER;

ALTER TABLE "business_settings" ADD COLUMN "fullPaymentDiscountCents" INTEGER;
