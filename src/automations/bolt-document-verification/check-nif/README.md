# bolt-document-verification/check-nif

## Endpoint

Endpoint path is `/api/bolt-document-verification/check-nif`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `nif`: String. This will hold the Nif (eg: "pass")

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
  	"nif" : "289140307",
  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: Object having the output data. It will have the following fields if successful:
    - `status`: String. This will be the status (eg: "fail")
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": {
      "status": "fail",
    },
    "status": "done"
}
```