export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch (e) {
    // отмену запроса (её делает TanStack Query) пробрасываем как есть
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError('Нет соединения с сервером погоды')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(body?.reason ?? `Ошибка API: ${res.status}`, res.status)
  }
  return res.json() as Promise<T>
}