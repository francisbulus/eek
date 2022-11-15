# klarna/append-website-to-final-deliverable-sheet

## Endpoint

Endpoint path is `/api/klarna/append-website-to-final-deliverable-sheet`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `spreadsheetUrl`: String. URL of the spreadsheet to append the website to.
    - `brand`: String. Brand associated to the website.
    - `url`: String. URL of the website.
    - `country`: String. Country associated to the website.
    - `productDisplayPage`: Array of strings. Providers appearing in the product display pages.
    - `checkout`: Array of strings. Providers appearing in the checkout.
    - `type`: String. Type of report.

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
    "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/2xPwhvIOjY1qdRtMZKSrxxf0QQLVHcVQXJnFfRBfZE5w",
    "brand": "Blubery Apparel",
    "url": "https://www.blubery.com.br",
  	"country" : "BRA",
    "productDisplayPage": ["paypal", "klarna"],
    "checkout": ["paypal", "venmo", "klarna"]
  }
}
```

## Output

The output object returned will have the following fields:

- `stepRunId`: Same as the one sent in request
- `token`: Same as the one sent in request
- `data`: No data is returned
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