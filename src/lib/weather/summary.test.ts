import { describe, expect, it } from 'vitest'
import { makeForecast, NOW_INDEX, patchHours, week } from '@/test/forecastFactory'

import { buildSummary } from './summary'
import { Forecast } from '../forecast'

// Индекс в почасовых данных через k часов от «сейчас» (10:00)
const at = (k: number) => NOW_INDEX + k

function summaryOf(f: Forecast) {
  const s = buildSummary(f)
  if (!s) throw new Error('Сводка не построена')
  return s
}

// Советы без строки про завтрашний день
const tipsOf = (f: Forecast) => summaryOf(f).lines.filter((l) => !l.startsWith('Завтра'))

describe('buildSummary: общее', () => {
  it('на пустых данных возвращает null', () => {
    const f = makeForecast({
      hourly: { time: [], temperature_2m: [], precipitation_probability: [], weather_code: [] },
    })
    expect(buildSummary(f)).toBeNull()
  })

  it('в спокойную погоду остаётся заголовок и строка про завтра', () => {
    expect(summaryOf(makeForecast())).toEqual({
      headline: 'В ближайшие 12 часов без осадков',
      lines: ['Завтра температура примерно как сегодня'],
    })
  })

  it('строка про завтра идёт перед советами', () => {
    const f = patchHours(makeForecast(), at(2), at(2), { weather_code: 61 })
    expect(summaryOf(f).lines[0]).toMatch(/^Завтра/)
  })
})

describe('buildSummary: заголовок и осадки', () => {
  it('осадки начнутся позже, вероятность высокая', () => {
    const f = patchHours(makeForecast(), at(3), at(5), {
      weather_code: 61,
      precipitation_probability: 80,
    })
    expect(summaryOf(f).headline).toBe('Дождь начнётся около 13:00')
  })

  it('при низкой вероятности формулировка осторожнее', () => {
    const f = patchHours(makeForecast(), at(3), at(5), {
      weather_code: 61,
      precipitation_probability: 30,
    })
    expect(summaryOf(f).headline).toBe('Дождь, вероятно, начнётся около 13:00')
  })

  it('граница вероятности: 39% это «вероятно», 40% нет', () => {
    const low = patchHours(makeForecast(), at(3), at(3), {
      weather_code: 61,
      precipitation_probability: 39,
    })
    const high = patchHours(makeForecast(), at(3), at(3), {
      weather_code: 61,
      precipitation_probability: 40,
    })
    expect(summaryOf(low).headline).toContain('вероятно')
    expect(summaryOf(high).headline).not.toContain('вероятно')
  })

  it('берёт максимум вероятности среди часов с осадками', () => {
    const f = makeForecast()
    patchHours(f, at(3), at(3), { weather_code: 61, precipitation_probability: 30 })
    patchHours(f, at(4), at(4), { weather_code: 61, precipitation_probability: 60 })
    expect(summaryOf(f).headline).toBe('Дождь начнётся около 13:00')
  })

  it('вероятность считается только по часам с осадками', () => {
    const f = makeForecast()
    patchHours(f, at(3), at(3), { weather_code: 61, precipitation_probability: 20 })
    // сухой час с высокой вероятностью не должен «усиливать» прогноз
    patchHours(f, at(4), at(4), { weather_code: 3, precipitation_probability: 90 })
    expect(summaryOf(f).headline).toBe('Дождь, вероятно, начнётся около 13:00')
  })

  it('последний час окна учитывается, следующий за ним нет', () => {
    const inside = patchHours(makeForecast(), at(11), at(11), {
      weather_code: 61,
      precipitation_probability: 80,
    })
    const outside = patchHours(makeForecast(), at(12), at(14), {
      weather_code: 61,
      precipitation_probability: 80,
    })
    expect(summaryOf(inside).headline).toBe('Дождь начнётся около 21:00')
    expect(summaryOf(outside).headline).toBe('В ближайшие 12 часов без осадков')
  })

  it('осадки идут сейчас и скоро закончатся', () => {
    const f = makeForecast({ current: { weather_code: 63 } })
    patchHours(f, at(1), at(2), { weather_code: 63 })
    expect(summaryOf(f).headline).toBe('Дождь закончится около 13:00')
  })

  it('осадки идут сейчас и не заканчиваются в окне', () => {
    const f = makeForecast({ current: { weather_code: 63 } })
    patchHours(f, at(0), at(11), { weather_code: 61 })
    expect(summaryOf(f).headline).toBe('Дождь не прекратится в ближайшие 12 часов')
  })

  it('для текущего часа верит блоку current, а не почасовой записи', () => {
    // в current ясно, хотя в почасовых данных этот час с дождём
    const f = makeForecast({ current: { weather_code: 0 } })
    patchHours(f, at(0), at(0), { weather_code: 61 })
    expect(summaryOf(f).headline).toBe('В ближайшие 12 часов без осадков')
  })

  const precip: [number, string][] = [
    [51, 'Дождь'], // морось
    [55, 'Дождь'],
    [61, 'Дождь'],
    [65, 'Дождь'],
    [80, 'Дождь'], // ливень
    [82, 'Дождь'],
    [71, 'Снег'],
    [75, 'Снег'],
    [77, 'Снег'],
    [85, 'Снег'],
    [95, 'Гроза'],
    [99, 'Гроза'],
    [56, 'Ледяной дождь'],
    [67, 'Ледяной дождь'],
  ]

  it.each(precip)('код %i в заголовке это «%s»', (code, name) => {
    const f = patchHours(makeForecast(), at(3), at(3), {
      weather_code: code,
      precipitation_probability: 80,
    })
    expect(summaryOf(f).headline).toBe(`${name} начнётся около 13:00`)
  })

  it.each([0, 1, 2, 3, 45, 48])('код %i не считается осадками', (code) => {
    const f = patchHours(makeForecast(), at(3), at(5), { weather_code: code })
    expect(summaryOf(f).headline).toBe('В ближайшие 12 часов без осадков')
  })
})

