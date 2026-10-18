import { vi } from 'vitest'

export function mockFetch() {
  const fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

type FetchMock = ReturnType<typeof mockFetch>

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

// Адрес, с которым вызвали fetch, как объект URL (удобно читать параметры)
export const calledUrl = (fetchMock: FetchMock, call = 0) =>
  new URL(String(fetchMock.mock.calls[call][0]))

// Второй аргумент fetch (signal, next и т. д.)
export const calledInit = (fetchMock: FetchMock, call = 0) => fetchMock.mock.calls[call][1]