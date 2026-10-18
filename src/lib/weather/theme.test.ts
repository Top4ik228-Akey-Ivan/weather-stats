import { describe, expect, it } from 'vitest'
import { DEFAULT_GRADIENT, getSkyGradient, getSkyKind, type SkyKind } from './theme'

describe('getSkyKind', () => {
  const cases: [number, SkyKind][] = [
    [0, 'clear'],
    [1, 'partly'],
    [2, 'partly'],
    [3, 'cloudy'],
    [45, 'fog'],
    [48, 'fog'],
    [51, 'rain'],
    [55, 'rain'],
    [56, 'rain'],
    [61, 'rain'],
    [65, 'rain'],
    [67, 'rain'],
    [71, 'snow'],
    [75, 'snow'],
    [77, 'snow'],
    [80, 'rain'],
    [82, 'rain'],
    [85, 'snow'],
    [86, 'snow'],
    [95, 'storm'],
    [96, 'storm'],
    [99, 'storm'],
  ]

  it.each(cases)('код %i это «%s»', (code, kind) => {
    expect(getSkyKind(code)).toBe(kind)
  })

  it('неизвестный код ниже 51 считается пасмурным', () => {
    expect(getSkyKind(4)).toBe('cloudy')
    expect(getSkyKind(10)).toBe('cloudy')
  })
})

describe('getSkyGradient', () => {
  const kinds: SkyKind[] = ['clear', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'storm']
  const codeOf: Record<SkyKind, number> = {
    clear: 0, partly: 1, cloudy: 3, fog: 45, rain: 63, snow: 73, storm: 95,
  }

  it('возвращает вертикальный градиент из двух цветов', () => {
    expect(getSkyGradient(0, true)).toMatch(
      /^linear-gradient\(180deg, #[0-9a-f]{6} 0%, #[0-9a-f]{6} 100%\)$/i,
    )
  })

  it.each(kinds)('у типа «%s» день и ночь выглядят по-разному', (kind) => {
    const code = codeOf[kind]
    expect(getSkyGradient(code, true)).not.toBe(getSkyGradient(code, false))
  })

  it('разные типы погоды дают разные фоны', () => {
    const unique = new Set(kinds.map((k) => getSkyGradient(codeOf[k], true)))
    expect(unique.size).toBe(kinds.length)
  })

  it('по умолчанию это день', () => {
    expect(getSkyGradient(0)).toBe(getSkyGradient(0, true))
  })

  it('неизвестный код не бросает исключение', () => {
    expect(() => getSkyGradient(4)).not.toThrow()
    expect(() => getSkyGradient(999)).not.toThrow()
  })

  it('DEFAULT_GRADIENT это ясный день', () => {
    expect(DEFAULT_GRADIENT).toBe(getSkyGradient(0, true))
  })
})