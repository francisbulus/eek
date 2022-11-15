# create-google-doc-automation

## Endpoint

Endpoint path is `/api/create-google-doc`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `driveFolderKey`: Id/Key of the Drive Folder to which the file is to be uploaded. Please make sure that this folder is shared with the GOOGLE_ADMIN_EMAIL
    - `content`: String. This will be the exact content that will be dumped into the Google Doc that's created
    - `title`: String. This will the the Title & Name of the Google Doc that's created.

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
  	"driveFolderKey" : "15LMOk9Wx9C-b08JstavMtm4ySzbfrx8h",
  	"content": "Test content blah blah",
  	"title": "My Test Doc"
  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: Object having the output data. It will have the following fields if successful:
	-	`uploadedFileUrl`: URL of the GDoc File created
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": {
        "uploadedFileUrl": "https://docs.google.com/document/d/1NtnrWOP9b3Ghk8Gj2gbj3njyLL2PlhDTj-g2RFWaFAM"
    },
    "status": "done"
}
```