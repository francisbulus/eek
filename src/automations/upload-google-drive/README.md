# upload-google-drive-automation

## Endpoint

Endpoint path is `/api/upload-google-drive`

## Input

Endpoint takes the following in the `POST` body:

- `stepRunId`: uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: object having the following required fields:
    - `driveFolderKey`: Id/Key of the Drive Folder to which the file is to be uploaded. Please make sure that this folder is shared with the GOOGLE_ADMIN_EMAIL
    - `fetchHeaders`: (optional) These headers will be passed through when fetching the files (e.g. auth headers required to get the file)
    -  `files`: Array of objects, each object should contain the following: 
        - `url`: URL of the file to be uploaded to GDrive. This must be a publicly accessible link.
        - `fileName`: Name of the file (The file will be stored in the Drive Folder with this name)

For example:
```
{
  "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": {
  	"driveFolderKey" : "15LMOk9Wx9C-b08JstavMtm4ySzbfrx8h",
    "fetchHeaders" : { "Authorization": "Basic 123" },
  	"files": [
  		{"url" : "https://images.sftcdn.net/images/t_app-cover-l,f_auto/p/ce2ece60-9b32-11e6-95ab-00163ed833e7/260663710/the-test-fun-for-friends-screenshot.jpg",  "fileName": "test.jpg"},
  		{"url" : "https://www.orimi.com/pdf-test.pdf",  "fileName": "sample.pdf"},
  		{"url" : "https://w7.pngwing.com/pngs/550/671/png-transparent-computer-icons-test-event-miscellaneous-text-logo.png", "fileName": "xyz.png"}
  	]
  }
}
```

## Output

The output object returned will have the following fields:

-	`stepRunId`: Same as the one sent in request
-	`token`: Same as the one sent in request
-	`data`: Object having the output data. It will have the following fields if successful:
	-	`uploadedFileUrls`: Array of GDrive URLs of the Uploaded files
- `status`: It will be either "done" or "failed"


For example:
```
{
    "stepRunId": "1f06ca82-72b9-409e-8286-c88718bee049",
    "token": "1f06ca82-72b9-409e-8286-c88718bee049",
    "data": {
        "uploadedFileUrls": [
            "https://drive.google.com/file/d/1k2pAOCx45i4H3j1Y2BPv8LtBsWVneLSX",
            "https://drive.google.com/file/d/1u819E0EH0hlN_AZpXznt8vY8l9cYqsBE",
            "https://drive.google.com/file/d/1UxbEkSLgTHEbjUcwB4HqsyamR5JwBtYC"
        ]
    },
    "status": "done"
}
```