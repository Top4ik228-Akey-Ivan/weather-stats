import { fetchJson } from './fetchJson'

const CURRENT = ['temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
  'is_day', 'weather_code', 'pressure_msl', 'wind_speed_10m']
const HOURLY = ['temperature_2m', 'precipitation_probability', 'weather_code']
const DAILY = ['weather_code', 'temperature_2m_max', 'temperature_2m_min',
  'sunrise', 'sunset', 'uv_index_max', 'precipitation_probability_max']

export type Forecast = {
  timezone: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    is_day: number
    weather_code: number
    pressure_msl: number
    wind_speed_10m: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation_probability: number[]
    weather_code: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    sunrise: string[]
    sunset: string[]
    uv_index_max: number[]
    precipitation_probability_max: number[]
  }
}

export function fetchForecast(lat: number, lon: number, days = 7, signal?: AbortSignal) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: CURRENT.join(','),
    hourly: HOURLY.join(','),
    daily: DAILY.join(','),
    timezone: 'auto',
    forecast_days: String(days),
  })
  return fetchJson<Forecast>(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal,
    next: { revalidate: 600 }, // серверный кэш на 10 минут; в браузере поле игнорируется
  })
}