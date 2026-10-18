import { Cloud, CloudMoon, Moon, Sun, Thermometer } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { getWeather } from './codes'

// Все коды WMO, которые отдаёт Open-Meteo
const KNOWN = [
  0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67,
  71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99,
]

describe('getWeather: коды', () => {
  it.each(KNOWN)('код %i описан', (code) => {
    const { label, icon } = getWeather(code)
    expect(label).not.toBe('Нет данных')
    expect(icon).toBeDefined()
  })

  const labels: [number, string][] = [
    [0, 'Ясно'],
    [3, 'Пасмурно'],
    [45, 'Туман'],
    [63, 'Дождь'],
    [73, 'Снег'],
    [95, 'Гроза'],
  ]

  it.each(labels)('код %i это «%s»', (code, label) => {
    expect(getWeather(code).label).toBe(label)
  })

  it.each([4, 10, 44, 100, -1])('неизвестный код %i не ломает приложение', (code) => {
    const { label, icon } = getWeather(code)
    expect(label).toBe('Нет данных')
    expect(icon).toBe(Thermometer)
  })
})

describe('getWeather: день и ночь', () => {
  it('по умолчанию считает, что сейчас день', () => {
    expect(getWeather(0).icon).toBe(Sun)
  })

  it('ночью у ясной погоды другая иконка', () => {
    expect(getWeather(0, true).icon).toBe(Sun)
    expect(getWeather(0, false).icon).toBe(Moon)
  })

  it('ночью у переменной облачности иконка с луной', () => {
    expect(getWeather(1, false).icon).toBe(CloudMoon)
  })

  it('у кодов без ночной иконки она не меняется', () => {
    expect(getWeather(3, true).icon).toBe(Cloud)
    expect(getWeather(3, false).icon).toBe(Cloud)
  })
})