# delete-gcloud-storage-automation

## Endpoint

Endpoint path is `/api/delete-gcloud-storage`

## Inputs

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `objectURLs`: Array of URLS of the GCloud Storage Object files to be deleted

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
  	"objectURLs": ["https://storage.cloud.google.com/staging.trim-opus-258420.appspot.com/Test_File%20(Just%201232_122%20some%20test)-XD.png?authuser=2", "https://storage.cloud.google.com/staging.trim-opus-258420.appspot.com/Test_File%20(Just%201232_123%20some%20test)-XD.png?authuser=2"]
  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: Object having the output data. It will have the following fields if successful:
	-	`result`: Just a string saying "Deleted!"
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": {
        "result": "Deleted!"
    },
    "status": "done"
}
```