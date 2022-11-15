-- CreateTable
CREATE TABLE "request_logs" (
    "id" SERIAL NOT NULL,
    "path" VARCHAR,
    "method" VARCHAR,
    "request_url" VARCHAR,
    "request_body" VARCHAR,
    "is_inbound" BOOLEAN,
    "response_code" INTEGER
);
