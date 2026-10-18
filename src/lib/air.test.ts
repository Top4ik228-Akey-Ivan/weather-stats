import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calledInit, calledUrl, jsonResponse, mockFetch } from '@/test/fetchHelpers'
import { ApiError } from './fetchJson'
import { fetchAir } from './air'

const air = { current: { european_aqi: 32, pm10: 18.4, pm2_5: 9.1 } }

let fetchMock: ReturnType<typeof mockFetch>

beforeEach(() => {
  fetchMock = mockFetch()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchAir', () => {
  it('обращается к API качества воздуха с нужными параметрами', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(air))

    await fetchAir(52.23, 21.01)

    const url = calledUrl(fetchMock)
    expect(url.origin + url.pathname).toBe('https://air-quality-api.open-meteo.com/v1/air-quality')
    expect(url.searchParams.get('latitude')).toBe('52.23')
    expect(url.searchParams.get('longitude')).toBe('21.01')
    expect(url.searchParams.get('current')).toBe('european_aqi,pm10,pm2_5')
  })

  it('возвращает данные без изменений', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(air))
    await expect(fetchAir(52.23, 21.01)).resolves.toEqual(air)
  })

  it('передаёт signal для отмены запроса', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(air))
    const controller = new AbortController()

    await fetchAir(52.23, 21.01, controller.signal)

    expect(calledInit(fetchMock)?.signal).toBe(controller.signal)
  })

  it('ошибка HTTP приходит как ApiError', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ reason: 'Service unavailable' }, 503))
    await expect(fetchAir(52.23, 21.01)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Service unavailable',
      status: 503,
    })
  })

  it('сетевой сбой приходит как ApiError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(fetchAir(52.23, 21.01)).rejects.toBeInstanceOf(ApiError)
  })
})