# bolt-document-verification/set-rejection-reason

## Endpoint

Endpoint path is `/api/bolt-document-verification/set-rejection-reason`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `criminalRecordStatus`: String. This will hold the status of the Criminal Record check (eg: "pass")
    - `ibanStatus`: String. This will the status of Iban Proof check (eg: "pass")
    - `selfEmploymentStatus`: String. This will the status of status (eg: "fail")
    - `checkIdStatus`: String. This will the status of failureReason (eg: "unknown")
    - `checkIdFailureReason`: String. This will the status of failureReason (eg: "")

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
  	"criminalRecordStatus" : "pass",
  	"ibanStatus" : "pass",
  	"selfEmploymentStatus" : "fail",
  	"checkIdStatus" : "unknown",
  	"checkIdFailureReason" : "",
  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: Object having the output data. It will have the following fields if successful:
    - `status`: String. This will be the status (eg: "fail")
    - `failureReason`: String. This will hold the failure reason (eg: "Self-Employment check failed")
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": {
      "status": "fail",
      "failureReason": "Self-Employment check failed",
    },
    "status": "done"
}
```