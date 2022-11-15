const opentableReservationUrl = (rid: number | string) =>
  `https://www.opentable.com/restref/client/?rid=${rid}`

const opentableRestaurantUrl = (rid: number | string) =>
  `https://www.opentable.com/restaurant/profile/${rid}`

export { opentableReservationUrl, opentableRestaurantUrl }
