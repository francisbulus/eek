# bolt-document-verification/import-new-verifications

## Endpoint

Endpoint path is `/api/bolt-document-verification/import-new-verifications`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `spreadsheetUrl`: URL. The URL of the spreadsheet to be scraped (eg: "https://docs.google.com/spreadsheets/d/1Z6DP0hmB2gArRLV36fp_AQqeSKSVw3koALEyLeTVS_E/edit#gid=220556780")

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
  	"spreadsheetUrl" : "https://docs.google.com/spreadsheets/d/1Z6DP0hmB2gArRLV36fp_AQqeSKSVw3koALEyLeTVS_E/edit#gid=220556780",
  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: Object having the output data. It will have the following fields if successful:
    - `type`: String. Type of the verification (eg: "fleet").
    - `name`: String. Candidate's name (eg: "John").
    - `surname`: String. Candidate's surname (eg: "Doe").
    - `email`: String. Candidate's email (eg: "john.doe@example.com").
    - `phone`: String. Candidate's phone (eg: "+351911111111").
    - `nif`: String. Candidate's nif (eg: "304394017").
    - `accountRecipient`: String. Candidate's account recipient (eg: "John Doe").
    - `selfieWithId`: URL. The URL of the selfie with ID picture (eg: "https://s3.amazonaws.com/formaloo-en/selfieWithId.jpeg").
    - `idFront`: URL. The URL of the front of the ID (eg: "https://s3.amazonaws.com/formaloo-en/idFront.jpeg").
    - `idBack`: URL. The URL of the back of the ID (eg: "https://s3.amazonaws.com/formaloo-en/idBack.jpeg").
    - `criminalRecordURL`: URL. The URL of the criminal record URL (eg: "https://registocriminal.justica.gov.pt/consulta-de-certificado-do-registo-criminal?&info=&codigo_acesso=0000-0000-0000-00000").
    - `selfEmploymentDoc`: URL. The URL of the self employment document (eg: "https://s3.amazonaws.com/formaloo-en/selfEmploymentDoc.jpeg").
    - `iban`: String. The IBAN number (eg: "PT50000000000000000000000").
    - `ibanProof`: URL. The URL of the Iban Proof (eg: "https://s3.amazonaws.com/formaloo-en/ibanProof.jpeg").
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": {
      "type": "fleet",
      "name": "John",
      "surname": "Doe",
      "email": "john.doe@example.com",
      "phone": "+351911111111",
      "nif": "304394017",
      "accountRecipient": "John Doe",
      "selfieWithId": "https://s3.amazonaws.com/formaloo-en/selfieWithId.jpeg",
      "idFront": "https://s3.amazonaws.com/formaloo-en/idFront.jpeg",
      "idBack": "https://s3.amazonaws.com/formaloo-en/idBack.jpeg",
      "criminalRecordURL": "https://registocriminal.justica.gov.pt/consulta-de-certificado-do-registo-criminal?&info=&codigo_acesso=0000-0000-0000-00000",
      "selfEmploymentDoc": "https://s3.amazonaws.com/formaloo-en/selfEmploymentDoc.jpeg",
      "iban": "PT50000000000000000000000",
      "ibanProof": "https://s3.amazonaws.com/formaloo-en/ibanProof.jpeg",
    },
    "status": "done"
}
```