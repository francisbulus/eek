# klarna/modify-array

## Endpoint

Endpoint path is `/api/klarna/modify-array`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `arr`: Array of Objects. Original array of objects data to be modified.
    - `append`: Array of Object. Object containing the fields to be appended to the original array.
      - `field`: String. Name of the field to be appended.
      - `value`: String. Value to be appended.

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
    "arr": [
      {
        "URL": "https://www.blubery.com.br",
        "Brand": "Blubery Apparel"
      },
      {
        "URL": "https://www.bluenile.com",
        "Brand": "bluenile" 
      }
    ],
    "append": [
      {
        "field": "finalDeliverableSheet",
        "value": "https://docs.google.com/spreadsheets/d/2xPwhvIOjY1qdRtMZKSrxxf0QQLVHcVQXJnFfRBfZE5w",
      },
      {
        "field": "market",
        "value": "USA",
      }
    ]

  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: Object having the output data. It will have the following fields if successful:
    - `output`: Array of objects. Modified array of objects.
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": {
        "output": [
            {
                "URL": "https://www.blubery.com.br",
                "Brand": "Blubery Apparel",
                "finalDeliverableSheet": "https://docs.google.com/spreadsheets/d/2xPwhvIOjY1qdRtMZKSrxxf0QQLVHcVQXJnFfRBfZE5w",
                "market": "USA"
            },
            {
                "URL": "https://www.bluenile.com",
                "Brand": "bluenile",
                "finalDeliverableSheet": "https://docs.google.com/spreadsheets/d/2xPwhvIOjY1qdRtMZKSrxxf0QQLVHcVQXJnFfRBfZE5w",
                "market": "USA"
            }
        ]
    },
    "status": "done"
}
```