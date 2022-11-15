CREATE TABLE public.weekly_offered_slots (
	id serial not null,
	business_external_id int4 NULL,
	party_size int4 NULL,
	slot_check_day day_of_week_names NULL,
	slot_check_time varchar NULL,
	is_available bool NULL,
	check_days int4 NULL,
	check_slots int4 NULL,
	created_on timestamptz NULL,
	updated_on timestamptz NULL,
    deleted_at timestamptz NULL,
	CONSTRAINT weekly_offerd_slots_business_external_id_party_size_slot_ch_key UNIQUE (business_external_id, party_size, slot_check_day, slot_check_time)
);

CREATE INDEX weekly_offered_latest_check ON public.weekly_offered_slots USING btree (business_external_id, party_size);