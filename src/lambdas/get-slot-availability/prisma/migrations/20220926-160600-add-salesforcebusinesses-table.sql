CREATE TABLE public.salesforce_business (
	salesforce_id varchar NULL,
	business_id int4 NULL
);
CREATE UNIQUE INDEX salesforce_business_unique ON public.salesforce_business USING btree (salesforce_id, business_id);