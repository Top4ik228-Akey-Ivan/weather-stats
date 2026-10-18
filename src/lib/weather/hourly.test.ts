import { describe, expect, it } from 'vitest'
import { makeForecast, NOW_INDEX } from '@/test/forecastFactory'
import { getNextHours } from './hourly'

describe('getNextHours: окно часов', () => {
  it('по умолчанию отдаёт 24 часа, начиная с текущего', () => {
    const hours = getNextHours(makeForecast())
    expect(hours).toHaveLength(24)
    expect(hours[0].time).toBe('2026-10-14T10:00')
    expect(hours[23].time).toBe('2026-10-15T09:00')
  })

  it('учитывает параметр count', () => {
    expect(getNextHours(makeForecast(), 12)).toHaveLength(12)
    expect(getNextHours(makeForecast(), 1)).toHaveLength(1)
  })

  it('минуты в current.time не сдвигают старт', () => {
    for (const time of ['2026-10-14T10:00', '2026-10-14T10:15', '2026-10-14T10:59']) {
      const hours = getNextHours(makeForecast({ current: { time } }))
      expect(hours[0].time).toBe('2026-10-14T10:00')
    }
  })

  it('переходит через полночь', () => {
    const hours = getNextHours(makeForecast({ current: { time: '2026-10-14T22:30' } }), 4)
    expect(hours.map((h) => h.time)).toEqual([
      '2026-10-14T22:00',
      '2026-10-14T23:00',
      '2026-10-15T00:00',
      '2026-10-15T01:00',
    ])
  })

  it('если данные кончаются, отдаёт сколько есть', () => {
    // последние данные: 2026-10-20T23:00
    const hours = getNextHours(makeForecast({ current: { time: '2026-10-20T20:00' } }))
    expect(hours).toHaveLength(4)
    expect(hours[3].time).toBe('2026-10-20T23:00')
  })

  it('если текущее время раньше данных, начинает с первой записи', () => {
    const hours = getNextHours(makeForecast({ current: { time: '2026-10-13T12:00' } }))
    expect(hours[0].time).toBe('2026-10-14T00:00')
  })

  it('на пустых данных возвращает пустой список', () => {
    const f = makeForecast({
      hourly: { time: [], temperature_2m: [], precipitation_probability: [], weather_code: [] },
    })
    expect(getNextHours(f)).toEqual([])
  })
})

describe('getNextHours: значения часа', () => {
  it('переносит температуру, код, вероятность осадков и время', () => {
    const f = makeForecast()
    f.hourly.temperature_2m[NOW_INDEX] = 17.5
    f.hourly.weather_code[NOW_INDEX] = 61
    f.hourly.precipitation_probability[NOW_INDEX] = 70

    expect(getNextHours(f)[0]).toMatchObject({
      time: '2026-10-14T10:00',
      temp: 17.5,
      code: 61,
      rain: 70,
      isDay: true,
    })
  })

  it('каждый следующий час берёт свои значения', () => {
    const f = makeForecast()
    f.hourly.temperature_2m[NOW_INDEX + 1] = 5
    f.hourly.temperature_2m[NOW_INDEX + 2] = -3

    const hours = getNextHours(f, 3)
    expect(hours.map((h) => h.temp)).toEqual([20, 5, -3])
  })
})

describe('getNextHours: день и ночь', () => {
  const byHour = (hours: ReturnType<typeof getNextHours>) =>
    Object.fromEntries(hours.map((h) => [h.time.slice(11, 13), h.isDay]))

  it('до рассвета ночь, между рассветом и закатом день, после заката ночь', () => {
    // рассвет 06:30, закат 17:30
    const f = makeForecast({ current: { time: '2026-10-14T05:00' } })
    const result = byHour(getNextHours(f, 14)) // 05:00 ... 18:00

    expect(result['05']).toBe(false)
    expect(result['06']).toBe(false) // 06:00 раньше рассвета в 06:30
    expect(result['07']).toBe(true)
    expect(result['17']).toBe(true) // 17:00 раньше заката в 17:30
    expect(result['18']).toBe(false)
  })

  it('час, равный рассвету, это день, а равный закату это ночь', () => {
    const f = makeForecast({
      current: { time: '2026-10-14T05:00' },
      daily: {
        time: ['2026-10-14'],
        sunrise: ['2026-10-14T06:00'],
        sunset: ['2026-10-14T17:00'],
      },
    })
    const result = byHour(getNextHours(f, 14))

    expect(result['05']).toBe(false)
    expect(result['06']).toBe(true)
    expect(result['16']).toBe(true)
    expect(result['17']).toBe(false)
  })

  it('ночью после полуночи у следующего дня своё расписание', () => {
    const f = makeForecast({ current: { time: '2026-10-14T23:00' } })
    expect(getNextHours(f, 3).map((h) => h.isDay)).toEqual([false, false, false])
  })

  it('если дня нет в daily, считает, что сейчас день', () => {
    const f = makeForecast({
      current: { time: '2026-10-14T23:00' },
      daily: {
        time: ['2026-10-14'],
        sunrise: ['2026-10-14T06:30'],
        sunset: ['2026-10-14T17:30'],
      },
    })
    // 23:00 первого дня это ночь, а 15 октября в daily нет
    expect(getNextHours(f, 3).map((h) => h.isDay)).toEqual([false, true, true])
  })
})