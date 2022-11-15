type Competitor =
  | 'Glovo'
  | 'Wolt'
  | 'Damejidlo'
  | 'Foodora'
  | 'Jumiafood'
  | 'MrDFood'
  | 'Pyszne'
  | 'Tazz'
  | 'Ubereats'

type GlovoResponseBody = {
  restaurantName: string
  address: string
  restaurantStatus: string
  rating?: string
}

type GlovoResponse = GlovoResponseBody | number

type WoltResponse = {
  restaurantName: string
  address: { streetAddress: string; city: string }
  restaurantStatus: string
  rating?: number
}

type DamejidloResponse = {
  restaurantName: string
  address: { streetAddress: string; city: string }
  restaurantStatus: string
  rating?: number
}

type FoodoraResponse = {
  restaurantName: string
  address: string
  restaurantStatus: string
  rating?: number
}

type JumiafoodResponse = {
  restaurantName: string
  address: string
  restaurantStatus: string
  rating?: number
}

type MrDFoodResponse = {
  restaurantName: string
  address: { street_name: string; street_number: string; suburb: string; town: string }
  restaurantStatus: string
  rating?: number
}

type PyszneResponse = {
  restaurantName: string
  address: string
  restaurantStatus: string
  rating?: number
}

type TazzResponse = {
  restaurantName: string
  address?: { fullAddress?: string | null }
  restaurantStatus: string
  rating?: number
}

type UbereatsResponse = {
  restaurantName: string
  address: string
  restaurantStatus: string
  rating?: number
}

export type {
  Competitor,
  DamejidloResponse,
  FoodoraResponse,
  GlovoResponse,
  GlovoResponseBody,
  JumiafoodResponse,
  MrDFoodResponse,
  PyszneResponse,
  TazzResponse,
  UbereatsResponse,
  WoltResponse,
}
