// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CityRef } from '@/lib/city'

const KEY = 'weather:favorites' // тот же ключ, что в favorites.ts

const city = (id: number, name = `Город ${id}`): CityRef => ({
  id,
  name,
  latitude: 50 + id,
  longitude: 20 + id,
  admin1: 'Регион',
  country: 'Страна',
})

const stored = () => JSON.parse(localStorage.getItem(KEY) ?? 'null')

let fav: typeof import('./favorites')

beforeEach(async () => {
  vi.resetModules()
  localStorage.clear()
  fav = await import('./favorites')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('readFavorites', () => {
  it('пустое хранилище даёт EMPTY', () => {
    expect(fav.readFavorites()).toBe(fav.EMPTY)
  })

  it('читает сохранённый список', () => {
    localStorage.setItem(KEY, JSON.stringify([city(1), city(2)]))
    expect(fav.readFavorites()).toEqual([city(1), city(2)])
  })

  it.each(['not json', '{', 'undefined'])('битый JSON «%s» не ломает чтение', (raw) => {
    localStorage.setItem(KEY, raw)
    expect(fav.readFavorites()).toEqual([])
  })

  it.each(['{}', '"текст"', '42', 'null'])('не массив «%s» даёт пустой список', (raw) => {
    localStorage.setItem(KEY, raw)
    expect(fav.readFavorites()).toEqual([])
  })

  it('отфильтровывает записи неверной формы', () => {
    const garbage = [
      city(1),
      null,
      5,
      'строка',
      [],
      { id: '2', name: 'id строкой', latitude: 1, longitude: 1 },
      { id: 3, name: 'нет широты', longitude: 1 },
      { id: 4, name: 'нет долготы', latitude: 1 },
      { id: 5, latitude: 1, longitude: 1 }, // нет названия
      city(6),
    ]
    localStorage.setItem(KEY, JSON.stringify(garbage))
    expect(fav.readFavorites()).toEqual([city(1), city(6)])
  })

  it('необязательные поля не нужны, лишние сохраняются', () => {
    const minimal = { id: 1, name: 'Минимум', latitude: 1, longitude: 2 }
    const extra = { ...city(2), лишнее: true }
    localStorage.setItem(KEY, JSON.stringify([minimal, extra]))
    expect(fav.readFavorites()).toEqual([minimal, extra])
  })

  it('пока хранилище не менялось, возвращает ту же ссылку', () => {
    // иначе useSyncExternalStore зациклится на бесконечных перерисовках
    localStorage.setItem(KEY, JSON.stringify([city(1)]))
    expect(fav.readFavorites()).toBe(fav.readFavorites())
  })

  it('после изменения хранилища возвращает новую ссылку', () => {
    localStorage.setItem(KEY, JSON.stringify([city(1)]))
    const before = fav.readFavorites()

    localStorage.setItem(KEY, JSON.stringify([city(1), city(2)]))
    const after = fav.readFavorites()

    expect(after).not.toBe(before)
    expect(after).toEqual([city(1), city(2)])
  })

  it('если чтение из хранилища запрещено, даёт EMPTY', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    expect(fav.readFavorites()).toBe(fav.EMPTY)
  })

  it('если localStorage вообще нет (сервер), даёт EMPTY', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(fav.readFavorites()).toBe(fav.EMPTY)
  })
})

