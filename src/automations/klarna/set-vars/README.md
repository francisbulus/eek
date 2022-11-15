# klarna/set-vars

## Endpoint

Endpoint path is `/api/klarna/set-vars`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: no data is required

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": { }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: Object having the output data. It will have the following fields if successful:
    - `simpleSpreadsheetUrl`: URL. The URL of the simple spreadsheet template.
    - `completeSpreadsheetUrl`: URL. The URL of the complete spreadsheet template.
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": {
      "simpleSpreadsheetUrl": "https://docs.google.com/spreadsheets/d/10B6cWWXFul7heExZpQmOGTmy1WdZkf1ZVzRY2hkRwM4",
      "completeSpreadsheetUrl": "https://docs.google.com/spreadsheets/d/1yPwhvIOjY1qdRtMZKSrxxf0QQLVHcVQXJnFfRBfZE5w"
    },
    "status": "done"
}
```