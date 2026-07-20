ALTER TABLE "rewards_accounts" ADD COLUMN "societyWelcomeEmailSentAt" TIMESTAMP(3);
ALTER TYPE "EmailTemplate" ADD VALUE 'SOCIETY_WELCOME';
