
import { Forecast } from '../forecast'
import { formatHour } from './format'
import { getNextHours, type Hour } from './hourly'

export type Summary = {
  headline: string // главная фраза: что с осадками в ближайшие часы
  lines: string[] // завтра и советы
}

const WINDOW = 12 // на сколько часов вперёд смотрим; если поменяешь, поправь фразы про «12 часов»

type PrecipKind = 'freezing' | 'storm' | 'snow' | 'rain'

// Порядок важен: если в окне несколько видов осадков, для совета берём самый серьёзный
const PRECIP_ORDER: PrecipKind[] = ['freezing', 'storm', 'snow', 'rain']

const PRECIP_NAME: Record<PrecipKind, string> = {
  freezing: 'Ледяной дождь',
  storm: 'Гроза',
  snow: 'Снег',
  rain: 'Дождь',
}

// Код погоды WMO в вид осадков. null: осадков нет.
function precipKind(code: number): PrecipKind | null {
  if (code === 56 || code === 57 || code === 66 || code === 67) return 'freezing'
  if (code >= 95) return 'storm'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return 'rain'
  return null
}

function buildHeadline(hours: Hour[], kinds: (PrecipKind | null)[]) {
  const first = kinds.findIndex((k) => k !== null)
  const kind = first === -1 ? null : kinds[first]
  if (!kind) return 'В ближайшие 12 часов без осадков'

  const name = PRECIP_NAME[kind]

  // Осадки идут прямо сейчас: когда закончатся?
  if (first === 0) {
    const end = kinds.findIndex((k, i) => i > 0 && k === null)
    return end === -1
      ? `${name} не прекратится в ближайшие 12 часов`
      : `${name} закончится около ${formatHour(hours[end].time)}`
  }

  // Осадки будут позже. Если вероятность во всех «мокрых» часах низкая, говорим осторожнее.
  const wetChances = hours.filter((_, i) => kinds[i] !== null).map((h) => h.rain)
  const unsure = Math.max(...wetChances) < 40
  const when = formatHour(hours[first].time)

  return unsure ? `${name}, вероятно, начнётся около ${when}` : `${name} начнётся около ${when}`
}

function buildTomorrow(daily: Forecast['daily']) {
  if (daily.temperature_2m_max.length < 2) return null
  // сравниваем округлённые значения, чтобы не получилось «на 3° теплее» при реальной разнице в 2,6°
  const diff = Math.round(daily.temperature_2m_max[1]) - Math.round(daily.temperature_2m_max[0])
  if (Math.abs(diff) < 3) return 'Завтра температура примерно как сегодня'
  return `Завтра на ${Math.abs(diff)}° ${diff > 0 ? 'теплее' : 'холоднее'}, чем сегодня`
}

function buildTips(f: Forecast, kinds: (PrecipKind | null)[]) {
  const tips: string[] = []

  // Порядок добавления и есть приоритет: в конце берём первые два
  const worst = PRECIP_ORDER.find((k) => kinds.includes(k))
  if (worst === 'freezing') tips.push('Ледяной дождь: на дорогах и тротуарах скользко.')
  else if (worst === 'storm') tips.push('Во время грозы лучше остаться в помещении.')
  else if (worst === 'snow') tips.push('Пригодится тёплая обувь.')
  else if (worst === 'rain') tips.push('Возьмите зонт.')

  if (f.current.wind_speed_10m >= 35) tips.push('Ветрено: пригодится ветровка.')

  // УФ-индекс актуален только пока светло
  if (f.current.is_day === 1 && Math.round(f.daily.uv_index_max[0]) >= 6) {
    tips.push('Высокий УФ-индекс: не забудьте крем и очки.')
  }

  // Одежда по ощущаемой температуре
  const feels = f.current.apparent_temperature
  if (feels >= 30) tips.push('Жарко: пейте больше воды.')
  else if (feels <= -15) tips.push('Сильный мороз: шапка, перчатки и тёплая куртка.')
  else if (feels <= 0) tips.push('Холодно: нужна тёплая куртка.')
  else if (feels <= 10) tips.push('Прохладно: пригодится куртка.')
  else if (feels <= 18) tips.push('Свежо: подойдёт лёгкая куртка или свитер.')

  return tips.slice(0, 2)
}

export function buildSummary(f: Forecast): Summary | null {
  const hours = getNextHours(f, WINDOW)
  if (hours.length === 0) return null

  // Для текущего часа верим блоку current: он точнее почасовой записи
  const kinds = hours.map((h, i) => precipKind(i === 0 ? f.current.weather_code : h.code))

  const tomorrow = buildTomorrow(f.daily)
  return {
    headline: buildHeadline(hours, kinds),
    lines: [...(tomorrow ? [tomorrow] : []), ...buildTips(f, kinds)],
  }
}