import axios from 'axios'

import { IRow, ITable } from '../../helpers/arrays'
import { formatAbbreviations } from './helpers'

type ValidAddress = {
  isValid: boolean
  formattedAddress?: string
}

const GOOGLE_MAP_API = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY
const stateAndPinRegex = /([A-Za-z]{2}[ ]\d{5})/g

const validateAddressString = (address: string): boolean => stateAndPinRegex.test(address)

function validatePostalCode(invalidAddress: string, formattedAddress: string): boolean {
  const received_code = formattedAddress.match(stateAndPinRegex)
  const unvalid_code = invalidAddress.match(stateAndPinRegex)
  if (
    received_code &&
    unvalid_code &&
    received_code[0].toUpperCase() === unvalid_code[0].toUpperCase()
  ) {
    return true
  }
  return false
}

async function validateFromGoogle(address: string): Promise<ValidAddress> {
  let valid = false
  let formattedAdd = 'Not Found'
  const isValidString = validateAddressString(address)
  if (isValidString) {
    try {
      const response = await axios.get(GOOGLE_MAP_API, {
        params: {
          fields: 'formatted_address',
          inputtype: 'textquery',
          language: 'en',
          input: address,
          key: GOOGLE_MAP_API_KEY,
        },
      })
      const data = await response.data
      if (data.status === 'OK') {
        formattedAdd = data.candidates[0].formatted_address as string
        valid = validatePostalCode(address, formattedAdd)
        formattedAdd = formatAbbreviations(formattedAdd)
      }
      if (data.status === 'ZERO_RESULTS') {
        formattedAdd = 'No match found on Google'
      }
      throw 'Unobserved error'
    } catch (err: any) {}
  }
  return { isValid: valid, formattedAddress: formattedAdd }
}

async function validateAddress(addressRow: IRow): Promise<IRow> {
  const { isValid, formattedAddress } = await validateFromGoogle(
    addressRow['Unvalidated Address'] as string
  )
  return {
    'Unvalidated Address': addressRow['Unvalidated Address'],
    Status: isValid ? 'Valid' : 'Invalid',
    'Formatted Address': formattedAddress,
  }
}

async function validateAddresses({ arrayInput }: { arrayInput: ITable }): Promise<ITable> {
  const results: ITable = []
  for (let i = 0; i < arrayInput.length; i++) {
    const validatedData = await validateAddress(arrayInput[i])
    results.push(validatedData)
  }

  return results
}

export { validateAddresses }