describe('buildSummary: завтра и сегодня', () => {
  const maxes = (today: number, tomorrow: number) => ({
    temperature_2m_max: [today, tomorrow, 22, 22, 22, 22, 22],
  })

  const cases: [number, number, string][] = [
    [20, 26, 'Завтра на 6° теплее, чем сегодня'],
    [20, 14, 'Завтра на 6° холоднее, чем сегодня'],
    [20, 23, 'Завтра на 3° теплее, чем сегодня'], // граница: разница 3
    [20, 17, 'Завтра на 3° холоднее, чем сегодня'],
    [20, 22, 'Завтра температура примерно как сегодня'], // разница 2
    [20, 18, 'Завтра температура примерно как сегодня'],
    [20, 20, 'Завтра температура примерно как сегодня'],
    [20.4, 22.6, 'Завтра на 3° теплее, чем сегодня'], // сравниваются округлённые значения
  ]

  it.each(cases)('сегодня %f, завтра %f: «%s»', (today, tomorrow, expected) => {
    const f = makeForecast({ daily: maxes(today, tomorrow) })
    expect(summaryOf(f).lines[0]).toBe(expected)
  })

  it('если в прогнозе только один день, строки про завтра нет', () => {
    const f = makeForecast({ daily: { temperature_2m_max: [20] } })
    expect(summaryOf(f).lines.some((l) => l.startsWith('Завтра'))).toBe(false)
  })
})

