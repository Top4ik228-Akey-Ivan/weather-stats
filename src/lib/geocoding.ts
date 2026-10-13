import { fetchJson } from './fetchJson'

export type GeoCity = {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string // регион первого уровня (область, штат), есть не у всех
}

export async function fetchGeocode(query: string, signal?: AbortSignal): Promise<GeoCity[]> {
  const params = new URLSearchParams({
    name: query,
    count: '8',
    language: 'ru',
    format: 'json',
  })
  const data = await fetchJson<{ results?: GeoCity[] }>(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    { signal },
  )
  return data.results ?? [] // ничего не найдено: ключа results нет
}