-- AlterTable
ALTER TABLE "request_logs"
ALTER COLUMN "request_body" TYPE "jsonb"
USING "request_body"::"jsonb";
