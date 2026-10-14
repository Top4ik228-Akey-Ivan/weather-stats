import type { CityRef } from '@/lib/city'

const KEY = 'weather:favorites'

// Одна и та же константа для сервера и для пустого хранилища:
// useSyncExternalStore требует, чтобы снимок был одной и той же ссылкой, пока данные не менялись
export const EMPTY: CityRef[] = []

// В localStorage может лежать что угодно (старый формат, ручная правка), поэтому проверяем форму
function isValidCity(x: unknown): x is CityRef {
  if (typeof x !== 'object' || x === null) return false
  const c = x as Record<string, unknown>
  return (
    typeof c.id === 'number' &&
    typeof c.name === 'string' &&
    typeof c.latitude === 'number' &&
    typeof c.longitude === 'number'
  )
}

// Кэш: пока строка в хранилище не изменилась, возвращаем ту же ссылку на массив
let cachedRaw: string | null = null
let cachedList: CityRef[] = EMPTY

export function readFavorites(): CityRef[] {
  let raw: string | null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return EMPTY // хранилище недоступно (приватный режим, запрет cookies)
  }
  if (raw === cachedRaw) return cachedList

  cachedRaw = raw
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : []
    cachedList = Array.isArray(parsed) ? parsed.filter(isValidCity) : EMPTY
  } catch {
    cachedList = EMPTY
  }
  return cachedList
}

const listeners = new Set<() => void>()

export function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('storage', callback) // изменения из других вкладок
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

function write(list: CityRef[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // квота или запрет: тихо игнорируем, избранное просто не сохранится
  }
  listeners.forEach((l) => l()) // уведомляем компоненты в этой вкладке
}

export function toggleFavorite(city: CityRef) {
  const list = readFavorites()
  write(list.some((c) => c.id === city.id) ? list.filter((c) => c.id !== city.id) : [...list, city])
}

export function removeFavorite(id: number) {
  write(readFavorites().filter((c) => c.id !== id))
}