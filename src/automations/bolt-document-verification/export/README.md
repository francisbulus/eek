# bolt-document-verification/export

## Endpoint

Endpoint path is `/api/bolt-document-verification/export`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `spreadsheetUrl`: URL. This will hold the name of the target country (eg: "https://docs.google.com/spreadsheets/d/1Z6DP0hmB2gArRLV36fp_AQqeSKSVw3koALEyLeTVS_E/edit#gid=220556780")
    - `nif`: String. This will hold the name of the target country (eg: "304394017")
    - `status`: String. This will hold the final status of the verification (eg: "fail")
    - `failureReason`: String. This will hold the name of the target country (eg: "Check Id Back failed")

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
  	"spreadsheetUrl" : "https://docs.google.com/spreadsheets/d/1Z6DP0hmB2gArRLV36fp_AQqeSKSVw3koALEyLeTVS_E/edit#gid=220556780",
  	"nif" : "304394017",
  	"status" : "fail",
  	"failureReason" : "Check Id Back failed",
  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: No data is returned.
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": { },
    "status": "done"
}
```