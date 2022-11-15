ALTER TABLE runs
ADD COLUMN retry_count INTEGER null,
ADD COLUMN no_of_requests INTEGER null;
