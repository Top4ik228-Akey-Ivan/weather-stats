import { Forecast } from "../forecast"


export type Hour = {
  time: string // "2026-10-14T15:00", местное время города
  temp: number
  code: number
  rain: number // вероятность осадков, %
  isDay: boolean
}

// День или ночь в конкретный час: сравниваем строки времени с рассветом и закатом того же дня.
// Формат ISO сравнивается как обычные строки, Date и часовые пояса не нужны.
function isDayAt(time: string, daily: Forecast['daily']) {
  const i = daily.time.indexOf(time.slice(0, 10))
  if (i === -1) return true
  return time >= daily.sunrise[i] && time < daily.sunset[i]
}

export function getNextHours(f: Forecast, count = 24): Hour[] {
  const h = f.hourly
  const nowHour = f.current.time.slice(0, 13) // "2026-10-14T13"
  const found = h.time.findIndex((t) => t.slice(0, 13) >= nowHour)
  const start = Math.max(found, 0)

  return h.time.slice(start, start + count).map((time, k) => {
    const i = start + k
    return {
      time,
      temp: h.temperature_2m[i],
      code: h.weather_code[i],
      rain: h.precipitation_probability[i],
      isDay: isDayAt(time, f.daily),
    }
  })
}