import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeForecast } from '@/test/forecastFactory'
import { calledInit, calledUrl, jsonResponse, mockFetch } from '@/test/fetchHelpers'
import { ApiError } from './fetchJson'
import { fetchForecast } from './forecast'

let fetchMock: ReturnType<typeof mockFetch>

beforeEach(() => {
  fetchMock = mockFetch()
  fetchMock.mockImplementation(async () => jsonResponse(makeForecast()))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const list = (param: string | null) => (param ?? '').split(',')

describe('fetchForecast: адрес и параметры', () => {
  it('обращается к прогнозу Open-Meteo', async () => {
    await fetchForecast(52.23, 21.01)

    const url = calledUrl(fetchMock)
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast')
  })

  it('передаёт координаты и просит местное время города', async () => {
    await fetchForecast(52.23, 21.01)

    const { searchParams } = calledUrl(fetchMock)
    expect(searchParams.get('latitude')).toBe('52.23')
    expect(searchParams.get('longitude')).toBe('21.01')
    expect(searchParams.get('timezone')).toBe('auto')
  })

  it('отрицательные координаты не теряют знак', async () => {
    await fetchForecast(-33.87, -70.65)

    const { searchParams } = calledUrl(fetchMock)
    expect(searchParams.get('latitude')).toBe('-33.87')
    expect(searchParams.get('longitude')).toBe('-70.65')
  })

  it('по умолчанию запрашивает 7 дней, число дней можно изменить', async () => {
    await fetchForecast(52.23, 21.01)
    await fetchForecast(52.23, 21.01, 14)

    expect(calledUrl(fetchMock, 0).searchParams.get('forecast_days')).toBe('7')
    expect(calledUrl(fetchMock, 1).searchParams.get('forecast_days')).toBe('14')
  })

  it('запрашивает все поля, которые показываются на экране', async () => {
    await fetchForecast(52.23, 21.01)

    const { searchParams } = calledUrl(fetchMock)
    expect(list(searchParams.get('current'))).toEqual(
      expect.arrayContaining([
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'is_day',
        'weather_code',
        'pressure_msl',
        'wind_speed_10m',
      ]),
    )
    expect(list(searchParams.get('hourly'))).toEqual(
      expect.arrayContaining(['temperature_2m', 'precipitation_probability', 'weather_code']),
    )
    expect(list(searchParams.get('daily'))).toEqual(
      expect.arrayContaining([
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_probability_max',
      ]),
    )
  })

  it('не просит единицы измерения: кэш всегда метрический', async () => {
    await fetchForecast(52.23, 21.01)

    const { searchParams } = calledUrl(fetchMock)
    expect(searchParams.has('temperature_unit')).toBe(false)
    expect(searchParams.has('wind_speed_unit')).toBe(false)
    expect(searchParams.has('windspeed_unit')).toBe(false)
  })
})

describe('fetchForecast: параметры fetch', () => {
  it('кэширует ответ на сервере на 10 минут', async () => {
    await fetchForecast(52.23, 21.01)
    expect(calledInit(fetchMock)).toMatchObject({ next: { revalidate: 600 } })
  })

  it('передаёт signal для отмены запроса', async () => {
    const controller = new AbortController()
    await fetchForecast(52.23, 21.01, 7, controller.signal)
    expect(calledInit(fetchMock)?.signal).toBe(controller.signal)
  })
})

describe('fetchForecast: ответ и ошибки', () => {
  it('возвращает данные без изменений', async () => {
    const forecast = makeForecast({ current: { temperature_2m: -7.5 } })
    fetchMock.mockResolvedValueOnce(jsonResponse(forecast))

    await expect(fetchForecast(52.23, 21.01)).resolves.toEqual(forecast)
  })

  it('причина ошибки от API попадает в сообщение', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: true, reason: 'Latitude must be in range of -90 to 90°. Given: 999.0.' }, 400),
    )

    await expect(fetchForecast(999, 21.01)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Latitude must be in range of -90 to 90°. Given: 999.0.',
      status: 400,
    })
  })

  it('сетевой сбой приходит как ApiError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(fetchForecast(52.23, 21.01)).rejects.toBeInstanceOf(ApiError)
  })
})