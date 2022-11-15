# Duplicate Check Automation
Run duplicate check against the existing baseRunVariables of a baseVariable

## Sample Payload
```json
URL: /api/duplicate-check
Method: POST

{
    "stepRunId": "2709f929-2172-4d98-9061-328d2dc32ccd",
    "data": {
        "records": [
                        {
                "Case ID": "4324jnj2344",
                "Case Number": "332432",
                "Case Owner": "Unassigned Cases",
            },
             {
                "Case ID": "98u98ufw2133",
                "Case Number": "4324423",
                "Case Owner": "Unassigned Cases",
            }
        ],
        "duplicate_check_config": {
            "baseVariableID": "3149d8d2-7bcc-40ff-a8fc-0b3688e341c8",
            "record_key": "Case ID",
        }
    }
}
```

- records - Array of records
- duplicate_check_config
  - baseVariableID - baseVariable against which duplicate check need to be done
  - record_key - Object lookup key in the records


## Sample Response
```json
URL: /api/duplicate-check/
{
    "stepRunId": "2709f929-2172-4d98-9061-328d2dc32ccd",
    "data": {
        "duplicateRecords": [
            {
                "Case ID": "4324jnj2344",
                "Case Number": "332432",
                "Case Owner": "Unassigned Cases",
            }
        ],
        "duplicateRecordsCount": 1,
        "nonDuplicateRecords": [
            {
                "Case ID": "98u98ufw2133",
                "Case Number": "4324423",
                "Case Owner": "Unassigned Cases",
            }
        ],
        "nonDuplicateRecordsCount": 1
    },
    "status": "done"
}

```

## Note
- Only Support exact string matching currently
- AND operation for multiple baseVariable can be done using multiple DuplicateCheck Steps in process

## TODO
- Add support for JSON, Number and Boolean Fields
