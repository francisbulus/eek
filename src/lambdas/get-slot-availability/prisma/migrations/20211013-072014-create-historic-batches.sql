CREATE TABLE batches (
  id serial4 NOT NULL,
  check_date date NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_dow "day_of_week_names" NOT NULL,
  check_time varchar NOT NULL,
  cohort_id int4 NOT NULL,
  cohort_external_id int4 NOT NULL,
  function_concurrency int4 NOT NULL DEFAULT 15,
  businesses_per_function int4 NOT NULL DEFAULT 2,
  expected_num_slots int4,
  num_businesses     int4,
  slots_per_run      int4,
  num_party_sizes    int4,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamptz(6) NULL,
  CONSTRAINT batches_pkey PRIMARY KEY (id)
);
CREATE INDEX batches_check_date_check_time_idx ON batches USING btree (check_date, check_time);
CREATE INDEX batches_check_dow_idx ON batches USING btree (check_dow);
CREATE INDEX batches_cohort_external_id_idx ON batches USING btree (cohort_external_id);
CREATE INDEX batches_created_at_idx ON batches USING btree (created_at);
CREATE INDEX batches_deleted_at_idx ON batches USING btree (deleted_at);

INSERT INTO batches (check_date, check_dow, check_time, cohort_id, cohort_external_id)
SELECT date_trunc('day', r.created_at)::date as check_date, r.check_dow, r.check_time, b.cohort_id, b.cohort_external_id
FROM runs r left join businesses b on r.business_id = b.id
WHERE r.created_at > '2021-10-01' -- when we implemented versioned cohorts
GROUP BY date_trunc('day', r.created_at), r.check_dow, r.check_time, b.cohort_id, b.cohort_external_id
ORDER BY date_trunc('day', r.created_at), r.check_time, b.cohort_external_id;

UPDATE batches
SET num_businesses = c
FROM (
  SELECT b.cohort_id, b.cohort_external_id ,COUNT(*) AS c FROM
  businesses b
  GROUP BY b.cohort_id, b.cohort_external_id
) a
WHERE a.cohort_id = batches.cohort_id;

UPDATE batches b
SET slots_per_run = c
FROM (
  SELECT
    c.id,
    cs.check_dow,
    cs.check_time,
    SUM((EXTRACT(epoch FROM cs.slots_end_time::INTERVAL - cs.slots_start_time::INTERVAL)/(15*60)) + 1) AS c
  FROM cohort_schedules cs LEFT JOIN cohorts c ON c.id = cs.cohort_id
  GROUP BY c.id, cs.check_dow, cs.check_time
) a
WHERE a.id = b.cohort_id AND a.check_dow = b.check_dow AND a.check_time = b.check_time;

DELETE FROM batches WHERE slots_per_run IS NULL;

UPDATE batches
SET num_party_sizes = array_length(c.party_sizes, 1)
FROM cohorts c
WHERE c.id = batches.cohort_id;

UPDATE batches
SET expected_num_slots = num_party_sizes * num_businesses * slots_per_run;

ALTER TABLE batches ALTER COLUMN expected_num_slots SET NOT NULL;
ALTER TABLE batches ALTER COLUMN num_businesses SET NOT NULL;
ALTER TABLE batches ALTER COLUMN slots_per_run SET NOT NULL;
ALTER TABLE batches ALTER COLUMN num_party_sizes SET NOT NULL;

ALTER TABLE runs ADD COLUMN batch_id INTEGER,ADD COLUMN cohort_id INTEGER, ADD COLUMN cohort_external_id INTEGER;

UPDATE runs r
SET cohort_id = b.cohort_id, cohort_external_id = b.cohort_external_id
FROM businesses b
WHERE r.business_id = b.id;

ALTER TABLE runs
ADD CONSTRAINT runs_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES cohorts(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE runs
ALTER COLUMN cohort_id SET NOT NULL,
ALTER COLUMN cohort_external_id SET NOT NULL;

-- Also create the proxy weights table

CREATE TABLE proxy_weights (
  id serial4 NOT NULL,
  proxy_provider text NOT NULL,
  relative_weight int4 NOT NULL DEFAULT 1,
  CONSTRAINT proxy_weights_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX proxy_weights_proxy_provider_key ON proxy_weights USING btree (proxy_provider);


INSERT INTO proxy_weights (proxy_provider, relative_weight)
VALUES ('brightdata', 7), ('geosurf', 3);

