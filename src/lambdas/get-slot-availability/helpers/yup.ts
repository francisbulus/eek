import * as yup from 'yup'

const inputYupSchema = yup
  .object({
    batch_id: yup.number().required(),
    business_id: yup.number().required(),
    party_size: yup.number().required(),
    slots_date: yup.string().required(),
    slots_start_time: yup.string().required(),
    slots_end_time: yup.string().required(),
    check_dow: yup.string().required(),
    check_time: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    business_id: yup.number().required(), // because we can't serialize a bigint for transport, yet
    business_name: yup.string().required(),
    interval: yup.number().required(),
    time_of_check: yup.string().required(),
    site_checked: yup.string().required(),
    data: yup
      .array()
      .of(
        yup
          .object({
            party_size: yup.number().required(),
            slots: yup
              .array()
              .of(
                yup.object({
                  slot_date: yup.string().required(),
                  available: yup.boolean().required(),
                })
              )
              .required(),
          })
          .required()
      )
      .required(),
  })
  .required()

export { inputYupSchema, outputYupSchema }
