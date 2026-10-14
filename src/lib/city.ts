

// Всё, что нужно, чтобы показать город и открыть его страницу.

import { GeoCity } from "./geocoding"

// Подходит и результату геокодинга, и записи из избранного.
export type CityRef = Pick<GeoCity, 'id' | 'name' | 'latitude' | 'longitude' | 'admin1' | 'country'>

// "Варшава, Мазовецкое воеводство, Польша"
export function cityLabel(city: Pick<CityRef, 'name' | 'admin1' | 'country'>) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(', ')
}

export function cityHref(city: CityRef) {
  const params = new URLSearchParams({
    lat: String(city.latitude),
    lon: String(city.longitude),
    name: city.name,
  })
  if (city.admin1) params.set('region', city.admin1)
  if (city.country) params.set('country', city.country)
  return `/city/${city.id}?${params}`
}