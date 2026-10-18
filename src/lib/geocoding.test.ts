import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calledInit, calledUrl, jsonResponse, mockFetch } from '@/test/fetchHelpers'
import { ApiError } from './fetchJson'
import { fetchGeocode } from './geocoding'

const warsaw = {
  id: 756135,
  name: 'Варшава',
  latitude: 52.23,
  longitude: 21.01,
  admin1: 'Мазовецкое воеводство',
  country: 'Польша',
}

let fetchMock: ReturnType<typeof mockFetch>

beforeEach(() => {
  fetchMock = mockFetch()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchGeocode: запрос', () => {
  it('обращается к геокодингу Open-Meteo с нужными параметрами', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ results: [] }))

    await fetchGeocode('Варшава')

    const url = calledUrl(fetchMock)
    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search')
    expect(url.searchParams.get('name')).toBe('Варшава')
    expect(url.searchParams.get('count')).toBe('8')
    expect(url.searchParams.get('language')).toBe('ru')
    expect(url.searchParams.get('format')).toBe('json')
  })

  it.each(['Санкт-Петербург', 'New York', 'Zürich', 'Ростов-на-Дону'])(
    'название «%s» передаётся без искажений',
    async (name) => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}))
      await fetchGeocode(name)
      expect(calledUrl(fetchMock).searchParams.get('name')).toBe(name)
    },
  )

  it('служебные символы не превращаются в лишние параметры', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}))

    await fetchGeocode('a&count=100&b=c')

    const url = calledUrl(fetchMock)
    expect(url.searchParams.get('name')).toBe('a&count=100&b=c')
    expect(url.searchParams.get('count')).toBe('8')
    expect(url.searchParams.has('b')).toBe(false)
  })

  it('передаёт signal для отмены запроса', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    const controller = new AbortController()

    await fetchGeocode('Варшава', controller.signal)

    expect(calledInit(fetchMock)?.signal).toBe(controller.signal)
  })
})

describe('fetchGeocode: ответ', () => {
  it('возвращает список найденных мест', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ results: [warsaw] }))
    await expect(fetchGeocode('Варшава')).resolves.toEqual([warsaw])
  })

  it('сохраняет порядок результатов', async () => {
    const results = [warsaw, { ...warsaw, id: 2, name: 'Варшава (США)' }]
    fetchMock.mockResolvedValueOnce(jsonResponse({ results }))
    const found = await fetchGeocode('Варшава')
    expect(found.map((c) => c.id)).toEqual([756135, 2])
  })

  it('если ничего не найдено, ключа results нет, и это пустой список, а не ошибка', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ generationtime_ms: 0.5 }))
    await expect(fetchGeocode('asdfghjkl')).resolves.toEqual([])
  })

  it('пустой results тоже даёт пустой список', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ results: [] }))
    await expect(fetchGeocode('asdfghjkl')).resolves.toEqual([])
  })
})

describe('fetchGeocode: ошибки', () => {
  it('ошибка HTTP приходит как ApiError', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: true, reason: 'Too many requests' }, 429))
    await expect(fetchGeocode('Варшава')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Too many requests',
      status: 429,
    })
  })

  it('сетевой сбой приходит как ApiError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(fetchGeocode('Варшава')).rejects.toBeInstanceOf(ApiError)
  })
})