describe('buildSummary: советы', () => {
  it('в комфортную погоду советов нет', () => {
    expect(tipsOf(makeForecast())).toEqual([])
  })

  describe('осадки', () => {
    const tips: [number, string][] = [
      [61, 'Возьмите зонт.'],
      [73, 'Пригодится тёплая обувь.'],
      [95, 'Во время грозы лучше остаться в помещении.'],
      [66, 'Ледяной дождь: на дорогах и тротуарах скользко.'],
    ]

    it.each(tips)('код %i: «%s»', (code, tip) => {
      const f = patchHours(makeForecast(), at(2), at(2), { weather_code: code })
      expect(tipsOf(f)).toEqual([tip])
    })

    it('при нескольких видах осадков берётся самый серьёзный', () => {
      const rainSnow = makeForecast()
      patchHours(rainSnow, at(2), at(2), { weather_code: 61 })
      patchHours(rainSnow, at(3), at(3), { weather_code: 73 })
      expect(tipsOf(rainSnow)).toEqual(['Пригодится тёплая обувь.'])

      const rainStorm = makeForecast()
      patchHours(rainStorm, at(2), at(2), { weather_code: 61 })
      patchHours(rainStorm, at(3), at(3), { weather_code: 95 })
      expect(tipsOf(rainStorm)).toEqual(['Во время грозы лучше остаться в помещении.'])

      const stormFreezing = makeForecast()
      patchHours(stormFreezing, at(2), at(2), { weather_code: 95 })
      patchHours(stormFreezing, at(3), at(3), { weather_code: 66 })
      expect(tipsOf(stormFreezing)).toEqual(['Ледяной дождь: на дорогах и тротуарах скользко.'])
    })

    it('осадки за пределами окна в 12 часов совета не дают', () => {
      const f = patchHours(makeForecast(), at(12), at(14), { weather_code: 61 })
      expect(tipsOf(f)).toEqual([])
    })
  })

  describe('ветер', () => {
    it('до 35 км/ч совета нет, с 35 есть', () => {
      expect(tipsOf(makeForecast({ current: { wind_speed_10m: 34 } }))).toEqual([])
      expect(tipsOf(makeForecast({ current: { wind_speed_10m: 35 } }))).toEqual([
        'Ветрено: пригодится ветровка.',
      ])
    })
  })

  describe('УФ-индекс', () => {
    const uvTip = 'Высокий УФ-индекс: не забудьте крем и очки.'

    it('совет появляется с индекса 6 (после округления)', () => {
      expect(tipsOf(makeForecast({ daily: { uv_index_max: week(5.4) } }))).toEqual([])
      expect(tipsOf(makeForecast({ daily: { uv_index_max: week(5.5) } }))).toEqual([uvTip])
      expect(tipsOf(makeForecast({ daily: { uv_index_max: week(9) } }))).toEqual([uvTip])
    })

    it('ночью совета нет, даже если индекс дня высокий', () => {
      const f = makeForecast({ current: { is_day: 0 }, daily: { uv_index_max: week(9) } })
      expect(tipsOf(f)).toEqual([])
    })
  })

  describe('одежда по ощущаемой температуре', () => {
    const cases: [number, string | null][] = [
      [35, 'Жарко: пейте больше воды.'],
      [30, 'Жарко: пейте больше воды.'],
      [29.9, null],
      [19, null],
      [18, 'Свежо: подойдёт лёгкая куртка или свитер.'],
      [11, 'Свежо: подойдёт лёгкая куртка или свитер.'],
      [10, 'Прохладно: пригодится куртка.'],
      [1, 'Прохладно: пригодится куртка.'],
      [0, 'Холодно: нужна тёплая куртка.'],
      [-14, 'Холодно: нужна тёплая куртка.'],
      [-15, 'Сильный мороз: шапка, перчатки и тёплая куртка.'],
      [-30, 'Сильный мороз: шапка, перчатки и тёплая куртка.'],
    ]

    it.each(cases)('ощущается %f: %s', (feels, tip) => {
      const f = makeForecast({ current: { apparent_temperature: feels } })
      expect(tipsOf(f)).toEqual(tip ? [tip] : [])
    })
  })

  describe('приоритет и лимит', () => {
    it('показывает не больше двух советов, осадки в приоритете', () => {
      const f = patchHours(
        makeForecast({ current: { wind_speed_10m: 50, apparent_temperature: -20 } }),
        at(2),
        at(2),
        { weather_code: 61 },
      )
      expect(tipsOf(f)).toEqual(['Возьмите зонт.', 'Ветрено: пригодится ветровка.'])
    })

    it('без осадков порядок такой: ветер, УФ, одежда', () => {
      const f = makeForecast({
        current: { wind_speed_10m: 50, apparent_temperature: 0 },
        daily: { uv_index_max: week(8) },
      })
      expect(tipsOf(f)).toEqual([
        'Ветрено: пригодится ветровка.',
        'Высокий УФ-индекс: не забудьте крем и очки.',
      ])
    })
  })
})