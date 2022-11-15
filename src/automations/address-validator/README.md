# Address Validator for Process Builder

This is an automation process to validate the addresses given from an array of address objects. The process iterates through an array of unvalidated address objects & sends a request for each invalid address string to the Google Maps API to get some valid information about the address as response.


### Input

```js
[
  {
    'Unvalidated Address': '1320 Kershaw Loop - Unit 210, Fayatteville, NC 28314',
  },
  {
    'Unvalidated Address': "132 O'Neil St, Kingston, NY 12401,",
  },
  {
    'Unvalidated Address': '159 Desimone Dr, Maryville, TN 37801',
  },
  {
    'Unvalidated Address': '3 Hook Rd - Unit 63F Poughkeepsie, NY 12601',
  },
  {
    'Unvalidated Address': '2077 Couty Rd 1, Westtown, NY 10998',
  },
  {
    'Unvalidated Address': '776 Route 284, Westtown, NY 10998',
  },
  {
    'Unvalidated Address': '2097 County Route 1, Westtown, NY 10998',
  },
]
```


### Output

```js
[
  {
    'Unvalidated Address': '1320 Kershaw Loop - Unit 210, Fayatteville, NC 28314',
    Status: 'Valid',
    'Formatted Address': '1320 Kershaw Loop APT 210, Fayetteville, NC 28314, USA',
  },
  {
    'Unvalidated Address': "132 O'Neil St, Kingston, NY 12401,",
    Status: 'Valid',
    'Formatted Address': '132 Oneil St, Kingston, NY 12401, USA',
  },
  {
    'Unvalidated Address': '159 Desimone Dr, Maryville, TN 37801',
    Status: 'Valid',
    'Formatted Address': '159 Desimone Dr, Maryville, TN 37801, USA',
  },
  {
    'Unvalidated Address': '3 Hook Rd - Unit 63F Poughkeepsie, NY 12601',
    Status: 'Valid',
    'Formatted Address': '3 Hook Rd #63f, Poughkeepsie, NY 12601, USA',
  },
  {
    'Unvalidated Address': '2077 Couty Rd 1, Westtown, NY 10998',
    Status: 'Invalid',
    'Formatted Address': 'US-1, United States',
  },
  {
    'Unvalidated Address': '776 Route 284, Westtown, NY 10998',
    Status: 'Valid',
    'Formatted Address': '776 NY-284, Westtown, NY 10998, USA',
  },
  {
    'Unvalidated Address': '2097 County Route 1, Westtown, NY 10998',
    Status: 'Invalid',
    'Formatted Address': 'County Rte 1, Warwick, NY 10990, USA',
  },
]
```