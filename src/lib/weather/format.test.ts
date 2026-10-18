import { describe, expect, it } from 'vitest'
import {
  daylight,
  formatHour,
  formatPressure,
  formatTemp,
  formatWeekday,
  formatWind,
  hpaToMmHg,
  kmhToMs,
  toF,
  uvLabel,
} from './format'

describe('конвертация единиц', () => {
  it('переводит °C в °F', () => {
    expect(toF(0)).toBe(32)
    expect(toF(100)).toBe(212)
    expect(toF(-40)).toBe(-40) // точка, где шкалы совпадают
  })

  it('переводит км/ч в м/с', () => {
    expect(kmhToMs(36)).toBeCloseTo(10)
    expect(kmhToMs(0)).toBe(0)
  })

  it('переводит гПа в мм рт. ст.', () => {
    expect(hpaToMmHg(1013.25)).toBeCloseTo(760, 0)
  })
})

describe('formatTemp', () => {
  it('округляет до целого и добавляет знак градуса', () => {
    expect(formatTemp(14.4)).toBe('14°')
    expect(formatTemp(14.5)).toBe('15°')
    expect(formatTemp(-3.6)).toBe('-4°')
  })

  it('не показывает «-0°»', () => {
    expect(formatTemp(0)).toBe('0°')
    expect(formatTemp(-0.4)).toBe('0°')
  })
})

describe('formatWind и formatPressure', () => {
  it('показывает ветер в м/с', () => {
    expect(formatWind(36)).toBe('10 м/с')
    expect(formatWind(0)).toBe('0 м/с')
    expect(formatWind(10)).toBe('3 м/с') // 2,78 округляется
  })

  it('показывает давление в мм рт. ст.', () => {
    expect(formatPressure(1013.25)).toBe('760 мм рт. ст.')
  })
})

describe('formatHour', () => {
  it('берёт час и минуты из строки местного времени', () => {
    expect(formatHour('2026-10-14T14:00')).toBe('14:00')
    expect(formatHour('2026-10-14T09:45')).toBe('09:45')
  })
})

describe('formatWeekday', () => {
  const days: [string, string][] = [
    ['2026-10-12', 'пн'],
    ['2026-10-13', 'вт'],
    ['2026-10-14', 'ср'],
    ['2026-10-15', 'чт'],
    ['2026-10-16', 'пт'],
    ['2026-10-17', 'сб'],
    ['2026-10-18', 'вс'],
  ]

  it.each(days)('%s это «%s»', (date, expected) => {
    expect(formatWeekday(date)).toBe(expected)
  })

  it('умеет полное название', () => {
    expect(formatWeekday('2026-10-13', 'long')).toBe('вторник')
  })
})

describe('daylight', () => {
  it('считает длину светового дня', () => {
    expect(daylight('2026-10-14T06:12', '2026-10-14T17:48')).toBe('11 ч 36 мин')
    expect(daylight('2026-12-21T08:30', '2026-12-21T15:45')).toBe('7 ч 15 мин')
  })

  it('работает с ровными часами и нулевым днём', () => {
    expect(daylight('2026-10-14T07:00', '2026-10-14T19:00')).toBe('12 ч 0 мин')
    expect(daylight('2026-12-21T12:00', '2026-12-21T12:00')).toBe('0 ч 0 мин')
  })
})

describe('uvLabel', () => {
  const cases: [number, string][] = [
    [0, 'Низкий'],
    [2.9, 'Низкий'],
    [3, 'Умеренный'],
    [5, 'Умеренный'],
    [6, 'Высокий'],
    [7, 'Высокий'],
    [8, 'Очень высокий'],
    [10, 'Очень высокий'],
    [11, 'Экстремальный'],
    [14, 'Экстремальный'],
  ]

  it.each(cases)('индекс %f это «%s»', (uv, expected) => {
    expect(uvLabel(uv)).toBe(expected)
  })
})