describe('toggleFavorite', () => {
  it('добавляет город и сохраняет его в хранилище', () => {
    fav.toggleFavorite(city(1))
    expect(fav.readFavorites()).toEqual([city(1)])
    expect(stored()).toEqual([city(1)])
  })

  it('новые города добавляются в конец', () => {
    fav.toggleFavorite(city(1))
    fav.toggleFavorite(city(2))
    fav.toggleFavorite(city(3))
    expect(fav.readFavorites().map((c) => c.id)).toEqual([1, 2, 3])
  })

  it('повторный вызов убирает город', () => {
    fav.toggleFavorite(city(1))
    fav.toggleFavorite(city(1))
    expect(fav.readFavorites()).toEqual([])
    expect(stored()).toEqual([])
  })

  it('убирает только нужный город, порядок остальных сохраняется', () => {
    ;[1, 2, 3].forEach((id) => fav.toggleFavorite(city(id)))
    fav.toggleFavorite(city(2))
    expect(fav.readFavorites().map((c) => c.id)).toEqual([1, 3])
  })

  it('города сравниваются по id, а не по содержимому', () => {
    fav.toggleFavorite(city(1, 'Старое название'))
    fav.toggleFavorite(city(1, 'Другое название'))
    expect(fav.readFavorites()).toEqual([])
  })

  it('город можно добавить снова после удаления', () => {
    fav.toggleFavorite(city(1))
    fav.toggleFavorite(city(1))
    fav.toggleFavorite(city(1))
    expect(fav.readFavorites()).toEqual([city(1)])
  })

  it('продолжает с того, что уже лежит в хранилище', () => {
    localStorage.setItem(KEY, JSON.stringify([city(1)]))
    fav.toggleFavorite(city(2))
    expect(fav.readFavorites().map((c) => c.id)).toEqual([1, 2])
  })

  it('если запись в хранилище запрещена, не бросает исключение', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    expect(() => fav.toggleFavorite(city(1))).not.toThrow()
    expect(fav.readFavorites()).toBe(fav.EMPTY) // город просто не сохранился
  })
})

describe('removeFavorite', () => {
  it('убирает город по id', () => {
    ;[1, 2, 3].forEach((id) => fav.toggleFavorite(city(id)))
    fav.removeFavorite(2)
    expect(fav.readFavorites().map((c) => c.id)).toEqual([1, 3])
  })

  it('неизвестный id ничего не меняет', () => {
    fav.toggleFavorite(city(1))
    fav.removeFavorite(999)
    expect(fav.readFavorites()).toEqual([city(1)])
  })

  it('после удаления последнего города в хранилище лежит пустой список', () => {
    fav.toggleFavorite(city(1))
    fav.removeFavorite(1)
    expect(fav.readFavorites()).toEqual([])
    expect(stored()).toEqual([])
  })
})

describe('subscribe', () => {
  it('подписчика уведомляют после добавления и после удаления', () => {
    const callback = vi.fn()
    const unsubscribe = fav.subscribe(callback)

    fav.toggleFavorite(city(1))
    expect(callback).toHaveBeenCalledTimes(1)

    fav.removeFavorite(1)
    expect(callback).toHaveBeenCalledTimes(2)

    unsubscribe()
  })

  it('все подписчики получают уведомление', () => {
    const a = vi.fn()
    const b = vi.fn()
    const unsubA = fav.subscribe(a)
    const unsubB = fav.subscribe(b)

    fav.toggleFavorite(city(1))
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)

    unsubA()
    unsubB()
  })

  it('после отписки уведомлений нет', () => {
    const callback = vi.fn()
    fav.subscribe(callback)()

    fav.toggleFavorite(city(1))
    window.dispatchEvent(new Event('storage'))
    expect(callback).not.toHaveBeenCalled()
  })

  it('событие storage (изменения из другой вкладки) тоже уведомляет', () => {
    const callback = vi.fn()
    const unsubscribe = fav.subscribe(callback)

    localStorage.setItem(KEY, JSON.stringify([city(7)])) // «другая вкладка» записала данные
    window.dispatchEvent(new Event('storage'))

    expect(callback).toHaveBeenCalledTimes(1)
    expect(fav.readFavorites()).toEqual([city(7)])
    unsubscribe()
  })

  it('подписчик уведомляется, даже если запись не удалась', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    const callback = vi.fn()
    const unsubscribe = fav.subscribe(callback)

    fav.toggleFavorite(city(1))
    expect(callback).toHaveBeenCalledTimes(1)
    unsubscribe()
  })
})