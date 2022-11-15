-- CreateEnum
CREATE TYPE "day_of_week_names" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "audit_statuses" AS ENUM ('pending', 'processing', 'success', 'failure');

-- CreateEnum
CREATE TYPE "scrape_statuses" AS ENUM ('pending', 'processing', 'success', 'failure', 'done_incomplete');

-- CreateEnum
CREATE TYPE "upload_statuses" AS ENUM ('pending', 'processing', 'success', 'failure');

-- CreateTable
CREATE TABLE "batches" (
    "id" SERIAL NOT NULL,
    "check_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_dow" "day_of_week_names" NOT NULL,
    "check_time" VARCHAR NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "cohort_external_id" INTEGER NOT NULL,
    "function_concurrency" INTEGER NOT NULL DEFAULT 15,
    "businesses_per_function" INTEGER NOT NULL DEFAULT 2,
    "expected_num_slots" INTEGER NOT NULL,
    "num_businesses" INTEGER NOT NULL,
    "slots_per_run" INTEGER NOT NULL,
    "num_party_sizes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "test_mode" BOOLEAN DEFAULT false,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" SERIAL NOT NULL,
    "external_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "original_url" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "slot_interval" INTEGER NOT NULL DEFAULT 15,
    "url_slug" VARCHAR,
    "url_id" VARCHAR,
    "platform" VARCHAR NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" VARCHAR NOT NULL DEFAULT E'America/New_York',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "cohort_external_id" INTEGER NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "city" VARCHAR,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "slot_interval" INTEGER NOT NULL DEFAULT 15,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "external_id" INTEGER NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "party_sizes" INTEGER[],

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_schedules" (
    "id" SERIAL NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "check_dow" "day_of_week_names" NOT NULL,
    "check_time" VARCHAR NOT NULL,
    "slots_dow" "day_of_week_names" NOT NULL,
    "slots_start_time" VARCHAR NOT NULL,
    "slots_end_time" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "cohort_external_id" INTEGER NOT NULL,
    "archived_at" TIMESTAMPTZ(6),

    CONSTRAINT "cohort_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "check_dow" "day_of_week_names" NOT NULL,
    "check_time" VARCHAR NOT NULL,
    "party_size" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "payload" JSON,
    "scrape_error" VARCHAR,
    "scrape_status" "scrape_statuses" NOT NULL DEFAULT E'pending',
    "upload_error" VARCHAR,
    "upload_status" "upload_statuses" DEFAULT E'pending',
    "uploaded_at" TIMESTAMPTZ(6),
    "report_sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "test_mode" BOOLEAN DEFAULT false,
    "actual_num_slots" INTEGER,
    "expected_num_slots" INTEGER,
    "available_num_slots" INTEGER,
    "batch_id" INTEGER,
    "cohort_id" INTEGER NOT NULL,
    "cohort_external_id" INTEGER NOT NULL,
    "retry_count" INTEGER,
    "no_of_requests" INTEGER,
    "full_payload" JSON,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slots" (
    "id" SERIAL NOT NULL,
    "run_id" INTEGER NOT NULL,
    "party_size" INTEGER NOT NULL,
    "slot_datetime" TIMESTAMPTZ(6) NOT NULL,
    "availability" BOOLEAN,
    "audit_flag" BOOLEAN NOT NULL DEFAULT false,
    "audit_status" "audit_statuses" NOT NULL DEFAULT E'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offered_slots" (
    "id" SERIAL NOT NULL,
    "run_id" INTEGER NOT NULL,
    "business_id" INTEGER NOT NULL,
    "check_dow" "day_of_week_names" NOT NULL,
    "check_time" VARCHAR NOT NULL,
    "party_size" INTEGER NOT NULL,
    "slot_datetime" TIMESTAMPTZ(6) NOT NULL,
    "availability" BOOLEAN,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "offered_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_offered_slots" (
    "id" SERIAL NOT NULL,
    "business_external_id" INTEGER,
    "party_size" INTEGER,
    "slot_check_day" "day_of_week_names",
    "slot_check_time" VARCHAR,
    "is_available" BOOLEAN,
    "check_days" INTEGER,
    "check_slots" INTEGER,
    "created_on" TIMESTAMPTZ(6),
    "updated_on" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "weekly_offered_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "slot_id" INTEGER NOT NULL,
    "run_id" INTEGER NOT NULL,
    "api_auth_token" TEXT,
    "api_request" VARCHAR,
    "api_response" JSON,
    "api_http_status" INTEGER,
    "api_error" VARCHAR,
    "proxy_service" TEXT,
    "proxy_trial" INTEGER,
    "proxy_address" TEXT,
    "proxy_ip" TEXT,
    "test_mode" BOOLEAN NOT NULL DEFAULT false,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seated_ Cohort Schedules (Last updated 10_27) - 10_28" (
    "id" INTEGER,
    "external_id" INTEGER,
    "check_dow" TEXT,
    "check_time" TEXT,
    "slots_dow" TEXT,
    "slots_start_time" TEXT,
    "slots_end_time" TEXT
);

-- CreateTable
CREATE TABLE "salesforce_business" (
    "salesforce_id" VARCHAR,
    "business_id" INTEGER,
    "id" SERIAL NOT NULL,

    CONSTRAINT "salesforce_business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "booking_id" INTEGER NOT NULL,
    "business_external_id" INTEGER NOT NULL,
    "platform" VARCHAR NOT NULL,
    "first_name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "phone" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "slot_time" VARCHAR NOT NULL,
    "slot_date" DATE NOT NULL,
    "party_size" SMALLINT NOT NULL,
    "created_on" TIMESTAMPTZ(6) NOT NULL,
    "updated_on" TIMESTAMPTZ(6) NOT NULL,
    "booking_done_on" TIMESTAMPTZ(6),
    "confirmation_url" VARCHAR,
    "booking_ref" VARCHAR,
    "cancelled_on" TIMESTAMPTZ(6),
    "status" VARCHAR NOT NULL,
    "step_data_dump" JSONB,
    "credit_card_id" INTEGER,
    "raw_request" JSONB,
    "seated_response" JSONB,
    "email_active" BOOLEAN DEFAULT true,
    "email_content" JSONB DEFAULT E'{}',

    CONSTRAINT "booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "credit_card" (
    "id" SERIAL NOT NULL,
    "city" VARCHAR NOT NULL,
    "first_name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "exp_month" SMALLINT NOT NULL,
    "exp_year" SMALLINT NOT NULL,
    "card_no" VARCHAR NOT NULL,
    "cvc" SMALLINT NOT NULL,
    "zip" INTEGER,
    "weight" SMALLINT,

    CONSTRAINT "credit_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pgbench_accounts" (
    "aid" INTEGER NOT NULL,
    "bid" INTEGER,
    "abalance" INTEGER,
    "filler" CHAR(84),

    CONSTRAINT "pgbench_accounts_pkey" PRIMARY KEY ("aid")
);

-- CreateTable
CREATE TABLE "pgbench_branches" (
    "bid" INTEGER NOT NULL,
    "bbalance" INTEGER,
    "filler" CHAR(88),

    CONSTRAINT "pgbench_branches_pkey" PRIMARY KEY ("bid")
);

-- CreateTable
CREATE TABLE "pgbench_history" (
    "tid" INTEGER,
    "bid" INTEGER,
    "aid" INTEGER,
    "delta" INTEGER,
    "mtime" TIMESTAMP(6),
    "filler" CHAR(22)
);

-- CreateTable
CREATE TABLE "pgbench_tellers" (
    "tid" INTEGER NOT NULL,
    "bid" INTEGER,
    "tbalance" INTEGER,
    "filler" CHAR(84),

    CONSTRAINT "pgbench_tellers_pkey" PRIMARY KEY ("tid")
);

-- CreateIndex
CREATE INDEX "batches_check_date_check_time_idx" ON "batches"("check_date", "check_time");

-- CreateIndex
CREATE INDEX "batches_check_dow_idx" ON "batches"("check_dow");

-- CreateIndex
CREATE INDEX "batches_cohort_external_id_idx" ON "batches"("cohort_external_id");

-- CreateIndex
CREATE INDEX "batches_created_at_idx" ON "batches"("created_at");

-- CreateIndex
CREATE INDEX "batches_deleted_at_idx" ON "batches"("deleted_at");

-- CreateIndex
CREATE INDEX "businesses_archived_at" ON "businesses"("archived_at");

-- CreateIndex
CREATE INDEX "businesses_cohort_external_id" ON "businesses"("cohort_external_id");

-- CreateIndex
CREATE INDEX "businesses_cohort_id" ON "businesses"("cohort_id");

-- CreateIndex
CREATE INDEX "businesses_created_at" ON "businesses"("created_at");

-- CreateIndex
CREATE INDEX "businesses_deleted_at" ON "businesses"("deleted_at");

-- CreateIndex
CREATE INDEX "businesses_external_id" ON "businesses"("external_id");

-- CreateIndex
CREATE INDEX "businesses_platform" ON "businesses"("platform");

-- CreateIndex
CREATE INDEX "businesses_updated_at" ON "businesses"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_cohort_id_external_id" ON "businesses"("cohort_id", "external_id");

-- CreateIndex
CREATE INDEX "cohort_archived_at" ON "cohorts"("archived_at");

-- CreateIndex
CREATE INDEX "cohort_external_id" ON "cohorts"("external_id");

-- CreateIndex
CREATE INDEX "cohort_schedules_archived_at" ON "cohort_schedules"("archived_at");

-- CreateIndex
CREATE INDEX "cohort_schedules_check_dow_check_time" ON "cohort_schedules"("check_dow", "check_time");

-- CreateIndex
CREATE INDEX "schedules_cohort_external_id" ON "cohort_schedules"("cohort_external_id");

-- CreateIndex
CREATE INDEX "runs_business_id" ON "runs"("business_id");

-- CreateIndex
CREATE INDEX "runs_check_dow_check_time" ON "runs"("check_dow", "check_time");

-- CreateIndex
CREATE INDEX "runs_created_at" ON "runs"("created_at");

-- CreateIndex
CREATE INDEX "runs_deleted_at" ON "runs"("deleted_at");

-- CreateIndex
CREATE INDEX "runs_scrape_status_upload_status" ON "runs"("scrape_status", "upload_status");

-- CreateIndex
CREATE INDEX "runs_test_mode" ON "runs"("test_mode");

-- CreateIndex
CREATE INDEX "runs_updated_at" ON "runs"("updated_at");

-- CreateIndex
CREATE INDEX "slots_created_at" ON "slots"("created_at");

-- CreateIndex
CREATE INDEX "slots_deleted_at" ON "slots"("deleted_at");

-- CreateIndex
CREATE INDEX "slots_run_id" ON "slots"("run_id");

-- CreateIndex
CREATE INDEX "offered_slots_check_dow" ON "offered_slots"("check_dow");

-- CreateIndex
CREATE INDEX "offered_slots_created_at" ON "offered_slots"("created_at");

-- CreateIndex
CREATE INDEX "offered_slots_latest_row_id" ON "offered_slots"("business_id", "check_dow", "check_time", "party_size", "deleted_at");

-- CreateIndex
CREATE INDEX "offered_slots_run_id" ON "offered_slots"("business_id", "check_dow", "check_time", "party_size");

-- CreateIndex
CREATE INDEX "weekly_offered_latest_check" ON "weekly_offered_slots"("business_external_id", "party_size");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_offerd_slots_business_external_id_party_size_slot_ch_key" ON "weekly_offered_slots"("business_external_id", "party_size", "slot_check_day", "slot_check_time");

-- CreateIndex
CREATE INDEX "requests_api_http_status" ON "requests"("api_http_status");

-- CreateIndex
CREATE INDEX "requests_created_at" ON "requests"("created_at");

-- CreateIndex
CREATE INDEX "requests_proxy_service_proxy_trial" ON "requests"("proxy_service", "proxy_trial");

-- CreateIndex
CREATE INDEX "requests_run_id" ON "requests"("run_id");

-- CreateIndex
CREATE INDEX "requests_slot_id" ON "requests"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_business_unique" ON "salesforce_business"("salesforce_id", "business_id");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_schedules" ADD CONSTRAINT "cohort_schedules_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_slots" ADD CONSTRAINT "offered_slots_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
