ALTER TABLE cohorts ADD COLUMN party_sizes_2 integer[];
UPDATE cohorts SET party_sizes_2 = '{2,4,6}' WHERE party_sizes::text = '"[2,4,6]"';
UPDATE cohorts SET party_sizes_2 = '{2,4}' WHERE party_sizes_2 IS NULL;
ALTER TABLE cohorts DROP COLUMN party_sizes;
ALTER TABLE cohorts RENAME COLUMN party_sizes_2 TO party_sizes;

ALTER TABLE cohorts ALTER COLUMN party_sizes SET DEFAULT '{2,4}';
ALTER TABLE cohorts ALTER COLUMN party_sizes SET NOT NULL;

SELECT id,party_sizes,array_length(party_sizes, 1) FROM cohorts;
