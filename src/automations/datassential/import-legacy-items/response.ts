import * as AXIOS from 'axios'

const axios = AXIOS.default

const LEGACY_ITEMS_ENDPOINT = 'http://35.184.27.251/api/legacy-items'

const getRestaurantLegacyItems = async ({ restCode }: { restCode: string }) => {
  return axios.get(LEGACY_ITEMS_ENDPOINT, {
    headers: {
      Accept: 'application/json',
    },
    params: {
      rest_code: restCode,
    },
  })
}

export { getRestaurantLegacyItems }
