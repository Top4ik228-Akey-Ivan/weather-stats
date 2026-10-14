import { GeoCity } from "./geocoding"


// "Варшава, Мазовецкое воеводство, Польша"
export function cityLabel(city: Pick<GeoCity, 'name' | 'admin1' | 'country'>) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(', ')
}

// Для MVP кладём всё нужное в адрес: страница города не должна искать город заново
export function cityHref(city: GeoCity) {
  const params = new URLSearchParams({
    lat: String(city.latitude),
    lon: String(city.longitude),
    name: city.name,
  })
  if (city.admin1) params.set('region', city.admin1)
  if (city.country) params.set('country', city.country)
  return `/city/${city.id}?${params}`
}