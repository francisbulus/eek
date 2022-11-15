ALTER TABLE seateddev.businesses ADD COLUMN cohort_external_id INTEGER;
UPDATE seateddev.businesses SET cohort_external_id = cohort_id;
ALTER TABLE seateddev.businesses ALTER COLUMN cohort_external_id SET NOT NULL;

ALTER TABLE seateddev.cohort_schedules ADD COLUMN cohort_external_id INTEGER;
UPDATE seateddev.cohort_schedules SET cohort_external_id = cohort_id;
ALTER TABLE seateddev.cohort_schedules ALTER COLUMN cohort_external_id SET NOT NULL;

ALTER TABLE seateddev.cohorts ADD COLUMN external_id INTEGER;
UPDATE seateddev.cohorts SET external_id = id;
ALTER TABLE seateddev.cohorts ALTER COLUMN external_id SET NOT NULL;
