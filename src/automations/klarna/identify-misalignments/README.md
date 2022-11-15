# klarna/identify-misalignments

## Endpoint

Endpoint path is `/api/klarna/identify-misalignments`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `productDisplayPage1`: Array of strings. Providers appearing in the product display pages (Agent 1).
    - `checkout1`: Array of strings. Providers appearing in the checkout (Agent 1).
    - `productDisplayPage2`: Array of strings. Providers appearing in the product display pages (Agent 2).
    - `checkout2`: Array of strings. Providers appearing in the checkout (Agent 2).

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
    "productDisplayPage1": ["paypal", "klarna"],
    "checkout1": ["paypal", "venmo", "klarna"],
    "productDisplayPage2": ["paypal", "venmo"],
    "checkout2": ["paypal", "venmo", "klarna"]
  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: Object having the output data. It will have the following fields if successful:
    - `productDisplayPageMatches`: Array of booleans. Providers appearing in both agents scraping of the product display page.
    - `checkoutMatches`: Array of booleans. Providers appearing in both agents scraping of the checkout.
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": {
      "productDisplayPageMatches": [true, false],
      "checkoutMatches": [true, true, true]
    },
    "status": "done"
}
```