# Get Slot Availability (aka scraping for Seated)

<!-- MarkdownTOC -->

- [Development and setup](#development-and-setup)
- [Overall architecture](#overall-architecture)
- [Execution](#execution)

<!-- /MarkdownTOC -->


<a id="development-and-setup"></a>
## Development and setup

1. `prisma db push` (must have postgres running locally, with a schema called `seateddev`)
2. `TS_NODE_FILES=true ts-node -T src/lambdas/get-slot-availability/prisma/seed.ts`


<a id="overall-architecture"></a>
## Overall architecture

https://console.cloud.google.com/home/dashboard?project=fifth-flash-317915

- The actual scraping occurs on [Vercel](https://vercel.com/invisible-tech/process-automation). Each Vercel function invocation has a maximum execution time of 15 minutes, so we have to limit how many restaurants and slots each function invocation scrapes. However, we also want to take advantage
- It uses our [proxy](http://proxy.inv.tech:22999) which is hosted in [Google Cloud](https://console.cloud.google.com/home/dashboard?project=invisible-superproxy). Our proxy is simply a gateway to Brightdata and Geosurf proxies
- The execution of a batch is managed by a cron job on a Google Cloud instance [here](https://console.cloud.google.com/home/dashboard?project=fifth-flash-317915) on the instance `seated-instance-1`
- The end of run reports and end of day reports are sent from cron jobs on a different Google Clound Instance [here](https://console.cloud.google.com/compute/instances?project=solo-instance&authuser=2). You must be logged in as solo@invisible.email to access.

<a id="execution"></a>
## Execution


1. `run-for-cohort`

POST to this endpoint to run the scrape for the given businesses. Most likely, you will need to specify the `external_id` of the businesses (probably don't want to do more than 4 in a single Vercel instance, because of the 15 minute maximum execution time).

2. `run-multi`

This is a command line script to run a batch. It splits up requests across multiple vercel instances. The `functionConcurrency` argument determines how many Vercel instances to run at once, and the `businessesPerFunction` determines how many businesses to run per instance.

This is executed every hour by a cron job on `seated-instance-1` in Google Cloud.

2. `resend-failed-uploads`

You shouldn't need to use this, as failed uploads are automatically retried. But, if for some reason the uploads have reached the maximum retries and still need to be sent, simply POST to this endpoint.

3. `activate-killswitch`

POST to this endpoints to immediately stop any currently running batches and prevent any new ones from being created. You should really only use this in emergency situations, like when we have an infinite loop or have overrun the database connection pool.

Batches will have to be manually restarted after being killed like this.

4. `deactivate-killswitch`

POST here to reset the killswitch. This will not restart the batches. Any batches will have to be restarted manually.

5. `count-for-cohort`

A command line script to output the number of slots the script will scrape for a given day of the week, based on the current cohorts.

