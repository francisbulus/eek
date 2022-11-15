# klarna/sort-final-deliverable-sheet

## Endpoint

Endpoint path is `/api/klarna/sort-final-deliverable-sheet`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `spreadsheetUrl`: String. URL of the spreadsheet to append the website to.

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
    "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/2xPwhvIOjY1qdRtMZKSrxxf0QQLVHcVQXJnFfRBfZE5w",
  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: No data is returned
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