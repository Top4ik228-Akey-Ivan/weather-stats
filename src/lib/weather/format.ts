// Данные в кэше всегда метрические, пересчёт делается только при показе

export const toF = (c: number) => (c * 9) / 5 + 32
export const kmhToMs = (kmh: number) => kmh / 3.6
export const hpaToMmHg = (hpa: number) => hpa * 0.750062

export const formatTemp = (c: number) => `${Math.round(c)}°`
export const formatWind = (kmh: number) => `${Math.round(kmhToMs(kmh))} м/с`
export const formatPressure = (hpa: number) => `${Math.round(hpaToMmHg(hpa))} мм рт. ст.`

// Время из API приходит как местное время города без часового пояса
// ("2026-10-13T14:00"), поэтому Date с часовым поясом устройства не используем

export const formatHour = (time: string) => time.slice(11, 16) // "14:00"

export function formatWeekday(date: string, style: 'short' | 'long' = 'short') {
  return new Intl.DateTimeFormat('ru-RU', { weekday: style, timeZone: 'UTC' }).format(
    new Date(`${date}T12:00:00Z`),
  )
}

export function daylight(sunrise: string, sunset: string) {
  const minutes = Math.round(
    (new Date(`${sunset}Z`).getTime() - new Date(`${sunrise}Z`).getTime()) / 60000,
  )
  return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`
}