import { fetchJson } from './fetchJson'

export type AirQuality = {
  current: { european_aqi: number; pm10: number; pm2_5: number }
}

export function fetchAir(lat: number, lon: number, signal?: AbortSignal) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'european_aqi,pm10,pm2_5',
  })
  return fetchJson<AirQuality>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
    { signal },
  )
}