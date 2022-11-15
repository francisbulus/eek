# Seed data

<!-- MarkdownTOC -->

- [Seed data](#seed-data)
  - [Exporting from the old seated database](#exporting-from-the-old-seated-database)
    - [General](#general)
    - [Businesses](#businesses)
    - [Updating businesses](#updating-businesses)
    - [Updating cohort schedules](#updating-cohort-schedules)
    - [Updating external_ids](#updating-external_ids)
    - [Migrating Old Cohort schedules (Deprecated)](#migrating-old-cohort-schedules-deprecated)
  - [Running the seed](#running-the-seed)

<!-- /MarkdownTOC -->

<a id="exporting-from-the-old-seated-database"></a>
## Exporting from the old seated database

<a id="general"></a>
### General

When exporting from DBeaver, make sure your settings match these:

| Setting           | Value    |
|:------------------|:---------|
| File extension    | csv      |
| Delimeter         | ,        |
| Row delimiter     | default  |
| Header            | top      |
| Characters escape | quotes   |
| Quote character   | "        |
| Quote always      | disabled |
| Quote never       | []       |
| NULL string       |          |
| Format number     | []       |

<a id="businesses"></a>
### Businesses

Use this query to get the latest businesses from the old seated database

```postgresql
SELECT
  id,
  external_id,
  REPLACE(cohort_id::TEXT, '999', '99999999')::INTEGER AS cohort_id,
  REPLACE(name, '‚Äô', '''') AS name,
  url AS original_url,
  url,
  b.interval AS slot_interval,
  url_id,
  platform_name AS platform,
  latt AS latitude,
  long AS longitude
FROM seated.businesses b
WHERE cohort_id <> 888 AND deleted_at IS NULL
ORDER BY id;
```

<a id="updating-businesses"></a>
### Updating businesses

1. Get a CSV of the new businesses in the format found in `businesses-update.csv`
  a. Rename columns to match what is in `businesses-update.csv` exactly. `business_id` should be `external_id`, `cohort_id` should be `cohort_external_id`
  b. Ensure that platform is all lowercase (no `OpenTable` or `SevenRooms`)
  c. Ensure that the timezone column is either `America/New_York` (Eastern Time) or `America/Chicago` (Central Time).
  d. Ensure that city column is all lowercase and spaces should be replaced with underscore e.g (`New York City` should be `new_york_city`)
  e. Delete any extraneous columns and rows
  f. In google sheets, click File -> Download -> CSV
  g. Copy this file over to `prisma/data/businesses-update.csv`
2. cd `src/lambdas/get-slot-availability`. Then run `TS_NODE_FILES=true ts-node -T prisma/updateBusinesses.ts` locally. This will scrape any new restaurants. It will also update the cohort ids, and remove any restaurants that are no longer in cohort 4 or 5. This will take a few minutes, depending on how many new restaurants there are to scrape.
3. Export your local `businesses` table to `prisma/data/businesses.csv`
3. Set `SEATED_DATABASE_URL` in your `.env` to point to production (`seatedSta` on scalegrid). Then run `TS_NODE_FILES=true ts-node -T prisma/upsertBusinesses.ts`. This will upsert the businesses to the production database.

<a id="updating-cohort-schedules"></a>
### Updating cohort schedules

1. Get a CSV of the new cohort schedules, matching the format in cohortSchedules.csv
  a. Ensure that the `check_time`, `slots_start_time`, `slots_end_time` columns are zero padded in the `HH:mm` format, so 8:00 would become `08:00`.
  b. Ensure that `check_dow` and `slots_dow` columns are lowercase
  c. Copy the file into `prisma/data/cohortSchedules.csv`
2. Check that your `.env` has `SEATED_DATABASE_URL` set to localhost. Then, cd `src/lambdas/get-slot-availability` and run `TS_NODE_FILES=true ts-node -T prisma/seedCohortSchedules.ts`. It will drop the existing cohort schedules and create new ones.
3. Once you ensure that it worked as intended, Set `SEATED_DATABASE_URL` in your `.env` to point to production (`seatedSta` on scalegrid). Then run the script again. This will update the production database.
4. Comment out the SEATED_DATABASE_URL in your `.env` so as to restore using your localhost.
5. Lastly, create a new branch in git, add the new csv, commit it, and submit a pull request.
   
<a id="updating-external-ids"></a>
### Updating external_ids 
Get a CSV of the external id update sheet, matching the format in external-id-update.csv
   - Ensure the old_external_ids come before the new_external_ids
   - cd `src/lambdas/get-slot-availability` and run `TS_NODE_FILES=true ts-node -T prisma/updateExtId.ts`

<a id="migrating-old-cohort-schedules-deprecated"></a>
### Migrating Old Cohort schedules (Deprecated)

Cohort schedules are a bit of a pain because we're moving from a nested JSON object to a flattened table

Use this query

```postgresql
SELECT
  id,
  name,
  REPLACE(schedule::TEXT ,E'\n',' ') AS schedule
FROM seated.cohorts
ORDER BY id;
```

When exporting from DBeaver, change these settings from the ones given above

| Setting           | Value    |
|:------------------|:---------|
| Characters escape | escape   |
| Quote character   | '        |


Export the results as CSV to `oldCohorts.csv` then manually run the function `convertOldSchedules()`

<a id="running-the-seed"></a>
## Running the seed

You can omit the `prisma db push` if you already have the latest database structure

```bash
prisma db push && TS_NODE_FILES=true ts-node -T prisma/seed.ts
```
