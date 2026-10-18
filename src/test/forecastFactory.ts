import { Forecast } from "@/lib/forecast"


export const NOW_INDEX = 10 // 10:00 первого дня в почасовых массивах

const HOURS = 24 * 7
const START = Date.UTC(2026, 9, 14) // 14 октября 2026, 00:00
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 16) // "2026-10-14T10:00"

const hourTimes = Array.from({ length: HOURS }, (_, i) => iso(START + i * 3_600_000))
const dayDates = Array.from({ length: 7 }, (_, i) => iso(START + i * 86_400_000).slice(0, 10))

// Массив из 7 значений: первое отдельно, остальные одинаковые
export const week = (first: number, rest = 3) => [first, ...Array.from({ length: 6 }, () => rest)]

type Overrides = {
  timezone?: string
  current?: Partial<Forecast['current']>
  hourly?: Partial<Forecast['hourly']>
  daily?: Partial<Forecast['daily']>
}

export function makeForecast(o: Overrides = {}): Forecast {
  return {
    timezone: o.timezone ?? 'Europe/Warsaw',
    current: {
      time: '2026-10-14T10:15',
      temperature_2m: 20,
      apparent_temperature: 20,
      relative_humidity_2m: 60,
      is_day: 1,
      weather_code: 3,
      pressure_msl: 1015,
      wind_speed_10m: 10,
      ...o.current,
    },
    hourly: {
      time: [...hourTimes],
      temperature_2m: hourTimes.map(() => 20),
      precipitation_probability: hourTimes.map(() => 0),
      weather_code: hourTimes.map(() => 3),
      ...o.hourly,
    },
    daily: {
      time: [...dayDates],
      weather_code: dayDates.map(() => 3),
      temperature_2m_max: dayDates.map(() => 22),
      temperature_2m_min: dayDates.map(() => 12),
      sunrise: dayDates.map((d) => `${d}T06:30`),
      sunset: dayDates.map((d) => `${d}T17:30`),
      uv_index_max: dayDates.map(() => 3),
      precipitation_probability_max: dayDates.map(() => 0),
      ...o.daily,
    },
  }
}

type HourPatch = {
  weather_code?: number
  precipitation_probability?: number
  temperature_2m?: number
}

// Меняет часы с индекса from по to включительно
export function patchHours(f: Forecast, from: number, to: number, patch: HourPatch) {
  for (let i = from; i <= to; i++) {
    if (patch.weather_code !== undefined) f.hourly.weather_code[i] = patch.weather_code
    if (patch.precipitation_probability !== undefined) {
      f.hourly.precipitation_probability[i] = patch.precipitation_probability
    }
    if (patch.temperature_2m !== undefined) f.hourly.temperature_2m[i] = patch.temperature_2m
  }
  return f
}