import * as AXIOS from 'axios'
import { get } from 'lodash/fp'

import { IRow } from '../../helpers/arrays'

const axios = AXIOS.default

const LEAD_GEN_ENDPOINT = 'https://pb-lead-gen.vercel.app/api/get_leads'

interface ILeadGenArgs extends IRow {
  company_name: string
  roles?: string
  domain_name: string
  location?: string
}

const getNamesAndRolesForDomains = async (
  stepRunId: number | string,
  token: string | undefined,
  { table }: { table: ILeadGenArgs[] }
) => {
  const messageBody = JSON.stringify({
    input: table,
  })
  return axios
    .post(LEAD_GEN_ENDPOINT, messageBody, {
      headers: {
        Accept: 'application/json',
      },
      params: {
        stepRunId,
        token,
      },
    })
    .then(get('status'))
}

export { getNamesAndRolesForDomains }
