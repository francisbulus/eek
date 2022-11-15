CREATE TABLE public.offered_slots (
	id serial4 NOT NULL,
	run_id int4 NOT NULL,
	business_id int4 NOT NULL,
	check_dow "day_of_week_names" NOT NULL,
  	check_time varchar NOT NULL,
	party_size int4 NOT NULL,
	slot_datetime timestamptz(6) NOT NULL,
	availability bool NULL,
	created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at timestamptz(6) NULL,
	CONSTRAINT offered_slots_pkey PRIMARY KEY (id),
	CONSTRAINT offered_slots_run_id_fkey FOREIGN KEY (run_id) REFERENCES public.runs(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX offered_slots_created_at ON public.offered_slots USING btree (created_at);

CREATE INDEX offered_slots_deleted_at ON public.offered_slots USING btree (deleted_at);

CREATE INDEX offered_slots_run_id ON public.offered_slots USING btree (business_id,check_dow,check_time,party_size);
