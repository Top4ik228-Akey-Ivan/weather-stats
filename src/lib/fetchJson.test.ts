import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calledInit, jsonResponse, mockFetch } from '@/test/fetchHelpers'
import { ApiError, fetchJson } from './fetchJson'

const URL_ = 'https://example.test/data'

let fetchMock: ReturnType<typeof mockFetch>

beforeEach(() => {
  fetchMock = mockFetch()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ApiError', () => {
  it('это обычная ошибка с именем и кодом статуса', () => {
    const error = new ApiError('Не вышло', 404)
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Не вышло')
    expect(error.status).toBe(404)
  })

  it('статус необязателен', () => {
    expect(new ApiError('Нет сети').status).toBeUndefined()
  })
})

describe('fetchJson: успешный ответ', () => {
  it('возвращает разобранный JSON', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ a: 1, list: [1, 2] }))
    await expect(fetchJson(URL_)).resolves.toEqual({ a: 1, list: [1, 2] })
  })

  it('передаёт адрес и параметры в fetch', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    const init = { signal: new AbortController().signal }

    await fetchJson(URL_, init)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(URL_, init)
  })
})

describe('fetchJson: ошибки HTTP', () => {
  it('берёт причину из тела ответа API', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: true, reason: 'Latitude must be in range of -90 to 90°' }, 400),
    )
    await expect(fetchJson(URL_)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Latitude must be in range of -90 to 90°',
      status: 400,
    })
  })

  it('если причины в теле нет, пишет код статуса', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ something: 'else' }, 404))
    await expect(fetchJson(URL_)).rejects.toMatchObject({ message: 'Ошибка API: 404', status: 404 })
  })

  it('если тело не JSON, тоже пишет код статуса', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>Bad gateway</html>', { status: 502 }))
    await expect(fetchJson(URL_)).rejects.toMatchObject({ message: 'Ошибка API: 502', status: 502 })
  })

  it('если тело пустое, пишет код статуса', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))
    await expect(fetchJson(URL_)).rejects.toMatchObject({ message: 'Ошибка API: 500', status: 500 })
  })

  it('ошибка это экземпляр ApiError', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 429))
    await expect(fetchJson(URL_)).rejects.toBeInstanceOf(ApiError)
  })
})

describe('fetchJson: сетевые ошибки и отмена', () => {
  it('сетевой сбой превращается в понятную ApiError без статуса', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const error = await fetchJson(URL_).catch((e) => e) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Нет соединения с сервером погоды')
    expect(error.status).toBeUndefined()
  })

  it('отмена запроса пробрасывается как есть и не считается ошибкой соединения', async () => {
    const abort = new DOMException('Aborted', 'AbortError')
    fetchMock.mockRejectedValueOnce(abort)

    const error = await fetchJson(URL_).catch((e) => e)

    expect(error).toBe(abort)
    expect(error).not.toBeInstanceOf(ApiError)
  })

  it('настоящий AbortController отменяет запрос', async () => {
    const controller = new AbortController()
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )

    const promise = fetchJson(URL_, { signal: controller.signal })
    controller.abort()
    const error = await promise.catch((e) => e) as ApiError

    expect(error).toBeInstanceOf(DOMException)
    expect(error.name).toBe('AbortError')
    expect(calledInit(fetchMock)?.signal).toBe(controller.signal)
  })
})